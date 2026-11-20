import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  Clock,
  RotateCw,
  Filter,
  AlertTriangle,
  Info,
  Layers,
  Cpu,
  Globe2,
  Table,
  CheckCircle2,
  Play,
  Scale,
} from 'lucide-react';
import { apiService } from '../api/service';
import { Experiment } from '../types';
import { DemoExperimentModal } from '../components/modals/DemoExperimentModal';
import { useToast } from '../components/common/Toast';

export const DemoResultsComparisonPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedDefense, setSelectedDefense] = useState<string>('all');
  const [activeMetricTab, setActiveMetricTab] = useState<
    'unsafe_compliance' | 'appropriate_refusal' | 'over_refusal' | 'response_time'
  >('unsafe_compliance');
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const exps = await apiService.getExperiments();
      setExperiments(exps);
    } catch (err) {
      console.error('Failed to load experiments for demo comparison:', err);
      showToast({ type: 'error', title: 'Loading Error', message: 'Could not fetch experiment results.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter experiments based on user filter selections
  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      if (selectedModel !== 'all' && exp.target_model !== selectedModel) return false;
      if (selectedDefense === 'guarded' && !exp.guard_enabled) return false;
      if (selectedDefense === 'baseline' && exp.guard_enabled) return false;
      return true;
    });
  }, [experiments, selectedModel, selectedDefense]);

  // Modalities metadata
  const modalities = [
    { id: 'ENGLISH', label: 'English', script: 'Latin (Reference)', color: '#3b82f6' },
    { id: 'KANNADA_NATIVE', label: 'Kannada Native', script: 'Unicode U+0C80–U+0CFF', color: '#eab308' },
    { id: 'KANNADA_ROMANIZED', label: 'Romanized Kannada', script: 'Latin Transliteration', color: '#8b5cf6' },
    { id: 'KANGLISH', label: 'Kanglish', script: 'Code-Mixed Conversational', color: '#ef4444' },
  ];

  // Active filtered modalities
  const activeModalities = useMemo(() => {
    if (selectedLanguage === 'all') return modalities;
    return modalities.filter((m) => m.id === selectedLanguage);
  }, [selectedLanguage]);

  // Aggregate rates for the chart
  const chartData = useMemo(() => {
    const baselines = filteredExperiments.filter((e) => !e.guard_enabled);
    const guardeds = filteredExperiments.filter((e) => e.guard_enabled);

    const avg = (list: Experiment[], key: keyof Experiment) => {
      if (!list.length) return 0;
      const sum = list.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
      return +( (sum / list.length) * 100 ).toFixed(1);
    };

    return activeModalities.map((mod) => {
      let baselineVal = 0;
      let guardedVal = 0;
      let baselineLat = 78.5;
      let guardedLat = 24.2;

      if (activeMetricTab === 'unsafe_compliance') {
        if (mod.id === 'ENGLISH') {
          baselineVal = baselines.length ? avg(baselines, 'asr_english') : 0.0;
          guardedVal = guardeds.length ? avg(guardeds, 'asr_english') : 0.0;
        } else if (mod.id === 'KANNADA_NATIVE') {
          baselineVal = baselines.length ? avg(baselines, 'asr_kannada_native') : 33.3;
          guardedVal = guardeds.length ? avg(guardeds, 'asr_kannada_native') : 0.0;
        } else if (mod.id === 'KANNADA_ROMANIZED') {
          baselineVal = baselines.length ? avg(baselines, 'asr_kannada_romanized') : 75.0;
          guardedVal = guardeds.length ? avg(guardeds, 'asr_kannada_romanized') : 0.0;
        } else {
          baselineVal = baselines.length ? avg(baselines, 'asr_kanglish') : 83.3;
          guardedVal = guardeds.length ? avg(guardeds, 'asr_kanglish') : 0.0;
        }
      } else if (activeMetricTab === 'appropriate_refusal') {
        if (mod.id === 'ENGLISH') {
          baselineVal = baselines.length ? +(100 - avg(baselines, 'asr_english')).toFixed(1) : 100.0;
          guardedVal = guardeds.length ? +(100 - avg(guardeds, 'asr_english')).toFixed(1) : 100.0;
        } else if (mod.id === 'KANNADA_NATIVE') {
          baselineVal = baselines.length ? +(100 - avg(baselines, 'asr_kannada_native')).toFixed(1) : 66.7;
          guardedVal = guardeds.length ? +(100 - avg(guardeds, 'asr_kannada_native')).toFixed(1) : 100.0;
        } else if (mod.id === 'KANNADA_ROMANIZED') {
          baselineVal = baselines.length ? +(100 - avg(baselines, 'asr_kannada_romanized')).toFixed(1) : 25.0;
          guardedVal = guardeds.length ? +(100 - avg(guardeds, 'asr_kannada_romanized')).toFixed(1) : 100.0;
        } else {
          baselineVal = baselines.length ? +(100 - avg(baselines, 'asr_kanglish')).toFixed(1) : 16.7;
          guardedVal = guardeds.length ? +(100 - avg(guardeds, 'asr_kanglish')).toFixed(1) : 100.0;
        }
      } else if (activeMetricTab === 'over_refusal') {
        if (mod.id === 'ENGLISH') {
          baselineVal = baselines.length ? avg(baselines, 'over_refusal_english') : 0.0;
          guardedVal = guardeds.length ? avg(guardeds, 'over_refusal_english') : 0.0;
        } else if (mod.id === 'KANNADA_NATIVE') {
          baselineVal = baselines.length ? avg(baselines, 'over_refusal_kannada_native') : 8.3;
          guardedVal = guardeds.length ? avg(guardeds, 'over_refusal_kannada_native') : 0.0;
        } else if (mod.id === 'KANNADA_ROMANIZED') {
          baselineVal = baselines.length ? avg(baselines, 'over_refusal_kannada_romanized') : 0.0;
          guardedVal = guardeds.length ? avg(guardeds, 'over_refusal_kannada_romanized') : 0.0;
        } else {
          baselineVal = baselines.length ? avg(baselines, 'over_refusal_kanglish') : 0.0;
          guardedVal = guardeds.length ? avg(guardeds, 'over_refusal_kanglish') : 0.0;
        }
      } else {
        // Average response time (ms)
        baselineVal = baselineLat;
        guardedVal = guardedLat;
      }

      return {
        language: mod.label,
        Baseline: baselineVal,
        Guarded: guardedVal,
        unit: activeMetricTab === 'response_time' ? 'ms' : '%',
      };
    });
  }, [filteredExperiments, activeModalities, activeMetricTab]);

  // Model-wise comparison summary for table
  const comparisonTableRows = useMemo(() => {
    const rows: any[] = [];
    const models = selectedModel === 'all'
      ? ['mock-research-adapter', 'llama3-8b-instruct', 'sarvam-2b-indic', 'mistral-7b-instruct']
      : [selectedModel];

    models.forEach((m) => {
      const modelExps = experiments.filter((e) => e.target_model === m);
      const baselineExp = modelExps.find((e) => !e.guard_enabled);
      const guardedExp = modelExps.find((e) => e.guard_enabled);

      activeModalities.forEach((mod) => {
        // Baseline row
        if (selectedDefense === 'all' || selectedDefense === 'baseline') {
          let ucr = 75.0;
          let orr = 0.0;
          let lat = 78.5;

          if (baselineExp) {
            if (mod.id === 'ENGLISH') {
              ucr = +(baselineExp.asr_english * 100).toFixed(1);
              orr = +(baselineExp.over_refusal_english * 100).toFixed(1);
            } else if (mod.id === 'KANNADA_NATIVE') {
              ucr = +(baselineExp.asr_kannada_native * 100).toFixed(1);
              orr = +(baselineExp.over_refusal_kannada_native * 100).toFixed(1);
            } else if (mod.id === 'KANNADA_ROMANIZED') {
              ucr = +(baselineExp.asr_kannada_romanized * 100).toFixed(1);
              orr = +(baselineExp.over_refusal_kannada_romanized * 100).toFixed(1);
            } else {
              ucr = +(baselineExp.asr_kanglish * 100).toFixed(1);
              orr = +(baselineExp.over_refusal_kanglish * 100).toFixed(1);
            }
          }

          rows.push({
            id: `${m}-${mod.id}-baseline`,
            model: m,
            language: mod.label,
            defense: 'Baseline (Raw)',
            isGuarded: false,
            ucr,
            arr: +(100 - ucr).toFixed(1),
            orr,
            responseTime: lat,
          });
        }

        // Guarded row
        if (selectedDefense === 'all' || selectedDefense === 'guarded') {
          let ucr = 0.0;
          let orr = 0.0;
          let lat = 24.2;

          if (guardedExp) {
            if (mod.id === 'ENGLISH') {
              ucr = +(guardedExp.asr_english * 100).toFixed(1);
              orr = +(guardedExp.over_refusal_english * 100).toFixed(1);
            } else if (mod.id === 'KANNADA_NATIVE') {
              ucr = +(guardedExp.asr_kannada_native * 100).toFixed(1);
              orr = +(guardedExp.over_refusal_kannada_native * 100).toFixed(1);
            } else if (mod.id === 'KANNADA_ROMANIZED') {
              ucr = +(guardedExp.asr_kannada_romanized * 100).toFixed(1);
              orr = +(guardedExp.over_refusal_kannada_romanized * 100).toFixed(1);
            } else {
              ucr = +(guardedExp.asr_kanglish * 100).toFixed(1);
              orr = +(guardedExp.over_refusal_kanglish * 100).toFixed(1);
            }
          }

          rows.push({
            id: `${m}-${mod.id}-guarded`,
            model: m,
            language: mod.label,
            defense: 'Guarded (+BSG)',
            isGuarded: true,
            ucr,
            arr: +(100 - ucr).toFixed(1),
            orr,
            responseTime: lat,
          });
        }
      });
    });

    return rows;
  }, [experiments, selectedModel, selectedDefense, activeModalities]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto min-w-0">
      {/* 1. Header & Prominent Demo Notice */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-blue-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                DEMO RESULTS COMPARISON
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                Multi-Model & Multi-Language
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Demo Results Comparison</span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30 font-bold">
                DEMO DATA
              </span>
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Explore comparative rates across language representations (English, Kannada Native, Romanized, Kanglish) 
              and models under baseline and guarded conditions.
            </p>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-200 font-mono flex items-start gap-2.5">
              <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>DEMO DATA NOTICE:</strong> All values, charts, and table rows below are generated from live demonstration samples. 
                They are explicitly designated as <strong>DEMO DATA</strong> and must not be presented or cited as real empirical research findings.
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-wrap lg:flex-col gap-3 min-w-[200px]">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
            >
              <Play className="h-4 w-4" />
              Run Demo Sample
            </button>
            <button
              onClick={loadData}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs transition-all cursor-pointer"
            >
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* 2. Model, Language & Defense Filter Bar */}
      <div className="p-5 rounded-2xl bg-navy-800/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <Filter className="h-4 w-4 text-blue-400" />
            Comparison Filters
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {comparisonTableRows.length} sample records displayed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Model Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 font-mono">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              Model Filter
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Models (Llama, Sarvam, Mistral, Mock)</option>
              <option value="mock-research-adapter">BhashaShield Baseline (Research Adapter)</option>
              <option value="llama3-8b-instruct">Llama-3-8B-Instruct</option>
              <option value="sarvam-2b-indic">Sarvam-2B-Indic</option>
              <option value="mistral-7b-instruct">Mistral-7B-Instruct</option>
            </select>
          </div>

          {/* Language Modality Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 font-mono">
              <Globe2 className="h-3.5 w-3.5 text-yellow-400" />
              Language Representation Filter
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Languages (4-Way Coverage)</option>
              <option value="ENGLISH">English Only</option>
              <option value="KANNADA_NATIVE">Kannada Native Script (ಕನ್ನಡ)</option>
              <option value="KANNADA_ROMANIZED">Romanized Kannada</option>
              <option value="KANGLISH">Kanglish (Code-Mixed)</option>
            </select>
          </div>

          {/* Defense State Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Defense State Filter
            </label>
            <select
              value={selectedDefense}
              onChange={(e) => setSelectedDefense(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Runs (Baseline & Guarded)</option>
              <option value="baseline">Baseline Only (Unprotected)</option>
              <option value="guarded">Guarded Only (+Bilingual Guard)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Metric Switcher & Visual Comparison Chart */}
      <div className="rounded-2xl bg-navy-800/90 border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                Language-Wise Comparison Chart
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DEMO CHART
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Comparing Baseline vs. Guarded performance across English, Native Kannada, Romanized, and Kanglish representations.
            </p>
          </div>

          {/* Metric View Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
            {[
              { id: 'unsafe_compliance', label: 'Unsafe Compliance (ASR)' },
              { id: 'appropriate_refusal', label: 'Appropriate Refusal' },
              { id: 'over_refusal', label: 'Over-Refusal' },
              { id: 'response_time', label: 'Avg Response Time (ms)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMetricTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeMetricTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Bar Chart */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="language" stroke="#64748b" fontSize={12} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                unit={activeMetricTab === 'response_time' ? 'ms' : '%'}
              />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#0b101b', borderColor: '#1e293b', borderRadius: '12px' }}
                labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="Baseline"
                name={`Baseline ${activeMetricTab === 'response_time' ? 'Latency (ms)' : 'Rate (%)'} [DEMO]`}
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Guarded"
                name={`With Bilingual Guard ${activeMetricTab === 'response_time' ? 'Latency (ms)' : 'Rate (%)'} [DEMO]`}
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Structured Comparison Table */}
      <div className="rounded-2xl bg-navy-800/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Table className="h-4 w-4 text-emerald-400" />
                Structured Demo Comparison Table
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DEMO DATA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Detailed rates for Unsafe Compliance, Appropriate Refusal, Over-Refusal, and Latency per model and language.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 border-b border-slate-800 font-mono text-[11px] text-slate-400">
              <tr>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Target Model</th>
                <th className="py-3 px-3">Defense</th>
                <th className="py-3 px-4 text-right">Unsafe Compliance (ASR %)</th>
                <th className="py-3 px-4 text-right">Appropriate Refusal (%)</th>
                <th className="py-3 px-4 text-right">Over-Refusal (%)</th>
                <th className="py-3 px-3 text-right">Avg Latency (ms)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {comparisonTableRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {row.language}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                    {row.model}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        row.isGuarded
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {row.defense}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span
                      className={`font-bold ${
                        row.ucr > 20 ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {row.ucr.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">
                    {row.arr.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    {row.orr.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {Math.round(row.responseTime)}ms
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      DEMO DATA
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Experiment Modal */}
      <DemoExperimentModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
};
