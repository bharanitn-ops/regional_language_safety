import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { IndicSidebar } from './components/layout/IndicSidebar';
import { IndicDashboardPage } from './pages/indic/IndicDashboardPage';
import { IndicReportsPage } from './pages/indic/IndicReportsPage';
import { IndicAboutPage } from './pages/indic/IndicAboutPage';
import { IndicProfilePage } from './pages/indic/IndicProfilePage';

// Existing Research Suite Pages (Preserved for full backend functionality)
import { TestingLabPage } from './pages/TestingLabPage';
import { LanguageComparisonPage } from './pages/LanguageComparisonPage';
import { ModelEvaluationPage } from './pages/ModelEvaluationPage';
import { SafetyAnalysisPage } from './pages/SafetyAnalysisPage';
import { GuardLabPage } from './pages/GuardLabPage';
import { ResearchReportsPage } from './pages/ResearchReportsPage';
import { TestDatasetPage } from './pages/TestDatasetPage';
import { SettingsPage } from './pages/SettingsPage';
import { DemoResultsComparisonPage } from './pages/DemoResultsComparisonPage';
import { BsgDemoPage } from './pages/BsgDemoPage';
import { PresentationMode } from './components/presentation/PresentationMode';

import { apiService } from './api/service';
import { HealthResponse } from './types';
import { ToastProvider } from './components/common/Toast';
import { NewExperimentModal } from './components/modals/NewExperimentModal';
import { ArrowLeft, Menu } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [historyStack, setHistoryStack] = useState<string[]>(['dashboard']);
  const [selectedGlobalModel, setSelectedGlobalModel] = useState<string>('mock-research-adapter');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [newExpModalOpen, setNewExpModalOpen] = useState<boolean>(false);
  const [presentationOpen, setPresentationOpen] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const fetchHealth = async () => {
    try {
      const data = await apiService.getHealth();
      setHealth(data);
    } catch (err) {
      console.warn('API health check error:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Safe navigation with history tracking
  const navigateTo = (tab: string) => {
    setHistoryStack((prev) => [...prev, tab]);
    setCurrentTab(tab);
  };

  const navigateBack = () => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop(); // Pop current
      const prevTab = newStack[newStack.length - 1] || 'dashboard';
      setHistoryStack(newStack);
      setCurrentTab(prevTab);
    } else {
      setCurrentTab('dashboard');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#F7F8FF] text-[#1E293B] font-sans selection:bg-[#873BEE]/20 selection:text-[#873BEE]">
      {/* 1. IndicShield Shared Sidebar */}
      <IndicSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          navigateTo(tab);
          setMobileNavOpen(false);
        }}
        onOpenPresentation={() => setPresentationOpen(true)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-[#F7F8FF]">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#D8E1FF] z-20 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-1.5 rounded-xl border border-[#D8E1FF] text-[#1769F5] hover:bg-blue-50 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-extrabold text-[#101A9B] text-sm tracking-tight">
              IndicShield AI
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#873BEE] capitalize px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-100">
            {currentTab}
          </span>
        </header>

        {/* 2. Main Content Viewport */}
        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto bg-[#F7F8FF]">
        {/* Core Screen 4: Dashboard */}
        {(currentTab === 'dashboard' || currentTab === 'overview') && (
          <IndicDashboardPage onNavigate={navigateTo} />
        )}

        {/* Core Screen 1: Reports */}
        {currentTab === 'reports' && (
          <IndicReportsPage onBack={navigateBack} onNavigate={navigateTo} />
        )}

        {/* Core Screen 2: About */}
        {currentTab === 'about' && (
          <IndicAboutPage onBack={navigateBack} />
        )}

        {/* Core Screen 3: My Profile */}
        {currentTab === 'profile' && (
          <IndicProfilePage onBack={navigateBack} onNavigate={navigateTo} />
        )}

        {/* Preserved Secondary Research Lab Pages with Header Back Control */}
        {![
          'dashboard',
          'overview',
          'reports',
          'about',
          'profile',
        ].includes(currentTab) && (
          <div className="p-4 sm:p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={navigateBack}
                className="p-2 rounded-xl bg-white border border-[#D8E1FF] text-[#1769F5] hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
                title="Return to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-[#101A9B] capitalize">
                  {currentTab.replace('-', ' ')}
                </h2>
              </div>
            </div>

            <div className="rounded-3xl border border-[#D8E1FF] bg-white p-2 sm:p-4 shadow-xs">
              {currentTab === 'testing-lab' && (
                <TestingLabPage selectedGlobalModel={selectedGlobalModel} />
              )}
              {currentTab === 'language-comparison' && <LanguageComparisonPage />}
              {currentTab === 'model-evaluation' && <ModelEvaluationPage />}
              {currentTab === 'safety-analysis' && <SafetyAnalysisPage />}
              {currentTab === 'guard-lab' && <GuardLabPage />}
              {currentTab === 'bsg-demo' && <BsgDemoPage />}
              {currentTab === 'research-reports' && <ResearchReportsPage />}
              {currentTab === 'demo-results' && <DemoResultsComparisonPage />}
              {currentTab === 'test-dataset' && <TestDatasetPage />}
              {currentTab === 'settings' && <SettingsPage />}
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Global Modals */}
      <NewExperimentModal
        isOpen={newExpModalOpen}
        onClose={() => setNewExpModalOpen(false)}
        onSuccess={() => navigateTo('dashboard')}
      />

      <PresentationMode
        isOpen={presentationOpen}
        onClose={() => setPresentationOpen(false)}
        onNavigateToTab={(tab) => {
          navigateTo(tab);
          setPresentationOpen(false);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </LanguageProvider>
  );
};

export default App;
