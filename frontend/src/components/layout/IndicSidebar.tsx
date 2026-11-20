import React from 'react';
import {
  Home,
  FileText,
  Info,
  ChevronDown,
  ChevronRight,
  Tv,
  FlaskConical,
  ShieldCheck,
  Database,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';

interface IndicSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenPresentation?: () => void;
}

export const IndicSidebar: React.FC<IndicSidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenPresentation,
}) => {
  const [researchMenuOpen, setResearchMenuOpen] = React.useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
    },
    {
      id: 'about',
      label: 'About',
      icon: Info,
    },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-[#D8E1FF] flex flex-col justify-between select-none shrink-0 z-30 transition-all duration-300">
      {/* Top: Logo & Navigation */}
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-6 pb-5 flex flex-col items-center text-center">
          {/* Microphone Broadcast Logo */}
          <div className="relative mb-3 flex items-center justify-center">
            {/* Outer concentric wave rings */}
            <div className="absolute -inset-2 rounded-full border border-blue-200/60 animate-pulse opacity-60" />
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#1769F5] via-[#873BEE] to-[#38BDF8] p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative">
                {/* Custom Stylized Mic SVG matching screenshot */}
                <svg
                  className="w-8 h-8 text-[#1769F5]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="url(#mic-grad)" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#873BEE" strokeWidth="2.2" />
                  <line x1="12" x2="12" y1="19" y2="22" stroke="#1769F5" strokeWidth="2.2" />
                  <line x1="8" x2="16" y1="22" y2="22" stroke="#1769F5" strokeWidth="2.2" />
                  {/* Radio Waves */}
                  <path d="M21 7a10 10 0 0 1 0 10" stroke="#38BDF8" strokeWidth="1.8" />
                  <path d="M3 7a10 10 0 0 0 0 10" stroke="#38BDF8" strokeWidth="1.8" />
                  <defs>
                    <linearGradient id="mic-grad" x1="9" y1="2" x2="15" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1769F5" />
                      <stop offset="1" stopColor="#873BEE" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-xl font-extrabold text-[#101A9B] tracking-tight">
            IndicShield AI
          </h1>

          {/* Three-line Tagline */}
          <div className="text-xs text-[#64748B] font-medium leading-snug mt-1.5 space-y-0.5">
            <div>One Intelligence.</div>
            <div>Every Language.</div>
            <div>Equal Safety.</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 py-2 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#873BEE] to-[#A855F7] text-white shadow-lg shadow-[#873BEE]/30'
                    : 'text-[#334155] hover:text-[#101A9B] hover:bg-[#F0F4FF] border border-transparent'
                }`}
              >
                <div
                  className={`flex items-center justify-center shrink-0 ${
                    isActive ? 'text-white' : 'text-[#1769F5]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Research Lab Access & User Profile Card */}
      <div className="p-4 space-y-3">
        {/* Research Suite & Presentation Quick Access */}
        <div className="rounded-2xl bg-[#F0F4FF] border border-[#D8E1FF] overflow-hidden transition-all">
          <button
            onClick={() => setResearchMenuOpen(!researchMenuOpen)}
            className="w-full px-3 py-2 text-xs font-semibold text-[#101A9B] flex items-center justify-between hover:bg-blue-100/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#873BEE]" />
              <span>Research Suite</span>
            </div>
            <ChevronRight
              className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
                researchMenuOpen ? 'rotate-90' : ''
              }`}
            />
          </button>

          {researchMenuOpen && (
            <div className="p-2 pt-0 space-y-1 text-xs border-t border-[#D8E1FF]/60 bg-white">
              {onOpenPresentation && (
                <button
                  onClick={onOpenPresentation}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[#873BEE] hover:bg-[#F3E8FF] font-semibold transition-colors cursor-pointer"
                >
                  <Tv className="h-3.5 w-3.5" />
                  <span>Judge Presentation</span>
                </button>
              )}
              <button
                onClick={() => onSelectTab('bsg-demo')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentTab === 'bsg-demo'
                    ? 'bg-[#873BEE]/10 text-[#873BEE] font-semibold'
                    : 'text-[#334155] hover:bg-[#F0F4FF]'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#16B981]" />
                <span>Bilingual Guard Demo</span>
              </button>
              <button
                onClick={() => onSelectTab('testing-lab')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentTab === 'testing-lab'
                    ? 'bg-[#873BEE]/10 text-[#873BEE] font-semibold'
                    : 'text-[#334155] hover:bg-[#F0F4FF]'
                }`}
              >
                <FlaskConical className="h-3.5 w-3.5 text-[#1769F5]" />
                <span>Prompt Testing Lab</span>
              </button>
              <button
                onClick={() => onSelectTab('test-dataset')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentTab === 'test-dataset'
                    ? 'bg-[#873BEE]/10 text-[#873BEE] font-semibold'
                    : 'text-[#334155] hover:bg-[#F0F4FF]'
                }`}
              >
                <Database className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span>Dataset Manager</span>
              </button>
              <button
                onClick={() => onSelectTab('settings')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentTab === 'settings'
                    ? 'bg-[#873BEE]/10 text-[#873BEE] font-semibold'
                    : 'text-[#334155] hover:bg-[#F0F4FF]'
                }`}
              >
                <Sliders className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Platform Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom User Profile Card -> Opens My Profile Screen */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`w-full rounded-2xl border p-2.5 flex items-center justify-between text-left transition-all cursor-pointer shadow-sm ${
            currentTab === 'profile'
              ? 'bg-[#F3E8FF] border-[#873BEE] ring-2 ring-[#873BEE]/30'
              : 'bg-white border-[#D8E1FF] hover:bg-[#F7F8FF] hover:border-blue-300'
          }`}
          title="Open My Profile"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar with blue icon */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#1769F5] to-[#873BEE] p-0.5 shrink-0 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <svg className="w-6 h-6 text-[#1769F5]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            {/* Name and Role */}
            <div className="leading-tight truncate">
              <div className="text-sm font-bold text-[#101A9B] truncate">
                John Doe
              </div>
              <div className="text-xs text-[#64748B] font-medium truncate">
                Researcher
              </div>
            </div>
          </div>

          <ChevronDown className="h-4 w-4 text-[#64748B] shrink-0 ml-1" />
        </button>
      </div>
    </aside>
  );
};
