import React, { useState, useCallback, useEffect } from 'react';
import { AppScreen, Category, SessionMode, SessionSummary, User } from './types';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import ModeSelectionScreen from './screens/ModeSelectionScreen';
import SessionScreen from './screens/SessionScreen';
import ScoringScreen from './screens/ScoringScreen';
import SummaryScreen from './screens/SummaryScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNavBar from './components/BottomNavBar';
import ApiKeyScreen from './screens/ApiKeyScreen';
import { auth } from './firebase/config';
import { saveSessionSummary } from './firebase/firestore';

// Fix: Define an AIStudio interface to prevent global type conflicts.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [appScreen, setAppScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [isApiKeySelected, setIsApiKeySelected] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<Category>('Interview');
  const [selectedMode, setSelectedMode] = useState<SessionMode>(SessionMode.CONVERSATIONAL_AUDIO_ONLY);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  
  const [hasSeenModeOnboarding, setHasSeenModeOnboarding] = useState(false);
  const [hasSeenSessionOnboarding, setHasSeenSessionOnboarding] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        if (window.aistudio) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsApiKeySelected(hasKey);
        } else {
          console.warn('aistudio context not found. Assuming API key is set via environment.');
          // In a local dev environment without the aistudio proxy, this allows the app to proceed.
          // It relies on process.env.API_KEY being available through other means (e.g., Vite).
          setIsApiKeySelected(true);
        }
      } catch (e) {
        console.error("Error checking for API key:", e);
        setIsApiKeySelected(false);
      } finally {
        setIsCheckingApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Per platform instructions, assume success to avoid race conditions.
        setIsApiKeySelected(true);
      } catch (e) {
        console.error("Could not open API key selection dialog:", e);
      }
    }
  };

  const handleApiKeyInvalid = useCallback(() => {
    console.error("API key is invalid or was not found. Prompting user to select a new one.");
    setIsApiKeySelected(false);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const [firstName, ...lastNameParts] = (firebaseUser.displayName || " ").split(" ");
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          firstName,
          lastName: lastNameParts.join(" "),
        });
        setAppScreen(AppScreen.HOME);
      } else {
        setUser(null);
        setAppScreen(AppScreen.LOGIN);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);
  
  const handleGoToSignup = useCallback(() => {
    setAppScreen(AppScreen.SIGNUP);
  }, []);

  const handleGoToLogin = useCallback(() => {
    setAppScreen(AppScreen.LOGIN);
  }, []);

  const handleSelectCategory = useCallback((category: Category) => {
    setSelectedCategory(category);
    setAppScreen(AppScreen.MODE_SELECTION);
  }, []);

  const handleSelectMode = useCallback((mode: SessionMode) => {
    setSelectedMode(mode);
    setAppScreen(AppScreen.SESSION);
  }, []);

  const handleSessionEnd = useCallback(async (summary: Omit<SessionSummary, 'id' | 'date' | 'category' | 'mode'>) => {
    if (!user) return;

    const newSummary: SessionSummary = {
      ...summary,
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      category: selectedCategory,
      mode: selectedMode,
    };
    setSessionSummary(newSummary);
    try {
      await saveSessionSummary(user.uid, newSummary);
    } catch (error) {
      console.error("Failed to save session summary:", error);
    }
    setAppScreen(AppScreen.SCORING);
  }, [user, selectedCategory, selectedMode]);

  const handleViewSummary = useCallback((summary: SessionSummary) => {
    setSessionSummary(summary);
    setAppScreen(AppScreen.SUMMARY);
  }, []);
  
  const handleStartOver = useCallback(() => {
    setAppScreen(AppScreen.HOME);
  }, []);

  const handleBackToHome = useCallback(() => {
    setSessionSummary(null);
    setAppScreen(AppScreen.HOME);
  }, []);

  const handleBackToCategories = useCallback(() => {
    setAppScreen(AppScreen.HOME);
  }, []);
  
  const handleModeOnboardingComplete = useCallback(() => {
    setHasSeenModeOnboarding(true);
  }, []);
  
  const handleSessionOnboardingComplete = useCallback(() => {
    setHasSeenSessionOnboarding(true);
  }, []);
  
  const handleGoToHome = useCallback(() => setAppScreen(AppScreen.HOME), []);
  const handleGoToHistory = useCallback(() => setAppScreen(AppScreen.HISTORY), []);
  const handleGoToSettings = useCallback(() => setAppScreen(AppScreen.SETTINGS), []);

  const handleSaveChanges = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    setAppScreen(AppScreen.HOME);
  }, []);

  const renderScreen = () => {
    if (isLoadingAuth || isCheckingApiKey) {
      return (
        <div className="min-h-screen w-full bg-gradient-to-b from-[#3a2d51] via-[#6c5093] to-[#a78bfa] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (!isApiKeySelected) {
      return <ApiKeyScreen onSelectKey={handleSelectApiKey} />;
    }

    if (!user) {
        switch (appScreen) {
            case AppScreen.SIGNUP:
                return <SignupScreen onGoToLogin={handleGoToLogin} />;
            default:
                return <LoginScreen onGoToSignup={handleGoToSignup} onSkip={() => {}} />;
        }
    }

    switch (appScreen) {
      case AppScreen.HOME:
        return <HomeScreen firstName={user.firstName} onSelectCategory={handleSelectCategory} onLogout={() => {}} />;
      case AppScreen.MODE_SELECTION:
        return <ModeSelectionScreen 
                    category={selectedCategory} 
                    onSelectMode={handleSelectMode} 
                    onBack={handleBackToCategories} 
                    hasSeenOnboardingTour={hasSeenModeOnboarding}
                    onOnboardingComplete={handleModeOnboardingComplete}
                />;
      case AppScreen.SESSION:
        return <SessionScreen 
                    category={selectedCategory} 
                    mode={selectedMode} 
                    onSessionEnd={handleSessionEnd} 
                    hasSeenOnboardingTour={hasSeenSessionOnboarding}
                    onOnboardingComplete={handleSessionOnboardingComplete}
                    onApiKeyInvalid={handleApiKeyInvalid}
                />;
      case AppScreen.SCORING:
        if (!sessionSummary) return <HomeScreen firstName={user.firstName} onSelectCategory={handleSelectCategory} onLogout={() => {}} />;
        return <ScoringScreen summary={sessionSummary} onViewSummary={() => handleViewSummary(sessionSummary)} onStartOver={handleStartOver} />;
      case AppScreen.SUMMARY:
        if (!sessionSummary) return <HomeScreen firstName={user.firstName} onSelectCategory={handleSelectCategory} onLogout={() => {}} />;
        return <SummaryScreen summary={sessionSummary} onBackToHome={handleBackToHome} />;
      case AppScreen.HISTORY:
        return <HistoryScreen user={user} onViewSummary={handleViewSummary} />;
      case AppScreen.SETTINGS:
        return <SettingsScreen user={user} onSaveChanges={handleSaveChanges} />;
      default:
        return <HomeScreen firstName={user.firstName} onSelectCategory={handleSelectCategory} onLogout={() => {}} />;
    }
  };

  return (
    <>
      {renderScreen()}
      {user && <BottomNavBar 
        currentScreen={appScreen} 
        onGoToHome={handleGoToHome}
        onGoToHistory={handleGoToHistory}
        onGoToSettings={handleGoToSettings}
      />}
    </>
  );
};

export default App;