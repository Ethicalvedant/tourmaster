/**
 * ============================================================================
 * TourMaster AI - Unified API Connectives & Client Layer
 * ============================================================================
 * Centralized service layer connecting the React Frontend SPA with the
 * Python Flask / FastAPI backend endpoints, Gemini AI Engine, and live datasets.
 */

import { 
  Itinerary, 
  TripPlannerParams, 
  TouristSpot, 
  Hotel, 
  Restaurant, 
  Entertainment, 
  TaxiDriver, 
  TourGuide, 
  ServiceProvider, 
  Booking, 
  SOSAlert, 
  SafetyAdvisory 
} from '../types';

const API_BASE = '/api';

/**
 * Helper to handle JSON responses cleanly
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error [${res.status}] ${res.statusText}: ${errorBody}`);
  }

  return res.json();
}

// ============================================================================
// 1. TOURISM DATA & CATALOG APIs
// ============================================================================
export const tourismApi = {
  /** Fetch all tourist spots or filter by city/category */
  getSpots: async (city?: string, category?: string): Promise<TouristSpot[]> => {
    const params = new URLSearchParams();
    if (city && city !== 'all') params.append('city', city);
    if (category && category !== 'all') params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<TouristSpot[]>(`${API_BASE}/spots${query}`);
  },

  /** Fetch hotels list */
  getHotels: async (): Promise<Hotel[]> => {
    return fetchJson<Hotel[]>(`${API_BASE}/hotels`);
  },

  /** Fetch restaurants list */
  getRestaurants: async (): Promise<Restaurant[]> => {
    return fetchJson<Restaurant[]>(`${API_BASE}/restaurants`);
  },

  /** Fetch entertainments & experiences list */
  getEntertainments: async (): Promise<Entertainment[]> => {
    return fetchJson<Entertainment[]>(`${API_BASE}/entertainments`);
  },

  /** Fetch verified taxi drivers */
  getTaxis: async (): Promise<TaxiDriver[]> => {
    return fetchJson<TaxiDriver[]>(`${API_BASE}/taxis`);
  },

  /** Fetch certified tour guides */
  getGuides: async (): Promise<TourGuide[]> => {
    return fetchJson<TourGuide[]>(`${API_BASE}/guides`);
  },

  /** Fetch safety advisories */
  getAdvisories: async (): Promise<SafetyAdvisory[]> => {
    return fetchJson<SafetyAdvisory[]>(`${API_BASE}/advisories`);
  },

  /** Add a new spot (Admin) */
  addSpot: async (spotData: Partial<TouristSpot>): Promise<TouristSpot> => {
    return fetchJson<TouristSpot>(`${API_BASE}/spots`, {
      method: 'POST',
      body: JSON.stringify(spotData),
    });
  },

  /** Add a new advisory (Admin) */
  addAdvisory: async (advisoryData: Partial<SafetyAdvisory>): Promise<SafetyAdvisory> => {
    return fetchJson<SafetyAdvisory>(`${API_BASE}/advisories`, {
      method: 'POST',
      body: JSON.stringify(advisoryData),
    });
  }
};

// ============================================================================
// 2. AI GENERATIVE & ADAPTIVE APIs (Gemini Engine)
// ============================================================================
export const aiApi = {
  /** Generate AI dynamic itinerary based on user preferences */
  generateItinerary: async (params: TripPlannerParams): Promise<Itinerary> => {
    return fetchJson<Itinerary>(`${API_BASE}/ai/generate-itinerary`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /** Adapt existing itinerary to real-time weather & conditions */
  adaptWeather: async (payload: {
    itinerary: Itinerary;
    weatherCondition: string;
    temperature: string;
    city: string;
  }): Promise<Itinerary> => {
    return fetchJson<Itinerary>(`${API_BASE}/ai/adapt-weather`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Query AI Tour Guide Concierge */
  askTourGuide: async (payload: {
    message: string;
    city?: string;
    language?: string;
  }): Promise<{ reply: string; sources?: string[] }> => {
    return fetchJson<{ reply: string; sources?: string[] }>(`${API_BASE}/ai/tour-guide`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};

// ============================================================================
// 3. BOOKINGS & COMMERCE APIs
// ============================================================================
export const bookingApi = {
  /** Fetch all active bookings */
  getBookings: async (): Promise<Booking[]> => {
    return fetchJson<Booking[]>(`${API_BASE}/bookings`);
  },

  /** Create a new booking */
  createBooking: async (bookingData: Partial<Booking>): Promise<Booking> => {
    return fetchJson<Booking>(`${API_BASE}/bookings`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  /** Update booking status (e.g. Confirmed, Completed, Cancelled) */
  updateBookingStatus: async (bookingId: string, status: string): Promise<Booking> => {
    return fetchJson<Booking>(`${API_BASE}/bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
};

// ============================================================================
// 4. EMERGENCY SOS & SAFETY APIs
// ============================================================================
export const sosApi = {
  /** Fetch active SOS alerts (Admin / Dispatcher) */
  getSOSAlerts: async (): Promise<SOSAlert[]> => {
    return fetchJson<SOSAlert[]>(`${API_BASE}/sos`);
  },

  /** Trigger an emergency distress SOS signal */
  triggerSOS: async (sosPayload: {
    touristName: string;
    touristPhone: string;
    lat: number;
    lng: number;
    locationDescription?: string;
    emergencyType?: string;
    notes?: string;
  }): Promise<SOSAlert> => {
    return fetchJson<SOSAlert>(`${API_BASE}/sos`, {
      method: 'POST',
      body: JSON.stringify(sosPayload),
    });
  },

  /** Update status / dispatch unit on SOS alert */
  updateSOSStatus: async (sosId: string, updateData: {
    status?: string;
    dispatchedUnit?: string;
    notes?: string;
  }): Promise<SOSAlert> => {
    return fetchJson<SOSAlert>(`${API_BASE}/sos/${sosId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }
};

// ============================================================================
// 5. SERVICE PROVIDERS & ADMIN APIs
// ============================================================================
export const providerApi = {
  /** Get list of all registered service providers */
  getProviders: async (): Promise<ServiceProvider[]> => {
    return fetchJson<ServiceProvider[]>(`${API_BASE}/providers`);
  },

  /** Verify or update status of a service provider */
  verifyProvider: async (providerId: string, isVerified: boolean = true): Promise<ServiceProvider> => {
    return fetchJson<ServiceProvider>(`${API_BASE}/providers/${providerId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ isVerified }),
    });
  }
};

// ============================================================================
// 6. LIVE WEATHER & GEO-LOCATION APIs
// ============================================================================
export const locationApi = {
  /** Fetch live real-time weather for coordinate */
  getLiveWeather: async (lat: number, lng: number, city?: string) => {
    return fetchJson<{
      city: string;
      temp: string;
      condition: string;
      humidity: string;
      wind: string;
      advisory?: string;
    }>(`${API_BASE}/weather/live`, {
      method: 'POST',
      body: JSON.stringify({ lat, lng, city }),
    });
  },

  /** Detect approximate user location via IP fallback */
  detectIpLocation: async () => {
    return fetchJson<{
      lat: number;
      lng: number;
      city: string;
      region: string;
      country: string;
    }>(`${API_BASE}/location/ip-detect`);
  }
};

// ============================================================================
// 7. FEEDBACK & COMPLAINTS APIs
// ============================================================================
export const feedbackApi = {
  submitFeedback: async (feedback: {
    touristName: string;
    rating: number;
    category: string;
    comments: string;
  }) => {
    return fetchJson(`${API_BASE}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },

  submitComplaint: async (complaint: {
    touristName: string;
    touristContact: string;
    incidentType: string;
    location: string;
    description: string;
  }) => {
    return fetchJson(`${API_BASE}/complaints`, {
      method: 'POST',
      body: JSON.stringify(complaint),
    });
  }
};

// ============================================================================
// 8. SYSTEM HEALTH CHECK
// ============================================================================
export const systemApi = {
  getHealth: async () => {
    return fetchJson<{
      status: string;
      app: string;
      hackathon: string;
      problemStatement: string;
      team: string;
      hasGeminiKey: boolean;
    }>(`${API_BASE}/health`);
  }
};

/** Default unified export */
export const api = {
  tourism: tourismApi,
  ai: aiApi,
  booking: bookingApi,
  sos: sosApi,
  provider: providerApi,
  location: locationApi,
  feedback: feedbackApi,
  system: systemApi,
};

export default api;
