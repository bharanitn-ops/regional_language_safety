import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Globe2,
  ShieldCheck,
  Users,
  BarChart3,
  Target,
  Eye,
  Lock,
  Sparkles,
  Rocket,
  Scale,
  Handshake,
  X,
} from 'lucide-react';

interface IndicAboutPageProps {
  onBack: () => void;
}

export const IndicAboutPage: React.FC<IndicAboutPageProps> = ({ onBack }) => {
  const [missionModalOpen, setMissionModalOpen] = useState(false);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-w-0">
      {/* 1. PAGE HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-[#D8E1FF] text-[#1769F5] hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#101A9B] tracking-tight leading-tight">
            About
          </h1>
          <p className="text-xs text-[#64748B] font-medium">
            Learn more about IndicShield AI
          </p>
        </div>
      </div>

      {/* 2. SECTION A — HERO BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-[#DDE9FF] via-[#EDF3FF] to-[#DDE9FF] border border-[#D8E1FF] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Soft radial glow */}
        <div className="absolute right-10 top-0 bottom-0 w-80 bg-radial from-blue-300/30 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          {/* Left: Typography & Mission CTA */}
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black text-[#101A9B] tracking-tight">
              IndicShield AI
            </h2>
            <h3 className="text-sm sm:text-base font-bold text-[#101A9B]">
              Building a Safer, More Responsible AI for Bharat and Beyond
            </h3>
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
              IndicShield AI is a comprehensive platform to evaluate, monitor, and enhance the safety of AI models — with a special focus on India's diverse languages, cultural context, and unique use cases.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setMissionModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#873BEE] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#873BEE]/25 transition-all cursor-pointer active:scale-98"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Our Mission</span>
              </button>
            </div>
          </div>

          {/* Right: 3D Shield with Glowing Ring & Floating Badges */}
          <div className="relative w-72 h-64 shrink-0 flex items-center justify-center">
            {/* Center 3D Shield Graphic */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="h-28 w-28 rounded-3xl bg-gradient-to-tr from-[#1769F5] to-[#38BDF8] p-1 shadow-2xl shadow-blue-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-[#1769F5] rounded-[20px] flex items-center justify-center shadow-inner relative">
                  {/* Padlock */}
                  <Lock className="h-12 w-12 text-white stroke-[2.2]" />
                </div>
              </div>
              {/* Elliptical Glowing Orbit */}
              <div className="absolute -inset-6 rounded-full border-2 border-blue-400/50 -rotate-12 pointer-events-none animate-pulse" />
            </div>

            {/* Floating Badge 1: Multilingual Safety (Top Left) */}
            <div className="absolute top-2 left-0 px-3 py-1.5 rounded-full bg-white border border-[#D8E1FF] text-[11px] font-bold text-[#101A9B] shadow-sm flex items-center gap-1.5 z-20">
              <Globe2 className="h-3.5 w-3.5 text-[#1769F5]" />
              <span>Multilingual Safety</span>
            </div>

            {/* Floating Badge 2: Responsible AI (Top Right) */}
            <div className="absolute top-4 right-0 px-3 py-1.5 rounded-full bg-white border border-[#D8E1FF] text-[11px] font-bold text-[#101A9B] shadow-sm flex items-center gap-1.5 z-20">
              <ShieldCheck className="h-3.5 w-3.5 text-[#16B981]" />
              <span>Responsible AI</span>
            </div>

            {/* Floating Badge 3: Inclusive Technology (Bottom Left) */}
            <div className="absolute bottom-4 left-2 px-3 py-1.5 rounded-full bg-white border border-[#D8E1FF] text-[11px] font-bold text-[#101A9B] shadow-sm flex items-center gap-1.5 z-20">
              <Users className="h-3.5 w-3.5 text-[#873BEE]" />
              <span>Inclusive Technology</span>
            </div>

            {/* Floating Badge 4: Trusted Insights (Bottom Right) */}
            <div className="absolute bottom-3 right-0 px-3 py-1.5 rounded-full bg-white border border-[#D8E1FF] text-[11px] font-bold text-[#101A9B] shadow-sm flex items-center gap-1.5 z-20">
              <BarChart3 className="h-3.5 w-3.5 text-[#1769F5]" />
              <span>Trusted Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION B — MISSION AND VISION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Card: Our Mission */}
        <div className="bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#1769F5]" />
            <h3 className="text-base font-bold text-[#101A9B]">Our Mission</h3>
          </div>

          <div className="flex items-center gap-5 my-auto">
            {/* Rocket illustration */}
            <div className="h-16 w-16 rounded-2xl bg-[#EFF6FF] text-[#1769F5] flex items-center justify-center shrink-0">
              <Rocket className="h-8 w-8 -rotate-45" />
            </div>

            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-medium">
              To make AI safer, more inclusive, and trustworthy for everyone — across languages, cultures, and communities.
            </p>
          </div>
        </div>

        {/* Right Card: Our Vision */}
        <div className="bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-[#1769F5]" />
            <h3 className="text-base font-bold text-[#101A9B]">Our Vision</h3>
          </div>

          <div className="flex items-center gap-5 my-auto">
            {/* Balance scales illustration */}
            <div className="h-16 w-16 rounded-2xl bg-[#F5F3FF] text-[#873BEE] flex items-center justify-center shrink-0">
              <Scale className="h-8 w-8" />
            </div>

            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-medium">
              A future where AI is not just powerful, but also safe, fair, and beneficial for all, in every language.
            </p>
          </div>
        </div>
      </div>

      {/* 4. SECTION C — KEY FEATURES */}
      <div className="bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#1769F5]" />
          <h3 className="text-base font-bold text-[#101A9B]">Key Features</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8F0]">
          {/* Feature 1: Safety Evaluation */}
          <div className="flex flex-col items-center text-center p-3 lg:px-4 space-y-2">
            <div className="h-12 w-12 rounded-xl bg-[#ECFDF5] text-[#16B981] flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[#101A9B]">Safety Evaluation</h4>
            <p className="text-xs text-[#64748B]">Assess AI model risks</p>
          </div>

          {/* Feature 2: Multilingual Support */}
          <div className="flex flex-col items-center text-center p-3 lg:px-4 space-y-2 pt-4 lg:pt-3">
            <div className="h-12 w-12 rounded-xl bg-[#EFF6FF] text-[#1769F5] flex items-center justify-center shadow-xs">
              <Globe2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[#101A9B]">Multilingual Support</h4>
            <p className="text-xs text-[#64748B]">Test in 22+ languages</p>
          </div>

          {/* Feature 3: Actionable Insights */}
          <div className="flex flex-col items-center text-center p-3 lg:px-4 space-y-2 pt-4 lg:pt-3">
            <div className="h-12 w-12 rounded-xl bg-[#EFF6FF] text-[#1769F5] flex items-center justify-center shadow-xs">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[#101A9B]">Actionable Insights</h4>
            <p className="text-xs text-[#64748B]">Understand and improve</p>
          </div>

          {/* Feature 4: Privacy First */}
          <div className="flex flex-col items-center text-center p-3 lg:px-4 space-y-2 pt-4 lg:pt-3">
            <div className="h-12 w-12 rounded-xl bg-[#F5F3FF] text-[#873BEE] flex items-center justify-center shadow-xs">
              <Lock className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[#101A9B]">Privacy First</h4>
            <p className="text-xs text-[#64748B]">Your data, always secure</p>
          </div>
        </div>
      </div>

      {/* 5. SECTION D — BOTTOM BRAND BANNER */}
      <div className="rounded-3xl bg-white border border-[#D8E1FF] p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Left: Handshake & Mission Statement */}
        <div className="flex items-center gap-4 relative z-10 max-w-xl">
          <div className="h-12 w-12 rounded-2xl bg-[#EFF6FF] text-[#1769F5] flex items-center justify-center shrink-0">
            <Handshake className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#101A9B]">
              Built for a Responsible AI Future
            </h4>
            <p className="text-xs text-[#334155] font-medium mt-0.5 leading-relaxed">
              IndicShield AI is committed to advancing responsible AI through innovation, transparency, and collaboration.
            </p>
          </div>
        </div>

        {/* Right: Indian Architectural Skyline Illustration */}
        <div className="shrink-0 opacity-40 flex items-end gap-1.5 h-12 text-[#1769F5]">
          <svg className="h-12 w-48" viewBox="0 0 200 50" fill="currentColor">
            {/* India Gate arch & monuments silhouette */}
            <rect x="10" y="25" width="25" height="25" rx="1" />
            <rect x="17" y="15" width="11" height="10" />
            <polygon points="12,15 22.5,5 33,15" />

            {/* Temple Gopuram / Dome */}
            <path d="M 50,50 L 50,20 Q 65,5 80,20 L 80,50 Z" />
            <circle cx="65" cy="5" r="2" />

            {/* Central Taj Mahal dome silhouette */}
            <rect x="95" y="30" width="30" height="20" />
            <path d="M 98,30 Q 110,10 122,30 Z" />
            <line x1="110" y1="10" x2="110" y2="4" stroke="currentColor" strokeWidth="2" />
            <circle cx="110" cy="3" r="1.5" />

            {/* Minarets */}
            <rect x="88" y="15" width="4" height="35" />
            <polygon points="86,15 90,8 94,15" />
            <rect x="128" y="15" width="4" height="35" />
            <polygon points="126,15 130,8 134,15" />

            {/* Modern skyline blocks */}
            <rect x="145" y="20" width="12" height="30" />
            <rect x="162" y="12" width="14" height="38" />
            <rect x="180" y="25" width="10" height="25" />
          </svg>
        </div>
      </div>

      {/* Mission Information Modal */}
      {missionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#873BEE]" />
                <h3 className="font-bold text-[#101A9B]">Our Research Mission</h3>
              </div>
              <button
                onClick={() => setMissionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
              <p>
                <strong>The Problem:</strong> Leading foundational models often perform robust refusal on harmful English prompts, but fail significantly when identical intents are transliterated or code-mixed into Indic languages like Kannada and Kanglish.
              </p>
              <p>
                <strong>The Solution:</strong> IndicShield AI develops language-aware pre/post-generation safety guardrails (Bilingual Safety Guard) that restore alignment parity across script variants without degrading helpfulness on regional cultural queries.
              </p>
              <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] font-semibold">
                Equal safety for every language speaker is our primary commitment.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setMissionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#873BEE] hover:bg-[#7025D8] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
