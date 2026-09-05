import { WakeEventPayload, VoiceAssistantState } from '../types';

/**
 * Web Audio API Acoustic Sound Chime Generator.
 * Generates instant, crystal-clear zero-latency audio cues for wake word detection,
 * listening start, and voice responses without requiring external audio assets.
 */
class SoundChimeGenerator {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public playChime(type: 'wake' | 'listen' | 'acknowledge' | 'stop') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'wake') {
        // High-tech futuristic rising triad ping (Porcupine wake trigger)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
        osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6

        osc2.frequency.setValueAtTime(880, now);
        osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.22); // A6

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.36);
        osc2.stop(now + 0.36);
      } else if (type === 'listen') {
        // Soft mellow chime for mic listening start
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'acknowledge') {
        // Crisp dual chime for AI response ready
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.1); // G5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'stop') {
        // Soft descending tone for mic mute / session end
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.15);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.21);
      }
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }
}

export const soundChimes = new SoundChimeGenerator();

// ---------------------------------------------------------------------------
// Porcupine-Style Wake Word Detection Engine
// ---------------------------------------------------------------------------

export const WAKE_WORD_TRIGGER_LIST = [
  'hey tourmitra',
  'hey tour mitra',
  'tourmitra',
  'tour mitra',
  'namaste tourmitra',
  'namaste mitra',
  'hey mitra',
  'wake up tourmitra',
  'wake up',
  'hey tourmaster',
  'tourmaster',
  'suno tourmitra',
];

export interface PorcupineEngineCallbacks {
  onWakeWordDetected?: (payload: WakeEventPayload) => void;
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string, isWakeCommand?: boolean) => void;
  onStateChange?: (state: VoiceAssistantState) => void;
  onError?: (err: any) => void;
}

export class PorcupineWakeWordEngine {
  private recognition: any = null;
  private isRunning: boolean = false;
  private isListeningForCommand: boolean = false;
  private callbacks: PorcupineEngineCallbacks = {};
  private soundEnabled: boolean = true;
  private lang: string = 'en-IN';
  private autoRestart: boolean = true;
  private restartTimeout: any = null;

  constructor(callbacks: PorcupineEngineCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: PorcupineEngineCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setLanguage(lang: string) {
    this.lang = lang;
    if (this.recognition) {
      try {
        this.recognition.lang = lang;
      } catch (e) { }
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startWakeListener() {
    if (!this.isSupported()) {
      console.warn('Speech Recognition is not supported on this browser.');
      return false;
    }

    if (this.isRunning) return true;

    try {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;

      this.recognition.onstart = () => {
        this.isRunning = true;
        this.callbacks.onStateChange?.('listening');
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        const currentText = (final || interim).trim();
        if (interim) {
          this.callbacks.onInterimTranscript?.(interim);
        }

        // Check for wake word in transcript
        const wakeCheck = this.checkWakeWord(currentText);
        if (wakeCheck.detected) {
          if (this.soundEnabled) {
            soundChimes.playChime('wake');
          }
          this.callbacks.onStateChange?.('wake_detected');

          const payload: WakeEventPayload = {
            phrase: wakeCheck.matchedPhrase,
            timestamp: Date.now(),
            extractedQuery: wakeCheck.extractedQuery,
          };

          this.callbacks.onWakeWordDetected?.(payload);

          // If there was a trailing query along with the wake word
          if (wakeCheck.extractedQuery && wakeCheck.extractedQuery.trim().length > 1) {
            this.callbacks.onFinalTranscript?.(wakeCheck.extractedQuery, true);
          }
        } else if (final && final.trim()) {
          this.callbacks.onFinalTranscript?.(final.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal background silence, do not crash
          return;
        }
        console.warn('Speech recognition status:', event.error);
        this.callbacks.onError?.(event.error);
      };

      this.recognition.onend = () => {
        this.isRunning = false;
        if (this.autoRestart) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.autoRestart && !this.isRunning) {
              try {
                this.recognition?.start();
              } catch (e) { }
            }
          }, 400);
        } else {
          this.callbacks.onStateChange?.('idle');
        }
      };

      this.autoRestart = true;
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Failed to start Porcupine Wake Listener:', e);
      return false;
    }
  }

  public stopWakeListener() {
    this.autoRestart = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) { }
    }
    this.isRunning = false;
    this.callbacks.onStateChange?.('idle');
  }

  public checkWakeWord(text: string): { detected: boolean; matchedPhrase: string; extractedQuery: string } {
    if (!text) return { detected: false, matchedPhrase: '', extractedQuery: '' };
    const lower = text.toLowerCase().trim();

    for (const phrase of WAKE_WORD_TRIGGER_LIST) {
      const idx = lower.indexOf(phrase);
      if (idx !== -1) {
        // Extract what was spoken after the wake word
        const afterWake = text.slice(idx + phrase.length).replace(/^[\s,:\.!?\-]+/, '').trim();
        return {
          detected: true,
          matchedPhrase: phrase,
          extractedQuery: afterWake,
        };
      }
    }

    return { detected: false, matchedPhrase: '', extractedQuery: '' };
  }
}

// ---------------------------------------------------------------------------
// Vapi-Style Natural Speech Synthesis Controller
// ---------------------------------------------------------------------------

export class TourMitraSpeechSynthesizer {
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private preferredLang: string = 'en-IN';
  private rate: number = 1.0;
  private pitch: number = 1.0;

  constructor(lang: string = 'en-IN', rate: number = 1.0, pitch: number = 1.0) {
    this.preferredLang = lang;
    this.rate = rate;
    this.pitch = pitch;
  }

  public setOptions(lang?: string, rate?: number, pitch?: number) {
    if (lang) this.preferredLang = lang;
    if (rate !== undefined) this.rate = rate;
    if (pitch !== undefined) this.pitch = pitch;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  public getBestVoiceForLang(lang: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (!voices.length) return null;

    // 1. Exact match for Indian English / Hindi / Indian voices
    const indianMatch = voices.find(
      (v) =>
        (v.lang.toLowerCase() === lang.toLowerCase() ||
         v.lang.toLowerCase().startsWith(lang.toLowerCase().split('-')[0])) &&
        (v.name.includes('India') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Hindi') || v.name.includes('Marathi'))
    );
    if (indianMatch) return indianMatch;

    // 2. Lang match
    const langMatch = voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)));
    if (langMatch) return langMatch;

    // 3. Fallback to Google / Natural English or default
    return voices.find((v) => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural'))) || voices[0];
  }

  public speak(
    text: string,
    options?: {
      lang?: string;
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ) {
    if (!this.isSupported() || !text || !text.trim()) {
      options?.onEnd?.();
      return;
    }

    // Cancel any current speaking (Interruption handling - Vapi feature)
    this.stop();

    try {
      const cleanText = text
        .replace(/[\*\_#>`~\[\]\(\)]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetLang = options?.lang || this.preferredLang;

      utterance.lang = targetLang;
      utterance.rate = options?.rate ?? this.rate;
      utterance.pitch = options?.pitch ?? this.pitch;

      const voice = this.getBestVoiceForLang(targetLang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        options?.onError?.(e);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      options?.onError?.(e);
    }
  }

  public stop() {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) { }
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechSynthesizer = new TourMitraSpeechSynthesizer();
