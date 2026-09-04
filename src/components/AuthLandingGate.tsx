import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Mail, Lock, User, Phone, ArrowRight, Sparkles, Compass, 
  Store, Building2, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, 
  MapPin, ShieldAlert, Zap, Globe, Award, Navigation, Briefcase, Hotel, Utensils, Car, UserCheck
} from 'lucide-react';
import { signUpWithFirebase, signInWithFirebase, formatFirebaseAuthError, firebaseConfig } from '../firebase';
import { UserAuth } from '../types';
import { useLocationManager } from '../hooks/useLocationManager';
import { LocationAccessPrompt } from './LocationAccessPrompt';
import { 
  MASTER_TOURIST_SPOTS, MASTER_HOTELS, MASTER_RESTAURANTS, 
  MASTER_ENTERTAINMENTS, MASTER_GUIDES 
} from '../data/mockTourismData';

interface AuthLandingGateProps {
  onAuthenticated: (user: UserAuth) => void;
}

export const AuthLandingGate: React.FC<AuthLandingGateProps> = ({ onAuthenticated }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'tourist' | 'provider' | 'admin'>('tourist');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Service Provider 2-tier Dropdown States
  const [providerCategory, setProviderCategory] = useState<'tourism_spots' | 'hotels' | 'foods' | 'activities' | 'taxis' | 'guides'>('hotels');
  const [providerName, setProviderName] = useState<string>('Shantai Hotel');
  const [isCustomProviderName, setIsCustomProviderName] = useState(false);
  const [customProviderName, setCustomProviderName] = useState('');

  // Dynamically compute related service provider names for Dropdown 2
  const providerNamesList = useMemo(() => {
    switch (providerCategory) {
      case 'tourism_spots':
        return MASTER_TOURIST_SPOTS.map(s => `${s.name} (${s.city})`);
      case 'hotels':
        return MASTER_HOTELS.map(h => `${h.hotelName} (Near ${h.tourismSpot})`);
      case 'foods':
        return MASTER_RESTAURANTS.map(r => `${r.restaurantName} - ${r.cuisine}`);
      case 'activities':
        return MASTER_ENTERTAINMENTS.map(e => `${e.entertainmentPlace} (${e.tourismSpot})`);
      case 'taxis':
        return [
          'GreenRide EV Cab Fleet Pune (Tata Nexon EV Max)',
          'Sahyadri Mountain Transit EV Chauffeur Service',
          'Pune-Lonavala Express EV Cab Fleet',
          'Heritage Old City Electric Auto & Cab Fleet',
          'Western Ghats Eco-Tour Cab Service',
          'Imagicaa Theme Park Express Shuttle Cab'
        ];
      case 'guides':
        return MASTER_GUIDES.map(g => `${g.guideName} (${g.tourismSpot})`);
      default:
        return [];
    }
  }, [providerCategory]);

  const handleCategoryChange = (newCategory: 'tourism_spots' | 'hotels' | 'foods' | 'activities' | 'taxis' | 'guides') => {
    setProviderCategory(newCategory);
    setIsCustomProviderName(false);
    let defaultFirst = '';
    if (newCategory === 'tourism_spots') defaultFirst = `${MASTER_TOURIST_SPOTS[0]?.name} (${MASTER_TOURIST_SPOTS[0]?.city})`;
    else if (newCategory === 'hotels') defaultFirst = `${MASTER_HOTELS[0]?.hotelName} (Near ${MASTER_HOTELS[0]?.tourismSpot})`;
    else if (newCategory === 'foods') defaultFirst = `${MASTER_RESTAURANTS[0]?.restaurantName} - ${MASTER_RESTAURANTS[0]?.cuisine}`;
    else if (newCategory === 'activities') defaultFirst = `${MASTER_ENTERTAINMENTS[0]?.entertainmentPlace} (${MASTER_ENTERTAINMENTS[0]?.tourismSpot})`;
    else if (newCategory === 'taxis') defaultFirst = 'GreenRide EV Cab Fleet Pune (Tata Nexon EV Max)';
    else if (newCategory === 'guides') defaultFirst = `${MASTER_GUIDES[0]?.guideName} (${MASTER_GUIDES[0]?.tourismSpot})`;
    setProviderName(defaultFirst);
    if (isSignUp) setName(defaultFirst);
  };

  // Immediate GPS location manager on arrival
  const locationManager = useLocationManager('Pune, Maharashtra');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        let finalSignUpName = name.trim();
        if (role === 'provider') {
          finalSignUpName = isCustomProviderName ? customProviderName.trim() : providerName.trim();
        }
        if (!finalSignUpName) {
          throw new Error(`Please select or enter your ${role === 'provider' ? 'service provider name' : role === 'admin' ? 'official authority name' : 'full name'}.`);
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const user = await signUpWithFirebase(finalSignUpName, email, password, role, phone);
        if (role === 'provider') {
          user.name = finalSignUpName;
          user.providerType = providerCategory;
        }
        setSuccessMessage(`Account created for ${role.toUpperCase()}! Loading your dedicated portal...`);
        setTimeout(() => {
          onAuthenticated(user);
        }, 500);
      } else {
        const user = await signInWithFirebase(email, password);
        if (role === 'provider') {
          const finalProviderEntity = isCustomProviderName ? customProviderName.trim() : providerName.trim();
          if (finalProviderEntity) {
            user.name = finalProviderEntity;
            user.providerType = providerCategory;
          }
        }
        setSuccessMessage(`Welcome back! Loading your ${user.role?.toUpperCase() || role.toUpperCase()} interface...`);
        setTimeout(() => {
          onAuthenticated(user);
        }, 400);
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      const formatted = formatFirebaseAuthError(err);
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/configuration-not-found') {
        setErrorMessage(
          'Firebase Email/Password Auth is not yet toggled on in your Firebase console. (Firebase Console -> Authentication -> Sign-in method -> Enable Email/Password).'
        );
      } else {
        setErrorMessage(formatted);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Account Helper for instant Hackathon evaluation
  const handleQuickDemo = async (demoRole: 'tourist' | 'provider' | 'admin') => {
    setIsLoading(true);
    setErrorMessage(null);
    setRole(demoRole);
    const demoEmail = `${demoRole}.demo@tourmaster.in`;
    const demoPass = 'TourMaster2026!';
    const demoName = 
      demoRole === 'tourist' ? 'Aarav Sharma (Verified Tourist)' :
      demoRole === 'provider' ? 'Sahyadri Eco-Resorts & EV Fleet' :
      'Maharashtra Tourism Authority (Admin)';

    try {
      try {
        const user = await signInWithFirebase(demoEmail, demoPass);
        onAuthenticated(user);
        return;
      } catch (e: any) {
        if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
          const newUser = await signUpWithFirebase(demoName, demoEmail, demoPass, demoRole, '+91 98765 43210');
          onAuthenticated(newUser);
          return;
        }
        throw e;
      }
    } catch (err: any) {
      console.warn('Demo login fallback triggered:', err);
      const fallbackUser: UserAuth = {
        id: 'demo-' + demoRole + '-' + Date.now(),
        name: demoName,
        email: demoEmail,
        role: demoRole,
        phone: '+91 98765 43210',
        isAuthenticated: true
      };
      localStorage.setItem(`tourmaster_user_${fallbackUser.id}`, JSON.stringify(fallbackUser));
      onAuthenticated(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic theme & copy depending on selected role
  const getRoleCardDetails = () => {
    switch (role) {
      case 'provider':
        return {
          title: isSignUp ? 'Create Service Partner Account' : 'Sign In to Provider Portal',
          subtitle: 'Manage hotel stays, EV cabs, licensed guides, live bookings, pricing & KYC verification.',
          themeGradient: 'from-teal-500 to-cyan-500',
          badgeText: 'Service Provider Portal',
          nameLabel: 'Business / Company / Partner Name',
          namePlaceholder: 'e.g. Sahyadri Eco Stays & EV Fleets',
          emailPlaceholder: 'partner@resort.in or cab@fleet.in',
          btnText: isSignUp ? 'Register as Service Provider' : 'Sign In as Service Provider',
          btnBg: 'from-teal-500 to-cyan-400',
          roleColor: 'text-teal-400'
        };
      case 'admin':
        return {
          title: isSignUp ? 'Create Tourism Authority Account' : 'Sign In to Admin Command Center',
          subtitle: 'Access ministry advisories, verify service providers, redress grievances, and monitor SOS dispatch.',
          themeGradient: 'from-purple-500 to-rose-500',
          badgeText: 'Admin (Organisation) Portal',
          nameLabel: 'Authority / Department Name & Officer',
          namePlaceholder: 'e.g. Maharashtra Tourism Authority',
          emailPlaceholder: 'admin@tourmaster.in or officer@tourism.gov.in',
          btnText: isSignUp ? 'Register as Tourism Authority' : 'Sign In to Admin Center',
          btnBg: 'from-purple-600 to-rose-500',
          roleColor: 'text-purple-400'
        };
      case 'tourist':
      default:
        return {
          title: isSignUp ? 'Create Tourist Account' : 'Sign In to Tourist Hub',
          subtitle: 'Access AI Gemini 3.7 Eco-Planner, weather adaptation, verified spots, EV cabs & 1-click SOS safety.',
          themeGradient: 'from-emerald-500 to-teal-400',
          badgeText: 'Tourist Travel Portal',
          nameLabel: 'Full Name',
          namePlaceholder: 'e.g. Rahul Deshmukh',
          emailPlaceholder: 'tourist@example.com',
          btnText: isSignUp ? 'Register as Verified Tourist' : 'Sign In as Tourist',
          btnBg: 'from-emerald-500 to-teal-400',
          roleColor: 'text-emerald-400'
        };
    }
  };

  const cardDetails = getRoleCardDetails();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with SIH Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-emerald-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-xl tracking-tight text-white">
                TOUR<span className="text-emerald-400">MASTER</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                SIH 2026 • PS 26204
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Role-Based AI Tourism & Hospitality Ecosystem • AICTE Hackathon
            </p>
          </div>
        </div>

        {/* Header Badges: Direct GPS Indicator & Firebase */}
        <div className="flex items-center space-x-2">
          {locationManager.isLocationEnabled && locationManager.status === 'granted' ? (
            <button
              type="button"
              onClick={() => locationManager.toggleLocationSwitch(false)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs bg-emerald-950/70 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 shadow-md transition-all cursor-pointer"
              title="Live GPS Location is ON. Click to Switch OFF."
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold tracking-tight">GPS: ON</span>
              <span className="text-slate-300 text-[11px] max-w-[120px] truncate hidden xs:inline">
                ({locationManager.city})
              </span>
            </button>
          ) : locationManager.status === 'locating' ? (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs bg-slate-900/90 border border-cyan-500/40 text-cyan-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-semibold">GPS: Locating...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => locationManager.requestLocation()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer"
              title="Click to Switch ON device GPS location"
            >
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold">GPS: OFF</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Turn ON
              </span>
            </button>
          )}

          {/* Connected Firebase indicator */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-[11px]">Firebase:</span>
            <span className="text-emerald-300 font-mono text-[11px] font-semibold">{firebaseConfig.projectId}</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Gate Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Value Proposition & 3 Dedicated Interfaces Overview (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3 Dedicated Role-Based Portals</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
                Sign In to Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Dedicated Portal</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                TourMaster provides completely separate, dedicated interfaces for <strong>Tourists</strong>, <strong>Service Providers</strong>, and <strong>Admin Organisations</strong>. Select your role to sign in or register.
              </p>
            </div>

            {/* Switch ON Device Location First Banner */}
            {!locationManager.isLocationEnabled && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-3 text-xs shadow-lg shadow-emerald-500/10 animate-fade-in">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">📍 Step 1: Switch ON Location</div>
                    <div className="text-[10px] text-slate-300">Enables live satellite weather & nearest heritage facilities</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => locationManager.requestLocation()}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-bold text-xs flex-shrink-0 shadow-md transition-all cursor-pointer"
                >
                  Switch ON
                </button>
              </div>
            )}

            {/* 3 Dedicated Role Visual Cards */}
            <div className="space-y-2.5 pt-1">
              {/* Role 1: Tourist */}
              <div 
                onClick={() => { setRole('tourist'); setErrorMessage(null); }}
                className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  role === 'tourist'
                    ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white">1. Tourist Portal</div>
                    {role === 'tourist' && <span className="text-[10px] font-bold text-emerald-400">Selected</span>}
                  </div>
                  <div className="text-[11px] text-slate-400">AI Eco-Planner, weather adaptation, verified spots, EV cabs & SOS safety.</div>
                </div>
              </div>

              {/* Role 2: Provider */}
              <div 
                onClick={() => { setRole('provider'); setErrorMessage(null); }}
                className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  role === 'provider'
                    ? 'bg-teal-500/10 border-teal-500 ring-2 ring-teal-500/30 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white">2. Service Provider Hub</div>
                    {role === 'provider' && <span className="text-[10px] font-bold text-teal-400">Selected</span>}
                  </div>
                  <div className="text-[11px] text-slate-400">Manage hotels, EV cabs, guides, eateries, live slot availability & bookings.</div>
                </div>
              </div>

              {/* Role 3: Admin */}
              <div 
                onClick={() => { setRole('admin'); setErrorMessage(null); }}
                className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  role === 'admin'
                    ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white">3. Admin (Organisation) Center</div>
                    {role === 'admin' && <span className="text-[10px] font-bold text-purple-400">Selected</span>}
                  </div>
                  <div className="text-[11px] text-slate-400">Broadcast advisories, provider approvals, grievance redressal & journey DB.</div>
                </div>
              </div>
            </div>

            {/* Quick Demo Evaluation Triggers */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Hackathon 1-Click Login:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('tourist')}
                  className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold text-center transition-all"
                >
                  🚀 Tourist Interface
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('provider')}
                  className="px-2 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold text-center transition-all"
                >
                  🏨 Provider Interface
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="px-2 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold text-center transition-all"
                >
                  🏛️ Admin Interface
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Sign Up / Sign In Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 relative">
              
              {/* Card Header & Tabs */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="space-y-0.5">
                  <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                    {cardDetails.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {cardDetails.subtitle}
                  </p>
                </div>

                {/* Sign Up / Sign In Toggle Pill */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 flex-shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMessage(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      !isSignUp
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMessage(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSignUp
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* 3 Role Selection Selector Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Choose Account Role</span>
                  <span className="text-[10px] text-slate-500 font-normal">Dedicated portal unlocks on login</span>
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => { setRole('tourist'); setErrorMessage(null); }}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                      role === 'tourist'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Tourist</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('provider'); setErrorMessage(null); }}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                      role === 'provider'
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Provider</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('admin'); setErrorMessage(null); }}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                      role === 'admin'
                        ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Status & Error Messages */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>{successMessage}</div>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {isSignUp && role !== 'provider' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {cardDetails.nameLabel} <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder={cardDetails.namePlaceholder}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder={cardDetails.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={isSignUp ? 'Create a password (min 6 characters)' : '••••••••'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* SERVICE PROVIDER MANDATORY 2-TIER DROPDOWNS (After Email & Password) */}
                {role === 'provider' && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-3 shadow-inner animate-fade-in">
                    <div className="flex items-center space-x-1.5 text-teal-400 font-bold text-xs pb-1 border-b border-slate-800">
                      <Store className="w-3.5 h-3.5" />
                      <span>Service Provider Classification & Facility</span>
                    </div>

                    {/* 1st Dropdown: Service Provider Type */}
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                        1. Service Provider Type <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={providerCategory}
                        onChange={(e) => handleCategoryChange(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        <option value="tourism_spots" className="bg-slate-950">📍 Tourism Spots</option>
                        <option value="hotels" className="bg-slate-950">🏨 Hotels</option>
                        <option value="foods" className="bg-slate-950">🍽️ Foods</option>
                        <option value="activities" className="bg-slate-950">🎡 Activities</option>
                        <option value="taxis" className="bg-slate-950">🚕 Taxis</option>
                        <option value="guides" className="bg-slate-950">🧑‍💼 Guides</option>
                      </select>
                    </div>

                    {/* 2nd Dropdown: Related Service Provider Name */}
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                        2. Related Service Provider Name <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={isCustomProviderName ? '__custom__' : providerName}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsCustomProviderName(true);
                            setProviderName(customProviderName || '');
                          } else {
                            setIsCustomProviderName(false);
                            setProviderName(e.target.value);
                            if (isSignUp) setName(e.target.value);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        {providerNamesList.map((pName) => (
                          <option key={pName} value={pName} className="bg-slate-950 text-white">
                            {pName}
                          </option>
                        ))}
                        <option value="__custom__" className="bg-slate-950 text-teal-300 font-bold">
                          ➕ Other / Register Custom Business Name...
                        </option>
                      </select>

                      {/* Custom write-in input if selected 'Other' */}
                      {isCustomProviderName && (
                        <div className="mt-2 animate-fade-in">
                          <input
                            type="text"
                            required
                            placeholder="Enter your exact business / facility name"
                            value={customProviderName}
                            onChange={(e) => {
                              setCustomProviderName(e.target.value);
                              setProviderName(e.target.value);
                              if (isSignUp) setName(e.target.value);
                            }}
                            className="w-full bg-slate-900 border border-teal-500/60 rounded-xl px-3 py-2 text-white font-semibold text-xs placeholder-slate-500 focus:outline-none focus:border-teal-400"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isSignUp && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Phone / Contact Number <span className="text-slate-500 font-normal">({role === 'provider' ? 'for guest bookings' : role === 'admin' ? 'official contact' : 'for SOS & SMS'})</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full mt-2 py-3 bg-gradient-to-r ${cardDetails.btnBg} hover:brightness-110 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating with Firebase...</span>
                    </div>
                  ) : (
                    <>
                      <span>{cardDetails.btnText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Switcher */}
              <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
                {isSignUp ? 'Already registered for this portal? ' : "Need a new account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMessage(null);
                  }}
                  className="text-emerald-400 font-bold hover:underline ml-1"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up Free'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Interactive Location Access Prompt (asks user to switch ON first) */}
      <LocationAccessPrompt
        locationStatus={locationManager.status}
        isLocationEnabled={locationManager.isLocationEnabled}
        detectedCity={locationManager.city}
        detectedCoords={locationManager.coords}
        onToggleSwitch={locationManager.toggleLocationSwitch}
        onRequestLocation={locationManager.requestLocation}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-400 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TourMaster AI Ecosystem • Ministry of Tourism & AICTE</span>
          <span className="text-slate-400">Dedicated Portals: Tourist Hub • Provider Hub • Admin Control Center</span>
        </div>
      </footer>
    </div>
  );
};
