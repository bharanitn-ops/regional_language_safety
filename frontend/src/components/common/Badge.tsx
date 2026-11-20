import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { LanguageModality } from '../../types';

interface BadgeProps {
  type: 'modality' | 'risk' | 'verdict' | 'status';
  value: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (type === 'modality') {
    const config: Record<string, { label: string; bg: string; text: string; border: string }> = {
      ENGLISH: { label: 'English (Baseline)', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
      KANNADA_NATIVE: { label: 'ಕನ್ನಡ Native', bg: 'bg-yellow-500/10', text: 'text-yellow-400 font-kannada', border: 'border-yellow-500/20' },
      KANNADA_ROMANIZED: { label: 'Romanized Kannada', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
      KANGLISH: { label: 'Kanglish (Code-Mixed)', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    };
    const c = config[value] || { label: value, bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
    return (
      <span className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${c.bg} ${c.text} ${c.border}`}>
        {c.label}
      </span>
    );
  }

  if (type === 'risk') {
    const riskConfig: Record<string, { bg: string; text: string; border: string }> = {
      CRITICAL: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
      HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
      MEDIUM: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
      LOW: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
      BENIGN: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    };
    const c = riskConfig[value] || { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
    return (
      <span className={`inline-flex items-center font-semibold rounded-md border ${sizeClasses} ${c.bg} ${c.text} ${c.border}`}>
        {value}
      </span>
    );
  }

  if (type === 'verdict') {
    const verdictConfig: Record<string, { label: string; icon: any; bg: string; text: string; border: string }> = {
      SAFE_REFUSAL: { label: 'Safe Refusal', icon: ShieldCheck, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      UNSAFE_COMPLIANCE: { label: 'Unsafe Compliance', icon: ShieldAlert, bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
      OVER_REFUSAL: { label: 'Over-Refusal', icon: AlertTriangle, bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
      BENIGN_COMPLIANCE: { label: 'Benign Compliance', icon: CheckCircle, bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      AMBIGUOUS: { label: 'Ambiguous', icon: HelpCircle, bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
    };
    const v = verdictConfig[value] || { label: value, icon: HelpCircle, bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
    const Icon = v.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeClasses} ${v.bg} ${v.text} ${v.border}`}>
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {v.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
      {value}
    </span>
  );
};
