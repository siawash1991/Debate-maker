/**
 * Audio Player utility handling both Gemini TTS (Base64 WAV)
 * and Web Speech API fallback with synthetic waveform generation.
 */

export class DebateAudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeechSynthesisActive = false;
  private onEndCallback: (() => void) | null = null;
  private onStartCallback: (() => void) | null = null;
  private audioContext: AudioContext | null = null;

  public playTurn(
    turn: {
      text: string;
      audioBase64?: string;
      speaker: string;
      speakerName: string;
    },
    voiceConfig: {
      gender: 'male' | 'female';
      tone?: string;
      rate?: number;
    },
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    this.stop();

    this.onStartCallback = callbacks?.onStart || null;
    this.onEndCallback = callbacks?.onEnd || null;

    // 1. If we have Gemini TTS Base64 Audio
    if (turn.audioBase64) {
      try {
        const audioSrc = `data:audio/wav;base64,${turn.audioBase64}`;
        this.currentAudio = new Audio(audioSrc);
        this.currentAudio.playbackRate = voiceConfig.rate || 1.0;

        this.currentAudio.onplay = () => {
          this.onStartCallback?.();
        };

        this.currentAudio.onended = () => {
          this.onEndCallback?.();
        };

        this.currentAudio.onerror = (e) => {
          console.warn('Audio element error, falling back to Web Speech:', e);
          this.playWithWebSpeech(turn.text, voiceConfig);
        };

        this.currentAudio.play().catch((err) => {
          console.warn('Audio play prevented or failed, using speech synthesis:', err);
          this.playWithWebSpeech(turn.text, voiceConfig);
        });
        return;
      } catch (err) {
        console.warn('Audio initialization error, fallback:', err);
      }
    }

    // 2. Fallback to Web Speech API
    this.playWithWebSpeech(turn.text, voiceConfig);
  }

  private playWithWebSpeech(
    text: string,
    voiceConfig: { gender: 'male' | 'female'; rate?: number }
  ): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      // If neither is supported, simulate timing and complete
      this.onStartCallback?.();
      const fakeDuration = Math.max(2500, (text.split(/\s+/).length / 130) * 60000);
      setTimeout(() => {
        this.onEndCallback?.();
      }, fakeDuration);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of bracketed stage cues like [خنده تلخ] for smoother speech
    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText || text);

    utterance.lang = 'fa-IR';
    utterance.rate = voiceConfig.rate || 0.95;

    // Pitch: lower for male, slightly higher for female
    utterance.pitch = voiceConfig.gender === 'female' ? 1.15 : 0.85;

    // Try finding Persian or appropriate voices
    const voices = window.speechSynthesis.getVoices();
    const persianVoice = voices.find((v) => v.lang.includes('fa') || v.lang.includes('per'));
    if (persianVoice) {
      utterance.voice = persianVoice;
    } else {
      // Fallback voice based on gender if available
      const genericVoice = voices.find((v) =>
        voiceConfig.gender === 'female'
          ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira')
          : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david')
      );
      if (genericVoice) {
        utterance.voice = genericVoice;
      }
    }

    utterance.onstart = () => {
      this.isSpeechSynthesisActive = true;
      this.onStartCallback?.();
    };

    utterance.onend = () => {
      this.isSpeechSynthesisActive = false;
      this.onEndCallback?.();
    };

    utterance.onerror = () => {
      this.isSpeechSynthesisActive = false;
      this.onEndCallback?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeechSynthesisActive = false;
    }
  }

  public pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (this.currentAudio) {
      this.currentAudio.play();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }

  public setRate(rate: number): void {
    if (this.currentAudio) {
      this.currentAudio.playbackRate = rate;
    }
  }
}

export const globalAudioPlayer = new DebateAudioPlayer();
