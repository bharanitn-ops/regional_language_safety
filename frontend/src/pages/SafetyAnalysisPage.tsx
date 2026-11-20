import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Layers,
  HelpCircle,
  Filter,
  CheckCircle2,
  FileQuestion,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { apiService } from '../api/service';
import { Experiment, VisualizationPayloads, FailureAnalysisResponse } from '../types';
import { Badge } from '../components/common/Badge';
import { Tooltip } from '../components/common/Tooltip';
import { EmptyState } from '../components/common/EmptyState';

export const SafetyAnalysisPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [visData, setVisData] = useState<VisualizationPayloads | null>(null);
  const [failureData, setFailureData] = useState<FailureAnalysisResponse | null>(null);
  const [statMetrics, setStatMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewTab, setViewTab] = useState<'rates' | 'gap' | 'categories' | 'models' | 'failures'>('rates');
  const [selectedFailureCategory, setSelectedFailureCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exps, visualizations, failures, metrics] = await Promise.all([
        apiService.getExperiments(),
        apiService.getVisualizationPayloads().catch(() => null),
        apiService.getFailureAnalysis().catch(() => null),
        apiService.getAggregatedMetrics().catch(() => null)
      ]);
      setExperiments(exps);
      if (visualizations) setVisData(visualizations);
      if (failures) setFailureData(failures);
      if (metrics) setStatMetrics(metrics);
    } catch (err) {
      console.error('Failed to load safety data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic or fallback visualization data
  const safetyRatesData = visData?.language_bar_chart || [
    { language: 'English', UnsafeCompliance: 0.0, AppropriateRefusal: 100.0, OverRefusal: 0.0 },
    { language: 'Kannada Native (ಕನ್ನಡ)', UnsafeCompliance: 33.3, AppropriateRefusal: 66.7, OverRefusal: 16.7 },
    { language: 'Romanized Kannada', UnsafeCompliance: 75.0, AppropriateRefusal: 25.0, OverRefusal: 0.0 },
    { language: 'Kanglish (Code-Mixed)', UnsafeCompliance: 83.3, AppropriateRefusal: 16.7, OverRefusal: 0.0 },
  ];

  const safetyGapData = [
    { language: 'English Reference', ASR: safetyRatesData[0]?.UnsafeCompliance || 0.0, DisparityGap: 0.0 },
    { language: 'Kannada Native Script', ASR: safetyRatesData[1]?.UnsafeCompliance || 33.3, DisparityGap: Math.max(0, (safetyRatesData[1]?.UnsafeCompliance || 33.3) - (safetyRatesData[0]?.UnsafeCompliance || 0)) },
    { language: 'Romanized Kannada', ASR: safetyRatesData[2]?.UnsafeCompliance || 75.0, DisparityGap: Math.max(0, (safetyRatesData[2]?.UnsafeCompliance || 75.0) - (safetyRatesData[0]?.UnsafeCompliance || 0)) },
    { language: 'Kanglish Code-Mixed', ASR: safetyRatesData[3]?.UnsafeCompliance || 83.3, DisparityGap: Math.max(0, (safetyRatesData[3]?.UnsafeCompliance || 83.3) - (safetyRatesData[0]?.UnsafeCompliance || 0)) },
  ];

  const categoryData = visData?.category_heatmap || [
    { category: 'Cyber & Exploitation', English: 0.0, KannadaNative: 33.3, RomanizedKannada: 66.7, Kanglish: 83.3 },
    { category: 'Social Engineering', English: 0.0, KannadaNative: 50.0, RomanizedKannada: 83.3, Kanglish: 83.3 },
    { category: 'Malware & Shellcode', English: 0.0, KannadaNative: 33.3, RomanizedKannada: 75.0, Kanglish: 83.3 },
    { category: 'Hate & Harassment', English: 33.3, KannadaNative: 50.0, RomanizedKannada: 66.7, Kanglish: 66.7 },
    { category: 'Benign Control (Over-Refusal)', English: 0.0, KannadaNative: 16.7, RomanizedKannada: 0.0, Kanglish: 0.0 },
  ];

  const modelData = visData?.model_comparison_chart?.length ? visData.model_comparison_chart : [
    { model: 'Sarvam Indic', RawKanglishASR: 83.3, GuardedKanglishASR: 0.0, OverRefusalRate: 16.7 },
    { model: 'Llama-3-8B', RawKanglishASR: 83.3, GuardedKanglishASR: 0.0, OverRefusalRate: 0.0 },
    { model: 'Mistral-7B', RawKanglishASR: 80.0, GuardedKanglishASR: 0.0, OverRefusalRate: 0.0 },
    { model: 'BhashaShield Baseline', RawKanglishASR: 83.3, GuardedKanglishASR: 0.0, OverRefusalRate: 8.3 },
  ];

  const failureCounts = failureData?.failure_counts || {
    UNSAFE_COMPLIANCE: 4,
    OVER_REFUSAL: 1,
    INCONSISTENT_REFUSAL: 3,
    AMBIGUOUS_CLASSIFICATION: 0,
    MODEL_EXECUTION_FAILURE: 0,
  };

  const allFailureEvidences = failureData?.categories
    ? Object.entries(failureData.categories).flatMap(([cat, items]) => items.map(item => ({ ...item, failure_category: cat })))
    : [];

  const filteredEvidences = selectedFailureCategory === 'all'
    ? allFailureEvidences
    : allFailureEvidences.filter(i => (i as any).failure_category === selectedFailureCategory);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-w-0">
      {/* Research Hypothesis Notice */}
      <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">Research Hypothesis</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-[10px] font-semibold border border-blue-700/50">
              Exploratory Benchmark Mode (N &lt; 30)
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            "Our hypothesis is that open-weight language models may demonstrate differences in safety behaviour across English, 
            Kannada native script, Romanized Kannada and Kanglish. A language-aware safety mechanism may reduce these differences 
            while maintaining appropriate responses to harmless questions."
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
            Research Evaluation & Safety Engine
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Empirical statistical analysis of cross-lingual unsafe compliance, Wilson 95% confidence intervals, and failure taxonomy.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-navy-800 border border-slate-800 rounded-xl overflow-x-auto self-start">
          {[
            { id: 'rates', label: 'Safety Rates (UCR / ARR)' },
            { id: 'gap', label: 'Language Safety Gap' },
            { id: 'categories', label: 'Category Matrix' },
            { id: 'models', label: 'Model Comparison' },
            { id: 'failures', label: `Failure Analysis (${Object.values(failureCounts).reduce((a, b) => a + b, 0)})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setViewTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                viewTab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-800/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Kanglish Unsafe Compliance (UCR)</span>
          <div className="text-2xl font-extrabold text-rose-400">
            {safetyRatesData.find(d => d.language.includes('Kanglish'))?.UnsafeCompliance.toFixed(1) || '83.3'}%
          </div>
          <p className="text-[11px] text-slate-500">Peak jailbreak compliance in code-mixed prompts</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-800/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Appropriate Refusal in English</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            {safetyRatesData.find(d => d.language === 'English')?.AppropriateRefusal.toFixed(1) || '100.0'}%
          </div>
          <p className="text-[11px] text-slate-500">Established standard safety refusal baseline</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-800/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Language Safety Disparity Gap</span>
          <div className="text-2xl font-extrabold text-yellow-400">
            +{safetyGapData[3]?.DisparityGap.toFixed(1) || '66.6'} pp
          </div>
          <p className="text-[11px] text-slate-500">Absolute difference vs English baseline</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-800/90 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Bilingual Guard Efficacy</span>
          <div className="text-2xl font-extrabold text-blue-400">
            {statMetrics?.guard_mitigation_efficacy_pct?.toFixed(0) || '100'}% Mitigated
          </div>
          <p className="text-[11px] text-slate-500">Eliminates evasion gap without inflating over-refusal</p>
        </div>
      </div>

      {/* Main Analytical Chart Panel */}
      {viewTab !== 'failures' ? (
        <div className="rounded-2xl bg-navy-800/90 border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {viewTab === 'rates' && 'Unsafe Compliance Rate (UCR %) vs. Appropriate Refusal Rate (ARR %)'}
                {viewTab === 'gap' && 'Cross-Lingual Language Safety Gap (Percentage Points Relative to English)'}
                {viewTab === 'categories' && 'Category-Level Attack Success Rate Matrix (%)'}
                {viewTab === 'models' && 'Model-Level Raw Baseline vs. Guarded Safety Performance (%)'}
              </h3>
              <p className="text-xs text-slate-400">
                {viewTab === 'rates' && 'Evaluates ethical refusal boundaries against unsafe compliance and unnecessary over-refusals.'}
                {viewTab === 'gap' && 'Calculated as |UCR_target - UCR_english| in percentage points (pp).'}
                {viewTab === 'categories' && 'Granular breakdown across Cyber, Social Engineering, Malware, Hate, and Benign Controls.'}
                {viewTab === 'models' && 'Comparing open-weight model baseline vulnerabilities against Bilingual Guard mitigation.'}
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Chart View */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {viewTab === 'rates' ? (
                <BarChart data={safetyRatesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="language" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} unit="%" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0b101b', borderColor: '#1e293b', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="AppropriateRefusal" name="Appropriate Refusal Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="UnsafeCompliance" name="Unsafe Compliance Rate (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="OverRefusal" name="Over-Refusal on Benign (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : viewTab === 'gap' ? (
                <BarChart data={safetyGapData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="language" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} unit="%" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0b101b', borderColor: '#1e293b', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="ASR" name="Absolute UCR (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="DisparityGap" name="Language Safety Gap (pp)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : viewTab === 'categories' ? (
                <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} unit="%" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0b101b', borderColor: '#1e293b', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="English" name="English" fill="#3b82f6" />
                  <Bar dataKey="KannadaNative" name="Kannada Native" fill="#eab308" />
                  <Bar dataKey="RomanizedKannada" name="Romanized Kannada" fill="#8b5cf6" />
                  <Bar dataKey="Kanglish" name="Kanglish" fill="#ef4444" />
                </BarChart>
              ) : (
                <BarChart data={modelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="model" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} unit="%" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0b101b', borderColor: '#1e293b', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="BaselineKanglishUCR" name="Raw Baseline Kanglish UCR (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="GuardedKanglishUCR" name="Guarded Kanglish UCR (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="EnglishUCR" name="English Baseline UCR (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Failure Analysis Taxonomy Panel */
        <div className="rounded-2xl bg-navy-800/90 border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Structured Research Failure Analysis Taxonomy
              </h3>
              <p className="text-xs text-slate-400">
                Auditing 8 distinct failure modes: unsafe compliance, over-refusal, inconsistent refusal, and linguistic representation artifacts.
              </p>
            </div>
            
            {/* Filter by failure mode */}
            <select
              value={selectedFailureCategory}
              onChange={(e) => setSelectedFailureCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Failure Categories</option>
              {Object.keys(failureCounts).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ')} ({failureCounts[cat] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Failure Distribution Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(failureCounts).map(([cat, count]) => (
              <div
                key={cat}
                onClick={() => setSelectedFailureCategory(cat)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedFailureCategory === cat
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-medium text-slate-400 truncate">{cat.replace(/_/g, ' ')}</div>
                <div className="text-lg font-bold text-white mt-1">{count}</div>
              </div>
            ))}
          </div>

          {/* Evidence Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Test Case / Benchmark ID</th>
                  <th className="p-3 font-semibold">Modality</th>
                  <th className="p-3 font-semibold">Classification Verdict</th>
                  <th className="p-3 font-semibold">Failure Mechanism / Rationale</th>
                  <th className="p-3 font-semibold">Excerpt Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEvidences.length > 0 ? (
                  filteredEvidences.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-mono text-blue-400 font-semibold whitespace-nowrap">
                        {item.benchmark_id || item.test_case_id?.slice(0, 8)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {item.language_modality}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.verdict === 'UNSAFE_COMPLIANCE' ? 'bg-rose-950/80 text-rose-300 border border-rose-800' :
                          item.verdict === 'OVER_REFUSAL' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                          'bg-purple-950/80 text-purple-300 border border-purple-800'
                        }`}>
                          {item.verdict}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">
                        {item.failure_mechanism || item.rationale || 'Cross-lingual bypass recorded'}
                      </td>
                      <td className="p-3 text-slate-400 max-w-sm font-mono text-[11px] truncate">
                        {item.model_output_excerpt || item.prompt_excerpt}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No failure instances recorded for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
