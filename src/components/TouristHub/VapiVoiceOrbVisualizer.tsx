import React, { useEffect, useState } from 'react';
import { VoiceAssistantState } from '../../types';
import { Sparkles, Mic, Volume2, Bot, Radio, Zap } from 'lucide-react';

interface VapiVoiceOrbVisualizerProps {
  state: VoiceAssistantState;
  isSpeaking: boolean;
  isListening: boolean;
  transcript?: string;
  interimTranscript?: string;
  onOrbClick?: () => void;
  destination?: string;
}

export const VapiVoiceOrbVisualizer: React.FC<VapiVoiceOrbVisualizerProps> = ({
  state,
  isSpeaking,
  isListening,
  transcript,
  interimTranscript,
  onOrbClick,
  destination = 'Pune, Maharashtra',
}) => {
  const [waveHeights, setWaveHeights] = useState<number[]>([40, 60, 90, 45, 75, 100, 50, 80, 65, 95, 30, 70]);

  // Dynamic live soundwave animation during listening & speaking
  useEffect(() => {
    let interval: any;
    if (isSpeaking || isListening) {
      interval = setInterval(() => {
        setWaveHeights((prev) =>
          prev.map(() => Math.floor(Math.random() * (isSpeaking ? 75 : 55)) + (isSpeaking ? 25 : 15))
        );
      }, 90);
    }
    return () => clearInterval(interval);
  }, [isSpeaking, isListening]);

  const getStateBadge = () => {
    switch (state) {
      case 'wake_detected':
        return {
          text: 'Wake Word Detected ("Hey TourMitra")',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400 animate-ping',
        };
      case 'listening':
        return {
          text: 'Listening Live... (Speak into mic)',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400 animate-ping',
        };
      case 'processing':
        return {
          text: 'Gemini 3.7 Flash Thinking...',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400 animate-spin',
        };
      case 'speaking':
        return {
          text: 'TourMitra Speaking Audio Guide...',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400 animate-pulse',
        };
      default:
        return {
          text: 'Porcupine Wake Engine Active: Say "Hey TourMitra"',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-400 animate-pulse',
        };
    }
  };

  const badge = getStateBadge();

  return (
    <div className="relative flex flex-col items-center justify-center p-6 w-full text-center overflow-hidden select-none">
      {/* Background radial glow */}
      <div
        className={`absolute w-72 h-72 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
          isSpeaking
            ? 'bg-emerald-500/20 scale-125'
            : isListening
            ? 'bg-rose-500/20 scale-110'
            : state === 'processing'
            ? 'bg-purple-500/20 scale-110'
            : 'bg-cyan-500/10 scale-90'
        }`}
      />

      {/* Top Porcupine / Vapi Status Pill */}
      <div className="mb-6 flex items-center space-x-2">
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-2 backdrop-blur-md shadow-lg ${badge.color}`}>
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span>{badge.text}</span>
        </div>
      </div>

      {/* Neural Voice Orb Container */}
      <div
        onClick={onOrbClick}
        className="relative group cursor-pointer my-2 flex items-center justify-center"
        title="Tap to toggle mic or interrupt"
      >
        {/* Outer Ring 1 - Radar Wave */}
        <div
          className={`absolute w-44 h-44 rounded-full border border-dashed transition-all duration-1000 ${
            isSpeaking
              ? 'border-emerald-400/40 animate-spin-slow scale-110'
              : isListening
              ? 'border-rose-400/50 animate-ping'
              : 'border-slate-700/60'
          }`}
        />

        {/* Outer Ring 2 - Sonic Aura */}
        <div
          className={`absolute w-36 h-36 rounded-full border transition-all duration-500 ${
            isSpeaking
              ? 'border-emerald-500/60 bg-emerald-500/10 animate-pulse'
              : isListening
              ? 'border-rose-500/60 bg-rose-500/10 animate-pulse'
              : state === 'processing'
              ? 'border-purple-500/60 bg-purple-500/10 animate-spin-slow'
              : 'border-cyan-500/30 bg-cyan-500/5'
          }`}
        />

        {/* Core Glowing Orb Sphere */}
        <div
          className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-105 active:scale-95 ${
            isSpeaking
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 shadow-emerald-500/50 ring-4 ring-emerald-400/50'
              : isListening
              ? 'bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 shadow-rose-500/50 ring-4 ring-rose-400/50 animate-pulse'
              : state === 'processing'
              ? 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 shadow-purple-500/50 ring-4 ring-purple-400/50'
              : 'bg-gradient-to-tr from-slate-800 via-slate-900 to-slate-800 border-2 border-slate-700 shadow-cyan-500/20'
          }`}
        >
          {/* Inner Icon / Visualizer */}
          {isSpeaking ? (
            <Volume2 className="w-10 h-10 text-slate-950 animate-bounce" />
          ) : isListening ? (
            <Mic className="w-10 h-10 text-white animate-pulse" />
          ) : state === 'processing' ? (
            <Sparkles className="w-10 h-10 text-cyan-200 animate-spin" />
          ) : (
            <Bot className="w-10 h-10 text-emerald-400" />
          )}
        </div>
      </div>

      {/* Real-time sound frequency bars (Vapi Style) */}
      <div className="flex items-center justify-center space-x-1 mt-6 h-10">
        {waveHeights.map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className={`w-1 rounded-full transition-all duration-100 ${
              isSpeaking
                ? 'bg-gradient-to-t from-emerald-500 to-teal-300'
                : isListening
                ? 'bg-gradient-to-t from-rose-500 to-amber-300'
                : state === 'processing'
                ? 'bg-gradient-to-t from-purple-500 to-cyan-300'
                : 'bg-slate-700/60 h-2'
            }`}
          />
        ))}
      </div>

      {/* Live Interim / Spoken Speech Bubble */}
      <div className="mt-4 max-w-md w-full min-h-[52px] bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 shadow-inner text-xs sm:text-sm">
        {interimTranscript ? (
          <p className="text-cyan-300 font-medium italic animate-pulse">
            "{interimTranscript}..."
          </p>
        ) : transcript ? (
          <p className="text-slate-200 font-medium">"{transcript}"</p>
        ) : isListening ? (
          <p className="text-slate-400 italic">Listening to your voice... Speak your travel query</p>
        ) : (
          <p className="text-slate-500 text-xs">
            Porcupine hotwords active: Say <strong className="text-emerald-400">"Hey TourMitra"</strong> or <strong className="text-emerald-400">"Namaste TourMitra"</strong>
          </p>
        )}
      </div>
    </div>
  );
};
