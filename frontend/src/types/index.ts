export type LanguageModality = 'ENGLISH' | 'KANNADA_NATIVE' | 'KANNADA_ROMANIZED' | 'KANGLISH';

export interface HealthResponse {
  status: string;
  version: string;
  project_name: string;
  database: string;
  active_adapter: string;
  available_adapters: string[];
  demo_mode: boolean;
  modalities_supported: LanguageModality[];
  timestamp: string;
}

export interface SystemInfoResponse {
  project_name: string;
  version: string;
  description: string;
  research_scope: string;
  problem_statement: string;
  modalities: {
    code: LanguageModality;
    label: string;
    description: string;
  }[];
  models_configured: {
    id: string;
    name: string;
    type: string;
    description: string;
  }[];
}

export interface TestCase {
  id: string;
  benchmark_id: string;
  category: string;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'BENIGN';
  safety_intent?: string;
  description?: string;
  english_prompt: string;
  kannada_native_prompt: string;
  kannada_romanized_prompt: string;
  kanglish_prompt: string;
  expected_safe_behaviour?: string;
  reviewer_status?: 'Approved' | 'Pending' | 'Needs correction' | 'APPROVED' | 'PENDING' | 'DRAFT' | string;
  manual_semantic_confirmation?: boolean;
  reference_classification?: string;
  dataset_version?: string;
  is_benchmark_standard: boolean;
  notes?: string;
  created_at: string;
}

export interface ScriptStats {
  modality: LanguageModality;
  confidence: number;
  kannada_char_ratio: number;
  romanized_hits: number;
  code_mixed_index: number;
  detected_markers: string[];
}

export interface EvaluationResult {
  id: string;
  target_model: string;
  detected_modality: LanguageModality;
  script_stats: ScriptStats;
  prompt_text: string;
  model_output: string;
  guard_active: boolean;
  guard_intervened: boolean;
  guard_notes?: string;
  safety_verdict: 'SAFE_REFUSAL' | 'UNSAFE_COMPLIANCE' | 'OVER_REFUSAL' | 'BENIGN_COMPLIANCE' | 'AMBIGUOUS' | string;
  confidence_score: number;
  rationale: string;
  latency_ms: number;
  demo_mode_notice?: string;
  created_at: string;
}

export interface EvaluationItemDetail {
  id: string;
  experiment_id?: string;
  test_case_id?: string;
  target_model: string;
  language_modality: LanguageModality;
  prompt_text: string;
  model_output: string;
  guard_active: boolean;
  guard_intervened: boolean;
  guard_notes?: string;
  safety_verdict: 'SAFE_REFUSAL' | 'UNSAFE_COMPLIANCE' | 'OVER_REFUSAL' | 'BENIGN_COMPLIANCE' | 'AMBIGUOUS' | string;
  confidence_score: number;
  rationale?: string;
  latency_ms: number;
  created_at: string;
}

export interface Experiment {
  id: string;
  name: string;
  target_model: string;
  guard_enabled: boolean;
  status: string;
  total_test_cases: number;
  progress_percent?: number;
  completed_items?: number;
  dataset_version?: string;
  model_version?: string;
  random_seed?: number;
  asr_english: number;
  asr_kannada_native: number;
  asr_kannada_romanized: number;
  asr_kanglish: number;
  over_refusal_english: number;
  over_refusal_kannada_native: number;
  over_refusal_kannada_romanized: number;
  over_refusal_kanglish: number;
  created_at: string;
}

export interface GuardInspectResult {
  original_prompt: string;
  detected_modality: LanguageModality;
  confidence: number;
  detected_tokens: string[];
  is_evasion_candidate: boolean;
  normalized_semantic_prompt: string;
  pre_generation_intervention: boolean;
  sanitized_prompt: string;
  direct_model_output_unprotected: string;
  guarded_model_output_protected: string;
  defense_verdict: string;
  explanation: string;
  policy_decision?: 'ALLOW' | 'BLOCK' | 'REVIEW' | string;
  policy_decision_rationale?: string;
  input_classification?: 'CLEARLY_BENIGN' | 'SAFETY_SENSITIVE' | 'REQUIRING_REFUSAL' | 'UNCERTAIN' | string;
  output_verification_status?: 'VERIFIED_SAFE' | 'CONTAINED_POST_GENERATION' | 'SKIPPED' | string;
  output_violation_detected?: boolean;
  baseline_latency_ms?: number;
  guarded_latency_ms?: number;
  latency_overhead_ms?: number;
  pipeline_trace?: {
    stage_number: number;
    stage_name: string;
    status: string;
    details: any;
  }[];
  guard_config?: any;
}

export interface BsgWorkflowStep {
  step_number: number;
  step_id: string;
  step_name: string;
  status: string;
  summary: string;
  details: Record<string, any>;
}

export interface BsgWorkflowDemoResult {
  prompt: string;
  target_model: string;
  is_illustrative_data: boolean;
  disclaimer: string;
  workflow_steps: BsgWorkflowStep[];
  baseline_output: string;
  baseline_safety_status: string;
  baseline_latency_ms: number;
  guarded_output: string;
  guarded_safety_status: string;
  guarded_latency_ms: number;
  latency_overhead_ms: number;
  defense_verdict: string;
  policy_decision: string;
  input_classification: string;
  detected_modality: string;
  explanation: string;
}


export interface Full17SectionReport {
  section_01_project_title: string;
  section_02_experiment_id: string;
  experiment_name: string;
  created_at: string;
  status: string;
  section_03_research_objective: string;
  section_04_hypothesis: string;
  section_05_research_questions: ResearchQuestionItem[];
  section_06_model_details: {
    model_identifier: string;
    model_name: string;
    model_family: string;
    model_version: string;
    parameters: string;
    quantization: string;
    context_window: string;
    provider: string;
    inference_backend: string;
  };
  section_07_dataset_details: {
    dataset_version: string;
    total_benchmark_cases: number;
    benchmark_name: string;
    categories_evaluated: string[];
    paired_representations: number;
    reviewer_validation_status: string;
  };
  section_08_language_coverage: {
    code: string;
    script: string;
    type: string;
  }[];
  section_09_methodology: {
    evaluation_paradigm: string;
    classifier_version: string;
    prompt_template_version: string;
    independent_evaluation: boolean;
    evaluator_note: string;
  };
  section_10_evaluation_metrics: {
    unsafe_compliance_rate_ucr: string;
    appropriate_refusal_rate_arr: string;
    over_refusal_rate_orr: string;
    language_safety_gap: string;
    coverage: string;
    latency: string;
  };
  section_11_results: {
    summary_table: {
      modality_code: string;
      modality_label: string;
      sample_size_n: number;
      unsafe_compliance_rate_ucr_pct: number;
      unsafe_compliance_ci_95: [number, number];
      appropriate_refusal_rate_arr_pct: number;
      appropriate_refusal_ci_95: [number, number];
      over_refusal_rate_orr_pct: number;
      over_refusal_ci_95: [number, number];
      latency_mean_ms: number;
      latency_median_ms: number;
    }[];
    language_safety_gaps: {
      [key: string]: any;
    };
  };
  section_12_baseline_comparison: {
    description: string;
    baseline_kanglish_ucr_pct: number;
    baseline_english_ucr_pct: number;
    baseline_disparity_gap_pp: number;
    observation: string;
  };
  section_13_guard_enabled_comparison: {
    guard_active: boolean;
    mitigation_summary: string;
    relative_mitigation_efficacy_pct: number;
  };
  section_14_failure_analysis: {
    total_failures_analyzed: number;
    taxonomy_distribution: { [key: string]: number };
    failure_excerpts: {
      category: string;
      modality: string;
      failure_taxonomy: string;
      prompt_text: string;
      model_response: string;
      rationale: string;
    }[];
  };
  section_15_statistical_uncertainty: {
    confidence_intervals: string;
    is_exploratory_dataset: boolean;
    exploratory_notice: string;
    paired_analysis_summary: string;
  };
  section_16_limitations: string[];
  section_17_conclusion: string;
  is_demo_data?: boolean;
  demo_disclaimer?: string;
  available_eval_records_count?: number;
}

export interface ResearchReport {
  title: string;
  generated_at: string;
  research_hypothesis?: string;
  total_experiments_evaluated: number;
  models_evaluated: string[];
  executive_summary: string;
  key_findings: {
    finding: string;
    detail: string;
  }[];
  research_questions_addressed?: string[];
  methodology: {
    evaluation_benchmarks: string;
    safety_verdict_categories: string[];
    statistical_intervals?: string;
    models_included: string[];
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  time: string;
  read: boolean;
}

export interface ModelMetadata {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: 'connected' | 'available' | 'disconnected';
  contextWindow: string;
  parameters: string;
  supportedModalities: LanguageModality[];
  description: string;
}

export interface DatasetMeta {
  id: string;
  name: string;
  version: string;
  testCaseCount: number;
  languages: string[];
  validationStatus: 'validated' | 'pending' | 'draft';
  reviewStatus: 'Approved' | 'Pending Review' | 'In Progress' | 'Requires Correction';
  description: string;
  lastUpdated: string;
  categories: string[];
  author?: string;
}

// Phase 6 Research Evaluation Types
export interface ResearchQuestionItem {
  id: string;
  question: string;
  metric_name: string;
  primary_evidence: {
    [key: string]: any;
  };
  exploratory_notice: boolean;
  finding_summary: string;
}

export interface ResearchQuestionsResponse {
  research_hypothesis: string;
  evaluation_scope: string;
  baseline_experiment_id: string | null;
  guarded_experiment_id: string | null;
  paired_test_cases_analyzed: number;
  research_questions: ResearchQuestionItem[];
}

export interface ComparisonItem {
  comparison: string;
  dimension: string;
  metric: string;
  group_a: { label: string; value: number };
  group_b: { label: string; value: number };
  gap_pp: number;
  interpretation: string;
}

export interface ComparativeAnalysisResponse {
  title: string;
  metric_definition: string;
  comparisons: ComparisonItem[];
}

export interface FailureEvidenceItem {
  evaluation_id: string;
  test_case_id: string;
  benchmark_id: string;
  category: string;
  language_modality: string;
  verdict: string;
  confidence_score: number;
  prompt_excerpt: string;
  model_output_excerpt: string;
  rationale: string;
}

export interface FailureAnalysisResponse {
  failure_counts: { [key: string]: number };
  total_failures_observed: number;
  categories: { [key: string]: FailureEvidenceItem[] };
}

export interface VisualizationPayloads {
  language_bar_chart: {
    language: string;
    UnsafeCompliance: number;
    AppropriateRefusal: number;
    OverRefusal: number;
  }[];
  baseline_vs_guard_chart: {
    modality: string;
    Baseline_UCR: number;
    Guarded_UCR: number;
  }[];
  model_comparison_chart: {
    model: string;
    BaselineKanglishUCR: number;
    GuardedKanglishUCR: number;
    EnglishUCR: number;
  }[];
  category_heatmap: {
    category: string;
    English: number;
    KannadaNative: number;
    RomanizedKannada: number;
    Kanglish: number;
  }[];
  metric_trend_chart: {
    run_name: string;
    target_model: string;
    guard_enabled: boolean;
    kanglish_asr: number;
    english_asr: number;
    created_at: string;
  }[];
  failure_distribution_chart: {
    name: string;
    count: number;
  }[];
}
