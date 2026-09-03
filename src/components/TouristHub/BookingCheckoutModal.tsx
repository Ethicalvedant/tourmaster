import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, ShieldCheck, CheckCircle2, IndianRupee, Printer, Download, Sparkles, X, Hotel, Car, UserCheck, Ticket, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, UserAuth } from '../../types';

interface BookingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  totalEstimated: number;
  durationDays: number;
  userAuth?: UserAuth | null;
  customBookingDetails?: any;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  isOpen,
  onClose,
  destination,
  totalEstimated,
  durationDays,
  userAuth,
  customBookingDetails,
}) => {
  const [step, setStep] = useState<'checkout' | 'confirmation'>('checkout');
  const [touristName, setTouristName] = useState(userAuth?.name || 'Aarav Sharma');
  const [touristEmail, setTouristEmail] = useState(userAuth?.email || 'aarav.sharma@example.com');
  const [touristPhone, setTouristPhone] = useState(userAuth?.phone || '+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (userAuth) {
      if (userAuth.name) setTouristName(userAuth.name);
      if (userAuth.email) setTouristEmail(userAuth.email);
      if (userAuth.phone) setTouristPhone(userAuth.phone);
    }
  }, [userAuth]);

  const bundleTotal = customBookingDetails?.totalEstimated || Math.max(3200, Math.round(totalEstimated * 0.45));

  const handleProcessPayment = async () => {
    if (userAuth && userAuth.role !== 'tourist') {
      alert('Only tourist accounts can make tour bookings. Service Providers and Admins manage reservations through their portals.');
      return;
    }

    setIsProcessing(true);

    try {
      // Build dynamic items if customized in booking builder
      let dynamicItems = [];
      if (customBookingDetails?.spots?.length > 0) {
        customBookingDetails.spots.forEach((spot: any) => {
          dynamicItems.push({
            providerId: 'prov-spot-' + spot.id,
            providerName: spot.name,
            type: 'Hotel' as any,
            details: `Entry Pass (${customBookingDetails.travelersCount || 2} Visitors)`,
            amount: spot.entryFee * (customBookingDetails.travelersCount || 2),
          });
        });
      }

      if (customBookingDetails?.hotel) {
        dynamicItems.push({
          providerId: 'prov-stay-1',
          providerName: customBookingDetails.hotel.item?.hotelName || 'Eco-Stay Partner Hotel',
          type: 'Hotel' as any,
          details: `${customBookingDetails.hotel.rooms} Room(s) x ${customBookingDetails.hotel.nights} Night(s)`,
          amount: customBookingDetails.hotelTotal || (customBookingDetails.hotel.item?.pricePerNight * customBookingDetails.hotel.rooms * customBookingDetails.hotel.nights) || 2800,
        });
      }

      if (customBookingDetails?.restaurants?.length > 0) {
        customBookingDetails.restaurants.forEach((r: any) => {
          dynamicItems.push({
            providerId: 'prov-food-1',
            providerName: r.item?.restaurantName || 'Authentic Dining Partner',
            type: 'Local Eatery' as any,
            details: `Dining Reservation (${r.guests} Guests) - ${r.item?.cuisine || 'Traditional'}`,
            amount: r.item?.priceForTwo * Math.ceil(r.guests / 2) || 700,
          });
        });
      }

      if (customBookingDetails?.taxi) {
        dynamicItems.push({
          providerId: 'prov-cab-1',
          providerName: 'GreenRide EV Cab Fleet Pune',
          type: 'EV Cab' as any,
          details: `${customBookingDetails.taxi.vehicleType || 'EV Cab'} - ${customBookingDetails.taxi.route?.tourismSpot || destination} Sightseeing Transit`,
          amount: customBookingDetails.taxiTotal || 1800,
        });
      }

      if (customBookingDetails?.guide) {
        dynamicItems.push({
          providerId: 'prov-guide-1',
          providerName: customBookingDetails.guide.item?.guideName || 'Govt. Certified Local Guide',
          type: 'Tour Guide' as any,
          details: `${customBookingDetails.guide.days} Day(s) Cultural Storyteller (${(customBookingDetails.guide.item?.languages || ['English', 'Hindi']).join(', ')})`,
          amount: customBookingDetails.guideTotal || 1200,
        });
      }

      // Default fallback items if none selected
      if (dynamicItems.length === 0) {
        dynamicItems = [
          {
            providerId: 'prov-stay-1',
            providerName: 'Verified Eco-Stay & Homestay',
            type: 'Hotel' as any,
            details: 'Solar powered heritage room with organic breakfast',
            amount: Math.round(bundleTotal * 0.55),
          },
          {
            providerId: 'prov-cab-1',
            providerName: 'GreenRide EV Fleet',
            type: 'EV Cab' as any,
            details: 'Zero-carbon private electric cab with verified driver',
            amount: Math.round(bundleTotal * 0.30),
          },
          {
            providerId: 'prov-guide-1',
            providerName: 'Govt. Certified Local Guide',
            type: 'Tour Guide' as any,
            details: 'Certified cultural storyteller & heritage pass',
            amount: Math.round(bundleTotal * 0.15),
          },
        ];
      }

      const payload = {
        touristName,
        touristEmail,
        touristPhone,
        destination: customBookingDetails?.destination || destination,
        totalAmount: bundleTotal,
        paymentMethod: 'Razorpay',
        travelDates: customBookingDetails?.travelDate ? `${customBookingDetails.travelDate} (${durationDays} Days)` : `${durationDays} Days Tour`,
        items: dynamicItems,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setCreatedBooking(data);
      setStep('confirmation');

      // Sync with user's local bookings list
      try {
        const existing = JSON.parse(localStorage.getItem('tourmaster_user_bookings') || '[]');
        const updated = [data, ...(Array.isArray(existing) ? existing : [])];
        localStorage.setItem('tourmaster_user_bookings', JSON.stringify(updated));
      } catch (e) {}

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-white">
                {step === 'checkout' ? 'Unified Travel Booking & Pass' : 'TourMaster Digital Travel Pass'}
              </h3>
              <p className="text-xs text-slate-400">
                {step === 'checkout' ? `Bundled Instant Checkout for ${destination}` : 'Verified Booking E-Ticket & QR'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {step === 'checkout' ? (
            <div className="space-y-4">
              {/* Bundle items summary */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <span className="text-xs font-semibold text-slate-300 block">
                  Included in Unified Package:
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Hotel className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Certified Eco-Homestay / Heritage Stay</span>
                    </div>
                    <span className="font-semibold">₹{Math.round(bundleTotal * 0.55).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Car className="w-3.5 h-3.5 text-cyan-400" />
                      <span>GreenRide EV Cab Sightseeing Chauffeur</span>
                    </div>
                    <span className="font-semibold">₹{Math.round(bundleTotal * 0.30).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Govt. Certified Guide & Priority Entry Passes</span>
                    </div>
                    <span className="font-semibold">₹{Math.round(bundleTotal * 0.15).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                  <span className="text-white">Total Package Amount:</span>
                  <span className="text-emerald-400 text-base font-display">
                    ₹{bundleTotal.toLocaleString('en-IN')} INR
                  </span>
                </div>
              </div>

              {/* Tourist Info inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Traveler Name</label>
                  <input
                    type="text"
                    value={touristName}
                    onChange={(e) => setTouristName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile (for SMS & SOS updates)</label>
                  <input
                    type="text"
                    value={touristPhone}
                    onChange={(e) => setTouristPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Payment Gateway selector (Razorpay Simulation) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Payment Gateway (Razorpay Integrated):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / GPay / Paytm', icon: Smartphone },
                    { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
                    { id: 'NetBanking', label: 'Net Banking', icon: ShieldCheck },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          paymentMethod === m.id
                            ? 'bg-emerald-500/20 text-white border-emerald-500 ring-1 ring-emerald-500'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-emerald-400 mb-1" />
                        <span className="font-semibold block">{m.id}</span>
                        <span className="text-[10px] text-slate-400">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Secure Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ₹{bundleTotal.toLocaleString('en-IN')} & Generate Digital Pass</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Digital Pass Voucher confirmation view */
            <div className="space-y-4 animate-fade-in text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  BOOKING CONFIRMED • {createdBooking?.bookingRef || 'TM-2026-CONFIRMED'}
                </span>
                <h3 className="text-xl font-bold font-display text-white mt-2">
                  Your Digital Travel Pass is Active!
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Present this QR code at participating verified stays, EV cabs, and monuments.
                </p>
              </div>

              {/* Digital Pass Ticket Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 text-left relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">TourMaster Eco-Pass</span>
                    <span className="font-bold text-white text-base">{destination}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-slate-950">
                    VERIFIED TICKET
                  </span>
                </div>

                <div className="my-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Traveler:</span>
                      <span className="font-bold text-white">{createdBooking?.touristName || touristName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Booking Ref:</span>
                      <span className="font-mono text-emerald-400">{createdBooking?.bookingRef || 'TM-2026-JP-9482'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Payment:</span>
                      <span className="font-semibold text-slate-300">Paid ₹{bundleTotal.toLocaleString('en-IN')} (Razorpay)</span>
                    </div>
                  </div>

                  {/* Visual QR Code Placeholder with authentic styling */}
                  <div className="p-2.5 bg-white rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-lg">
                    <QrCode className="w-20 h-20 text-slate-950" />
                    <span className="text-[8px] font-mono text-slate-600 mt-1 font-bold">SCAN AT GATE</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-dashed border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Includes: Eco Stay • EV Cab • Guide Pass</span>
                  <span className="text-emerald-400 font-bold">SOS Enabled</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Pass / PDF</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
