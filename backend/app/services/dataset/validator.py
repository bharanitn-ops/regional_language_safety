import re
from typing import Dict, Any, List, Optional

# Kannada Unicode block range: U+0C80 to U+0CFF
KANNADA_UNICODE_PATTERN = re.compile(r'[\u0C80-\u0CFF]')

APPROVED_CATEGORIES = {
    "Cybersecurity safety",
    "Fraud and scam prevention",
    "Privacy and personal data protection",
    "Physical safety",
    "Harmful-content boundary testing",
    "Benign educational questions",
    "Harmless everyday questions",
    # Legacy alias support
    "Cyber & Exploitation",
    "Social Engineering",
    "Hate & Harassment",
    "Benign Cultural Control"
}

APPROVED_RISK_LEVELS = {"CRITICAL", "HIGH", "MEDIUM", "LOW", "BENIGN"}

# Canonical review statuses
REVIEW_STATUS_APPROVED = "Approved"
REVIEW_STATUS_PENDING = "Pending"
REVIEW_STATUS_NEEDS_CORRECTION = "Needs correction"

# Romanized Kannada markers
ROMANIZED_MARKERS = {
    "hege", "yake", "enu", "yaru", "yava", "ellige", "illi", "alli", "elli",
    "nanna", "nimma", "namma", "avara", "avanu", "avalu", "idhu", "adhu", "yavudu",
    "madodu", "madu", "madalu", "maduvudu", "madoke", "maadbeku", "madthare", "madthidare",
    "beku", "beda", "aguthe", "agalla", "aagalla", "helu", "helodu", "kelu", "kodi", "baredkodi",
    "nodri", "nodi", "irabeku", "ithu", "ide", "illa", "gothilla", "thilisiri",
    "durbhalathe", "vyavasthapaka", "vanchaka", "mahathva", "habbada", "samskruthi", "padhartha",
    "kanduhidiyalu", "bareyiri", "rachisi", "natisi", "vinanthisuva", "maruhondisalu"
}


class DatasetQualityValidator:
    """
    Language data validation module for BhashaShield AI.

    Validates 4 multilingual representations:
    1. English
    2. Kannada native script
    3. Romanized Kannada
    4. Kanglish

    Validation checks:
    1. Whether required fields are empty
    2. Whether the same test case ID is used for all four variants
    3. Whether duplicate entries exist (intra-case & cross-case)
    4. Whether selected language label matches the intended field
    5. Whether all required metadata is available

    Review statuses:
    - Pending
    - Approved
    - Needs correction

    Semantic equivalence:
    Translations are NOT automatically claimed to be semantically equivalent.
    Requires manual human reviewer confirmation.
    """

    @classmethod
    def validate_test_case(
        cls,
        data: Dict[str, Any],
        existing_cases: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        errors: List[str] = []
        warnings: List[str] = []
        checks: Dict[str, Any] = {}
        script_details: Dict[str, Any] = {}

        # -------------------------------------------------------------
        # 1. Check whether required fields are empty
        # -------------------------------------------------------------
        en = (data.get("english_prompt") or "").strip()
        kn_native = (data.get("kannada_native_prompt") or "").strip()
        kn_romanized = (data.get("kannada_romanized_prompt") or "").strip()
        kanglish = (data.get("kanglish_prompt") or "").strip()
        benchmark_id = (data.get("benchmark_id") or "").strip()

        empty_fields: List[str] = []
        if not en:
            empty_fields.append("English baseline prompt")
        if not kn_native:
            empty_fields.append("Kannada native-script prompt")
        if not kn_romanized:
            empty_fields.append("Romanized Kannada prompt")
        if not kanglish:
            empty_fields.append("Kanglish prompt")
        if not benchmark_id:
            empty_fields.append("Test Case ID (benchmark_id)")

        if empty_fields:
            for field in empty_fields:
                errors.append(f"Required field is empty: {field}.")
            checks["required_fields"] = {
                "status": "fail",
                "missing": empty_fields,
                "message": f"Missing {len(empty_fields)} required field(s)."
            }
        else:
            checks["required_fields"] = {
                "status": "pass",
                "message": "All 4 language prompt fields and test case ID are populated."
            }

        # -------------------------------------------------------------
        # 2. Check whether the same test case ID is used for all four variants
        # -------------------------------------------------------------
        # In BhashaShield AI, all 4 variants are paired under one shared benchmark_id.
        if not benchmark_id:
            errors.append("Test case ID is missing; all four language variants must share a single test case ID.")
            checks["shared_id_binding"] = {
                "status": "fail",
                "message": "Missing shared test case ID."
            }
        elif len(benchmark_id) < 3:
            errors.append(f"Test case ID '{benchmark_id}' is invalid (too short).")
            checks["shared_id_binding"] = {
                "status": "fail",
                "message": "Test case ID too short."
            }
        else:
            # Check variant-specific IDs if present in payload
            variant_ids = data.get("variant_ids")
            if isinstance(variant_ids, dict):
                mismatches = [k for k, v in variant_ids.items() if str(v).strip() != benchmark_id]
                if mismatches:
                    errors.append(f"Variant ID mismatch for {', '.join(mismatches)}; all variants must share ID '{benchmark_id}'.")
                    checks["shared_id_binding"] = {
                        "status": "fail",
                        "message": f"Variant ID mismatch for {mismatches}"
                    }
                else:
                    checks["shared_id_binding"] = {
                        "status": "pass",
                        "shared_id": benchmark_id,
                        "message": f"All four language variants share benchmark ID '{benchmark_id}'."
                    }
            else:
                checks["shared_id_binding"] = {
                    "status": "pass",
                    "shared_id": benchmark_id,
                    "message": f"All four language variants bound under shared benchmark ID '{benchmark_id}'."
                }

        # -------------------------------------------------------------
        # 3. Check whether duplicate entries exist
        # -------------------------------------------------------------
        duplicate_issues: List[str] = []

        # A) Intra-case exact text duplicates
        lower_en = en.lower()
        lower_native = kn_native.lower()
        lower_romanized = kn_romanized.lower()
        lower_kanglish = kanglish.lower()

        if en and kn_native and lower_en == lower_native:
            duplicate_issues.append("Kannada native script field is an exact duplicate of the English prompt.")
        if en and kn_romanized and lower_en == lower_romanized:
            duplicate_issues.append("Romanized Kannada field is an exact duplicate of the English prompt.")
        if en and kanglish and lower_en == lower_kanglish:
            duplicate_issues.append("Kanglish field is an exact duplicate of the English prompt.")
        if kn_native and kanglish and lower_native == lower_kanglish:
            duplicate_issues.append("Kanglish field is an exact duplicate of the Kannada native script.")
        if kn_romanized and kanglish and lower_romanized == lower_kanglish:
            duplicate_issues.append("Kanglish field is identical to Romanized Kannada (lacks code-mixing contrast).")

        # B) Cross-case duplicates (if existing_cases provided)
        current_id = str(data.get("id") or "")
        if existing_cases:
            for other in existing_cases:
                other_id = str(other.get("id") or "")
                other_benchmark = str(other.get("benchmark_id") or "")

                # Skip comparison against self when updating
                if current_id and other_id == current_id:
                    continue
                if benchmark_id and other_benchmark.upper() == benchmark_id.upper() and current_id and other_id != current_id:
                    duplicate_issues.append(f"Duplicate Test Case ID: '{benchmark_id}' is already used by another test case.")

                # Check duplicate prompts
                if en and other.get("english_prompt", "").strip().lower() == lower_en:
                    warnings.append(f"English prompt is identical to existing test case '{other_benchmark}'.")
                if kn_native and other.get("kannada_native_prompt", "").strip() == kn_native:
                    warnings.append(f"Kannada native prompt is identical to existing test case '{other_benchmark}'.")

        if duplicate_issues:
            for issue in duplicate_issues:
                errors.append(f"Duplicate entry error: {issue}")
            checks["duplicate_checks"] = {
                "status": "fail",
                "issues": duplicate_issues,
                "message": f"{len(duplicate_issues)} duplicate issue(s) detected."
            }
        else:
            checks["duplicate_checks"] = {
                "status": "pass",
                "message": "No intra-case or duplicate benchmark ID collisions detected."
            }

        # -------------------------------------------------------------
        # 4. Check whether the selected language label matches the intended field
        # -------------------------------------------------------------
        script_errors: List[str] = []

        # Kannada Native Script: MUST contain Kannada Unicode (U+0C80–U+0CFF)
        if kn_native:
            kn_chars = KANNADA_UNICODE_PATTERN.findall(kn_native)
            char_count = len(kn_chars)
            total_len = len(kn_native.replace(" ", "")) or 1
            ratio = char_count / total_len
            script_details["kannada_native_ratio"] = round(ratio, 3)

            if char_count == 0:
                script_errors.append("Kannada native-script field contains NO Kannada Unicode characters (U+0C80–U+0CFF).")
            elif ratio < 0.25:
                warnings.append(f"Low Kannada glyph density in native script field ({round(ratio*100)}%).")
        else:
            script_details["kannada_native_ratio"] = 0.0

        # English: MUST NOT contain Kannada Unicode
        if en:
            en_kn_chars = KANNADA_UNICODE_PATTERN.findall(en)
            if en_kn_chars:
                script_errors.append("English baseline field contains native Kannada characters; expected standard Latin script.")
            script_details["english_valid"] = len(en_kn_chars) == 0
        else:
            script_details["english_valid"] = False

        # Romanized Kannada: MUST NOT contain native Kannada Unicode (must be Latin transliteration)
        if kn_romanized:
            rom_kn_chars = KANNADA_UNICODE_PATTERN.findall(kn_romanized)
            if rom_kn_chars:
                script_errors.append("Romanized Kannada contains native Kannada script; expected Latin-script transliteration.")
            
            # Check for Romanized markers
            words = set(re.findall(r'[a-zA-Z]+', kn_romanized.lower()))
            has_markers = any(w in ROMANIZED_MARKERS for w in words)
            script_details["romanized_markers_found"] = has_markers
            if not has_markers and len(words) > 3:
                warnings.append("Romanized Kannada contains few recognizable Kannada transliteration markers.")
            script_details["romanized_valid"] = len(rom_kn_chars) == 0
        else:
            script_details["romanized_valid"] = False

        # Kanglish: Should be code-mixed
        if kanglish:
            script_details["kanglish_valid"] = True
        else:
            script_details["kanglish_valid"] = False

        if script_errors:
            for s_err in script_errors:
                errors.append(f"Language label mismatch: {s_err}")
            checks["language_matching"] = {
                "status": "fail",
                "errors": script_errors,
                "message": "Script/modality mismatch in language fields."
            }
        else:
            checks["language_matching"] = {
                "status": "pass",
                "message": "All 4 language fields match their designated scripts (Latin, Kannada U+0C80–U+0CFF, Transliteration, Code-mixed)."
            }

        # -------------------------------------------------------------
        # 5. Check whether all required metadata is available
        # -------------------------------------------------------------
        metadata_missing: List[str] = []

        category = (data.get("category") or "").strip()
        if not category:
            metadata_missing.append("Category")
        elif category not in APPROVED_CATEGORIES:
            warnings.append(f"Category '{category}' is outside recommended research taxonomy.")

        risk_level = (data.get("risk_level") or "").strip()
        if not risk_level:
            metadata_missing.append("Risk Level")
        elif risk_level not in APPROVED_RISK_LEVELS:
            errors.append(f"Invalid risk_level '{risk_level}'. Must be one of {APPROVED_RISK_LEVELS}.")

        description = (data.get("description") or data.get("safety_intent") or "").strip()
        if not description:
            metadata_missing.append("Test Description / Safety Intent")
        elif len(description) < 6:
            warnings.append("Test description is brief (< 6 characters). Detailed evaluation intent is recommended.")

        expected_behaviour = (data.get("expected_safe_behaviour") or "").strip()
        if not expected_behaviour:
            metadata_missing.append("Expected Response Behaviour")

        if metadata_missing:
            for item in metadata_missing:
                errors.append(f"Required metadata missing: {item}.")
            checks["metadata_availability"] = {
                "status": "fail",
                "missing": metadata_missing,
                "message": f"Missing metadata: {', '.join(metadata_missing)}."
            }
        else:
            checks["metadata_availability"] = {
                "status": "pass",
                "category": category,
                "risk_level": risk_level,
                "message": "All required metadata attributes are fully specified."
            }

        # -------------------------------------------------------------
        # Semantic Validation: Manual Reviewer Confirmation
        # -------------------------------------------------------------
        # Rule: Do not automatically claim that translations are semantically equivalent.
        # Add manual reviewer confirmation field for semantic validation.
        manual_semantic_confirmation = bool(data.get("manual_semantic_confirmation") or False)
        checks["semantic_confirmation"] = {
            "confirmed": manual_semantic_confirmation,
            "status": "pass" if manual_semantic_confirmation else "warn",
            "message": (
                "Semantic equivalence confirmed by bilingual human reviewer."
                if manual_semantic_confirmation
                else "Manual human confirmation required: translations are NOT automatically assumed to be semantically equivalent."
            )
        }
        if not manual_semantic_confirmation:
            warnings.append("Semantic equivalence has not been manually verified by a bilingual reviewer.")

        # -------------------------------------------------------------
        # Determine Review Status: "Pending" | "Approved" | "Needs correction"
        # -------------------------------------------------------------
        requested_status = (data.get("reviewer_status") or "").strip().lower()

        if len(errors) > 0:
            review_status = REVIEW_STATUS_NEEDS_CORRECTION
            if requested_status in ["approved", "review_status_approved"]:
                errors.append("Cannot set Review Status to 'Approved' while validation errors exist.")
        elif not manual_semantic_confirmation:
            # Without manual semantic confirmation, test case CANNOT be marked Approved
            if requested_status in ["approved", "review_status_approved"]:
                errors.append("Cannot set Review Status to 'Approved' without manual bilingual reviewer confirmation of semantic equivalence.")
                review_status = REVIEW_STATUS_NEEDS_CORRECTION
            else:
                review_status = REVIEW_STATUS_PENDING
        else:
            # Valid & manually confirmed
            if requested_status in ["needs correction", "needs_correction", "needs_translation_correction"]:
                review_status = REVIEW_STATUS_NEEDS_CORRECTION
            elif requested_status in ["pending", "pending_review", "draft"]:
                review_status = REVIEW_STATUS_PENDING
            else:
                review_status = REVIEW_STATUS_APPROVED

        # Calculate quality score (0.0 to 100.0)
        score = 100.0
        score -= len(errors) * 20.0
        score -= len(warnings) * 5.0
        if not manual_semantic_confirmation:
            score -= 10.0
        quality_score = max(0.0, min(100.0, score))

        return {
            "is_valid": len(errors) == 0,
            "review_status": review_status,
            "quality_score": round(quality_score, 1),
            "errors": errors,
            "warnings": warnings,
            "checks": checks,
            "script_details": script_details,
            "manual_semantic_confirmation": manual_semantic_confirmation,
        }
