import React, { useState, useEffect } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { AITourGuideAssistant } from './components/TouristHub/AITourGuideAssistant';
import { GlobalWakeListenerPill } from './components/TouristHub/GlobalWakeListenerPill';
import { EmergencySOSModal } from './components/TouristHub/EmergencySOSModal';
import { BookingCheckoutModal } from './components/TouristHub/BookingCheckoutModal';
import { TouristFacilityBookingSection } from './components/TouristHub/TouristFacilityBookingSection';
import { TouristBookingsActivityDrawer } from './components/TouristHub/TouristBookingsActivityDrawer';
import { AuthModal } from './components/AuthModal';
import { AuthLandingGate } from './components/AuthLandingGate';
import { LocationAccessPrompt } from './components/LocationAccessPrompt';
import { ProviderDashboard } from './components/ProviderPortal/ProviderDashboard';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';
import { SIHPresentationView } from './components/SIHArchitectureExplorer/SIHPresentationView';
import { Itinerary, TripPreferences, PortalMode, OrganisationAdvisory, UserAuth } from './types';
import { DEFAULT_INITIAL_ITINERARY, INITIAL_ORGANISATION_ADVISORIES } from './data/mockTourismData';
import { subscribeToAuth, signOutWithFirebase } from './firebase';
import { useLocationManager } from './hooks/useLocationManager';
import { Sparkles, Bot, ShieldAlert, Compass, MapPin, IndianRupee, Store, Building2, ArrowRight, Ticket, Hotel, Utensils, Car, UserCheck, Landmark } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<PortalMode>('tourist');
  const [itinerary, setItinerary] = useState<Itinerary>(DEFAULT_INITIAL_ITINERARY);
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isTourGuideOpen, setIsTourGuideOpen] = useState(false);
  const [tourGuidePrompt, setTourGuidePrompt] = useState<string | undefined>(undefined);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userAuth, setUserAuth] = useState<UserAuth | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [liveWeather, setLiveWeather] = useState<any>(null);
  const [advisories, setAdvisories] = useState<OrganisationAdvisory[]>(INITIAL_ORGANISATION_ADVISORIES);
  const [dismissAdvisory, setDismissAdvisory] = useState(false);
  const [bookingSectionTab, setBookingSectionTab] = useState<'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary'>('spots');
  const [customCheckoutDetails, setCustomCheckoutDetails] = useState<any>(null);

  const handleNavigateToBooking = (category: 'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary' = 'spots') => {
    setBookingSectionTab(category);
    setIsTourGuideOpen(false);
    setTimeout(() => {
      const el = document.getElementById('select-spots-stays-food-taxis-guides-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-4', 'ring-emerald-400', 'transition-all', 'duration-500');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-emerald-400');
        }, 2500);
      }
    }, 120);
  };

  // Global immediate Location Manager (prompts on arrival for tourist/provider/admin)
  const locationManager = useLocationManager(itinerary.destination);

  // Sync detected location weather
  useEffect(() => {
    if (locationManager.weather && !liveWeather) {
      setLiveWeather(locationManager.weather);
      if (locationManager.weather.isRainy) {
        handleAdaptWeather('Rain');
      }
    }
  }, [locationManager.weather]);

  // Subscribe to Firebase Auth changes in real-time with safety timeout
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUserAuth(user);
      setIsCheckingAuth(false);
    });

    // Safety timeout: force exit loading screen after 5 seconds
    const timeoutId = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  // Fetch live advisories from backend (non-blocking)
  useEffect(() => {
    fetch('/api/advisories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAdvisories(data);
        }
      })
      .catch(() => { });
  }, []);

  // Generate Itinerary API integration
  const handleGenerateItinerary = async (prefs: TripPreferences) => {
    setIsLoadingItinerary(true);

    try {
      const res = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      if (!res.ok) {
        throw new Error('Failed to generate plan');
      }

      const data: Itinerary = await res.json();
      setItinerary(data);
    } catch (err) {
      console.warn('API error, using responsive client fallback:', err);
      const daysCount = prefs.durationDays || prefs.days || 2;
      const budgetAmount = prefs.budgetINR || prefs.budget || 15000;
      const budgetObj = {
        ...DEFAULT_INITIAL_ITINERARY.budgetBreakdown,
        targetBudget: budgetAmount,
        totalEstimated: Math.round(budgetAmount * 0.92),
        isWithinBudget: true,
        variancePercentage: 8,
      };
      const fallback: Itinerary = {
        ...DEFAULT_INITIAL_ITINERARY,
        id: 'itin-' + Date.now(),
        destination: prefs.destination,
        title: `${prefs.destination} Eco-Heritage Cultural Voyage`,
        durationDays: daysCount,
        budget: budgetObj,
        budgetBreakdown: budgetObj,
      };
      setItinerary(fallback);
    } finally {
      setIsLoadingItinerary(false);
    }
  };

  // Weather Adaptation simulation
  const handleAdaptWeather = async (condition: 'Rain' | 'Sunny') => {
    try {
      const res = await fetch('/api/ai/adapt-weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary: itinerary,
          newWeatherCondition: condition,
        }),
      });
      const data = await res.json();
      if (data.adaptedItinerary) {
        setItinerary(data.adaptedItinerary);
      }
    } catch (e) {
      console.error('Weather adaptation error:', e);
    }
  };

  const handleOpenTourGuideWithPrompt = (prompt?: string) => {
    setTourGuidePrompt(prompt);
    setIsTourGuideOpen(true);
  };

  const role = userAuth?.role || 'tourist';
  const activeAdvisory = advisories.find((a) => a.active);

  // Sync active tab with user's role on login
  useEffect(() => {
    if (userAuth?.role) {
      if (userAuth.role === 'provider') setActiveTab('provider');
      else if (userAuth.role === 'admin') setActiveTab('admin');
      else setActiveTab('tourist');
    }
  }, [userAuth?.role]);

  // Authentication Loading Splash Screen
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4 selection:bg-emerald-500 selection:text-slate-950">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 flex items-center justify-center animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Compass className="w-7 h-7 text-emerald-400 animate-spin-slow" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold font-display text-white">TOURMASTER AI</h2>
          <p className="text-xs text-slate-400">Verifying secure Firebase authentication...</p>
        </div>
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Mandatory Authentication Gate: require user to sign up or sign in before accessing platform
  if (!userAuth) {
    return (
      <AuthLandingGate
        onAuthenticated={(user) => {
          setUserAuth(user);
          if (user.role) setActiveTab(user.role as any);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Role-Dedicated Top Navigation Header */}
      <HeaderNavbar
        currentMode={activeTab}
        onSelectMode={setActiveTab}
        onTriggerSOS={() => setIsSOSOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBookingsDrawer={() => setIsBookingsDrawerOpen(true)}
        onSignOut={async () => {
          await signOutWithFirebase();
          setUserAuth(null);
        }}
        userAuth={userAuth}
        currentCity={locationManager.city || liveWeather?.city || itinerary.destination}
        weatherTemp={locationManager.weather?.temp || liveWeather?.temp || '26°C'}
        weatherCondition={locationManager.weather?.condition || liveWeather?.condition || 'Pleasant'}
        isLocationEnabled={locationManager.isLocationEnabled}
        locationStatus={locationManager.status}
        onToggleLocation={locationManager.toggleLocationSwitch}
        onRequestLocation={locationManager.requestLocation}
      />

      {/* Main Content Area - Displays ONLY 1 Single Interface According to User Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ========================================================================= */}
        {/* 1. TOURIST INTERFACE (Visible ONLY to Signed-in Tourists) */}
        {/* ========================================================================= */}
        {role === 'tourist' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick AI Tour Booking Prompt & Category Shortcuts Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold flex-shrink-0">
                  <Ticket className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm font-display">
                      Tourism Tour Booking Studio
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Tourist Exclusive
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Select your Spots, Stays, Food, Taxis & Guides below for 1-click verified travel pass.
                  </p>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                <button
                  onClick={() => handleNavigateToBooking('spots')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-emerald-400 transition-all flex items-center space-x-1"
                >
                  <Landmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>Spots</span>
                </button>
                <button
                  onClick={() => handleNavigateToBooking('hotels')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-teal-500 hover:text-slate-950 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-teal-400 transition-all flex items-center space-x-1"
                >
                  <Hotel className="w-3.5 h-3.5 text-teal-400" />
                  <span>Stays</span>
                </button>
                <button
                  onClick={() => handleNavigateToBooking('restaurants')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-amber-400 transition-all flex items-center space-x-1"
                >
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  <span>Food</span>
                </button>
                <button
                  onClick={() => handleNavigateToBooking('taxis')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-cyan-400 transition-all flex items-center space-x-1"
                >
                  <Car className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Taxis</span>
                </button>
                <button
                  onClick={() => handleNavigateToBooking('guides')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-blue-500 hover:text-slate-950 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-blue-400 transition-all flex items-center space-x-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Guides</span>
                </button>
                <button
                  onClick={() => handleOpenTourGuideWithPrompt('I want to book a tourism tour (Spots, Stays, Food, Taxis & Guides)')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1"
                >
                  <Bot className="w-3.5 h-3.5 text-slate-950" />
                  <span>Ask TourMitra</span>
                </button>
              </div>
            </div>

            {/* Custom Trip & Facility Booking Section (Spots, Hotels, Food, Activities, Taxis, Guides) */}
            <TouristFacilityBookingSection
              detectedCity={locationManager.city || liveWeather?.city || 'Pune'}
              userCoords={locationManager.coords}
              isLocationEnabled={locationManager.isLocationEnabled}
              locationStatus={locationManager.status}
              onRequestLocation={locationManager.requestLocation}
              userAuth={userAuth}
              externalActiveTab={bookingSectionTab}
              onTabChange={setBookingSectionTab}
              onOpenCheckoutModal={(bookingPayload) => {
                setCustomCheckoutDetails(bookingPayload);
                setIsCheckoutOpen(true);
              }}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SERVICE PROVIDER INTERFACE (Visible ONLY to Signed-in Providers) */}
        {/* ========================================================================= */}
        {role === 'provider' && (
          <div className="animate-fade-in">
            <ProviderDashboard userAuth={userAuth} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. ADMIN (ORGANISATION) INTERFACE (Visible ONLY to Signed-in Admins) */}
        {/* ========================================================================= */}
        {role === 'admin' && (
          <div className="space-y-6 animate-fade-in">
            {/* Live Organisation Broadcast Advisory Ticker */}
            {activeAdvisory && !dismissAdvisory && (
              <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-950 border border-purple-800/50 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-lg animate-fade-in">
                <div className="flex items-center space-x-2.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping flex-shrink-0" />
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                    {activeAdvisory.severity.toUpperCase()} ADVISORY
                  </span>
                  <span className="font-bold text-white truncate">{activeAdvisory.title}:</span>
                  <span className="text-slate-300 hidden md:inline truncate">{activeAdvisory.message}</span>
                </div>
                <button
                  onClick={() => setDismissAdvisory(true)}
                  className="text-slate-500 hover:text-slate-300 text-xs px-1"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Render SIH presentation deck if toggled, otherwise Admin Command Center */}
            {activeTab === 'sih-explorer' ? <SIHPresentationView /> : <AdminDashboard />}
          </div>
        )}
      </main>

      {/* Floating Action Button for TourMitra AI (Tourist & Provider) */}
      {(role === 'tourist' || role === 'provider') && (
        <button
          onClick={() => handleOpenTourGuideWithPrompt()}
          id="floating-tour-guide-btn"
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center space-x-2 font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all border border-emerald-300"
          title="Open TourMitra AI Assistant"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span className="hidden sm:inline">Ask TourMitra AI</span>
        </button>
      )}

      {/* Porcupine Always-Listening Global Voice Wake Pill (for Tourist & Provider) */}
      {(role === 'tourist' || role === 'provider') && (
        <GlobalWakeListenerPill
          onWakeTriggered={(query) => handleOpenTourGuideWithPrompt(query)}
          destination={locationManager.city || liveWeather?.city || itinerary.destination}
          isAssistantOpen={isTourGuideOpen}
        />
      )}

      {/* Firebase-Secured Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setUserAuth(user);
          if (user.role) setActiveTab(user.role as any);
        }}
      />

      {/* Emergency SOS Modal Dialogue (for Tourist) */}
      {role === 'tourist' && (
        <EmergencySOSModal
          isOpen={isSOSOpen}
          onClose={() => setIsSOSOpen(false)}
          destination={itinerary.destination}
        />
      )}

      {/* AI Tour Guide Voice & Text Assistant Modal (for Tourist & Provider) */}
      {(role === 'tourist' || role === 'provider') && (
        <AITourGuideAssistant
          isOpen={isTourGuideOpen}
          onClose={() => {
            setIsTourGuideOpen(false);
            setTourGuidePrompt(undefined);
          }}
          destination={itinerary.destination}
          initialPrompt={tourGuidePrompt}
          onSelectBookingCategory={handleNavigateToBooking}
        />
      )}

      {/* Unified Booking Checkout & Pass Modal (for Tourist) */}
      {role === 'tourist' && (
        <BookingCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          destination={itinerary.destination}
          totalEstimated={itinerary.budget.totalEstimated}
          durationDays={itinerary.durationDays}
          userAuth={userAuth}
          customBookingDetails={customCheckoutDetails}
        />
      )}

      {/* Tourist Bookings & Real-Time Activity Command Center Drawer */}
      <TouristBookingsActivityDrawer
        isOpen={isBookingsDrawerOpen}
        onClose={() => setIsBookingsDrawerOpen(false)}
        userAuth={userAuth}
        currentCity={locationManager.city || liveWeather?.city || itinerary.destination}
        onTriggerSOS={() => {
          setIsBookingsDrawerOpen(false);
          setIsSOSOpen(true);
        }}
      />

      {/* Floating GPS Location Access Prompt & Live Indicator */}
      <LocationAccessPrompt
        locationStatus={locationManager.status}
        isLocationEnabled={locationManager.isLocationEnabled}
        detectedCity={locationManager.city}
        detectedCoords={locationManager.coords}
        onToggleSwitch={locationManager.toggleLocationSwitch}
        onRequestLocation={locationManager.requestLocation}
      />

      {/* Footer tailored to the active portal */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-white">TourMaster AI</span>
            <span>• Smart India Hackathon 2026 (PS ID: 26204 / AICTE)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {role === 'admin' 
              ? '🏛️ Tourism Authority Administration Center • Verified Access' 
              : role === 'provider' 
              ? '🏨 Verified Service Provider & Hospitality Dashboard' 
              : '🧭 Tourist AI Travel, Eco-Scoring & Safety Ecosystem'}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
