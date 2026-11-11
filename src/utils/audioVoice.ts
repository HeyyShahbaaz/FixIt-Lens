import { Language } from '../types/diagnosis';

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

// Check browser SpeechRecognition support
const SpeechRecognitionClass =
  (typeof window !== 'undefined' &&
    ((window as unknown as IWindowWithSpeech).SpeechRecognition ||
      (window as unknown as IWindowWithSpeech).webkitSpeechRecognition)) ||
  null;

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return SpeechRecognitionClass !== null;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function speakText(
  text: string,
  lang: Language = 'en',
  onEnd?: () => void,
  onError?: (err: unknown) => void
): void {
  if (!isSpeechSynthesisSupported()) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    onEnd?.();
    return;
  }

  stopSpeaking();

  const cleanText = text
    .replace(/[#*_`]/g, '')
    .replace(/₹/g, 'Rupees ')
    .trim();

  if (!cleanText) {
    onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Try to find a natural sounding voice
  const voices = window.speechSynthesis.getVoices();
  const targetPrefix = lang === 'hi' ? 'hi' : 'en';
  const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error', e);
    activeUtterance = null;
    onError?.(e);
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export interface VoiceListenerHandle {
  stop: () => void;
}

export function startVoiceInput(
  lang: Language,
  onResult: (transcript: string) => void,
  onError?: (errorMsg: string) => void,
  onEnd?: () => void
): VoiceListenerHandle {
  if (!SpeechRecognitionClass) {
    onError?.('Speech recognition is not supported in this browser.');
    return { stop: () => {} };
  }

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error', event.error);
      onError?.(event.error);
    };

    recognition.onend = () => {
      onEnd?.();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.abort();
        } catch (e) {
          console.warn('Error stopping recognition', e);
        }
      }
    };
  } catch (e) {
    onError?.('Could not initialize microphone recognition.');
    return { stop: () => {} };
  }
}

export function startHandsFreeListener(
  lang: Language,
  onCommand: (command: 'next' | 'previous' | 'repeat' | 'stop') => void
): VoiceListenerHandle {
  if (!SpeechRecognitionClass) {
    return { stop: () => {} };
  }

  let recognition: any = null;
  let isListening = true;

  const init = () => {
    if (!isListening) return;
    try {
      recognition = new SpeechRecognitionClass!();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const text = event.results[i][0].transcript.toLowerCase().trim();
            if (
              text.includes('next') ||
              text.includes('आगे') ||
              text.includes('अगला') ||
              text.includes('done')
            ) {
              onCommand('next');
            } else if (
              text.includes('previous') ||
              text.includes('back') ||
              text.includes('पीछे') ||
              text.includes('पिछला')
            ) {
              onCommand('previous');
            } else if (
              text.includes('repeat') ||
              text.includes('again') ||
              text.includes('दोहराएं') ||
              text.includes('फिर से')
            ) {
              onCommand('repeat');
            } else if (
              text.includes('stop') ||
              text.includes('pause') ||
              text.includes('रुकें') ||
              text.includes('बंद')
            ) {
              onCommand('stop');
            }
          }
        }
      };

      recognition.onend = () => {
        if (isListening) {
          // Restart to keep listening in hands-free mode
          setTimeout(init, 300);
        }
      };

      recognition.onerror = () => {
        if (isListening) {
          setTimeout(init, 1000);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Hands free recognition init failure', e);
    }
  };

  init();

  return {
    stop: () => {
      isListening = false;
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {
          // ignore
        }
      }
    }
  };
}
