import React from 'react';
import { Category } from '../types';
import {
  HomeIcon,
  UserIcon,
  PresentationIcon,
  CheckCircleIcon,
  MessageCircleIcon,
  HistoryIcon
} from '../components/icons';

interface HomeScreenProps {
  firstName: string;
  onSelectCategory: (category: Category) => void;
  onLogout: () => void; // Prop is unused in this design but kept for interface consistency
}

const HomeScreen: React.FC<HomeScreenProps> = ({ firstName, onSelectCategory }) => {
  const profileImageUrl = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&q=80';

  // Fix: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const categoryData: { name: Category; icon: React.ReactElement }[] = [
    { name: 'Interview', icon: <UserIcon className="w-12 h-12 text-indigo-200" /> },
    { name: 'Presentation', icon: <PresentationIcon className="w-12 h-12 text-cyan-200" /> },
    { name: 'Negotiations', icon: <CheckCircleIcon className="w-12 h-12 text-emerald-200" /> },
    { name: 'Feedback Coach', icon: <MessageCircleIcon className="w-12 h-12 text-amber-200" /> },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#3a2d51] via-[#6c5093] to-[#a78bfa] text-white font-sans flex flex-col">
      {/* Background decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0">
         <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
         <div className="absolute -bottom-10 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="flex-1 flex flex-col p-6 pt-8 pb-32 z-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Hey {firstName}</h1>
          <img src={profileImageUrl} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white/50" />
        </header>

        <div className="mb-10">
            <p className="text-lg text-purple-200">You are a brilliant mind.</p>
            <p className="text-lg text-purple-200">What would you like to do today?</p>
        </div>

        <main>
          <div className="grid grid-cols-2 gap-5">
            {categoryData.map((cat) => (
              <div 
                key={cat.name} 
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex flex-col items-center justify-center aspect-square space-y-3 cursor-pointer border border-white/20 hover:bg-white/20 transition-all duration-300"
                onClick={() => onSelectCategory(cat.name)}
                role="button"
                aria-label={`Select category: ${cat.name}`}
              >
                <div className="flex-1 flex items-center justify-center">
                  {cat.icon}
                </div>
                <span className="font-semibold text-base text-purple-100">{cat.name}</span>
              </div>
            ))}
          </div>
        </main>
      </div>

    </div>
  );
};

export default HomeScreen;