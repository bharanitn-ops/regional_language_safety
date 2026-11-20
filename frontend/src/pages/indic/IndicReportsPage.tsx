import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ShieldCheck,
  FileText,
  AlertTriangle,
  FlaskConical,
  BarChart3,
  PieChart as PieIcon,
  Check,
  Eye,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  X,
  Download,
} from 'lucide-react';
import { useToast } from '../../components/common/Toast';

interface IndicReportsPageProps {
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

export const IndicReportsPage: React.FC<IndicReportsPageProps> = ({ onBack, onNavigate }) => {
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState<'7D' | '30D' | '90D'>('30D');
  const [selectedReportModal, setSelectedReportModal] = useState<any | null>(null);

  // Trend data matching Screenshot 1
  const trendData = [
    { date: 'Apr 1', safety: 90, risk: 4 },
    { date: 'Apr 8', safety: 92, risk: 3 },
    { date: 'Apr 15', safety: 91, risk: 4 },
    { date: 'Apr 22', safety: 94, risk: 2 },
    { date: 'Apr 30', safety: 95, risk: 3 },
  ];

  // Risk breakdown donut data matching Screenshot 1
  const riskDonutData = [
    { name: 'Harmless', value: 67, color: '#1769F5' },
    { name: 'Potentially Harmful', value: 22, color: '#F59E0B' },
    { name: 'High Risk', value: 11, color: '#873BEE' },
  ];

  // Recent reports table matching Screenshot 1
  const recentReports = [
    {
      id: 'rep-001',
      dateTime: 'Apr 30, 2025 • 09:42 AM',
      safetyRate: '95%',
      risksDetected: 1,
      status: 'Safe',
      statusClass: 'bg-[#DCFCE7] text-[#15803D]',
      category: 'Cyber Exploitation Probe',
      details: 'Evaluated 4-way parallel probes across English, Kannada Native, Romanized, and Kanglish.',
    },
    {
      id: 'rep-002',
      dateTime: 'Apr 29, 2025 • 06:17 PM',
      safetyRate: '90%',
      risksDetected: 2,
      status: 'Review',
      statusClass: 'bg-[#FEF3C7] text-[#B45309]',
      category: 'Code-Mixed Kanglish Probe',
      details: 'Detected bypass in baseline run without protection; neutralized when Bilingual Guard was enabled.',
    },
    {
      id: 'rep-003',
      dateTime: 'Apr 28, 2025 • 11:20 AM',
      safetyRate: '96%',
      risksDetected: 0,
      status: 'Safe',
      statusClass: 'bg-[#DCFCE7] text-[#15803D]',
      category: 'Benign Regional Cultural Query',
      details: 'Karnataka Rajyotsava history inquiry appropriately answered without over-refusal.',
    },
  ];

  const handleDownloadWhitepaper = () => {
    onNavigate('research-reports');
    showToast({
      type: 'info',
      title: 'Navigating to Research Whitepapers',
      message: 'Access full 17-section reports, PDF whitepapers, and CSV data exports.',
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-w-0">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Back Arrow, Title & Subtitle */}
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
              Reports
            </h1>
            <p className="text-xs text-[#64748B] font-medium">
              View your AI safety reports and insights
            </p>
          </div>
        </div>

        {/* Right: Date Range Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#D8E1FF] text-xs font-semibold text-[#101A9B] hover:border-blue-300 shadow-xs transition-all cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-[#1769F5]" />
            <span>
              {dateRange === '7D'
                ? 'Last 7 Days'
                : dateRange === '30D'
                ? 'Last 30 Days'
                : 'Last 90 Days'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-[#D8E1FF] shadow-lg py-1.5 z-20 text-xs">
              <button
                onClick={() => {
                  setDateRange('7D');
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-[#F0F4FF] cursor-pointer ${
                  dateRange === '7D' ? 'font-bold text-[#873BEE]' : 'text-[#334155]'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  setDateRange('30D');
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-[#F0F4FF] cursor-pointer ${
                  dateRange === '30D' ? 'font-bold text-[#873BEE]' : 'text-[#334155]'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => {
                  setDateRange('90D');
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-[#F0F4FF] cursor-pointer ${
                  dateRange === '90D' ? 'font-bold text-[#873BEE]' : 'text-[#334155]'
                }`}
              >
                Last 90 Days
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. SECTION A — SAFETY OVERVIEW BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-[#DDE9FF] via-[#EDF3FF] to-[#DDE9FF] border border-[#D8E1FF] p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Left: Document + Shield Illustration */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#1769F5] to-[#38BDF8] p-1 shadow-md shadow-blue-500/25 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#1769F5] rounded-xl flex items-center justify-center text-white">
              <FileText className="h-8 w-8" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#101A9B] tracking-tight">
              Your Safety Overview
            </h2>
            <p className="text-xs sm:text-sm text-[#334155] font-medium mt-0.5">
              Consistent safety across your recent activity
            </p>
          </div>
        </div>

        {/* Right: Three Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Overall Safety Rate */}
          <div className="bg-white border border-[#D8E1FF] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 min-w-[150px]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#ECFDF5] text-[#16B981] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-black text-[#101A9B] leading-tight">92%</div>
                <div className="text-[11px] font-semibold text-[#64748B]">Overall Safety Rate</div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#16B981] flex items-center">↑ +2%</span>
          </div>

          {/* Card 2: Total Tests */}
          <div className="bg-white border border-[#D8E1FF] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 min-w-[150px]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#EFF6FF] text-[#1769F5] flex items-center justify-center shrink-0">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-black text-[#101A9B] leading-tight">120</div>
                <div className="text-[11px] font-semibold text-[#64748B]">Total Tests</div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#16B981] flex items-center">↑ +12%</span>
          </div>

          {/* Card 3: Potential Risks */}
          <div className="bg-white border border-[#D8E1FF] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 min-w-[150px]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-black text-[#101A9B] leading-tight">3</div>
                <div className="text-[11px] font-semibold text-[#64748B]">Potential Risks</div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#EF476F] flex items-center">↓ -1%</span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE ROW: SAFETY SCORE & TREND OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Safety Score (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#1769F5]" />
            <h3 className="text-base font-bold text-[#101A9B]">Safety Score</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2 my-auto">
            {/* Semicircular Gauge Graphic */}
            <div className="flex flex-col items-center justify-center relative">
              <svg className="w-36 h-20" viewBox="0 0 100 55">
                {/* Background arc */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Green progress arc for 92% */}
                <path
                  d="M 10 50 A 40 40 0 0 1 84 26"
                  fill="none"
                  stroke="#16B981"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center -mt-8">
                <div className="text-2xl font-black text-[#101A9B]">92%</div>
                <div className="text-[10px] text-[#64748B] font-semibold">Overall Safety Rate</div>
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#15803D]">
                  <Check className="h-3 w-3 stroke-[3]" /> Safe
                </span>
              </div>
            </div>

            {/* Explanatory Message & Button */}
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803D]">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Your AI interactions are generally safe!</span>
                </div>
                <p className="text-[11px] text-[#475569]">
                  Only 3 potential risks were detected in the selected period.
                </p>
              </div>

              <button
                onClick={handleDownloadWhitepaper}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#873BEE] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white text-xs font-semibold shadow-md shadow-[#873BEE]/25 transition-all cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Trend Overview (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#1769F5]" />
              <h3 className="text-base font-bold text-[#101A9B]">Trend Overview</h3>
            </div>

            {/* Period Selectors & Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs font-medium text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1769F5]" />
                  <span>Safety Rate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#873BEE]" />
                  <span>Risk Rate</span>
                </div>
              </div>

              <div className="flex items-center p-1 rounded-xl bg-[#F7F8FF] border border-[#D8E1FF] text-xs">
                {(['7D', '30D', '90D'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTrendPeriod(p)}
                    className={`px-2.5 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      trendPeriod === p
                        ? 'bg-[#873BEE] text-white shadow-xs'
                        : 'text-[#334155] hover:text-[#101A9B]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  unit="%"
                  ticks={[0, 25, 50, 75, 100]}
                />
                <RechartsTooltip
                  formatter={(val: any) => [`${val}%`, '']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D8E1FF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="safety"
                  stroke="#1769F5"
                  strokeWidth={2.5}
                  dot={{ fill: '#1769F5', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="#873BEE"
                  strokeWidth={2.5}
                  dot={{ fill: '#873BEE', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. LOWER ROW: RISK BREAKDOWN & RECENT REPORTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Risk Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-[#1769F5]" />
            <h3 className="text-base font-bold text-[#101A9B]">Risk Breakdown</h3>
          </div>

          <div className="flex items-center justify-around gap-4 py-2 my-auto">
            {/* Donut Chart with Center Text */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-[#101A9B]">3</span>
                <span className="text-[10px] font-semibold text-[#64748B]">Risks</span>
              </div>
            </div>

            {/* Legend with Percentages */}
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1769F5]" />
                  <span className="text-[#334155]">Harmless</span>
                </div>
                <span className="font-bold text-[#101A9B]">67%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-[#334155]">Potentially Harmful</span>
                </div>
                <span className="font-bold text-[#101A9B]">22%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#873BEE]" />
                  <span className="text-[#334155]">High Risk</span>
                </div>
                <span className="font-bold text-[#101A9B]">11%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Reports (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#D8E1FF] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#1769F5]" />
              <h3 className="text-base font-bold text-[#101A9B]">Recent Reports</h3>
            </div>
            <button
              onClick={handleDownloadWhitepaper}
              className="text-xs font-semibold text-[#1769F5] hover:text-[#101A9B] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#64748B] border-b border-[#E2E8F0] font-semibold">
                <tr>
                  <th className="py-2.5 px-3 flex items-center gap-1">
                    Date & Time <ChevronDown className="h-3 w-3" />
                  </th>
                  <th className="py-2.5 px-3">Safety Rate</th>
                  <th className="py-2.5 px-3">Risks Detected</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#334155]">
                {recentReports.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3 font-medium whitespace-nowrap">{row.dateTime}</td>
                    <td className="py-3 px-3 font-bold text-[#101A9B]">{row.safetyRate}</td>
                    <td className="py-3 px-3">{row.risksDetected}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${row.statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedReportModal(row)}
                        className="inline-flex items-center gap-1 text-[#1769F5] hover:text-[#101A9B] font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. SECTION F — INSIGHT BANNER */}
      <div className="rounded-3xl bg-white border border-[#D8E1FF] p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#EFF6FF] text-[#1769F5] flex items-center justify-center shrink-0">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#101A9B]">Insight</h4>
            <p className="text-xs text-[#334155] font-medium mt-0.5">
              Your safety rate has improved by 2% compared to the previous 30 days. Keep up the good work!
            </p>
          </div>
        </div>

        {/* Decorative 3D Bar Trend Icon */}
        <div className="hidden sm:flex items-end gap-1 h-8 opacity-80 shrink-0">
          <span className="w-2 h-3 bg-[#BFDBFE] rounded-xs" />
          <span className="w-2 h-5 bg-[#60A5FA] rounded-xs" />
          <span className="w-2 h-7 bg-[#1769F5] rounded-xs" />
          <TrendingUp className="h-4 w-4 text-[#16B981] ml-1 self-start" />
        </div>
      </div>

      {/* Report Quick Detail Modal */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#1769F5]" />
                <h3 className="font-bold text-[#101A9B]">Report Details</h3>
              </div>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#334155]">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Date & Time</span>
                <span className="font-semibold text-[#101A9B]">{selectedReportModal.dateTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Category</span>
                <span className="font-semibold text-[#101A9B]">{selectedReportModal.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Overall Safety Rate</span>
                <span className="font-bold text-[#16B981]">{selectedReportModal.safetyRate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Risks Detected</span>
                <span className="font-bold text-[#EF476F]">{selectedReportModal.risksDetected}</span>
              </div>
              <div>
                <span className="text-[#64748B] block mb-1">Evaluation Summary</span>
                <p className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] leading-relaxed">
                  {selectedReportModal.details}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReportModal(null)}
                className="px-4 py-2 rounded-xl border border-[#D8E1FF] text-xs font-semibold text-[#334155] hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleDownloadWhitepaper}
                className="px-4 py-2 rounded-xl bg-[#1769F5] hover:bg-[#101A9B] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Open Full Whitepaper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
