import React, { useState } from 'react';
import { Category, SessionMode } from '../types';
import Button from '../components/ui/Button';
import { MicIcon, VideoIcon, BookOpenIcon } from '../components/icons';
import OnboardingModal from '../components/OnboardingModal';

interface ModeSelectionScreenProps {
  category: Category;
  onSelectMode: (mode: SessionMode) => void;
  onBack: () => void;
  hasSeenOnboardingTour: boolean;
  onOnboardingComplete: () => void;
}

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ category, onSelectMode, onBack, hasSeenOnboardingTour, onOnboardingComplete }) => {
  const [isTourOpen, setIsTourOpen] = useState(!hasSeenOnboardingTour);
  
  const handleCloseTour = () => {
    setIsTourOpen(false);
    onOnboardingComplete();
  };
  
  return (
    <>
    <OnboardingModal
      isOpen={isTourOpen}
      onClose={handleCloseTour}
      onSkip={handleCloseTour}
      skipButtonText="Skip Tour"
      title={`Practice Modes for ${category}`}
      buttonText="Let's Choose"
    >
      <div className="space-y-4 text-muted-foreground">
        <p>
          <strong className="text-foreground">Conversational Mode:</strong><br />
          Simulate a real back-and-forth dialogue. The AI coach will ask you questions and react to your answers. Use this to practice your interactive skills.
        </p>
        <p>
          <strong className="text-foreground">NoTak Mode (No-Talkback):</strong><br />
          Deliver a speech or monologue without interruption. This is perfect for practicing presentations, pitches, or prepared statements.
        </p>
      </div>
    </OnboardingModal>

    <div className="min-h-screen w-full bg-gradient-to-b from-[#3a2d51] via-[#6c5093] to-[#a78bfa] text-white font-sans flex flex-col items-center justify-center p-4">
      {/* Background decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0">
         <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
         <div className="absolute -bottom-10 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl w-full z-10">
        <Button variant="link" onClick={onBack} className="absolute top-6 left-4 md:top-8 md:left-8 text-purple-200 hover:text-white">
          &larr; Back to Categories
        </Button>
        <div className="text-center mb-10 pt-16 md:pt-0">
          <p className="text-xl md:text-2xl text-purple-200">Selected Category</p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white break-words leading-tight">{category}</h1>
          <p className="text-lg md:text-xl text-purple-200 mt-6">How would you like to practice?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 flex flex-col">
            <h2 className="text-2xl font-bold mb-2">Conversational Mode</h2>
            <p className="text-purple-200 mb-6 flex-1">Engage in an AI-driven dialogue that simulates a real-life scenario.</p>
            <div className="space-y-3">
              <Button className="w-full justify-start text-left h-auto py-3 bg-white/10 hover:bg-white/20" onClick={() => onSelectMode(SessionMode.CONVERSATIONAL_AUDIO_ONLY)}>
                 <MicIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                 <div>
                    <p className="font-semibold">Audio Only</p>
                    <p className="text-xs text-purple-200/80">Practice speaking with AI questions.</p>
                 </div>
              </Button>
               <Button className="w-full justify-start text-left h-auto py-3 bg-white/10 hover:bg-white/20" onClick={() => onSelectMode(SessionMode.CONVERSATIONAL_WITH_VIDEO)}>
                 <VideoIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                 <div>
                    <p className="font-semibold">Audio + Posture Analysis</p>
                    <p className="text-xs text-purple-200/80">Enable camera for posture & expression feedback.</p>
                 </div>
              </Button>
               <Button className="w-full justify-start text-left h-auto py-3 bg-white/10 hover:bg-white/20" onClick={() => onSelectMode(SessionMode.CONVERSATIONAL_WITH_DEMO)}>
                 <BookOpenIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                 <div>
                    <p className="font-semibold">Audio + AI Demo</p>
                    <p className="text-xs text-purple-200/80">Hear how the AI would phrase your answers.</p>
                 </div>
              </Button>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 flex flex-col">
            <h2 className="text-2xl font-bold mb-2">Chat Mode</h2>
            <p className="text-purple-200 mb-6 flex-1">Deliver your speech without interruption. Get a full summary at the end.</p>
            <div className="space-y-3">
              <Button className="w-full justify-start text-left h-auto py-3 bg-white/10 hover:bg-white/20" onClick={() => onSelectMode(SessionMode.NOTAK_AUDIO_ONLY)}>
                 <MicIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                 <div>
                    <p className="font-semibold">Audio Only</p>
                    <p className="text-xs text-purple-200/80">Focus solely on your speech patterns.</p>
                 </div>
              </Button>
               <Button className="w-full justify-start text-left h-auto py-3 bg-white/10 hover:bg-white/20" onClick={() => onSelectMode(SessionMode.NOTAK_WITH_VIDEO)}>
                 <VideoIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                 <div>
                    <p className="font-semibold">Audio + Posture Analysis</p>
                    <p className="text-xs text-purple-200/80">Get feedback on speech and body language.</p>
                 </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ModeSelectionScreen;