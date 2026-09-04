export type PortalMode = 'tourist' | 'provider' | 'admin' | 'sih-explorer';

export type TravelInterest =
  | 'Heritage & Culture'
  | 'Nature & Wildlife'
  | 'Adventure & Trekking'
  | 'Spiritual & Wellness'
  | 'Food & Culinary'
  | 'Beach & Leisure'
  | 'Eco-Tourism & Rural';

export type GroupType = 'Solo' | 'Couple' | 'Family with Kids' | 'Friends Group' | 'Senior Citizens';

export type TravelStyle = 'Budget / Backpacker' | 'Balanced / Smart' | 'Premium / Luxury' | 'Eco-Conscious';

export interface TripPlannerParams {
  destination: string;
  startCity: string;
  days: number;
  budget: number;
  budgetINR?: number;
  durationDays?: number;
  travelers: number;
  groupType: GroupType;
  interests: TravelInterest[];
  travelStyle: TravelStyle;
  transportPreference: 'EV / Green' | 'Public / Metro' | 'Private Cab' | 'Self-Drive';
  isMonsoonOrRainy?: boolean;
}

export type TripPreferences = TripPlannerParams;

export interface ActivityItem {
  id: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  timeRange: string;
  title: string;
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  estimatedCost: number;
  category: 'Spot' | 'Food' | 'Stay' | 'Transit' | 'Activity' | 'Guide';
  verifiedProvider?: string;
  weatherSuitability: 'All-Weather' | 'Outdoor-Ideal' | 'Indoor-Alternative';
  isEcoFriendly: boolean;
  ecoTips?: string;
  recommendedDuration: string;
  image?: string;
}

export interface DayPlan {
  dayNumber: number;
  theme: string;
  activities: ActivityItem[];
  dayWeather: {
    temp: string;
    condition: 'Sunny' | 'Partly Cloudy' | 'Rain / Monsoon' | 'Pleasant' | 'Hot';
    advisory: string;
  };
  dayBudget: number;
  dayCarbonSavedKg: number;
}

export interface EcoScoreBreakdown {
  totalScore: number; // 0-100
  badge: 'Emerald Pioneer' | 'Green Guardian' | 'Eco Voyager' | 'Conscious Traveler';
  ecoStayScore: number; // 0-25
  greenTransportScore: number; // 0-25
  localBusinessScore: number; // 0-25
  routeEfficiencyScore: number; // 0-25
  carbonSavedKg: number;
  recommendations: string[];
}

export interface BudgetBreakdown {
  totalEstimated: number;
  targetBudget: number;
  isWithinBudget: boolean;
  variancePercentage: number;
  perPersonCost: number;
  categories: {
    stays: number;
    transport: number;
    food: number;
    sightseeing: number;
    activities: number;
    guideAndSafety: number;
  };
  costSavingTips: string[];
}

export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  overview: string;
  durationDays: number;
  generatedAt?: string;
  days: DayPlan[];
  ecoScore: EcoScoreBreakdown;
  budget: BudgetBreakdown;
  budgetBreakdown?: BudgetBreakdown;
  routeSummary?: {
    totalDistanceKm: number;
    estimatedTransitHours: number;
    transportMode?: string;
  };
  smartRoute?: {
    totalDistanceKm: number;
    estimatedTransitHours: number;
    optimalSequence?: string[];
  };
  localSafetyAdvisory?: string;
}

export interface TouristSpot {
  id: string;
  name: string;
  city: string;
  state: string;
  category: TravelInterest;
  description: string;
  lat: number;
  lng: number;
  timings?: string;
  entryFee?: number;
  rating?: number;
  reviewsCount?: number;
  ecoScore?: number;
  isVerified?: boolean;
  imageUrl?: string;
  bestTimeToVisit?: string;
  nearestTransport?: string;
  tags?: string[];
}

export type ProviderType = 'Hotel' | 'Homestay' | 'EV Cab' | 'Taxi' | 'Tour Guide' | 'Guide' | 'Local Eatery' | 'Restaurant' | 'Artisan Workshop' | 'Activity' | 'Spot';

export interface TourPackage {
  id: string;
  title: string;
  duration: string;
  destinations: string[];
  theme: 'Heritage' | 'Adventure' | 'Spiritual' | 'Leisure';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  badge: string;
  image: string;
  highlights: string[];
  inclusions: string[];
}

export interface DistrictZone {
  id: string;
  name: string;
  district: string;
  spotCount: number;
  icon: string;
  description: string;
}

export interface Destination {
  id: string;
  name: string;
  city?: string;
  state: string;
  description: string;
  imageUrl?: string;
  image?: string;
  spotsCount?: number;
  popularFor?: string[];
  popularTags?: string[];
  rating: number;
  weather?: string;
  avgEcoScore?: number;
  tagline?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: ProviderType;
  city: string;
  rating: number;
  verified: boolean;
  pricePerUnit: number;
  unitLabel: string; // "per night", "per day", "per trip"
  description: string;
  contactNumber: string;
  availableSlots: number;
  ecoCertified: boolean;
  ecoTier?: 'Gold Green' | 'Silver Eco' | 'Bronze Standard';
  image: string;
  languages?: string[];
  vehicleModel?: string;
  amenities?: string[];
  isLiveAvailable?: boolean;
  kycStatus?: 'Verified' | 'Pending Review' | 'Rejected';
  licenseNumber?: string;
  joinedYear?: number;
}

export interface Booking {
  id: string;
  bookingRef: string;
  touristName: string;
  touristEmail: string;
  touristPhone: string;
  destination: string;
  items: {
    providerId: string;
    providerName: string;
    type: ProviderType;
    details: string;
    amount: number;
  }[];
  totalAmount: number;
  paymentMethod: 'UPI' | 'Razorpay' | 'Card' | 'NetBanking';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  bookingDate: string;
  travelDates: string;
  qrPayload: string;
  status: 'Confirmed' | 'Pending Approval' | 'Declined' | 'Completed';
}

export interface SOSAlert {
  id: string;
  alertCode: string;
  touristName: string;
  touristPhone: string;
  lat: number;
  lng: number;
  locationDescription: string;
  timestamp: string;
  emergencyType: 'Medical' | 'Harassment / Safety' | 'Lost / Stranded' | 'Accident' | 'Other';
  status: 'Active' | 'Dispatched' | 'Resolved';
  dispatchedUnit?: string;
  notes?: string;
}

export interface OrganisationAdvisory {
  id: string;
  title: string;
  severity: 'Critical' | 'Warning' | 'Info';
  category: 'Weather' | 'Crowd Management' | 'Heritage Protection' | 'Emergency' | 'Special Event';
  targetCity: string;
  message: string;
  issuedBy: string;
  timestamp: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  audioUrl?: string;
  isBookingIntent?: boolean;
  bookingCategory?: 'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary';
}

export interface HotelItem {
  id: string;
  tourismSpot: string;
  hotelName: string;
  distanceFromSpot?: string;
  distanceKm?: number;
  rating?: number;
  pricePerNight?: number;
  image?: string;
  amenities?: string[];
}

export interface RestaurantItem {
  id: string;
  tourismSpot: string;
  restaurantName: string;
  distanceFromSpot?: string;
  distanceKm?: number;
  cuisine?: string;
  priceForTwo?: number;
  rating?: number;
  isPureVeg?: boolean;
}

export interface EntertainmentItem {
  id: string;
  tourismSpot: string;
  entertainmentPlace: string;
  distanceFromSpot?: string;
  distanceKm?: number;
  category?: string;
  approxEntryFee?: number;
  rating?: number;
}

export interface TaxiRoute {
  id: string;
  tourismSpot: string;
  distanceFromPune?: string;
  distanceKm?: number;
  approxTaxiFare?: string;
  fareAmount?: number;
  bestTravelOption?: string;
}

export interface GuideItem {
  id: string;
  tourismSpot: string;
  guideName: string;
  approxGuidePrice?: string;
  priceINR?: number;
  dailyRate?: number;
  rating?: number;
  languages: string[];
  experienceYears?: number;
  specialization?: string;
}

export interface FeedbackItem {
  id: string;
  touristName: string;
  rating: number;
  category: 'Hotel' | 'Guide' | 'Taxi' | 'Spot' | 'General';
  targetName: string;
  comment: string;
  date: string;
}

export interface ComplaintItem {
  id: string;
  complaintRef: string;
  touristName: string;
  touristPhone: string;
  touristEmail: string;
  category: 'Service Quality' | 'Overcharging' | 'Safety / Misconduct' | 'Cleanliness' | 'Booking Issue' | 'Other';
  subject: string;
  description: string;
  targetEntity?: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  resolutionNotes?: string;
}

export interface UserAuth {
  id: string;
  name: string;
  email: string;
  role: 'tourist' | 'provider' | 'admin';
  phone?: string;
  avatar?: string;
  providerType?: string;
  isAuthenticated: boolean;
}