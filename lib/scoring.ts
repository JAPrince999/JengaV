import { AnalyzedWord, WordCategory, TranscriptEntry, Score } from '../types';

// ==================================================================
// LANGUAGE DEFINITIONS
// ==================================================================

export const strongWords = new Set([
  'i will', 'we will', 'i am confident', 'we can achieve', 'the data shows',
  'my analysis indicates', 'the solution is', 'i recommend', 'we should',
  'the next step is', 'i have successfully', 'we delivered', 'i accomplished',
  'definitely', 'certainly', 'without a doubt', 'absolutely', 'executed',
  'achieved', 'spearheaded', 'delivered', 'generated', 'improved',
  'resolved', 'i propose', 'the benefit is', 'the key takeaway is', 'in conclusion'
]);

export const weakWords = new Set([
  'i think', 'i guess', 'i feel', 'maybe', 'perhaps', 'possibly', 'kind of',
  'sort of', 'a little bit', 'i might be wrong but', 'this is just my opinion but',
  'i believe', 'it seems like', 'hopefully', 'i suppose', 'just', 'actually',
  'basically', 'i mean', 'if that makes sense', 'am i making sense'
]);

export const fillerWords = new Set([
  'um', 'umm', 'uh', 'er', 'ah', 'like', 'you know', 'so', 'well', 'right', 'okay', 'hmm'
]);

const allKeywords = [...strongWords, ...weakWords, ...fillerWords]
  .map(phrase => ({ phrase, words: phrase.split(' ') }))
  .sort((a, b) => b.words.length - a.words.length); // Prioritize longer phrases

// ==================================================================
// TEXT ANALYSIS FUNCTION
// ==================================================================

export const analyzeText = (text: string): AnalyzedWord[] => {
  const inputWords = text.trim().split(/\s+/).filter(w => w.length > 0);
  const analyzedWords: AnalyzedWord[] = [];
  let i = 0;

  while (i < inputWords.length) {
    let matchFound = false;
    for (const keyword of allKeywords) {
      if (i + keyword.words.length <= inputWords.length) {
        const segment = inputWords.slice(i, i + keyword.words.length);
        const segmentPhrase = segment.join(' ').toLowerCase().replace(/[,.]/g, '');

        if (segmentPhrase === keyword.phrase) {
          let category = WordCategory.NORMAL;
          if (strongWords.has(keyword.phrase)) category = WordCategory.STRONG;
          else if (weakWords.has(keyword.phrase)) category = WordCategory.WEAK;
          else if (fillerWords.has(keyword.phrase)) category = WordCategory.FILLER;
          
          analyzedWords.push({
            text: segment.join(' '),
            category,
          });
          i += keyword.words.length;
          matchFound = true;
          break;
        }
      }
    }

    if (!matchFound) {
      analyzedWords.push({
        text: inputWords[i],
        category: WordCategory.NORMAL,
      });
      i++;
    }
  }

  return analyzedWords;
};


// ==================================================================
// SCORING CALCULATION
// ==================================================================

export const calculateScoresAndImprovements = (transcript: TranscriptEntry[]): { score: Score; improvements: string[], fillerWordCounts: { [key: string]: number } } => {
  let strongCount = 0;
  let weakCount = 0;
  let fillerCount = 0;
  let totalWords = 0;
  const fillerWordCounts: { [key: string]: number } = {};
  const weakWordCounts: { [key: string]: number } = {};

  const userTranscript = transcript.filter(t => t.speaker === 'user');

  userTranscript.forEach(entry => {
    entry.words.forEach(word => {
      if (word.text.trim().length === 0) return;

      const wordCountInPhrase = word.text.split(/\s+/).length;
      totalWords += wordCountInPhrase;

      switch (word.category) {
        case WordCategory.STRONG:
          strongCount++;
          break;
        case WordCategory.WEAK:
          weakCount++;
           weakWordCounts[word.text.toLowerCase()] = (weakWordCounts[word.text.toLowerCase()] || 0) + 1;
          break;
        case WordCategory.FILLER:
          fillerCount++;
          fillerWordCounts[word.text.toLowerCase()] = (fillerWordCounts[word.text.toLowerCase()] || 0) + 1;
          break;
      }
    });
  });

  // Scoring Algorithm:
  // Base score of 100.
  // Strong words have a positive impact.
  // Weak and Filler words have a negative impact.
  // The impact is normalized by the total number of words to prevent short sessions from being unfairly penalized.
  let overallScore = 50; // Start from a neutral baseline
  if (totalWords > 0) {
    const strongRatio = strongCount / totalWords;
    const weakRatio = weakCount / totalWords;
    const fillerRatio = fillerCount / totalWords;
    
    // Assign weights: Strong words are beneficial, weak/filler words are detrimental.
    const strongBonus = strongRatio * 150; // Higher weight for positive language
    const weakPenalty = weakRatio * 100;
    const fillerPenalty = fillerRatio * 50;

    overallScore = 50 + strongBonus - weakPenalty - fillerPenalty;
  }
  
  // Clamp score between 0 and 100
  overallScore = Math.max(0, Math.min(100, Math.round(overallScore)));

  const score: Score = {
    overall: overallScore,
    strong: strongCount,
    weak: weakCount,
    filler: fillerCount,
  };
  
  // Generate dynamic improvements
  const improvements: string[] = [];
  if(strongCount / totalWords > 0.1) {
    improvements.push("Excellent use of strong, assertive language. Keep it up!");
  } else {
     improvements.push("Try to incorporate more assertive phrases like 'I will' or 'the solution is' to convey confidence.");
  }

  const sortedWeakWords = Object.entries(weakWordCounts).sort(([,a],[,b]) => b-a);
  if (sortedWeakWords.length > 0) {
    const mostCommonWeak = sortedWeakWords[0][0];
    improvements.push(`You frequently used the weak phrase "${mostCommonWeak}". Consider replacing it with more direct language.`);
  } else if (weakCount > 0) {
     improvements.push("You avoided common weak phrases, which is great. Continue to speak with conviction.");
  } else {
     improvements.push("Fantastic! Your speech was free of weak language, projecting strong confidence.");
  }

  const sortedFillerWords = Object.entries(fillerWordCounts).sort(([, a], [, b]) => b - a);
  if (sortedFillerWords.length > 0) {
    const mostCommonFiller = sortedFillerWords[0][0];
    improvements.push(`Your most common filler word was "${mostCommonFiller}". Try pausing for a moment instead to gather your thoughts.`);
  } else {
    improvements.push("Amazing job! You avoided filler words, which made your speech sound polished and professional.");
  }

  return { score, improvements, fillerWordCounts };
};