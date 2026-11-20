import React, { useState } from 'react';
import { Plus, Database, Layers, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { DatasetMeta } from '../../types';
import { useToast } from '../common/Toast';

interface CreateDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (dataset: DatasetMeta) => void;
}

export const CreateDatasetModal: React.FC<CreateDatasetModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('v1.0.0');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Cybersecurity safety',
    'Fraud and scam prevention',
  ]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    'English',
    'Kannada Native (ಕನ್ನಡ)',
    'Romanized Kannada',
    'Kanglish (Code-Mixed)',
  ]);
  const [reviewStatus, setReviewStatus] = useState<
    'Approved' | 'Pending Review' | 'In Progress' | 'Requires Correction'
  >('In Progress');

  const { showToast } = useToast();

  const allCategories = [
    'Cybersecurity safety',
    'Fraud and scam prevention',
    'Privacy and personal data protection',
    'Physical safety',
    'Harmful-content boundary testing',
    'Benign educational questions',
    'Harmless everyday questions',
  ];

  const allLanguages = [
    'English',
    'Kannada Native (ಕನ್ನಡ)',
    'Romanized Kannada',
    'Kanglish (Code-Mixed)',
  ];

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast({ type: 'warning', title: 'Name Required', message: 'Please provide a dataset name.' });
      return;
    }

    const newDataset: DatasetMeta = {
      id: `ds-${Date.now().toString(36)}`,
      name,
      version: version || 'v1.0.0',
      description,
      testCaseCount: 0,
      languages: selectedLanguages,
      categories: selectedCategories,
      validationStatus: 'draft',
      reviewStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
      author: 'Dr. Thriveni S A',
    };

    onCreate(newDataset);
    showToast({
      type: 'success',
      title: 'Dataset Created',
      message: `"${newDataset.name}" has been registered.`,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Benchmark Dataset"
      description="Register a new structured multilingual safety evaluation dataset."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="font-semibold text-slate-300 block mb-1">Dataset Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Regional Dialect & Transliteration Bank"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Version</label>
            <input
              type="text"
              placeholder="v1.0.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-300 block mb-1">Description & Scope</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the research intent, domain, and evaluation boundaries of this dataset..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Languages Selection */}
        <div>
          <label className="font-semibold text-slate-300 block mb-1">Supported Language Variants</label>
          <div className="grid grid-cols-2 gap-2">
            {allLanguages.map((lang) => {
              const selected = selectedLanguages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                    selected
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Selection */}
        <div>
          <label className="font-semibold text-slate-300 block mb-1">Evaluation Categories Covered</label>
          <div className="flex flex-wrap gap-1.5">
            {allCategories.map((cat) => {
              const selected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
                    selected
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-300 block mb-1">Review Status</label>
          <select
            value={reviewStatus}
            onChange={(e) => setReviewStatus(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none"
          >
            <option value="In Progress">In Progress</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Requires Correction">Requires Correction</option>
          </select>
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
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30"
          >
            <Plus className="h-4 w-4" /> Create Dataset
          </button>
        </div>
      </form>
    </Modal>
  );
};
