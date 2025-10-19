import React from 'react';
import Button from '../components/ui/Button';

interface ApiKeyScreenProps {
  onSelectKey: () => void;
}

const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onSelectKey }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-purple-50 to-purple-200 flex flex-col items-center justify-center p-6 text-gray-800">
      <div className="w-full max-w-md text-center bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/30">
        <h1 className="text-3xl font-bold mb-4 text-black">API Key Required</h1>
        <p className="text-gray-600 mb-8">
          To use the AI-powered features of JengaV, please select your Gemini API key.
        </p>
        <Button 
          onClick={onSelectKey} 
          className="w-full bg-black text-white rounded-lg h-12 text-base font-semibold hover:bg-gray-800 focus-visible:ring-black"
        >
          Select API Key
        </Button>
        <p className="text-xs text-gray-500 mt-4">
          This will open a dialog to select an API key from your Google AI Studio account. Ensure billing is enabled for your project.
          {' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-black font-medium">
            Learn more
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyScreen;
