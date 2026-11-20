import React, { useState } from 'react';
import { Zap, ShieldCheck, Cpu, Layers } from 'lucide-react';
import { Modal } from '../common/Modal';
import { apiService } from '../../api/service';
import { Experiment } from '../../types';
import { useToast } from '../common/Toast';

interface NewExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (exp: Experiment) => void;
}

export const NewExperimentModal: React.FC<NewExperimentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [model, setModel] = useState('mock-research-adapter');
  const [enableGuard, setEnableGuard] = useState(false);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([
    'ENGLISH',
    'KANNADA_NATIVE',
    'KANNADA_ROMANIZED',
    'KANGLISH',
  ]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const toggleModality = (m: string) => {
    if (selectedModalities.includes(m)) {
      if (selectedModalities.length > 1) {
        setSelectedModalities(selectedModalities.filter((item) => item !== m));
      }
    } else {
      setSelectedModalities([...selectedModalities, m]);
    }
  };

  const handleLaunch = async () => {
    try {
      setLoading(true);
      const exp = await apiService.runBatchEvaluation({
        target_model: model,
        enable_bilingual_guard: enableGuard,
      });
      showToast({
        type: 'success',
        title: 'Experiment Completed',
        message: `Evaluation run "${exp.name}" recorded successfully.`,
      });
      onSuccess(exp);
      onClose();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Experiment Failed',
        message: err?.message || 'Unable to execute benchmark run',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure & Launch Safety Experiment"
      description="Run empirical evaluation across multilingual test cases to measure refusal boundaries."
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs text-slate-300">
        {/* Model Selection */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-blue-400" />
            Target Model Adapter
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="mock-research-adapter">BhashaShield Baseline (Research Adapter)</option>
            <option value="sarvam-2b-indic">Sarvam-2B-Indic (Indic Specialized)</option>
            <option value="llama3-8b-instruct">Llama-3-8B-Instruct (Meta Open Weight)</option>
            <option value="mistral-7b-instruct">Mistral-7B-Instruct (Mistral AI)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Open-weight models are connected through the pluggable Model Adapter layer.
          </p>
        </div>

        {/* Guard Defense Toggle */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Bilingual Safety Guard Defense
            </div>
            <p className="text-[11px] text-slate-400">
              Injects language-aware cross-lingual alignment wrappers and intent extraction before inference.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEnableGuard(!enableGuard)}
            className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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

        {/* Modalities Selection */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-violet-400" />
            Linguistic Modalities to Probe
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'ENGLISH', label: 'English Baseline' },
              { id: 'KANNADA_NATIVE', label: 'Kannada Native (ಕನ್ನಡ)' },
              { id: 'KANNADA_ROMANIZED', label: 'Romanized Kannada' },
              { id: 'KANGLISH', label: 'Kanglish (Code-Mixed)' },
            ].map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => toggleModality(mod.id)}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                  selectedModalities.includes(mod.id)
                    ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {mod.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunch}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50"
          >
            <Zap className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Executing Suite Probes...' : 'Launch Experiment'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
