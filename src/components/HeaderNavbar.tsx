import React, { useState } from 'react';
import { 
  Compass, Store, Building2, Presentation, CloudSun, ShieldAlert, Sparkles, 
  UserCheck, LogOut, Shield, MapPin, CheckCircle2, User, ChevronDown, Menu
} from 'lucide-react';
import { PortalMode, UserAuth } from '../types';

interface HeaderNavbarProps {
  currentMode: PortalMode;
  onSelectMode?: (mode: PortalMode) => void;
  onTriggerSOS: () => void;
  onOpenDeck?: () => void;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onOpenBookingsDrawer?: () => void;
  userAuth?: UserAuth | null;
  currentCity: string;
  weatherTemp?: string;
  weatherCondition?: string;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentMode,
  onSelectMode,
  onTriggerSOS,
  onOpenDeck,
  onOpenAuth,
  onSignOut,
  onOpenBookingsDrawer,
  userAuth,
  currentCity,
  weatherTemp = '28°C',
  weatherCondition = 'Sunny',
}) => {
  const role = userAuth?.role || 'tourist';

  // Role-specific badge and subtitle metadata
  const getRoleBadge = () => {
    switch (role) {
      case 'provider':
        return {
          title: 'Service Provider Portal',
          subtitle: 'Hotels, Cabs, Guides & Bookings Hub',
          icon: Store,
          badgeText: 'Verified Partner',
          badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          themeColor: 'from-teal-500 to-cyan-500'
        };
      case 'admin':
        return {
          title: 'Admin Command Center',
          subtitle: 'Tourism Ministry & Authority Headquarters',
          icon: Building2,
          badgeText: 'Tourism Authority',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          themeColor: 'from-purple-500 to-rose-500'
        };
      case 'tourist':
      default:
        return {
          title: 'Tourist Hub',
          subtitle: 'AI Itineraries, Verified Stays & SOS Safety',
          icon: Compass,
          badgeText: 'Verified Tourist',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          themeColor: 'from-emerald-500 to-teal-500'
        };
    }
  };

  const roleMeta = getRoleBadge();
  const Icon = roleMeta.icon;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Dedicated Portal Header */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr ${roleMeta.themeColor} p-0.5 shadow-lg flex items-center justify-center`}>
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  role === 'admin' ? 'text-purple-400' : role === 'provider' ? 'text-teal-400' : 'text-emerald-400'
                }`} />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-white">
                  TOUR<span className={role === 'admin' ? 'text-purple-400' : role === 'provider' ? 'text-teal-400' : 'text-emerald-400'}>
                    MASTER
                  </span>
                </span>
                <span className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleMeta.badgeClass}`}>
                  {roleMeta.badgeText}
                </span>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  SIH 2026 • PS 26204
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                {roleMeta.title} • {roleMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Center Navigation Indicator: displays the active dedicated interface */}
          <div className="hidden lg:flex items-center px-4 py-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              role === 'admin' ? 'bg-purple-400' : role === 'provider' ? 'bg-teal-400' : 'bg-emerald-400'
            } animate-pulse`} />
            <span className="text-xs font-bold text-white tracking-wide">
              {role === 'admin' 
                ? '🏛️ Ministry & Org Control Interface' 
                : role === 'provider' 
                ? '🏨 Service Partner Command Hub' 
                : '🧭 Tourist AI & Exploration Interface'}
            </span>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            
            {/* Live Weather Widget */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
              <CloudSun className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className="text-left">
                <span className="text-slate-300 font-semibold">{currentCity}: </span>
                <span className={role === 'admin' ? 'text-purple-300 font-bold' : role === 'provider' ? 'text-teal-300 font-bold' : 'text-emerald-400 font-bold'}>
                  {weatherTemp}
                </span>
                <span className="text-slate-400 text-[10px] ml-1">({weatherCondition})</span>
              </div>
            </div>

            {/* Admin Presentation Deck Shortcut (visible in Admin view) */}
            {role === 'admin' && onSelectMode && (
              <button
                onClick={() => onSelectMode(currentMode === 'sih-explorer' ? 'admin' : 'sih-explorer')}
                className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  currentMode === 'sih-explorer'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="View SIH 2026 Presentation & System Architecture Deck"
              >
                <Presentation className="w-3.5 h-3.5 text-purple-400" />
                <span>{currentMode === 'sih-explorer' ? 'Back to Admin Center' : 'SIH Deck'}</span>
              </button>
            )}

            {/* Emergency SOS Button (for Tourists) */}
            {role === 'tourist' && (
              <button
                onClick={onTriggerSOS}
                id="sos-header-btn"
                className="flex items-center space-x-1.5 sm:space-x-2 bg-rose-600 hover:bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 animate-pulse"
                title="1-Click Emergency SOS & Tourist Police Dispatch"
              >
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="hidden xs:inline">SOS</span>
                <span>EMERGENCY</span>
              </button>
            )}

            {/* Burger Menu Button to view Tourist Bookings & Activity Data */}
            {onOpenBookingsDrawer && (
              <button
                onClick={onOpenBookingsDrawer}
                id="tourist-bookings-burger-btn"
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 hover:border-emerald-500 rounded-xl transition-all shadow-md group cursor-pointer"
                title="View All Tourist Bookings, Trips & Platform Activities"
              >
                <Menu className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-xs font-bold text-white">Bookings</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {/* User Profile Badge & Sign Out Button */}
            {userAuth ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs shadow-inner">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                      : role === 'provider' 
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {userAuth.name ? userAuth.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block text-left max-w-[130px]">
                    <div className="font-bold text-white leading-tight truncate">
                      {userAuth.name}
                    </div>
                    <div className={`text-[10px] font-semibold capitalize truncate ${
                      role === 'admin' ? 'text-purple-400' : role === 'provider' ? 'text-teal-400' : 'text-emerald-400'
                    }`}>
                      {role === 'admin' ? 'Tourism Authority' : role === 'provider' ? 'Service Partner' : 'Tourist'}
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-2 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 rounded-xl transition-all flex items-center space-x-1"
                    title="Sign Out of Account"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline text-xs font-semibold">Sign Out</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
