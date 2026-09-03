import React, { useState, useEffect } from 'react';
import { 
  MapPin, Hotel, Utensils, Compass, Car, UserCheck, Sparkles, Star, 
  Search, Filter, Plus, CheckCircle, AlertTriangle, ShieldAlert, Heart,
  MessageSquare, Send, Award, Clock, ArrowRight, IndianRupee, Tag, Layers
} from 'lucide-react';
import { 
  TouristSpot, HotelItem, RestaurantItem, EntertainmentItem, TaxiRoute, GuideItem, FeedbackItem, ComplaintItem 
} from '../../types';
import { 
  MASTER_TOURIST_SPOTS, MASTER_HOTELS, MASTER_RESTAURANTS, MASTER_ENTERTAINMENTS, 
  MASTER_TAXIS, MASTER_GUIDES, INITIAL_FEEDBACKS, INITIAL_COMPLAINTS 
} from '../../data/mockTourismData';

interface TouristDiscoveryHubProps {
  onSelectSpotForTrip?: (spot: TouristSpot) => void;
  onBookItem?: (item: any) => void;
  onTriggerSOS: () => void;
}

export const TouristDiscoveryHub: React.FC<TouristDiscoveryHubProps> = ({
  onSelectSpotForTrip,
  onBookItem,
  onTriggerSOS,
}) => {
  const [activeTab, setActiveTab] = useState<'spots' | 'hotels' | 'restaurants' | 'entertainment' | 'taxis' | 'guides' | 'feedback' | 'complaints'>('spots');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpotFilter, setSelectedSpotFilter] = useState('All');

  // Feedback form state
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(INITIAL_FEEDBACKS);
  const [fbName, setFbName] = useState('');
  const [fbCategory, setFbCategory] = useState<'Hotel' | 'Guide' | 'Taxi' | 'Spot' | 'General'>('Spot');
  const [fbTarget, setFbTarget] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState('');
  const [fbSuccess, setFbSuccess] = useState(false);

  // Complaints form state
  const [complaints, setComplaints] = useState<ComplaintItem[]>(INITIAL_COMPLAINTS);
  const [cmpName, setCmpName] = useState('');
  const [cmpPhone, setCmpPhone] = useState('');
  const [cmpEmail, setCmpEmail] = useState('');
  const [cmpCategory, setCmpCategory] = useState<'Service Quality' | 'Overcharging' | 'Safety / Misconduct' | 'Cleanliness' | 'Booking Issue' | 'Other'>('Service Quality');
  const [cmpSubject, setCmpSubject] = useState('');
  const [cmpDescription, setCmpDescription] = useState('');
  const [cmpTarget, setCmpTarget] = useState('');
  const [cmpSuccess, setCmpSuccess] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbName.trim() || !fbComment.trim()) return;

    const payload = {
      touristName: fbName,
      rating: fbRating,
      category: fbCategory,
      targetName: fbTarget || 'General Experience',
      comment: fbComment,
    };

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      setFeedbacks((prev) => [created, ...prev]);
      setFbSuccess(true);
      setFbName('');
      setFbComment('');
      setFbTarget('');
      setTimeout(() => setFbSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmpName.trim() || !cmpSubject.trim() || !cmpDescription.trim()) return;

    const payload = {
      touristName: cmpName,
      touristPhone: cmpPhone,
      touristEmail: cmpEmail,
      category: cmpCategory,
      subject: cmpSubject,
      description: cmpDescription,
      targetEntity: cmpTarget || 'Vendor / Attraction',
    };

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      setComplaints((prev) => [created, ...prev]);
      setCmpSuccess(true);
      setCmpName('');
      setCmpPhone('');
      setCmpEmail('');
      setCmpSubject('');
      setCmpDescription('');
      setCmpTarget('');
      setTimeout(() => setCmpSuccess(false), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered lists
  const filteredSpots = MASTER_TOURIST_SPOTS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHotels = MASTER_HOTELS.filter((h) => {
    const matchSearch = h.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) || h.tourismSpot.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSpot = selectedSpotFilter === 'All' || h.tourismSpot.toLowerCase() === selectedSpotFilter.toLowerCase();
    return matchSearch && matchSpot;
  });

  const filteredRestaurants = MASTER_RESTAURANTS.filter((r) => {
    const matchSearch = r.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) || r.tourismSpot.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSpot = selectedSpotFilter === 'All' || r.tourismSpot.toLowerCase() === selectedSpotFilter.toLowerCase();
    return matchSearch && matchSpot;
  });

  const filteredEntertainments = MASTER_ENTERTAINMENTS.filter((e) => {
    const matchSearch = e.entertainmentPlace.toLowerCase().includes(searchQuery.toLowerCase()) || e.tourismSpot.toLowerCase().includes(searchQuery.toLowerCase()) || e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSpot = selectedSpotFilter === 'All' || e.tourismSpot.toLowerCase() === selectedSpotFilter.toLowerCase();
    return matchSearch && matchSpot;
  });

  const filteredTaxis = MASTER_TAXIS.filter(
    (t) =>
      t.tourismSpot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bestTravelOption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGuides = MASTER_GUIDES.filter((g) => {
    const matchSearch = g.guideName.toLowerCase().includes(searchQuery.toLowerCase()) || g.tourismSpot.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSpot = selectedSpotFilter === 'All' || g.tourismSpot.toLowerCase() === selectedSpotFilter.toLowerCase();
    return matchSearch && matchSpot;
  });

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Section 1 • Tourist Facility Explorer
            </span>
            <span className="text-xs text-slate-400">SIH 2026 PS 26204 Tourism Database</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1.5">
            Discover Spots, Hotels, Restaurants, Taxis & Guides
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified datasets, check distance from Pune, review standard taxi fares, and submit ratings or complaints.
          </p>
        </div>

        {/* Global Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search spots, hotels, food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 shadow-inner"
          />
        </div>
      </div>

      {/* Sub-Tabs Bar for the 8 Tourist Facilities */}
      <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto text-xs sm:text-sm font-semibold">
        {[
          { id: 'spots', label: '1. Tourism Spots', icon: Compass, count: MASTER_TOURIST_SPOTS.length },
          { id: 'hotels', label: '2. Hotels', icon: Hotel, count: MASTER_HOTELS.length },
          { id: 'restaurants', label: '3. Restaurants', icon: Utensils, count: MASTER_RESTAURANTS.length },
          { id: 'entertainment', label: '4. Entertainment', icon: Sparkles, count: MASTER_ENTERTAINMENTS.length },
          { id: 'taxis', label: '5. Taxi Fares', icon: Car, count: MASTER_TAXIS.length },
          { id: 'guides', label: '6. Tour Guides', icon: UserCheck, count: MASTER_GUIDES.length },
          { id: 'feedback', label: '7. Rating & Feedback', icon: Star, count: feedbacks.length },
          { id: 'complaints', label: '8. Complaints & SOS', icon: ShieldAlert, count: complaints.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. TOURISM SPOTS VIEW */}
      {activeTab === 'spots' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={spot.imageUrl}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      Eco {spot.ecoScore}/100
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium">
                      ★ {spot.rating} ({spot.reviewsCount.toLocaleString()} reviews)
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-white text-sm sm:text-base">{spot.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{spot.description}</p>
                    
                    <div className="text-[11px] text-slate-400 flex flex-wrap gap-2 pt-1">
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-semibold">Entry: ₹{spot.entryFee}</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">{spot.timings}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center space-x-1 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{spot.nearestTransport}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => onSelectSpotForTrip && onSelectSpotForTrip(spot)}
                    className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Add to AI Trip Plan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. HOTELS VIEW (hotels.csv) */}
      {activeTab === 'hotels' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between"
              >
                <div className="flex space-x-3.5">
                  <img
                    src={hotel.image}
                    alt={hotel.hotelName}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1 truncate flex-1">
                    <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                      Near: {hotel.tourismSpot}
                    </span>
                    <h4 className="font-bold text-white text-sm truncate">{hotel.hotelName}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      <span>{hotel.distanceFromSpot} from spot</span>
                    </p>
                    <div className="text-xs font-bold text-emerald-400 pt-1">
                      ₹{hotel.pricePerNight} <span className="text-[10px] text-slate-500 font-normal">/ night</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{hotel.rating}</span>
                  </div>
                  <button
                    onClick={() => onBookItem && onBookItem(hotel)}
                    className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all"
                  >
                    Book Stay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RESTAURANTS VIEW (restaurants.csv) */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRestaurants.map((rst) => (
              <div
                key={rst.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Near: {rst.tourismSpot}
                  </span>
                  {rst.isPureVeg && (
                    <span className="text-[9px] font-bold text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                      PURE VEG
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-white text-sm">{rst.restaurantName}</h4>
                <p className="text-xs text-slate-400">{rst.cuisine}</p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-900">
                  <span>Distance: <strong className="text-white">{rst.distanceFromSpot}</strong></span>
                  <span className="text-emerald-400 font-bold">~₹{rst.priceForTwo} for two</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ENTERTAINMENT ACTIVITIES VIEW (entertainments.csv) */}
      {activeTab === 'entertainment' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntertainments.map((ent) => (
              <div
                key={ent.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all space-y-2"
              >
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  Near: {ent.tourismSpot}
                </span>

                <h4 className="font-bold text-white text-sm">{ent.entertainmentPlace}</h4>
                <p className="text-xs text-slate-400">{ent.category}</p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-900">
                  <span>Distance: <strong className="text-white">{ent.distanceFromSpot}</strong></span>
                  <span className="text-purple-300 font-bold">
                    {ent.approxEntryFee > 0 ? `Entry: ₹${ent.approxEntryFee}` : 'Free Entry'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAXI FARES VIEW (taxis.csv) */}
      {activeTab === 'taxis' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            🚕 <strong>Official Pune City Taxi & Cab Fare Matrix:</strong> Standard government-verified one-way fares to major tourist destinations across Pune and Sahyadri circuits.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTaxis.map((tax) => (
              <div
                key={tax.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{tax.tourismSpot}</h4>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                    {tax.approxTaxiFare}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center space-x-1">
                  <span>Distance from Pune: </span>
                  <strong className="text-slate-200">{tax.distanceFromPune}</strong>
                </div>

                <div className="text-[11px] text-slate-500 pt-1">
                  Best Travel Mode: <strong className="text-teal-300">{tax.bestTravelOption}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TOUR GUIDES VIEW (guides.csv) */}
      {activeTab === 'guides' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuides.map((gd) => (
              <div
                key={gd.id}
                className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                    Spot: {gd.tourismSpot}
                  </span>
                  <h4 className="font-bold text-white text-sm sm:text-base">{gd.guideName}</h4>
                  <p className="text-[11px] text-slate-400">
                    Languages: {gd.languages.join(', ')}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-xs">
                  <span className="text-emerald-400 font-bold text-sm">{gd.approxGuidePrice}</span>
                  <button
                    onClick={() => onBookItem && onBookItem(gd)}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all"
                  >
                    Hire Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. RATING & FEEDBACK FORM */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submit Feedback Form */}
          <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Submit Tour Rating & Feedback</span>
            </h3>

            {fbSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Thank you! Your verified feedback has been published.</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Deshmukh"
                  value={fbName}
                  onChange={(e) => setFbName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={fbCategory}
                    onChange={(e) => setFbCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option>Spot</option>
                    <option>Hotel</option>
                    <option>Guide</option>
                    <option>Taxi</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={fbRating}
                    onChange={(e) => setFbRating(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={5}>★★★★★ (5/5 Excellent)</option>
                    <option value={4}>★★★★☆ (4/5 Very Good)</option>
                    <option value={3}>★★★☆☆ (3/5 Average)</option>
                    <option value={2}>★★☆☆☆ (2/5 Poor)</option>
                    <option value={1}>★☆☆☆☆ (1/5 Terrible)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Place / Provider Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sinhagad Fort / Shantai Hotel"
                  value={fbTarget}
                  onChange={(e) => setFbTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Review Comments</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your experience for fellow tourists..."
                  value={fbComment}
                  onChange={(e) => setFbComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Submit Verified Feedback
              </button>
            </form>
          </div>

          {/* Recent Reviews Stream */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-base font-bold text-white">Recent Verified Tourist Feedback ({feedbacks.length})</h3>
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-xs sm:text-sm">{fb.touristName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                      {fb.category}: {fb.targetName}
                    </span>
                  </div>
                  <span className="text-amber-400 text-xs font-bold">{'★'.repeat(fb.rating)}</span>
                </div>
                <p className="text-xs text-slate-300 italic">"{fb.comment}"</p>
                <span className="text-[10px] text-slate-500 block">{fb.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. COMPLAINTS & EMERGENCY SOS FORM */}
      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Complaints Form */}
          <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Register Official Tourism Grievance / Complaint</span>
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              Submitted complaints are routed directly to the Regional Tourism Authority & District Police Monitoring Cell for investigation.
            </p>

            {cmpSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Grievance registered successfully! Ref assigned & routed to Admin Command.</span>
              </div>
            )}

            <form onSubmit={handleSubmitComplaint} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Siddharth Rao"
                    value={cmpName}
                    onChange={(e) => setCmpName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98000 00000"
                    value={cmpPhone}
                    onChange={(e) => setCmpPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Grievance Category</label>
                  <select
                    value={cmpCategory}
                    onChange={(e) => setCmpCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option>Overcharging</option>
                    <option>Service Quality</option>
                    <option>Safety / Misconduct</option>
                    <option>Cleanliness</option>
                    <option>Booking Issue</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Entity / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Khadakwasla Dam Parking"
                    value={cmpTarget}
                    onChange={(e) => setCmpTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Complaint Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of grievance"
                  value={cmpSubject}
                  onChange={(e) => setCmpSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide precise details, vendor names, or evidence..."
                  value={cmpDescription}
                  onChange={(e) => setCmpDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Register Official Complaint
              </button>
            </form>
          </div>

          {/* Emergency SOS Quick Trigger Box */}
          <div className="lg:col-span-5 bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-950 p-5 rounded-2xl border border-rose-900/50 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Emergency Assistance & Police SOS</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you are in immediate personal danger, stranded on Sahyadri mountain trails, or facing harassment, tap the red SOS beacon to transmit your exact GPS coordinates to nearest Police PCR vans and mountain rangers.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={onTriggerSOS}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-sm tracking-wider shadow-lg shadow-rose-600/40 transition-all animate-pulse flex items-center justify-center space-x-2"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>TRIGGER 1-TOUCH EMERGENCY SOS</span>
              </button>

              <div className="text-[11px] text-slate-400 text-center space-y-1">
                <div>National Emergency: <strong className="text-white">112</strong> | Tourist Helpline: <strong className="text-white">1363</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
