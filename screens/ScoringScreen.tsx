
import React from 'react';
import { SessionSummary } from '../types';
import Button from '../components/ui/Button';

interface ScoringScreenProps {
  summary: SessionSummary;
  onViewSummary: () => void;
  onStartOver: () => void;
}

const ScoringScreen: React.FC<ScoringScreenProps> = ({ summary, onViewSummary, onStartOver }) => {
  const score = summary.score.overall;
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-300';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#3a2d51] via-[#6c5093] to-[#a78bfa] text-white font-sans flex flex-col items-center justify-center p-4">
       {/* Background decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0">
         <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
         <div className="absolute -bottom-10 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md text-center z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h1 className="text-2xl font-bold mb-2">Session Complete!</h1>
          <div className="flex flex-col items-center space-y-6 mt-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-white/10"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={getScoreColor()}
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - score / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-5xl font-bold ${getScoreColor()}`}>{score}%</span>
              </div>
            </div>
            <p className="text-purple-200">This is your overall performance score for this session.</p>
            <div className="flex w-full space-x-4 pt-4">
              <Button className="flex-1 bg-white/20 hover:bg-white/30" size="lg" onClick={onViewSummary}>View Summary</Button>
              <Button className="flex-1 border border-white/20 bg-transparent hover:bg-white/10" size="lg" variant="outline" onClick={onStartOver}>Start Over</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringScreen;