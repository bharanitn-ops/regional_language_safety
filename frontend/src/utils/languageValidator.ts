import { TestCase } from '../types';

export const KANNADA_UNICODE_REGEX = /[\u0C80-\u0CFF]/;
export const KANNADA_UNICODE_GLOBAL = /[\u0C80-\u0CFF]/g;

export type ReviewStatusType = 'Approved' | 'Pending' | 'Needs correction';

export interface ValidationItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

export interface LanguageValidationReport {
  isValid: boolean;
  reviewStatus: ReviewStatusType;
  qualityScore: number;
  errors: string[];
  warnings: string[];
  manual_semantic_confirmation: boolean;
  checks: {
    requiredFields: ValidationItem;
    sharedIdBinding: ValidationItem;
    duplicateChecks: ValidationItem;
    languageMatching: ValidationItem;
    metadataAvailability: ValidationItem;
    semanticConfirmation: ValidationItem;
  };
  scriptDetails: {
    englishValid: boolean;
    kannadaNativeRatio: number;
    kannadaNativeValid: boolean;
    romanizedValid: boolean;
    kanglishValid: boolean;
  };
}

export const APPROVED_CATEGORIES = [
  'Cybersecurity safety',
  'Fraud and scam prevention',
  'Privacy and personal data protection',
  'Physical safety',
  'Harmful-content boundary testing',
  'Benign educational questions',
  'Harmless everyday questions',
];

export const ROMANIZED_KANNADA_MARKERS = [
  'hege', 'yake', 'enu', 'yaru', 'yava', 'ellige', 'illi', 'alli', 'elli',
  'nanna', 'nimma', 'namma', 'avara', 'avanu', 'avalu', 'idhu', 'adhu', 'yavudu',
  'madodu', 'madu', 'madalu', 'maduvudu', 'madoke', 'maadbeku', 'madthare', 'madthidare',
  'beku', 'beda', 'aguthe', 'agalla', 'aagalla', 'helu', 'helodu', 'kelu', 'kodi', 'baredkodi',
  'nodri', 'nodi', 'irabeku', 'ithu', 'ide', 'illa', 'gothilla', 'thilisiri',
  'durbhalathe', 'vyavasthapaka', 'vanchaka', 'mahathva', 'habbada', 'samskruthi', 'padhartha',
  'kanduhidiyalu', 'bareyiri', 'rachisi', 'natisi', 'vinanthisuva', 'maruhondisalu',
];

export class LanguageDataValidator {
  /**
   * Validates a multilingual 4-way test case against linguistic, script,
   * duplicate, metadata, and semantic equivalence rules.
   */
  static validate(
    testCase: Partial<TestCase> & {
      manual_semantic_confirmation?: boolean;
    },
    existingCases: TestCase[] = []
  ): LanguageValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    const en = (testCase.english_prompt || '').trim();
    const knNative = (testCase.kannada_native_prompt || '').trim();
    const knRomanized = (testCase.kannada_romanized_prompt || '').trim();
    const kanglish = (testCase.kanglish_prompt || '').trim();
    const benchmarkId = (testCase.benchmark_id || '').trim();
    const category = (testCase.category || '').trim();
    const riskLevel = (testCase.risk_level || '').trim();
    const description = (testCase.description || testCase.safety_intent || '').trim();
    const expectedBehaviour = (testCase.expected_safe_behaviour || '').trim();
    const manualSemanticConfirmation = Boolean(testCase.manual_semantic_confirmation);
    const requestedStatus = (testCase.reviewer_status || 'Pending').trim();

    // -------------------------------------------------------------------------
    // 1. Check whether required fields are empty
    // -------------------------------------------------------------------------
    const missingRequired: string[] = [];
    if (!en) missingRequired.push('English baseline prompt');
    if (!knNative) missingRequired.push('Kannada native-script prompt');
    if (!knRomanized) missingRequired.push('Romanized Kannada prompt');
    if (!kanglish) missingRequired.push('Kanglish code-mixed prompt');
    if (!benchmarkId) missingRequired.push('Test Case ID (benchmark_id)');

    if (missingRequired.length > 0) {
      missingRequired.forEach((field) => errors.push(`Required field is empty: ${field}.`));
    }

    const requiredFieldsCheck: ValidationItem = {
      id: 'required-fields',
      label: '1. Required Fields Completeness',
      status: missingRequired.length === 0 ? 'pass' : 'fail',
      message:
        missingRequired.length === 0
          ? 'All 4 multilingual prompt variants and test case ID are populated.'
          : `Missing ${missingRequired.length} required field(s): ${missingRequired.join(', ')}.`,
    };

    // -------------------------------------------------------------------------
    // 2. Check whether the same test case ID is used for all four variants
    // -------------------------------------------------------------------------
    let sharedIdStatus: 'pass' | 'fail' = 'pass';
    let sharedIdMsg = `All four variants are bound under shared benchmark ID '${benchmarkId}'.`;

    if (!benchmarkId) {
      sharedIdStatus = 'fail';
      sharedIdMsg = 'Test case ID is missing; all four language variants must share a single ID.';
    } else if (benchmarkId.length < 3) {
      sharedIdStatus = 'fail';
      sharedIdMsg = `Test case ID '${benchmarkId}' is invalid (too short).`;
      errors.push(`Test case ID '${benchmarkId}' is invalid (too short).`);
    }

    const sharedIdBindingCheck: ValidationItem = {
      id: 'shared-id',
      label: '2. Shared Test Case ID Binding',
      status: sharedIdStatus,
      message: sharedIdMsg,
    };

    // -------------------------------------------------------------------------
    // 3. Check whether duplicate entries exist
    // -------------------------------------------------------------------------
    const duplicateIssues: string[] = [];

    // A) Intra-case exact text duplicates
    const lowerEn = en.toLowerCase();
    const lowerNative = knNative.toLowerCase();
    const lowerRomanized = knRomanized.toLowerCase();
    const lowerKanglish = kanglish.toLowerCase();

    if (en && knNative && lowerEn === lowerNative) {
      duplicateIssues.push('Kannada native script is an exact duplicate of the English prompt.');
    }
    if (en && knRomanized && lowerEn === lowerRomanized) {
      duplicateIssues.push('Romanized Kannada is an exact duplicate of the English prompt.');
    }
    if (en && kanglish && lowerEn === lowerKanglish) {
      duplicateIssues.push('Kanglish field is an exact duplicate of the English prompt.');
    }
    if (knNative && kanglish && lowerNative === lowerKanglish) {
      duplicateIssues.push('Kanglish field is an exact duplicate of the Kannada native script.');
    }
    if (knRomanized && kanglish && lowerRomanized === lowerKanglish) {
      duplicateIssues.push('Kanglish field is identical to Romanized Kannada (lacks code-mixing contrast).');
    }

    // B) Cross-case duplicates in dataset
    const currentRecordId = testCase.id;
    existingCases.forEach((other) => {
      if (currentRecordId && other.id === currentRecordId) return;

      if (benchmarkId && other.benchmark_id && other.benchmark_id.toUpperCase() === benchmarkId.toUpperCase()) {
        duplicateIssues.push(`Duplicate Test Case ID: '${benchmarkId}' is already in use by another test case.`);
      }

      if (en && other.english_prompt && other.english_prompt.trim().toLowerCase() === lowerEn) {
        warnings.push(`English prompt is identical to existing test case '${other.benchmark_id}'.`);
      }
    });

    if (duplicateIssues.length > 0) {
      duplicateIssues.forEach((issue) => errors.push(`Duplicate error: ${issue}`));
    }

    const duplicateChecks: ValidationItem = {
      id: 'duplicate-checks',
      label: '3. Duplicate Entries Check',
      status: duplicateIssues.length === 0 ? 'pass' : 'fail',
      message:
        duplicateIssues.length === 0
          ? 'No intra-case text duplication or benchmark ID collisions detected.'
          : `${duplicateIssues.length} duplicate issue(s) detected.`,
    };

    // -------------------------------------------------------------------------
    // 4. Check whether the selected language label matches the intended field
    // -------------------------------------------------------------------------
    const scriptErrors: string[] = [];
    let kannadaNativeRatio = 0;
    let kannadaNativeValid = false;
    let englishValid = false;
    let romanizedValid = false;
    let kanglishValid = false;

    // Kannada Native Script (Must contain Kannada Unicode U+0C80-U+0CFF)
    if (knNative) {
      const knMatches = knNative.match(KANNADA_UNICODE_GLOBAL) || [];
      const cleanLen = knNative.replace(/\s+/g, '').length || 1;
      kannadaNativeRatio = knMatches.length / cleanLen;

      if (knMatches.length === 0) {
        scriptErrors.push('Kannada native-script field contains NO Kannada Unicode characters (U+0C80–U+0CFF).');
      } else {
        kannadaNativeValid = true;
        if (kannadaNativeRatio < 0.25) {
          warnings.push(`Low Kannada glyph density in native script field (${Math.round(kannadaNativeRatio * 100)}%).`);
        }
      }
    }

    // English Baseline (Must NOT contain Kannada characters)
    if (en) {
      const enKnMatches = en.match(KANNADA_UNICODE_GLOBAL) || [];
      if (enKnMatches.length > 0) {
        scriptErrors.push('English baseline field contains native Kannada script; expected standard Latin script.');
      } else {
        englishValid = true;
      }
    }

    // Romanized Kannada (Must NOT contain native Kannada characters; Latin translit)
    if (knRomanized) {
      const romKnMatches = knRomanized.match(KANNADA_UNICODE_GLOBAL) || [];
      if (romKnMatches.length > 0) {
        scriptErrors.push('Romanized Kannada field contains native Kannada script; expected Latin transliteration.');
      } else {
        romanizedValid = true;
        const words = knRomanized.toLowerCase().split(/\W+/);
        const hasMarker = words.some((w) => ROMANIZED_KANNADA_MARKERS.includes(w));
        if (!hasMarker && words.length > 4) {
          warnings.push('Romanized Kannada contains few recognized Kannada transliteration markers.');
        }
      }
    }

    // Kanglish (Code-mixed)
    if (kanglish) {
      kanglishValid = true;
    }

    if (scriptErrors.length > 0) {
      scriptErrors.forEach((sErr) => errors.push(`Language mismatch: ${sErr}`));
    }

    const languageMatchingCheck: ValidationItem = {
      id: 'language-matching',
      label: '4. Language Label & Script Verification',
      status: scriptErrors.length === 0 ? 'pass' : 'fail',
      message:
        scriptErrors.length === 0
          ? 'All 4 fields match their declared language scripts (Latin, Kannada U+0C80–U+0CFF, Translit, Code-mixed).'
          : `Language script mismatch: ${scriptErrors.join('; ')}`,
    };

    // -------------------------------------------------------------------------
    // 5. Check whether all required metadata is available
    // -------------------------------------------------------------------------
    const metadataMissing: string[] = [];
    if (!category) {
      metadataMissing.push('Category');
    }
    if (!riskLevel) {
      metadataMissing.push('Risk Level');
    }
    if (!description) {
      metadataMissing.push('Test Description / Safety Intent');
    } else if (description.length < 6) {
      warnings.push('Test description is brief (< 6 characters). Detailed intent is recommended.');
    }
    if (!expectedBehaviour) {
      metadataMissing.push('Expected Response Behaviour');
    }

    if (metadataMissing.length > 0) {
      metadataMissing.forEach((m) => errors.push(`Required metadata missing: ${m}.`));
    }

    const metadataAvailabilityCheck: ValidationItem = {
      id: 'metadata-availability',
      label: '5. Metadata Completeness',
      status: metadataMissing.length === 0 ? 'pass' : 'fail',
      message:
        metadataMissing.length === 0
          ? 'Category, risk level, description, and expected response behavior are fully specified.'
          : `Missing required metadata: ${metadataMissing.join(', ')}.`,
    };

    // -------------------------------------------------------------------------
    // Semantic Validation & Manual Reviewer Confirmation
    // -------------------------------------------------------------------------
    // Rule: Do not automatically claim that translations are semantically equivalent.
    if (!manualSemanticConfirmation) {
      warnings.push('Semantic equivalence has not been manually verified by a bilingual human reviewer.');
    }

    const semanticConfirmationCheck: ValidationItem = {
      id: 'semantic-confirmation',
      label: 'Semantic Equivalence Verification',
      status: manualSemanticConfirmation ? 'pass' : 'warn',
      message: manualSemanticConfirmation
        ? 'Manual Reviewer Confirmed: Bilingual expert verified semantic equivalence and safety intent.'
        : 'Translations are NOT automatically assumed equivalent. Requires manual bilingual reviewer confirmation.',
    };

    // -------------------------------------------------------------------------
    // Determine Review Status: "Pending" | "Approved" | "Needs correction"
    // -------------------------------------------------------------------------
    let reviewStatus: ReviewStatusType;

    if (errors.length > 0) {
      reviewStatus = 'Needs correction';
      if (requestedStatus.toLowerCase() === 'approved') {
        errors.push("Cannot set Review Status to 'Approved' while validation errors exist.");
      }
    } else if (!manualSemanticConfirmation) {
      if (requestedStatus.toLowerCase() === 'approved') {
        errors.push("Cannot set Review Status to 'Approved' without manual bilingual reviewer confirmation of semantic equivalence.");
        reviewStatus = 'Needs correction';
      } else {
        reviewStatus = 'Pending';
      }
    } else {
      if (requestedStatus.toLowerCase().includes('correction')) {
        reviewStatus = 'Needs correction';
      } else if (requestedStatus.toLowerCase().includes('pending') || requestedStatus.toLowerCase().includes('draft')) {
        reviewStatus = 'Pending';
      } else {
        reviewStatus = 'Approved';
      }
    }

    // Quality Score Calculation
    let score = 100;
    score -= errors.length * 20;
    score -= warnings.length * 5;
    if (!manualSemanticConfirmation) score -= 10;
    const qualityScore = Math.max(0, Math.min(100, Math.round(score)));

    return {
      isValid: errors.length === 0,
      reviewStatus,
      qualityScore,
      errors,
      warnings,
      manual_semantic_confirmation: manualSemanticConfirmation,
      checks: {
        requiredFields: requiredFieldsCheck,
        sharedIdBinding: sharedIdBindingCheck,
        duplicateChecks: duplicateChecks,
        languageMatching: languageMatchingCheck,
        metadataAvailability: metadataAvailabilityCheck,
        semanticConfirmation: semanticConfirmationCheck,
      },
      scriptDetails: {
        englishValid,
        kannadaNativeRatio: Math.round(kannadaNativeRatio * 1000) / 1000,
        kannadaNativeValid,
        romanizedValid,
        kanglishValid,
      },
    };
  }
}
