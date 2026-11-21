import React from 'react';
import {
  Home,
  FileText,
  Info,
  ChevronDown,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface IndicSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenPresentation?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const IndicSidebar: React.FC<IndicSidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { t, language } = useLanguage();

  const navItems = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: Home,
    },
    {
      id: 'reports',
      label: t('nav.reports'),
      icon: FileText,
    },
    {
      id: 'about',
      label: t('nav.about'),
      icon: Info,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-30 w-60 md:w-64 h-full bg-white border-r border-[#D8E1FF] flex flex-col justify-between select-none shrink-0 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Logo & Navigation */}
        <div className="flex flex-col min-h-0 relative">
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden absolute top-3 right-3 p-1.5 rounded-xl border border-[#D8E1FF] text-[#64748B] hover:text-[#101A9B] hover:bg-slate-50 cursor-pointer"
              aria-label="Close Navigation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        {/* Brand Header */}
        <div className="p-5 pb-4 flex flex-col items-center text-center">
          {/* Microphone Broadcast Logo */}
          <div className="relative mb-2.5 flex items-center justify-center">
            {/* Outer concentric wave rings */}
            <div className="absolute -inset-2 rounded-full border border-blue-200/60 animate-pulse opacity-60" />
            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#1769F5] via-[#873BEE] to-[#38BDF8] p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative">
                <svg
                  className="w-7 h-7 text-[#1769F5]"
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
            {t('brand.name')}
          </h1>

          {/* Three-line Tagline */}
          <div className="text-xs text-[#64748B] font-medium leading-snug mt-1 space-y-0.5">
            <div>{t('brand.tagline1')}</div>
            <div>{t('brand.tagline2')}</div>
            <div>{t('brand.tagline3')}</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3.5 py-2 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#873BEE] to-[#A855F7] text-white shadow-md shadow-[#873BEE]/30'
                    : 'text-[#334155] hover:text-[#101A9B] hover:bg-[#F0F4FF] border border-transparent'
                }`}
              >
                <div
                  className={`flex items-center justify-center shrink-0 ${
                    isActive ? 'text-white' : 'text-[#1769F5]'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className={language === 'kn' ? 'font-kannada' : ''}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: User Profile Card -> Opens My Profile Screen */}
      <div className="p-3.5">
        <button
          onClick={() => {
            onSelectTab('profile');
            onCloseMobile?.();
          }}
          className={`w-full rounded-2xl border p-2.5 flex items-center justify-between text-left transition-all cursor-pointer shadow-xs ${
            currentTab === 'profile'
              ? 'bg-[#F3E8FF] border-[#873BEE] ring-2 ring-[#873BEE]/30'
              : 'bg-white border-[#D8E1FF] hover:bg-[#F7F8FF] hover:border-blue-300'
          }`}
          title="Open My Profile"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar with blue icon */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#1769F5] to-[#873BEE] p-0.5 shrink-0 shadow-xs">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <svg className="w-5 h-5 text-[#1769F5]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            {/* Name and Role */}
            <div className="leading-tight truncate">
              <div className="text-xs sm:text-sm font-bold text-[#101A9B] truncate">
                John Doe
              </div>
              <div className="text-[11px] text-[#64748B] font-medium truncate">
                {t('role.researcher')}
              </div>
            </div>
          </div>

          <ChevronDown className="h-4 w-4 text-[#64748B] shrink-0 ml-1" />
        </button>
      </div>
    </aside>
  </>
  );
};
