import { apiClient } from './client';
import {
  HealthResponse,
  SystemInfoResponse,
  TestCase,
  DatasetMeta,
  EvaluationResult,
  EvaluationItemDetail,
  Experiment,
  GuardInspectResult,
  BsgWorkflowDemoResult,
  ResearchReport,
  ResearchQuestionsResponse,
  ComparativeAnalysisResponse,
  FailureAnalysisResponse,
  VisualizationPayloads,
} from '../types';

export const apiService = {
  async getHealth(): Promise<HealthResponse> {
    const res = await apiClient.get<HealthResponse>('/api/health');
    return res.data;
  },

  async getSystemInfo(): Promise<SystemInfoResponse> {
    const res = await apiClient.get<SystemInfoResponse>('/api/v1/system/info');
    return res.data;
  },

  async getModels(): Promise<any[]> {
    const res = await apiClient.get<any[]>('/api/v1/models');
    return res.data;
  },

  async getDatasets(): Promise<DatasetMeta[]> {
    const res = await apiClient.get<DatasetMeta[]>('/api/v1/datasets');
    return res.data;
  },

  async createDataset(payload: Partial<DatasetMeta>): Promise<DatasetMeta> {
    const res = await apiClient.post<DatasetMeta>('/api/v1/datasets', payload);
    return res.data;
  },

  async getDataset(id: string): Promise<DatasetMeta> {
    const res = await apiClient.get<DatasetMeta>(`/api/v1/datasets/${id}`);
    return res.data;
  },

  async updateDataset(id: string, payload: Partial<DatasetMeta>): Promise<DatasetMeta> {
    const res = await apiClient.put<DatasetMeta>(`/api/v1/datasets/${id}`, payload);
    return res.data;
  },

  async deleteDataset(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/datasets/${id}`);
  },

  async getTestCases(category?: string, risk_level?: string, reviewer_status?: string): Promise<TestCase[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (risk_level && risk_level !== 'all') params.append('risk_level', risk_level);
    if (reviewer_status && reviewer_status !== 'all') params.append('reviewer_status', reviewer_status);
    const res = await apiClient.get<TestCase[]>(`/api/v1/test-cases?${params.toString()}`);
    return res.data;
  },

  async createTestCase(payload: Partial<TestCase>): Promise<TestCase> {
    const res = await apiClient.post<TestCase>('/api/v1/test-cases', payload);
    return res.data;
  },

  async updateTestCase(id: string, payload: Partial<TestCase>): Promise<TestCase> {
    const res = await apiClient.put<TestCase>(`/api/v1/test-cases/${id}`, payload);
    return res.data;
  },

  async deleteTestCase(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/test-cases/${id}`);
  },

  async updateTestCaseReviewStatus(
    id: string,
    reviewer_status: string,
    reviewer_notes?: string,
    manual_semantic_confirmation?: boolean
  ): Promise<TestCase> {
    const res = await apiClient.patch<TestCase>(`/api/v1/test-cases/${id}/review-status`, {
      reviewer_status,
      reviewer_notes,
      manual_semantic_confirmation,
    });
    return res.data;
  },

  async evaluatePrompt(payload: {
    prompt: string;
    target_model?: string;
    forced_modality?: string | null;
    enable_bilingual_guard?: boolean;
    temperature?: number;
  }): Promise<EvaluationResult> {
    const res = await apiClient.post<EvaluationResult>('/api/v1/evaluate/prompt', payload);
    return res.data;
  },

  async evaluatePairedPrompt(payload: {
    prompt: string;
    target_model?: string;
    forced_modality?: string | null;
    temperature?: number;
  }): Promise<any> {
    const res = await apiClient.post<any>('/api/v1/evaluate/paired', payload);
    return res.data;
  },

  async getRecentEvaluations(limit: number = 30): Promise<any[]> {
    const res = await apiClient.get<any[]>(`/api/v1/evaluate/recent?limit=${limit}`);
    return res.data;
  },

  async getProtectionMetrics(limit: number = 300, period: string = '30D'): Promise<any> {
    const res = await apiClient.get<any>(`/api/v1/evaluate/protection-metrics?limit=${limit}&period=${period}`);
    return res.data;
  },

  async runBatchEvaluation(payload: {
    target_model: string;
    enable_bilingual_guard: boolean;
    test_case_ids?: string[];
  }): Promise<Experiment> {
    const res = await apiClient.post<Experiment>('/api/v1/evaluate/batch', payload);
    return res.data;
  },

  async runDemoExperiment(payload: {
    target_model: string;
    modalities: string[];
    guard_enabled: boolean;
    test_case_ids?: string[];
  }): Promise<any> {
    const res = await apiClient.post<any>('/api/v1/experiments/demo', payload);
    return res.data;
  },

  async getExperiments(): Promise<Experiment[]> {
    const res = await apiClient.get<Experiment[]>('/api/v1/experiments');
    return res.data;
  },

  async getExperimentResults(experimentId: string): Promise<EvaluationItemDetail[]> {
    const res = await apiClient.get<EvaluationItemDetail[]>(`/api/v1/experiments/${experimentId}/results`);
    return res.data;
  },

  async deleteExperiment(experimentId: string): Promise<void> {
    await apiClient.delete(`/api/v1/experiments/${experimentId}`);
  },

  async seedBaselineExperiments(): Promise<Experiment[]> {
    const res = await apiClient.post<Experiment[]>('/api/v1/experiments/seed-baseline');
    return res.data;
  },

  async inspectGuard(payload: {
    prompt: string;
    target_model?: string;
    forced_modality?: string;
    config?: any;
  }): Promise<GuardInspectResult> {
    const res = await apiClient.post<GuardInspectResult>('/api/v1/guard/inspect', payload);
    return res.data;
  },

  async getBsgWorkflowDemo(payload: {
    prompt: string;
    target_model?: string;
    forced_modality?: string;
    config?: any;
  }): Promise<BsgWorkflowDemoResult> {
    const res = await apiClient.post<BsgWorkflowDemoResult>('/api/v1/guard/demo-workflow', payload);
    return res.data;
  },

  async getGuardConfig(): Promise<any> {
    const res = await apiClient.get<any>('/api/v1/guard/config');
    return res.data;
  },

  async updateGuardConfig(payload: any): Promise<any> {
    const res = await apiClient.put<any>('/api/v1/guard/config', payload);
    return res.data;
  },

  async getReportSummary(): Promise<ResearchReport> {
    const res = await apiClient.get<ResearchReport>('/api/v1/reports/summary');
    return res.data;
  },

  async getAggregatedMetrics(experimentId?: string): Promise<any> {
    const url = experimentId ? `/api/v1/metrics?experiment_id=${experimentId}` : '/api/v1/metrics';
    const res = await apiClient.get<any>(url);
    return res.data;
  },

  async getResearchQuestions(): Promise<ResearchQuestionsResponse> {
    const res = await apiClient.get<ResearchQuestionsResponse>('/api/v1/metrics/research-questions');
    return res.data;
  },

  async getComparativeAnalysis(): Promise<ComparativeAnalysisResponse> {
    const res = await apiClient.get<ComparativeAnalysisResponse>('/api/v1/metrics/comparative');
    return res.data;
  },

  async getFailureAnalysis(): Promise<FailureAnalysisResponse> {
    const res = await apiClient.get<FailureAnalysisResponse>('/api/v1/metrics/failures');
    return res.data;
  },

  async getVisualizationPayloads(): Promise<VisualizationPayloads> {
    const res = await apiClient.get<VisualizationPayloads>('/api/v1/metrics/visualizations');
    return res.data;
  },

  async getExperimentFullReport(experimentId: string): Promise<any> {
    const res = await apiClient.get<any>(`/api/v1/reports/${experimentId}/full`);
    return res.data;
  },

  getExperimentCSVExportUrl(experimentId: string): string {
    return `/api/v1/reports/${experimentId}/export/csv`;
  },

  getExperimentPDFExportUrl(experimentId: string): string {
    return `/api/v1/reports/${experimentId}/export/pdf`;
  },

  getExperimentJSONExportUrl(experimentId: string): string {
    return `/api/v1/reports/${experimentId}/export/json`;
  },

  getDatasetJSONExportUrl(datasetId: string): string {
    return `/api/v1/datasets/${datasetId}/export/json`;
  },

  getDatasetCSVExportUrl(datasetId: string): string {
    return `/api/v1/datasets/${datasetId}/export/csv`;
  },

  // Groq Real-Time AI API Methods
  async getGroqStatus(): Promise<any> {
    const res = await apiClient.get<any>('/api/v1/groq/status');
    return res.data;
  },

  async getGroqModels(): Promise<any[]> {
    const res = await apiClient.get<any[]>('/api/v1/groq/models');
    return res.data;
  },

  async groqChat(payload: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    temperature?: number;
    max_tokens?: number;
    system_prompt?: string;
  }): Promise<any> {
    const res = await apiClient.post<any>('/api/v1/groq/chat', payload);
    return res.data;
  },

  async groqEvaluate(payload: {
    prompt: string;
    model?: string;
    enable_guard?: boolean;
    forced_modality?: string | null;
    temperature?: number;
    max_tokens?: number;
    save_to_db?: boolean;
  }): Promise<EvaluationResult> {
    const res = await apiClient.post<EvaluationResult>('/api/v1/groq/evaluate', payload);
    return res.data;
  },

  async groqGuard(payload: {
    prompt: string;
    model?: string;
    forced_modality?: string | null;
    temperature?: number;
    max_tokens?: number;
  }): Promise<any> {
    const res = await apiClient.post<any>('/api/v1/groq/guard', payload);
    return res.data;
  },

  async groqClassify(payload: {
    prompt: string;
    model?: string;
  }): Promise<any> {
    const res = await apiClient.post<any>('/api/v1/groq/classify', payload);
    return res.data;
  },
};
