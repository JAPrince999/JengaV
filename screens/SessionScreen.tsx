import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Category, SessionMode, TranscriptEntry, WordCategory, AnalyzedWord } from '../types';
import Button from '../components/ui/Button';
import Legend from '../components/Legend';
import { StopCircleIcon, MicIcon, InfoIcon } from '../components/icons';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { GoogleGenAI, Modality } from "@google/genai";
import { analyzeText, calculateScoresAndImprovements } from '../lib/scoring';
import { isMobileDevice, isIOSDevice, isAndroidDevice, ensureSecureContext, createMobileOptimizedAudioContext, getMobileOptimizedConstraints, handleMobileSpeechRecognitionError, getMobileOptimizedDelay } from '../lib/mobileUtils';
import OnboardingModal from '../components/OnboardingModal';
import Switch from '../components/ui/Switch';
import Label from '../components/ui/Label';
import SessionLoadingOverlay from '../components/SessionLoadingOverlay';

// Helper functions for TTS Audio
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// Fix: Add type definitions for Web Speech API to resolve compilation errors.
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}


interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
    FilesetResolver: typeof FilesetResolver;
    PoseLandmarker: typeof PoseLandmarker;
    webkitAudioContext: typeof AudioContext;
  }
}

// Custom Pose Connections for clear visualization
const GREEN_CONNECTIONS = [
  // Face
  {start: 0, end: 1}, {start: 1, end: 2}, {start: 2, end: 3},
  {start: 0, end: 4}, {start: 4, end: 5}, {start: 5, end: 6},
  {start: 9, end: 10},
  // Torso
  {start: 11, end: 12}, // R shoulder to L shoulder
  {start: 23, end: 24}, // R hip to L hip
  {start: 11, end: 23}, // R shoulder to R hip
  {start: 12, end: 24}, // L shoulder to L hip
  // Arms
  {start: 11, end: 13}, // R shoulder to R elbow
  {start: 13, end: 15}, // R elbow to R wrist
  {start: 12, end: 14}, // L shoulder to L elbow
  {start: 14, end: 16}, // L elbow to L wrist
  // Legs
  {start: 23, end: 25}, // R hip to R knee
  {start: 25, end: 27}, // R knee to R ankle
  {start: 24, end: 26}, // L hip to L knee
  {start: 26, end: 28}, // L knee to L ankle
];

const BLUE_CONNECTIONS = [
    // Right hand
    { start: 15, end: 17 }, { start: 17, end: 19 }, { start: 19, end: 21 }, { start: 21, end: 15 },
    // Left hand
    { start: 16, end: 18 }, { start: 18, end: 20 }, { start: 20, end: 22 }, { start: 22, end: 16 },
    // Right foot
    { start: 27, end: 29 }, { start: 29, end: 31 }, { start: 31, end: 27 },
    // Left foot
    { start: 28, end: 30 }, { start: 30, end: 32 }, { start: 32, end: 28 },
];

interface SessionScreenProps {
  category: Category;
  mode: SessionMode;
  onSessionEnd: (summary: any) => void;
  hasSeenOnboardingTour: boolean;
  onOnboardingComplete: () => void;
  onApiKeyInvalid: () => void;
}

const SessionScreen: React.FC<SessionScreenProps> = ({ category, mode, onSessionEnd, hasSeenOnboardingTour, onOnboardingComplete, onApiKeyInvalid }) => {
  const [isRecording, _setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiGeneratingText, setIsAiGeneratingText] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const transcriptRef = useRef(transcript);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const [isAiFeedbackEnabled, setIsAiFeedbackEnabled] = useState(true);
  const [isSlouching, setIsSlouching] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecordingRef = useRef(isRecording);
  const currentUtteranceStartIndexRef = useRef(0);
  const isProcessingFinalResultRef = useRef(false);
  
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const postureReadingsRef = useRef<('good' | 'slouching')[]>([]);
  const confidenceScoresRef = useRef<number[]>([]);
  
  const silenceTimerRef = useRef<number | null>(null);
  const currentUserSpeechRef = useRef<string>('');

  // Refs for real-time visual feedback
  const postureStateRef = useRef<'good' | 'slouching'>('good');
  const vocalClarityStateRef = useRef<'good' | 'average' | 'poor'>('good');
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  
  const [isTourOpen, setIsTourOpen] = useState(!hasSeenOnboardingTour);

  const isCameraEnabled = mode === SessionMode.CONVERSATIONAL_WITH_VIDEO || mode === SessionMode.NOTAK_WITH_VIDEO;
  
  const handleCloseTour = () => {
    setIsTourOpen(false);
    onOnboardingComplete();
  };

  const setIsRecording = (val: boolean) => {
    isRecordingRef.current = val;
    _setIsRecording(val);
  };

  const analyzePosture = useCallback((landmarks: any[]) => {
    let newPosture: 'good' | 'slouching' = 'good';

    if (!landmarks || landmarks.length === 0) {
      newPosture = 'good';
    } else {
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      if (leftShoulder.visibility > 0.5 && leftHip.visibility > 0.5 && rightShoulder.visibility > 0.5 && rightHip.visibility > 0.5) {
        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipY = (leftHip.y + rightHip.y) / 2;
        const shoulderX = (leftShoulder.x + rightShoulder.x) / 2;
        const hipX = (leftHip.x + rightHip.x) / 2;
        
        const torsoAngle = Math.atan2(hipY - shoulderY, hipX - shoulderX) * (180 / Math.PI);
        
        if (Math.abs(torsoAngle) < 75 || Math.abs(torsoAngle) > 105) {
          postureReadingsRef.current.push('slouching');
          newPosture = 'slouching';
        } else {
          postureReadingsRef.current.push('good');
          newPosture = 'good';
        }
      } else {
        newPosture = 'good';
      }
    }
    
    // Only update state if posture has changed to avoid unnecessary re-renders
    if (postureStateRef.current !== newPosture) {
      postureStateRef.current = newPosture;
      setIsSlouching(newPosture === 'slouching');
    }
  }, []);

  const predictWebcam = useCallback(() => {
    if (!isCameraEnabled) return;

    if (!isRecordingRef.current && !videoRef.current?.srcObject) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }
    
    if (!videoRef.current || !poseLandmarkerRef.current || !canvasRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    if (video.videoWidth > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    
    if (video.readyState < 2) {
      animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isAiFeedbackEnabled) {
      canvasCtx.restore();
      animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
      return;
    }
    
    const startTimeMs = performance.now();
    const results = poseLandmarkerRef.current.detectForVideo(video, startTimeMs);

    const clarityState = vocalClarityStateRef.current;
    if (clarityState === 'poor') {
      canvasCtx.fillStyle = 'rgba(255, 127, 80, 0.2)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (clarityState === 'average') {
      canvasCtx.fillStyle = 'rgba(173, 216, 230, 0.15)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    if (results.landmarks && results.landmarks.length > 0) {
      analyzePosture(results.landmarks[0]);
      const drawingUtils = new DrawingUtils(canvasCtx);
      const landmark = results.landmarks[0];
      const isSlouching = postureStateRef.current === 'slouching';
      const slouchingColor = '#FFCC00';

      // Draw connections with specified colors
      drawingUtils.drawConnectors(landmark, GREEN_CONNECTIONS, { color: isSlouching ? slouchingColor : '#4ade80', lineWidth: 4 });
      drawingUtils.drawConnectors(landmark, BLUE_CONNECTIONS, { color: isSlouching ? slouchingColor : '#3b82f6', lineWidth: 4 });

      // Draw landmarks
      drawingUtils.drawLandmarks(landmark, { color: '#ef4444', radius: 4 });
    } else {
        analyzePosture([]);
    }
    canvasCtx.restore();

    animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
  }, [isCameraEnabled, isAiFeedbackEnabled, analyzePosture]);

  const endSession = useCallback(async () => {
    if (isEnding) return;
    setIsEnding(true);
    setIsRecording(false);
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    const { score, improvements, fillerWordCounts } = calculateScoresAndImprovements(transcript);

    let postureFeedback = "Posture analysis was not enabled for this session.";
    if (isCameraEnabled) {
      if (isAiFeedbackEnabled) {
        const totalReadings = postureReadingsRef.current.length;
        if (totalReadings > 0) {
          const goodReadings = postureReadingsRef.current.filter(r => r === 'good').length;
          const goodPosturePercentage = Math.round((goodReadings / totalReadings) * 100);
          if (goodPosturePercentage > 85) {
            postureFeedback = `Excellent posture! You maintained a confident posture for ${goodPosturePercentage}% of the session.`;
          } else if (goodPosturePercentage > 60) {
            postureFeedback = `Good posture overall (${goodPosturePercentage}%). Try to keep your back straight and shoulders relaxed.`;
          } else {
            postureFeedback = `You were slouching for a significant part of the session (${100 - goodPosturePercentage}%). Focus on sitting upright to project more confidence.`;
          }
        } else {
          postureFeedback = "Could not analyze posture.";
        }
      } else {
        postureFeedback = "AI posture feedback was disabled for this session.";
      }
    }

    const userTranscript = transcript.filter(t => t.speaker === 'user').map(t => t.words.map(w => w.text).join(' ')).join(' ');
    
    let toneFeedback = "Not enough speech was detected to analyze your tone.";
    if (isAiFeedbackEnabled) {
        if (userTranscript.trim().length > 10) { 
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const prompt = `You are an expert communication coach. Analyze the tone of the following transcript. Provide a single, concise sentence of feedback (maximum 25 words) with one piece of actionable advice. Transcript: "${userTranscript}"`;
            const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            });
            toneFeedback = response.text;
        } catch (error) {
            console.error("Error analyzing tone:", error);
            if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("Requested entity was not found"))) {
                onApiKeyInvalid();
            }
            toneFeedback = "Could not analyze tone due to an error.";
        }
        }
    } else {
        toneFeedback = "AI tone analysis was disabled for this session.";
    }


    const avgConfidence = confidenceScoresRef.current.length > 0 ? confidenceScoresRef.current.reduce((a, b) => a + b, 0) / confidenceScoresRef.current.length : 0;
    const pronunciationScore = Math.round(avgConfidence * 100);
    
    let pronunciationFeedback = "Not enough speech was detected to analyze your pronunciation.";
    if (isAiFeedbackEnabled) {
        if (userTranscript.trim().length > 10) {
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const prompt = `You are an expert speech coach. Analyze the following transcript for pronunciation clarity. Provide one key area for improvement in a single, concise sentence (maximum 25 words). Transcript: "${userTranscript}"`;
            const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            });
            pronunciationFeedback = response.text;
        } catch (error) {
            console.error("Error analyzing pronunciation:", error);
            if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("Requested entity was not found"))) {
                onApiKeyInvalid();
            }
            pronunciationFeedback = "Could not analyze pronunciation due to an error.";
        }
        }
    } else {
        pronunciationFeedback = "AI pronunciation analysis was disabled for this session.";
    }

    let emotionFeedback = "Not enough speech was detected to analyze your emotions.";
    if (isAiFeedbackEnabled) {
        if (userTranscript.trim().length > 10) {
            try {
                const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
                const prompt = `You are an AI specializing in emotional analysis. Analyze the following transcript. In one concise sentence (maximum 25 words), describe the primary emotion conveyed and how it impacts the message. Transcript: "${userTranscript}"`;
                const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                });
                emotionFeedback = response.text;
            } catch (error) {
                console.error("Error analyzing emotion:", error);
                if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("Requested entity was not found"))) {
                    onApiKeyInvalid();
                }
                emotionFeedback = "Could not analyze emotions due to an error.";
            }
        }
    } else {
        emotionFeedback = "AI emotion analysis was disabled for this session.";
    }

    onSessionEnd({
      score,
      transcript: transcript.filter(t => t.words.length > 0 && t.words.some(w => w.text.trim() !== '')),
      improvements,
      postureFeedback,
      toneFeedback,
      fillerWordCounts,
      pronunciationScore,
      pronunciationFeedback,
      emotionFeedback,
    });
  }, [transcript, onSessionEnd, category, isCameraEnabled, isAiFeedbackEnabled, isEnding, onApiKeyInvalid]);
  
  const handleAiFailure = useCallback(() => {
    const errorEntry: TranscriptEntry = {
        speaker: 'ai',
        words: analyzeText("I'm sorry, I couldn't generate a response. Could you try rephrasing?"),
        timestamp: new Date()
    };
    setTranscript(prev => {
        const newTranscript = [...prev];
        const lastEntry = newTranscript[newTranscript.length - 1];
        if (lastEntry && lastEntry.speaker === 'ai' && lastEntry.words.length === 0) {
            newTranscript[newTranscript.length - 1] = errorEntry;
        } else {
            newTranscript.push(errorEntry);
        }
        return newTranscript;
    });
    setIsAiSpeaking(false);
    setIsAiGeneratingText(false);
    isProcessingFinalResultRef.current = false;
    currentUserSpeechRef.current = '';
    if (isRecordingRef.current === false) {
      setIsRecording(true);
    }
  }, []);

  const getAiRephrasingResponse = useCallback(async (userSpeech: string) => {
    setIsAiSpeaking(true);
    setIsAiGeneratingText(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `You are an expert communication coach specializing in '${category}'. Rephrase the following user's statement to be more powerful, confident, and professional. Respond ONLY with the rephrased text, nothing else. User's statement: "${userSpeech}"`;

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setTranscript(prev => [...prev, { speaker: 'ai', words: [], timestamp: new Date() }]);

        let fullAiText = '';
        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                fullAiText += chunkText;
                setTranscript(prev => {
                    const newTranscript = [...prev];
                    const lastEntry = newTranscript[newTranscript.length - 1];
                    if (lastEntry && lastEntry.speaker === 'ai') {
                        newTranscript[newTranscript.length - 1] = {
                            ...lastEntry,
                            words: analyzeText(fullAiText),
                        };
                    }
                    return newTranscript;
                });
            }
        }
        setIsAiGeneratingText(false);
        const finalAiText = fullAiText.trim();

        if (finalAiText.length === 0) {
            handleAiFailure();
            return;
        }
        
        const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: finalAiText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            },
        });

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio || !outputAudioContextRef.current) {
            console.error('AI audio generation failed.');
            handleAiFailure();
            return;
        }

        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
        const source = outputAudioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContextRef.current.destination);

        // Mobile-specific audio optimizations
        if (isMobileDevice()) {
          // Reduce volume on mobile devices to avoid distortion
          const gainNode = outputAudioContextRef.current.createGain();
          gainNode.gain.value = 0.7; // Reduce volume by 30%
          source.connect(gainNode);
          gainNode.connect(outputAudioContextRef.current.destination);
        } else {
          source.connect(outputAudioContextRef.current.destination);
        }

        source.start();
        source.onended = () => {
            setIsAiSpeaking(false);
            isProcessingFinalResultRef.current = false;
            currentUserSpeechRef.current = '';

            // Mobile-specific: shorter delay before restarting recording
            const delay = getMobileOptimizedDelay();
            setTimeout(() => {
              // After AI speaks, it's the user's turn again.
              if (isRecordingRef.current === false) {
                  setIsRecording(true);
              }
            }, delay);
        };

    } catch (error) {
        console.error("Error getting AI rephrasing response:", error);
        if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("Requested entity was not found"))) {
            onApiKeyInvalid();
        }
        handleAiFailure();
    }
  }, [category, handleAiFailure, onApiKeyInvalid]);

  const getAiConversationalResponse = useCallback(async (userSpeech: string) => {
    setIsAiSpeaking(true);
    setIsAiGeneratingText(true);
    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      
      const history = transcriptRef.current.map(entry => {
        const speaker = entry.speaker === 'ai' ? 'Coach' : 'User';
        const text = entry.words.map(w => w.text).join(' ');
        return `${speaker}: ${text}`;
      }).join('\n');

      const prompt = `You are an AI communication coach acting as an interviewer for a practice session on "${category}".
Your goal is to keep the conversation flowing naturally.
Based on the conversation history and the user's last response, ask a relevant, open-ended follow-up question.
Keep your response concise and conversational (1-2 sentences).
Do not be repetitive.
Conversation History:
${history}

The user just said: "${userSpeech}"

Your response as the coach:`;

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      setTranscript(prev => [...prev, { speaker: 'ai', words: [], timestamp: new Date() }]);
      
      let fullAiText = '';
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if(chunkText) {
          fullAiText += chunkText;
          setTranscript(prev => {
            const newTranscript = [...prev];
            const lastEntry = newTranscript[newTranscript.length - 1];
            if (lastEntry && lastEntry.speaker === 'ai') {
              newTranscript[newTranscript.length - 1] = {
                ...lastEntry,
                words: analyzeText(fullAiText),
              };
            }
            return newTranscript;
          });
        }
      }

      setIsAiGeneratingText(false);
      const finalAiText = fullAiText.trim();
      
      if (finalAiText.split(' ').length < 2) {
        console.warn('AI text response was too short:', finalAiText);
        handleAiFailure();
        return;
      }

      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: finalAiText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio || !outputAudioContextRef.current) {
        console.error('AI audio generation failed.');
        handleAiFailure();
        return;
      }

      const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
      const source = outputAudioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;

      // Mobile-specific audio optimizations
      if (isMobileDevice()) {
        // Reduce volume on mobile devices to avoid distortion
        const gainNode = outputAudioContextRef.current.createGain();
        gainNode.gain.value = 0.7; // Reduce volume by 30%
        source.connect(gainNode);
        gainNode.connect(outputAudioContextRef.current.destination);
      } else {
        source.connect(outputAudioContextRef.current.destination);
      }

      source.start();
      source.onended = () => {
        setIsAiSpeaking(false);
        isProcessingFinalResultRef.current = false;
        currentUserSpeechRef.current = '';

        // Mobile-specific: shorter delay before restarting recording
        const delay = getMobileOptimizedDelay();
        setTimeout(() => {
          // After AI speaks, it's the user's turn. Start recording if the session is still active.
          if (isRecordingRef.current === false) {
             setIsRecording(true);
          }
        }, delay);
      };

    } catch (error) {
      console.error("Error getting AI conversational response:", error);
      if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("Requested entity was not found"))) {
        onApiKeyInvalid();
      }
      setIsAiGeneratingText(false);
      handleAiFailure();
    }
  }, [category, handleAiFailure, onApiKeyInvalid]);

  const setupSession = useCallback(async () => {
    try {
      // Check for secure context on mobile devices
      if (isMobileDevice() && !ensureSecureContext()) {
        alert('This app requires HTTPS to work properly on mobile devices. Please access it via a secure connection.');
        return;
      }

      const constraints = getMobileOptimizedConstraints(isCameraEnabled);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (isCameraEnabled && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
        };
      
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        poseLandmarkerRef.current = poseLandmarker;
      }

      if (mode.startsWith('CONVERSATIONAL')) {
        outputAudioContextRef.current = createMobileOptimizedAudioContext();
        if (!outputAudioContextRef.current) {
          alert('Audio playback is not supported on this device. Some features may not work properly.');
        }
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        const mobileMessage = isMobileDevice()
          ? "Speech recognition is not supported on this mobile device. Please use Chrome, Safari, or Edge."
          : "Speech recognition is not supported in this browser. Please try Chrome or Edge.";
        alert(mobileMessage);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Mobile-specific optimizations
      if (isMobileDevice()) {
        // Mobile devices may handle speech recognition differently
        // We'll handle mobile-specific behavior in the event handlers
        silenceTimerRef.current = null; // We'll handle this differently for mobile
      }

      recognitionRef.current = recognition;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        let fullTranscriptForCurrentUtterance = '';
        let isFinal = false;
        let finalConfidence = 0;

        for (let i = currentUtteranceStartIndexRef.current; i < event.results.length; ++i) {
          fullTranscriptForCurrentUtterance += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
            finalConfidence = event.results[i][0].confidence;
          }
        }
        
        const analyzedWords = analyzeText(currentUserSpeechRef.current + ' ' + fullTranscriptForCurrentUtterance);

        setTranscript(prev => {
            const newTranscript = [...prev];
            let lastEntry = newTranscript[newTranscript.length - 1];
            
            if (!lastEntry || lastEntry.speaker !== 'user') {
                newTranscript.push({
                    speaker: 'user',
                    words: analyzedWords,
                    timestamp: new Date()
                });
            } else {
                newTranscript[newTranscript.length - 1] = {
                    ...lastEntry,
                    words: analyzedWords,
                    timestamp: new Date()
                };
            }
            return newTranscript;
        });

        if (isFinal) {
          if (isProcessingFinalResultRef.current) return;

          if (isAiFeedbackEnabled && finalConfidence > 0) {
            confidenceScoresRef.current.push(finalConfidence);
            if (finalConfidence > 0.9) vocalClarityStateRef.current = 'good';
            else if (finalConfidence > 0.7) vocalClarityStateRef.current = 'average';
            else vocalClarityStateRef.current = 'poor';
            setTimeout(() => { vocalClarityStateRef.current = 'good'; }, 2000);
          }
          
          const finalPhrase = event.results[event.results.length - 1][0].transcript.trim();
          currentUserSpeechRef.current += finalPhrase + ' ';
          currentUtteranceStartIndexRef.current = event.resultIndex + 1;

          if (mode.startsWith('CONVERSATIONAL')) {
              silenceTimerRef.current = window.setTimeout(() => {
                if (isProcessingFinalResultRef.current) return;
                const fullTurnText = currentUserSpeechRef.current.trim();
                if (fullTurnText.length > 0) {
                    isProcessingFinalResultRef.current = true;
                    setIsRecording(false);
                    if (mode === SessionMode.CONVERSATIONAL_WITH_DEMO) {
                        getAiRephrasingResponse(fullTurnText);
                    } else {
                        getAiConversationalResponse(fullTurnText);
                    }
                }
            }, 1500);
          }
        }
      };
      
      recognition.onend = () => {
        if (isRecordingRef.current && !isAiSpeaking) {
          recognitionRef.current?.start();
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);

        // Don't show alert for benign errors or when ending session
        if (event.error === 'no-speech' || isEnding) {
          return;
        }

        const userFriendlyMessage = handleMobileSpeechRecognitionError(event.error);
        alert(userFriendlyMessage);

        // For mobile devices, try to restart recognition after certain errors
        if (isMobileDevice() && (event.error === 'audio-capture' || event.error === 'not-allowed')) {
          setTimeout(() => {
            if (isRecordingRef.current && !isEnding) {
              recognitionRef.current?.start();
            }
          }, 2000);
        }
      };

      if (mode.startsWith('CONVERSATIONAL') && mode !== SessionMode.CONVERSATIONAL_WITH_DEMO) {
        const aiGreeting: TranscriptEntry = {
          speaker: 'ai',
          words: analyzeText(`Hello! Welcome to your ${category} preparation. Let's begin. Tell me about yourself.`),
          timestamp: new Date()
        };
        setTranscript([aiGreeting]);
      } else {
         setTranscript([{ speaker: 'user', words: [], timestamp: new Date() }]);
      }

    } catch (err) {
      console.error("Error setting up session.", err);
      alert("Could not access camera/microphone or failed to load resources. Please check permissions and refresh.");
    }
  }, [category, mode, predictWebcam, isCameraEnabled, getAiConversationalResponse, getAiRephrasingResponse, isAiFeedbackEnabled]);
  
  useEffect(() => {
      if (isRecording) {
          recognitionRef.current?.start();
      } else {
          recognitionRef.current?.stop();
      }
  }, [isRecording]);

  useEffect(() => {
    setupSession();

    return () => {
      setIsRecording(false);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
      if(poseLandmarkerRef.current) poseLandmarkerRef.current.close();
      if(outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
      }
    };
  }, [setupSession]);

  const getWordClass = (category: WordCategory) => {
    switch (category) {
      case WordCategory.FILLER:
        return 'bg-yellow-500/20 text-yellow-300 underline decoration-yellow-500 decoration-dotted underline-offset-2 px-1 rounded-md transition-all duration-300';
      case WordCategory.WEAK:
        return 'bg-red-500/20 text-red-400 font-medium px-1 rounded-md transition-all duration-300';
      case WordCategory.STRONG:
        return 'bg-green-500/20 text-green-400 font-bold px-1 rounded-md transition-all duration-300';
      default:
        return '';
    }
  };

  const isConversational = mode.startsWith('CONVERSATIONAL');

  return (
    <>
    {isEnding && <SessionLoadingOverlay />}

    {/* Mobile-specific instructions */}
    {isMobileDevice() && !isTourOpen && (
      <div className="fixed bottom-20 left-4 right-4 bg-blue-600/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg z-50 text-sm">
        <div className="flex items-center space-x-2">
          <MicIcon className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Mobile Tip:</strong> Tap the microphone button to start/stop recording. Allow microphone permissions when prompted.
          </span>
        </div>
      </div>
    )}

    <OnboardingModal
      isOpen={isTourOpen}
      onClose={handleCloseTour}
      onSkip={handleCloseTour}
      skipButtonText="Skip Tour"
      title="Welcome to Your Session!"
      buttonText="Start Practicing"
    >
      <div className="space-y-4 text-muted-foreground">
        <div>
          <h4 className="font-semibold text-foreground mb-2">Live Transcript Feedback</h4>
          <p className="mb-2">As you speak, your words are analyzed in real-time. Look for these color highlights:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <div className="w-4 h-4 rounded-full bg-yellow-400 mr-3 mt-1 flex-shrink-0" />
              <span><strong className="text-foreground">Filler Words</strong> like "um" or "like" will be highlighted.</span>
            </li>
            <li className="flex items-start">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-3 mt-1 flex-shrink-0" />
              <span><strong className="text-foreground">Weak Language</strong> such as "I guess" will be flagged.</span>
            </li>
              <li className="flex items-start">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-3 mt-1 flex-shrink-0" />
              <span><strong className="text-foreground">Strong Language</strong> like "I am confident" is encouraged.</span>
            </li>
          </ul>
        </div>
        {isCameraEnabled && (
            <div className="flex items-start p-3 bg-secondary rounded-md border border-border">
            <InfoIcon className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-foreground">Posture Analysis</h5>
              <p className="text-sm">
                With your camera on, we'll provide visual feedback on your posture. An amber outline means you might be slouching!
              </p>
            </div>
          </div>
        )}
      </div>
    </OnboardingModal>
    <div className="min-h-screen w-full bg-gradient-to-b from-[#3a2d51] via-[#6c5093] to-[#a78bfa] text-white font-sans flex flex-col p-4 md:p-8">
      {/* Background decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0">
         <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
         <div className="absolute -bottom-10 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 z-10">
        <h1 className={`font-bold text-white text-center md:text-left ${isMobileDevice() ? 'text-xl' : 'text-2xl'}`}>
          JengaV Session: <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white">{category}</span>
        </h1>
        <div className={`flex items-center justify-center flex-wrap gap-x-4 gap-y-2 ${isMobileDevice() ? 'scale-90' : ''}`}>
            <div className="flex items-center space-x-2">
                <Label htmlFor="ai-feedback-toggle" className="text-purple-200 flex-shrink-0">AI Feedback</Label>
                <Switch 
                    id="ai-feedback-toggle"
                    checked={isAiFeedbackEnabled}
                    onCheckedChange={setIsAiFeedbackEnabled}
                    aria-label="Toggle real-time AI feedback"
                />
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`bg-white/10 hover:bg-white/20 ${isMobileDevice() ? 'touch-manipulation' : ''}`}
                    disabled={isAiSpeaking || isEnding}
                >
                    <MicIcon className={`mr-2 h-4 w-4 ${isRecording ? 'text-red-400 animate-pulse' : ''}`} />
                    <span className={isMobileDevice() ? 'text-sm' : ''}>
                        {isAiSpeaking ? 'AI Speaking...' : (isRecording ? 'Recording...' : (isConversational ? 'Record Answer' : 'Start Speaking'))}
                    </span>
                </Button>
                <Button onClick={endSession} className="bg-red-500/50 hover:bg-red-500/70 text-white" disabled={isEnding}>
                <StopCircleIcon className="mr-2 h-4 w-4" />
                {isEnding ? 'Analyzing...' : 'End Session'}
                </Button>
            </div>
        </div>
      </header>

      <div className={`flex-1 grid ${isCameraEnabled ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 min-h-0 z-10`}>
        {isCameraEnabled && (
          <div className="flex flex-col space-y-4">
            <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-2 border border-white/10 flex-1 flex flex-col transition-all duration-300 ${isSlouching ? 'ring-4 ring-amber-400/80 animate-pulse' : ''}`}>
                <div className="relative w-full h-full flex-1">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover rounded-lg bg-black/20 ${isMobileDevice() ? 'transform scale-x-[-1]' : ''}`}
                    style={isMobileDevice() ? { transform: 'scaleX(-1)' } : {}}
                  ></video>
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
                  {isSlouching && (
                    <div className="absolute top-4 right-4 bg-amber-400 text-black px-3 py-1.5 rounded-full flex items-center space-x-2 text-sm font-bold shadow-lg z-10">
                      <InfoIcon className="w-5 h-5" />
                      <span>Posture Check</span>
                    </div>
                  )}
                </div>
            </div>
            {isAiFeedbackEnabled && <Legend />}
          </div>
        )}

        <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex flex-col ${!isCameraEnabled ? 'col-span-1' : ''}`}>
          <div className={`flex-1 overflow-y-auto ${isMobileDevice() ? 'pb-safe' : ''}`}>
            <h3 className={`font-semibold mb-4 text-purple-100 ${isMobileDevice() ? 'text-base' : 'text-lg'}`}>Live Transcript</h3>
            <div className={`space-y-4 leading-relaxed ${isMobileDevice() ? 'text-base' : 'text-lg'}`}>
              {transcript.map((entry, i) => (
                entry.words.length > 0 || (entry.speaker === 'user' && i === transcript.length -1) // render empty user entry
                ? <div key={i}>
                  <div className="flex items-baseline space-x-2 mb-1">
                    <p className={`font-bold ${entry.speaker === 'ai' ? 'text-cyan-300' : 'text-white'} ${isMobileDevice() ? 'text-sm' : ''}`}>
                      {entry.speaker === 'ai' ? 'JengaV Coach' : 'You'}
                    </p>
                     <time className={`text-purple-300/80 ${isMobileDevice() ? 'text-xs' : 'text-xs'}`}>
                        {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                  <p className={isMobileDevice() ? 'break-words' : ''}>
                    {entry.words.map((word, j) => (
                      <span key={j} className={`${getWordClass(word.category)} ${isMobileDevice() ? 'text-sm' : ''}`}>
                        {word.text}{' '}
                      </span>
                    ))}
                    {entry.speaker === 'user' && isRecording && i === transcript.length - 1 && <span className={`inline-block w-2 h-5 bg-white animate-pulse ml-1 ${isMobileDevice() ? 'h-4' : 'h-5'}`}></span>}
                    {entry.speaker === 'ai' && isAiGeneratingText && i === transcript.length - 1 && <span className={`inline-block w-2 h-5 bg-cyan-300 animate-pulse ml-1 ${isMobileDevice() ? 'h-4' : 'h-5'}`}></span>}
                  </p>
                </div>
                : null
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SessionScreen;