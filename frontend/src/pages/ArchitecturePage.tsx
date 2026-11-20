import React from 'react';
import {
  Layers,
  BookOpen,
  Cpu,
  Shield,
  FileCheck2,
  Workflow,
  CheckCircle,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          BhashaShield AI — Architecture & Research Specification
        </h1>
        <p className="text-sm text-slate-400">
          Technical design of the multilingual AI safety evaluation platform for the AI Research R2 hackathon.
        </p>
      </div>

      {/* 9 Core Modules */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          The 9 Core Logical Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[
            { id: '1', title: 'Frontend Dashboard', desc: 'React, Vite, Tailwind CSS, Recharts for cross-modality ASR and over-refusal visualization.' },
            { id: '2', title: 'Backend REST API', desc: 'FastAPI, Pydantic, modular routing, structured logging and health-check endpoints.' },
            { id: '3', title: 'Model Adapter Layer', desc: 'Pluggable AbstractBaseModelAdapter supporting open-weight models (Llama, IndicLLM, Mistral).' },
            { id: '4', title: 'Multilingual Test-Case Bank', desc: 'Canonical 4-way parallel safety benchmark (English, Native Kannada, Romanized, Kanglish).' },
            { id: '5', title: 'Safety Evaluation Engine', desc: 'Classifies outputs into SAFE_REFUSAL, UNSAFE_COMPLIANCE, OVER_REFUSAL, and AMBIGUOUS.' },
            { id: '6', title: 'Language Comparison Engine', desc: 'Calculates cross-lingual safety disparity, refusal parity delta, and Attack Success Rate (ASR).' },
            { id: '7', title: 'Bilingual Safety Guard', desc: 'Language-aware pre-generation intent normalization and post-generation safety containment.' },
            { id: '8', title: 'Research Report Generator', desc: 'Aggregates empirical experiment metrics, exportable audit trails, and reproducible findings.' },
            { id: '9', title: 'Database & Experiment History', desc: 'Async SQLAlchemy and SQLite/PostgreSQL storing runs, test cases, and safety determinations.' },
          ].map((m) => (
            <div key={m.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-emerald-400">Module {m.id}</div>
              <div className="text-sm font-semibold text-slate-200">{m.title}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Research Hypotheses & Constraints */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-yellow-400" />
          Research Principles & Constraints
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100">No Preconceptions:</strong> Do not assume Kannada is inherently less safe than English.
              The safety disparity is an empirical research question measuring training representation and refusal transfer.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100">Empirical Integrity:</strong> Never hardcode fake evaluation results as real research findings.
              All metrics on the dashboard are calculated from actual recorded experiment runs. Demo mode is prominently watermarked.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100">Responsible Disclosure & Safety:</strong> Probes are non-operational, controlled safety indicators.
              Harmful exploit payloads are prevented from dissemination.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
