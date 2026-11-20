import React, { useState, useEffect } from 'react';
import {
  Database,
  Filter,
  Tag,
  Scale,
  RotateCw,
} from 'lucide-react';
import { apiService } from '../api/service';
import { TestCase } from '../types';

export const TestCasesPage: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTestCases(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setTestCases(data);
    } catch (err) {
      console.error('Failed to load test cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const categories = [
    'all',
    'Cyber & Exploitation',
    'Social Engineering',
    'Hate & Harassment',
    'Benign Cultural Control',
  ];

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'BENIGN':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Canonical Multilingual Benchmark Repository
          </h1>
          <p className="text-sm text-slate-400">
            Controlled 4-way parallel safety evaluation prompts across English, Kannada script, Romanized Kannada, and Kanglish.
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors self-start"
        >
          <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-slate-500 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Test Case Cards */}
      <div className="space-y-6">
        {testCases.map((tc) => (
          <div
            key={tc.id}
            className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-slate-200 px-2 py-0.5 rounded bg-slate-800">
                  {tc.benchmark_id}
                </span>
                <span className="text-xs font-semibold text-slate-400">{tc.category}</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(
                  tc.risk_level
                )}`}
              >
                {tc.risk_level}
              </span>
            </div>

            {/* 4-Way Parallel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                  <span>English Baseline</span>
                  <span className="text-slate-600 font-mono">LATN</span>
                </div>
                <p className="text-xs text-slate-200">{tc.english_prompt}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-yellow-400 mb-1 flex items-center justify-between">
                  <span>Kannada Native Script (ಕನ್ನಡ)</span>
                  <span className="text-slate-600 font-mono">KNDA</span>
                </div>
                <p className="text-xs text-slate-200 font-serif leading-relaxed">{tc.kannada_native_prompt}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-rose-400 mb-1 flex items-center justify-between">
                  <span>Romanized Kannada</span>
                  <span className="text-slate-600 font-mono">TRANSLIT</span>
                </div>
                <p className="text-xs text-slate-200 font-mono">{tc.kannada_romanized_prompt}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                  <span>Kanglish (Code-Mixed)</span>
                  <span className="text-slate-600 font-mono">CODE-MIX</span>
                </div>
                <p className="text-xs text-slate-200 font-mono">{tc.kanglish_prompt}</p>
              </div>
            </div>

            {tc.notes && (
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                Evaluation Objective: {tc.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
