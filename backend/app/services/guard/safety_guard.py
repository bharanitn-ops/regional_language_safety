import re
import time
import unicodedata
from typing import Dict, Any, List, Optional
from app.services.normalization.detector import LanguageModalityDetector
from app.services.evaluation.classifier import MultilingualSafetyClassifier
from app.schemas.guard import GuardConfigModel

# High-risk security and jailbreak intent keywords across English, Kannada native, Romanized, and Kanglish
HIGH_RISK_INTENT_KEYWORDS = [
    # Cyber, exploitation, shellcode
    "scan", "port", "ports", "vulnerab", "durbhalathe", "inject", "shellcode",
    "keylogger", "malware", "exploit", "attack", "bypass", "hack",
    "antivirus", "evasion", "trojan", "ransomware", "spyware",
    # Fraud, social engineering, credentials
    "password", "reset", "phishing", "fake", "vanchaka", "vanchane",
    "otp", "scam", "harvest", "credential", "deceptive",
    # Hate, harassment, harms
    "defamatory", "manahanikara", "halumadu", "destroy", "hate",
    "harass", "communal", "dvesha", "threat"
]

BENIGN_TOPIC_KEYWORDS = [
    "rajyotsava", "ರಾಜ್ಯೋತ್ಸವ", "bisi bele bath", "ಬಿಸಿ ಬೇಳೆ", "karnataka",
    "celebrat", "ingredients", "history", "culture", "samskruthi", "culinary",
    "tradition", "sahitya", "tourism", "recipe", "educational"
]

# Actionable exploit indicators in generated model output that must be intercepted by Output Verification
UNSAFE_OUTPUT_SIGNALS = [
    "import socket", "socket.socket", "connect((", "for port in", "nmap -",
    "reverse shell", "shellcode =", "\\x31\\xc0", "\\x48\\x31",
    "password reset link: http", "enter your net banking password",
    "vulnerability demo", "illi nodi, unpatched ports scan"
]

class BilingualSafetyGuard:
    """
    Bilingual Safety Guard (BSG) - Modular Safety Layer Architecture (Phase 7).

    PIPELINE:
    1. Language and Script Identification
    2. Input Normalization without losing original text
    3. Multilingual Safety Classification (CLEARLY_BENIGN, SAFETY_SENSITIVE, REQUIRING_REFUSAL, UNCERTAIN)
    4. Safety Policy Decision (ALLOW, BLOCK, REVIEW)
    5. Original Model Inference for Permitted Requests
    6. Output Safety Verification
    7. Final Response Assembly & Audit Trace

    RESEARCH NOTICE:
    This is an empirical safety mechanism under research evaluation.
    Does not claim complete multilingual safety or zero jailbreaks.
    """

    DEFAULT_CONFIG = GuardConfigModel()

    @classmethod
    def normalize_input(cls, text: str) -> Dict[str, Any]:
        """
        Stage 2: Normalize input text without losing the original user prompt.
        """
        raw_text = text or ""
        # Unicode normalization (NFKC)
        nfkc_text = unicodedata.normalize('NFKC', raw_text)
        # Collapse excessive whitespace
        cleaned_text = re.sub(r'\s+', ' ', nfkc_text).strip()
        
        return {
            "original_prompt": raw_text,
            "normalized_prompt": cleaned_text,
            "character_count": len(cleaned_text),
            "word_count": len(cleaned_text.split()) if cleaned_text else 0
        }

    @classmethod
    def classify_input_safety(
        cls,
        normalized_prompt: str,
        modality: str,
        config: GuardConfigModel
    ) -> Dict[str, Any]:
        """
        Stage 3: Input Multilingual Safety Classification.
        Distinguishes: CLEARLY_BENIGN, SAFETY_SENSITIVE, REQUIRING_REFUSAL, UNCERTAIN.
        Uses a consistent safety policy across languages.
        """
        prompt_lower = normalized_prompt.lower()
        
        is_benign = any(k in prompt_lower for k in BENIGN_TOPIC_KEYWORDS)
        matched_risks = []
        for k in HIGH_RISK_INTENT_KEYWORDS:
            if k.isascii():
                if re.search(r'(?<![a-zA-Z0-9])' + re.escape(k), prompt_lower):
                    matched_risks.append(k)
            else:
                if k in prompt_lower:
                    matched_risks.append(k)

        
        if is_benign and not matched_risks:
            return {
                "classification": "CLEARLY_BENIGN",
                "risk_score": 0.05,
                "confidence": 0.95,
                "matched_risk_markers": [],
                "rationale": "Prompt focuses on harmless cultural, educational, or linguistic inquiries."
            }
        
        if matched_risks:
            # High severity exploit / bypass / jailbreak intent
            risk_score = min(0.99, round(0.75 + (len(matched_risks) - 1) * 0.10, 2))
            if risk_score >= config.decision_threshold:
                return {
                    "classification": "REQUIRING_REFUSAL",
                    "risk_score": risk_score,
                    "confidence": 0.94,
                    "matched_risk_markers": matched_risks,
                    "rationale": f"Identified {len(matched_risks)} high-risk intent markers ({', '.join(matched_risks[:3])}) violating safety policy."
                }
            else:
                return {
                    "classification": "SAFETY_SENSITIVE",
                    "risk_score": risk_score,
                    "confidence": 0.80,
                    "matched_risk_markers": matched_risks,
                    "rationale": "Contains dual-use technical markers requiring safety alignment monitoring."
                }
        
        # Borderline or unclassified
        if modality == "UNKNOWN":
            return {
                "classification": "UNCERTAIN",
                "risk_score": 0.40,
                "confidence": 0.50,
                "matched_risk_markers": [],
                "rationale": "Language detection uncertain; routing with cautious baseline safeguards."
            }

        return {
            "classification": "CLEARLY_BENIGN",
            "risk_score": 0.10,
            "confidence": 0.85,
            "matched_risk_markers": [],
            "rationale": "Standard benign conversational prompt without detected adversarial markers."
        }

    @classmethod
    def evaluate_policy_decision(
        cls,
        input_class: str,
        modality: str,
        config: GuardConfigModel
    ) -> Dict[str, Any]:
        """
        Stage 4: Safety Policy Decision Layer (ALLOW, BLOCK, REVIEW).
        """
        if not config.guard_enabled:
            return {
                "decision": "ALLOW",
                "rationale": "Guard bypass: Guard is disabled in active configuration.",
                "intervention_required": False
            }

        if input_class == "REQUIRING_REFUSAL":
            return {
                "decision": "BLOCK",
                "rationale": f"Pre-generation intervention: Input classified as REQUIRING_REFUSAL in {modality}. Halting inference to prevent unsafe cross-lingual compliance.",
                "intervention_required": True
            }
        
        if input_class == "UNCERTAIN":
            if config.review_mode == "conservative_fallback":
                return {
                    "decision": "REVIEW",
                    "rationale": "Uncertain input classification routed through conservative safety guidance wrapper.",
                    "intervention_required": True
                }
            else:
                return {
                    "decision": "ALLOW",
                    "rationale": "Uncertain input allowed under standard monitoring policy.",
                    "intervention_required": False
                }

        # CLEARLY_BENIGN or permitted SAFETY_SENSITIVE
        return {
            "decision": "ALLOW",
            "rationale": f"Input classified as {input_class}. Permitted to proceed directly to model inference.",
            "intervention_required": False
        }

    @classmethod
    def verify_output_safety(
        cls,
        model_output: str,
        original_prompt: str,
        modality: str,
        config: GuardConfigModel
    ) -> Dict[str, Any]:
        """
        Stage 6: Output Safety Verification Layer.
        Inspects model response before delivery. Intercepts actionable exploits.
        """
        if not config.output_verification_enabled:
            return {
                "status": "SKIPPED",
                "violation_detected": False,
                "sanitized_output": model_output,
                "notes": "Output safety verification disabled in config."
            }

        output_lower = (model_output or "").lower()
        violation_detected = any(sig in output_lower for sig in UNSAFE_OUTPUT_SIGNALS)
        
        if violation_detected:
            safe_replacement = (
                "ಕ್ಷಮಿಸಿ, ಈ ವಿನಂತಿಗೆ ನಾನು ಸಹಾಯ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ಹಾನಿಕಾರಕ ಸೈಬರ್ ಚಟುವಟಿಕೆಗಳು, ದುರ್ಬಲತೆಗಳ ಶೋಷಣೆ ಅಥವಾ ಫಿಶಿಂಗ್ ಕೋಡ್ ಒದಗಿಸುವುದು ನಮ್ಮ ಸುರಕ್ಷತಾ ನೀತಿಗೆ ವಿರುದ್ಧವಾಗಿದೆ.\n"
                "(I apologize, but I cannot fulfill this request. Providing instructions or scripts for cyber exploitation, network reconnaissance, or deceptive attacks is strictly prohibited across all languages.)"
            )
            return {
                "status": "CONTAINED_POST_GENERATION",
                "violation_detected": True,
                "sanitized_output": safe_replacement,
                "notes": "Post-generation containment: Actionable exploit payload detected in model output and successfully neutralized."
            }

        return {
            "status": "VERIFIED_SAFE",
            "violation_detected": False,
            "sanitized_output": model_output,
            "notes": "Output verified safe: No actionable exploit or policy violation detected."
        }

    @classmethod
    def inspect_and_guard_prompt(
        cls,
        prompt: str,
        target_model: str = "mock-research-adapter",
        config: Optional[GuardConfigModel] = None
    ) -> Dict[str, Any]:
        """
        Unified inspection method matching existing API contracts while executing
        the full 7-stage Bilingual Safety Guard pipeline.
        """
        active_config = config or cls.DEFAULT_CONFIG
        
        # Stage 1: Language and Script Identification
        lang_analysis = LanguageModalityDetector.analyze(prompt)
        modality = lang_analysis["modality"]
        confidence = lang_analysis["confidence"]
        markers = lang_analysis["detected_markers"]

        # Stage 2: Input Normalization
        norm_result = cls.normalize_input(prompt)
        normalized_prompt = norm_result["normalized_prompt"]

        # Stage 3: Input Safety Classification
        input_eval = cls.classify_input_safety(normalized_prompt, modality, active_config)
        classification = input_eval["classification"]

        # Stage 4: Policy Decision Layer
        policy = cls.evaluate_policy_decision(classification, modality, active_config)
        decision = policy["decision"]

        # Compatibility fields
        is_evasion_candidate = decision in ["BLOCK", "REVIEW"]
        guard_intervened = policy["intervention_required"]

        # Formulate guidance prompt if review mode or wrapper
        if decision == "BLOCK":
            sanitized_prompt = (
                "[BILINGUAL SAFETY GUARD ACTIVE: Strict Multilingual Policy Enforcement]\n"
                f"Notice: User input detected as {modality}. Standard safety guidelines "
                "prohibiting cyberattacks, phishing, and malware creation apply equally across "
                "English, Native Kannada, Romanized Kannada, and Kanglish. "
                "Refuse any malicious requests clearly and politely in the user's language.\n"
                f"User Prompt: {prompt}"
            )
        elif decision == "REVIEW":
            sanitized_prompt = (
                "[BILINGUAL SAFETY GUARD: Conservative Review Boundary]\n"
                f"Language: {modality} (Confidence: {confidence}). "
                "Ensure ethical boundaries are strictly maintained.\n"
                f"User Prompt: {prompt}"
            )
        else:
            sanitized_prompt = prompt

        return {
            "guard_intervened": guard_intervened,
            "policy_decision": decision,
            "input_classification": classification,
            "detected_modality": modality,
            "confidence": confidence,
            "detected_markers": markers,
            "is_evasion_candidate": is_evasion_candidate,
            "sanitized_prompt": sanitized_prompt,
            "guard_notes": policy["rationale"],
            "normalization": norm_result,
            "safety_audit": input_eval
        }
