export enum AppScreen {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  HOME = 'HOME',
  MODE_SELECTION = 'MODE_SELECTION',
  SESSION = 'SESSION',
  SCORING = 'SCORING',
  SUMMARY = 'SUMMARY',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
}

export enum SessionMode {
  CONVERSATIONAL_AUDIO_ONLY = 'CONVERSATIONAL_AUDIO_ONLY',
  CONVERSATIONAL_WITH_VIDEO = 'CONVERSATIONAL_WITH_VIDEO',
  CONVERSATIONAL_WITH_DEMO = 'CONVERSATIONAL_WITH_DEMO',
  NOTAK_AUDIO_ONLY = 'NOTAK_AUDIO_ONLY',
  NOTAK_WITH_VIDEO = 'NOTAK_WITH_VIDEO',
}

export enum WordCategory {
  NORMAL = 'normal',
  FILLER = 'filler',
  WEAK = 'weak',
  STRONG = 'strong',
}

export type User = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AnalyzedWord = {
  text: string;
  category: WordCategory;
};

export type TranscriptEntry = {
  speaker: 'user' | 'ai';
  words: AnalyzedWord[];
  timestamp: Date;
};

export type Score = {
  overall: number;
  strong: number;
  weak: number;
  filler: number;
};

export type SessionSummary = {
  id: string;
  date: string;
  category: string;
  mode: SessionMode;
  score: Score;
  transcript: TranscriptEntry[];
  improvements: string[];
  postureFeedback: string;
  toneFeedback: string;
  fillerWordCounts?: { [key: string]: number };
  pronunciationScore: number;
  pronunciationFeedback: string;
  emotionFeedback: string;
};

export type Category = 'Interview' | 'Presentation' | 'Negotiations' | 'Feedback Coach';