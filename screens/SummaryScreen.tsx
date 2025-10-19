
import React from 'react';
import { SessionSummary, WordCategory } from '../types';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';
import { CheckCircleIcon, XCircleIcon, InfoIcon, SignalIcon, MessageCircleIcon, SmileIcon } from '../components/icons';

interface SummaryScreenProps {
  summary: SessionSummary;
  onBackToHome: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ summary, onBackToHome }) => {
  const { score, transcript, improvements, postureFeedback, toneFeedback, pronunciationScore, pronunciationFeedback, emotionFeedback } = summary;
  
  const totalWordsInTranscript = transcript
    .filter(t => t.speaker === 'user')
    .reduce((acc, entry) => acc + entry.words.reduce((wordAcc, word) => wordAcc + word.text.split(/\s+/).length, 0), 0);

  const getWordClass = (category: WordCategory) => {
    switch (category) {
      case WordCategory.FILLER:
        return 'bg-yellow-500/20 text-yellow-300 underline decoration-yellow-500 decoration-dotted underline-offset-2 px-1 rounded-md';
      case WordCategory.WEAK:
        return 'bg-red-500/20 text-red-400 font-medium px-1 rounded-md';
      case WordCategory.STRONG:
        return 'bg-green-500/20 text-green-400 font-bold px-1 rounded-md';
      default:
        return '';
    }
  };
  
  const getProgressValue = (count: number) => {
    if (totalWordsInTranscript === 0) return 0;
    return (count / totalWordsInTranscript) * 100;
  }
  
  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 ${className}`}>
        {children}
    </div>
  );

  const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-6 pb-0">{children}</div>
  );

  const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-xl font-bold text-white">{children}</h2>
  );
  
  const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`p-6 ${className}`}>{children}</div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#3a2d51] via-[#6c5093] to-[#a78bfa] text-white font-sans p-4 md:p-8">
       {/* Background decorative shapes */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0">
         <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
         <div className="absolute -bottom-10 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto z-10 relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Session Summary</h1>
          <Button onClick={onBackToHome} className="bg-white/10 hover:bg-white/20">Back to Home</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <Card>
              <CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-green-300">Strong Language</span>
                    <span className="text-sm font-medium text-green-300">{score.strong} phrases</span>
                  </div>
                  <Progress value={getProgressValue(score.strong)} className="bg-white/10 [&>div]:bg-green-500" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-red-400">Weak Language</span>
                    <span className="text-sm font-medium text-red-400">{score.weak} phrases</span>
                  </div>
                  <Progress value={getProgressValue(score.weak)} className="bg-white/10 [&>div]:bg-red-500"/>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-yellow-300">Filler Words</span>
                    <span className="text-sm font-medium text-yellow-300">{score.filler} words</span>
                  </div>
                  <Progress value={getProgressValue(score.filler)} className="bg-white/10 [&>div]:bg-yellow-400"/>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader><CardTitle>Full Transcript</CardTitle></CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto space-y-4">
                {transcript.map((entry, i) => (
                    <div key={i}>
                      <div className="flex items-baseline space-x-2 mb-1">
                        <p className={`font-bold ${entry.speaker === 'ai' ? 'text-cyan-300' : 'text-white'}`}>
                          {entry.speaker === 'ai' ? 'JengaV Coach' : 'You'}
                        </p>
                        <time className="text-xs text-purple-300/80">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </time>
                      </div>
                      <p className="text-sm text-purple-100">
                        {entry.words.map((word, j) => (
                          <span key={j} className={getWordClass(word.category)}>
                            {word.text}{' '}
                          </span>
                        ))}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col space-y-6">
            <Card>
              <CardHeader><CardTitle>Improvements</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {improvements.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-purple-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Posture & Presence</CardTitle></CardHeader>
              <CardContent>
                 <div className="flex items-start">
                    <InfoIcon className="w-5 h-5 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-purple-200">{postureFeedback}</span>
                  </div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle>Tone Analysis</CardTitle></CardHeader>
              <CardContent>
                 <div className="flex items-start">
                    <SignalIcon className="w-5 h-5 text-fuchsia-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-purple-200">{toneFeedback}</span>
                  </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Emotion Analysis</CardTitle></CardHeader>
              <CardContent>
                 <div className="flex items-start">
                    <SmileIcon className="w-5 h-5 text-orange-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-purple-200">{emotionFeedback}</span>
                  </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Pronunciation Clarity</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center mb-4">
                    <div className="relative w-24 h-24 mb-2">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-white/10" strokeWidth="8" stroke="currentColor" fill="transparent" r="46" cx="50" cy="50"/>
                        <circle
                          className="text-blue-400"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 46}
                          strokeDashoffset={2 * Math.PI * 46 * (1 - (pronunciationScore || 0) / 100)}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="46" cx="50" cy="50"
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-blue-400">{pronunciationScore || 0}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-purple-200">Clarity Score</p>
                </div>
                <div className="flex items-start text-left pt-4 border-t border-white/20">
                  <MessageCircleIcon className="w-5 h-5 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-purple-200">{pronunciationFeedback}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Filler Word Analysis</CardTitle></CardHeader>
              <CardContent className="text-center">
                <p className="text-6xl font-bold text-yellow-300">{score.filler}</p>
                <p className="text-purple-200 mt-2 mb-6">Total Filler Words Used</p>
                {summary.fillerWordCounts && Object.keys(summary.fillerWordCounts).length > 0 && (
                  <div className="text-left border-t border-white/20 pt-4">
                    <h4 className="font-semibold text-white mb-3">Breakdown</h4>
                    <ul className="space-y-2">
                      {/* Fix: Cast the result of Object.entries to [string, number][] to resolve TypeScript errors.
                          This ensures that the values are correctly typed as numbers for sorting and comparison. */}
                      {(Object.entries(summary.fillerWordCounts) as [string, number][])
                      .sort(([, a], [, b]) => b - a)
                      .map(([word, count]) => (
                          <li key={word} className="flex justify-between items-center text-sm text-purple-200">
                          <span className="capitalize font-mono bg-black/20 px-1.5 py-0.5 rounded">"{word}"</span>
                          <span>{count} {count > 1 ? 'times' : 'time'}</span>
                          </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryScreen;
