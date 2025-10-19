// Mobile device utilities for JengaV
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768 && window.innerHeight <= 1024);
};

export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroidDevice = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

export const ensureSecureContext = (): boolean => {
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    console.error('Speech recognition requires HTTPS on mobile devices');
    return false;
  }
  return true;
};

export const createMobileOptimizedAudioContext = (): AudioContext | null => {
  try {
    // Resume audio context on mobile devices after user gesture
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass({ sampleRate: 24000 });

    // Handle iOS audio context suspension
    if (isIOSDevice()) {
      const resumeAudioContext = () => {
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      };

      // Resume on any user interaction
      ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(event => {
        document.addEventListener(event, resumeAudioContext, { once: true });
      });
    }

    return audioContext;
  } catch (error) {
    console.error('Failed to create audio context:', error);
    return null;
  }
};

export const getMobileOptimizedConstraints = (isCameraEnabled: boolean) => {
  const constraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100,
      channelCount: 1,
    }
  };

  if (isCameraEnabled) {
    constraints.video = {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: 'user'
    };
  }

  return constraints;
};

export const handleMobileSpeechRecognitionError = (error: string): string => {
  switch (error) {
    case 'no-speech':
      return 'No speech detected. Please speak louder and closer to the microphone.';
    case 'audio-capture':
      return 'Microphone access denied. Please allow microphone permissions in your browser settings.';
    case 'not-allowed':
      return 'Microphone access blocked. Please enable microphone permissions for this site.';
    case 'network':
      return 'Network error. Please check your internet connection and try again.';
    case 'service-not-allowed':
      return 'Speech recognition service not available. Please try again later.';
    default:
      return `Speech recognition error: ${error}. Please refresh the page and try again.`;
  }
};

export const getMobileOptimizedDelay = (): number => {
  return isMobileDevice() ? 500 : 1000;
};

export const getMobileOptimizedClasses = (baseClasses: string): string => {
  return isMobileDevice() ? `${baseClasses} touch-manipulation` : baseClasses;
};

export const getMobileOptimizedTextSize = (baseSize: string): string => {
  return isMobileDevice() ? baseSize.replace('text-lg', 'text-base').replace('text-xl', 'text-lg').replace('text-2xl', 'text-xl') : baseSize;
};
