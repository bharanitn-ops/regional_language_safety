import os
import time
import httpx
from typing import Dict, Any, Optional
from app.services.model_adapter.base import AbstractBaseModelAdapter

class HostedOpenWeightAdapter(AbstractBaseModelAdapter):
    """
    Adapter for hosted open-weight language models.
    Supports Hugging Face Inference API, Ollama, vLLM, and OpenAI-compatible endpoints.
    """

    def __init__(
        self,
        model_id: str,
        model_name: Optional[str] = None,
        version: str = "1.0",
        provider: str = "Hosted-OpenWeight",
        config: Optional[Dict[str, Any]] = None
    ):
        super().__init__(model_id, model_name, version, provider, config)
        self.endpoint_url = self.config.get("endpoint_url") or os.getenv("INFERENCE_ENDPOINT_URL")
        self.api_key_env = self.config.get("api_key_env") or "HF_TOKEN"
        self._api_key = os.getenv(self.api_key_env) or os.getenv("OPENWEIGHT_API_KEY")

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"
        return headers

    async def check_availability(self) -> Dict[str, Any]:
        """
        Actively test connectivity to the inference endpoint.
        Never falsely reports a model as available.
        """
        start_time = time.perf_counter()
        
        # If no endpoint configured and no API key available
        if not self.endpoint_url and not self._api_key:
            return {
                "available": False,
                "status": "CONFIGURED_UNTESTED",
                "latency_ms": 0.0,
                "details": f"No endpoint URL or {self.api_key_env} configured in environment.",
                "troubleshooting_info": (
                    f"To enable live inference for {self.model_id}:\n"
                    f"1. Set '{self.api_key_env}' in your backend .env file.\n"
                    f"2. Or configure a local vLLM/Ollama endpoint URL (e.g., http://localhost:11434)."
                )
            }

        target_url = self.endpoint_url or f"https://api-inference.huggingface.co/models/{self.model_id}"
        
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(target_url, headers=self._get_headers())
                latency = (time.perf_counter() - start_time) * 1000
                
                if res.status_code in [200, 204]:
                    return {
                        "available": True,
                        "status": "AVAILABLE",
                        "latency_ms": round(latency, 2),
                        "details": f"Endpoint responded with HTTP {res.status_code}.",
                        "troubleshooting_info": None
                    }
                elif res.status_code in [401, 403]:
                    return {
                        "available": False,
                        "status": "OFFLINE",
                        "latency_ms": round(latency, 2),
                        "details": f"Authentication failed (HTTP {res.status_code}).",
                        "troubleshooting_info": f"Verify that {self.api_key_env} has read permissions for model '{self.model_id}'."
                    }
                elif res.status_code == 503:
                    return {
                        "available": False,
                        "status": "LOADING",
                        "latency_ms": round(latency, 2),
                        "details": "Model is currently loading on the inference host.",
                        "troubleshooting_info": "Wait 30-60 seconds for the cold model to load onto GPU workers."
                    }
                else:
                    return {
                        "available": False,
                        "status": "OFFLINE",
                        "latency_ms": round(latency, 2),
                        "details": f"Endpoint returned HTTP {res.status_code}: {res.text[:150]}",
                        "troubleshooting_info": f"Check inference host status at {target_url}."
                    }
        except httpx.ConnectError:
            latency = (time.perf_counter() - start_time) * 1000
            return {
                "available": False,
                "status": "OFFLINE",
                "latency_ms": round(latency, 2),
                "details": f"Failed to connect to host at {target_url}.",
                "troubleshooting_info": "Ensure local endpoint (Ollama/vLLM) is running or internet connectivity is active."
            }
        except Exception as e:
            latency = (time.perf_counter() - start_time) * 1000
            return {
                "available": False,
                "status": "OFFLINE",
                "latency_ms": round(latency, 2),
                "details": f"Connectivity error: {str(e)}",
                "troubleshooting_info": "Inspect network and proxy configuration."
            }

    async def _execute_generation(
        self,
        prompt: str,
        modality: str,
        temperature: float,
        max_tokens: int
    ) -> str:
        target_url = self.endpoint_url or f"https://api-inference.huggingface.co/models/{self.model_id}"
        
        # Check if Ollama format or OpenAI-compatible format
        if "11434" in target_url or "/api/generate" in target_url:
            payload = {
                "model": self.model_id,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(target_url, json=payload, headers=self._get_headers())
                res.raise_for_status()
                data = res.json()
                return data.get("response", "")
                
        elif "/v1/chat/completions" in target_url or "completions" in target_url:
            payload = {
                "model": self.model_id,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(target_url, json=payload, headers=self._get_headers())
                res.raise_for_status()
                data = res.json()
                choices = data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "")
                return ""
        else:
            # Standard Hugging Face text-generation payload
            payload = {
                "inputs": prompt,
                "parameters": {
                    "temperature": max(0.01, temperature),
                    "max_new_tokens": max_tokens,
                    "return_full_text": False
                }
            }
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(target_url, json=payload, headers=self._get_headers())
                res.raise_for_status()
                data = res.json()
                if isinstance(data, list) and len(data) > 0:
                    return data[0].get("generated_text", "")
                elif isinstance(data, dict):
                    return data.get("generated_text", str(data))
                return str(data)
