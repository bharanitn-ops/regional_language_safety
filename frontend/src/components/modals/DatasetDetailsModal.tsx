import React from 'react';
import {
  Database,
  Calendar,
  Layers,
  Tag,
  CheckCircle2,
  Clock,
  Download,
  X,
  FileSpreadsheet,
  Globe,
  User,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { DatasetMeta, TestCase } from '../../types';
import { Badge } from '../common/Badge';

interface DatasetDetailsModalProps {
  dataset: DatasetMeta | null;
  testCases: TestCase[];
  isOpen: boolean;
  onClose: () => void;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
}

export const DatasetDetailsModal: React.FC<DatasetDetailsModalProps> = ({
  dataset,
  testCases,
  isOpen,
  onClose,
  onExportJSON,
  onExportCSV,
}) => {
  if (!dataset) return null;

  const datasetCases = testCases.filter(
    (tc) => tc.dataset_version === dataset.version || dataset.id === 'canonical-r2-v1'
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dataset.name}
      description={`Version ${dataset.version} • Last updated ${dataset.lastUpdated}`}
      maxWidth="xl"
    >
      <div className="space-y-6 text-xs text-slate-300">
        {/* Status & Review Metadata Bar */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Test Case Count</span>
            <span className="font-extrabold text-blue-400 text-sm">
              {dataset.testCaseCount || datasetCases.length} Canonical Pairs
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Multi-Script Probes</span>
            <span className="font-extrabold text-yellow-400 text-sm">
              {(dataset.testCaseCount || datasetCases.length) * 4} Variations
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Validation Status</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                dataset.validationStatus === 'validated'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {dataset.validationStatus === 'validated' ? 'Validated' : 'Draft / In Review'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Review Status</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                dataset.reviewStatus === 'Approved'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
              }`}
            >
              {dataset.reviewStatus || 'Approved'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Dataset Overview & Research Scope
          </h4>
          <p className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
            {dataset.description}
          </p>
        </div>

        {/* Language Variants */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            Language Representations
          </h4>
          <div className="flex flex-wrap gap-2">
            {(dataset.languages || ['English', 'Kannada Native (ಕನ್ನಡ)', 'Romanized Kannada', 'Kanglish']).map((l) => (
              <span
                key={l}
                className="px-2.5 py-1 rounded-lg bg-navy-900 border border-slate-800 text-slate-200 font-medium text-[11px]"
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-emerald-400" />
            Covered Evaluation Categories
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {dataset.categories.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-[11px]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Test Cases Preview */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Sample Test Cases in Dataset ({datasetCases.length})
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {datasetCases.slice(0, 4).map((tc) => (
              <div
                key={tc.id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-blue-400 px-1.5 py-0.2 rounded bg-blue-500/10">
                      {tc.benchmark_id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300">{tc.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{tc.english_prompt}</p>
                </div>
                <Badge type="risk" value={tc.risk_level} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" /> Export JSON
            </button>
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" /> Export CSV
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
