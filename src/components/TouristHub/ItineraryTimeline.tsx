import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, Sparkles, CloudRain, Sun, Leaf, IndianRupee, ArrowRight, BookOpen, Share2, Printer, Compass, Bot } from 'lucide-react';
import { Itinerary, ActivityItem, DayPlan } from '../../types';

interface ItineraryTimelineProps {
  itinerary: Itinerary;
  onBookActivity: (act: ActivityItem) => void;
  onBookFullTrip: () => void;
  onAdaptWeather: (condition: 'Rain' | 'Sunny') => void;
  onOpenTourGuide: (prompt?: string) => void;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  itinerary,
  onBookActivity,
  onBookFullTrip,
  onAdaptWeather,
  onOpenTourGuide,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const currentDay: DayPlan = itinerary.days[activeDayIndex] || itinerary.days[0];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: itinerary.title,
        text: `Check out my eco-friendly travel itinerary for ${itinerary.destination} generated on TourMaster AI!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Itinerary link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-7 shadow-2xl relative">
      {/* Top Itinerary Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified SIH 2026 Plan
            </span>
            <span className="text-xs text-slate-400">
              {itinerary.durationDays} Days • {itinerary.destination}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1.5">
            {itinerary.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            {itinerary.overview}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
            title="Share Itinerary"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pass</span>
          </button>

          <button
            onClick={onBookFullTrip}
            id="book-unified-package-btn"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <span>Book Unified Package</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weather Adaptation Bar */}
      <div className="mt-5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${currentDay.dayWeather.condition.includes('Rain') ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {currentDay.dayWeather.condition.includes('Rain') ? <CloudRain className="w-5 h-5 animate-bounce" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center space-x-2">
              <span>Day {currentDay.dayNumber} Forecast: {currentDay.dayWeather.temp} ({currentDay.dayWeather.condition})</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Weather-Adaptive Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{currentDay.dayWeather.advisory}</p>
          </div>
        </div>

        {/* Dynamic Weather Shift Simulation Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => onAdaptWeather('Rain')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              currentDay.dayWeather.condition.includes('Rain')
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            🌧️ Trigger Monsoon Shift
          </button>
          <button
            onClick={() => onAdaptWeather('Sunny')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              !currentDay.dayWeather.condition.includes('Rain')
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            ☀️ Clear Skies
          </button>
        </div>
      </div>

      {/* Day Selection Tabs */}
      <div className="mt-6 flex items-center space-x-2 overflow-x-auto pb-2">
        {itinerary.days.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          return (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayIndex(idx)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Day {day.dayNumber}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {day.activities.length} Stops
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Day Theme Banner */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/60">
        <div>
          <span className="font-semibold text-slate-200">Day {currentDay.dayNumber} Focus: </span>
          <span className="text-emerald-400">{currentDay.theme}</span>
        </div>
        <div>
          <span>Est. Day Budget: </span>
          <span className="font-bold text-white">₹{currentDay.dayBudget}</span>
        </div>
      </div>

      {/* Day Timeline Activities */}
      <div className="mt-6 space-y-4">
        {currentDay.activities.map((activity, index) => {
          return (
            <div
              key={activity.id || index}
              className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-4 sm:p-5 rounded-2xl transition-all relative overflow-hidden group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left Time & Slot */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-emerald-400">{activity.timeSlot[0]}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {activity.timeRange}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {activity.category}
                      </span>
                      {activity.isEcoFriendly && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                          <Leaf className="w-2.5 h-2.5" />
                          <span>Eco-Friendly</span>
                        </span>
                      )}
                      {activity.weatherSuitability === 'Indoor-Alternative' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                          🌧️ Weather-Adapted
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white mt-1.5 group-hover:text-emerald-400 transition-colors">
                      {activity.title}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {activity.description}
                    </p>

                    {/* Meta info: Location, Duration, Verified Provider */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center space-x-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{activity.locationName}</span>
                      </div>
                      <div>
                        <span>Duration: </span>
                        <span className="text-slate-300 font-medium">{activity.recommendedDuration}</span>
                      </div>
                      {activity.verifiedProvider && (
                        <div className="flex items-center space-x-1 text-teal-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                          <span>Provider: {activity.verifiedProvider}</span>
                        </div>
                      )}
                    </div>

                    {/* Eco Tips */}
                    {activity.ecoTips && (
                      <div className="mt-2 text-[11px] text-emerald-400/90 bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 inline-block">
                        🌿 Green Tip: {activity.ecoTips}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Cost and Quick Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Est. Cost</span>
                    <span className="text-base font-bold text-emerald-400 font-display">
                      ₹{activity.estimatedCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Ask TourMitra AI about this spot */}
                    <button
                      onClick={() => onOpenTourGuide(`Tell me the rich history, legends, and best photo spots for ${activity.title}`)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs flex items-center space-x-1.5"
                      title="Ask TourMitra AI Assistant"
                    >
                      <Bot className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Ask TourMitra</span>
                    </button>


                    {/* Book Specific Activity / Provider */}
                    <button
                      onClick={() => onBookActivity(activity)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-bold transition-all"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
