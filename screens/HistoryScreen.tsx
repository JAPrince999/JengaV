import React, { useState, useEffect } from 'react';
import { SessionSummary, User } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { HistoryIcon } from '../components/icons';
import { getSessionHistory } from '../firebase/firestore';

interface HistoryScreenProps {
  user: User;
  onViewSummary: (summary: SessionSummary) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ user, onViewSummary }) => {
  const [history, setHistory] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const userHistory = await getSessionHistory(user.uid);
        setHistory(userHistory);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#3a2d51] via-[#6c5093] to-[#a78bfa] flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#3a2d51] via-[#6c5093] to-[#a78bfa] text-white font-sans p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Session History</h1>
      </header>
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-purple-200 mt-20">
          <HistoryIcon className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-semibold text-white">No History Yet</h2>
          <p>Complete a session to see your progress here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((summary) => (
            <Card key={summary.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-colors" >
                <button onClick={() => onViewSummary(summary)} className="w-full text-left">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{summary.category}</p>
                      <p className="text-sm text-purple-200">{new Date(summary.date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{summary.score.overall}%</p>
                      <p className="text-xs text-purple-200">Overall Score</p>
                    </div>
                  </CardContent>
                </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;