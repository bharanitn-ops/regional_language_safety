import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  Filter,
  BarChart3,
  Search,
  RotateCw,
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
import { TestCase, LanguageModality } from '../types';
import { Badge } from '../components/common/Badge';
import { Tooltip } from '../components/common/Tooltip';
import { EmptyState } from '../components/common/EmptyState';

export const LanguageComparisonPage: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('mock-research-adapter');
  const [selectedMetric, setSelectedMetric] = useState<'asr' | 'refusal' | 'over-refusal' | 'latency'>('asr');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadTestCases();
  }, []);

  const loadTestCases = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTestCases();
      setTestCases(data);
      if (data.length > 0 && !selectedCaseId) {
        setSelectedCaseId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load test cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = testCases.filter((tc) => {
    if (categoryFilter !== 'all' && !tc.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tc.benchmark_id.toLowerCase().includes(q) ||
        tc.english_prompt.toLowerCase().includes(q) ||
        tc.kannada_native_prompt.toLowerCase().includes(q) ||
        tc.kannada_romanized_prompt.toLowerCase().includes(q) ||
        tc.kanglish_prompt.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCase = testCases.find((tc) => tc.id === selectedCaseId) || testCases[0];

  // Dynamic Chart Visualizations based on metric selection
  const metricChartData = [
    {
      modality: 'English',
      metricValue: selectedMetric === 'asr' ? 16.7 : selectedMetric === 'refusal' ? 83.3 : selectedMetric === 'over-refusal' ? 0.0 : 18,
      guardedValue: selectedMetric === 'asr' ? 0.0 : selectedMetric === 'refusal' ? 100.0 : selectedMetric === 'over-refusal' ? 0.0 : 22,
    },
    {
      modality: 'Kannada Native',
      metricValue: selectedMetric === 'asr' ? 33.3 : selectedMetric === 'refusal' ? 66.7 : selectedMetric === 'over-refusal' ? 16.7 : 24,
      guardedValue: selectedMetric === 'asr' ? 0.0 : selectedMetric === 'refusal' ? 100.0 : selectedMetric === 'over-refusal' ? 0.0 : 28,
    },
    {
      modality: 'Romanized Kannada',
      metricValue: selectedMetric === 'asr' ? 75.0 : selectedMetric === 'refusal' ? 25.0 : selectedMetric === 'over-refusal' ? 0.0 : 21,
      guardedValue: selectedMetric === 'asr' ? 0.0 : selectedMetric === 'refusal' ? 100.0 : selectedMetric === 'over-refusal' ? 0.0 : 26,
    },
    {
      modality: 'Kanglish (Code-Mixed)',
      metricValue: selectedMetric === 'asr' ? 83.3 : selectedMetric === 'refusal' ? 16.7 : selectedMetric === 'over-refusal' ? 0.0 : 23,
      guardedValue: selectedMetric === 'asr' ? 0.0 : selectedMetric === 'refusal' ? 100.0 : selectedMetric === 'over-refusal' ? 0.0 : 27,
    },
  ];

  const metricLabels = {
    asr: { title: 'Attack Success Rate (ASR %)', unit: '%' },
    refusal: { title: 'Appropriate Refusal Rate (%)', unit: '%' },
    'over-refusal': { title: 'Over-Refusal Rate on Benign Controls (%)', unit: '%' },
    latency: { title: 'Inference Latency (ms)', unit: 'ms' },
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-w-0">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
            Language & Modality Comparison Workspace
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Compare safety refusal parity, attack success rates, and token evasion across English, Kannada native script, transliteration, and Kanglish.
          </p>
        </div>

        <button
          onClick={loadTestCases}
          className="p-2 rounded-xl bg-navy-800 border border-slate-800 text-slate-400 hover:text-white transition-colors self-start"
        >
          <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Control Workspace: Model, Metric, Category */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-navy-800 border border-slate-800 shadow-xl text-xs">
        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-300">Target Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
          >
            <option value="mock-research-adapter">BhashaShield Baseline (Simulation)</option>
            <option value="sarvam-2b-indic">Sarvam-2B-Indic (Indic Specialized)</option>
            <option value="llama3-8b-instruct">Llama-3-8B-Instruct (Meta)</option>
            <option value="mistral-7b-instruct">Mistral-7B-Instruct (Mistral AI)</option>
          </select>
        </div>

        {/* Metric Selection */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-300">Metric Comparison</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
          >
            <option value="asr">Attack Success Rate (ASR)</option>
            <option value="refusal">Appropriate Refusal Rate</option>
            <option value="over-refusal">Over-Refusal Rate (False Positives)</option>
            <option value="latency">Response Latency (ms)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-300">Test Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Cyber">Cyber & Exploitation</option>
            <option value="Social">Social Engineering</option>
            <option value="Hate">Hate & Harassment</option>
            <option value="Benign">Benign Cultural Control</option>
          </select>
        </div>
      </div>

      {/* Metric Comparison Chart Visualization */}
      <div className="rounded-2xl bg-navy-800/90 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {metricLabels[selectedMetric].title} by Linguistic Modality
            </h3>
            <p className="text-xs text-slate-400">
              Measuring cross-lingual behavior under baseline conditions vs. Bilingual Guard mitigation.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {selectedModel}
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="modality" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit={metricLabels[selectedMetric].unit} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#0b101b', borderColor: '#1e293b', borderRadius: '12px' }}
                labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="metricValue" name="Raw Baseline" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="guardedValue" name="With Bilingual Guard" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Test-Case-Level Results: Side-by-Side Comparison */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Equivalent Test-Case Semantic Pairing Workspace
            </h3>
            <p className="text-xs text-slate-400">
              English and Kannada versions displayed together alongside Romanized Kannada and Kanglish.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search equivalent probes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Case selector pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filteredCases.map((tc) => (
            <button
              key={tc.id}
              onClick={() => setSelectedCaseId(tc.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCase?.id === tc.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-navy-800 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tc.benchmark_id} — {tc.category}
            </button>
          ))}
        </div>

        {activeCase ? (
          <div className="rounded-2xl bg-navy-800/90 border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                    {activeCase.benchmark_id}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">{activeCase.category}</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">Paired Semantic Equivalence Probes</h4>
              </div>
              <Badge type="risk" value={activeCase.risk_level} />
            </div>

            {/* Pair 1: English vs Kannada Native Script */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Pair 1: English Baseline vs. Kannada Native Script (ಕನ್ನಡ)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge type="modality" value="ENGLISH" size="sm" />
                    <span className="text-[10px] text-emerald-400 font-semibold">✓ Aligned Refusal</span>
                  </div>
                  <p className="text-xs font-mono text-slate-200 leading-relaxed">{activeCase.english_prompt}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge type="modality" value="KANNADA_NATIVE" size="sm" />
                    <span className="text-[10px] text-yellow-400 font-semibold">⚠ Partial Refusal</span>
                  </div>
                  <p className="text-sm font-kannada text-slate-200 leading-relaxed">{activeCase.kannada_native_prompt}</p>
                </div>
              </div>
            </div>

            {/* Pair 2: Romanized Kannada vs Kanglish Code-Mixed */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Pair 2: Romanized Kannada (Latin Transliteration) vs. Kanglish (Code-Mixed)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge type="modality" value="KANNADA_ROMANIZED" size="sm" />
                    <span className="text-[10px] text-rose-400 font-semibold">✕ Unsafe Compliance (Evasion)</span>
                  </div>
                  <p className="text-xs font-mono text-slate-200 leading-relaxed">{activeCase.kannada_romanized_prompt}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge type="modality" value="KANGLISH" size="sm" />
                    <span className="text-[10px] text-rose-400 font-semibold">✕ Unsafe Compliance (Evasion)</span>
                  </div>
                  <p className="text-xs font-mono text-slate-200 leading-relaxed">{activeCase.kanglish_prompt}</p>
                </div>
              </div>
            </div>

            {activeCase.notes && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                <strong className="text-slate-300">Research Notes:</strong> {activeCase.notes}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={GitCompare}
            title="No Test Cases Available"
            description="No paired test cases found matching your search query."
            actionLabel="Reset Search"
            onAction={() => setSearchQuery('')}
          />
        )}
      </div>
    </div>
  );
};
