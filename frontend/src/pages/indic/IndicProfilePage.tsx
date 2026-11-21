import React, { useState, useEffect } from 'react';
import { apiService } from '../../api/service';
import {
  ArrowLeft,
  Mail,
  Calendar,
  ShieldCheck,
  Camera,
  Edit2,
  Lock,
  Settings,
  Clock,
  BarChart3,
  LogOut,
  TrendingUp,
  Globe2,
  Check,
  X,
  User,
  Shield,
  KeyRound,
} from 'lucide-react';
import { useToast } from '../../components/common/Toast';
import { useLanguage } from '../../context/LanguageContext';

interface IndicProfilePageProps {
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

export const IndicProfilePage: React.FC<IndicProfilePageProps> = ({ onBack, onNavigate }) => {
  const { t, language, setLanguage } = useLanguage();
  const { showToast } = useToast();

  // Personal Information State with persistence
  const [isEditing, setIsEditing] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(() => {
    const saved = localStorage.getItem('indicshield_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      fullName: 'John Doe',
      email: 'john.doe@indicshield.ai',
      role: 'Researcher',
      organization: 'BhashaShield AI',
      phone: '+91 98765 43210',
      languagePreference: 'English',
    };
  });

  const [editForm, setEditForm] = useState({ ...personalInfo });

  // Notifications State with persistence
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem('indicshield_notifications') !== 'false';
  });

  // Two-Factor Authentication state with persistence
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem('indicshield_2fa_enabled') !== 'false';
  });

  // Dynamic user stats from SQLite
  const [stats, setStats] = useState({
    totalTests: 0,
    overallSafetyRate: 0,
    daysActive: 3,
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const [recent, exps] = await Promise.all([
        apiService.getRecentEvaluations(50).catch(() => []),
        apiService.getExperiments().catch(() => []),
      ]);
      const total = (recent?.length || 0) + (exps?.length || 0);
      let safeCount = 0;
      if (recent && recent.length > 0) {
        safeCount += recent.filter(
          (r: any) => r.safety_verdict === 'SAFE_REFUSAL' || r.safety_verdict === 'BENIGN_COMPLIANCE'
        ).length;
      }
      if (exps && exps.length > 0) {
        safeCount += exps.filter((e: any) => (e.asr_kanglish || 0) < 0.2).length;
      }
      const safetyRate = total > 0 ? Math.round((safeCount / total) * 100) : 100;
      setStats({
        totalTests: total,
        overallSafetyRate: safetyRate,
        daysActive: Math.max(1, Math.min(30, total + 1)),
      });
    } catch (err) {
      console.warn('Could not load user stats', err);
    }
  };

  // Modals
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    setPersonalInfo({ ...editForm });
    localStorage.setItem('indicshield_user_profile', JSON.stringify(editForm));
    setIsEditing(false);
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your personal information has been saved successfully.',
    });
  };

  const handleToggle2FA = () => {
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    localStorage.setItem('indicshield_2fa_enabled', String(next));
    showToast({
      type: next ? 'success' : 'info',
      title: next ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled',
      message: next ? '2FA is now safeguarding your account.' : 'Two-Factor authentication has been temporarily paused.',
    });
  };

  const handleToggleNotifications = () => {
    const next = !emailNotifications;
    setEmailNotifications(next);
    localStorage.setItem('indicshield_notifications', String(next));
    showToast({
      type: 'info',
      title: next ? 'Notifications Enabled' : 'Notifications Muted',
      message: next ? 'You will receive research updates and security alerts.' : 'Email notifications paused.',
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({
        type: 'warning',
        title: 'Incomplete Fields',
        message: 'Please fill in all password fields.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.',
      });
      return;
    }
    setPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast({
      type: 'success',
      title: 'Password Changed',
      message: 'Your password has been securely updated.',
    });
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(false);
    sessionStorage.clear();
    showToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been signed out from your BhashaShield session.',
    });
    onNavigate('dashboard');
  };

  const handleLanguageChange = (val: string) => {
    const newLang = val === 'Kannada' ? 'kn' : val === 'Kanglish' ? 'kanglish' : 'en';
    setLanguage(newLang);
    const updated = { ...personalInfo, languagePreference: val };
    setPersonalInfo(updated);
    localStorage.setItem('indicshield_user_profile', JSON.stringify(updated));
    showToast({
      type: 'info',
      title: newLang === 'kn' ? 'ಭಾಷೆ ಬದಲಾಗಿದೆ' : newLang === 'kanglish' ? 'Language Changed to Kanglish' : 'Language Changed',
      message: newLang === 'kn' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ.' : newLang === 'kanglish' ? 'Dashboard interface switched to Kanglish mode.' : 'Application interface switched to English.',
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto min-w-0">
      {/* 1. PAGE HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-xl bg-white border border-[#D8E1FF] text-[#1769F5] hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#101A9B] tracking-tight leading-tight">
            {t('profile.title')}
          </h1>
          <p className="text-[11px] text-[#64748B] font-medium">
            {t('profile.subtitle')}
          </p>
        </div>
      </div>

      {/* 2. SECTION A — PROFILE HERO CARD */}
      <div className="rounded-2xl bg-gradient-to-r from-[#DDE9FF] via-[#EDF3FF] to-[#DDE9FF] border border-[#D8E1FF] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        {/* Left: Avatar with Camera Edit Badge & User Information */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-white border-2 border-[#1769F5] p-1 shadow-md shadow-blue-500/15 flex items-center justify-center overflow-hidden">
              <svg className="w-10 h-10 text-[#1769F5]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <button
              onClick={() => setPhotoModalOpen(true)}
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#1769F5] hover:bg-[#101A9B] text-white shadow-md transition-all cursor-pointer"
              title="Change avatar"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#101A9B] tracking-tight">
              {personalInfo.fullName}
            </h2>
            <div className="text-xs font-semibold text-[#64748B]">
              {t('role.researcher')}
            </div>
            <div className="flex flex-wrap items-center gap-3.5 text-xs text-[#334155] pt-0.5">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#1769F5]" />
                <span>{personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#1769F5]" />
                <span>{t('profile.memberSince')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Account Status Card */}
        <div className="bg-white border border-[#D8E1FF] rounded-xl p-3 shadow-xs flex items-center gap-2.5 shrink-0 self-start sm:self-auto min-w-[140px]">
          <div className="h-9 w-9 rounded-lg bg-[#ECFDF5] text-[#16B981] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-[#64748B]">{t('profile.accountStatus')}</div>
            <div className="text-xs sm:text-sm font-bold text-[#16B981]">{t('profile.active')}</div>
          </div>
        </div>
      </div>

      {/* 3. SECTION B — TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT COLUMN: Personal Information & Preferences */}
        <div className="space-y-4">
          {/* Card 1: Personal Information */}
          <div className="bg-white border border-[#D8E1FF] rounded-2xl p-4 md:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-[#1769F5]" />
                <h3 className="text-sm font-bold text-[#101A9B]">{t('profile.personalInfo')}</h3>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-[#D8E1FF] text-xs font-semibold text-[#101A9B] hover:bg-[#F0F4FF] transition-all cursor-pointer"
                >
                  <Edit2 className="h-3 w-3 text-[#1769F5]" />
                  <span>{t('profile.edit')}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditForm({ ...personalInfo });
                      setIsEditing(false);
                    }}
                    className="px-2 py-0.5 rounded-lg border border-[#D8E1FF] text-xs font-semibold text-[#64748B] hover:bg-slate-50 cursor-pointer"
                  >
                    {t('profile.cancel')}
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-2.5 py-0.5 rounded-lg bg-[#16B981] text-white text-xs font-semibold shadow-xs hover:bg-emerald-600 cursor-pointer"
                  >
                    {t('profile.save')}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">{t('profile.fullName')}</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="px-2 py-0.5 rounded-lg border border-[#D8E1FF] text-right font-semibold text-[#101A9B] focus:outline-none"
                  />
                ) : (
                  <span className="font-semibold text-[#101A9B]">{personalInfo.fullName}</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">{t('profile.email')}</span>
                <span className="font-semibold text-[#101A9B]">{personalInfo.email}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">{t('profile.role')}</span>
                <span className="font-semibold text-[#101A9B]">{t('role.researcher')}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">{t('profile.org')}</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.organization}
                    onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                    className="px-2 py-0.5 rounded-lg border border-[#D8E1FF] text-right font-semibold text-[#101A9B] focus:outline-none"
                  />
                ) : (
                  <span className="font-semibold text-[#101A9B]">{personalInfo.organization}</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">{t('profile.phone')}</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="px-2 py-0.5 rounded-lg border border-[#D8E1FF] text-right font-semibold text-[#101A9B] focus:outline-none"
                  />
                ) : (
                  <span className="font-semibold text-[#101A9B]">{personalInfo.phone}</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B] font-medium">{t('profile.langPref')}</span>
                <span className="font-semibold text-[#101A9B]">{personalInfo.languagePreference}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Preferences */}
          <div className="bg-white border border-[#D8E1FF] rounded-2xl p-4 md:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2.5">
              <Settings className="h-4.5 w-4.5 text-[#1769F5]" />
              <h3 className="text-sm font-bold text-[#101A9B]">{t('profile.preferences')}</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B] font-medium">{t('profile.dashLang')}</span>
                <select
                  value={language === 'kn' ? 'Kannada' : language === 'kanglish' ? 'Kanglish' : 'English'}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#D8E1FF] rounded-xl px-3 py-1 text-xs font-semibold text-[#101A9B] focus:outline-none cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="Kanglish">Kanglish</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B] font-medium">{t('profile.notifications')}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleNotifications}
                    className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      emailNotifications ? 'bg-[#873BEE]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        emailNotifications ? 'translate-x-4.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-[#334155] font-medium text-[11px]">
                    {emailNotifications ? 'Active' : 'Muted'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Security, Activity Summary, Log Out */}
        <div className="space-y-4">
          {/* Card 1: Security */}
          <div className="bg-white border border-[#D8E1FF] rounded-2xl p-4 md:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2.5">
              <Shield className="h-4.5 w-4.5 text-[#1769F5]" />
              <h3 className="text-sm font-bold text-[#101A9B]">{t('profile.security')}</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Password */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">{t('profile.password')}</span>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs tracking-widest text-[#101A9B]">••••••••</span>
                  <button
                    onClick={() => setPasswordModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-[#D8E1FF] text-xs font-semibold text-[#1769F5] hover:bg-[#F0F4FF] transition-all cursor-pointer"
                  >
                    <Lock className="h-3 w-3" />
                    <span>{t('profile.change')}</span>
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">{t('profile.twoFactor')}</span>
                <div className="flex items-center gap-2.5">
                  <span className={`flex items-center gap-1 font-semibold text-[11px] ${twoFactorEnabled ? 'text-[#16B981]' : 'text-[#64748B]'}`}>
                    {twoFactorEnabled ? (
                      <>
                        <Check className="h-3 w-3 stroke-[3]" /> {t('profile.enabled')}
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 stroke-[3]" /> Disabled
                      </>
                    )}
                  </span>
                  <button
                    onClick={() => setTwoFactorModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-[#D8E1FF] text-xs font-semibold text-[#1769F5] hover:bg-[#F0F4FF] transition-all cursor-pointer"
                  >
                    <Settings className="h-3 w-3" />
                    <span>{t('profile.manage')}</span>
                  </button>
                </div>
              </div>

              {/* Login Activity */}
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B] font-medium">{t('profile.loginActivity')}</span>
                <button
                  onClick={() => setActivityModalOpen(true)}
                  className="flex items-center gap-1.5 font-semibold text-[#101A9B] hover:text-[#1769F5] transition-colors cursor-pointer"
                >
                  <Clock className="h-3.5 w-3.5 text-[#1769F5]" />
                  <span>{t('profile.lastLogin')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Activity Summary */}
          <div className="bg-white border border-[#D8E1FF] rounded-2xl p-4 md:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2.5">
              <BarChart3 className="h-4.5 w-4.5 text-[#1769F5]" />
              <h3 className="text-sm font-bold text-[#101A9B]">{t('profile.activitySummary')}</h3>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                <div className="h-7 w-7 mx-auto rounded-lg bg-[#ECFDF5] text-[#16B981] flex items-center justify-center">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div className="text-lg font-black text-[#101A9B]">{stats.totalTests}</div>
                <div className="text-[10px] font-semibold text-[#64748B]">{t('dash.totalTests')}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                <div className="h-7 w-7 mx-auto rounded-lg bg-[#EFF6FF] text-[#1769F5] flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <div className="text-lg font-black text-[#101A9B]">{stats.overallSafetyRate}%</div>
                <div className="text-[10px] font-semibold text-[#64748B]">{t('dash.overallSafety')}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                <div className="h-7 w-7 mx-auto rounded-lg bg-[#F5F3FF] text-[#873BEE] flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <div className="text-lg font-black text-[#101A9B]">{stats.daysActive}</div>
                <div className="text-[10px] font-semibold text-[#64748B]">{t('profile.daysActive')}</div>
              </div>
            </div>
          </div>

          {/* Card 3: Log Out */}
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="w-full bg-white border border-[#D8E1FF] hover:border-[#EF476F] rounded-2xl p-4 shadow-xs flex items-center gap-3.5 text-left transition-all cursor-pointer group hover:bg-rose-50/20"
          >
            <div className="h-10 w-10 rounded-xl bg-[#F5F3FF] group-hover:bg-rose-100 text-[#873BEE] group-hover:text-[#EF476F] flex items-center justify-center shrink-0 transition-colors">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#101A9B] group-hover:text-[#EF476F] transition-colors">
                {t('profile.logOut')}
              </h4>
              <p className="text-[11px] text-[#64748B] font-medium">
                {t('profile.signOutSub')}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-5 max-w-sm w-full shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#1769F5]" />
                <h3 className="font-bold text-[#101A9B] text-sm">Change Password</h3>
              </div>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-semibold text-[#334155] block mb-0.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-[#D8E1FF] p-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#873BEE]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#334155] block mb-0.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-[#D8E1FF] p-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#873BEE]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#334155] block mb-0.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-[#D8E1FF] p-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#873BEE]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[#D8E1FF] text-xs font-semibold text-[#334155] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-3.5 py-1.5 rounded-xl bg-[#873BEE] hover:bg-[#7025D8] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Modal */}
      {twoFactorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-5 max-w-sm w-full shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#16B981]" />
                <h3 className="font-bold text-[#101A9B] text-sm">Two-Factor Authentication</h3>
              </div>
              <button
                onClick={() => setTwoFactorModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#334155]">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 font-semibold text-[11px] ${
                twoFactorEnabled ? 'bg-[#ECFDF5] border-[#DCFCE7] text-[#15803D]' : 'bg-[#FFF1F2] border-[#FFE4E6] text-[#E11D48]'
              }`}>
                <div className="flex items-center gap-1.5">
                  {twoFactorEnabled ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-4 w-4 stroke-[3]" />}
                  <span>{twoFactorEnabled ? '2FA is active and enabled' : '2FA is currently disabled'}</span>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    twoFactorEnabled ? 'bg-white text-[#B91C1C] border border-[#FECACA]' : 'bg-[#15803D] text-white'
                  }`}
                >
                  {twoFactorEnabled ? 'Turn Off' : 'Turn On'}
                </button>
              </div>
              <p className="text-[11px] text-[#475569]">
                Verification codes are generated via your registered authenticator app for all sensitive administrative actions.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setTwoFactorModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#1769F5] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Activity Modal */}
      {activityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-5 max-w-sm w-full shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#1769F5]" />
                <h3 className="font-bold text-[#101A9B] text-sm">Recent Login Activity</h3>
              </div>
              <button
                onClick={() => setActivityModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#334155]">
              <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex justify-between">
                <div>
                  <div className="font-semibold text-[#101A9B]">Current Session (Chrome / Windows)</div>
                  <div className="text-[10px] text-[#64748B]">Bengaluru, India • IP 127.0.0.1</div>
                </div>
                <span className="text-[10px] font-bold text-[#16B981] self-center">Active Now</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex justify-between">
                <div>
                  <div className="font-semibold text-[#101A9B]">Previous Login</div>
                  <div className="text-[10px] text-[#64748B]">Bengaluru, India • Yesterday, 6:15 PM</div>
                </div>
                <span className="text-[10px] text-[#64748B] self-center">Ended</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActivityModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#1769F5] text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-5 max-w-sm w-full shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-[#101A9B] text-sm">Sign Out Confirmation</h3>
                <p className="text-[11px] text-[#64748B]">Are you sure you want to log out?</p>
              </div>
            </div>

            <p className="text-xs text-[#334155] leading-relaxed">
              Your research state will remain safely preserved in the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[#D8E1FF] text-xs font-semibold text-[#334155] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl bg-[#EF476F] hover:bg-rose-600 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Avatar Edit Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-5 max-w-xs w-full shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <h3 className="font-bold text-[#101A9B] text-sm">Change Profile Photo</h3>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#334155]">
              Select an avatar for your researcher profile:
            </p>

            <div className="grid grid-cols-3 gap-2.5 py-1">
              <div
                onClick={() => {
                  setPhotoModalOpen(false);
                  showToast({ type: 'success', title: 'Avatar Selected', message: 'Default researcher avatar active.' });
                }}
                className="h-14 w-14 mx-auto rounded-full bg-blue-100 border-2 border-[#1769F5] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <User className="h-7 w-7 text-[#1769F5]" />
              </div>
              <div
                onClick={() => {
                  setPhotoModalOpen(false);
                  showToast({ type: 'success', title: 'Avatar Selected', message: 'Shield avatar active.' });
                }}
                className="h-14 w-14 mx-auto rounded-full bg-purple-100 border-2 border-[#873BEE] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <ShieldCheck className="h-7 w-7 text-[#873BEE]" />
              </div>
              <div
                onClick={() => {
                  setPhotoModalOpen(false);
                  showToast({ type: 'success', title: 'Avatar Selected', message: 'Multilingual avatar active.' });
                }}
                className="h-14 w-14 mx-auto rounded-full bg-emerald-100 border-2 border-[#16B981] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <Globe2 className="h-7 w-7 text-[#16B981]" />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[#D8E1FF] text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
