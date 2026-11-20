import React, { useState } from 'react';
import {
  Shield,
  Radio,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Cpu,
  User,
  Sparkles,
  AlertTriangle,
  Tv,
} from 'lucide-react';
import { HealthResponse, NotificationItem } from '../../types';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { Tooltip } from '../common/Tooltip';

interface NavbarProps {
  currentTab: string;
  health: HealthResponse | null;
  loading: boolean;
  selectedGlobalModel: string;
  onSelectGlobalModel: (model: string) => void;
  onOpenNewExperiment: () => void;
  onOpenPresentation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  health,
  loading,
  selectedGlobalModel,
  onSelectGlobalModel,
  onOpenPresentation,
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [themeDark, setThemeDark] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Kanglish Evasion Vulnerability Detected',
      message: 'High ASR (83.3%) detected in transliterated cyber exploit probes without guard.',
      type: 'alert',
      time: '12m ago',
      read: false,
    },
    {
      id: '2',
      title: 'Bilingual Guard Defense Verification',
      message: 'Pre-generation cross-lingual alignment wrapper successfully mitigated 100% of Kanglish bypasses.',
      type: 'success',
      time: '45m ago',
      read: false,
    },
    {
      id: '3',
      title: 'Canonical Benchmark Updated',
      message: '6 four-way parallel test pairs initialized in database.',
      type: 'info',
      time: '1h ago',
      read: true,
    },
  ]);

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    overview: { title: 'Research Overview & Metrics', subtitle: 'Multilingual safety intelligence & ASR disparity' },
    'testing-lab': { title: 'Testing Lab & Single Probe Auditor', subtitle: 'Real-time cross-script prompt evaluation' },
    'language-comparison': { title: 'Language & Modality Comparison', subtitle: 'Parity deltas across English, Kannada script, Romanized & Kanglish' },
    'model-evaluation': { title: 'Open-Weight Model Benchmark', subtitle: 'Cross-model safety and refusal alignment comparison' },
    'safety-analysis': { title: 'Safety Analysis & Failure Modes', subtitle: 'Categorical threat breakdown and over-refusal diagnosis' },
    'guard-lab': { title: 'Bilingual Safety Guard Inspector', subtitle: 'Real-time pre/post generation defense evaluation' },
    'bsg-demo': { title: 'Bilingual Safety Guard Demo', subtitle: '5-stage workflow & baseline comparison' },
    'research-reports': { title: 'Research Reports & Disclosures', subtitle: 'Empirical research findings and exportable whitepapers' },
    'demo-results': { title: 'Demo Results Comparison', subtitle: 'Sample metrics & latency across languages' },
    'test-dataset': { title: 'Canonical Test Dataset Bank', subtitle: '4-way paired benchmark test repository' },
    settings: { title: 'Platform & Adapter Settings', subtitle: 'Thresholds, model adapters, and research environment' },
  };

  const currentInfo = pageTitles[currentTab] || { title: 'Overview', subtitle: 'Safety Intelligence' };
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleTheme = () => {
    setThemeDark(!themeDark);
    if (themeDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between shrink-0">
      {/* Left: Page Title & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span>BhashaShield AI</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-blue-400 font-semibold capitalize">{currentTab.replace('-', ' ')}</span>
          </div>
          <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Presentation Mode Button */}
        {onOpenPresentation && (
          <Tooltip content="Launch Full-Screen Presentation for Judges" position="bottom">
            <button
              onClick={onOpenPresentation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Tv className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Presentation</span>
            </button>
          </Tooltip>
        )}

        {/* Global Model Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
          <Cpu className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span className="text-slate-400 text-[11px]">Active Model:</span>
          <select
            value={selectedGlobalModel}
            onChange={(e) => onSelectGlobalModel(e.target.value)}
            className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
          >
            <option value="mock-research-adapter" className="bg-slate-900">BhashaShield Baseline (Simulation)</option>
            <option value="sarvam-2b-indic" className="bg-slate-900">Sarvam-2B-Indic (Indic Specialized)</option>
            <option value="llama3-8b-instruct" className="bg-slate-900">Llama-3-8B-Instruct (Meta)</option>
            <option value="mistral-7b-instruct" className="bg-slate-900">Mistral-7B-Instruct (Mistral AI)</option>
          </select>
        </div>

        {/* Experiment Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
          <Radio className={`h-3 w-3 ${loading ? 'text-slate-500 animate-pulse' : health?.status === 'healthy' ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="text-slate-300 font-mono hidden sm:inline">
            {health?.status === 'healthy' ? 'Online' : 'Degraded'}
          </span>
          {health?.demo_mode && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Demo
            </span>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <Tooltip content="Safety Intelligence Alerts" position="bottom">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </Tooltip>
          <NotificationDrawer
            isOpen={notificationOpen}
            onClose={() => setNotificationOpen(false)}
            notifications={notifications}
            onMarkAllAsRead={markAllAsRead}
          />
        </div>

        {/* Theme Toggle */}
        <Tooltip content={themeDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'} position="bottom">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            {themeDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
          </button>
        </Tooltip>

        {/* User / Profile Menu */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-900/30">
            TS
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">Dr. Thriveni S A</div>
            <div className="text-[10px] text-slate-500 leading-tight">Lead AI Safety Researcher</div>
          </div>
        </div>
      </div>
    </header>
  );
};
