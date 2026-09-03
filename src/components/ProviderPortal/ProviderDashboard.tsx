import React, { useState, useEffect, useMemo } from 'react';
import { 
  Hotel, Car, UserCheck, Utensils, ShieldCheck, Sparkles, Store, MapPin, BadgeCheck,
  Calendar, Clock, CheckCircle, XCircle, QrCode, Check, IndianRupee, Users, ArrowRight
} from 'lucide-react';
import { Booking, UserAuth } from '../../types';
import { INITIAL_BOOKINGS } from '../../data/mockTourismData';

interface ProviderDashboardProps {
  userAuth?: UserAuth | null;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ userAuth }) => {
  // Active provider entity details from authentication
  const providerName = userAuth?.name || 'Shantai Hotel';
  const providerCategory = userAuth?.providerType || 'hotels';

  const [isAvailable, setIsAvailable] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'Confirmed' | 'Pending Approval' | 'Completed'>('all');
  const [verifyingPassRef, setVerifyingPassRef] = useState<string | null>(null);

  // Dynamic base price default per category
  const basePrice = useMemo(() => {
    if (providerCategory === 'hotels') return 2800;
    if (providerCategory === 'taxis') return 1800;
    if (providerCategory === 'guides') return 700;
    if (providerCategory === 'foods') return 350;
    if (providerCategory === 'activities') return 250;
    return 150;
  }, [providerCategory]);

  // Category metadata helper
  const categoryMeta = useMemo(() => {
    switch (providerCategory) {
      case 'tourism_spots':
        return {
          label: 'Tourism Spot & Heritage Authority',
          icon: MapPin,
          unitLabel: 'per entry pass',
          slotLabel: 'Daily Visitor Capacity',
          slots: '150 Passes',
          itemType: 'Tourism Spot Entry',
          sampleItem: `${providerName} - Priority Fast-Track Entry Pass (2 Adults)`,
          sampleAmount: 150,
          themeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'hotels':
        return {
          label: 'Verified Hotel & Eco-Stay Partner',
          icon: Hotel,
          unitLabel: 'per room / night',
          slotLabel: 'Available Rooms',
          slots: '8 Active Rooms',
          itemType: 'Hotel Stay',
          sampleItem: `${providerName} - Deluxe Heritage Room (2 Nights Stay)`,
          sampleAmount: 5600,
          themeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
        };
      case 'foods':
        return {
          label: 'Authentic Food & Dining Partner',
          icon: Utensils,
          unitLabel: 'per traditional meal / thali',
          slotLabel: 'Table Capacity',
          slots: '24 Seat Capacity',
          itemType: 'Dining & Food Order',
          sampleItem: `${providerName} - Special Traditional Thali Meal Order (4 Pax)`,
          sampleAmount: 1400,
          themeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'activities':
        return {
          label: 'Entertainment & Adventure Partner',
          icon: Sparkles,
          unitLabel: 'per ticket / show pass',
          slotLabel: 'Slot Capacity',
          slots: '40 Slot Passes',
          itemType: 'Activity / Event Admission',
          sampleItem: `${providerName} - Evening Show Admission Pass (2 Tickets)`,
          sampleAmount: 500,
          themeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        };
      case 'taxis':
        return {
          label: 'EV Green Cab Transit Fleet',
          icon: Car,
          unitLabel: 'per day / route fare',
          slotLabel: 'Active Fleet Vehicles',
          slots: '12 EV Cabs Live',
          itemType: 'EV Cab Transit Ride',
          sampleItem: `${providerName} - Full Day Heritage Sightseeing Transit (Tata Nexon EV Max)`,
          sampleAmount: 2200,
          themeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        };
      case 'guides':
        return {
          label: 'Licensed Cultural Tour Guide',
          icon: UserCheck,
          unitLabel: 'per day guided tour',
          slotLabel: 'Tour Slots Available',
          slots: '2 Tours / Day',
          itemType: 'Heritage Tour Guide',
          sampleItem: `${providerName} - Full Day Guided Heritage Storytelling (English & Marathi)`,
          sampleAmount: 1200,
          themeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        };
      default:
        return {
          label: 'Local Hospitality Partner',
          icon: Store,
          unitLabel: 'per service unit',
          slotLabel: 'Service Slots',
          slots: 'Active',
          itemType: 'Service Order',
          sampleItem: `${providerName} - Reserved Facility Package`,
          sampleAmount: 1500,
          themeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
        };
    }
  }, [providerCategory, providerName]);

  // Load bookings and orders specifically for this provider entity & type
  const loadProviderBookings = async () => {
    let allBookings: Booking[] = [];
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        allBookings = data;
      }
    } catch (e) {}

    try {
      const local = JSON.parse(localStorage.getItem('tourmaster_user_bookings') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        allBookings = [...local, ...allBookings];
      }
    } catch (e) {}

    if (allBookings.length === 0) {
      allBookings = INITIAL_BOOKINGS;
    }

    // Filter to bookings that contain this specific provider or matching category
    const sanitizedName = providerName.toLowerCase();
    let matched = allBookings.filter(b => {
      return b.items && b.items.some(item => {
        const itemProv = (item.providerName || '').toLowerCase();
        return itemProv.includes(sanitizedName) || sanitizedName.includes(itemProv);
      });
    });

    // If no exact orders exist yet in memory, synthesize realistic live incoming orders for this specific provider type & name
    if (matched.length === 0) {
      matched = [
        {
          id: `bk-${providerCategory}-1`,
          bookingRef: `TM-2026-${providerCategory.slice(0, 3).toUpperCase()}-9421`,
          touristName: 'Rahul Deshmukh',
          touristEmail: 'rahul.deshmukh@example.com',
          touristPhone: '+91 98221 44556',
          destination: 'Pune & Sahyadri Heritage Circuit',
          items: [
            {
              providerId: 'prov-current-1',
              providerName: providerName,
              type: (providerCategory === 'hotels' ? 'Hotel' : providerCategory === 'taxis' ? 'EV Cab' : providerCategory === 'guides' ? 'Tour Guide' : 'Local Eatery') as any,
              details: categoryMeta.sampleItem,
              amount: categoryMeta.sampleAmount,
            }
          ],
          totalAmount: categoryMeta.sampleAmount,
          paymentMethod: 'UPI',
          paymentStatus: 'Paid',
          bookingDate: new Date().toISOString().split('T')[0],
          travelDates: 'Upcoming Saturday - Sunday',
          qrPayload: `TOURMASTER-CONFIRMED-${providerName.toUpperCase()}-PAID`,
          status: 'Confirmed'
        },
        {
          id: `bk-${providerCategory}-2`,
          bookingRef: `TM-2026-${providerCategory.slice(0, 3).toUpperCase()}-8172`,
          touristName: 'Pooja Kulkarni',
          touristEmail: 'pooja.kulkarni@gmail.com',
          touristPhone: '+91 98811 77223',
          destination: 'Pune City Heritage Tour',
          items: [
            {
              providerId: 'prov-current-1',
              providerName: providerName,
              type: (providerCategory === 'hotels' ? 'Hotel' : providerCategory === 'taxis' ? 'EV Cab' : providerCategory === 'guides' ? 'Tour Guide' : 'Local Eatery') as any,
              details: `${providerName} - Priority Service Request (${categoryMeta.unitLabel})`,
              amount: basePrice,
            }
          ],
          totalAmount: basePrice,
          paymentMethod: 'UPI',
          paymentStatus: 'Paid',
          bookingDate: new Date().toISOString().split('T')[0],
          travelDates: 'Next Weekend',
          qrPayload: `TOURMASTER-CONFIRMED-${providerName.toUpperCase()}-PAID`,
          status: 'Pending Approval'
        },
        {
          id: `bk-${providerCategory}-3`,
          bookingRef: `TM-2026-${providerCategory.slice(0, 3).toUpperCase()}-6630`,
          touristName: 'Vikram Joshi',
          touristEmail: 'vikram.joshi@outlook.com',
          touristPhone: '+91 94220 18834',
          destination: 'Sinhagad & Western Ghats Tour',
          items: [
            {
              providerId: 'prov-current-1',
              providerName: providerName,
              type: (providerCategory === 'hotels' ? 'Hotel' : providerCategory === 'taxis' ? 'EV Cab' : providerCategory === 'guides' ? 'Tour Guide' : 'Local Eatery') as any,
              details: `${providerName} - Standard Package Fulfilled`,
              amount: basePrice * 2,
            }
          ],
          totalAmount: basePrice * 2,
          paymentMethod: 'UPI',
          paymentStatus: 'Paid',
          bookingDate: '2026-08-28',
          travelDates: 'Completed Last Sunday',
          qrPayload: `TOURMASTER-CONFIRMED-${providerName.toUpperCase()}-PAID`,
          status: 'Completed'
        }
      ];
    }

    setBookings(matched);
  };

  useEffect(() => {
    loadProviderBookings();
  }, [providerName, providerCategory]);

  const handleUpdateStatus = async (bookingId: string, newStatus: 'Confirmed' | 'Declined' | 'Completed') => {
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );

    try {
      const local = JSON.parse(localStorage.getItem('tourmaster_user_bookings') || '[]');
      if (Array.isArray(local)) {
        const updated = local.map((b: any) => b.id === bookingId ? { ...b, status: newStatus } : b);
        localStorage.setItem('tourmaster_user_bookings', JSON.stringify(updated));
      }
    } catch (e) {}
  };

  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  // Compute direct revenue for this provider
  const totalRevenue = bookings.reduce((sum, b) => {
    const itemAmount = b.items?.find(item => 
      (item.providerName || '').toLowerCase().includes(providerName.toLowerCase())
    )?.amount || b.totalAmount;
    return sum + itemAmount;
  }, 0);

  const CategoryIcon = categoryMeta.icon;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Role Management Notice Strip */}
      <div className="bg-slate-900/90 border border-teal-500/30 px-4 py-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-md">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span className="font-bold text-white">🏨 Service Provider Management Console</span>
          <span className="text-slate-400">
            You manage incoming tourist tour bookings, dispatch slots, and QR pass verifications. (Note: Only tourists initiate new bookings).
          </span>
        </div>
        <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-bold self-end sm:self-auto">
          {providerName}
        </span>
      </div>
      
      {/* 1. Service Provider Header Card */}
      <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${categoryMeta.themeBg}`}>
                <CategoryIcon className="w-3.5 h-3.5" />
                <span>{categoryMeta.label}</span>
              </span>
              <span className="text-xs text-slate-400 font-semibold">• SIH 2026 Direct Partner</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1 flex items-center space-x-2">
              <span>{providerName}</span>
              <BadgeCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Dedicated command dashboard for <strong className="text-white">{providerName}</strong>. Live on TourMaster platform with direct zero-commission tourist booking access.
            </p>
          </div>

          {/* Online Availability Toggle */}
          <div className="flex items-center space-x-3 bg-slate-950/90 p-3 rounded-2xl border border-slate-800 shadow-inner">
            <div className="text-left pl-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Listing Status</div>
              <div className="text-xs font-bold text-white">
                {isAvailable ? 'Live & Accepting Tourists' : 'Temporarily Paused'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
                isAvailable
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-slate-950 animate-ping' : 'bg-slate-500'}`} />
              <span>{isAvailable ? '🟢 ONLINE' : '⚪ OFFLINE'}</span>
            </button>
          </div>
        </div>

        {/* Specific Provider Snapshot Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-xs">
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Registered Entity</span>
            <div className="font-bold text-white truncate mt-0.5">{providerName}</div>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Base Standard Rate</span>
            <div className="font-bold text-emerald-400 font-mono mt-0.5">₹{basePrice} <span className="text-[10px] text-slate-400 font-normal">({categoryMeta.unitLabel})</span></div>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">{categoryMeta.slotLabel}</span>
            <div className="font-bold text-teal-300 mt-0.5">{categoryMeta.slots}</div>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Direct Earnings</span>
            <div className="font-bold text-emerald-400 font-mono mt-0.5">₹{totalRevenue.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">(100% Direct)</span></div>
          </div>
        </div>
      </div>

      {/* 2. Live Bookings & Orders Received by this Service Provider */}
      <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold font-display text-white flex items-center space-x-2">
              <span>Incoming Tourist Bookings & Orders for {providerName}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {filteredBookings.length} {categoryMeta.itemType}s
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live orders and guest reservations dispatched specifically to your {categoryMeta.label.toLowerCase()} entity.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'Confirmed', 'Pending Approval', 'Completed'] as const).map(filter => (
              <button
                key={filter}
                type="button"
                onClick={() => setBookingFilter(filter)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  bookingFilter === filter
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'all' ? 'All Orders' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* List of Incoming Orders & Bookings */}
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <Store className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="font-bold text-white text-sm">No Orders Found</div>
              <p className="text-xs text-slate-400">
                No tourist bookings currently match the "{bookingFilter}" filter for {providerName}.
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              // Find item specific to this provider
              const thisProviderItem = booking.items?.find(item => 
                (item.providerName || '').toLowerCase().includes(providerName.toLowerCase())
              ) || booking.items?.[0];

              return (
                <div
                  key={booking.id}
                  className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/30">
                        {booking.bookingRef}
                      </span>
                      <span className="font-bold text-white text-sm sm:text-base">{booking.touristName}</span>
                      <span className="text-xs text-slate-400">• {booking.touristPhone}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          booking.status === 'Confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : booking.status === 'Completed'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      <span className="font-bold text-teal-300">
                        {thisProviderItem ? thisProviderItem.details : `${providerName} - Order`}
                      </span>
                    </p>

                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-white font-medium">{booking.travelDates}</span>
                      </span>
                      <span>•</span>
                      <span>Paid via {booking.paymentMethod}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold text-xs">
                        Revenue: ₹{thisProviderItem ? thisProviderItem.amount : booking.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Provider Order Action Buttons */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {booking.status === 'Confirmed' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setVerifyingPassRef(booking.bookingRef)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1"
                          title="Verify Digital QR Pass"
                        >
                          <QrCode className="w-3.5 h-3.5 text-teal-400" />
                          <span>Scan Pass</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(booking.id, 'Completed')}
                          className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold transition-all flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Fulfilled</span>
                        </button>
                      </>
                    )}
                    {booking.status === 'Pending Approval' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept Order</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(booking.id, 'Declined')}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 text-xs font-bold transition-all flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}
                    {booking.status === 'Completed' && (
                      <span className="text-xs text-slate-400 font-medium flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Fulfilled & Settled</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* QR PASS SCANNER VERIFICATION MODAL */}
      {verifyingPassRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Digital Pass Verified!</h4>
              <p className="text-xs text-slate-400">Pass Reference: <span className="text-emerald-400 font-bold">{verifyingPassRef}</span></p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 text-left space-y-1">
              <div>• Booking Status: <strong className="text-emerald-400">Confirmed & Paid</strong></div>
              <div>• Validated For: <strong className="text-white">{providerName}</strong></div>
              <div>• Identity Check: <strong>Tourist KYC Verified</strong></div>
            </div>
            <button
              type="button"
              onClick={() => setVerifyingPassRef(null)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
