import os
from typing import Dict, Any, List, Optional
from app.services.model_adapter.base import AbstractBaseModelAdapter
from app.services.model_adapter.mock_adapter import MockResearchAdapter
from app.services.model_adapter.hosted_adapter import HostedOpenWeightAdapter
from app.services.model_adapter.local_adapter import LocalOpenWeightAdapter
from app.core.config import settings

# Pre-configured open-weight model descriptors for research benchmarks
DEFAULT_MODELS_METADATA = {
    "llama3-8b-instruct": {
        "name": "Llama 3 8B Instruct (Meta)",
        "identifier": "meta-llama/Meta-Llama-3-8B-Instruct",
        "provider": "Hosted-OpenWeight",
        "parameters": "8B",
        "context_window": "8192",
        "supported_languages": ["English", "Kannada Native (ಕನ್ನಡ)", "Romanized Kannada", "Kanglish"],
        "quantization": "none",
        "api_key_env": "HF_TOKEN"
    },
    "sarvam-2b-indic": {
        "name": "Sarvam 2B Indic (Indic Native)",
        "identifier": "sarvamai/sarvam-2b-v0.5",
        "provider": "Hosted-OpenWeight",
        "parameters": "2B",
        "context_window": "4096",
        "supported_languages": ["English", "Kannada Native (ಕನ್ನಡ)", "Romanized Kannada", "Kanglish"],
        "quantization": "none",
        "api_key_env": "HF_TOKEN"
    },
    "mistral-7b-instruct": {
        "name": "Mistral 7B Instruct v0.3",
        "identifier": "mistralai/Mistral-7B-Instruct-v0.3",
        "provider": "Hosted-OpenWeight",
        "parameters": "7B",
        "context_window": "32768",
        "supported_languages": ["English", "Romanized Kannada", "Kanglish"],
        "quantization": "none",
        "api_key_env": "HF_TOKEN"
    },
    "navarasa-2b-kannada": {
        "name": "Navarasa 2.0 (Kannada Gemma SFT)",
        "identifier": "Telugu-LLM-Labs/Indic-gemma-2b-finetuned-sft-Kannada",
        "provider": "Hosted-OpenWeight",
        "parameters": "2B",
        "context_window": "8192",
        "supported_languages": ["Kannada Native (ಕನ್ನಡ)", "English", "Kanglish"],
        "quantization": "none",
        "api_key_env": "HF_TOKEN"
    },
    "mock-research-adapter": {
        "name": "BhashaShield Research Baseline (Simulation)",
        "identifier": "bhashashield/research-baseline-v1",
        "provider": "Research-Simulation",
        "parameters": "Deterministic",
        "context_window": "4096",
        "supported_languages": ["English", "Kannada Native (ಕನ್ನಡ)", "Romanized Kannada", "Kanglish"],
        "quantization": "none"
    }
}

class ModelAdapterFactory:
    """
    Factory resolving and instantiating language model adapters.
    """

    @classmethod
    def create_adapter(
        cls,
        model_id: str = "mock-research-adapter",
        config: Optional[Dict[str, Any]] = None
    ) -> AbstractBaseModelAdapter:
        merged_config = dict(DEFAULT_MODELS_METADATA.get(model_id, {}))
        if config:
            merged_config.update(config)

        provider = merged_config.get("provider", "Hosted-OpenWeight")
        model_name = merged_config.get("name", model_id)

        # 1. Deterministic simulation adapter
        if model_id == "mock-research-adapter" or provider == "Research-Simulation":
            return MockResearchAdapter(
                model_id=model_id,
                model_name=model_name,
                config=merged_config
            )

        # 2. Local Transformers adapter
        if provider in ["Local-Transformers", "Local"]:
            return LocalOpenWeightAdapter(
                model_id=merged_config.get("identifier", model_id),
                model_name=model_name,
                config=merged_config
            )

        # 3. Hosted open-weight adapter (HuggingFace Inference API / Ollama / vLLM)
        hf_token = os.getenv("HF_TOKEN") or os.getenv("OPENWEIGHT_API_KEY")
        endpoint_url = merged_config.get("endpoint_url") or os.getenv("INFERENCE_ENDPOINT_URL")

        # In demo mode, if no live endpoint credentials configured, fallback gracefully to mock adapter
        # while explicitly noting demo simulation
        if settings.DEMO_MODE and not hf_token and not endpoint_url:
            return MockResearchAdapter(
                model_id=model_id,
                model_name=f"{model_name} [Demo Simulation Mode]",
                config=merged_config
            )

        return HostedOpenWeightAdapter(
            model_id=merged_config.get("identifier", model_id),
            model_name=model_name,
            provider=provider,
            config=merged_config
        )


def get_model_adapter(model_name: str = "mock-research-adapter", config: Optional[Dict[str, Any]] = None) -> AbstractBaseModelAdapter:
    """Helper retrieving an adapter instance by model name or ID."""
    return ModelAdapterFactory.create_adapter(model_name, config)

def list_available_adapters() -> List[str]:
    """List all registered adapter identifiers."""
    return list(DEFAULT_MODELS_METADATA.keys())
