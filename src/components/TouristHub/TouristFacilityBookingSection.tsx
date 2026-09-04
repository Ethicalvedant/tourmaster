import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Hotel, Utensils, Sparkles, Car, UserCheck, Calendar, IndianRupee, 
  Search, CheckCircle2, Plus, Minus, Trash2, ArrowRight, ShieldCheck, 
  Compass, AlertCircle, Clock, Star, Leaf, Filter, X, ChevronRight, ChevronLeft, ChevronDown, Check, CalendarDays,
  User, Navigation
} from 'lucide-react';
import { 
  TouristSpot, HotelItem, RestaurantItem, EntertainmentItem, TaxiRoute, GuideItem, UserAuth 
} from '../../types';
import { 
  MASTER_TOURIST_SPOTS, MASTER_HOTELS, MASTER_RESTAURANTS, 
  MASTER_ENTERTAINMENTS, MASTER_TAXIS, MASTER_GUIDES 
} from '../../data/mockTourismData';

interface TouristFacilityBookingSectionProps {
  detectedCity?: string;
  userCoords?: { lat: number; lng: number } | null;
  isLocationEnabled?: boolean;
  locationStatus?: 'prompt' | 'granted' | 'denied' | 'locating';
  onRequestLocation?: () => void;
  userAuth?: UserAuth | null;
  onOpenCheckoutModal: (bookingDetails: any) => void;
  externalActiveTab?: 'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary';
  onTabChange?: (tab: 'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary') => void;
}

export const TouristFacilityBookingSection: React.FC<TouristFacilityBookingSectionProps> = ({
  detectedCity = 'Pune',
  userCoords,
  isLocationEnabled = false,
  locationStatus,
  onRequestLocation,
  userAuth,
  onOpenCheckoutModal,
  externalActiveTab,
  onTabChange,
}) => {
  // Navigation active sub-tab within the booking builder
  const [activeTab, setActiveTab] = useState<'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary'>(externalActiveTab || 'spots');

  // Sync with external tab changes (e.g. from TourMitra AI or Quick Booking Bar)
  useEffect(() => {
    if (externalActiveTab && externalActiveTab !== activeTab) {
      setActiveTab(externalActiveTab);
    }
  }, [externalActiveTab]);

  const handleSetTab = (newTab: 'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary') => {
    setActiveTab(newTab);
    if (onTabChange) onTabChange(newTab);
  };

  const isTourist = userAuth?.role === 'tourist';

  // Datasets state (PostgreSQL-ready with API fetch + fallback)
  const [spots, setSpots] = useState<TouristSpot[]>(MASTER_TOURIST_SPOTS);
  const [hotels, setHotels] = useState<HotelItem[]>(MASTER_HOTELS);
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>(MASTER_RESTAURANTS);
  const [entertainments, setEntertainments] = useState<EntertainmentItem[]>(MASTER_ENTERTAINMENTS);
  const [taxis, setTaxis] = useState<TaxiRoute[]>(MASTER_TAXIS);
  const [guides, setGuides] = useState<GuideItem[]>(MASTER_GUIDES);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showGoogleMap, setShowGoogleMap] = useState<boolean>(true);

  // User Selections State (starts completely clean with 0 spots selected)
  const [selectedSpots, setSelectedSpots] = useState<TouristSpot[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<{ item: HotelItem; rooms: number; nights: number } | null>(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState<{ item: RestaurantItem; guests: number }[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<{ item: EntertainmentItem; tickets: number }[]>([]);
  const [selectedTaxi, setSelectedTaxi] = useState<{ route: TaxiRoute; vehicleType: 'EV Cab' | 'Sedan' | 'SUV'; date: string } | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<{ item: GuideItem; days: number } | null>(null);

  // Travel Date State & Interactive Annual Calendar Popup State
  const [travelDate, setTravelDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [travelersCount, setTravelersCount] = useState(2);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Month & Year navigator state (supports navigating forward across 12-24+ months)
  const [viewedDate, setViewedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const viewedYear = viewedDate.getFullYear();
  const viewedMonth = viewedDate.getMonth();

  const monthsNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Navigate to previous month (disabled if before current month)
  const handlePrevMonth = () => {
    const today = new Date();
    const isCurrentMonth = viewedYear === today.getFullYear() && viewedMonth === today.getMonth();
    if (!isCurrentMonth) {
      setViewedDate(new Date(viewedYear, viewedMonth - 1, 1));
    }
  };

  // Navigate to next month (supports navigating forward throughout the whole year)
  const handleNextMonth = () => {
    setViewedDate(new Date(viewedYear, viewedMonth + 1, 1));
  };

  // Compute full interactive days grid for the viewed month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewedYear, viewedMonth, 1).getDay();
    const totalDaysInMonth = new Date(viewedYear, viewedMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    // Leading empty filler slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: '', isPast: true, isToday: false, isSelected: false, isWeekend: false });
    }

    // Actual days of month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const thisDate = new Date(viewedYear, viewedMonth, d);
      thisDate.setHours(0, 0, 0, 0);
      const iso = `${viewedYear}-${String(viewedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = thisDate < today;
      const isToday = thisDate.getTime() === today.getTime();
      const isSelected = travelDate === iso;
      const isWeekend = thisDate.getDay() === 0 || thisDate.getDay() === 6;

      days.push({
        day: d,
        dateStr: iso,
        isPast,
        isToday,
        isSelected,
        isWeekend
      });
    }
    return days;
  }, [viewedYear, viewedMonth, travelDate]);

  // Formatted human-readable display of the currently selected travel date
  const formattedSelectedDate = useMemo(() => {
    if (!travelDate) return 'Select Travel Date';
    const [y, m, d] = travelDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [travelDate]);

  // Quick preset shortcuts (Today, Tomorrow, Weekend, Next Month)
  const setQuickDate = (type: 'today' | 'tomorrow' | 'this_weekend' | 'next_weekend' | 'next_month') => {
    const target = new Date();
    if (type === 'today') {
      // today
    } else if (type === 'tomorrow') {
      target.setDate(target.getDate() + 1);
    } else if (type === 'this_weekend') {
      const day = target.getDay();
      const diff = day === 6 ? 0 : 6 - day;
      target.setDate(target.getDate() + diff);
    } else if (type === 'next_weekend') {
      const day = target.getDay();
      const diff = (6 - day) + 7;
      target.setDate(target.getDate() + diff);
    } else if (type === 'next_month') {
      target.setMonth(target.getMonth() + 1);
    }
    const iso = target.toISOString().split('T')[0];
    setTravelDate(iso);
    setViewedDate(new Date(target.getFullYear(), target.getMonth(), 1));
    setIsCalendarOpen(false);
  };

  // Fetch datasets from backend (PostgreSQL-ready endpoints)
  useEffect(() => {
    setIsLoadingData(true);
    Promise.allSettled([
      fetch('/api/spots').then(res => res.json()).then(data => Array.isArray(data) && data.length > 0 && setSpots(data)),
      fetch('/api/hotels').then(res => res.json()).then(data => Array.isArray(data) && data.length > 0 && setHotels(data)),
      fetch('/api/restaurants').then(res => res.json()).then(data => Array.isArray(data) && data.length > 0 && setRestaurants(data)),
      fetch('/api/entertainments').then(res => res.json()).then(data => Array.isArray(data) && data.length > 0 && setEntertainments(data)),
      fetch('/api/taxis').then(res => res.json()).then(data => Array.isArray(data) && data.length > 0 && setTaxis(data)),
      fetch('/api/guides').then(res => res.json()).then(data => Array.isArray(data) && data.length > 0 && setGuides(data)),
    ]).finally(() => {
      setIsLoadingData(false);
    });
  }, []);

  // Filtered spots list
  const filteredSpots = useMemo(() => {
    return spots.filter(s => {
      const matchCity = selectedCity === 'all' || s.city.toLowerCase() === selectedCity.toLowerCase();
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      const matchQuery = !searchQuery.trim() || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCity && matchCat && matchQuery;
    });
  }, [spots, selectedCity, selectedCategory, searchQuery]);

  // Unique cities list for filtering
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    spots.forEach(s => set.add(s.city));
    return Array.from(set);
  }, [spots]);

  // Toggle spot selection
  const handleToggleSpot = (spot: TouristSpot) => {
    if (selectedSpots.some(s => s.id === spot.id)) {
      setSelectedSpots(selectedSpots.filter(s => s.id !== spot.id));
    } else {
      setSelectedSpots([...selectedSpots, spot]);
    }
  };

  // Pricing calculations
  const spotsTotal = useMemo(() => {
    return selectedSpots.reduce((sum, s) => sum + (s.entryFee * travelersCount), 0);
  }, [selectedSpots, travelersCount]);

  const hotelTotal = useMemo(() => {
    if (!selectedHotel) return 0;
    return selectedHotel.item.pricePerNight * selectedHotel.rooms * selectedHotel.nights;
  }, [selectedHotel]);

  const diningTotal = useMemo(() => {
    return selectedRestaurants.reduce((sum, r) => sum + (r.item.priceForTwo * Math.ceil(r.guests / 2)), 0);
  }, [selectedRestaurants]);

  const activitiesTotal = useMemo(() => {
    return selectedActivities.reduce((sum, a) => sum + (a.item.approxEntryFee * a.tickets), 0);
  }, [selectedActivities]);

  const taxiTotal = useMemo(() => {
    if (!selectedTaxi) return 0;
    const base = selectedTaxi.route.fareAmount || 1800;
    const multiplier = selectedTaxi.vehicleType === 'SUV' ? 1.4 : selectedTaxi.vehicleType === 'EV Cab' ? 0.95 : 1.1;
    return Math.round(base * multiplier);
  }, [selectedTaxi]);

  const guideTotal = useMemo(() => {
    if (!selectedGuide) return 0;
    const price = selectedGuide.item.priceINR || selectedGuide.item.dailyRate || 500;
    return price * selectedGuide.days;
  }, [selectedGuide]);

  const grandTotal = spotsTotal + hotelTotal + diningTotal + activitiesTotal + taxiTotal + guideTotal;

  // Proceed to booking checkout (only allowed for tourists)
  const handleProceedToBooking = () => {
    if (userAuth && userAuth.role !== 'tourist') {
      alert('Only tourist accounts can make tour bookings. Service Providers and Admins manage reservations through their portals.');
      return;
    }

    const bookingPayload = {
      destination: selectedSpots.map(s => s.name).join(', ') || 'Custom Maharashtra Tour',
      travelDate,
      travelersCount,
      spots: selectedSpots,
      hotel: selectedHotel,
      restaurants: selectedRestaurants,
      activities: selectedActivities,
      taxi: selectedTaxi,
      guide: selectedGuide,
      totalEstimated: grandTotal,
      spotsTotal,
      hotelTotal,
      diningTotal,
      activitiesTotal,
      taxiTotal,
      guideTotal,
    };
    onOpenCheckoutModal(bookingPayload);
  };

  return (
    <div id="select-spots-stays-food-taxis-guides-section" className="space-y-6 scroll-mt-24 transition-all">
      {/* Role Permission Badge & Information Strip */}
      <div className="bg-slate-900/90 border border-emerald-500/30 px-4 py-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-md">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white">
            {isTourist ? '🧭 Tourist Booking Hub' : '🔒 Role Notice'}
          </span>
          <span className="text-slate-400">
            {isTourist 
              ? 'Only tourist users make bookings • Service Providers & Admins manage and fulfill them in real-time.' 
              : `Signed in as ${userAuth?.role}. Only tourists can make bookings; you can manage orders in your portal.`}
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold self-end sm:self-auto">
          {isTourist ? '✅ Tourist Verified' : 'Management Mode'}
        </span>
      </div>

      {/* Section Header Card */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none overflow-hidden" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unified Custom Trip & Facilities Builder</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              Select Spots, Stays, Food, Taxis & Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Choose your favorite tourism spots and optionally configure hotels, dining, entertainment, taxi routes, and certified guides for a complete one-click booking.
            </p>
          </div>

          {/* Real-time Configured Tour & Facilities Indicator */}
          <div className="bg-slate-950/80 border border-emerald-500/40 p-4 rounded-2xl flex flex-col items-end justify-center min-w-[200px] shadow-lg">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Custom Tour Hub</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center">
              <span>{selectedSpots.length} Spot{selectedSpots.length !== 1 ? 's' : ''} Selected</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {travelersCount} Traveler{travelersCount > 1 ? 's' : ''} • Departure: {formattedSelectedDate}
            </div>
          </div>
        </div>

        {/* Global Trip Meta Bar: Date (Calendar Trigger) & Travelers */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Travel Date Selector Trigger */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <label className="text-[11px] text-slate-300 font-bold">Travel Departure Date</label>
              </div>
              <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                All Year Active
              </span>
            </div>

            {/* Clickable Date Display Bar */}
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/80 rounded-xl px-3 py-2 text-left flex items-center justify-between text-xs transition-all shadow-md group cursor-pointer"
              title="Click to open full-year calendar"
            >
              <div className="flex items-center space-x-2 truncate">
                <CalendarDays className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
                <span className="font-extrabold text-white tracking-wide truncate text-xs sm:text-sm">
                  {formattedSelectedDate}
                </span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 font-bold text-[10px] border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <span>Pick Date ▾</span>
              </div>
            </button>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center space-x-3">
            <UserCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 block font-semibold">Travelers Count</label>
              <div className="flex items-center space-x-2 mt-0.5">
                <button 
                  onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                  className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white font-bold"
                >-</button>
                <span className="font-bold text-white text-xs">{travelersCount} Person{travelersCount > 1 ? 's' : ''}</span>
                <button 
                  onClick={() => setTravelersCount(travelersCount + 1)}
                  className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white font-bold"
                >+</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Origin Hub</span>
                <span className="font-bold text-white text-xs truncate max-w-[120px] inline-block">{detectedCity}</span>
              </div>
            </div>
            <button
              onClick={() => handleSetTab('summary')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-all shadow-md"
            >
              Review ({selectedSpots.length + (selectedHotel ? 1 : 0) + selectedRestaurants.length + selectedActivities.length + (selectedTaxi ? 1 : 0) + (selectedGuide ? 1 : 0)})
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL ANNUAL TRAVEL DATE CALENDAR MODAL (100% Unclipped & Visible) */}
      {/* ========================================================================= */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          {/* Backdrop click handler */}
          <div className="fixed inset-0 -z-10" onClick={() => setIsCalendarOpen(false)} />

          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-500/20 max-w-md w-full space-y-4 relative overflow-hidden animate-bounce-in">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-white text-base sm:text-lg">Select Travel Date</h3>
                  <p className="text-[11px] text-slate-400">Choose any upcoming date throughout the whole year</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Calendar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Month & Year Navigator Bar */}
            <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={viewedYear === new Date().getFullYear() && viewedMonth === new Date().getMonth()}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800 transition-all flex items-center space-x-1 text-xs font-semibold"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Prev</span>
              </button>

              {/* Month & Year Dropdown Selectors */}
              <div className="flex items-center space-x-2">
                <select
                  value={viewedMonth}
                  onChange={(e) => setViewedDate(new Date(viewedYear, Number(e.target.value), 1))}
                  className="bg-slate-900 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {monthsNames.map((m, idx) => {
                    const today = new Date();
                    const isPastMonth = viewedYear === today.getFullYear() && idx < today.getMonth();
                    return (
                      <option key={m} value={idx} disabled={isPastMonth} className="bg-slate-950 text-white">
                        {m}
                      </option>
                    );
                  })}
                </select>

                <select
                  value={viewedYear}
                  onChange={(e) => setViewedDate(new Date(Number(e.target.value), viewedMonth, 1))}
                  className="bg-slate-900 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={new Date().getFullYear()} className="bg-slate-950 text-white">{new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() + 1} className="bg-slate-950 text-white">{new Date().getFullYear() + 1}</option>
                  <option value={new Date().getFullYear() + 2} className="bg-slate-950 text-white">{new Date().getFullYear() + 2}</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center space-x-1 text-xs font-semibold"
                title="Next Month"
              >
                <span className="hidden xs:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Click Preset Buttons */}
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setQuickDate('today')}
                className="py-1.5 px-2 rounded-xl bg-slate-950 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-800 text-center transition-all text-[11px]"
              >
                ⚡ Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate('tomorrow')}
                className="py-1.5 px-2 rounded-xl bg-slate-950 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-800 text-center transition-all text-[11px]"
              >
                🚀 Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate('this_weekend')}
                className="py-1.5 px-2 rounded-xl bg-slate-950 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-800 text-center transition-all text-[11px]"
              >
                🏖️ Weekend
              </button>
              <button
                type="button"
                onClick={() => setQuickDate('next_month')}
                className="py-1.5 px-2 rounded-xl bg-slate-950 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-800 text-center transition-all text-[11px]"
              >
                📅 +1 Month
              </button>
            </div>

            {/* Days of Week Row */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pt-1">
              {daysOfWeek.map((d, i) => (
                <div key={d} className={`py-1 ${i === 0 || i === 6 ? 'text-teal-400' : ''}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* 7-Column Visual Month Day Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((item, index) => {
                if (!item.day) {
                  return <div key={`empty-${index}`} className="h-9 w-full" />;
                }

                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    disabled={item.isPast}
                    onClick={() => {
                      setTravelDate(item.dateStr);
                      setIsCalendarOpen(false);
                    }}
                    className={`h-9 w-full rounded-xl text-xs font-bold flex items-center justify-center transition-all relative ${
                      item.isSelected
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/40 scale-105 z-10 border border-emerald-400'
                        : item.isPast
                        ? 'text-slate-600 opacity-40 cursor-not-allowed bg-slate-950/20'
                        : item.isToday
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30 font-black'
                        : item.isWeekend
                        ? 'bg-slate-950/80 text-teal-300 hover:bg-slate-800 hover:text-white border border-slate-800/80'
                        : 'bg-slate-950/60 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-800/60'
                    }`}
                    title={item.dateStr}
                  >
                    {item.day}
                    {item.isToday && !item.isSelected && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Selected Date:</span>
                <span className="text-xs font-bold text-emerald-400 truncate block max-w-[200px]">
                  {formattedSelectedDate}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center space-x-1.5"
              >
                <span>Confirm & Apply</span>
                <Check className="w-3.5 h-3.5 font-bold" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6 Category Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 text-xs font-semibold">
        {[
          { id: 'spots', label: '1. Tourism Spots', icon: MapPin, count: selectedSpots.length, color: 'text-emerald-400' },
          { id: 'hotels', label: '2. Hotels (Opt)', icon: Hotel, count: selectedHotel ? 1 : 0, color: 'text-teal-400' },
          { id: 'restaurants', label: '3. Food (Opt)', icon: Utensils, count: selectedRestaurants.length, color: 'text-amber-400' },
          { id: 'activities', label: '4. Activities (Opt)', icon: Sparkles, count: selectedActivities.length, color: 'text-purple-400' },
          { id: 'taxis', label: '5. Taxi / Cab (Opt)', icon: Car, count: selectedTaxi ? 1 : 0, color: 'text-cyan-400' },
          { id: 'guides', label: '6. Guides (Opt)', icon: UserCheck, count: selectedGuide ? 1 : 0, color: 'text-blue-400' },
          { id: 'summary', label: '7. Checkout', icon: CheckCircle2, count: null, color: 'text-emerald-300' },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSetTab(tab.id as any)}
              className={`p-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all text-left ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : tab.color}`} />
              <span className="truncate">{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TOURISM SPOTS SELECTION */}
      {/* ========================================================================= */}
      {activeTab === 'spots' && (
        <div className="space-y-5 animate-fade-in">
          {/* Integrated Interactive Google Tourism Map */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm sm:text-base font-bold text-white font-display">
                      Interactive Tourism Spots & Circuit Map
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                      LIVE GOOGLE GIS MAP
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Explore all verified tourism spots, historical hillforts, eco-stays & transit routes in Maharashtra directly on Google Maps.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleMap(!showGoogleMap)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center space-x-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{showGoogleMap ? 'Hide Map' : 'Show Google Map'}</span>
                </button>
              </div>
            </div>

            {showGoogleMap && (
              <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
                {/* Custom Branded Top Map Header Bar (Replaces Google account title bar) */}
                <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-10 relative">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                      🗺️
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                        <span>Interactive Tourism Spots & Circuit Map</span>
                        <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          LIVE GIS
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span className="hidden sm:inline">Maharashtra Heritage & Eco-Circuit</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>

                {/* Map Iframe with negative top offset to cleanly hide Google account header */}
                <div className="relative w-full h-[400px] sm:h-[480px] overflow-hidden bg-slate-950">
                  <iframe
                    src="https://www.google.com/maps/d/u/0/embed?mid=1BduobnNEMw15fIjOXrYDxGGGNFYIxLg&ehbc=2E312F"
                    width="100%"
                    height="100%"
                    className="w-full absolute left-0 right-0 border-0"
                    style={{
                      top: '-58px',
                      height: 'calc(100% + 58px)',
                      border: 0,
                    }}
                    allowFullScreen
                    loading="lazy"
                    title="Interactive Tourism Spots & Circuit Map"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search spots by name, monument, fort, beach, temple..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Cities</option>
                {availableCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="Heritage & Culture">Heritage & Culture</option>
                <option value="Nature & Wildlife">Nature & Wildlife</option>
                <option value="Adventure & Trekking">Adventure & Trekking</option>
                <option value="Spiritual & Wellness">Spiritual & Wellness</option>
                <option value="Beach & Leisure">Beach & Leisure</option>
                <option value="Food & Culinary">Food & Culinary</option>
              </select>
            </div>
          </div>

          {/* Spots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpots.map((spot) => {
              const isSelected = selectedSpots.some(s => s.id === spot.id);
              return (
                <div
                  key={spot.id}
                  onClick={() => handleToggleSpot(spot)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative h-40 rounded-xl overflow-hidden bg-slate-950">
                      <img 
                        src={spot.imageUrl} 
                        alt={spot.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        {spot.category}
                      </div>
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border transition-all"
                        style={{ backgroundColor: isSelected ? '#10b981' : 'rgba(15,23,42,0.85)', borderColor: isSelected ? '#10b981' : '#475569' }}
                      >
                        {isSelected ? <Check className="w-4 h-4 text-slate-950 font-bold" /> : <Plus className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">{spot.name}</h4>
                        <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{spot.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{spot.city}, {spot.state}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {spot.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Distance & Entry Fee</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[11px] text-emerald-300 font-semibold">📍 {spot.distanceFromPune || 'Pune Hub'}</span>
                        <span className="text-[11px] text-white font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          {spot.entryFee ? `₹${spot.entryFee}/person` : 'Free Entry'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Visiting Hours</span>
                      <span className="text-[11px] text-slate-300 font-medium">{spot.timings || '09:00 AM - 06:00 PM'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-300 font-semibold">
              Selected <span className="text-emerald-400 font-bold">{selectedSpots.length} spot(s)</span> for custom itinerary & circuit
            </span>
            <button
              onClick={() => handleSetTab('hotels')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all"
            >
              <span>Next: Select Hotels (Optional)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HOTELS & STAYS (OPTIONAL) */}
      {/* ========================================================================= */}
      {activeTab === 'hotels' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">Select Accommodations (Optional)</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Browse verified stays near your selected heritage destinations.
              </p>
            </div>
            {selectedHotel && (
              <button
                onClick={() => setSelectedHotel(null)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Hotel</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotels.map((hotel) => {
              const isSelected = selectedHotel?.item.id === hotel.id;
              return (
                <div
                  key={hotel.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500 ring-2 ring-teal-500/40 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative h-36 rounded-xl overflow-hidden bg-slate-950">
                      <img src={hotel.image} alt={hotel.hotelName} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-teal-300">
                        📍 {hotel.tourismSpot}
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/90 text-[10px] font-bold text-teal-300 border border-teal-500/20">
                        ₹{hotel.pricePerNight?.toLocaleString('en-IN') || '1,800'} / night
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm">{hotel.hotelName}</h4>
                        <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{hotel.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                        <span className="text-teal-300 font-semibold">📍 {hotel.distanceFromSpot || (hotel.distanceKm + ' km')} from spot</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {hotel.amenities?.map((am, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] border border-slate-800">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Distance & Tariff</span>
                      <span className="font-bold text-teal-300 text-xs">₹{hotel.pricePerNight?.toLocaleString('en-IN') || '1,800'} <span className="text-[10px] text-slate-400 font-normal">/ night</span></span>
                    </div>

                    <button
                      onClick={() => {
                        if (isSelected) setSelectedHotel(null);
                        else setSelectedHotel({ item: hotel, rooms: 1, nights: 1 });
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        isSelected 
                          ? 'bg-teal-500 text-slate-950' 
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : '+ Select Hotel'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-300 font-semibold">
              Selected Hotel: <span className="text-teal-400 font-bold">{selectedHotel ? selectedHotel.item.hotelName : 'None (Optional)'}</span>
            </span>
            <button
              onClick={() => handleSetTab('restaurants')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all"
            >
              <span>Next: Food & Dining (Optional)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RESTAURANTS & DINING (OPTIONAL) */}
      {/* ========================================================================= */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">Select Restaurants & Local Dining (Optional)</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Authentic regional cuisines, pure-veg thalis, and local eateries near tourist spots.
              </p>
            </div>
            {selectedRestaurants.length > 0 && (
              <button
                onClick={() => setSelectedRestaurants([])}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold"
              >
                Clear Dining
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((rest) => {
              const isSelected = selectedRestaurants.some(r => r.item.id === rest.id);
              return (
                <div
                  key={rest.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/40 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Utensils className="w-4 h-4 text-amber-400" />
                        <h4 className="font-bold text-white text-sm">{rest.restaurantName}</h4>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rest.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                        {rest.cuisine}
                      </span>
                      {rest.isPureVeg && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                          🌱 100% Pure Veg
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>📍 Near <span className="text-slate-200 font-semibold">{rest.tourismSpot}</span></span>
                      <span className="text-amber-300 font-semibold">{rest.distanceFromSpot || (rest.distanceKm + ' km')}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Avg. Cost for Two</span>
                      <span className="font-bold text-amber-300 text-xs">₹{rest.priceForTwo || 400}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (isSelected) {
                          setSelectedRestaurants(selectedRestaurants.filter(r => r.item.id !== rest.id));
                        } else {
                          setSelectedRestaurants([...selectedRestaurants, { item: rest, guests: travelersCount }]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        isSelected 
                          ? 'bg-amber-500 text-slate-950' 
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : '+ Add Meal'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-300 font-semibold">
              Selected Dining: <span className="text-amber-400 font-bold">{selectedRestaurants.length} venue(s)</span>
            </span>
            <button
              onClick={() => handleSetTab('activities')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all"
            >
              <span>Next: Entertainment & Activities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ENTERTAINMENT ACTIVITIES (OPTIONAL) */}
      {/* ========================================================================= */}
      {activeTab === 'activities' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">Select Entertainment & Activities (Optional)</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Sound & light shows, fort trekking, boat safari, wax museums & cultural workshops.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entertainments.map((act) => {
              const isSelected = selectedActivities.some(a => a.item.id === act.id);
              return (
                <div
                  key={act.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-purple-500 ring-2 ring-purple-500/40 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <h4 className="font-bold text-white text-sm">{act.entertainmentPlace}</h4>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{act.rating}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Category: <span className="text-purple-300 font-semibold">{act.category}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>📍 Near: <span className="text-slate-200 font-semibold">{act.tourismSpot}</span></span>
                      <span className="text-purple-300 font-semibold">{act.distanceFromSpot}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Approx. Entry Fee</span>
                      <span className="font-bold text-purple-300 text-xs">{act.approxEntryFee ? `₹${act.approxEntryFee}/person` : 'Free Entry'}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (isSelected) {
                          setSelectedActivities(selectedActivities.filter(a => a.item.id !== act.id));
                        } else {
                          setSelectedActivities([...selectedActivities, { item: act, tickets: travelersCount }]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        isSelected 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Added' : '+ Add Activity'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-300 font-semibold">
              Selected Activities: <span className="text-purple-400 font-bold">{selectedActivities.length} experience(s)</span>
            </span>
            <button
              onClick={() => handleSetTab('taxis')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all"
            >
              <span>Next: Taxi & Cab Transit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TAXI AVAILABILITY & ROUTES (OPTIONAL) */}
      {/* ========================================================================= */}
      {activeTab === 'taxis' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">Select Taxi / Cab Route (Optional)</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Standard approved routes with EV Green Cab, Sedan & SUV options.
              </p>
            </div>
            {selectedTaxi && (
              <button
                onClick={() => setSelectedTaxi(null)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold"
              >
                Remove Taxi
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taxis.map((taxi) => {
              const isSelected = selectedTaxi?.route.id === taxi.id;
              return (
                <div
                  key={taxi.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/40 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-cyan-400" />
                        <h4 className="font-bold text-white text-sm">Pune ➔ {taxi.tourismSpot}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">{taxi.distanceFromPune}</span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Best Travel Option: <span className="text-cyan-300 font-semibold">{taxi.bestTravelOption}</span>
                    </div>

                    {/* Vehicle Type Picker (if selected) */}
                    {isSelected && (
                      <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                        {(['EV Cab', 'Sedan', 'SUV'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setSelectedTaxi({ ...selectedTaxi, vehicleType: type })}
                            className={`py-1 rounded-lg border transition-all ${
                              selectedTaxi.vehicleType === type 
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black' 
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Approx. Transit Fare</span>
                      <span className="font-bold text-cyan-300 text-xs">{taxi.approxTaxiFare}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (isSelected) setSelectedTaxi(null);
                        else setSelectedTaxi({ route: taxi, vehicleType: 'EV Cab', date: travelDate });
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        isSelected 
                          ? 'bg-cyan-500 text-slate-950' 
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : '+ Book Taxi'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-300 font-semibold">
              Selected Taxi: <span className="text-cyan-400 font-bold">{selectedTaxi ? `Pune ➔ ${selectedTaxi.route.tourismSpot} (${selectedTaxi.vehicleType})` : 'None (Optional)'}</span>
            </span>
            <button
              onClick={() => handleSetTab('guides')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all"
            >
              <span>Next: Tour Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: TOUR GUIDES (OPTIONAL) */}
      {/* ========================================================================= */}
      {activeTab === 'guides' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">Hire Certified Tour Guides (Optional)</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Licensed multilingual guides verified by regional tourism boards.
              </p>
            </div>
            {selectedGuide && (
              <button
                onClick={() => setSelectedGuide(null)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold"
              >
                Remove Guide
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide) => {
              const isSelected = selectedGuide?.item.id === guide.id;
              const guideLanguages = (guide.languages && guide.languages.length > 0)
                ? guide.languages 
                : ['English', 'Hindi', 'Marathi'];
              const guideDisplayName = guide.guideName || guide.name || 'Certified Heritage Guide';
              const approxPrice = guide.approxGuidePrice || guide.approxPrice || `₹${guide.priceINR || guide.priceInr || 500}/day`;

              return (
                <div
                  key={guide.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/40 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        <h4 className="font-bold text-white text-sm">{guideDisplayName}</h4>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{guide.rating || 4.8}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Destination: <span className="text-slate-200 font-semibold">{guide.tourismSpot}</span>
                    </div>

                    {guide.specialization && (
                      <div className="text-[11px] text-blue-300/90 bg-blue-950/40 border border-blue-900/50 rounded-lg p-1.5">
                        🎯 <span className="italic">{guide.specialization}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {guideLanguages.map((lang, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] border border-slate-800">
                          🗣️ {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Approx. Guide Fee</span>
                      <span className="font-bold text-blue-300 text-xs">{approxPrice}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (isSelected) setSelectedGuide(null);
                        else setSelectedGuide({ item: guide, days: 1 });
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        isSelected 
                          ? 'bg-blue-500 text-slate-950' 
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Assigned' : '+ Hire Guide'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-300 font-semibold">
              Selected Guide: <span className="text-blue-400 font-bold">{selectedGuide ? (selectedGuide.item.guideName || selectedGuide.item.name) : 'None (Optional)'}</span>
            </span>
            <button
              onClick={() => handleSetTab('summary')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all"
            >
              <span>Review & Make Booking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: BOOKING SUMMARY & REVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Custom Tour Booking & Facilities Summary</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review your selected tourism spots and optional facilities before generating your digital travel pass.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                {formattedSelectedDate} • {travelersCount} Travelers
              </span>
            </div>

            {/* Selected Items Breakdown Table */}
            <div className="space-y-3">
              {/* 1. Spots */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <MapPin className="w-4 h-4" />
                    <span>Tourism Spots ({selectedSpots.length})</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Itinerary Confirmed
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSpots.map(s => (
                    <span key={s.id} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 text-xs border border-slate-800 flex items-center space-x-1">
                      <span>{s.name} ({s.city})</span>
                      <button onClick={() => handleToggleSpot(s)} className="text-slate-500 hover:text-rose-400 ml-1">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 2. Hotel */}
              {selectedHotel && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-teal-400 font-bold">
                    <Hotel className="w-4 h-4" />
                    <div>
                      <div>{selectedHotel.item.hotelName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Near {selectedHotel.item.tourismSpot} • {selectedHotel.rooms} Room × {selectedHotel.nights} Night
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-500/30">
                    Stay Reserved
                  </span>
                </div>
              )}

              {/* 3. Dining */}
              {selectedRestaurants.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-amber-400 font-bold">
                    <div className="flex items-center space-x-2">
                      <Utensils className="w-4 h-4" />
                      <span>Dining ({selectedRestaurants.length})</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Table Scheduled
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRestaurants.map(r => (
                      <span key={r.item.id} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 text-xs border border-slate-800">
                        {r.item.restaurantName} ({r.item.cuisine})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Activities */}
              {selectedActivities.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-purple-400 font-bold">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Activities ({selectedActivities.length})</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                      Pass Included
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedActivities.map(a => (
                      <span key={a.item.id} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 text-xs border border-slate-800">
                        {a.item.entertainmentPlace}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Taxi */}
              {selectedTaxi && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                    <Car className="w-4 h-4" />
                    <div>
                      <div>Pune ➔ {selectedTaxi.route.tourismSpot} ({selectedTaxi.vehicleType})</div>
                      <div className="text-[10px] text-slate-400 font-normal">Dedicated Sightseeing Transit</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Cab Dispatched
                  </span>
                </div>
              )}

              {/* 6. Guide */}
              {selectedGuide && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-blue-400 font-bold">
                    <UserCheck className="w-4 h-4" />
                    <div>
                      <div>{selectedGuide.item.guideName} ({selectedGuide.item.tourismSpot})</div>
                      <div className="text-[10px] text-slate-400 font-normal">Languages: {selectedGuide.item.languages.join(', ')}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                    Guide Assigned
                  </span>
                </div>
              )}
            </div>

            {/* Total Facilities Confirmation & Action */}
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Unified Digital Pass</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
                  {selectedSpots.length} Spot{selectedSpots.length !== 1 ? 's' : ''} & Facilities Ready
                </div>
                <span className="text-[11px] text-slate-400">Includes QR pass, booking guarantees, verified providers & SOS 24/7 coverage.</span>
              </div>

              <button
                onClick={handleProceedToBooking}
                className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2"
              >
                <span>Make Booking & Generate Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
