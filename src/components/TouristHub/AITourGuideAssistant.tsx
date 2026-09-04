import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Volume2, VolumeX, Send, Sparkles, MessageSquare, ShieldAlert, Languages, Utensils, Landmark, X, Hotel, Car, UserCheck, Ticket, Calendar, ArrowRight } from 'lucide-react';
import { ChatMessage } from '../../types';

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
      text: `Namaste! I am TourMitra (तूर मित्र), your personalized AI cultural guide and travel assistant in ${destination || 'India'}. Ask me anything about historical lore, authentic street food, regional language translations, weather adaptations, EV cabs, or emergency safety!

Need to book a tour? As a verified tourist, you can easily customize and book Spots, Stays, Food, Taxis & Guides in one unified pass!`,
      timestamp: 'Just now',
      suggestions: [
        '🎟️ I want to book a tourism tour (Spots, Stays, Food, Taxis, Guides)',
        'Tell me the history of famous forts and palaces here',
        'What are authentic street food delicacies to try?',
        'Translate "How much does this cost?" into local language',
      ],
      isBookingIntent: false,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial prompt if passed
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleLaunchBookingStudio = (category: 'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary' = 'spots') => {
    if (onSelectBookingCategory) {
      onSelectBookingCategory(category);
    }
    onClose();
    // Scroll to booking section smoothly
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

  // Speech Recognition setup (Voice Input)
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Text to Speech playback (Voice Output)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const qLower = query.toLowerCase();
    const isLocalBookingQuery = qLower.includes('book') || qLower.includes('reserve') || 
                                qLower.includes('tour') || qLower.includes('hotel') || 
                                qLower.includes('taxi') || qLower.includes('cab') || 
                                qLower.includes('guide') || qLower.includes('stay') || 
                                qLower.includes('package');

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Keep multi-turn context
    const currentHistory = messages.slice(-10).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/tour-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          destination,
          history: currentHistory,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-ai',
        sender: 'assistant',
        text: data.text || 'I am happy to guide your travels! How else can I assist?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || [
          '🎟️ Open Spots, Stays, Food, Taxis & Guides Studio',
          'Tell me another cultural story',
          'Where can I find sustainable local handicrafts?',
        ],
        isBookingIntent: data.isBookingIntent ?? isLocalBookingQuery,
        bookingCategory: data.bookingCategory || 'spots',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        text: isLocalBookingQuery
          ? `I can help you book your tourism tour in ${destination}! As a tourist, you can select spots, stays, food, taxis, and guides in one click below.`
          : `Namaste! As your TourMitra guide in ${destination}, feel free to chat with me in general English, Hinglish, or Marathi about places to chill, authentic food, EV cabs, or emergency safety!`,
        timestamp: 'Just now',
        isBookingIntent: isLocalBookingQuery,
        bookingCategory: 'spots',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl h-[90vh] max-h-[680px] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold font-display text-white text-base">
                  TourMitra (तूर मित्र) AI Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Gemini 3.7 Flash Trained
                </span>
              </div>
              <p className="text-xs text-slate-400">
                24/7 Multilingual & General Language AI Companion for {destination}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompt Category Chips */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs">
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
            <span>🍲 Foodie Secrets (Hinglish)</span>
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
          <button
            onClick={() => handleSendMessage('How can I make my travel 100% eco-friendly with EV Cabs and support local artisans?')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Green Travel Tips</span>
          </button>
          <button
            onClick={() => handleSendMessage('What are emergency helpline numbers and safety tips for tourists in distress?')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>🚨 Safety & SOS</span>
          </button>
        </div>

        {/* Message Thread */}
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
                          onClick={() => speakText(msg.text)}
                          className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 px-1.5 py-0.5 rounded hover:bg-slate-700/50"
                          title="Listen with Text-to-Speech"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen Audio Guide</span>
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
              <span>TourMitra AI is preparing your tour booking recommendations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

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
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
              title={isListening ? 'Listening... Speak now' : 'Speak into Microphone'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening to your voice...' : `Ask TourMaster anything about ${destination}...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
