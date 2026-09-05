import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot, Mic, MicOff, Volume2, VolumeX, Send, Sparkles, MessageSquare, ShieldAlert,
  Languages, Utensils, Landmark, X, Hotel, Car, UserCheck, Ticket, Calendar,
  ArrowRight, Radio, Settings, RefreshCw, Zap, Play, Square, Check
} from 'lucide-react';
import { ChatMessage, VoiceAssistantState, VoiceSettings } from '../../types';
import { VapiVoiceOrbVisualizer } from './VapiVoiceOrbVisualizer';
import {
  PorcupineWakeWordEngine,
  speechSynthesizer,
  soundChimes,
  WAKE_WORD_TRIGGER_LIST,
} from '../../services/voiceWakeEngine';

interface AITourGuideAssistantProps {
  destination: string;
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  onSelectBookingCategory?: (category: 'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary') => void;
}

export const AITourGuideAssistant: React.FC<AITourGuideAssistantProps> = ({
  destination,
  isOpen,
  onClose,
  initialPrompt,
  onSelectBookingCategory,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Namaste! I am TourMitra (तूर मित्र), your personalized AI cultural guide and travel companion in ${destination || 'India'}. 🎙️✨

Say **"Hey TourMitra"** to activate voice mode anytime, or ask me about historical lore, authentic street food, regional language translations, weather adaptations, EV cabs, or emergency safety!`,
      voiceText: `Namaste! I am TourMitra, your personalized AI cultural guide in ${destination || 'India'}. Say Hey TourMitra or ask me anything!`,
      timestamp: 'Just now',
      suggestions: [
        '🎙️ Say "Hey TourMitra" (Wake Word)',
        '🎟️ I want to book a tourism tour (Spots, Stays, Food, Taxis, Guides)',
        'Tell me the history of famous forts and palaces here',
        'What are authentic street food delicacies to try?',
        'Translate "How much does this cost?" into Marathi',
      ],
      isBookingIntent: false,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'chat' | 'voice'>('chat');
  const [voiceState, setVoiceState] = useState<VoiceAssistantState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [wakeBadgeNotice, setWakeBadgeNotice] = useState<string | null>(null);

  // Voice & Wake Settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    autoSpeak: true,
    voiceLang: 'en-IN',
    speechRate: 1.0,
    speechPitch: 1.0,
    soundChimes: true,
    porcupineWakeEnabled: true,
    continuousMode: true,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wakeEngineRef = useRef<PorcupineWakeWordEngine | null>(null);

  // Auto scroll to bottom in chat view
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assistantMode]);

  // Handle initial prompt if passed
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Synchronize speech synthesizer settings
  useEffect(() => {
    speechSynthesizer.setOptions(voiceSettings.voiceLang, voiceSettings.speechRate, voiceSettings.speechPitch);
  }, [voiceSettings.voiceLang, voiceSettings.speechRate, voiceSettings.speechPitch]);

  const handleLaunchBookingStudio = (category: 'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary' = 'spots') => {
    if (onSelectBookingCategory) {
      onSelectBookingCategory(category);
    }
    onClose();
    setTimeout(() => {
      const el = document.getElementById('select-spots-stays-food-taxis-guides-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-4', 'ring-emerald-400', 'transition-all', 'duration-500');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-emerald-400');
        }, 2500);
      }
    }, 100);
  };

  // Text to Speech playback (Voice Output) with cancellation
  const speakVoiceOutput = useCallback((textToSpeak: string, onDone?: () => void) => {
    if (!voiceSettings.autoSpeak) {
      onDone?.();
      return;
    }

    setIsSpeaking(true);
    setVoiceState('speaking');

    speechSynthesizer.speak(textToSpeak, {
      lang: voiceSettings.voiceLang,
      rate: voiceSettings.speechRate,
      pitch: voiceSettings.speechPitch,
      onStart: () => {
        setIsSpeaking(true);
        setVoiceState('speaking');
      },
      onEnd: () => {
        setIsSpeaking(false);
        setVoiceState('idle');
        onDone?.();

        // If continuous hands-free mode is on and assistant is in voice mode, resume listening automatically (Vapi loop)
        if (voiceSettings.continuousMode && assistantMode === 'voice' && isOpen) {
          setTimeout(() => {
            startListeningForSpeech();
          }, 350);
        }
      },
      onError: () => {
        setIsSpeaking(false);
        setVoiceState('idle');
        onDone?.();
      },
    });
  }, [voiceSettings, assistantMode, isOpen]);

  const stopSpeaking = () => {
    speechSynthesizer.stop();
    setIsSpeaking(false);
    setVoiceState('idle');
  };

  // Porcupine Wake Engine initialization
  useEffect(() => {
    if (!wakeEngineRef.current) {
      wakeEngineRef.current = new PorcupineWakeWordEngine({
        onWakeWordDetected: (payload) => {
          setWakeBadgeNotice(`🟢 Wake Word: "${payload.phrase}"`);
          setTimeout(() => setWakeBadgeNotice(null), 3500);
          setVoiceState('wake_detected');

          if (payload.extractedQuery && payload.extractedQuery.trim()) {
            handleSendMessage(payload.extractedQuery);
          } else {
            handleSendMessage(payload.phrase || 'Hey TourMitra');
          }
        },
        onInterimTranscript: (text) => {
          setInterimTranscript(text);
        },
        onFinalTranscript: (text, isWake) => {
          setInterimTranscript('');
          setLastTranscript(text);
          if (text && text.trim() && !isWake) {
            handleSendMessage(text);
          }
        },
        onStateChange: (state) => {
          if (!isSpeaking) {
            setVoiceState(state);
            setIsListening(state === 'listening');
          }
        },
      });
    }

    const engine = wakeEngineRef.current;
    engine.setSoundEnabled(voiceSettings.soundChimes);
    engine.setLanguage(voiceSettings.voiceLang);

    if (isOpen && voiceSettings.porcupineWakeEnabled) {
      engine.startWakeListener();
    } else {
      engine.stopWakeListener();
    }

    return () => {
      engine.stopWakeListener();
      speechSynthesizer.stop();
    };
  }, [isOpen, voiceSettings.porcupineWakeEnabled, voiceSettings.soundChimes, voiceSettings.voiceLang]);

  const startListeningForSpeech = () => {
    // If speaking, stop speaking first (Interruption handling)
    stopSpeaking();
    if (wakeEngineRef.current) {
      wakeEngineRef.current.startWakeListener();
      setIsListening(true);
      setVoiceState('listening');
      if (voiceSettings.soundChimes) {
        soundChimes.playChime('listen');
      }
    }
  };

  const stopListeningForSpeech = () => {
    if (wakeEngineRef.current) {
      wakeEngineRef.current.stopWakeListener();
      setIsListening(false);
      setVoiceState('idle');
      if (voiceSettings.soundChimes) {
        soundChimes.playChime('stop');
      }
    }
  };

  const toggleMicListening = () => {
    if (isListening) {
      stopListeningForSpeech();
    } else {
      startListeningForSpeech();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    // Stop speaking any previous message
    stopSpeaking();

    const qLower = query.toLowerCase();
    const isLocalBookingQuery =
      qLower.includes('book') || qLower.includes('reserve') ||
      qLower.includes('tour') || qLower.includes('hotel') ||
      qLower.includes('taxi') || qLower.includes('cab') ||
      qLower.includes('guide') || qLower.includes('stay') ||
      qLower.includes('package');

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoiceInput: assistantMode === 'voice' || isListening,
    };

    // Keep multi-turn context
    const currentHistory = messages.slice(-8).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLastTranscript(query);
    setInterimTranscript('');
    setIsLoading(true);
    setVoiceState('processing');

    try {
      const res = await fetch('/api/ai/tour-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          destination,
          history: currentHistory,
          isVoiceMode: assistantMode === 'voice',
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-ai',
        sender: 'assistant',
        text: data.text || 'I am happy to guide your travels! How else can I assist?',
        voiceText: data.voiceText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || [
          '🎟️ Open Spots, Stays, Food, Taxis & Guides Studio',
          'Tell me another cultural story',
          'Where can I find sustainable local handicrafts?',
        ],
        isBookingIntent: data.isBookingIntent ?? isLocalBookingQuery,
        bookingCategory: data.bookingCategory || 'spots',
        isWakeQuery: data.isWakeQuery,
        wakePhrase: data.wakePhrase,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);

      if (voiceSettings.soundChimes) {
        soundChimes.playChime('acknowledge');
      }

      // Auto Voice Output Playback (Vapi Style)
      const spokenScript = data.voiceText || data.text;
      speakVoiceOutput(spokenScript);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackText = isLocalBookingQuery
        ? `I can help you book your tourism tour in ${destination}! As a tourist, you can select spots, stays, food, taxis, and guides in one click below.`
        : `Namaste! As your TourMitra guide in ${destination}, feel free to chat with me about places to chill, authentic food, EV cabs, or emergency safety!`;

      const fallbackMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        text: fallbackText,
        timestamp: 'Just now',
        isBookingIntent: isLocalBookingQuery,
        bookingCategory: 'spots',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setIsLoading(false);
      speakVoiceOutput(fallbackText);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl h-[92vh] max-h-[720px] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold font-display text-white text-sm sm:text-base">
                  TourMitra (तूर मित्र) Voice AI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Gemini 3.7 + Vapi & Porcupine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                24/7 Voice & Cultural Travel Assistant for {destination}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mode Switcher: Voice Orb vs Chat */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setAssistantMode('chat')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                  assistantMode === 'chat'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Chat Thread"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setAssistantMode('voice')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                  assistantMode === 'voice'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Vapi Interactive Voice Mode"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Vapi Voice</span>
              </button>
            </div>

            {/* Voice Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border transition-all ${
                showSettings
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Voice & Wake Engine Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Close Modal Button */}
            <button
              onClick={() => {
                stopSpeaking();
                stopListeningForSpeech();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wake Word Toast Notice */}
        {wakeBadgeNotice && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-bold px-4 py-1.5 text-xs flex items-center justify-between animate-fade-in shadow-md">
            <div className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5" />
              <span>{wakeBadgeNotice}</span>
            </div>
            <span className="text-[10px] bg-slate-950 text-emerald-300 px-2 py-0.5 rounded-full">
              Porcupine Live Trigger
            </span>
          </div>
        )}

        {/* Settings Dropdown Drawer */}
        {showSettings && (
          <div className="p-4 bg-slate-950/95 border-b border-slate-800 text-xs text-slate-300 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between font-bold text-white pb-1 border-b border-slate-800">
              <span className="flex items-center space-x-1.5">
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>TourMitra Voice & Porcupine Engine Configuration</span>
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Auto Speak Toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <span>🔊 Auto-Speak Response (Vapi TTS)</span>
                <input
                  type="checkbox"
                  checked={voiceSettings.autoSpeak}
                  onChange={(e) => setVoiceSettings({ ...voiceSettings, autoSpeak: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>

              {/* Porcupine Wake Detection Toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <span>🎙️ Porcupine Wake Word Engine</span>
                <input
                  type="checkbox"
                  checked={voiceSettings.porcupineWakeEnabled}
                  onChange={(e) => setVoiceSettings({ ...voiceSettings, porcupineWakeEnabled: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>

              {/* Continuous Hands-free Loop Toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <span>🔄 Continuous Hands-free Loop</span>
                <input
                  type="checkbox"
                  checked={voiceSettings.continuousMode}
                  onChange={(e) => setVoiceSettings({ ...voiceSettings, continuousMode: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>

              {/* Sound Chimes Toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <span>🔔 Web Audio Sound Cues</span>
                <input
                  type="checkbox"
                  checked={voiceSettings.soundChimes}
                  onChange={(e) => setVoiceSettings({ ...voiceSettings, soundChimes: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
              </label>
            </div>

            {/* Language Selection */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-slate-400">Voice Accent:</span>
              {[
                { id: 'en-IN', label: 'English (India)' },
                { id: 'hi-IN', label: 'Hindi (हिंदी)' },
                { id: 'mr-IN', label: 'Marathi (मराठी)' },
                { id: 'en-US', label: 'English (US)' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoiceSettings({ ...voiceSettings, voiceLang: v.id })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    voiceSettings.voiceLang === v.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* 1-Click Simulation Wake Tests */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-slate-400">⚡ Test Wake Word:</span>
              <button
                type="button"
                onClick={() => handleSendMessage('Hey TourMitra')}
                className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-[11px] font-bold"
              >
                "Hey TourMitra"
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Hey TourMitra, where is Shaniwar Wada and how to reach there?')}
                className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-[11px] font-bold"
              >
                "Hey TourMitra + Query"
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Namaste TourMitra! Best Misal Pav spots batao Hinglish mein')}
                className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-[11px] font-bold"
              >
                "Namaste TourMitra (Hinglish)"
              </button>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips Header Bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs">
          <button
            onClick={() => handleSendMessage('Hey TourMitra')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold whitespace-nowrap shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>🎙️ Wake "Hey TourMitra"</span>
          </button>
          <button
            onClick={() => handleSendMessage('Hey TourMitra wassup bro! I am chilling in town, suggest something fun and relaxing to do in friendly conversational tone')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold whitespace-nowrap shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>💬 Casual Chat & Chill</span>
          </button>
          <button
            onClick={() => handleSendMessage('I want to book a tourism tour package (Spots, Stays, Food, Taxis and Guides)')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold whitespace-nowrap shadow-sm"
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>🎟️ Book Tourism Tour</span>
          </button>
          <button
            onClick={() => handleSendMessage('Bhai yahan ke sabse best Misal Pav aur street food secrets batao Hinglish mein!')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
          >
            <Utensils className="w-3.5 h-3.5 text-rose-400" />
            <span>🍲 Foodie Secrets</span>
          </button>
          <button
            onClick={() => handleSendMessage('Tell me the history, architecture, and legends of the famous monuments and forts here')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
          >
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Monuments Lore</span>
          </button>
          <button
            onClick={() => handleSendMessage('Give me essential Marathi & Hindi phrases for bargaining, directions, and polite greetings')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>Local Translations</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: VAPI INTERACTIVE VOICE HUD */}
        {/* ========================================================================= */}
        {assistantMode === 'voice' ? (
          <div className="flex-1 flex flex-col items-center justify-between p-4 overflow-y-auto">
            <VapiVoiceOrbVisualizer
              state={voiceState}
              isSpeaking={isSpeaking}
              isListening={isListening}
              transcript={lastTranscript}
              interimTranscript={interimTranscript}
              destination={destination}
              onOrbClick={toggleMicListening}
            />

            {/* Latest AI Spoken Response Card */}
            <div className="w-full max-w-lg bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-xl text-left space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <Bot className="w-4 h-4" />
                  <span>TourMitra Voice Output</span>
                </div>
                {isSpeaking ? (
                  <button
                    onClick={stopSpeaking}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold"
                  >
                    <Square className="w-3 h-3" />
                    <span>Stop Speaking</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400">Ready</span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-slate-200 max-h-32 overflow-y-auto leading-relaxed">
                {messages[messages.length - 1]?.sender === 'assistant'
                  ? messages[messages.length - 1]?.text
                  : 'Say "Hey TourMitra" or tap the microphone to start speaking with your AI guide.'}
              </div>

              {/* Suggestions in Voice View */}
              {messages[messages.length - 1]?.suggestions && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {messages[messages.length - 1]?.suggestions?.slice(0, 3).map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug)}
                      className="px-2.5 py-1 rounded-full text-[11px] bg-slate-900 text-slate-300 border border-slate-700 hover:border-emerald-500 hover:text-emerald-400 transition-all text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Control Buttons */}
            <div className="flex items-center space-x-3 my-2">
              <button
                type="button"
                onClick={toggleMicListening}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-rose-600/30 animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 active:scale-95'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Stop Listening' : 'Speak into Microphone'}</span>
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center space-x-1.5"
                >
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Mute Audio</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* MODE 2: CLASSIC CHAT THREAD WITH AUDIO CONTROLS */
          /* ========================================================================= */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isAi = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-start space-x-2 max-w-[85%] sm:max-w-[80%]">
                    {isAi && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isAi
                          ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-sm'
                          : 'bg-emerald-500 text-slate-950 font-medium rounded-tr-sm shadow-md'
                      }`}
                    >
                      {/* Wake Query Badge if this message responded to a wake word */}
                      {isAi && msg.isWakeQuery && (
                        <div className="mb-2 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Porcupine Wake Acknowledged</span>
                        </div>
                      )}

                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Interactive Tour Booking Section Launch Card if tourist asked about booking */}
                      {isAi && msg.isBookingIntent && (
                        <div className="mt-3.5 p-3.5 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 rounded-xl border border-emerald-500/40 space-y-2.5 shadow-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Ticket className="w-4 h-4 text-emerald-400 animate-bounce" />
                              <span className="font-bold text-white text-xs font-display">
                                Select Spots, Stays, Food, Taxis & Guides
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                              Tourist Booking
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-snug">
                            Customise your all-in-one verified tourism booking pass with instant confirmation.
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <button
                              onClick={() => handleLaunchBookingStudio('spots')}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-500/20 text-emerald-300 border border-slate-700 hover:border-emerald-500/50 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                            >
                              <Landmark className="w-3 h-3 text-emerald-400" />
                              <span>Spots</span>
                            </button>
                            <button
                              onClick={() => handleLaunchBookingStudio('hotels')}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-teal-500/20 text-teal-300 border border-slate-700 hover:border-teal-500/50 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                            >
                              <Hotel className="w-3 h-3 text-teal-400" />
                              <span>Stays</span>
                            </button>
                            <button
                              onClick={() => handleLaunchBookingStudio('restaurants')}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-amber-300 border border-slate-700 hover:border-amber-500/50 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                            >
                              <Utensils className="w-3 h-3 text-amber-400" />
                              <span>Food</span>
                            </button>
                            <button
                              onClick={() => handleLaunchBookingStudio('taxis')}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                            >
                              <Car className="w-3 h-3 text-cyan-400" />
                              <span>Taxis</span>
                            </button>
                            <button
                              onClick={() => handleLaunchBookingStudio('guides')}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-blue-500/20 text-blue-300 border border-slate-700 hover:border-blue-500/50 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                            >
                              <UserCheck className="w-3 h-3 text-blue-400" />
                              <span>Guides</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleLaunchBookingStudio(msg.bookingCategory || 'spots')}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            <span>Open Booking Studio Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {isAi && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{msg.timestamp}</span>
                          <button
                            onClick={() => speakVoiceOutput(msg.voiceText || msg.text)}
                            className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 px-1.5 py-0.5 rounded hover:bg-slate-700/50 transition-colors"
                            title="Listen with Natural Voice Output"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen Voice Guide</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Follow-up suggestions */}
                  {isAi && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 ml-9 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (sug.includes('Open Spots, Stays') || sug.includes('Select Heritage')) {
                              handleLaunchBookingStudio('spots');
                            } else if (sug.includes('Stays & Hotels')) {
                              handleLaunchBookingStudio('hotels');
                            } else if (sug.includes('Cab & Driver')) {
                              handleLaunchBookingStudio('taxis');
                            } else if (sug.includes('Cultural Guide')) {
                              handleLaunchBookingStudio('guides');
                            } else {
                              handleSendMessage(sug);
                            }
                          }}
                          className="px-2.5 py-1 rounded-full text-[11px] bg-slate-950 text-slate-400 border border-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 transition-all text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 ml-9">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>TourMitra AI is preparing your voice travel guide...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Mic voice input toggle */}
            <button
              type="button"
              onClick={toggleMicListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
              title={isListening ? 'Listening live... Speak now' : 'Speak into Microphone (Porcupine Active)'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening to your voice...' : `Say "Hey TourMitra" or ask anything about ${destination}...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
              title="Send Query"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
