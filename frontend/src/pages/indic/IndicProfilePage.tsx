import React, { useState } from 'react';
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

interface IndicProfilePageProps {
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

export const IndicProfilePage: React.FC<IndicProfilePageProps> = ({ onBack, onNavigate }) => {
  const { showToast } = useToast();

  // Personal Information State
  const [isEditing, setIsEditing] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'John Doe',
    email: 'john.doe@indicshield.ai',
    role: 'Researcher',
    organization: 'IndicShield AI',
    phone: '+91 98765 43210',
    languagePreference: 'English',
  });

  const [editForm, setEditForm] = useState({ ...personalInfo });

  // Preferences State
  const [dashboardLanguage, setDashboardLanguage] = useState<'English' | 'Kannada'>('English');
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Modals
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    setPersonalInfo({ ...editForm });
    setIsEditing(false);
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your personal information has been saved successfully.',
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
    showToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been signed out from your IndicShield session.',
    });
    onNavigate('dashboard');
  };

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
            My Profile
          </h1>
          <p className="text-xs text-[#64748B] font-medium">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* 2. SECTION A — PROFILE HERO CARD */}
      <div className="rounded-3xl bg-gradient-to-r from-[#DDE9FF] via-[#EDF3FF] to-[#DDE9FF] border border-[#D8E1FF] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Left: Avatar with Camera Edit Badge & User Information */}
        <div className="flex items-center gap-5">
          {/* Avatar with Camera badge */}
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-full bg-white border-2 border-[#1769F5] p-1 shadow-md shadow-blue-500/15 flex items-center justify-center overflow-hidden">
              <svg className="w-12 h-12 text-[#1769F5]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            {/* Edit Photo Button */}
            <button
              onClick={() => setPhotoModalOpen(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#1769F5] hover:bg-[#101A9B] text-white shadow-md transition-all cursor-pointer"
              title="Change avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* User Details */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#101A9B] tracking-tight">
              {personalInfo.fullName}
            </h2>
            <div className="text-xs font-semibold text-[#64748B]">
              {personalInfo.role}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#334155] pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#1769F5]" />
                <span>{personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#1769F5]" />
                <span>Member Since Mar 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Account Status Card */}
        <div className="bg-white border border-[#D8E1FF] rounded-2xl p-4 shadow-xs flex items-center gap-3 shrink-0 self-start sm:self-auto min-w-[160px]">
          <div className="h-10 w-10 rounded-xl bg-[#ECFDF5] text-[#16B981] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#64748B]">Account Status</div>
            <div className="text-sm font-bold text-[#16B981]">Active</div>
          </div>
        </div>
      </div>

      {/* 3. SECTION B — TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT COLUMN: Personal Information & Preferences */}
        <div className="space-y-5">
          {/* Card 1: Personal Information */}
          <div className="bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#1769F5]" />
                <h3 className="text-base font-bold text-[#101A9B]">Personal Information</h3>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl border border-[#D8E1FF] text-xs font-semibold text-[#101A9B] hover:bg-[#F0F4FF] transition-all cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5 text-[#1769F5]" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditForm({ ...personalInfo });
                      setIsEditing(false);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-[#D8E1FF] text-xs font-semibold text-[#64748B] hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-3 py-1 rounded-lg bg-[#16B981] text-white text-xs font-semibold shadow-xs hover:bg-emerald-600 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Field Rows */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Full Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="px-2 py-1 rounded-lg border border-[#D8E1FF] text-right font-semibold text-[#101A9B] focus:outline-none"
                  />
                ) : (
                  <span className="font-semibold text-[#101A9B]">{personalInfo.fullName}</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Email Address</span>
                <span className="font-semibold text-[#101A9B]">{personalInfo.email}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Role</span>
                <span className="font-semibold text-[#101A9B]">{personalInfo.role}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Organization</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.organization}
                    onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                    className="px-2 py-1 rounded-lg border border-[#D8E1FF] text-right font-semibold text-[#101A9B] focus:outline-none"
                  />
                ) : (
                  <span className="font-semibold text-[#101A9B]">{personalInfo.organization}</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Phone Number</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="px-2 py-1 rounded-lg border border-[#D8E1FF] text-right font-semibold text-[#101A9B] focus:outline-none"
                  />
                ) : (
                  <span className="font-semibold text-[#101A9B]">{personalInfo.phone}</span>
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B] font-medium">Language Preference</span>
                {isEditing ? (
                  <select
                    value={editForm.languagePreference}
                    onChange={(e) => setEditForm({ ...editForm, languagePreference: e.target.value })}
                    className="px-2 py-1 rounded-lg border border-[#D8E1FF] font-semibold text-[#101A9B] focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Kannada">Kannada</option>
                  </select>
                ) : (
                  <span className="font-semibold text-[#101A9B]">{personalInfo.languagePreference}</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Preferences */}
          <div className="bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <Settings className="h-5 w-5 text-[#1769F5]" />
              <h3 className="text-base font-bold text-[#101A9B]">Preferences</h3>
            </div>

            <div className="space-y-4 text-xs">
              {/* Dashboard Language */}
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B] font-medium">Dashboard Language</span>
                <div className="relative">
                  <select
                    value={dashboardLanguage}
                    onChange={(e) => setDashboardLanguage(e.target.value as any)}
                    className="bg-[#F8FAFC] border border-[#D8E1FF] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#101A9B] focus:outline-none cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B] font-medium">Notifications</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      emailNotifications ? 'bg-[#873BEE]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        emailNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-[#334155] font-medium">Receive email updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Security, Activity Summary, Log Out */}
        <div className="space-y-5">
          {/* Card 1: Security */}
          <div className="bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <Shield className="h-5 w-5 text-[#1769F5]" />
              <h3 className="text-base font-bold text-[#101A9B]">Security</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Password */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Password</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm tracking-widest text-[#101A9B]">••••••••</span>
                  <button
                    onClick={() => setPasswordModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl border border-[#D8E1FF] text-xs font-semibold text-[#1769F5] hover:bg-[#F0F4FF] transition-all cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B] font-medium">Two-Factor Authentication</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-[#16B981]">
                    <Check className="h-3.5 w-3.5 stroke-[3]" /> Enabled
                  </span>
                  <button
                    onClick={() => setTwoFactorModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl border border-[#D8E1FF] text-xs font-semibold text-[#1769F5] hover:bg-[#F0F4FF] transition-all cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Manage</span>
                  </button>
                </div>
              </div>

              {/* Login Activity */}
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B] font-medium">Login Activity</span>
                <div className="flex items-center gap-1.5 font-semibold text-[#101A9B]">
                  <Clock className="h-3.5 w-3.5 text-[#1769F5]" />
                  <span>Last login: Today, 9:42 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Activity Summary */}
          <div className="bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <BarChart3 className="h-5 w-5 text-[#1769F5]" />
              <h3 className="text-base font-bold text-[#101A9B]">Activity Summary</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Total Tests */}
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <div className="h-8 w-8 mx-auto rounded-lg bg-[#ECFDF5] text-[#16B981] flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="text-xl font-black text-[#101A9B]">120</div>
                <div className="text-[11px] font-semibold text-[#64748B]">Total Tests</div>
              </div>

              {/* Overall Safety Rate */}
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <div className="h-8 w-8 mx-auto rounded-lg bg-[#EFF6FF] text-[#1769F5] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-xl font-black text-[#101A9B]">92%</div>
                <div className="text-[11px] font-semibold text-[#64748B]">Overall Safety Rate</div>
              </div>

              {/* Days Active */}
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <div className="h-8 w-8 mx-auto rounded-lg bg-[#F5F3FF] text-[#873BEE] flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="text-xl font-black text-[#101A9B]">27</div>
                <div className="text-[11px] font-semibold text-[#64748B]">Days Active</div>
              </div>
            </div>
          </div>

          {/* Card 3: Log Out */}
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="w-full bg-white border border-[#D8E1FF] hover:border-[#EF476F] rounded-3xl p-5 shadow-xs flex items-center gap-4 text-left transition-all cursor-pointer group hover:bg-rose-50/30"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#F5F3FF] group-hover:bg-rose-100 text-[#873BEE] group-hover:text-[#EF476F] flex items-center justify-center shrink-0 transition-colors">
              <LogOut className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#101A9B] group-hover:text-[#EF476F] transition-colors">
                Log Out
              </h4>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Sign out from your account
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[#1769F5]" />
                <h3 className="font-bold text-[#101A9B]">Change Password</h3>
              </div>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#334155] block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-[#D8E1FF] p-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#873BEE]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#334155] block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                  className="w-full rounded-xl border border-[#D8E1FF] p-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#873BEE]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#334155] block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-[#D8E1FF] p-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#873BEE]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D8E1FF] text-xs font-semibold text-[#334155] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 rounded-xl bg-[#873BEE] hover:bg-[#7025D8] text-white text-xs font-semibold shadow-xs cursor-pointer"
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
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#16B981]" />
                <h3 className="font-bold text-[#101A9B]">Two-Factor Authentication</h3>
              </div>
              <button
                onClick={() => setTwoFactorModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#334155]">
              <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#DCFCE7] flex items-center gap-2 text-[#15803D] font-semibold">
                <Check className="h-4 w-4 stroke-[3]" />
                <span>2FA is active and safeguarding your researcher account.</span>
              </div>
              <p>
                Verification codes are generated via your registered authenticator app for all sensitive administrative actions.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTwoFactorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1769F5] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#101A9B]">Sign Out Confirmation</h3>
                <p className="text-xs text-[#64748B]">Are you sure you want to log out?</p>
              </div>
            </div>

            <p className="text-xs text-[#334155] leading-relaxed">
              Your research state will remain safely preserved in the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D8E1FF] text-xs font-semibold text-[#334155] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-[#EF476F] hover:bg-rose-600 text-white text-xs font-semibold shadow-xs cursor-pointer"
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
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-[#101A9B]">Change Profile Photo</h3>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#334155]">
              Upload a new photo or select an avatar for your researcher profile:
            </p>

            <div className="grid grid-cols-3 gap-3 py-2">
              <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 border-2 border-[#1769F5] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <User className="h-8 w-8 text-[#1769F5]" />
              </div>
              <div className="h-16 w-16 mx-auto rounded-full bg-purple-100 border-2 border-[#873BEE] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <ShieldCheck className="h-8 w-8 text-[#873BEE]" />
              </div>
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 border-2 border-[#16B981] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <Globe2 className="h-8 w-8 text-[#16B981]" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setPhotoModalOpen(false);
                  showToast({ type: 'success', title: 'Avatar Updated', message: 'Profile photo saved.' });
                }}
                className="px-4 py-2 rounded-xl bg-[#1769F5] text-white text-xs font-semibold cursor-pointer"
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
