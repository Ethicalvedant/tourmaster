import React, { useState, useMemo } from 'react';
import { ShieldCheck, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, AlertCircle, Sparkles, X, Eye, EyeOff, Store } from 'lucide-react';
import { signUpWithFirebase, signInWithFirebase, formatFirebaseAuthError } from '../firebase';
import { UserAuth } from '../types';
import { 
  MASTER_TOURIST_SPOTS, MASTER_HOTELS, MASTER_RESTAURANTS, 
  MASTER_ENTERTAINMENTS, MASTER_GUIDES 
} from '../data/mockTourismData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAuth) => void;
  initialRole?: 'tourist' | 'provider' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'tourist'
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'tourist' | 'provider' | 'admin'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        let finalSignUpName = name.trim();
        if (role === 'provider') {
          finalSignUpName = isCustomProviderName ? customProviderName.trim() : providerName.trim();
        }
        if (!finalSignUpName) throw new Error('Please select or enter your name / business name');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        const user = await signUpWithFirebase(finalSignUpName, email, password, role, phone);
        if (role === 'provider') {
          user.name = finalSignUpName;
          user.providerType = providerCategory;
        }
        onLoginSuccess(user);
        onClose();
      } else {
        const user = await signInWithFirebase(email, password);
        if (role === 'provider') {
          const finalProviderEntity = isCustomProviderName ? customProviderName.trim() : providerName.trim();
          if (finalProviderEntity) {
            user.name = finalProviderEntity;
            user.providerType = providerCategory;
          }
        }
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      console.error('AuthModal error:', err);
      setErrorMessage(formatFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-display text-white">
            {isSignUp ? 'Create TourMaster Account' : 'Sign In to TourMaster'}
          </h3>
          <p className="text-xs text-slate-400">
            Firebase-Secured Authentication for Tourists, Service Providers & Admins
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          {[
            { id: 'tourist', label: 'Tourist' },
            { id: 'provider', label: 'Provider' },
            { id: 'admin', label: 'Admin (Org)' }
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setRole(r.id as any);
                if (r.id === 'provider' && isSignUp) setName(providerName);
                else setName('');
              }}
              className={`py-1.5 rounded-xl transition-all ${
                role === r.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isSignUp && role !== 'provider' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Deshmukh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-9 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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

          {role === 'provider' && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-2.5 shadow-inner">
              <div className="flex items-center space-x-1.5 text-teal-400 font-bold text-xs pb-1 border-b border-slate-800">
                <Store className="w-3.5 h-3.5" />
                <span>Service Provider Classification & Entity</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  1. Service Provider Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={providerCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="tourism_spots" className="bg-slate-950">📍 Tourism Spots</option>
                  <option value="hotels" className="bg-slate-950">🏨 Hotels</option>
                  <option value="foods" className="bg-slate-950">🍽️ Foods</option>
                  <option value="activities" className="bg-slate-950">🎡 Activities</option>
                  <option value="taxis" className="bg-slate-950">🚕 Taxis</option>
                  <option value="guides" className="bg-slate-950">🧑‍💼 Guides</option>
                </select>
              </div>

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
                  className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer"
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
                      className="w-full bg-slate-900 border border-teal-500/60 rounded-xl px-2.5 py-1.5 text-white font-semibold text-xs placeholder-slate-500 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="text-emerald-400 font-bold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
