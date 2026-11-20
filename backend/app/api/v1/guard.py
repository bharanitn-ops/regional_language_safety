import time
from typing import Dict, Any, List
from fastapi import APIRouter
from app.schemas.guard import (
    GuardInspectRequest,
    GuardInspectResponse,
    GuardConfigModel,
    BsgWorkflowDemoRequest,
    BsgWorkflowDemoResponse,
    BsgWorkflowStep,
)
from app.services.normalization.detector import LanguageModalityDetector
from app.services.guard.safety_guard import BilingualSafetyGuard
from app.services.model_adapter.factory import get_model_adapter

router = APIRouter(prefix="/guard", tags=["Bilingual Safety Guard"])

# Active in-memory Guard Configuration (can be updated via API)
_ACTIVE_GUARD_CONFIG = GuardConfigModel()

@router.get("/config", response_model=GuardConfigModel)
async def get_guard_config():
    """Retrieve active Bilingual Safety Guard configuration."""
    return _ACTIVE_GUARD_CONFIG

@router.put("/config", response_model=GuardConfigModel)
async def update_guard_config(payload: GuardConfigModel):
    """Update active Bilingual Safety Guard configuration thresholds and settings."""
    global _ACTIVE_GUARD_CONFIG
    _ACTIVE_GUARD_CONFIG = payload
    return _ACTIVE_GUARD_CONFIG

async def _process_guard_evaluation(payload: GuardInspectRequest) -> GuardInspectResponse:
    """
    Executes the full 7-stage Bilingual Safety Guard pipeline:
    Stage 1: Language and Script Identification
    Stage 2: Input Normalization without losing original text
    Stage 3: Multilingual Safety Classification (CLEARLY_BENIGN, SAFETY_SENSITIVE, REQUIRING_REFUSAL, UNCERTAIN)
    Stage 4: Safety Policy Decision (ALLOW, BLOCK, REVIEW)
    Stage 5: Original Model Inference for permitted requests
    Stage 6: Output Safety Verification
    Stage 7: Final Response Assembly with baseline comparison & audit trace
    """
    config = payload.config or _ACTIVE_GUARD_CONFIG
    pipeline_trace: List[Dict[str, Any]] = []

    # -------------------------------------------------------------
    # Stage 1: Language and Script Identification
    # -------------------------------------------------------------
    lang_analysis = LanguageModalityDetector.analyze(payload.prompt)
    modality = payload.forced_modality or lang_analysis["modality"]
    confidence = lang_analysis["confidence"]
    markers = lang_analysis["detected_markers"]

    pipeline_trace.append({
        "stage_number": 1,
        "stage_name": "Language and Script Identification",
        "status": "COMPLETED",
        "details": {
            "detected_modality": modality,
            "confidence": confidence,
            "is_uncertain": lang_analysis.get("is_uncertain", False),
            "script_markers": markers
        }
    })

    # -------------------------------------------------------------
    # Stage 2: Input Normalization
    # -------------------------------------------------------------
    norm_result = BilingualSafetyGuard.normalize_input(payload.prompt)
    normalized_prompt = norm_result["normalized_prompt"]

    pipeline_trace.append({
        "stage_number": 2,
        "stage_name": "Input Normalization",
        "status": "COMPLETED",
        "details": {
            "original_length": len(payload.prompt),
            "normalized_length": len(normalized_prompt),
            "normalized_sample": normalized_prompt[:80] + ("..." if len(normalized_prompt) > 80 else "")
        }
    })

    # -------------------------------------------------------------
    # Stage 3: Multilingual Safety Classification
    # -------------------------------------------------------------
    input_eval = BilingualSafetyGuard.classify_input_safety(normalized_prompt, modality, config)
    classification = input_eval["classification"]

    pipeline_trace.append({
        "stage_number": 3,
        "stage_name": "Multilingual Safety Classification",
        "status": "COMPLETED",
        "details": {
            "classification": classification,
            "risk_score": input_eval["risk_score"],
            "matched_markers": input_eval["matched_risk_markers"]
        }
    })

    # -------------------------------------------------------------
    # Stage 4: Safety Policy Decision Layer
    # -------------------------------------------------------------
    policy = BilingualSafetyGuard.evaluate_policy_decision(classification, modality, config)
    decision = policy["decision"]

    pipeline_trace.append({
        "stage_number": 4,
        "stage_name": "Safety Policy Decision",
        "status": "COMPLETED",
        "details": {
            "policy_decision": decision,
            "decision_rationale": policy["rationale"],
            "pre_generation_intervention": policy["intervention_required"]
        }
    })

    # -------------------------------------------------------------
    # Run Baseline (Unprotected Original Model)
    # -------------------------------------------------------------
    adapter = get_model_adapter(payload.target_model)
    t0_base = time.perf_counter()
    baseline_res = await adapter.generate(prompt=payload.prompt, modality=modality)
    baseline_lat = round((time.perf_counter() - t0_base) * 1000, 2)
    unprotected_output = baseline_res["raw_output"]

    # -------------------------------------------------------------
    # Stage 5 & 6: Guarded Model Inference & Output Verification
    # -------------------------------------------------------------
    t0_guard = time.perf_counter()
    output_verification_status = "SKIPPED"
    output_violation = False
    guarded_output = ""
    defense_verdict = "PASSED_DIRECT"
    explanation = ""

    if decision == "BLOCK":
        # Pre-generation refusal
        guarded_output = (
            "ಕ್ಷಮಿಸಿ, ಹಾನಿಕಾರಕ ಅಥವಾ ವಂಚಕ ಚಟುವಟಿಕೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡುವ ಮಾಹಿತಿಯನ್ನು ನಾನು ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. "
            "(I apologize, I cannot provide assistance or instructions for malicious cyber, exploit, or phishing requests in any language.)"
        )
        defense_verdict = "DEFENSE_ACTIVE"
        explanation = f"Language-aware guard detected high-risk probe in {modality} and successfully prevented unsafe cross-lingual compliance."
        output_verification_status = "SKIPPED_PRE_GENERATION_BLOCK"
        guarded_lat = round((time.perf_counter() - t0_guard) * 1000, 2)

    elif decision == "REVIEW":
        # Conservative safety wrapper injection
        review_prompt = (
            "[BILINGUAL SAFETY GUARD ACTIVE: Strict Ethical Policy Enforcement]\n"
            f"Notice: User prompt received in {modality}. Comply strictly with ethical safety guidelines.\n"
            f"User Prompt: {payload.prompt}"
        )
        gen_res = await adapter.generate(prompt=review_prompt, modality=modality)
        raw_guarded = gen_res["raw_output"]
        
        # Stage 6: Output Verification
        out_verify = BilingualSafetyGuard.verify_output_safety(raw_guarded, payload.prompt, modality, config)
        guarded_output = out_verify["sanitized_output"]
        output_verification_status = out_verify["status"]
        output_violation = out_verify["violation_detected"]
        defense_verdict = "DEFENSE_ACTIVE" if output_violation else "PASSED_DIRECT"
        explanation = out_verify["notes"]
        guarded_lat = round((time.perf_counter() - t0_guard) * 1000, 2)

    else:
        # ALLOW: direct generation with Stage 6 Output Verification
        gen_res = await adapter.generate(prompt=payload.prompt, modality=modality)
        raw_guarded = gen_res["raw_output"]

        # Stage 6: Output Verification
        out_verify = BilingualSafetyGuard.verify_output_safety(raw_guarded, payload.prompt, modality, config)
        guarded_output = out_verify["sanitized_output"]
        output_verification_status = out_verify["status"]
        output_violation = out_verify["violation_detected"]
        
        if output_violation:
            defense_verdict = "CONTAINED_OUTPUT"
            explanation = "Model generated actionable exploit code; post-generation output verification intercepted and neutralized response."
        else:
            defense_verdict = "PASSED_DIRECT"
            explanation = "Prompt was evaluated as benign or handled safely by native model alignment without requiring intervention."
        guarded_lat = round((time.perf_counter() - t0_guard) * 1000, 2)

    pipeline_trace.append({
        "stage_number": 5,
        "stage_name": "Target Model Inference",
        "status": "COMPLETED",
        "details": {
            "target_model": payload.target_model,
            "inference_executed": decision != "BLOCK",
            "model_latency_ms": guarded_lat
        }
    })

    pipeline_trace.append({
        "stage_number": 6,
        "stage_name": "Output Safety Verification",
        "status": "COMPLETED",
        "details": {
            "verification_status": output_verification_status,
            "output_violation_detected": output_violation
        }
    })

    pipeline_trace.append({
        "stage_number": 7,
        "stage_name": "Final Response Delivery",
        "status": "COMPLETED",
        "details": {
            "final_verdict": defense_verdict,
            "latency_overhead_ms": round(max(0.0, guarded_lat - baseline_lat), 2)
        }
    })

    is_evasion_candidate = decision in ["BLOCK", "REVIEW"] or policy["intervention_required"]

    return GuardInspectResponse(
        original_prompt=payload.prompt,
        detected_modality=modality,
        confidence=confidence,
        detected_tokens=markers,
        is_evasion_candidate=is_evasion_candidate,
        normalized_semantic_prompt=normalized_prompt,
        pre_generation_intervention=policy["intervention_required"],
        sanitized_prompt=normalized_prompt,
        direct_model_output_unprotected=unprotected_output,
        guarded_model_output_protected=guarded_output,
        defense_verdict=defense_verdict,
        explanation=explanation,
        policy_decision=decision,
        policy_decision_rationale=policy["rationale"],
        input_classification=classification,
        output_verification_status=output_verification_status,
        output_violation_detected=output_violation,
        baseline_latency_ms=baseline_lat,
        guarded_latency_ms=guarded_lat,
        latency_overhead_ms=round(max(0.0, guarded_lat - baseline_lat), 2),
        pipeline_trace=pipeline_trace,
        guard_config=config.model_dump()
    )

@router.post("/inspect", response_model=GuardInspectResponse)
async def inspect_guard(payload: GuardInspectRequest):
    """
    Direct research inspection of the Bilingual Safety Guard.
    Executes the 7-stage BSG pipeline and compares baseline generation vs guarded defense.
    """
    return await _process_guard_evaluation(payload)

@router.post("/evaluate", response_model=GuardInspectResponse)
async def evaluate_guard(payload: GuardInspectRequest):
    """
    API alias for Bilingual Safety Guard evaluation.
    """
    return await _process_guard_evaluation(payload)

@router.post("/demo-workflow", response_model=BsgWorkflowDemoResponse)
async def get_guard_demo_workflow(payload: BsgWorkflowDemoRequest):
    """
    Bilingual Safety Guard Demonstration Workflow Endpoint.
    Demonstrates the 5 proposed architectural stages:
    1. Language identification
    2. Input normalization
    3. Safety classification
    4. Policy decision
    5. Response verification
    Compares baseline model vs Guard-enabled defense, marked as illustrative until empirical runs complete.
    """
    config = payload.config or _ACTIVE_GUARD_CONFIG

    # -------------------------------------------------------------
    # Step 1: Language and Script Identification
    # -------------------------------------------------------------
    lang_analysis = LanguageModalityDetector.analyze(payload.prompt)
    modality = payload.forced_modality or lang_analysis["modality"]
    confidence = lang_analysis["confidence"]
    markers = lang_analysis["detected_markers"]

    script_family = "Kannada Script (U+0C80–U+0CFF)" if modality == "KANNADA_NATIVE" else (
        "Latin Transliteration (Romanized Kannada)" if modality == "KANNADA_ROMANIZED" else (
            "Code-Mixed Kannada-English (Kanglish)" if modality == "KANGLISH" else "Standard Latin Script"
        )
    )

    step1 = BsgWorkflowStep(
        step_number=1,
        step_id="language_identification",
        step_name="Language Identification",
        status="COMPLETED",
        summary=f"Detected Modality: {modality} (Confidence: {round(confidence * 100, 1)}%)",
        details={
            "detected_modality": modality,
            "confidence": round(confidence, 4),
            "script_family": script_family,
            "detected_script_markers": markers,
            "is_uncertain": lang_analysis.get("is_uncertain", False),
            "sub_analysis": {
                "native_indic": modality == "KANNADA_NATIVE",
                "latin_based_indic": modality in ["KANNADA_ROMANIZED", "KANGLISH"],
                "code_mixing": modality == "KANGLISH"
            }
        }
    )

    # -------------------------------------------------------------
    # Step 2: Input Normalization (Lossless)
    # -------------------------------------------------------------
    norm_result = BilingualSafetyGuard.normalize_input(payload.prompt)
    normalized_prompt = norm_result["normalized_prompt"]

    step2 = BsgWorkflowStep(
        step_number=2,
        step_id="input_normalization",
        step_name="Input Normalization",
        status="COMPLETED",
        summary=f"Normalized input via Unicode NFKC without semantic loss ({norm_result['character_count']} chars)",
        details={
            "original_prompt": payload.prompt,
            "normalized_prompt": normalized_prompt,
            "original_char_count": len(payload.prompt),
            "normalized_char_count": norm_result["character_count"],
            "word_count": norm_result["word_count"],
            "normalization_strategy": "Unicode NFKC + Whitespace Folding (Lossless preservation of source tokens)",
            "preserves_original_text": True
        }
    )

    # -------------------------------------------------------------
    # Step 3: Safety Classification
    # -------------------------------------------------------------
    input_eval = BilingualSafetyGuard.classify_input_safety(normalized_prompt, modality, config)
    classification = input_eval["classification"]
    risk_score = input_eval["risk_score"]

    step3 = BsgWorkflowStep(
        step_number=3,
        step_id="safety_classification",
        step_name="Safety Classification",
        status="COMPLETED",
        summary=f"Multilingual Intent Classification: {classification} (Risk Score: {round(risk_score * 100, 1)}%)",
        details={
            "classification": classification,
            "risk_score": risk_score,
            "matched_risk_markers": input_eval.get("matched_risk_markers", []),
            "rationale": input_eval.get("rationale", ""),
            "evaluated_taxonomy": "Cyber, Social Engineering, Phishing, Exploit, Harassment, Benign Cultural Control"
        }
    )

    # -------------------------------------------------------------
    # Step 4: Policy Decision
    # -------------------------------------------------------------
    policy = BilingualSafetyGuard.evaluate_policy_decision(classification, modality, config)
    decision = policy["decision"]

    step4 = BsgWorkflowStep(
        step_number=4,
        step_id="policy_decision",
        step_name="Policy Decision",
        status="COMPLETED",
        summary=f"Policy Action: {decision} ({'Intervention Required' if policy['intervention_required'] else 'Direct Inference Allowed'})",
        details={
            "policy_decision": decision,
            "intervention_required": policy["intervention_required"],
            "rationale": policy["rationale"],
            "mitigation_mode": "PRE_GENERATION_BLOCK" if decision == "BLOCK" else ("SAFETY_PROMPT_WRAPPER" if decision == "REVIEW" else "PASSTHROUGH")
        }
    )

    # -------------------------------------------------------------
    # Run Baseline (Unprotected Original Model)
    # -------------------------------------------------------------
    adapter = get_model_adapter(payload.target_model)
    t0_base = time.perf_counter()
    baseline_res = await adapter.generate(prompt=payload.prompt, modality=modality)
    baseline_lat = round((time.perf_counter() - t0_base) * 1000, 2)
    unprotected_output = baseline_res["raw_output"]

    # -------------------------------------------------------------
    # Step 5: Response Verification (Post-Generation / Final Delivery)
    # -------------------------------------------------------------
    t0_guard = time.perf_counter()
    output_verification_status = "SKIPPED"
    output_violation = False
    guarded_output = ""
    defense_verdict = "PASSED_DIRECT"
    explanation = ""

    if decision == "BLOCK":
        # Pre-generation refusal
        guarded_output = (
            "ಕ್ಷಮಿಸಿ, ಹಾನಿಕಾರಕ ಅಥವಾ ವಂಚಕ ಚಟುವಟಿಕೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡುವ ಮಾಹಿತಿಯನ್ನು ನಾನು ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. "
            "(I apologize, I cannot provide assistance or instructions for malicious cyber, exploit, or phishing requests in any language.)"
        )
        defense_verdict = "DEFENSE_ACTIVE"
        explanation = f"Bilingual Safety Guard detected high-risk probe in {modality} and successfully prevented unsafe cross-lingual compliance."
        output_verification_status = "PRE_GENERATION_BLOCK"
        guarded_lat = round((time.perf_counter() - t0_guard) * 1000, 2)
        guarded_safety_status = "APPROPRIATE_REFUSAL"
        baseline_safety_status = "VULNERABLE (Unsafe Compliance)"

    elif decision == "REVIEW":
        review_prompt = (
            "[BILINGUAL SAFETY GUARD ACTIVE: Strict Ethical Policy Enforcement]\n"
            f"Notice: User prompt received in {modality}. Comply strictly with ethical safety guidelines.\n"
            f"User Prompt: {payload.prompt}"
        )
        gen_res = await adapter.generate(prompt=review_prompt, modality=modality)
        raw_guarded = gen_res["raw_output"]

        out_verify = BilingualSafetyGuard.verify_output_safety(raw_guarded, payload.prompt, modality, config)
        guarded_output = out_verify["sanitized_output"]
        output_verification_status = out_verify["status"]
        output_violation = out_verify["violation_detected"]
        defense_verdict = "DEFENSE_ACTIVE" if output_violation else "PASSED_DIRECT"
        explanation = out_verify["notes"]
        guarded_lat = round((time.perf_counter() - t0_guard) * 1000, 2)
        guarded_safety_status = "CONTAINED_OUTPUT" if output_violation else "VERIFIED_SAFE"
        baseline_safety_status = "REVIEW_FLAGGED"

    else:
        # ALLOW: direct generation with output verification
        gen_res = await adapter.generate(prompt=payload.prompt, modality=modality)
        raw_guarded = gen_res["raw_output"]

        out_verify = BilingualSafetyGuard.verify_output_safety(raw_guarded, payload.prompt, modality, config)
        guarded_output = out_verify["sanitized_output"]
        output_verification_status = out_verify["status"]
        output_violation = out_verify["violation_detected"]

        if output_violation:
            defense_verdict = "CONTAINED_OUTPUT"
            explanation = "Model generated actionable exploit code; post-generation output verification intercepted and neutralized response."
            guarded_safety_status = "CONTAINED_OUTPUT"
            baseline_safety_status = "VULNERABLE (Unsafe Compliance)"
        else:
            defense_verdict = "PASSED_DIRECT"
            explanation = "Prompt was evaluated as benign or handled safely by native model alignment without requiring intervention."
            guarded_safety_status = "VERIFIED_SAFE (Benign Response)"
            baseline_safety_status = "BENIGN_PERMITTED"

        guarded_lat = round((time.perf_counter() - t0_guard) * 1000, 2)

    step5 = BsgWorkflowStep(
        step_number=5,
        step_id="response_verification",
        step_name="Response Verification",
        status="COMPLETED",
        summary=f"Final Output Audit: {defense_verdict} ({output_verification_status})",
        details={
            "output_verification_status": output_verification_status,
            "output_violation_detected": output_violation,
            "defense_verdict": defense_verdict,
            "guarded_latency_ms": guarded_lat,
            "latency_overhead_ms": round(max(0.0, guarded_lat - baseline_lat), 2),
            "safety_posture": "Intercepted pre-generation or screened post-generation to eliminate harmful payloads."
        }
    )

    return BsgWorkflowDemoResponse(
        prompt=payload.prompt,
        target_model=payload.target_model,
        is_illustrative_data=True,
        disclaimer=(
            "ILLUSTRATIVE DEMO RESULT - Results shown here illustrate the proposed Bilingual Safety Guard "
            "workflow and are simulated for demonstration purposes until full empirical benchmark runs are completed."
        ),
        workflow_steps=[step1, step2, step3, step4, step5],
        baseline_output=unprotected_output,
        baseline_safety_status=baseline_safety_status,
        baseline_latency_ms=baseline_lat,
        guarded_output=guarded_output,
        guarded_safety_status=guarded_safety_status,
        guarded_latency_ms=guarded_lat,
        latency_overhead_ms=round(max(0.0, guarded_lat - baseline_lat), 2),
        defense_verdict=defense_verdict,
        policy_decision=decision,
        input_classification=classification,
        detected_modality=modality,
        explanation=explanation
    )

