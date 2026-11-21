import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'kn' | 'kanglish';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const translations: Record<string, { en: string; kn: string; kanglish?: string }> = {
  // Brand & Nav
  'brand.name': { en: 'IndicShield AI', kn: 'ಇಂಡಿಕ್‌ಶೀಲ್ಡ್ AI' },
  'brand.tagline1': { en: 'One Intelligence.', kn: 'ಒಂದೇ ಬುದ್ಧಿಮತ್ತೆ.' },
  'brand.tagline2': { en: 'Every Language.', kn: 'ಪ್ರತಿಯೊಂದು ಭಾಷೆ.' },
  'brand.tagline3': { en: 'Equal Safety.', kn: 'ಸಮಾನ ಸುರಕ್ಷತೆ.' },
  'nav.dashboard': { en: 'Dashboard', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  'nav.reports': { en: 'Reports', kn: 'ವರದಿಗಳು' },
  'nav.about': { en: 'About', kn: 'ನಮ್ಮ ಬಗ್ಗೆ' },
  'nav.profile': { en: 'My Profile', kn: 'ನನ್ನ ಪ್ರೊಫೈಲ್' },
  'role.researcher': { en: 'Researcher', kn: 'ಸಂಶೋಧಕರು' },

  // Dashboard
  'dash.title': { en: 'AI Safety Dashboard', kn: 'AI ಸುರಕ್ಷತಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  'dash.subtitle': { en: 'Evaluate. Compare. Secure.', kn: 'ಮೌಲ್ಯಮಾಪನ. ಹೋಲಿಕೆ. ಸುರಕ್ಷತೆ.' },
  'dash.heroTitle': { en: 'Bridging the Language Safety Gap', kn: 'ಭಾಷಾ ಸುರಕ್ಷತಾ ಅಂತರವನ್ನು ಕಡಿಮೆ ಮಾಡುವುದು' },
  'dash.heroSubtitle': {
    en: 'Test and secure your AI model across English, Kannada and Kanglish.',
    kn: 'ಇಂಗ್ಲಿಷ್, ಕನ್ನಡ ಮತ್ತು ಕಾಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ನಿಮ್ಮ AI ಮಾದರಿಯನ್ನು ಪರೀಕ್ಷಿಸಿ ಮತ್ತು ಸುರಕ್ಷಿತಗೊಳಿಸಿ.',
  },
  'dash.totalTests': { en: 'Total Tests Conducted', kn: 'ನಡೆಸಿದ ಒಟ್ಟು ಪರೀಕ್ಷೆಗಳು' },
  'dash.overallSafety': { en: 'Overall Safety Rate', kn: 'ಒಟ್ಟಾರೆ ಸುರಕ್ಷತಾ ದರ' },
  'dash.risksDetected': { en: 'Potential Risks Detected', kn: 'ಪತ್ತೆಯಾದ ಸಂಭವನೀಯ ಅಪಾಯಗಳು' },
  'dash.langsAnalysed': { en: 'Languages Analysed', kn: 'ವಿಶ್ಲೇಷಿಸಿದ ಭಾಷೆಗಳು' },
  'dash.testYourModel': { en: 'Test Your AI Model', kn: 'ನಿಮ್ಮ AI ಮಾದರಿಯನ್ನು ಪರೀಕ್ಷಿಸಿ' },
  'dash.runCheck': { en: 'Run Safety Check', kn: 'ಸುರಕ್ಷತಾ ಪರಿಶೀಲನೆ ನಡೆಸಿ' },
  'dash.analyzing': { en: 'Analyzing Model...', kn: 'ಮಾದರಿ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' },
  'dash.charLimit': { en: 'characters', kn: 'ಅಕ್ಷರಗಳು' },
  'dash.comparison': { en: 'Language-Wise Safety Comparison', kn: 'ಭಾಷಾವಾರು ಸುರಕ್ಷತಾ ಹೋಲಿಕೆ' },
  'dash.beforeProtection': { en: 'Before Protection', kn: 'ರಕ್ಷಣೆಗೆ ಮೊದಲು' },
  'dash.afterProtection': { en: 'After Protection', kn: 'ರಕ್ಷಣೆಯ ನಂತರ' },
  'dash.noCompData': { en: 'No evaluation data available yet.', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಮೌಲ್ಯಮಾಪನ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.' },
  'dash.submitPromptHint': {
    en: 'Submit a prompt to view language-wise safety comparison.',
    kn: 'ಭಾಷಾವಾರು ಸುರಕ್ಷತಾ ಹೋಲಿಕೆಯನ್ನು ವೀಕ್ಷಿಸಲು ಪ್ರಶ್ನೆಯನ್ನು ಸಲ್ಲಿಸಿ.',
  },
  'dash.safetyStatus': { en: 'Safety Status', kn: 'ಸುರಕ್ಷತಾ ಸ್ಥಿತಿ' },
  'dash.safe': { en: 'Safe', kn: 'ಸುರಕ್ಷಿತ' },
  'dash.risk': { en: 'Potential Risk', kn: 'ಸಂಭವನೀಯ ಅಪಾಯ' },
  'dash.blocked': { en: 'Blocked', kn: 'ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ' },
  'dash.review': { en: 'Needs Review', kn: 'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ' },
  'dash.category': { en: 'Category', kn: 'ವರ್ಗ' },
  'dash.reason': { en: 'Reason', kn: 'ಕಾರಣ' },
  'dash.harmless': { en: 'Harmless', kn: 'ನಿರುಪದ್ರವಿ' },
  'dash.routineQuery': { en: 'Routine query', kn: 'ದಿನನಿತ್ಯದ ಪ್ರಶ್ನೆ' },
  'dash.beforeAfter': { en: 'Before vs After Protection', kn: 'ರಕ್ಷಣೆಯ ಮೊದಲು ಮತ್ತು ನಂತರ' },
  'dash.gapWithout': { en: 'Safety Gap\n(Without Protection)', kn: 'ಸುರಕ್ಷತಾ ಅಂತರ\n(ರಕ್ಷಣೆಯಿಲ್ಲದೆ)' },
  'dash.gapWith': { en: 'Safety Gap\n(With Protection)', kn: 'ಸುರಕ್ಷತಾ ಅಂತರ\n(ರಕ್ಷಣೆಯೊಂದಿಗೆ)' },
  'dash.reducesGap': { en: 'Our safety layer significantly reduces the gap!', kn: 'ನಮ್ಮ ಸುರಕ್ಷತಾ ಪದರವು ಅಂತರವನ್ನು ಗಣನೀಯವಾಗಿ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ!' },
  'dash.keyInsights': { en: 'Key Insights', kn: 'ಪ್ರಮುಖ ಒಳನೋಟಗಳು' },
  'dash.insight1': { en: 'Consistent safety across English, Kannada and Kanglish', kn: 'ಇಂಗ್ಲಿಷ್, ಕನ್ನಡ ಮತ್ತು ಕಾಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸ್ಥಿರ ಸುರಕ್ಷತೆ' },
  'dash.insight2': { en: 'Reduced jailbreak risks', kn: 'ಕಡಿಮೆಯಾದ ಜೈಲ್‌ಬ್ರೇಕ್ ಅಪಾಯಗಳು' },
  'dash.insight3': { en: 'Greater protection for Indian users', kn: 'ಭಾರತೀಯ ಬಳಕೆದಾರರಿಗೆ ಹೆಚ್ಚಿನ ರಕ್ಷಣೆ' },
  'dash.chatbotAnalysis': { en: 'Chatbot Response Analysis', kn: 'ಚಾಟ್‌ಬಾಟ್ ಪ್ರತಿಕ್ರಿಯೆ ವಿಶ್ಲೇಷಣೆ' },
  'dash.modelOutput': { en: 'Model Output', kn: 'ಮಾದರಿ ಪ್ರತಿಕ್ರಿಯೆ' },
  'dash.noContent': { en: 'No harmful content detected', kn: 'ಯಾವುದೇ ಹಾನಿಕಾರಕ ವಿಷಯ ಪತ್ತೆಯಾಗಿಲ್ಲ' },

  // Reports
  'rep.title': { en: 'Reports', kn: 'ವರದಿಗಳು' },
  'rep.subtitle': { en: 'View your AI safety reports and insights', kn: 'ನಿಮ್ಮ AI ಸುರಕ್ಷತಾ ವರದಿಗಳು ಮತ್ತು ಒಳನೋಟಗಳನ್ನು ವೀಕ್ಷಿಸಿ' },
  'rep.overviewTitle': { en: 'Your Safety Overview', kn: 'ನಿಮ್ಮ ಸುರಕ್ಷತಾ ಅವಲೋಕನ' },
  'rep.overviewSub': { en: 'Consistent safety across your recent activity', kn: 'ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಯಲ್ಲಿ ಸ್ಥಿರ ಸುರಕ್ಷತೆ' },
  'rep.score': { en: 'Safety Score', kn: 'ಸುರಕ್ಷತಾ ಸ್ಕೋರ್' },
  'rep.scoreSafeMsg': { en: 'Your AI interactions are generally safe!', kn: 'ನಿಮ್ಮ AI ಸಂವಹನಗಳು ಸಾಮಾನ್ಯವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿವೆ!' },
  'rep.scoreRiskMsg': { en: 'Risks were detected in the selected period.', kn: 'ಆಯ್ಕೆಮಾಡಿದ ಅವಧಿಯಲ್ಲಿ ಅಪಾಯಗಳು ಪತ್ತೆಯಾಗಿವೆ.' },
  'rep.viewDetails': { en: 'View Details', kn: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ' },
  'rep.trend': { en: 'Trend Overview', kn: 'ಪ್ರವೃತ್ತಿ ಅವಲೋಕನ' },
  'rep.riskBreakdown': { en: 'Risk Breakdown', kn: 'ಅಪಾಯದ ವಿಭಜನೆ' },
  'rep.recentReports': { en: 'Recent Reports', kn: 'ಇತ್ತೀಚಿನ ವರದಿಗಳು' },
  'rep.viewAll': { en: 'View All', kn: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ' },
  'rep.view': { en: 'View', kn: 'ವೀಕ್ಷಿಸಿ' },
  'rep.insight': { en: 'Insight', kn: 'ಒಳನೋಟ' },
  'rep.last7': { en: 'Last 7 Days', kn: 'ಕೊನೆಯ 7 ದಿನಗಳು' },
  'rep.last30': { en: 'Last 30 Days', kn: 'ಕೊನೆಯ 30 ದಿನಗಳು' },
  'rep.last90': { en: 'Last 90 Days', kn: 'ಕೊನೆಯ 90 ದಿನಗಳು' },
  'rep.dateTime': { en: 'Date & Time', kn: 'ದಿನಾಂಕ ಮತ್ತು ಸಮಯ' },
  'rep.risks': { en: 'Risks', kn: 'ಅಪಾಯಗಳು' },
  'rep.status': { en: 'Status', kn: 'ಸ್ಥಿತಿ' },
  'rep.action': { en: 'Action', kn: 'ಕ್ರಮ' },
  'rep.harmless': { en: 'Harmless', kn: 'ನಿರುಪದ್ರವಿ' },
  'rep.harmful': { en: 'Potentially Harmful', kn: 'ಸಂಭವನೀಯ ಹಾನಿಕಾರಕ' },
  'rep.highRisk': { en: 'High Risk', kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯ' },
  'rep.emptyReports': { en: 'No evaluation reports recorded yet.', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಮೌಲ್ಯಮಾಪನ ವರದಿಗಳು ದಾಖಲಾಗಿಲ್ಲ.' },

  // About
  'about.title': { en: 'About', kn: 'ನಮ್ಮ ಬಗ್ಗೆ' },
  'about.subtitle': { en: 'Learn more about IndicShield AI', kn: 'ಇಂಡಿಕ್‌ಶೀಲ್ಡ್ AI ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ' },
  'about.heroSub': { en: 'Building a Safer, More Responsible AI for Bharat and Beyond', kn: 'ಭಾರತ ಮತ್ತು ವಿಶ್ವಕ್ಕಾಗಿ ಸುರಕ್ಷಿತ, ಜವಾಬ್ದಾರಿಯುತ AI ನಿರ್ಮಾಣ' },
  'about.heroDesc': {
    en: "IndicShield AI is a comprehensive platform to evaluate, monitor, and enhance the safety of AI models — with a special focus on India's diverse languages, cultural context, and unique use cases.",
    kn: 'ಇಂಡಿಕ್‌ಶೀಲ್ಡ್ AI ಭಾರತದ ವೈವಿಧ್ಯಮಯ ಭಾಷೆಗಳು, ಸಾಂಸ್ಕೃತಿಕ ಸಂದರ್ಭ ಮತ್ತು ಅನನ್ಯ ಬಳಕೆಗಳನ್ನು ಗಮನದಲ್ಲಿಟ್ಟುಕೊಂಡು AI ಮಾದರಿಗಳ ಸುರಕ್ಷತೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುವ ಸಮಗ್ರ ವೇದಿಕೆಯಾಗಿದೆ.',
  },
  'about.ourMission': { en: 'Our Mission', kn: 'ನಮ್ಮ ಧ್ಯೇಯ' },
  'about.missionText': {
    en: 'To make AI safer, more inclusive, and trustworthy for everyone — across languages, cultures, and communities.',
    kn: 'ಎಲ್ಲಾ ಭಾಷೆಗಳು, ಸಂಸ್ಕೃತಿಗಳು ಮತ್ತು ಸಮುದಾಯಗಳಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬರಿಗೂ AI ಅನ್ನು ಹೆಚ್ಚು ಸುರಕ್ಷಿತ, ಅಂತರ್ಗತ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹವಾಗಿಸುವುದು.',
  },
  'about.ourVision': { en: 'Our Vision', kn: 'ನಮ್ಮ ದೃಷ್ಟಿಕೋನ' },
  'about.visionText': {
    en: 'A future where AI is not just powerful, but also safe, fair, and beneficial for all, in every language.',
    kn: 'ಪ್ರತಿಯೊಂದು ಭಾಷೆಯಲ್ಲೂ AI ಕೇವಲ ಶಕ್ತಿಶಾಲಿಯಲ್ಲದೆ, ಸುರಕ್ಷಿತ, ನ್ಯಾಯಯುತ ಮತ್ತು ಪ್ರಯೋಜನಕಾರಿಯಾಗುವ ಭವಿಷ್ಯ.',
  },
  'about.keyFeatures': { en: 'Key Features', kn: 'ಪ್ರಮುಖ ವೈಶಿಷ್ಟ್ಯಗಳು' },
  'about.featSafety': { en: 'Safety Evaluation', kn: 'ಸುರಕ್ಷತಾ ಮೌಲ್ಯಮಾಪನ' },
  'about.featSafetyDesc': { en: 'Assess AI model risks', kn: 'AI ಮಾದರಿಯ ಅಪಾಯಗಳ ಮೌಲ್ಯಮಾಪನ' },
  'about.featLang': { en: 'Multilingual Support', kn: 'ಬಹುಭಾಷಾ ಬೆಂಬಲ' },
  'about.featLangDesc': { en: 'English, Kannada, Kanglish', kn: 'ಇಂಗ್ಲಿಷ್, ಕನ್ನಡ, ಕಾಂಗ್ಲಿಷ್' },
  'about.featInsights': { en: 'Actionable Insights', kn: 'ಕ್ರಿಯಾತ್ಮಕ ಒಳನೋಟಗಳು' },
  'about.featInsightsDesc': { en: 'Understand and improve', kn: 'ತಿಳಿದುಕೊಳ್ಳಿ ಮತ್ತು ಸುಧಾರಿಸಿ' },
  'about.featPrivacy': { en: 'Privacy First', kn: 'ಗೌಪ್ಯತೆಗೆ ಮೊದಲ ಆದ್ಯತೆ' },
  'about.featPrivacyDesc': { en: 'Your data, always secure', kn: 'ನಿಮ್ಮ ಡೇಟಾ ಯಾವಾಗಲೂ ಸುರಕ್ಷಿತ' },
  'about.bottomBannerTitle': { en: 'Built for a Responsible AI Future', kn: 'ಜವಾಬ್ದಾರಿಯುತ AI ಭವಿಷ್ಯಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ' },
  'about.bottomBannerDesc': {
    en: 'IndicShield AI is committed to advancing responsible AI through innovation, transparency, and collaboration.',
    kn: 'ಇಂಡಿಕ್‌ಶೀಲ್ಡ್ AI ನಾವೀನ್ಯತೆ, ಪಾರದರ್ಶಕತೆ ಮತ್ತು ಸಹಯೋಗದ ಮೂಲಕ ಜವಾಬ್ದಾರಿಯುತ AI ಮುನ್ನಡೆಸಲು ಬದ್ಧವಾಗಿದೆ.',
  },

  // Profile
  'profile.title': { en: 'My Profile', kn: 'ನನ್ನ ಪ್ರೊಫೈಲ್' },
  'profile.subtitle': { en: 'Manage your account and preferences', kn: 'ನಿಮ್ಮ ಖಾತೆ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ' },
  'profile.accountStatus': { en: 'Account Status', kn: 'ಖಾತೆ ಸ್ಥಿತಿ' },
  'profile.active': { en: 'Active', kn: 'ಸಕ್ರಿಯ' },
  'profile.personalInfo': { en: 'Personal Information', kn: 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ' },
  'profile.edit': { en: 'Edit', kn: 'ಸಂಪಾದಿಸಿ' },
  'profile.save': { en: 'Save', kn: 'ಉಳಿಸಿ' },
  'profile.cancel': { en: 'Cancel', kn: 'ರದ್ದುಮಾಡಿ' },
  'profile.fullName': { en: 'Full Name', kn: 'ಪೂರ್ಣ ಹೆಸರು' },
  'profile.email': { en: 'Email Address', kn: 'ಇಮೇಲ್ ವಿಳಾಸ' },
  'profile.role': { en: 'Role', kn: 'ಪಾತ್ರ' },
  'profile.org': { en: 'Organization', kn: 'ಸಂಸ್ಥೆ' },
  'profile.phone': { en: 'Phone Number', kn: 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ' },
  'profile.langPref': { en: 'Language Preference', kn: 'ಭಾಷಾ ಆದ್ಯತೆ' },
  'profile.preferences': { en: 'Preferences', kn: 'ಆದ್ಯತೆಗಳು' },
  'profile.dashLang': { en: 'Dashboard Language', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಭಾಷೆ' },
  'profile.notifications': { en: 'Notifications', kn: 'ಅಧಿಸೂಚನೆಗಳು' },
  'profile.emailUpdates': { en: 'Receive email updates', kn: 'ಇಮೇಲ್ ನವೀಕರಣಗಳನ್ನು ಪಡೆಯಿರಿ' },
  'profile.security': { en: 'Security', kn: 'ಭದ್ರತೆ' },
  'profile.password': { en: 'Password', kn: 'ಪಾಸ್‌ವರ್ಡ್' },
  'profile.change': { en: 'Change', kn: 'ಬದಲಾಯಿಸಿ' },
  'profile.twoFactor': { en: 'Two-Factor Authentication', kn: 'ದ್ವಿಮುಖ ದೃಢೀಕರಣ' },
  'profile.enabled': { en: 'Enabled', kn: 'ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ' },
  'profile.manage': { en: 'Manage', kn: 'ನಿರ್ವಹಿಸಿ' },
  'profile.loginActivity': { en: 'Login Activity', kn: 'ಲಾಗಿನ್ ಚಟುವಟಿಕೆ' },
  'profile.lastLogin': { en: 'Last login: Today, 9:42 PM', kn: 'ಕೊನೆಯ ಲಾಗಿನ್: ಇಂದು, ರಾತ್ರಿ 9:42' },
  'profile.activitySummary': { en: 'Activity Summary', kn: 'ಚಟುವಟಿಕೆ ಸಾರಾಂಶ' },
  'profile.daysActive': { en: 'Days Active', kn: 'ಸಕ್ರಿಯ ದಿನಗಳು' },
  'profile.logOut': { en: 'Log Out', kn: 'ಸೈನ್ ಔಟ್' },
  'profile.signOutSub': { en: 'Sign out from your account', kn: 'ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಸೈನ್ ಔಟ್ ಮಾಡಿ' },
  'profile.memberSince': { en: 'Member Since Mar 2025', kn: 'ಮಾರ್ಚ್ 2025 ರಿಂದ ಸದಸ್ಯರು' },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('indicshield_ui_lang');
    return saved === 'kn' ? 'kn' : saved === 'kanglish' ? 'kanglish' : 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('indicshield_ui_lang', lang);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
