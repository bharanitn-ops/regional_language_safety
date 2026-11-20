import React, { useState } from 'react';
import { Cpu, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { ModelMetadata } from '../../types';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (model: ModelMetadata) => void;
}

export const AddModelModal: React.FC<AddModelModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [modelName, setModelName] = useState('');
  const [provider, setProvider] = useState('Hugging Face / Open-Weight');
  const [identifier, setIdentifier] = useState('');
  const [version, setVersion] = useState('1.0');
  const [parameters, setParameters] = useState('7B');
  const [contextWindow, setContextWindow] = useState('8192');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim() || !identifier.trim()) {
      showToast({ type: 'warning', title: 'Missing Fields', message: 'Model name and identifier are required.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newModel: ModelMetadata = {
        id: identifier.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: modelName,
        provider,
        version,
        status: 'available',
        parameters,
        contextWindow: `${contextWindow} tokens`,
        supportedModalities: ['ENGLISH', 'KANNADA_NATIVE', 'KANNADA_ROMANIZED', 'KANGLISH'],
        description: description || 'Custom open-weight model registered via adapter interface.',
      };

      showToast({
        type: 'success',
        title: 'Model Adapter Registered',
        message: `${newModel.name} added to model adapter layer.`,
      });
      onSuccess(newModel);
      onClose();
      setLoading(false);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Open-Weight Model Adapter"
      description="Connect open-weight Indic and multilingual models to the BhashaShield evaluation pipeline."
      maxWidth="lg"
    >
      <form onSubmit={handleRegister} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Model Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. IndicLlama-7B-v2"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Model Provider / Lab</label>
            <input
              type="text"
              required
              placeholder="e.g. AI4Bharat / HuggingFace"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Identifier / HF Repo</label>
            <input
              type="text"
              required
              placeholder="ai4bharat/indic-llama"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono text-[11px] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Parameters</label>
            <input
              type="text"
              placeholder="e.g. 7B / 13B"
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Context Window</label>
            <input
              type="text"
              placeholder="8192"
              value={contextWindow}
              onChange={(e) => setContextWindow(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-300 block mb-1">Model Description / Architecture Notes</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Architecture notes, tokenization details, or Indic pretraining corpus information..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30"
          >
            <Plus className="h-4 w-4" />
            {loading ? 'Validating...' : 'Register Model Adapter'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
