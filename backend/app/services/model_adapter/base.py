import time
import asyncio
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class ModelInferenceError(Exception):
    """Exception raised for unrecoverable errors during model inference."""
    pass

class AbstractBaseModelAdapter(ABC):
    """
    Common architecture interface for Language Models in BhashaShield AI.

    Every model adapter supports:
    - Model identification
    - Model version
    - Availability check
    - Input validation
    - Text generation
    - Generation configuration
    - Error handling
    - Timeout handling
    - Latency recording
    """

    def __init__(
        self,
        model_id: str,
        model_name: Optional[str] = None,
        version: str = "1.0",
        provider: str = "Hosted-OpenWeight",
        config: Optional[Dict[str, Any]] = None
    ):
        self.model_id = model_id
        self.model_name = model_name or model_id
        self.version = version
        self.provider = provider
        self.config = config or {}

    def validate_input(self, prompt: str) -> str:
        """Validate input prompt length, character sanity, and structure."""
        if prompt is None:
            raise ValueError("Prompt text cannot be None.")
        clean_prompt = prompt.strip()
        if not clean_prompt:
            raise ValueError("Prompt text cannot be empty.")
        if len(clean_prompt) > 8000:
            raise ValueError(f"Prompt exceeds maximum character limit of 8000 chars (received {len(clean_prompt)}).")
        return clean_prompt

    @abstractmethod
    async def check_availability(self) -> Dict[str, Any]:
        """
        Actively checks if the model is available and reachable.
        Never falsely reports a model as available.
        Returns:
            {
                "available": bool,
                "status": "AVAILABLE" | "OFFLINE" | "RESOURCE_CONSTRAINED" | "CONFIGURED_UNTESTED",
                "latency_ms": float,
                "details": str,
                "troubleshooting_info": Optional[str]
            }
        """
        pass

    @abstractmethod
    async def _execute_generation(
        self,
        prompt: str,
        modality: str,
        temperature: float,
        max_tokens: int
    ) -> str:
        """Internal generation implementation to be overridden by concrete adapters."""
        pass

    async def generate(
        self,
        prompt: str,
        modality: str = "ENGLISH",
        temperature: float = 0.7,
        max_tokens: int = 512,
        timeout_seconds: float = 30.0
    ) -> Dict[str, Any]:
        """
        Safe text generation with latency measurement, timeout handling, and input validation.
        """
        start_time = time.perf_counter()
        
        # 1. Input Validation
        clean_prompt = self.validate_input(prompt)
        
        # 2. Timeout and Error Guarded Generation
        try:
            raw_output = await asyncio.wait_for(
                self._execute_generation(
                    prompt=clean_prompt,
                    modality=modality,
                    temperature=temperature,
                    max_tokens=max_tokens
                ),
                timeout=timeout_seconds
            )
            is_error = False
            error_message = None
        except asyncio.TimeoutError:
            latency_ms = (time.perf_counter() - start_time) * 1000
            return {
                "raw_output": f"[MODEL ERROR: Generation timed out after {timeout_seconds}s on {self.model_id}]",
                "latency_ms": round(latency_ms, 2),
                "token_count": 0,
                "is_error": True,
                "error_message": f"Inference timeout after {timeout_seconds} seconds.",
                "metadata": {
                    "model_id": self.model_id,
                    "model_name": self.model_name,
                    "provider": self.provider,
                    "version": self.version,
                    "status": "TIMEOUT",
                }
            }
        except Exception as e:
            latency_ms = (time.perf_counter() - start_time) * 1000
            return {
                "raw_output": f"[MODEL ERROR: Inference failed on {self.model_id}: {str(e)}]",
                "latency_ms": round(latency_ms, 2),
                "token_count": 0,
                "is_error": True,
                "error_message": str(e),
                "metadata": {
                    "model_id": self.model_id,
                    "model_name": self.model_name,
                    "provider": self.provider,
                    "version": self.version,
                    "status": "ERROR",
                }
            }

        latency_ms = (time.perf_counter() - start_time) * 1000
        tokens_approx = len(raw_output.split())

        return {
            "raw_output": raw_output,
            "latency_ms": round(latency_ms, 2),
            "token_count": tokens_approx,
            "is_error": is_error,
            "error_message": error_message,
            "metadata": {
                "model_id": self.model_id,
                "model_name": self.model_name,
                "provider": self.provider,
                "version": self.version,
                "modality_received": modality,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
        }
