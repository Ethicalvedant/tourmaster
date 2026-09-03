import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, MapPin, Users, TreePine, IndianRupee, Landmark, CheckCircle2, 
  AlertTriangle, Radio, BarChart3, Plus, Search, Check, X, ShieldCheck, 
  BellRing, Send, Eye, RefreshCw, Building2, FileCheck, Layers, Sparkles, Filter,
  FileText, Hotel, Utensils, Car, UserCheck, Calendar, Clock, QrCode
} from 'lucide-react';
import { SOSAlert, TouristSpot, ServiceProvider, OrganisationAdvisory, Booking } from '../../types';
import { 
  MASTER_TOURIST_SPOTS, INITIAL_SOS_ALERTS, VERIFIED_SERVICE_PROVIDERS, 
  INITIAL_ORGANISATION_ADVISORIES, INITIAL_BOOKINGS 
} from '../../data/mockTourismData';

export const AdminDashboard: React.FC = () => {
  const [sosList, setSosList] = useState<SOSAlert[]>(INITIAL_SOS_ALERTS);
  const [spotsList, setSpotsList] = useState<TouristSpot[]>(MASTER_TOURIST_SPOTS);
  const [providerList, setProviderList] = useState<ServiceProvider[]>(VERIFIED_SERVICE_PROVIDERS);
  const [advisoriesList, setAdvisoriesList] = useState<OrganisationAdvisory[]>(INITIAL_ORGANISATION_ADVISORIES);
  const [bookingsList, setBookingsList] = useState<Booking[]>(INITIAL_BOOKINGS);
  
  const [activeTab, setActiveTab] = useState<'tourist-bookings' | 'sos-dispatch' | 'master-spots' | 'kyc-approvals' | 'advisories' | 'analytics'>('tourist-bookings');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'Confirmed' | 'Pending Approval' | 'Completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');

  // Add new spot modal state
  const [isAddSpotOpen, setIsAddSpotOpen] = useState(false);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotCity, setNewSpotCity] = useState('Jaipur');
  const [newSpotState, setNewSpotState] = useState('Rajasthan');
  const [newSpotCategory, setNewSpotCategory] = useState('Heritage & Culture');
  const [newSpotFee, setNewSpotFee] = useState(150);
  const [newSpotEco, setNewSpotEco] = useState(92);
  const [newSpotDesc, setNewSpotDesc] = useState('');
  const [newSpotImg, setNewSpotImg] = useState('');
  const [isSavingSpot, setIsSavingSpot] = useState(false);

  // Broadcast advisory modal state
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [advTitle, setAdvTitle] = useState('');
  const [advSeverity, setAdvSeverity] = useState<'Critical' | 'Warning' | 'Info'>('Warning');
  const [advCategory, setAdvCategory] = useState<'Weather' | 'Crowd Management' | 'Heritage Protection' | 'Emergency' | 'Special Event'>('Weather');
  const [advCity, setAdvCity] = useState('All Regions');
  const [advMessage, setAdvMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchSOS = async () => {
    try {
      const res = await fetch('/api/sos');
      const data = await res.json();
      setSosList(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSpots = async () => {
    try {
      const res = await fetch('/api/spots');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSpotsList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdvisories = async () => {
    try {
      const res = await fetch('/api/advisories');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAdvisoriesList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBookings = async () => {
    let all: Booking[] = [];
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        all = data;
      }
    } catch (e) {}

    try {
      const local = JSON.parse(localStorage.getItem('tourmaster_user_bookings') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        all = [...local, ...all];
      }
    } catch (e) {}

    if (all.length > 0) {
      setBookingsList(all);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: 'Confirmed' | 'Pending Approval' | 'Declined' | 'Completed') => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }

    setBookingsList(prev =>
      prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
    );

    try {
      const local = JSON.parse(localStorage.getItem('tourmaster_user_bookings') || '[]');
      if (Array.isArray(local)) {
        const updated = local.map((b: any) => b.id === id ? { ...b, status: newStatus } : b);
        localStorage.setItem('tourmaster_user_bookings', JSON.stringify(updated));
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchSOS();
    fetchSpots();
    fetchAdvisories();
    fetchBookings();
  }, []);

  const handleUpdateSOSStatus = async (id: string, newStatus: 'Active' | 'Dispatched' | 'Resolved') => {
    try {
      await fetch(`/api/sos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setSosList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyProvider = async (id: string, approved: boolean) => {
    try {
      await fetch(`/api/providers/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified: approved,
          kycStatus: approved ? 'Verified' : 'Rejected',
          ecoTier: approved ? 'Gold Green' : 'Bronze Standard',
        }),
      });
      setProviderList((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, verified: approved, kycStatus: approved ? 'Verified' : 'Rejected' }
            : p
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotName.trim()) return;
    setIsSavingSpot(true);
    try {
      const payload = {
        name: newSpotName,
        city: newSpotCity,
        state: newSpotState,
        category: newSpotCategory,
        entryFee: newSpotFee,
        ecoScore: newSpotEco,
        description: newSpotDesc || `${newSpotName} verified tourist attraction in ${newSpotCity}.`,
        imageUrl: newSpotImg || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
        timings: '08:30 AM - 05:30 PM',
        bestTimeToVisit: 'Morning slot',
        nearestTransport: 'EV Cab & Transit Stop',
        tags: ['Verified Attraction', newSpotCity, newSpotCategory],
      };
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      setSpotsList((prev) => [created, ...prev]);
      setIsAddSpotOpen(false);
      setNewSpotName('');
      setNewSpotDesc('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSpot(false);
    }
  };

  const handleBroadcastAdvisory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advTitle.trim() || !advMessage.trim()) return;
    setIsBroadcasting(true);
    try {
      const payload = {
        title: advTitle,
        severity: advSeverity,
        category: advCategory,
        targetCity: advCity,
        message: advMessage,
        issuedBy: 'Ministry of Tourism & Law Enforcement Operations',
      };
      const res = await fetch('/api/advisories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      setAdvisoriesList((prev) => [created, ...prev]);
      setIsBroadcastOpen(false);
      setAdvTitle('');
      setAdvMessage('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const filteredSpots = spotsList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCityFilter === 'All' || s.city.toLowerCase() === selectedCityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Admin (Organisation) Control Center</span>
              </span>
              <span className="text-xs text-slate-400">SIH 2026 Governance & Law Enforcement</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1.5">
              Ministry of Tourism & District Authority Command
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Centralized command for 24/7 tourist SOS dispatch, verified master registry, vendor KYC approvals, and emergency broadcast bulletins.
            </p>
          </div>

          {/* Quick tab switcher */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('tourist-bookings')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                activeTab === 'tourist-bookings'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tourist Bookings ({bookingsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sos-dispatch')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                activeTab === 'sos-dispatch'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>SOS Dispatch ({sosList.filter((s) => s.status !== 'Resolved').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('master-spots')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                activeTab === 'master-spots'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Master Registry ({spotsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('kyc-approvals')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                activeTab === 'kyc-approvals'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Vendor KYC</span>
            </button>

            <button
              onClick={() => setActiveTab('advisories')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                activeTab === 'advisories'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Broadcasts ({advisoriesList.filter((a) => a.active).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>District Impact</span>
            </button>
          </div>
        </div>

        {/* High-Level Overview Metrics */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Active Tourists in Zone</span>
            <div className="text-lg sm:text-2xl font-bold font-display text-white mt-0.5">18,420</div>
            <span className="text-[10px] text-emerald-400 font-medium">Across 6 States • Live GPS Tracked</span>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Regional Eco Compliance</span>
            <div className="text-lg sm:text-2xl font-bold font-display text-emerald-400 mt-0.5">87.4 / 100</div>
            <span className="text-[10px] text-slate-400">+12% Responsible Growth Index</span>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">District Carbon Offset</span>
            <div className="text-lg sm:text-2xl font-bold font-display text-teal-300 mt-0.5">1,420 Tons</div>
            <span className="text-[10px] text-slate-400">Via EV Cabs & Solar Stays</span>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">SOS Incident Resolution</span>
            <div className="text-lg sm:text-2xl font-bold font-display text-purple-400 mt-0.5">99.2%</div>
            <span className="text-[10px] text-slate-400">Avg. Response Time: 4.8 mins</span>
          </div>
        </div>
      </div>

      {/* TAB 0: ALL TOURIST BOOKINGS & JOURNEY HISTORY */}
      {activeTab === 'tourist-bookings' && (
        <div className="bg-slate-900/90 rounded-3xl border border-purple-900/40 p-5 sm:p-7 shadow-xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/40">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  Central Tourist Bookings & Journey History
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive audit trail and status management of all tourist bookings across hotels, cabs, guides & attractions.
                </p>
              </div>
            </div>

            {/* Search & Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by tourist name, phone, ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-48 sm:w-60"
                />
              </div>

              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(['all', 'Confirmed', 'Pending Approval', 'Completed', 'Declined'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setBookingStatusFilter(filter as any)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      bookingStatusFilter === filter
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-purple-950/20 border border-purple-800/30 px-3.5 py-2 rounded-xl text-xs text-purple-300 flex items-center justify-between">
            <span>🛡️ <strong>Admin Authority Governance:</strong> Only tourist users initiate bookings. You have full authority to update status, verify passes, or issue settlements.</span>
            <span className="text-[11px] font-mono text-purple-400 font-bold">{bookingsList.length} Total Registered Bookings</span>
          </div>

          <div className="space-y-3">
            {bookingsList
              .filter(b => {
                const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
                const matchesQuery = !searchQuery.trim() || 
                  b.touristName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  b.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (b.touristPhone && b.touristPhone.includes(searchQuery));
                return matchesStatus && matchesQuery;
              })
              .map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
                        {booking.bookingRef}
                      </span>
                      <span className="font-bold text-white text-sm sm:text-base">{booking.touristName}</span>
                      <span className="text-xs text-slate-400">• {booking.touristPhone}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        booking.status === 'Confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : booking.status === 'Completed'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : booking.status === 'Declined'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-emerald-400 font-bold font-mono text-sm">
                        ₹{booking.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span><strong>Destination:</strong> {booking.destination}</span>
                    </span>
                    <span className="text-slate-500 hidden sm:inline">•</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <span><strong>Travel Dates:</strong> {booking.travelDates}</span>
                    </span>
                    <span className="text-slate-500 hidden sm:inline">•</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Ticket: {booking.qrPayload?.slice(0, 24)}...
                    </span>
                  </div>

                  {/* Included Items */}
                  <div className="space-y-1 pt-1 border-t border-slate-900">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Booked Facilities:</div>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {booking.items.map((item, idx) => (
                        <div key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] flex items-center space-x-1.5">
                          {item.type === 'Hotel' && <Hotel className="w-3 h-3 text-teal-400" />}
                          {item.type === 'EV Cab' && <Car className="w-3 h-3 text-cyan-400" />}
                          {item.type === 'Tour Guide' && <UserCheck className="w-3 h-3 text-blue-400" />}
                          {item.type === 'Local Eatery' && <Utensils className="w-3 h-3 text-amber-400" />}
                          <span>{item.providerName} (₹{item.amount})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin Direct Management Controls */}
                  <div className="pt-2 border-t border-slate-900/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">Manage Status:</span>
                    <div className="flex items-center space-x-2 text-xs">
                      {booking.status !== 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'Confirmed')}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Approve & Confirm</span>
                        </button>
                      )}
                      {booking.status !== 'Completed' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'Completed')}
                          className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                        >
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          <span>Mark Fulfilled</span>
                        </button>
                      )}
                      {booking.status !== 'Declined' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'Declined')}
                          className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                        >
                          <X className="w-3 h-3 text-rose-400" />
                          <span>Cancel & Refund</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 1: LIVE SOS DISPATCH FEED */}
      {activeTab === 'sos-dispatch' && (
        <div className="bg-slate-900/90 rounded-3xl border border-rose-900/40 p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center animate-pulse border border-rose-600/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  Real-time Tourist Emergency SOS Feed
                </h3>
                <p className="text-xs text-slate-400">
                  Live geo-tagged panic alerts dispatched to Regional Police PCRs & Forest Rangers
                </p>
              </div>
            </div>
            <button
              onClick={fetchSOS}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center space-x-1 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Incident Feeds</span>
            </button>
          </div>

          <div className="space-y-3">
            {sosList.map((sos) => {
              const isResolved = sos.status === 'Resolved';
              return (
                <div
                  key={sos.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isResolved
                      ? 'bg-slate-950/60 border-slate-800 opacity-70'
                      : 'bg-slate-950 border-rose-600/60 shadow-lg shadow-rose-900/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base">{sos.touristName}</span>
                        <span className="text-xs text-slate-400 font-mono">({sos.touristPhone})</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            isResolved
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-rose-600 text-white animate-pulse'
                          }`}
                        >
                          {sos.status.toUpperCase()}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {sos.emergencyType}
                        </span>
                        <span className="text-[10px] text-slate-500">• {sos.timestamp}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-300">
                        <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span>{sos.locationDescription}</span>
                        <span className="text-slate-500 font-mono">({sos.lat}° N, {sos.lng}° E)</span>
                      </div>

                      {sos.dispatchedUnit && (
                        <p className="text-xs text-teal-400">
                          👮 Assigned Patrol: <span className="font-semibold text-white">{sos.dispatchedUnit}</span>
                        </p>
                      )}

                      {sos.notes && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                          "{sos.notes}"
                        </p>
                      )}
                    </div>

                    {/* SOS Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {!isResolved ? (
                        <button
                          onClick={() => handleUpdateSOSStatus(sos.id, 'Resolved')}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Incident Resolved</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-900 rounded-lg">
                          Resolved • Archived to Registry
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MASTER TOURISM REGISTRY */}
      {activeTab === 'master-spots' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Verified Tourism Master Database (National Registry)
              </h3>
              <p className="text-xs text-slate-400">
                Official attractions, entry fees, timings, and environmental ratings.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAddSpotOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Attraction</span>
              </button>

              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search spots, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex space-x-3.5"
              >
                <img
                  src={spot.imageUrl}
                  alt={spot.name}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1 truncate flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">{spot.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                      Eco {spot.ecoScore}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{spot.city}, {spot.state} • {spot.category}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{spot.description}</p>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-3 pt-1">
                    <span className="text-emerald-400 font-bold">Entry: ₹{spot.entryFee}</span>
                    <span>★ {spot.rating}</span>
                    <span>{spot.timings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROVIDER KYC & ECO VERIFICATION */}
      {activeTab === 'kyc-approvals' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl space-y-4">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold font-display text-white">
              Service Provider KYC & Green Tier Accreditation Queue
            </h3>
            <p className="text-xs text-slate-400">
              Review and authorize homestays, EV drivers, guides, and artisans into the TourMaster verified ecosystem.
            </p>
          </div>

          <div className="space-y-3">
            {providerList.map((prov) => (
              <div
                key={prov.id}
                className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={prov.image}
                    alt={prov.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white text-sm">{prov.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300">
                        {prov.type}
                      </span>
                      {prov.verified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Verified Partner</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                          Pending Audit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{prov.city} • Contact: {prov.contactNumber}</p>
                    <p className="text-[11px] text-slate-500">{prov.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {!prov.verified ? (
                    <button
                      onClick={() => handleVerifyProvider(prov.id, true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-1 shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approve & Certify</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerifyProvider(prov.id, false)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 font-semibold text-xs transition-all"
                    >
                      Revoke Verification
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORGANISATION BROADCAST & SAFETY ADVISORIES */}
      {activeTab === 'advisories' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Official Safety Advisories & Alert Dispatcher
              </h3>
              <p className="text-xs text-slate-400">
                Broadcast instant push alerts, flood/heat warnings, and crowd advisories to all tourist devices.
              </p>
            </div>
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast New Advisory</span>
            </button>
          </div>

          <div className="space-y-3">
            {advisoriesList.map((adv) => (
              <div
                key={adv.id}
                className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        adv.severity === 'Critical'
                          ? 'bg-rose-600 text-white'
                          : adv.severity === 'Warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {adv.severity.toUpperCase()}
                    </span>
                    <span className="font-bold text-white text-sm sm:text-base">{adv.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{adv.timestamp}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{adv.message}</p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Target Zone: <strong className="text-slate-300">{adv.targetCity}</strong></span>
                  <span>Issued By: <strong className="text-purple-300">{adv.issuedBy}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DISTRICT SUSTAINABILITY TELEMETRY */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold font-display text-white">
              SIH 2026 Socio-Economic & Sustainability Impact Metrics
            </h3>
            <p className="text-xs text-slate-400">
              Measuring the real-time socio-economic and environmental transformation across Indian tourism circuits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
                <TreePine className="w-4 h-4" />
                <span>Environmental Impact</span>
              </span>
              <div className="text-3xl font-black font-display text-white">34.2%</div>
              <p className="text-xs text-slate-400">
                Reduction in vehicular emissions through route optimization and EV Cab priority dispatch.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-purple-400 flex items-center space-x-1.5">
                <IndianRupee className="w-4 h-4" />
                <span>Economic Localization</span>
              </span>
              <div className="text-3xl font-black font-display text-white">₹4.8 Cr</div>
              <p className="text-xs text-slate-400">
                Direct revenue routed to indigenous homestays, verified guides, and craft artisans without intermediary commission bleed.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-cyan-400 flex items-center space-x-1.5">
                <Users className="w-4 h-4" />
                <span>Tourist Safety Index</span>
              </span>
              <div className="text-3xl font-black font-display text-white">99.2%</div>
              <p className="text-xs text-slate-400">
                Panic alerts addressed under 5 minutes with verified Police & Forest Ranger patrol units.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ADD SPOT MODAL */}
      {isAddSpotOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add New Tourism Attraction</h3>
              <button onClick={() => setIsAddSpotOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSpot} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Attraction / Monument Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jal Mahal Water Palace"
                  value={newSpotName}
                  onChange={(e) => setNewSpotName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newSpotCity}
                    onChange={(e) => setNewSpotCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newSpotCategory}
                    onChange={(e) => setNewSpotCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option>Heritage & Culture</option>
                    <option>Nature & Wildlife</option>
                    <option>Adventure & Trekking</option>
                    <option>Spiritual & Wellness</option>
                    <option>Eco-Tourism & Rural</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Entry Fee (₹ INR)</label>
                  <input
                    type="number"
                    value={newSpotFee}
                    onChange={(e) => setNewSpotFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Eco Score (0-100)</label>
                  <input
                    type="number"
                    value={newSpotEco}
                    onChange={(e) => setNewSpotEco(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Historical context, architectural highlights..."
                  value={newSpotDesc}
                  onChange={(e) => setNewSpotDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSpotOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSpot}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
                >
                  {isSavingSpot ? 'Saving...' : 'Register Attraction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BROADCAST ADVISORY MODAL */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Broadcast Tourism Safety Advisory</h3>
              <button onClick={() => setIsBroadcastOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleBroadcastAdvisory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Advisory Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Rain Alert along Hill Forts"
                  value={advTitle}
                  onChange={(e) => setAdvTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity</label>
                  <select
                    value={advSeverity}
                    onChange={(e) => setAdvSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option>Warning</option>
                    <option>Critical</option>
                    <option>Info</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={advCategory}
                    onChange={(e) => setAdvCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option>Weather</option>
                    <option>Crowd Management</option>
                    <option>Heritage Protection</option>
                    <option>Emergency</option>
                    <option>Special Event</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Region / City</label>
                <input
                  type="text"
                  value={advCity}
                  onChange={(e) => setAdvCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Advisory Message Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide precise safety instructions, alternate routes, or emergency contacts..."
                  value={advMessage}
                  onChange={(e) => setAdvMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
                >
                  {isBroadcasting ? 'Broadcasting...' : 'Broadcast to Tourists'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
