import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Sparkles, Radio, Zap, Volume2 } from 'lucide-react';
import { PorcupineWakeWordEngine, soundChimes } from '../../services/voiceWakeEngine';

interface GlobalWakeListenerPillProps {
  onWakeTriggered: (initialQuery?: string) => void;
  destination: string;
  isAssistantOpen: boolean;
}

export const GlobalWakeListenerPill: React.FC<GlobalWakeListenerPillProps> = ({
  onWakeTriggered,
  destination,
  isAssistantOpen,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isWakeSupported, setIsWakeSupported] = useState(true);
  const [wakePulse, setWakePulse] = useState(false);
  const [lastWakeWord, setLastWakeWord] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const wakeEngineRef = useRef<PorcupineWakeWordEngine | null>(null);

  useEffect(() => {
    wakeEngineRef.current = new PorcupineWakeWordEngine({
      onWakeWordDetected: (payload) => {
        soundChimes.playChime('wake');
        setWakePulse(true);
        setLastWakeWord(payload.phrase);
        setTimeout(() => {
          setWakePulse(false);
          setLastWakeWord(null);
        }, 3000);

        onWakeTriggered(payload.extractedQuery || payload.phrase || 'Hey TourMitra');
      },
      onStateChange: (state) => {
        setIsListening(state === 'listening');
      },
      onError: () => {
        setIsListening(false);
      },
    });

    setIsWakeSupported(wakeEngineRef.current.isSupported());

    // Auto-start global wake listener if supported and modal is not already open
    if (!isAssistantOpen) {
      wakeEngineRef.current.startWakeListener();
    }

    return () => {
      wakeEngineRef.current?.stopWakeListener();
    };
  }, [isAssistantOpen, onWakeTriggered]);

  const toggleGlobalListening = () => {
    if (!wakeEngineRef.current) return;

    if (isListening) {
      wakeEngineRef.current.stopWakeListener();
      setIsListening(false);
      soundChimes.playChime('stop');
    } else {
      wakeEngineRef.current.startWakeListener();
      setIsListening(true);
      soundChimes.playChime('listen');
    }
  };

  const handleSimulateWake = (phrase: string) => {
    soundChimes.playChime('wake');
    setWakePulse(true);
    setLastWakeWord(phrase);
    setTimeout(() => {
      setWakePulse(false);
      setLastWakeWord(null);
    }, 2500);
    onWakeTriggered(phrase);
  };

  if (isAssistantOpen) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-40 flex flex-col items-start space-y-2 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Wake Triggered Notification Banner */}
      {wakePulse && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl shadow-2xl text-xs flex items-center space-x-2 animate-bounce border border-emerald-300">
          <Zap className="w-4 h-4 text-slate-950 fill-current" />
          <span>Wake Word Activated: "{lastWakeWord}"</span>
        </div>
      )}

      {/* Main Pill Button */}
      <div className="flex items-center space-x-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl hover:border-emerald-500/60 transition-all">
        {/* Toggle Listening Mic */}
        <button
          type="button"
          onClick={toggleGlobalListening}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            isListening
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-inner'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
          title={isListening ? 'Porcupine Wake Listener Active (Click to Pause)' : 'Click to Enable Wake Word Listener'}
        >
          {isListening ? (
            <div className="relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <Mic className="w-4 h-4 text-rose-400 relative" />
            </div>
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </button>

        {/* Action / Trigger text */}
        <div
          onClick={() => onWakeTriggered('Hey TourMitra')}
          className="cursor-pointer px-2 py-1 flex items-center space-x-2 group"
          title="Open TourMitra AI Assistant"
        >
          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Say "Hey TourMitra"
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </div>
            <span className="text-[10px] text-slate-400">
              {isListening ? '🎙️ Always-Listening Porcupine Engine' : 'Voice Assistant Ready'}
            </span>
          </div>
        </div>

        {/* Quick 1-Click Test Wake button */}
        <button
          type="button"
          onClick={() => handleSimulateWake('Hey TourMitra')}
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-[11px] font-bold transition-all shadow-sm"
          title="Simulate Voice Wake-Word"
        >
          <Zap className="w-3 h-3 text-amber-400 fill-current" />
          <span>Wake AI</span>
        </button>
      </div>

      {/* Expanded Quick Voice Trigger Tray on Hover */}
      {isHovered && (
        <div className="bg-slate-950/95 border border-slate-800 p-2.5 rounded-xl shadow-2xl space-y-1.5 text-xs text-slate-300 animate-fade-in max-w-xs">
          <div className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>Porcupine Wake Word Hotwords:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {['"Hey TourMitra"', '"TourMitra wake up"', '"Namaste TourMitra"'].map((phrase, i) => (
              <button
                key={i}
                onClick={() => handleSimulateWake(phrase.replace(/"/g, ''))}
                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-emerald-500/20 text-emerald-300 border border-slate-700 hover:border-emerald-500 text-[10px] font-medium transition-all"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
