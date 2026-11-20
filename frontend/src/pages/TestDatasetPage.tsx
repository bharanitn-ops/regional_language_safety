import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  RotateCw,
  Eye,
  Trash2,
  Calendar,
  Layers,
  Globe,
  Tag,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { DatasetMeta, TestCase } from '../types';
import { apiService } from '../api/service';
import { CreateDatasetModal } from '../components/modals/CreateDatasetModal';
import { DatasetDetailsModal } from '../components/modals/DatasetDetailsModal';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

export const TestDatasetPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetMeta[]>([
    {
      id: 'canonical-r2-v1',
      name: 'Canonical R2 Multilingual Safety Bank',
      version: 'v1.0.4',
      testCaseCount: 6,
      languages: ['English', 'Kannada Native (ಕನ್ನಡ)', 'Romanized Kannada', 'Kanglish (Code-Mixed)'],
      validationStatus: 'validated',
      reviewStatus: 'Approved',
      description: 'Standardized 4-way paired benchmark probes across Cyber Exploitation, Phishing, Shellcode Evasion, and Benign Cultural Controls.',
      lastUpdated: '2026-11-20',
      categories: ['Cybersecurity safety', 'Fraud and scam prevention', 'Harmful-content boundary testing', 'Benign educational questions'],
      author: 'AI Research R2 Core Team',
    },
    {
      id: 'dialect-kanglish-v1',
      name: 'Extended Regional Dialect & Code-Mixing Bank',
      version: 'v0.8.2',
      testCaseCount: 12,
      languages: ['English', 'Kannada Native (ಕನ್ನಡ)', 'Romanized Kannada', 'Kanglish (Code-Mixed)'],
      validationStatus: 'draft',
      reviewStatus: 'Pending Review',
      description: 'Colloquial conversational Kanglish expressions, phonetically transliterated queries, and North Karnataka dialectal probes.',
      lastUpdated: '2026-11-19',
      categories: ['Cybersecurity safety', 'Fraud and scam prevention', 'Harmless everyday questions'],
      author: 'Linguistic Evaluation Team',
    },
  ]);

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDetailsDataset, setSelectedDetailsDataset] = useState<DatasetMeta | null>(null);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [dsData, tcData] = await Promise.allSettled([
        apiService.getDatasets(),
        apiService.getTestCases(),
      ]);

      if (dsData.status === 'fulfilled' && dsData.value && dsData.value.length > 0) {
        setDatasets(dsData.value);
      }
      if (tcData.status === 'fulfilled' && tcData.value) {
        setTestCases(tcData.value);
      }
    } catch (err: any) {
      console.warn('Backend synchronization notice:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter datasets by search query
  const filteredDatasets = datasets.filter((ds) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      ds.name.toLowerCase().includes(q) ||
      ds.version.toLowerCase().includes(q) ||
      ds.description.toLowerCase().includes(q) ||
      ds.categories.some((c) => c.toLowerCase().includes(q)) ||
      ds.languages.some((l) => l.toLowerCase().includes(q))
    );
  });

  const handleExportJSON = (ds: DatasetMeta) => {
    const data = {
      dataset: ds,
      testCases: testCases.filter((tc) => tc.dataset_version === ds.version || ds.id === 'canonical-r2-v1'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ds.name.replace(/\s+/g, '_')}_${ds.version}.json`;
    link.click();
    showToast({ type: 'success', title: 'Export Complete', message: 'Dataset JSON downloaded.' });
  };

  const handleExportCSV = (ds: DatasetMeta) => {
    const relevant = testCases.filter((tc) => tc.dataset_version === ds.version || ds.id === 'canonical-r2-v1');
    const rows = [
      ['Benchmark ID', 'Category', 'Risk Level', 'English Prompt', 'Kannada Native Prompt', 'Romanized Kannada', 'Kanglish Prompt', 'Expected Behaviour', 'Review Status'],
      ...relevant.map((tc) => [
        `"${tc.benchmark_id}"`,
        `"${tc.category}"`,
        `"${tc.risk_level}"`,
        `"${tc.english_prompt.replace(/"/g, '""')}"`,
        `"${tc.kannada_native_prompt.replace(/"/g, '""')}"`,
        `"${tc.kannada_romanized_prompt.replace(/"/g, '""')}"`,
        `"${tc.kanglish_prompt.replace(/"/g, '""')}"`,
        `"${(tc.expected_safe_behaviour || '').replace(/"/g, '""')}"`,
        `"${(tc.reviewer_status || 'Approved').replace(/"/g, '""')}"`,
      ]),
    ];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ds.name.replace(/\s+/g, '_')}_${ds.version}.csv`;
    link.click();
    showToast({ type: 'success', title: 'Export Complete', message: 'Dataset CSV downloaded.' });
  };

  const handleCreateDataset = async (newDataset: DatasetMeta) => {
    try {
      setLoading(true);
      await apiService.createDataset({
        id: newDataset.id,
        name: newDataset.name,
        version: newDataset.version,
        description: newDataset.description,
        languages: newDataset.languages,
        categories: newDataset.categories,
        validationStatus: newDataset.validationStatus,
        reviewStatus: newDataset.reviewStatus,
        author: newDataset.author,
      });

      showToast({
        type: 'success',
        title: 'Dataset Created',
        message: `Dataset "${newDataset.name}" has been registered and persisted.`,
      });
      await loadData();
    } catch (err: any) {
      setDatasets((prev) => [newDataset, ...prev]);
      showToast({
        type: 'info',
        title: 'Dataset Registered (Local)',
        message: `Dataset "${newDataset.name}" saved in session state.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDataset = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete dataset "${name}"?`)) return;
    try {
      setLoading(true);
      await apiService.deleteDataset(id);
      showToast({
        type: 'success',
        title: 'Dataset Deleted',
        message: `"${name}" removed from database.`,
      });
      await loadData();
    } catch (err: any) {
      setDatasets((prev) => prev.filter((d) => d.id !== id));
      showToast({
        type: 'info',
        title: 'Dataset Removed',
        message: `"${name}" removed from local state.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-w-0">
      {/* 1. HEADING & ADD DATASET BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-2.5">
            <Database className="h-6 w-6 text-blue-500" />
            Dataset Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Explore, create, and manage multilingual safety benchmark datasets for BhashaShield AI.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Refresh button */}
          <button
            onClick={loadData}
            title="Refresh datasets"
            className="p-2.5 rounded-xl bg-navy-800 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* 4. ADD DATASET BUTTON */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Dataset</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search datasets by name, version, description, category or language..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-navy-800/90 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 3. DATASET TABLE */}
      <div className="rounded-2xl bg-navy-800/90 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Registered Datasets
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              {filteredDatasets.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Showing {filteredDatasets.length} of {datasets.length} datasets
          </span>
        </div>

        {filteredDatasets.length === 0 ? (
          <EmptyState
            icon={Database}
            title={datasets.length === 0 ? 'No Datasets Available' : 'No Matching Datasets'}
            description={
              datasets.length === 0
                ? "No benchmark datasets have been created yet. Click 'Add Dataset' to register your first dataset."
                : `No datasets match your search query "${searchQuery}". Try a different keyword.`
            }
            actionLabel={datasets.length === 0 ? 'Add First Dataset' : 'Clear Search'}
            onAction={() => {
              if (datasets.length === 0) {
                setCreateModalOpen(true);
              } else {
                setSearchQuery('');
              }
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800 font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-5">Dataset Name</th>
                  <th className="py-3.5 px-3 sm:px-4">Version</th>
                  <th className="py-3.5 px-3 sm:px-4">Test Cases</th>
                  <th className="py-3.5 px-3 sm:px-4 hidden md:table-cell">Languages Available</th>
                  <th className="py-3.5 px-3 sm:px-4 hidden lg:table-cell">Last Updated</th>
                  <th className="py-3.5 px-3 sm:px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredDatasets.map((ds) => (
                  <tr
                    key={ds.id}
                    onClick={() => setSelectedDetailsDataset(ds)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Dataset Name & Description */}
                    <td className="py-3.5 px-4 sm:px-5 font-semibold text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                          <Database className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                            {ds.name}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs sm:max-w-md font-normal mt-0.5">
                            {ds.description || 'No description provided.'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Version */}
                    <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] text-blue-400 font-bold whitespace-nowrap">
                      {ds.version}
                    </td>

                    {/* Test Cases Count */}
                    <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-200 whitespace-nowrap">
                      {ds.testCaseCount || (ds.id === 'canonical-r2-v1' ? testCases.length || 6 : 0)} Pairs
                    </td>

                    {/* Languages Available */}
                    <td className="py-3.5 px-3 sm:px-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                          EN
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-kannada">
                          ಕನ್ನಡ
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">
                          Translit
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                          Kanglish
                        </span>
                      </div>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-3 sm:px-4 text-slate-400 text-[11px] font-mono whitespace-nowrap hidden lg:table-cell">
                      {ds.lastUpdated}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          ds.validationStatus === 'validated'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {ds.validationStatus === 'validated' ? 'Validated' : 'Draft / In Review'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-5 text-right font-sans whitespace-nowrap">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedDetailsDataset(ds)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-semibold transition-colors flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </button>

                        <button
                          onClick={() => handleDeleteDataset(ds.id, ds.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Dataset"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* Add Dataset Modal */}
      <CreateDatasetModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateDataset}
      />

      {/* Dataset Details Modal */}
      <DatasetDetailsModal
        dataset={selectedDetailsDataset}
        testCases={testCases}
        isOpen={selectedDetailsDataset !== null}
        onClose={() => setSelectedDetailsDataset(null)}
        onExportJSON={() => selectedDetailsDataset && handleExportJSON(selectedDetailsDataset)}
        onExportCSV={() => selectedDetailsDataset && handleExportCSV(selectedDetailsDataset)}
      />
    </div>
  );
};
