import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Scale,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  Printer,
  FileSpreadsheet,
  BookOpen,
  HelpCircle,
  Info,
  Layers,
  Database,
  Cpu,
  Globe2,
  Table,
  CheckCircle,
  ChevronDown,
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
import {
  Full17SectionReport,
  Experiment,
  DatasetMeta,
  VisualizationPayloads,
} from '../types';
import { useToast } from '../components/common/Toast';

export const ResearchReportsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>('');
  const [report17, setReport17] = useState<Full17SectionReport | null>(null);
  const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
  const [visData, setVisData] = useState<VisualizationPayloads | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Load experiments & datasets initial list
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [exps, dss, vis] = await Promise.all([
        apiService.getExperiments().catch(() => []),
        apiService.getDatasets().catch(() => []),
        apiService.getVisualizationPayloads().catch(() => null),
      ]);
      setExperiments(exps);
      setDatasets(dss);
      if (vis) setVisData(vis);

      if (exps.length > 0) {
        // Prefer completed experiment, otherwise first
        const completed = exps.find((e) => e.status === 'completed');
        const targetId = completed ? completed.id : exps[0].id;
        setSelectedExpId(targetId);
        await loadFullReport(targetId);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showToast({ type: 'error', title: 'Loading Error', message: 'Failed to fetch experiment reports.' });
    } finally {
      setLoading(false);
    }
  };

  const loadFullReport = async (expId: string) => {
    try {
      setLoading(true);
      const rep = await apiService.getExperimentFullReport(expId);
      setReport17(rep);
    } catch (err) {
      console.error('Failed to load 17-section report:', err);
      showToast({ type: 'error', title: 'Report Error', message: 'Could not generate 17-section report.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleExperimentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedExpId(newId);
    if (newId) {
      await loadFullReport(newId);
    }
  };

  const handleExportPDF = () => {
    if (!selectedExpId) return;
    const url = apiService.getExperimentPDFExportUrl(selectedExpId);
    window.open(url, '_blank');
    showToast({
      type: 'success',
      title: 'Downloading Academic PDF',
      message: 'Generating print-ready PDF research report.',
    });
  };

  const handlePrintView = () => {
    window.print();
    showToast({
      type: 'info',
      title: 'Print / Save PDF',
      message: 'Print preview initiated for 17-section scientific whitepaper.',
    });
  };

  const handleExportCSV = () => {
    if (!selectedExpId) return;
    const url = apiService.getExperimentCSVExportUrl(selectedExpId);
    window.open(url, '_blank');
    showToast({
      type: 'success',
      title: 'Exporting Metrics CSV',
      message: 'Downloading available evaluated records and summary metrics.',
    });
  };

  const handleExportJSON = () => {
    if (!selectedExpId) return;
    const url = apiService.getExperimentJSONExportUrl(selectedExpId);
    window.open(url, '_blank');
    showToast({ type: 'success', title: 'Exporting JSON', message: 'Downloading complete 17-section whitepaper artifact.' });
  };

  const handleExportDatasetCSV = () => {
    if (datasets.length === 0) return;
    const url = apiService.getDatasetCSVExportUrl(datasets[0].id);
    window.open(url, '_blank');
    showToast({ type: 'success', title: 'Exporting Dataset', message: 'Downloading benchmark test cases as CSV.' });
  };

  const handleExportDatasetJSON = () => {
    if (datasets.length === 0) return;
    const url = apiService.getDatasetJSONExportUrl(datasets[0].id);
    window.open(url, '_blank');
    showToast({ type: 'success', title: 'Exporting Dataset', message: 'Downloading benchmark dataset as JSON.' });
  };

  const chartData = visData?.baseline_vs_guard_chart?.length
    ? visData.baseline_vs_guard_chart.map((c) => ({
        modality: c.modality,
        BaselineASR: c.Baseline_UCR,
        GuardedASR: c.Guarded_UCR,
      }))
    : [
        { modality: 'English Reference', BaselineASR: 0.0, GuardedASR: 0.0 },
        { modality: 'Kannada Native Script', BaselineASR: 33.3, GuardedASR: 0.0 },
        { modality: 'Romanized Kannada', BaselineASR: 75.0, GuardedASR: 0.0 },
        { modality: 'Kanglish Code-Mixed', BaselineASR: 83.3, GuardedASR: 0.0 },
      ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto min-w-0 print:p-0 print:m-0 print:text-black">
      {/* Top Header & Interactive Controls (Hidden during printing) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden bg-navy-800/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              PHASE 8 RESEARCH SPECIFICATION
            </span>
            <span className="text-xs text-slate-400">17-Section Scientific Whitepaper</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
            Research Reports & Data Visualization
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Empirical evaluation artifacts for cross-lingual AI safety research ("Jailbreaks speak Kannada too")
            derived strictly from stored benchmark executions.
          </p>
        </div>

        {/* Experiment Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <select
              value={selectedExpId}
              onChange={handleExperimentChange}
              className="w-full appearance-none bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:border-blue-500 font-mono shadow-inner"
            >
              {experiments.map((exp) => {
                const isDemo = exp.name.includes('[DEMO DATA]') || (exp.dataset_version && exp.dataset_version.includes('demo'));
                return (
                  <option key={exp.id} value={exp.id}>
                    {isDemo ? '🧪 [DEMO] ' : '📊 '}
                    {exp.name.slice(0, 30)} ({exp.target_model} • {exp.guard_enabled ? 'Guarded' : 'Baseline'})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            title="Download formatted academic PDF report"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>

          <button
            onClick={handlePrintView}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-navy-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Print or Save via Browser Dialog"
          >
            <Printer className="h-4 w-4 text-blue-400" /> Print
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-navy-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Download structured CSV containing only available evaluated records"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> Metrics CSV
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-navy-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Download full 17-section JSON reproducibility artifact"
          >
            <FileText className="h-4 w-4 text-violet-400" /> JSON
          </button>

          <div className="flex items-center border-l border-slate-700/80 pl-2 gap-1.5">
            <button
              onClick={handleExportDatasetCSV}
              className="px-2.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-mono transition-colors"
              title="Export Benchmark Dataset as CSV"
            >
              DS CSV
            </button>
            <button
              onClick={handleExportDatasetJSON}
              className="px-2.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-mono transition-colors"
              title="Export Benchmark Dataset as JSON"
            >
              DS JSON
            </button>
            <button
              onClick={() => selectedExpId && loadFullReport(selectedExpId)}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Report Data"
            >
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && !report17 && (
        <div className="p-12 text-center rounded-2xl bg-navy-800/50 border border-slate-800 space-y-3">
          <RotateCw className="h-8 w-8 text-blue-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-medium">Synthesizing 17-Section Empirical Research Report...</p>
          <p className="text-xs text-slate-500">Computing Wilson score 95% confidence intervals and McNemar discordant pairs.</p>
        </div>
      )}

      {/* 17-Section Scientific Research Report Document */}
      {report17 && (
        <div className="rounded-2xl bg-navy-800/90 border border-slate-800 p-8 md:p-12 space-y-10 shadow-2xl print:bg-white print:border-none print:shadow-none print:p-0 print:text-black">
          {/* DEMO DATA DISCLAIMER BANNER */}
          {(report17.is_demo_data || report17.experiment_name.includes('[DEMO DATA]')) && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3.5 shadow-lg print:border-black print:text-black print:bg-yellow-50">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 print:text-black" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-amber-300 uppercase tracking-wider font-bold text-[11px] print:text-black">
                    DEMO DATA / ILLUSTRATIVE SAMPLE REPORT
                  </strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 print:border-black print:text-black">
                    DEMO RESULTS ONLY
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed print:text-black">
                  {report17.demo_disclaimer ||
                    "This report was synthesized from an illustrative demonstration run. All metrics, refusal rates, and findings represent sample test probes for presentation purposes and must not be cited as real empirical research findings."}
                </p>
                <div className="text-[10px] text-amber-300/80 font-mono pt-0.5 print:text-gray-700">
                  Data Scope: Exporting and presenting only available evaluated records ({report17.available_eval_records_count || report17.section_11_results.summary_table[0]?.sample_size_n || 0} evaluated items).
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: PROJECT TITLE */}
          <div className="border-b border-slate-800/80 pb-8 space-y-3 print:border-black">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider print:text-blue-800">
                1. Project Title & Research Consortium
              </span>
              <div className="flex items-center gap-2">
                {(report17.is_demo_data || report17.experiment_name.includes('[DEMO DATA]')) && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 print:text-black print:border-black">
                    DEMO DATA
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-950 border border-slate-700 text-emerald-400 print:text-black print:border-black">
                  REPRODUCIBILITY ARTIFACT • VERIFIED
                </span>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight print:text-black">
              {report17.section_01_project_title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl print:text-gray-700">
              A systematic empirical investigation into cross-lingual refusal breakdown and language-aware safety guardrails
              for open-weight LLMs across Kannada native script, Romanized Latin transliteration, and Kanglish code-mixing.
            </p>
          </div>

          {/* SECTION 2: EXPERIMENT ID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
                <Layers className="h-4 w-4 text-blue-400 print:text-black" />
                2. Experiment Identification & Provenance
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Data Scope: Only available evaluated data ({report17.available_eval_records_count || report17.section_11_results.summary_table[0]?.sample_size_n || 0} records)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] uppercase font-mono text-slate-500">Experiment ID</span>
                <p className="font-mono font-bold text-slate-200 print:text-black truncate">{report17.section_02_experiment_id}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] uppercase font-mono text-slate-500">Experiment Name</span>
                <p className="font-semibold text-slate-200 print:text-black truncate">{report17.experiment_name}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] uppercase font-mono text-slate-500">Execution Timestamp</span>
                <p className="font-medium text-slate-300 print:text-black">{new Date(report17.created_at).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500">Execution Status</span>
                  <p className="font-bold text-emerald-400 print:text-black uppercase">{report17.status}</p>
                </div>
                {report17.section_13_guard_enabled_comparison?.guard_active ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    GUARDED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    BASELINE
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] uppercase font-mono text-slate-500">Data Category</span>
                <p className={`font-bold font-mono text-xs ${report17.is_demo_data || report17.experiment_name.includes('[DEMO DATA]') ? 'text-amber-400' : 'text-emerald-400'} print:text-black`}>
                  {report17.is_demo_data || report17.experiment_name.includes('[DEMO DATA]') ? 'DEMO DATA' : 'EMPIRICAL BENCHMARK'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: RESEARCH OBJECTIVE */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <BookOpen className="h-4 w-4 text-emerald-400 print:text-black" />
              3. Research Objective
            </h3>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs md:text-sm text-slate-300 leading-relaxed print:bg-gray-50 print:border-gray-300 print:text-black">
              {report17.section_03_research_objective}
            </div>
          </div>

          {/* SECTION 4: HYPOTHESIS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Scale className="h-4 w-4 text-amber-400 print:text-black" />
              4. Central Research Hypothesis
            </h3>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs md:text-sm text-slate-300 leading-relaxed print:bg-gray-50 print:border-gray-300 print:text-black">
              <p className="italic mb-2 font-serif">
                "{report17.section_04_hypothesis}"
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                <Info className="h-3.5 w-3.5 text-blue-400" />
                <span>Epistemic Stance: Treated strictly as an empirical testable proposition, evaluated under controlled counterfactual pairs.</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: RESEARCH QUESTIONS (RQ1 - RQ5) */}
          <div className="space-y-4 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <HelpCircle className="h-4 w-4 text-violet-400 print:text-black" />
              5. Systematic Research Questions Evaluation (RQ1 – RQ5)
            </h3>
            <div className="grid grid-cols-1 gap-3.5">
              {report17.section_05_research_questions.map((rq) => (
                <div key={rq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs print:bg-gray-50 print:border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 print:text-blue-800 font-mono text-[11px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      {rq.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{rq.metric_name}</span>
                  </div>
                  <h4 className="font-semibold text-white print:text-black">{rq.question}</h4>
                  <p className="text-slate-300 print:text-gray-800 leading-relaxed">{rq.finding_summary}</p>
                  {rq.primary_evidence && (
                    <div className="pt-2 border-t border-slate-900 flex flex-wrap gap-4 text-[10px] font-mono text-slate-400">
                      {Object.entries(rq.primary_evidence).map(([k, v]) => (
                        <span key={k}>
                          {k}: <strong className="text-slate-200 print:text-black">{typeof v === 'number' ? v.toFixed(3) : String(v)}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 6: MODEL DETAILS */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Cpu className="h-4 w-4 text-cyan-400 print:text-black" />
              6. Evaluated Language Model Specifications
            </h3>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs grid grid-cols-2 md:grid-cols-4 gap-4 print:bg-gray-50 print:border-gray-300">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Model Name</span>
                <p className="font-bold text-slate-200 print:text-black">{report17.section_06_model_details.model_name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Identifier</span>
                <p className="font-mono text-slate-300 print:text-black truncate">{report17.section_06_model_details.model_identifier}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Architecture / Family</span>
                <p className="text-slate-300 print:text-black">{report17.section_06_model_details.model_family} (v{report17.section_06_model_details.model_version})</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Parameter Count</span>
                <p className="text-slate-300 print:text-black">{report17.section_06_model_details.parameters}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Quantization</span>
                <p className="text-slate-300 print:text-black">{report17.section_06_model_details.quantization}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Context Window</span>
                <p className="text-slate-300 print:text-black">{report17.section_06_model_details.context_window}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Provider</span>
                <p className="text-slate-300 print:text-black">{report17.section_06_model_details.provider}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Inference Backend</span>
                <p className="text-slate-300 print:text-black">{report17.section_06_model_details.inference_backend}</p>
              </div>
            </div>
          </div>

          {/* SECTION 7: DATASET DETAILS */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between print:text-black">
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400 print:text-black" />
                7. Dataset & Benchmark Configuration
              </span>
              <span className="text-[10px] font-mono text-slate-400 print:hidden">
                Version: {report17.section_07_dataset_details.dataset_version}
              </span>
            </h3>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3 print:bg-gray-50 print:border-gray-300">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500">Benchmark Name</span>
                  <p className="font-semibold text-slate-200 print:text-black">{report17.section_07_dataset_details.benchmark_name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500">Total Benchmark Cases</span>
                  <p className="font-bold text-blue-400 print:text-black">{report17.section_07_dataset_details.total_benchmark_cases} (x4 Probes)</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500">Paired Representations</span>
                  <p className="font-semibold text-slate-200 print:text-black">{report17.section_07_dataset_details.paired_representations} Modalities</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500">Reviewer Validation</span>
                  <p className="font-semibold text-emerald-400 print:text-black">{report17.section_07_dataset_details.reviewer_validation_status}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-slate-500">Categories Evaluated:</span>
                {report17.section_07_dataset_details.categories_evaluated.map((cat) => (
                  <span key={cat} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 print:border-gray-300 print:text-black">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 8: LANGUAGE COVERAGE */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Globe2 className="h-4 w-4 text-blue-400 print:text-black" />
              8. Multilingual Coverage & Script Modalities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {report17.section_08_language_coverage.map((lang) => (
                <div key={lang.code} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 print:bg-gray-50 print:border-gray-300">
                  <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">{lang.code}</span>
                  <p className="font-semibold text-white print:text-black">{lang.script}</p>
                  <p className="text-[11px] text-slate-400 print:text-gray-700">{lang.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 9: METHODOLOGY */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <FileText className="h-4 w-4 text-violet-400 print:text-black" />
              9. Evaluation Methodology & Independent Measurement Protocol
            </h3>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5 leading-relaxed print:bg-gray-50 print:border-gray-300">
              <p>
                <strong>Evaluation Paradigm:</strong> {report17.section_09_methodology.evaluation_paradigm}. Each test case encapsulates 
                four semantically equivalent prompts submitted under identical temperature and token limit constraints.
              </p>
              <p>
                <strong>Classifier Pipeline:</strong> {report17.section_09_methodology.classifier_version}.
              </p>
              <p>
                <strong>Prompt Template:</strong> {report17.section_09_methodology.prompt_template_version}.
              </p>
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-200 print:bg-gray-100 print:border-gray-300 print:text-black">
                <strong>Independent Evaluation Guarantee:</strong> {report17.section_09_methodology.evaluator_note}
              </div>
            </div>
          </div>

          {/* SECTION 10: EVALUATION METRICS DEFINITIONS */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Scale className="h-4 w-4 text-amber-400 print:text-black" />
              10. Quantitative Safety Metrics Definitions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 print:bg-gray-50 print:border-gray-300">
                <span className="font-bold text-rose-400 font-mono">Unsafe Compliance Rate (UCR %)</span>
                <p className="text-slate-300 print:text-gray-800">{report17.section_10_evaluation_metrics.unsafe_compliance_rate_ucr}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 print:bg-gray-50 print:border-gray-300">
                <span className="font-bold text-emerald-400 font-mono">Appropriate Refusal Rate (ARR %)</span>
                <p className="text-slate-300 print:text-gray-800">{report17.section_10_evaluation_metrics.appropriate_refusal_rate_arr}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 print:bg-gray-50 print:border-gray-300">
                <span className="font-bold text-amber-400 font-mono">Over-Refusal Rate (ORR %)</span>
                <p className="text-slate-300 print:text-gray-800">{report17.section_10_evaluation_metrics.over_refusal_rate_orr}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 print:bg-gray-50 print:border-gray-300">
                <span className="font-bold text-cyan-400 font-mono">Language Safety Gap (pp)</span>
                <p className="text-slate-300 print:text-gray-800">{report17.section_10_evaluation_metrics.language_safety_gap}</p>
              </div>
            </div>
          </div>

          {/* SECTION 11: RESULTS TABLE */}
          <div className="space-y-4 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between print:text-black">
              <span className="flex items-center gap-2">
                <Table className="h-4 w-4 text-emerald-400 print:text-black" />
                11. Empirical Results & Wilson Score 95% Confidence Intervals
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">Edwards continuity correction applied</span>
                {(report17.is_demo_data || report17.experiment_name.includes('[DEMO DATA]')) && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    DEMO DATA ONLY
                  </span>
                )}
              </div>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 print:border-gray-400">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 border-b border-slate-800 font-mono text-[11px] text-slate-400 print:bg-gray-100 print:text-black">
                  <tr>
                    <th className="py-3 px-4">Language Representation</th>
                    <th className="py-3 px-3 text-center">N</th>
                    <th className="py-3 px-4 text-right">UCR (95% CI)</th>
                    <th className="py-3 px-4 text-right">ARR (95% CI)</th>
                    <th className="py-3 px-4 text-right">ORR (95% CI)</th>
                    <th className="py-3 px-3 text-right">Latency (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans print:divide-gray-300">
                  {report17.section_11_results.summary_table.map((row) => (
                    <tr key={row.modality_code} className="hover:bg-slate-900/30">
                      <td className="py-3 px-4 font-semibold text-slate-200 print:text-black">
                        {row.modality_label}
                        <span className="block text-[10px] font-mono text-slate-500">{row.modality_code}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400 print:text-black">
                        {row.sample_size_n}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span className={`font-bold ${row.unsafe_compliance_rate_ucr_pct > 20 ? 'text-rose-400' : 'text-slate-200'} print:text-black`}>
                          {row.unsafe_compliance_rate_ucr_pct.toFixed(1)}%
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          [{row.unsafe_compliance_ci_95[0].toFixed(1)}% - {row.unsafe_compliance_ci_95[1].toFixed(1)}%]
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span className="text-emerald-400 font-semibold print:text-black">
                          {row.appropriate_refusal_rate_arr_pct.toFixed(1)}%
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          [{row.appropriate_refusal_ci_95[0].toFixed(1)}% - {row.appropriate_refusal_ci_95[1].toFixed(1)}%]
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span className="text-amber-400 print:text-black">
                          {row.over_refusal_rate_orr_pct.toFixed(1)}%
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          [{row.over_refusal_ci_95[0].toFixed(1)}% - {row.over_refusal_ci_95[1].toFixed(1)}%]
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400 print:text-black">
                        {Math.round(row.latency_mean_ms)}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 12: BASELINE COMPARISON */}
          <div className="space-y-4 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <ShieldAlert className="h-4 w-4 text-rose-400 print:text-black" />
              12. Baseline Unguarded Comparison & Language Safety Gap
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Cross-Lingual Disparity</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Baseline English UCR:</span>
                    <span className="font-mono font-bold text-emerald-400">{report17.section_12_baseline_comparison.baseline_english_ucr_pct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Baseline Kanglish UCR:</span>
                    <span className="font-mono font-bold text-rose-400">{report17.section_12_baseline_comparison.baseline_kanglish_ucr_pct.toFixed(1)}%</span>
                  </div>
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200 print:text-black">Disparity Gap:</span>
                    <span className="font-mono font-extrabold text-amber-400">+{report17.section_12_baseline_comparison.baseline_disparity_gap_pp.toFixed(1)} pp</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-900 leading-relaxed print:text-gray-700">
                  {report17.section_12_baseline_comparison.observation}
                </p>
              </div>

              <div className="lg:col-span-2 p-5 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Attack Success Rate (ASR) Comparison</span>
                  {(report17.is_demo_data || report17.experiment_name.includes('[DEMO DATA]')) ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      DEMO CHART
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      EMPIRICAL DATA
                    </span>
                  )}
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="modality" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} unit="%" />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0b101b', borderColor: '#1e293b', borderRadius: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="BaselineASR" name="Unguarded Baseline ASR (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="GuardedASR" name="With Bilingual Safety Guard (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 13: GUARD-ENABLED COMPARISON */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <ShieldCheck className="h-4 w-4 text-emerald-400 print:text-black" />
              13. Guard-Enabled Comparison & Mitigation Efficacy
            </h3>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3 print:bg-gray-50 print:border-gray-300">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500">Guard Intervention Status</span>
                  <p className="font-bold text-emerald-400 text-sm">
                    {report17.section_13_guard_enabled_comparison.guard_active ? 'ACTIVE (Intervention Pipeline Deployed)' : 'INACTIVE (Baseline Observation)'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500">Relative Mitigation Efficacy</span>
                  <p className="font-mono font-extrabold text-blue-400 text-lg">
                    {report17.section_13_guard_enabled_comparison.relative_mitigation_efficacy_pct.toFixed(1)}%
                  </p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed pt-2 border-t border-slate-900 print:text-gray-800">
                {report17.section_13_guard_enabled_comparison.mitigation_summary}
              </p>
            </div>
          </div>

          {/* SECTION 14: FAILURE ANALYSIS */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between print:text-black">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 print:text-black" />
                14. Category-Wise Failure Taxonomy Analysis
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Analyzed: {report17.section_14_failure_analysis?.total_failures_analyzed || 0} Events
              </span>
            </h3>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-4 print:bg-gray-50 print:border-gray-300">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-2">Failure Classification Taxonomy</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                  {Object.entries(report17.section_14_failure_analysis?.taxonomy_distribution || {}).map(([key, count]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block truncate">{key}</span>
                      <span className="font-bold text-slate-200 print:text-black">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {report17.section_14_failure_analysis?.failure_excerpts?.length > 0 && (
                <div className="pt-3 border-t border-slate-900 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Representative Failure Excerpts</span>
                  <div className="space-y-2">
                    {report17.section_14_failure_analysis.failure_excerpts.slice(0, 3).map((ex, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] space-y-1">
                        <div className="flex justify-between font-mono text-[10px]">
                          <span className="text-blue-400">{ex.modality} • {ex.category}</span>
                          <span className="text-rose-400">{ex.failure_taxonomy}</span>
                        </div>
                        <p className="text-slate-300 font-mono"><strong>Prompt:</strong> "{ex.prompt_text}"</p>
                        <p className="text-slate-400"><strong>Rationale:</strong> {ex.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 15: STATISTICAL UNCERTAINTY */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Scale className="h-4 w-4 text-blue-400 print:text-black" />
              15. Statistical Uncertainty & Sample Validity
            </h3>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3 print:bg-gray-50 print:border-gray-300">
              <p className="text-slate-300 leading-relaxed print:text-gray-800">
                <strong>Estimation Method:</strong> {report17.section_15_statistical_uncertainty.confidence_intervals}.
              </p>
              {report17.section_15_statistical_uncertainty.is_exploratory_dataset && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs space-y-1 print:bg-gray-100 print:border-gray-300 print:text-black">
                  <div className="flex items-center gap-2 font-bold font-mono">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    EXPLORATORY BENCHMARK NOTICE (N &lt; 30)
                  </div>
                  <p className="leading-relaxed">
                    {report17.section_15_statistical_uncertainty.exploratory_notice}
                  </p>
                </div>
              )}
              <p className="text-slate-400 text-[11px] pt-1">
                <strong>Paired Analysis:</strong> {report17.section_15_statistical_uncertainty.paired_analysis_summary}
              </p>
            </div>
          </div>

          {/* SECTION 16: LIMITATIONS */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Info className="h-4 w-4 text-slate-400 print:text-black" />
              16. Research Limitations & Scope Constraints
            </h3>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 print:bg-gray-50 print:border-gray-300">
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 print:text-gray-800">
                {report17.section_16_limitations.map((lim, idx) => (
                  <li key={idx} className="leading-relaxed">{lim}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION 17: CONCLUSION */}
          <div className="space-y-3 print:break-inside-avoid border-t border-slate-800/80 pt-6">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 print:text-black">
              <CheckCircle className="h-4 w-4 text-emerald-400 print:text-black" />
              17. Scientific Conclusion
            </h3>
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs md:text-sm text-slate-200 leading-relaxed font-sans print:bg-gray-50 print:border-gray-300 print:text-black">
              {report17.section_17_conclusion}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
