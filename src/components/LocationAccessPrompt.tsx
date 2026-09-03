import React, { useState, useEffect } from 'react';
import {
  MapPin, Navigation, ShieldCheck, CloudSun, ShieldAlert, Sparkles,
  CheckCircle2, AlertTriangle, X, ChevronRight, RefreshCw, Compass, Power, ToggleLeft, ToggleRight
} from 'lucide-react';

interface LocationAccessPromptProps {
  locationStatus: 'prompt' | 'granted' | 'denied' | 'locating';
  isLocationEnabled: boolean;
  detectedCity?: string;
  detectedCoords?: { lat: number; lng: number } | null;
  onToggleSwitch: (enable: boolean) => void;
  onRequestLocation: () => void;
  onDismiss?: () => void;
}

export const LocationAccessPrompt: React.FC<LocationAccessPromptProps> = ({
  locationStatus,
  isLocationEnabled,
  detectedCity,
  detectedCoords,
  onToggleSwitch,
  onRequestLocation,
  onDismiss
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-minimize after location is switched on and verified
  useEffect(() => {
    if (locationStatus === 'granted' && isLocationEnabled) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [locationStatus, isLocationEnabled]);

  if (isDismissed) return null;

  // Minimized pill state
  if (isMinimized && locationStatus === 'granted') {
    return (
      <div className="fixed bottom-20 left-4 z-40 animate-fade-in">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs shadow-xl backdrop-blur-md transition-all hover:scale-105"
          title="Click to manage location settings"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold">GPS: {detectedCity || 'Active'}</span>
          <span className="text-[10px] text-emerald-400/80 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">ON</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounce-in">
      <div className="bg-slate-900/95 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl space-y-4 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => {
            if (locationStatus === 'granted') {
              setIsMinimized(true);
            } else {
              setIsDismissed(true);
              if (onDismiss) onDismiss();
            }
          }}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors z-10"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-3.5 pr-6">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${isLocationEnabled && locationStatus === 'granted'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : locationStatus === 'locating'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
            <MapPin className={`w-5 h-5 ${locationStatus === 'locating' ? 'animate-spin-slow' : ''}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm sm:text-base text-white font-display">
                {isLocationEnabled && locationStatus === 'granted'
                  ? '📍 Location Switched ON'
                  : locationStatus === 'locating'
                    ? '📡 Connecting Device GPS...'
                    : 'Switch ON Location Access'}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isLocationEnabled && locationStatus === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                {isLocationEnabled && locationStatus === 'granted' ? 'LIVE' : 'OPTIONAL'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {isLocationEnabled && locationStatus === 'granted'
                ? `Active for ${detectedCity || 'your current city'}. Live weather, SOS police sync, and nearest spots are active.`
                : 'Would you like to switch ON device location? It enables real-time weather adaptation, emergency SOS dispatch, and nearby verified spots & cabs.'}
            </p>
          </div>
        </div>

        {/* Interactive Toggle Switch Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Power className={`w-4 h-4 ${isLocationEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-xs font-bold text-white">Device GPS Location</div>
              <div className="text-[10px] text-slate-400">
                {isLocationEnabled ? (detectedCity || 'Active') : 'Currently Switched OFF'}
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => onToggleSwitch(!isLocationEnabled)}
            className={`w-13 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${isLocationEnabled ? 'bg-emerald-500 justify-end shadow-lg shadow-emerald-500/30' : 'bg-slate-800 justify-start'
              }`}
            title={isLocationEnabled ? 'Click to turn OFF location' : 'Click to turn ON location'}
          >
            <span className="text-[9px] font-bold px-1 text-slate-950 select-none">
              {isLocationEnabled ? 'ON' : ''}
            </span>
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${isLocationEnabled ? 'bg-slate-950' : 'bg-slate-400'
              }`} />
            <span className="text-[9px] font-bold px-1 text-slate-400 select-none">
              {!isLocationEnabled ? 'OFF' : ''}
            </span>
          </button>
        </div>

        {/* Benefits Grid (when OFF) */}
        {!isLocationEnabled && (
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center space-x-1.5">
              <CloudSun className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Live Weather & Monsoon</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>1-Click SOS Dispatch</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Nearest Heritage Spots</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
              <span>EV Taxi & Stay Proximity</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-1 flex items-center space-x-2">
          {isLocationEnabled && locationStatus === 'granted' ? (
            <div className="w-full flex items-center justify-between text-xs text-slate-400 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">Active: {detectedCity || 'Connected'}</span>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-slate-300 hover:text-white font-semibold text-[11px] underline ml-2 flex-shrink-0"
              >
                Minimize
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onToggleSwitch(true)}
                disabled={locationStatus === 'locating'}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {locationStatus === 'locating' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Power className="w-3.5 h-3.5 text-slate-950" />
                    <span>Switch ON Location</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDismissed(true);
                  if (onDismiss) onDismiss();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                title="Continue with default city without GPS"
              >
                Use Default (Pune)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};