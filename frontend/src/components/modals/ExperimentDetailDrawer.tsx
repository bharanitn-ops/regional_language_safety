import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldCheck, ShieldAlert, AlertTriangle, Layers, Filter } from 'lucide-react';
import { Experiment, EvaluationItemDetail, LanguageModality } from '../../types';
import { apiService } from '../../api/service';
import { Badge } from '../common/Badge';

interface ExperimentDetailDrawerProps {
  experiment: Experiment | null;
  onClose: () => void;
}

export const ExperimentDetailDrawer: React.FC<ExperimentDetailDrawerProps> = ({
  experiment,
  onClose,
}) => {
  const [results, setResults] = useState<EvaluationItemDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalityFilter, setModalityFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!experiment) return;
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await apiService.getExperimentResults(experiment.id);
        setResults(data);
      } catch (err) {
        console.error('Failed to load experiment results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [experiment]);

  if (!experiment) return null;

  const filteredResults = modalityFilter === 'ALL'
    ? results
    : results.filter((r) => r.language_modality === modalityFilter);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                  Experiment Details
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  experiment.guard_enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                }`}>
                  {experiment.guard_enabled ? 'Guarded' : 'Baseline'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{experiment.name}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <span>Model: <strong className="text-slate-200">{experiment.target_model}</strong></span>
                <span>•</span>
                <span>Probes: <strong className="text-slate-200">{results.length || experiment.total_test_cases * 4}</strong></span>
                <span>•</span>
                <span>Time: {new Date(experiment.created_at).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 p-4 bg-slate-950/80 border-b border-slate-800 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">English ASR</span>
              <span className="font-bold text-blue-400 text-sm">{(experiment.asr_english * 100).toFixed(1)}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Kannada Native</span>
              <span className="font-bold text-yellow-400 text-sm">{(experiment.asr_kannada_native * 100).toFixed(1)}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Romanized ASR</span>
              <span className="font-bold text-rose-400 text-sm">{(experiment.asr_kannada_romanized * 100).toFixed(1)}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Kanglish ASR</span>
              <span className="font-bold text-rose-400 text-sm">{(experiment.asr_kanglish * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              Filter Modality:
            </span>
            <div className="flex gap-1.5 overflow-x-auto">
              {['ALL', 'ENGLISH', 'KANNADA_NATIVE', 'KANNADA_ROMANIZED', 'KANGLISH'].map((m) => (
                <button
                  key={m}
                  onClick={() => setModalityFilter(m)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    modalityFilter === m
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'ALL' ? 'All Probes' : m.replace('KANNADA_', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Content: Per-probe breakdown */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Loading per-probe evaluation audit...
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No individual probe records found for this filter.
              </div>
            ) : (
              filteredResults.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge type="modality" value={item.language_modality} size="sm" />
                    <div className="flex items-center gap-2">
                      <Badge type="verdict" value={item.safety_verdict} size="sm" />
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.latency_ms}ms
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Evaluated Prompt
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200">
                      {item.prompt_text}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Model Response ({item.target_model})</span>
                      {item.guard_intervened && (
                        <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Guard Intervened
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                      {item.model_output}
                    </div>
                  </div>

                  {item.rationale && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/60">
                      <strong className="text-slate-300">Classifier Rationale:</strong> {item.rationale}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
