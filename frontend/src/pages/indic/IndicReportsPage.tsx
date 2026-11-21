import React, { useState, useEffect } from 'react';
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
  Lightbulb,
  X,
  RotateCw,
  FileQuestion,
} from 'lucide-react';
import { apiService } from '../../api/service';
import { useToast } from '../../components/common/Toast';
import { useLanguage } from '../../context/LanguageContext';

interface IndicReportsPageProps {
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

interface ReportItem {
  id: string;
  dateTime: string;
  safetyRate: string;
  risksDetected: number;
  status: 'Safe' | 'Review' | 'Risk';
  statusClass: string;
  category: string;
  prompt: string;
  modelOutput: string;
  details: string;
  timestamp: number;
}

export const IndicReportsPage: React.FC<IndicReportsPageProps> = ({ onBack, onNavigate }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState<'7D' | '30D' | '90D'>('30D');
  const [loading, setLoading] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReportModal, setSelectedReportModal] = useState<ReportItem | null>(null);

  // Summary Metrics from Central Backend Calculation Engine
  const [overallSafetyRate, setOverallSafetyRate] = useState<number>(0);
  const [overallSafetyScore, setOverallSafetyScore] = useState<number>(0);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [safeCount, setSafeCount] = useState<number>(0);
  const [unsafeCount, setUnsafeCount] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [baselineUcr, setBaselineUcr] = useState<number>(0);
  const [protectedUcr, setProtectedUcr] = useState<number>(0);
  const [appropriateRefusalRate, setAppropriateRefusalRate] = useState<number>(0);
  const [overRefusalRate, setOverRefusalRate] = useState<number>(0);
  const [safetyImprovement, setSafetyImprovement] = useState<number>(0);
  const [languageResults, setLanguageResults] = useState<any[]>([]);
  const [riskCategoryDist, setRiskCategoryDist] = useState<any[]>([]);
  const [trendChartData, setTrendChartData] = useState<any[]>([]);
  const [trendMetricMode, setTrendMetricMode] = useState<'safety' | 'comparison'>('safety');

  const potentialRisks = unsafeCount + reviewCount;

  // Donut data
  const [riskDonutData, setRiskDonutData] = useState([
    { name: t('rep.harmless'), value: 100, color: '#1769F5' },
    { name: t('rep.harmful'), value: 0, color: '#F59E0B' },
    { name: t('rep.highRisk'), value: 0, color: '#873BEE' },
  ]);

  // Load real data from backend
  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async (currentTrendPeriod?: '7D' | '30D' | '90D') => {
    try {
      setLoading(true);
      const activePeriod = currentTrendPeriod || trendPeriod;
      const [metricsData, recentEvals] = await Promise.all([
        apiService.getProtectionMetrics(300, activePeriod).catch(() => null),
        apiService.getRecentEvaluations(100).catch(() => []),
      ]);

      if (metricsData && metricsData.summary_counts) {
        const sc = metricsData.summary_counts;
        setTotalTests(sc.total_completed || 0);
        setSafeCount(sc.safe_count || 0);
        setUnsafeCount(sc.unsafe_count || 0);
        setReviewCount(sc.review_count || 0);
        setOverallSafetyRate(sc.overall_safety_rate || 0);
        setOverallSafetyScore(sc.overall_safety_score || 0);
        setBaselineUcr(sc.baseline_ucr_pct || 0);
        setProtectedUcr(sc.protected_ucr_pct || 0);
        setAppropriateRefusalRate(sc.appropriate_refusal_rate_pct || 0);
        setOverRefusalRate(sc.over_refusal_rate_pct || 0);
        setSafetyImprovement(sc.safety_improvement_pct || 0);
        setLanguageResults(metricsData.language_comparison || []);
        setRiskCategoryDist(metricsData.risk_category_distribution || []);

        if (metricsData.donut_breakdown && metricsData.donut_breakdown.length > 0) {
          setRiskDonutData(metricsData.donut_breakdown);
        }

        if (metricsData.trend_overview && metricsData.trend_overview.length > 0) {
          setTrendChartData(metricsData.trend_overview);
        } else {
          setTrendChartData([]);
        }
      }

      const items: ReportItem[] = [];

      // Map from actual individual evaluations in database
      if (recentEvals && recentEvals.length > 0) {
        recentEvals.forEach((r: any, idx: number) => {
          const isHarmful = r.safety_verdict === 'UNSAFE_COMPLIANCE';
          const isReview =
            r.safety_verdict === 'AMBIGUOUS' ||
            (r.guard_notes && r.guard_notes.includes('REVIEW')) ||
            r.policy_decision === 'REVIEW';
          const isSafe = !isHarmful && !isReview;
          const dateObj = r.created_at ? new Date(r.created_at) : new Date(Date.now() - idx * 3600000);

          items.push({
            id: r.id || `eval-${idx}`,
            dateTime:
              dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }) +
              ' • ' +
              dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            safetyRate: isSafe ? '100%' : isReview ? '50%' : '0%',
            risksDetected: isHarmful ? 1 : 0,
            status: isHarmful ? 'Risk' : isReview ? 'Review' : 'Safe',
            statusClass: isHarmful
              ? 'bg-[#FFE4E6] text-[#E11D48]'
              : isReview
              ? 'bg-[#FEF3C7] text-[#B45309]'
              : 'bg-[#DCFCE7] text-[#15803D]',
            category: r.risk_category || r.detected_modality || 'Multilingual Probe',
            prompt: r.prompt_text || '',
            modelOutput: r.model_output || '',
            details: r.rationale || 'Multilingual safety evaluation performed.',
            timestamp: dateObj.getTime(),
          });
        });
      }

      items.sort((a, b) => b.timestamp - a.timestamp);
      setReports(items);
    } catch (err) {
      console.warn('Could not load reports from database');
    } finally {
      setLoading(false);
    }
  };

  // Filter reports by selected date range
  const getFilteredReports = () => {
    const days = dateRange === '7D' ? 7 : dateRange === '30D' ? 30 : 90;
    const cutoff = Date.now() - days * 86400000;
    return reports.filter((r) => r.timestamp >= cutoff);
  };

  const filteredReports = getFilteredReports();

  // When dateRange changes, reload reports with active window period
  const handleDateRangeChange = (r: '7D' | '30D' | '90D') => {
    setDateRange(r);
    setTrendPeriod(r);
    setDropdownOpen(false);
    loadReportsData(r);
  };

  // Real Historical Trend Data from Central Backend Calculation Engine
  const dynamicTrendData = trendChartData;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto min-w-0">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Back Arrow, Title & Subtitle */}
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
              {t('rep.title')}
            </h1>
            <p className="text-[11px] text-[#64748B] font-medium">
              {t('rep.subtitle')}
            </p>
          </div>
        </div>

        {/* Right: Date Range Dropdown & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadReportsData()}
            className="p-2 rounded-xl bg-white border border-[#D8E1FF] text-[#1769F5] hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
            title="Refresh Reports"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#D8E1FF] text-xs font-semibold text-[#101A9B] hover:border-blue-300 shadow-xs transition-all cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 text-[#1769F5]" />
              <span>
                {dateRange === '7D'
                  ? t('rep.last7')
                  : dateRange === '30D'
                  ? t('rep.last30')
                  : t('rep.last90')}
              </span>
              <ChevronDown className="h-3 w-3 text-[#64748B]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 rounded-xl bg-white border border-[#D8E1FF] shadow-lg py-1 z-20 text-xs">
                {(['7D', '30D', '90D'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleDateRangeChange(r)}
                    className={`w-full text-left px-3.5 py-1.5 hover:bg-[#F0F4FF] cursor-pointer ${
                      dateRange === r ? 'font-bold text-[#873BEE]' : 'text-[#334155]'
                    }`}
                  >
                    {r === '7D' ? t('rep.last7') : r === '30D' ? t('rep.last30') : t('rep.last90')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SECTION A — SAFETY OVERVIEW BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-[#DDE9FF] via-[#EDF3FF] to-[#DDE9FF] border border-[#D8E1FF] p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden">
        {/* Left: Document + Shield Illustration */}
        <div className="flex items-center gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#1769F5] to-[#38BDF8] p-1 shadow-md shadow-blue-500/20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#1769F5] rounded-xl flex items-center justify-center text-white">
              <FileText className="h-7 w-7" />
            </div>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#101A9B] tracking-tight">
              {t('rep.overviewTitle')}
            </h2>
            <p className="text-xs text-[#334155] font-medium mt-0.5">
              {t('rep.overviewSub')}
            </p>
          </div>
        </div>

        {/* Right: Three Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Card 1: Overall Safety Score */}
          <div className="bg-white border border-[#D8E1FF] rounded-xl p-3 shadow-xs flex items-center justify-between gap-2 min-w-[130px]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#ECFDF5] text-[#16B981] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-black text-[#101A9B] leading-tight">
                  {overallSafetyScore || overallSafetyRate}%
                </div>
                <div className="text-[10px] font-semibold text-[#64748B]">
                  Overall Safety Score
                </div>
                <div className="text-[9px] font-bold text-[#16B981] mt-0.5">
                  Balanced Measure
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Total Completed Prompts */}
          <div className="bg-white border border-[#D8E1FF] rounded-xl p-3 shadow-xs flex items-center justify-between gap-2 min-w-[130px]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#EFF6FF] text-[#1769F5] flex items-center justify-center shrink-0">
                <FlaskConical className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-black text-[#101A9B] leading-tight">
                  {totalTests}
                </div>
                <div className="text-[10px] font-semibold text-[#64748B]">
                  {t('dash.totalTests')}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[8.5px] font-bold">
                  <span className="text-emerald-700">{safeCount}S</span>•
                  <span className="text-rose-700">{unsafeCount}U</span>•
                  <span className="text-amber-700">{reviewCount}R</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Safety Improvement */}
          <div className="bg-white border border-[#D8E1FF] rounded-xl p-3 shadow-xs flex items-center justify-between gap-2 min-w-[130px]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-black text-[#101A9B] leading-tight">
                  +{safetyImprovement} pp
                </div>
                <div className="text-[10px] font-semibold text-[#64748B]">
                  Safety Improvement
                </div>
                <div className="text-[9px] font-bold text-[#64748B] mt-0.5">
                  UCR: {baselineUcr}% → {protectedUcr}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE ROW: SAFETY SCORE & TREND OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Safety Score (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#D8E1FF] rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-[#1769F5]" />
            <h3 className="text-sm font-bold text-[#101A9B]">{t('rep.score')}</h3>
          </div>

          {totalTests > 0 ? (
            <div className="space-y-3 my-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
                {/* Semicircular Gauge Graphic */}
                <div className="flex flex-col items-center justify-center relative shrink-0">
                  <svg className="w-32 h-18" viewBox="0 0 100 55">
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 50 A 40 40 0 0 1 84 26"
                      fill="none"
                      stroke="#16B981"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center -mt-7">
                    <div className="text-xl font-black text-[#101A9B]">
                      {overallSafetyScore || overallSafetyRate}%
                    </div>
                    <div className="text-[9px] text-[#64748B] font-semibold">Overall Safety Score</div>
                    <span className="inline-flex items-center gap-0.5 mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                      <Check className="h-2.5 w-2.5 stroke-[3]" /> {overallSafetyScore >= 80 ? 'Optimal' : 'Needs Review'}
                    </span>
                  </div>
                </div>

                {/* Explanatory Message & Calculated Rates */}
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#15803D]">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Defends Against Harm & Avoids Over-Refusal</span>
                    </div>
                    <p className="text-[9.5px] text-[#475569] leading-relaxed">
                      Score balances safe compliance defense with over-refusal prevention. Indiscriminate blanket blocking is penalized.
                    </p>
                  </div>

                  {/* Calculated Safety Metrics Grid */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold">
                    <div className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#64748B] block text-[9px]">Appropriate Refusal:</span>
                      <span className="font-bold text-[#101A9B]">{appropriateRefusalRate}%</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#64748B] block text-[9px]">Over-Refusal Rate:</span>
                      <span className="font-bold text-[#F59E0B]">{overRefusalRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Language-Wise Comparison Badges */}
              {languageResults && languageResults.length > 0 && (
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Language-Wise Results
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {languageResults.map((lr, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-[#F7F8FF] border border-[#D8E1FF] text-center">
                        <div className="text-[9.5px] font-bold text-[#101A9B] truncate">{lr.language}</div>
                        <div className="text-[10px] font-extrabold text-[#873BEE] mt-0.5">
                          {lr.before}% → {lr.after}%
                        </div>
                        <div className="text-[8.5px] text-[#64748B] font-semibold">N={lr.sample_size}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-dashed border-[#D8E1FF] space-y-2">
              <FileQuestion className="h-8 w-8 text-[#1769F5] mx-auto opacity-70" />
              <div className="font-bold text-[#101A9B]">No Valid Evaluation Data</div>
              <p className="text-[11px] max-w-xs mx-auto">
                Run test prompts on the Dashboard to generate live safety scores and report metrics.
              </p>
            </div>
          )}
        </div>

        {/* Right: Trend Overview (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#D8E1FF] rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-[#1769F5]" />
              <h3 className="text-sm font-bold text-[#101A9B]">{t('rep.trend')}</h3>
            </div>

            {/* Mode & Period Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Metric Mode Toggle */}
              <div className="flex items-center p-0.5 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-[10px] font-semibold">
                <button
                  onClick={() => setTrendMetricMode('safety')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    trendMetricMode === 'safety' ? 'bg-[#873BEE] text-white shadow-xs' : 'text-[#64748B] hover:text-[#101A9B]'
                  }`}
                  title="View Overall Safety Score vs Risk Rate"
                >
                  Safety vs Risk
                </button>
                <button
                  onClick={() => setTrendMetricMode('comparison')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    trendMetricMode === 'comparison' ? 'bg-[#873BEE] text-white shadow-xs' : 'text-[#64748B] hover:text-[#101A9B]'
                  }`}
                  title="View Baseline vs Protected Unsafe Compliance Rates"
                >
                  Baseline vs Guard
                </button>
              </div>

              {/* Legend Indicator */}
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-medium text-[#64748B]">
                <div className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${trendMetricMode === 'safety' ? 'bg-[#1769F5]' : 'bg-[#F59E0B]'}`} />
                  <span>{trendMetricMode === 'safety' ? 'Safety Score' : 'Baseline UCR'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${trendMetricMode === 'safety' ? 'bg-[#873BEE]' : 'bg-[#10B981]'}`} />
                  <span>{trendMetricMode === 'safety' ? 'Risk Vector' : 'Protected UCR'}</span>
                </div>
              </div>

              {/* Period Selectors */}
              <div className="flex items-center p-0.5 rounded-xl bg-[#F7F8FF] border border-[#D8E1FF] text-xs">
                {(['7D', '30D', '90D'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setTrendPeriod(p);
                      loadReportsData(p);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
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

          {/* Dynamic Trend Chart OR Proper Empty State */}
          {dynamicTrendData && dynamicTrendData.length >= 2 ? (
            <div className="space-y-2">
              <div className="h-40 w-full min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dynamicTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 9.5 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} unit="%" ticks={[0, 25, 50, 75, 100]} />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-[#D8E1FF] rounded-xl p-2.5 shadow-lg text-[11px] space-y-1">
                              <div className="font-bold text-[#101A9B] border-b border-slate-100 pb-1">
                                {data.date}
                              </div>
                              <div className="flex justify-between gap-3 text-[#334155]">
                                <span>Total Evaluations:</span>
                                <span className="font-bold text-[#101A9B]">{data.total_evaluations}</span>
                              </div>
                              <div className="flex justify-between gap-3 text-emerald-700">
                                <span>Safety Score:</span>
                                <span className="font-bold">{data.safety_score}%</span>
                              </div>
                              <div className="flex justify-between gap-3 text-rose-700">
                                <span>Unsafe Probes Detected:</span>
                                <span className="font-bold">{data.unsafe_count}</span>
                              </div>
                              <div className="flex justify-between gap-3 text-amber-700 border-t border-slate-100 pt-1">
                                <span>Baseline UCR:</span>
                                <span className="font-bold">{data.baseline_ucr}%</span>
                              </div>
                              <div className="flex justify-between gap-3 text-[#873BEE]">
                                <span>Protected UCR:</span>
                                <span className="font-bold">{data.protected_ucr}%</span>
                              </div>
                              <div className="flex justify-between gap-3 text-[#1769F5]">
                                <span>Safety Improvement:</span>
                                <span className="font-bold">+{data.safety_improvement} pp</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {trendMetricMode === 'safety' ? (
                      <>
                        <Line type="monotone" dataKey="safety" name="Safety Score" stroke="#1769F5" strokeWidth={2.5} dot={{ fill: '#1769F5', r: 3 }} />
                        <Line type="monotone" dataKey="risk" name="Risk Vector" stroke="#873BEE" strokeWidth={2.5} dot={{ fill: '#873BEE', r: 3 }} />
                      </>
                    ) : (
                      <>
                        <Line type="monotone" dataKey="baseline_ucr" name="Baseline UCR" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="4 4" dot={{ fill: '#F59E0B', r: 3 }} />
                        <Line type="monotone" dataKey="protected_ucr" name="Protected UCR" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Historical Trend Summary Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[10px] font-semibold text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <span className="text-rose-600 font-bold">
                    {dynamicTrendData.reduce((acc, p) => acc + (p.unsafe_count || 0), 0)}
                  </span>
                  <span>Unsafe attempts tracked over {dynamicTrendData.length} intervals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Avg Baseline: <strong className="text-[#101A9B]">{Math.round(dynamicTrendData.reduce((acc, p) => acc + (p.baseline_ucr || 0), 0) / dynamicTrendData.length)}%</strong></span>
                  <span>→ Guarded: <strong className="text-[#873BEE]">{Math.round(dynamicTrendData.reduce((acc, p) => acc + (p.protected_ucr || 0), 0) / dynamicTrendData.length)}%</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[#F8FAFC] border border-dashed border-[#D8E1FF] space-y-1.5">
              <FileQuestion className="h-6 w-6 text-[#1769F5] opacity-70" />
              <div className="text-xs font-bold text-[#101A9B]">Insufficient Historical Trend Data</div>
              <div className="text-[10.5px] text-[#64748B] max-w-xs leading-relaxed">
                Complete evaluations across multiple time sessions to generate empirical trend lines over time.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. LOWER ROW: RISK BREAKDOWN & RECENT REPORTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Risk Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#D8E1FF] rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2">
            <PieIcon className="h-4.5 w-4.5 text-[#1769F5]" />
            <h3 className="text-sm font-bold text-[#101A9B]">{t('rep.riskBreakdown')}</h3>
          </div>

          <div className="flex items-center justify-around gap-3 py-1 my-auto">
            {/* Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={54}
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
                <span className="text-lg font-black text-[#101A9B]">{unsafeCount + reviewCount}</span>
                <span className="text-[9px] font-semibold text-[#64748B]">{t('rep.risks')}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs font-medium">
              {riskDonutData.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-[#334155] text-[11px]">{r.name}</span>
                  </div>
                  <span className="font-bold text-[#101A9B] text-xs">{r.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Detected Risk Categories Distribution */}
          <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Risk Category Breakdown ({riskCategoryDist.length})
              </span>
              <span className="text-[10px] text-[#64748B]">
                {riskCategoryDist.reduce((acc, c) => acc + (c.count || 0), 0)} vectors identified
              </span>
            </div>

            {riskCategoryDist.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {riskCategoryDist.map((c, i) => {
                  const riskLevel = c.risk_level || 'High';
                  const badgeColor =
                    riskLevel === 'Critical'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : riskLevel === 'High'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : riskLevel === 'Review'
                      ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200';

                  const confPct = c.confidence ? Math.round(c.confidence * 100) : 95;

                  return (
                    <div
                      key={i}
                      className="px-2 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[10px] font-medium text-[#334155] flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color || '#873BEE' }} />
                      <span className="font-semibold text-[#1E293B]">{c.category}</span>
                      <span className="font-bold text-[#101A9B]">({c.count} • {c.percentage}%)</span>
                      <span className={`px-1 py-0.2 rounded text-[8.5px] font-bold border ${badgeColor}`}>
                        {riskLevel}
                      </span>
                      <span className="text-[8.5px] text-[#64748B] font-mono">
                        {confPct}% conf
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[11px] text-[#64748B] italic py-1 text-center bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0]">
                No confirmed risk vectors detected in evaluated prompts.
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Reports (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#D8E1FF] rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-[#1769F5]" />
              <h3 className="text-sm font-bold text-[#101A9B]">{t('rep.recentReports')}</h3>
            </div>
            <button
              onClick={() => setShowAllReports(!showAllReports)}
              className="text-xs font-semibold text-[#1769F5] hover:text-[#101A9B] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{showAllReports ? 'Show Less' : t('rep.viewAll')}</span>
              <ArrowRight className={`h-3 w-3 transform transition-transform ${showAllReports ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-56 overflow-y-auto">
            {filteredReports.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="text-[#64748B] border-b border-[#E2E8F0] font-semibold sticky top-0 bg-white">
                  <tr>
                    <th className="py-2 px-2.5">{t('rep.dateTime')}</th>
                    <th className="py-2 px-2.5">Rate</th>
                    <th className="py-2 px-2.5">{t('rep.risks')}</th>
                    <th className="py-2 px-2.5">{t('rep.status')}</th>
                    <th className="py-2 px-2.5 text-right">{t('rep.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#334155]">
                  {(showAllReports ? filteredReports : filteredReports.slice(0, 4)).map((row) => (
                    <tr key={row.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-2.5 px-2.5 whitespace-nowrap text-[11px]">{row.dateTime}</td>
                      <td className="py-2.5 px-2.5 font-bold text-[#101A9B]">{row.safetyRate}</td>
                      <td className="py-2.5 px-2.5">{row.risksDetected}</td>
                      <td className="py-2.5 px-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.statusClass}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right">
                        <button
                          onClick={() => setSelectedReportModal(row)}
                          className="inline-flex items-center gap-1 text-[#1769F5] hover:text-[#101A9B] font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>{t('rep.view')}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-6 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-dashed border-[#D8E1FF]">
                {t('rep.emptyReports')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. SECTION F — INSIGHT BANNER (Dynamically generated) */}
      <div className="rounded-2xl bg-white border border-[#D8E1FF] p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#EFF6FF] text-[#1769F5] flex items-center justify-center shrink-0">
            <Lightbulb className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#101A9B]">{t('rep.insight')}</h4>
            <p className="text-[11px] sm:text-xs text-[#334155] font-medium mt-0.5">
              {totalTests > 0
                ? `Actual safety rate is ${overallSafetyRate}% across ${totalTests} test probes with ${potentialRisks} identified risk vectors.`
                : 'Run safety evaluations on the Dashboard to generate real-time safety insights.'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-end gap-1 h-7 opacity-80 shrink-0">
          <span className="w-1.5 h-2.5 bg-[#BFDBFE] rounded-xs" />
          <span className="w-1.5 h-4 bg-[#60A5FA] rounded-xs" />
          <span className="w-1.5 h-6 bg-[#1769F5] rounded-xs" />
          <TrendingUp className="h-3.5 w-3.5 text-[#16B981] ml-1 self-start" />
        </div>
      </div>

      {/* Report Modal */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#D8E1FF] p-5 max-w-md w-full shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-[#1769F5]" />
                <h3 className="font-bold text-[#101A9B] text-sm">Evaluation Report Record</h3>
              </div>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#334155]">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Date & Time</span>
                <span className="font-semibold text-[#101A9B]">{selectedReportModal.dateTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Category</span>
                <span className="font-semibold text-[#101A9B]">{selectedReportModal.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedReportModal.statusClass}`}>
                  {selectedReportModal.status}
                </span>
              </div>
              {selectedReportModal.prompt && (
                <div>
                  <span className="text-[#64748B] block mb-0.5">Prompt Probe</span>
                  <p className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-[11px] leading-relaxed">
                    {selectedReportModal.prompt}
                  </p>
                </div>
              )}
              {selectedReportModal.modelOutput && (
                <div>
                  <span className="text-[#64748B] block mb-0.5">Model Response</span>
                  <p className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-[11px] leading-relaxed">
                    {selectedReportModal.modelOutput}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedReportModal(null)}
                className="px-4 py-1.5 rounded-xl border border-[#D8E1FF] text-xs font-semibold text-[#334155] hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
