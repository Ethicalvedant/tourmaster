import React, { useState } from 'react';
import { Sparkles, MapPin, Calendar, IndianRupee, Users, Compass, Zap, Leaf, Check, SlidersHorizontal, CloudRain } from 'lucide-react';
import { TripPlannerParams, TravelInterest, GroupType, TravelStyle } from '../../types';
import { POPULAR_DESTINATIONS } from '../../data/mockTourismData';

interface TripPlannerFormProps {
  onGenerate: (params: TripPlannerParams) => void;
  isLoading: boolean;
  detectedLocation?: string;
  detectedWeather?: any;
}

const AVAILABLE_INTERESTS: TravelInterest[] = [
  'Heritage & Culture',
  'Nature & Wildlife',
  'Adventure & Trekking',
  'Spiritual & Wellness',
  'Food & Culinary',
  'Beach & Leisure',
  'Eco-Tourism & Rural',
];

const GROUP_TYPES: GroupType[] = [
  'Solo',
  'Couple',
  'Family with Kids',
  'Friends Group',
  'Senior Citizens',
];

const TRAVEL_STYLES: TravelStyle[] = [
  'Budget / Backpacker',
  'Balanced / Smart',
  'Premium / Luxury',
  'Eco-Conscious',
];

export const TripPlannerForm: React.FC<TripPlannerFormProps> = ({ 
  onGenerate, 
  isLoading,
  detectedLocation,
  detectedWeather
}) => {
  const [destination, setDestination] = useState('Pune & Sahyadri Heritage, Maharashtra');
  const [startCity, setStartCity] = useState('Pune (Device Location)');
  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState(15000);
  const [travelers, setTravelers] = useState(2);
  const [groupType, setGroupType] = useState<GroupType>('Couple');
  const [selectedInterests, setSelectedInterests] = useState<TravelInterest[]>([
    'Heritage & Culture',
    'Adventure & Trekking',
    'Food & Culinary',
  ]);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('Balanced / Smart');
  const [transportPreference, setTransportPreference] = useState<'EV / Green' | 'Public / Metro' | 'Private Cab' | 'Self-Drive'>('EV / Green');
  const [simulateMonsoon, setSimulateMonsoon] = useState(false);

  // Sync with detected GPS location
  React.useEffect(() => {
    if (detectedLocation) {
      setStartCity(detectedLocation);
    }
  }, [detectedLocation]);


  const toggleInterest = (interest: TravelInterest) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      }
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSelectPresetDestination = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    setDestination(`${dest.city}, ${dest.state}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      destination,
      startCity,
      days,
      budget,
      travelers,
      groupType,
      interests: selectedInterests,
      travelStyle,
      transportPreference,
      isMonsoonOrRainy: simulateMonsoon,
    });
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              AI Itinerary & Budget Optimizer
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalized day-wise travel plans adjusted for live weather, verified local providers, and high sustainability eco-scores.
          </p>
        </div>

        {/* Quick weather simulator pill */}
        <button
          type="button"
          onClick={() => setSimulateMonsoon(!simulateMonsoon)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            simulateMonsoon
              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-sm'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
          }`}
        >
          <CloudRain className={`w-3.5 h-3.5 ${simulateMonsoon ? 'text-cyan-400 animate-bounce' : ''}`} />
          <span>{simulateMonsoon ? 'Live Monsoon Alert (Active)' : 'Simulate Monsoon Weather'}</span>
        </button>
      </div>

      {/* Popular Destination Quick Selectors */}
      <div className="mt-5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Featured Indian Tourism Hubs:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {POPULAR_DESTINATIONS.map((dest) => {
            const isSelected = destination.toLowerCase().includes(dest.city.toLowerCase());
            return (
              <button
                key={dest.city}
                type="button"
                onClick={() => handleSelectPresetDestination(dest)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500/40'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="font-semibold text-xs text-white flex items-center justify-between w-full">
                  {dest.city}
                  {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                </span>
                <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">{dest.state}</span>
                <span className="text-[10px] text-emerald-400/90 font-medium mt-1">Eco {dest.avgEcoScore}/100</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Destination & Starting Point */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Destination</span>
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Jaipur, Goa, Manali, Kerala..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Starting City</span>
            </label>
            <input
              type="text"
              required
              value={startCity}
              onChange={(e) => setStartCity(e.target.value)}
              placeholder="e.g. New Delhi, Mumbai, Bengaluru..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Sliders: Duration, Budget, Travelers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          {/* Duration */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Duration</span>
              </span>
              <span className="font-bold text-emerald-400">{days} Days / {days > 1 ? days - 1 : 1} Nights</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 Day</span>
              <span>5 Days</span>
              <span>10 Days</span>
            </div>
          </div>

          {/* Budget */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center space-x-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Budget</span>
              </span>
              <span className="font-bold text-emerald-400">₹{budget.toLocaleString('en-IN')} INR</span>
            </div>
            <input
              type="range"
              min={5000}
              max={120000}
              step={2000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>₹5k (Budget)</span>
              <span>₹50k</span>
              <span>₹1.2L (Luxury)</span>
            </div>
          </div>

          {/* Travelers */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Travelers</span>
              </span>
              <span className="font-bold text-emerald-400">{travelers} Person{travelers > 1 ? 's' : ''}</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 (Solo)</span>
              <span>4</span>
              <span>8 (Group)</span>
            </div>
          </div>
        </div>

        {/* Group Type & Travel Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Group Dynamic:</label>
            <div className="flex flex-wrap gap-1.5">
              {GROUP_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGroupType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    groupType === type
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Travel Style:</label>
            <div className="flex flex-wrap gap-1.5">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setTravelStyle(style)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    travelStyle === style
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Travel Interests (Multi-select) */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Travel Interests & Experiences (Choose all that apply):
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_INTERESTS.map((interest) => {
              const active = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    active
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{interest}</span>
                  {active && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transport Preference */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center space-x-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Transport & Mobility Preference:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'EV / Green', label: 'EV / Green Cab Fleet', desc: 'Zero Carbon Chauffeur' },
              { id: 'Public / Metro', label: 'Metro & Public Transit', desc: 'Max Eco Score' },
              { id: 'Private Cab', label: 'Private AC Cab', desc: 'Door-to-door comfort' },
              { id: 'Self-Drive', label: 'Self-Drive / Rental', desc: 'Full flexibility' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTransportPreference(t.id as any)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  transportPreference === t.id
                    ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs text-white">{t.label}</div>
                <div className="text-[10px] text-slate-400">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          id="generate-itinerary-btn"
          className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Generating AI Itinerary with Gemini & Verified Providers...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Generate Personalized TourMaster Itinerary</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
