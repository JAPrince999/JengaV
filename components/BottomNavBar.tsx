import React from 'react';
import { HomeIcon, HistoryIcon, UserIcon } from './icons';
import { AppScreen } from '../types';

interface BottomNavBarProps {
  currentScreen: AppScreen;
  onGoToHome: () => void;
  onGoToHistory: () => void;
  onGoToSettings: () => void;
}

// FIX: Update the type of the `icon` prop to `React.ReactElement<{ className?: string }>`
// to correctly type the props for `React.cloneElement`.
// This resolves an error where TypeScript couldn't verify that `className` was a valid prop for the icon component.
const NavItem: React.FC<{
  label: string;
  icon: React.ReactElement<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-white';
  const inactiveClasses = 'text-purple-300 hover:text-white';
  const textClasses = isActive ? 'font-bold text-white' : 'text-purple-300';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 w-20 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
      <span className={`text-xs ${textClasses}`}>{label}</span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, onGoToHome, onGoToHistory, onGoToSettings }) => {
  const isNavVisible = [AppScreen.HOME, AppScreen.HISTORY].includes(currentScreen);

  if (!isNavVisible) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-lg z-20 border-t border-white/10">
      <div className="h-[4.5rem] flex justify-around items-center max-w-md mx-auto">
        <NavItem
          label="Home"
          icon={<HomeIcon />}
          isActive={currentScreen === AppScreen.HOME}
          onClick={onGoToHome}
        />
        <NavItem
          label="History"
          icon={<HistoryIcon />}
          isActive={currentScreen === AppScreen.HISTORY}
          onClick={onGoToHistory}
        />
        <NavItem
          label="Profile"
          icon={<UserIcon />}
          isActive={currentScreen === AppScreen.SETTINGS}
          onClick={onGoToSettings}
        />
      </div>
      <div className="pb-3 pt-1 sm:hidden">
        <div className="w-32 h-1.5 bg-gray-500/50 rounded-full mx-auto"></div>
      </div>
    </footer>
  );
};

export default BottomNavBar;