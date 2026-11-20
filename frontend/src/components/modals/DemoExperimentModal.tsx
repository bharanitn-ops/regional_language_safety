import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  Globe2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { apiService } from '../../api/service';
import { Experiment } from '../../types';
import { useToast } from '../common/Toast';

interface DemoExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (exp: Experiment) => void;
  defaultModel?: string;
}

export const DemoExperimentModal: React.FC<DemoExperimentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultModel = 'mock-research-adapter',
}) => {
  const [model, setModel] = useState(defaultModel);
  const [enableGuard, setEnableGuard] = useState(false);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([
    'ENGLISH',
    'KANNADA_NATIVE',
    'KANNADA_ROMANIZED',
    'KANGLISH',
  ]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [demoResult, setDemoResult] = useState<any | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (defaultModel) setModel(defaultModel);
  }, [defaultModel]);

  const toggleModality = (m: string) => {
    if (selectedModalities.includes(m)) {
      if (selectedModalities.length > 1) {
        setSelectedModalities(selectedModalities.filter((item) => item !== m));
      }
    } else {
      setSelectedModalities([...selectedModalities, m]);
    }
  };

  const handleStartDemo = async () => {
    try {
      setLoading(true);
      setDemoResult(null);
      setProgress(10);
      setProgressStatus('Loading 4-way benchmark test cases...');

      // Simulated progress increments for visual presentation
      const timer1 = setTimeout(() => {
        setProgress(35);
        setProgressStatus('Evaluating English baseline prompts...');
      }, 300);

      const timer2 = setTimeout(() => {
        setProgress(65);
        setProgressStatus('Evaluating Kannada native & Romanized Latin transliteration...');
      }, 700);

      const timer3 = setTimeout(() => {
        setProgress(85);
        setProgressStatus('Probing Kanglish code-mixing bypass vector...');
      }, 1100);

      const res = await apiService.runDemoExperiment({
        target_model: model,
        modalities: selectedModalities,
        guard_enabled: enableGuard,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setProgress(100);
      setProgressStatus('Evaluation Complete!');
      setDemoResult(res);

      showToast({
        type: 'success',
        title: 'Demo Evaluation Complete',
        message: 'Sample results generated. Labeled as DEMO DATA.',
      });

      if (onSuccess && res.experiment) {
        onSuccess(res.experiment);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Demo Evaluation Failed',
        message: err?.message || 'Unable to run sample evaluation.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDemoResult(null);
    setProgress(0);
    setProgressStatus('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Demo Experiment • Live Sample Evaluation"
      description="Select open-weight model and language representations to execute a controlled sample evaluation."
      maxWidth="2xl"
    >
      <div className="space-y-6 text-xs text-slate-300">
        {/* Prominent Demo Notice */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-300 font-mono">DEMO DATA DISCLOSURE:</strong> All sample outputs,
            refusal scores, and compliance metrics generated in this demo tool are explicitly tagged as 
            <span className="font-bold font-mono text-amber-300 ml-1">DEMO DATA</span>. They are designed for live demonstration
            and must not be presented or cited as real empirical research findings.
          </div>
        </div>

        {/* Configuration Controls (Hidden during results inspection if desired, or compact) */}
        {!demoResult && (
          <div className="space-y-5">
            {/* 1. Model Selection */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  Select Model
                </span>
                <span className="text-[10px] font-mono text-slate-500">Open-Weight Adapter</span>
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="mock-research-adapter">BhashaShield Baseline (Research Adapter)</option>
                <option value="llama3-8b-instruct">Llama-3-8B-Instruct (Meta Open Weight)</option>
                <option value="sarvam-2b-indic">Sarvam-2B-Indic (Indic Specialized)</option>
                <option value="mistral-7b-instruct">Mistral-7B-Instruct (Mistral AI)</option>
              </select>
            </div>

            {/* 2. Language Modalities Selection */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-yellow-400" />
                  Choose Language Representations
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {selectedModalities.length} of 4 selected
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'ENGLISH', label: 'English', desc: 'Canonical Latin Reference', color: 'text-blue-400' },
                  { id: 'KANNADA_NATIVE', label: 'Kannada Native (ಕನ್ನಡ)', desc: 'Unicode U+0C80–U+0CFF', color: 'text-yellow-400' },
                  { id: 'KANNADA_ROMANIZED', label: 'Romanized Kannada', desc: 'Latin Transliteration', color: 'text-violet-400' },
                  { id: 'KANGLISH', label: 'Kanglish', desc: 'Colloquial Code-Mixed', color: 'text-rose-400' },
                ].map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModality(mod.id)}
                    disabled={loading}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedModalities.includes(mod.id)
                        ? 'bg-slate-900 border-blue-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-xs ${selectedModalities.includes(mod.id) ? 'text-white' : 'text-slate-400'}`}>
                        {mod.label}
                      </span>
                      {selectedModalities.includes(mod.id) && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                      )}
                    </div>
                    <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                      {mod.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Guard Defense Toggle */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Bilingual Safety Guard (BSG) Defense
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Toggle on to deploy the 7-stage pre-generation language identification and intent normalization guard.
                  When disabled, executes raw baseline model inference.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnableGuard(!enableGuard)}
                disabled={loading}
                className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  enableGuard ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enableGuard ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Progress & Live Execution Indicator */}
        {loading && (
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-blue-400 flex items-center gap-2">
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                {progressStatus || 'Running sample evaluation...'}
              </span>
              <span className="text-slate-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-600 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results Presentation (Labeled as DEMO DATA) */}
        {demoResult && (
          <div className="space-y-5 animate-fadeIn">
            {/* Completion Banner */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-xs">Sample Evaluation Completed</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Model: {demoResult.target_model} • Mode: {demoResult.guard_enabled ? 'Guarded (+BSG)' : 'Raw Baseline'} • {demoResult.total_probes_evaluated} Probes
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded font-mono font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DEMO DATA
              </span>
            </div>

            {/* Sample Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">English ASR</span>
                <span className="text-lg font-bold text-blue-400">
                  {((demoResult.experiment?.asr_english || 0) * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-amber-400/80 block">DEMO METRIC</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Native Kannada</span>
                <span className="text-lg font-bold text-yellow-400">
                  {((demoResult.experiment?.asr_kannada_native || 0) * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-amber-400/80 block">DEMO METRIC</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Romanized</span>
                <span className="text-lg font-bold text-violet-400">
                  {((demoResult.experiment?.asr_kannada_romanized || 0) * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-amber-400/80 block">DEMO METRIC</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Kanglish ASR</span>
                <span className="text-lg font-bold text-rose-400">
                  {((demoResult.experiment?.asr_kanglish || 0) * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-amber-400/80 block">DEMO METRIC</span>
              </div>
            </div>

            {/* Evaluated Sample Probe Records */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center justify-between">
                <span>Sample Probe Results ({demoResult.evaluations?.length || 0})</span>
                <span className="text-[10px] text-amber-400">ALL RECORDS TAGGED AS DEMO DATA</span>
              </span>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {demoResult.evaluations?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.language_modality}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{item.benchmark_id}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            item.safety_verdict === 'UNSAFE_COMPLIANCE'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {item.safety_verdict}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          DEMO DATA
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-300 font-mono text-[11px]">
                      <strong>Prompt:</strong> "{item.prompt_text}"
                    </p>
                    <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">
                      <strong>Response:</strong> {item.model_output}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-[10px] font-mono text-slate-500">
            {demoResult ? 'Sample evaluation finished' : 'Select model & representations'}
          </div>

          <div className="flex items-center gap-2.5">
            {demoResult ? (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Run Another Sample
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartDemo}
                  disabled={loading || selectedModalities.length === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Play className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Evaluating...' : 'Start Sample Evaluation'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
