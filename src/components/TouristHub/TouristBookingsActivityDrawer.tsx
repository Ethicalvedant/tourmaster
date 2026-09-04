import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, MapPin, Hotel, Utensils, Sparkles, Car, UserCheck, 
  IndianRupee, CheckCircle2, Clock, AlertTriangle, ShieldCheck, 
  QrCode, Download, Share2, ArrowRight, ShieldAlert, FileText, 
  Activity, Compass, Layers, Check, Copy, ExternalLink, RefreshCw
} from 'lucide-react';
import { Booking, UserAuth } from '../../types';
import { INITIAL_BOOKINGS } from '../../data/mockTourismData';

interface TouristBookingsActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userAuth?: UserAuth | null;
  currentCity?: string;
  onTriggerSOS?: () => void;
}

export const TouristBookingsActivityDrawer: React.FC<TouristBookingsActivityDrawerProps> = ({
  isOpen,
  onClose,
  userAuth,
  currentCity = 'Pune',
  onTriggerSOS
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'activity' | 'pass'>('bookings');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Confirmed' | 'Pending Approval' | 'Completed' | 'Declined'>('all');
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<Booking | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Bookings state (initialized with INITIAL_BOOKINGS + any locally created bookings)
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('tourmaster_user_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_BOOKINGS;
  });

  // Fetch from server if available
  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBookings(data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Sync initial pass if none selected
  useEffect(() => {
    if (bookings.length > 0 && !selectedBookingForPass) {
      setSelectedBookingForPass(bookings[0]);
    }
  }, [bookings, selectedBookingForPass]);

  if (!isOpen) return null;

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  // Stats calculation
  const totalSpent = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Slide-in Drawer Container */}
      <div className="w-full max-w-2xl h-full bg-slate-900/98 border-l border-emerald-500/40 shadow-2xl flex flex-col justify-between text-slate-100 z-50 overflow-hidden animate-slide-in-right">
        
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold font-display text-white">
                  Tourist Command Center
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {userAuth?.name || 'Verified Tourist'} • {userAuth?.phone || '+91 98765 43210'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Stats Ribbon */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-950/90 border-b border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Total Trips</span>
            <span className="text-sm sm:text-base font-black text-white">{bookings.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Active Bookings</span>
            <span className="text-sm sm:text-base font-black text-emerald-400">{confirmedCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Total Spend</span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">₹{totalSpent.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">EcoScore Pts</span>
            <span className="text-sm sm:text-base font-black text-teal-400">320 🌱</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 pt-3 border-b border-slate-800 bg-slate-950/40 space-x-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'bookings'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Bookings ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'activity'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity Logs & Safety</span>
          </button>
          <button
            onClick={() => setActiveTab('pass')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'pass'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital QR Travel Pass</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* ========================================================================= */}
          {/* TAB 1: MY BOOKINGS & LIVE STATUS */}
          {/* ========================================================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-4 animate-fade-in">
              {/* Filter Pills */}
              <div className="flex items-center space-x-2 text-xs">
                {(['all', 'Confirmed', 'Pending Approval', 'Completed'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all ${
                      statusFilter === filter
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {filter === 'all' ? 'All Trips' : filter}
                  </button>
                ))}
              </div>

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-3xl border border-slate-800 space-y-2">
                  <Compass className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="font-bold text-white text-sm">No Bookings Found</div>
                  <p className="text-xs text-slate-400">
                    You have not made any bookings in this filter category yet.
                  </p>
                </div>
              ) : (
                filteredBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 relative overflow-hidden"
                  >
                    {/* Top Row: Ref & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {bk.bookingRef}
                        </span>
                        <button
                          onClick={() => handleCopy(bk.bookingRef)}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded"
                          title="Copy Booking Reference"
                        >
                          {copiedRef === bk.bookingRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          bk.status === 'Confirmed' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
                        }`} />
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bk.status === 'Confirmed' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {bk.status}
                        </span>
                      </div>
                    </div>

                    {/* Destination & Travel Dates */}
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{bk.destination}</span>
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>Travel Dates: {bk.travelDates}</span>
                      </div>
                    </div>

                    {/* Facilities Included Pills */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-900">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Included Facilities:</div>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {bk.items.map((item, idx) => (
                          <div 
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-slate-300 text-[11px]"
                          >
                            {item.type === 'Hotel' && <Hotel className="w-3 h-3 text-teal-400" />}
                            {item.type === 'EV Cab' && <Car className="w-3 h-3 text-cyan-400" />}
                            {item.type === 'Tour Guide' && <UserCheck className="w-3 h-3 text-blue-400" />}
                            {item.type === 'Local Eatery' && <Utensils className="w-3 h-3 text-amber-400" />}
                            <span className="font-medium">{item.providerName}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Row: Price & Digital Pass Action */}
                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Amount Paid</span>
                        <span className="text-base font-black text-emerald-400 font-mono">
                          ₹{bk.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBookingForPass(bk);
                            setActiveTab('pass');
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View QR Pass</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PLATFORM ACTIVITY LOGS & SOS SAFETY */}
          {/* ========================================================================= */}
          {activeTab === 'activity' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <Activity className="w-4 h-4" />
                  <span>Real-Time Tourist Activity Stream</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  All platform actions, GPS telemetry, weather adaptation triggers, and emergency logs.
                </p>
              </div>

              {/* Event Timeline */}
              <div className="space-y-3 relative pl-4 border-l-2 border-slate-800 ml-2">
                <div className="relative space-y-1">
                  <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-900" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">📍 Custom Tour Facilities Configured</span>
                    <span className="text-[10px] text-slate-500">Just Now</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Selected tourism spots in {currentCity}, verified hotel stays, and EV cab routes.
                  </p>
                </div>

                <div className="relative space-y-1">
                  <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-teal-500 ring-4 ring-slate-900" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">🌦️ Live GPS Weather Telemetry Synced</span>
                    <span className="text-[10px] text-slate-500">10 mins ago</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Location resolved to {currentCity}. Real-time temperature & monsoon weather adaptation active.
                  </p>
                </div>

                <div className="relative space-y-1">
                  <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-slate-900" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">🛡️ Emergency SOS Police Safety Link Active</span>
                    <span className="text-[10px] text-slate-500">Active 24/7</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Connected to Maharashtra Tourist Police Unit 4 with live GPS coordinate dispatch capability.
                  </p>
                </div>

                <div className="relative space-y-1">
                  <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-slate-900" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">⚡ AI Gemini 3.7 Flash Eco-Planner Ready</span>
                    <span className="text-[10px] text-slate-500">1 hr ago</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Eco-score optimizer ready with carbon offset computation.
                  </p>
                </div>
              </div>

              {/* Quick Safety Check Button */}
              {onTriggerSOS && (
                <div className="pt-2">
                  <button
                    onClick={onTriggerSOS}
                    className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Open Emergency SOS Safety Desk</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DIGITAL QR TRAVEL PASS */}
          {/* ========================================================================= */}
          {activeTab === 'pass' && (
            <div className="space-y-4 animate-fade-in">
              {selectedBookingForPass ? (
                <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                      Official Tourist Digital Pass • SIH 2026
                    </span>
                    <h4 className="text-lg font-bold text-white pt-1">
                      {selectedBookingForPass.destination}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Pass Holder: <strong className="text-white">{selectedBookingForPass.touristName}</strong>
                    </p>
                  </div>

                  {/* QR Code Container */}
                  <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-emerald-500/30">
                    <QrCode className="w-32 h-32 text-slate-950" />
                    <span className="text-[9px] font-mono font-bold text-slate-800 tracking-wider">
                      {selectedBookingForPass.bookingRef}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold">{selectedBookingForPass.status}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Travel Dates:</span>
                      <span className="text-white font-semibold">{selectedBookingForPass.travelDates}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Payment Verified:</span>
                      <span className="text-emerald-400 font-bold">₹{selectedBookingForPass.totalAmount} (UPI)</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => alert(`Digital Pass ${selectedBookingForPass.bookingRef} verified and ready for spot entry!`)}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Pass (PDF)</span>
                    </button>
                    <button
                      onClick={() => handleCopy(selectedBookingForPass.qrPayload)}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all"
                      title="Share Pass"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Select a booking to preview its digital pass.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SIH PS 26204 • Verified Tourist Account</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
