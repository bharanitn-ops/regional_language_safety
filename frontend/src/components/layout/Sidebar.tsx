import React, { useState } from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  GitCompare,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  FileText,
  BarChart3,
  Database,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Tv,
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenPresentation?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onOpenPresentation,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      subtitle: 'Safety metrics & ASR disparity',
      icon: LayoutDashboard,
    },
    {
      id: 'testing-lab',
      label: 'Testing Lab',
      subtitle: 'Single prompt safety auditor',
      icon: FlaskConical,
    },
    {
      id: 'language-comparison',
      label: 'Language Comparison',
      subtitle: 'Native, Romanized & Kanglish',
      icon: GitCompare,
    },
    {
      id: 'model-evaluation',
      label: 'Model Evaluation',
      subtitle: 'Open-weight benchmark matrix',
      icon: Cpu,
    },
    {
      id: 'safety-analysis',
      label: 'Safety Analysis',
      subtitle: 'Threat vectors & over-refusal',
      icon: ShieldAlert,
    },
    {
      id: 'guard-lab',
      label: 'Guard Lab',
      subtitle: 'Bilingual Safety Guard defense',
      icon: ShieldCheck,
    },
    {
      id: 'bsg-demo',
      label: 'Guard Demo',
      subtitle: '5-stage workflow & baseline',
      icon: Shield,
    },
    {
      id: 'research-reports',
      label: 'Research Reports',
      subtitle: 'Findings & disclosures',
      icon: FileText,
    },
    {
      id: 'demo-results',
      label: 'Demo Comparison',
      subtitle: 'Sample metrics & latency',
      icon: BarChart3,
    },
    {
      id: 'test-dataset',
      label: 'Dataset Manager',
      subtitle: '4-way paired benchmark bank',
      icon: Database,
    },
    {
      id: 'settings',
      label: 'Settings',
      subtitle: 'Adapters & system config',
      icon: Sliders,
    },
  ];

  return (
    <aside
      className={`border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between transition-all duration-300 select-none shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top: Logo & Nav items */}
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-800/80 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-blue-900/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            {!collapsed && (
              <div className="leading-none whitespace-nowrap">
                <span className="font-extrabold text-sm text-white tracking-tight">BhashaShield</span>
                <span className="text-xs text-blue-400 font-semibold ml-1">AI</span>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">R2 Safety Research</div>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors hidden md:flex items-center justify-center"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-3 overflow-y-auto space-y-1">
          {!collapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1 mb-1">
              Safety Intelligence
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const content = (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <div className="text-left leading-tight truncate">
                    <div className="text-xs font-medium text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                  </div>
                )}
              </button>
            );

            return collapsed ? (
              <Tooltip key={item.id} content={item.label} position="right">
                {content}
              </Tooltip>
            ) : (
              content
            );
          })}
        </div>
      </div>

      {/* Presentation Mode Quick Trigger */}
      {onOpenPresentation && (
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={onOpenPresentation}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/30 text-blue-300 font-semibold text-xs transition-all cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Launch Full-Screen Presentation Mode"
          >
            <Tv className="h-4 w-4 text-blue-400 shrink-0" />
            {!collapsed && <span>Presentation Mode</span>}
          </button>
        </div>
      )}

      {/* Bottom: Research Scope & Info */}
      <div className="p-3 border-t border-slate-800/80">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
              <span>Modality Matrix</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                4-Way
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-mono">
              <span className="text-blue-400">EN (Latin)</span>
              <span className="text-yellow-400 font-kannada">ಕನ್ನಡ (Native)</span>
              <span className="text-violet-400">Translit</span>
              <span className="text-rose-400">Kanglish</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip content="4-Way Multilingual Coverage (EN, KN, Translit, Kanglish)" position="right">
              <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                <Layers className="h-4 w-4" />
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
};
