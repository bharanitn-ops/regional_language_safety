import React, { useState } from 'react';
import {
  Sliders,
  Database,
  Cpu,
  Shield,
  RotateCcw,
  CheckCircle2,
  Server,
  Zap,
  Sun,
  Moon,
  User,
  Globe,
  Radio,
} from 'lucide-react';
import { apiService } from '../api/service';
import { useToast } from '../components/common/Toast';

export const SettingsPage: React.FC = () => {
  // Model Configuration
  const [defaultModel, setDefaultModel] = useState('mock-research-adapter');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);

  // API Configuration
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);

  // Language Settings
  const [transliterationThreshold, setTransliterationThreshold] = useState(0.25);
  const [kannadaUnicodeRatio, setKannadaUnicodeRatio] = useState(0.40);
  const [enableKanglishMorphemes, setEnableKanglishMorphemes] = useState(true);

  // Theme & User Preferences
  const [themeDark, setThemeDark] = useState(true);
  const [researcherName, setResearcherName] = useState('Dr. Thriveni S A');
  const [organization, setOrganization] = useState('AI Research R2 Safety Group');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const { showToast } = useToast();

  const handleTestConnection = async () => {
    try {
      setPinging(true);
      const start = performance.now();
      await apiService.getHealth();
      const end = performance.now();
      setPingLatency(Math.round(end - start));
      showToast({
        type: 'success',
        title: 'Connection Healthy',
        message: `API responded with 200 OK in ${Math.round(end - start)}ms.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Connection Failed',
        message: err?.message || 'Unable to connect to backend service',
      });
    } finally {
      setPinging(false);
    }
  };

  const handleSeedBaselines = async () => {
    if (!window.confirm('Populate baseline comparison runs across models? This enables rich comparison data in analytics.')) {
      return;
    }
    try {
      setSeeding(true);
      await apiService.seedBaselineExperiments();
      showToast({
        type: 'success',
        title: 'Baseline Experiments Seeded',
        message: 'Successfully populated multi-model comparison dataset.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Seeding Error',
        message: err?.message || 'Failed to seed baseline data',
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveSettings = () => {
    showToast({
      type: 'success',
      title: 'Preferences Saved',
      message: 'Platform and research configuration updated successfully.',
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto min-w-0">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
          Platform Configuration & Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Manage model adapter parameters, backend API connections, multilingual linguistic rules, and user preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Model Configuration */}
        <div className="p-6 rounded-2xl bg-navy-800/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Cpu className="h-5 w-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Model Adapter Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Default Model</label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              >
                <option value="mock-research-adapter">BhashaShield Baseline (Simulation)</option>
                <option value="sarvam-2b-indic">Sarvam-2B-Indic</option>
                <option value="llama3-8b-instruct">Llama-3-8B-Instruct</option>
                <option value="mistral-7b-instruct">Mistral-7B-Instruct</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Default Temperature</span>
                <span className="font-mono text-blue-400">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer mt-2"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Max Generation Tokens</label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. API Configuration */}
        <div className="p-6 rounded-2xl bg-navy-800/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Server className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Backend API Configuration
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={pinging}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-emerald-400 font-semibold transition-colors disabled:opacity-50"
              >
                {pinging ? 'Pinging...' : 'Test Connection'}
              </button>
            </div>

            {pingLatency !== null && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                <span>API Connection: <strong className="text-white">Active & Responsive</strong></span>
                <span className="font-mono text-emerald-400 font-bold">{pingLatency}ms latency</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Language & Dialect Settings */}
        <div className="p-6 rounded-2xl bg-navy-800/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Globe className="h-5 w-5 text-yellow-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Multilingual Detection & Dialect Settings
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Kannada Unicode Threshold</span>
                  <span className="font-mono text-yellow-400">{(kannadaUnicodeRatio * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={kannadaUnicodeRatio}
                  onChange={(e) => setKannadaUnicodeRatio(parseFloat(e.target.value))}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Proportion of Unicode characters (U+0C80–U+0CFF) required to classify text as Kannada Native script.
                </p>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Romanized Lexicon Sensitivity</span>
                  <span className="font-mono text-violet-400">{(transliterationThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={transliterationThreshold}
                  onChange={(e) => setTransliterationThreshold(parseFloat(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Keyword match ratio for Romanized Kannada transliteration lexicon detection.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Kanglish Morpheme Verbalizer Scanning</div>
                <p className="text-[11px] text-slate-400">
                  Scans for inflectional verbalizers (e.g., "scan maadi", "inject maduvaga", "reset maadbeku").
                </p>
              </div>
              <input
                type="checkbox"
                checked={enableKanglishMorphemes}
                onChange={(e) => setEnableKanglishMorphemes(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Theme & User Preferences */}
        <div className="p-6 rounded-2xl bg-navy-800/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <User className="h-5 w-5 text-violet-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4. Theme & Researcher Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Lead Researcher Name</label>
              <input
                type="text"
                value={researcherName}
                onChange={(e) => setResearcherName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Organization / Laboratory</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 5. Database Actions */}
        <div className="p-6 rounded-2xl bg-navy-800/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Database className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              5. Baseline Experiment Seeding
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-semibold text-slate-200">Re-Seed Baseline Benchmark Experiments</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Populates multi-model comparative history for Sarvam Indic, Llama 3, and Mistral.
              </p>
            </div>
            <button
              onClick={handleSeedBaselines}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-blue-400 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'Seeding Dataset...' : 'Seed Baseline Runs'}
            </button>
          </div>
        </div>

        {/* Save All Actions */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-900/30 transition-all"
          >
            Save All Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
