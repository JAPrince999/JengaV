
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Analyzing your speech patterns...",
  "Evaluating posture and presence...",
  "Compiling your feedback report...",
  "Identifying key improvement areas...",
  "Just a moment, greatness is loading...",
];

const SessionLoadingOverlay: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white font-sans">
      <svg className="animate-spin h-12 w-12 text-white mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 className="text-2xl font-bold mb-2">Analyzing Session</h2>
      <p className="text-lg text-purple-200 transition-opacity duration-500 ease-in-out">{loadingMessages[messageIndex]}</p>
    </div>
  );
};

export default SessionLoadingOverlay;
