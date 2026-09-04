import React, { useState } from 'react';
import {
  MapPin, Navigation, CloudSun, ShieldAlert, Compass, ShieldCheck,
  RefreshCw, Power, X, ChevronRight, Zap
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

  // If location is already ON and granted, do NOT show any box or modal
  if (isLocationEnabled && locationStatus === 'granted') {
    return null;
  }

  // If explicitly dismissed by the user for this session, do not show
  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  const handleEnableLocation = () => {
    if (onRequestLocation) {
      onRequestLocation();
    } else {
      onToggleSwitch(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl shadow-emerald-500/10 space-y-5 relative overflow-hidden">
        {/* Glow decorative backdrops */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close / Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors z-10"
          title="Continue without GPS (Use Default City)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start space-x-4 pr-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Navigation className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                Switch ON Device Location
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                RECOMMENDED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Enable your device GPS to activate real-time weather alerts, proximity-based heritage circuits, local EV cabs, and instant emergency SOS dispatch.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-start space-x-2">
            <CloudSun className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white text-[11px]">Live Weather Sync</div>
              <div className="text-[10px] text-slate-400">Rain & Monsoon AI alerts</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white text-[11px]">1-Click Police SOS</div>
              <div className="text-[10px] text-slate-400">Instant live coords dispatch</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Compass className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white text-[11px]">Nearest Spots</div>
              <div className="text-[10px] text-slate-400">Proximity-based tourism</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white text-[11px]">EV Cabs & Stays</div>
              <div className="text-[10px] text-slate-400">Verified nearby providers</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleEnableLocation}
            disabled={locationStatus === 'locating'}
            className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {locationStatus === 'locating' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Connecting Device GPS...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Switch ON Device Location</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer text-center"
          >
            Use Default (Pune)
          </button>
        </div>
      </div>
    </div>
  );
};