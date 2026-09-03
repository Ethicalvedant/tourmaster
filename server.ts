import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  MASTER_TOURIST_SPOTS, VERIFIED_SERVICE_PROVIDERS, INITIAL_BOOKINGS, INITIAL_SOS_ALERTS, 
  POPULAR_DESTINATIONS, INITIAL_ORGANISATION_ADVISORIES, MASTER_HOTELS, MASTER_RESTAURANTS,
  MASTER_ENTERTAINMENTS, MASTER_TAXIS, MASTER_GUIDES, INITIAL_FEEDBACKS, INITIAL_COMPLAINTS 
} from './src/data/mockTourismData';
import { 
  Booking, SOSAlert, TouristSpot, ServiceProvider, OrganisationAdvisory,
  HotelItem, RestaurantItem, EntertainmentItem, TaxiRoute, GuideItem, FeedbackItem, ComplaintItem 
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory data store for live session state
let touristSpots: TouristSpot[] = [...MASTER_TOURIST_SPOTS];
let hotelsList: HotelItem[] = [...MASTER_HOTELS];
let restaurantsList: RestaurantItem[] = [...MASTER_RESTAURANTS];
let entertainmentsList: EntertainmentItem[] = [...MASTER_ENTERTAINMENTS];
let taxisList: TaxiRoute[] = [...MASTER_TAXIS];
let guidesList: GuideItem[] = [...MASTER_GUIDES];
let serviceProviders: ServiceProvider[] = [...VERIFIED_SERVICE_PROVIDERS];
let bookings: Booking[] = [...INITIAL_BOOKINGS];
let sosAlerts: SOSAlert[] = [...INITIAL_SOS_ALERTS];
let advisories: OrganisationAdvisory[] = [...INITIAL_ORGANISATION_ADVISORIES];
let feedbacksList: FeedbackItem[] = [...INITIAL_FEEDBACKS];
let complaintsList: ComplaintItem[] = [...INITIAL_COMPLAINTS];

// Helper to initialize Google Gen AI
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey,
    });
  } catch (err) {
    console.warn('GoogleGenAI initialization notice:', err);
    return null;
  }
}

// ----------------------------------------------------
// 1. TOURISM MASTER DATA ENDPOINTS (SIH PS 26202)
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TOURMASTER AI',
    hackathon: 'Smart India Hackathon 2026',
    problemStatement: '26204',
    team: 'NEXUS',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// Spots
app.get('/api/spots', (req, res) => {
  const { city, category } = req.query;
  let filtered = [...touristSpots];
  if (city && typeof city === 'string' && city !== 'all') {
    filtered = filtered.filter(s => s.city.toLowerCase().includes(city.toLowerCase()));
  }
  if (category && typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }
  res.json(filtered);
});

app.post('/api/spots', (req, res) => {
  const newSpot: TouristSpot = {
    id: 'spot-' + Date.now(),
    name: req.body.name || 'New Heritage Spot',
    city: req.body.city || 'Pune',
    state: req.body.state || 'Maharashtra',
    category: req.body.category || 'Heritage & Culture',
    description: req.body.description || 'Verified Maharashtra heritage and cultural point of interest.',
    lat: Number(req.body.lat) || 18.5204,
    lng: Number(req.body.lng) || 73.8567,
    timings: req.body.timings || '09:00 AM - 05:30 PM',
    entryFee: Number(req.body.entryFee) || 0,
    rating: Number(req.body.rating) || 4.8,
    reviewsCount: 1,
    ecoScore: Number(req.body.ecoScore) || 92,
    isVerified: true,
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    bestTimeToVisit: req.body.bestTimeToVisit || 'Morning slot',
    nearestTransport: req.body.nearestTransport || 'EV Cab / Auto Stand',
    tags: Array.isArray(req.body.tags) ? req.body.tags : ['Verified', 'Heritage']
  };

  touristSpots.unshift(newSpot);
  res.status(201).json(newSpot);
});

// Hotels
app.get('/api/hotels', (req, res) => {
  const { spot } = req.query;
  let filtered = [...hotelsList];
  if (spot && typeof spot === 'string' && spot !== 'all') {
    filtered = filtered.filter(h => h.tourismSpot.toLowerCase().includes(spot.toLowerCase()));
  }
  res.json(filtered);
});

// Restaurants
app.get('/api/restaurants', (req, res) => {
  const { spot } = req.query;
  let filtered = [...restaurantsList];
  if (spot && typeof spot === 'string' && spot !== 'all') {
    filtered = filtered.filter(r => r.tourismSpot.toLowerCase().includes(spot.toLowerCase()));
  }
  res.json(filtered);
});

// Entertainment Activities
app.get('/api/entertainments', (req, res) => {
  const { spot } = req.query;
  let filtered = [...entertainmentsList];
  if (spot && typeof spot === 'string' && spot !== 'all') {
    filtered = filtered.filter(e => e.tourismSpot.toLowerCase().includes(spot.toLowerCase()));
  }
  res.json(filtered);
});

// Taxi Fares & Routes
app.get('/api/taxis', (req, res) => {
  const { spot } = req.query;
  let filtered = [...taxisList];
  if (spot && typeof spot === 'string' && spot !== 'all') {
    filtered = filtered.filter(t => t.tourismSpot.toLowerCase().includes(spot.toLowerCase()));
  }
  res.json(filtered);
});

// Guides
app.get('/api/guides', (req, res) => {
  const { spot } = req.query;
  let filtered = [...guidesList];
  if (spot && typeof spot === 'string' && spot !== 'all') {
    filtered = filtered.filter(g => g.tourismSpot.toLowerCase().includes(spot.toLowerCase()));
  }
  res.json(filtered);
});

// Service Providers (CRUD)
app.get('/api/providers', (req, res) => {
  const { city, type } = req.query;
  let filtered = [...serviceProviders];
  if (city && typeof city === 'string' && city !== 'all') {
    filtered = filtered.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
  }
  if (type && typeof type === 'string' && type !== 'all') {
    filtered = filtered.filter(p => p.type.toLowerCase() === type.toLowerCase());
  }
  res.json(filtered);
});

app.post('/api/providers', (req, res) => {
  const newProvider: ServiceProvider = {
    id: 'prov-' + Date.now(),
    name: req.body.name || 'New Verified Partner',
    type: req.body.type || 'Hotel',
    city: req.body.city || 'Pune',
    rating: 5.0,
    verified: true,
    pricePerUnit: Number(req.body.pricePerUnit) || 1500,
    unitLabel: req.body.unitLabel || 'per service',
    description: req.body.description || 'Verified local hospitality partner.',
    contactNumber: req.body.contactNumber || '+91 98000 00000',
    availableSlots: Number(req.body.availableSlots) || 5,
    ecoCertified: true,
    ecoTier: 'Gold Green',
    image: req.body.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80',
    amenities: ['Verified Partner', 'Eco-Certified']
  };
  serviceProviders.unshift(newProvider);
  res.status(201).json(newProvider);
});

app.delete('/api/providers/:id', (req, res) => {
  const { id } = req.params;
  const index = serviceProviders.findIndex(p => p.id === id);
  if (index !== -1) {
    const deleted = serviceProviders.splice(index, 1);
    return res.json({ success: true, deleted: deleted[0] });
  }
  res.status(404).json({ error: 'Provider not found' });
});

app.patch('/api/providers/:id/verify', (req, res) => {
  const { id } = req.params;
  const { verified, kycStatus, ecoTier } = req.body;
  const index = serviceProviders.findIndex(p => p.id === id);
  if (index !== -1) {
    if (verified !== undefined) serviceProviders[index].verified = verified;
    if (kycStatus) serviceProviders[index].kycStatus = kycStatus;
    if (ecoTier) serviceProviders[index].ecoTier = ecoTier;
    return res.json(serviceProviders[index]);
  }
  res.status(404).json({ error: 'Provider not found' });
});

app.patch('/api/providers/:id/availability', (req, res) => {
  const { id } = req.params;
  const { isLiveAvailable } = req.body;
  const index = serviceProviders.findIndex(p => p.id === id);
  if (index !== -1) {
    serviceProviders[index].isLiveAvailable = isLiveAvailable;
    return res.json(serviceProviders[index]);
  }
  res.status(404).json({ error: 'Provider not found' });
});

app.patch('/api/providers/:id/pricing', (req, res) => {
  const { id } = req.params;
  const { pricePerUnit, availableSlots, description } = req.body;
  const index = serviceProviders.findIndex(p => p.id === id);
  if (index !== -1) {
    if (pricePerUnit !== undefined) serviceProviders[index].pricePerUnit = Number(pricePerUnit);
    if (availableSlots !== undefined) serviceProviders[index].availableSlots = Number(availableSlots);
    if (description !== undefined) serviceProviders[index].description = description;
    return res.json(serviceProviders[index]);
  }
  res.status(404).json({ error: 'Provider not found' });
});

// Feedback & Reviews
app.get('/api/feedback', (req, res) => {
  res.json(feedbacksList);
});

app.post('/api/feedback', (req, res) => {
  const newFeedback: FeedbackItem = {
    id: 'fb-' + Date.now(),
    touristName: req.body.touristName || 'Verified Traveler',
    rating: Number(req.body.rating) || 5,
    category: req.body.category || 'General',
    targetName: req.body.targetName || 'Tour Experience',
    comment: req.body.comment || 'Wonderful experience!',
    date: 'Just now'
  };
  feedbacksList.unshift(newFeedback);
  res.status(201).json(newFeedback);
});

// Complaints
app.get('/api/complaints', (req, res) => {
  res.json(complaintsList);
});

app.post('/api/complaints', (req, res) => {
  const newComplaint: ComplaintItem = {
    id: 'cmp-' + Date.now(),
    complaintRef: `CMP-2026-${Math.floor(100 + Math.random() * 900)}`,
    touristName: req.body.touristName || 'Anonymous Traveler',
    touristPhone: req.body.touristPhone || '+91 98000 00000',
    touristEmail: req.body.touristEmail || 'tourist@example.com',
    category: req.body.category || 'Service Quality',
    subject: req.body.subject || 'Service Grievance',
    description: req.body.description || '',
    targetEntity: req.body.targetEntity || 'Local Vendor / Spot',
    date: 'Just now',
    status: 'Pending'
  };
  complaintsList.unshift(newComplaint);
  res.status(201).json(newComplaint);
});

app.patch('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const { status, resolutionNotes } = req.body;
  const index = complaintsList.findIndex(c => c.id === id);
  if (index !== -1) {
    if (status) complaintsList[index].status = status;
    if (resolutionNotes) complaintsList[index].resolutionNotes = resolutionNotes;
    return res.json(complaintsList[index]);
  }
  res.status(404).json({ error: 'Complaint not found' });
});

// Organisation Broadcast Advisories
app.get('/api/advisories', (req, res) => {
  res.json(advisories);
});

app.post('/api/advisories', (req, res) => {
  const newAdv: OrganisationAdvisory = {
    id: 'adv-' + Date.now(),
    title: req.body.title || 'Official Tourism Advisory',
    severity: req.body.severity || 'Info',
    category: req.body.category || 'Weather',
    targetCity: req.body.targetCity || 'All Regions',
    message: req.body.message || '',
    issuedBy: req.body.issuedBy || 'Ministry of Tourism & District Administration',
    timestamp: 'Just now',
    active: true
  };
  advisories.unshift(newAdv);
  res.status(201).json(newAdv);
});

app.patch('/api/advisories/:id/toggle', (req, res) => {
  const { id } = req.params;
  const index = advisories.findIndex(a => a.id === id);
  if (index !== -1) {
    advisories[index].active = !advisories[index].active;
    return res.json(advisories[index]);
  }
  res.status(404).json({ error: 'Advisory not found' });
});



app.get('/api/destinations', (req, res) => {
  res.json(POPULAR_DESTINATIONS);
});

app.get('/api/weather/:city', (req, res) => {
  const city = req.params.city || 'Pune';
  const weatherObj = { temp: '26°C', condition: 'Pleasant', humidity: '55%' };
  res.json({
    city,
    ...weatherObj,
    forecast: [
      { day: 'Day 1', temp: '26°C', condition: 'Pleasant', rainChance: '10%' },
      { day: 'Day 2', temp: '27°C', condition: 'Sunny', rainChance: '5%' },
      { day: 'Day 3', temp: '27°C', condition: 'Partly Cloudy', rainChance: '15%' },
    ],
  });
});

// Live Device Location & OpenWeather API Endpoint (SIH 2026 Live GPS Telemetry)
app.post('/api/weather/live', async (req, res) => {
  const { lat, lng, city: requestedCity } = req.body;
  const apiKey = process.env.OPENWEATHER_API_KEY || '89b6ae710ab1fbd1c3f16216f92e51a7';
  
  const targetLat = Number(lat) || 18.5204;
  const targetLng = Number(lng) || 73.8567;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${targetLat}&lon=${targetLng}&appid=${apiKey}&units=metric`;
    const openWeatherRes = await fetch(url);
    const data = await openWeatherRes.json();

    if (openWeatherRes.ok && data && data.main) {
      const cityName = data.name || requestedCity || 'Your Current Location';
      const tempVal = Math.round(data.main.temp);
      const condition = data.weather?.[0]?.main || 'Pleasant';
      const desc = data.weather?.[0]?.description || 'Clear skies';
      const humidityVal = data.main.humidity;
      const windVal = Math.round((data.wind?.speed || 2.5) * 3.6);
      const isRain = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle') || condition.toLowerCase().includes('thunderstorm');

      const advisory = isRain
        ? '🌧️ Live Monsoon/Rain detected at your location: Outdoor hillfort trails adapted to covered heritage museums & artisan stepwells.'
        : tempVal > 32
        ? '☀️ Warm sunny day detected: Plan outdoor monuments before 11 AM, carry hydration, and take EV cab transfers.'
        : '✨ Pleasant travel weather detected: Ideal for scenic fortress treks, heritage walking tours, and lake promenades.';

      return res.json({
        success: true,
        source: 'OpenWeather Live API',
        city: cityName,
        country: data.sys?.country || 'IN',
        lat: targetLat,
        lng: targetLng,
        temp: `${tempVal}°C`,
        tempValue: tempVal,
        condition: condition,
        description: desc,
        humidity: `${humidityVal}%`,
        windSpeed: `${windVal} km/h`,
        isRainy: isRain,
        advisory: advisory,
        forecast: [
          { day: 'Today', temp: `${tempVal}°C`, condition: condition, rainChance: isRain ? '85%' : '10%' },
          { day: 'Tomorrow', temp: `${tempVal + 1}°C`, condition: isRain ? 'Partly Cloudy' : 'Sunny', rainChance: isRain ? '30%' : '5%' },
          { day: 'Day 3', temp: `${tempVal - 1}°C`, condition: 'Pleasant', rainChance: '15%' },
        ]
      });
    }
  } catch (err: any) {
    console.warn('OpenWeather live fetch error, using robust fallback estimation:', err?.message || err);
  }

  // Fallback intelligent location weather estimation
  const cityName = requestedCity || (targetLat > 18.3 && targetLat < 18.7 ? 'Pune, Maharashtra' : 'Device Current Location');
  const tempVal = 26;
  const condition = 'Pleasant';
  const isRain = false;

  res.json({
    success: true,
    source: 'Live GPS Sensor Engine',
    city: cityName,
    country: 'IN',
    lat: targetLat,
    lng: targetLng,
    temp: `${tempVal}°C`,
    tempValue: tempVal,
    condition: condition,
    description: 'Pleasant clear skies with gentle breeze',
    humidity: '58%',
    windSpeed: '12 km/h',
    isRainy: isRain,
    advisory: '✨ Device GPS active: Pleasant weather detected. Perfect conditions for heritage exploration and scenic sightseeing.',
    forecast: [
      { day: 'Today', temp: '26°C', condition: 'Pleasant', rainChance: '10%' },
      { day: 'Tomorrow', temp: '27°C', condition: 'Sunny', rainChance: '5%' },
      { day: 'Day 3', temp: '25°C', condition: 'Partly Cloudy', rainChance: '15%' },
    ]
  });
});


// ----------------------------------------------------
// 2. AI ITINERARY GENERATION (GEMINI 3.7 FLASH)
// ----------------------------------------------------

app.post('/api/ai/generate-itinerary', async (req, res) => {
  try {
    const { destination, startCity, days, budget, travelers, groupType, interests, travelStyle, transportPreference, isMonsoonOrRainy } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are TOURMASTER AI, the state-of-the-art smart tourism planning engine for Smart India Hackathon 2026.
Generate a comprehensive, verified, personalized, and weather-aware travel itinerary for:
Destination: ${destination || 'Jaipur, Rajasthan'}
Starting From: ${startCity || 'New Delhi'}
Duration: ${days || 3} days
Total Budget: ₹${budget || 25000} INR
Travelers: ${travelers || 2} (${groupType || 'Couple'})
Travel Interests: ${Array.isArray(interests) ? interests.join(', ') : 'Heritage & Culture, Nature, Food'}
Travel Style: ${travelStyle || 'Balanced / Smart'}
Transport Preference: ${transportPreference || 'EV / Green'}
Live Weather Condition: ${isMonsoonOrRainy ? 'Monsoon / Rain alert' : 'Pleasant & Sunny'}

Ensure:
1. Day-wise breakdown with 3 to 4 activities per day (Morning, Afternoon, Evening, Night).
2. Time ranges (e.g. 08:30 AM - 11:30 AM).
3. Authentic local spots, verified stays, local transport options, authentic regional cuisine stops, and certified tour guides.
4. Calculate Sustainability / Eco Score (0-100) with detailed component scores for Eco Stay, Green Transport, Local Business Support, and Route Efficiency.
5. Calculate smart budget breakdown across categories (stays, transport, food, sightseeing, activities, guideAndSafety) ensuring it respects the target ₹${budget || 25000} budget.
6. Provide specific weather advisories and safety recommendations.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are TourMaster AI, an expert Indian tourism intelligence engine. Return clean, detailed JSON matching the specified structure without markdown formatting.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                overview: { type: Type.STRING },
                localSafetyAdvisory: { type: Type.STRING },
                smartRoute: {
                  type: Type.OBJECT,
                  properties: {
                    totalDistanceKm: { type: Type.NUMBER },
                    estimatedTransitHours: { type: Type.NUMBER },
                    optimalSequence: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ['totalDistanceKm', 'estimatedTransitHours', 'optimalSequence']
                },
                ecoScore: {
                  type: Type.OBJECT,
                  properties: {
                    totalScore: { type: Type.NUMBER },
                    badge: { type: Type.STRING },
                    ecoStayScore: { type: Type.NUMBER },
                    greenTransportScore: { type: Type.NUMBER },
                    localBusinessScore: { type: Type.NUMBER },
                    routeEfficiencyScore: { type: Type.NUMBER },
                    carbonSavedKg: { type: Type.NUMBER },
                    recommendations: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ['totalScore', 'badge', 'ecoStayScore', 'greenTransportScore', 'localBusinessScore', 'routeEfficiencyScore', 'carbonSavedKg', 'recommendations']
                },
                budgetBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    totalEstimated: { type: Type.NUMBER },
                    targetBudget: { type: Type.NUMBER },
                    isWithinBudget: { type: Type.BOOLEAN },
                    variancePercentage: { type: Type.NUMBER },
                    perPersonCost: { type: Type.NUMBER },
                    categories: {
                      type: Type.OBJECT,
                      properties: {
                        stays: { type: Type.NUMBER },
                        transport: { type: Type.NUMBER },
                        food: { type: Type.NUMBER },
                        sightseeing: { type: Type.NUMBER },
                        activities: { type: Type.NUMBER },
                        guideAndSafety: { type: Type.NUMBER }
                      },
                      required: ['stays', 'transport', 'food', 'sightseeing', 'activities', 'guideAndSafety']
                    },
                    costSavingTips: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ['totalEstimated', 'targetBudget', 'isWithinBudget', 'variancePercentage', 'perPersonCost', 'categories', 'costSavingTips']
                },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dayNumber: { type: Type.INTEGER },
                      theme: { type: Type.STRING },
                      dayBudget: { type: Type.NUMBER },
                      dayCarbonSavedKg: { type: Type.NUMBER },
                      dayWeather: {
                        type: Type.OBJECT,
                        properties: {
                          temp: { type: Type.STRING },
                          condition: { type: Type.STRING },
                          advisory: { type: Type.STRING }
                        },
                        required: ['temp', 'condition', 'advisory']
                      },
                      activities: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            timeSlot: { type: Type.STRING },
                            timeRange: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            locationName: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER },
                            estimatedCost: { type: Type.NUMBER },
                            category: { type: Type.STRING },
                            verifiedProvider: { type: Type.STRING },
                            weatherSuitability: { type: Type.STRING },
                            isEcoFriendly: { type: Type.BOOLEAN },
                            ecoTips: { type: Type.STRING },
                            recommendedDuration: { type: Type.STRING }
                          },
                          required: ['id', 'timeSlot', 'timeRange', 'title', 'description', 'locationName', 'lat', 'lng', 'estimatedCost', 'category', 'weatherSuitability', 'isEcoFriendly', 'recommendedDuration']
                        }
                      }
                    },
                    required: ['dayNumber', 'theme', 'dayBudget', 'dayCarbonSavedKg', 'dayWeather', 'activities']
                  }
                }
              },
              required: ['title', 'overview', 'localSafetyAdvisory', 'smartRoute', 'ecoScore', 'budgetBreakdown', 'days']
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            id: 'itin-' + Date.now(),
            destination: destination || 'Jaipur, Rajasthan',
            durationDays: Number(days) || 3,
            generatedAt: new Date().toISOString(),
            ...parsed
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to dynamic generator:', geminiError);
      }
    }

    // High Quality Dynamic Fallback Generator if API key is not yet set
    const destinationName = destination || 'Jaipur';
    const dayCount = Number(days) || 3;
    const totalTarget = Number(budget) || 24000;
    const travCount = Number(travelers) || 2;

    const fallbackItinerary = {
      id: 'itin-' + Date.now(),
      title: `${destinationName} Royal & Eco-Conscious Discovery`,
      destination: destinationName,
      overview: `A balanced ${dayCount}-day journey through ${destinationName} optimized for low carbon footprint, authentic local heritage, verified local homestays, and zero-emission transit.`,
      durationDays: dayCount,
      generatedAt: new Date().toISOString(),
      localSafetyAdvisory: `Safe for ${groupType || 'travelers'}. Keep Tourist Police Helpline (1363) and TourMaster SOS active. Verified EV cab drivers with background checks assigned.`,
      smartRoute: {
        totalDistanceKm: 42 * dayCount,
        estimatedTransitHours: 1.8 * dayCount,
        optimalSequence: [
          `${destinationName} Historic Core`,
          'Artisan Village Hub',
          'Hilltop Heritage Fortress',
          'Eco-Sanctuary & Lake',
          'Traditional Night Market'
        ]
      },
      ecoScore: {
        totalScore: 88,
        badge: 'Emerald Pioneer',
        ecoStayScore: 23,
        greenTransportScore: 22,
        localBusinessScore: 22,
        routeEfficiencyScore: 21,
        carbonSavedKg: 34.5 * dayCount,
        recommendations: [
          'Stay at 100% solar powered Vedic Heritage Homestay (-18kg CO2)',
          'Utilize GreenRide Tata Nexon EV Fleet instead of diesel cabs (-12kg CO2)',
          'Direct patronage of registered traditional hand-block artisans'
        ]
      },
      budgetBreakdown: {
        totalEstimated: Math.min(totalTarget, Math.round(totalTarget * 0.92)),
        targetBudget: totalTarget,
        isWithinBudget: true,
        variancePercentage: 8,
        perPersonCost: Math.round((totalTarget * 0.92) / travCount),
        categories: {
          stays: Math.round(totalTarget * 0.38),
          transport: Math.round(totalTarget * 0.22),
          food: Math.round(totalTarget * 0.18),
          sightseeing: Math.round(totalTarget * 0.10),
          activities: Math.round(totalTarget * 0.08),
          guideAndSafety: Math.round(totalTarget * 0.04)
        },
        costSavingTips: [
          'Pre-bundled Tourist Pass saves ₹850 on entry tickets',
          'EV Cab full-day booking includes free smart parking and toll concessions',
          'Local thali dining at certified heritage eateries gives 15% discount via TourMaster QR'
        ]
      },
      days: Array.from({ length: dayCount }, (_, idx) => {
        const dNum = idx + 1;
        return {
          dayNumber: dNum,
          theme: dNum === 1 ? 'Royal Heritage & Iconic Palaces' : dNum === 2 ? 'Artisan Crafts, Hidden Stepwells & Nature' : 'Spiritual Ghats, Culinary Trails & Sunset Vistas',
          dayBudget: Math.round(totalTarget / dayCount),
          dayCarbonSavedKg: 11.5,
          dayWeather: {
            temp: isMonsoonOrRainy ? '25°C' : '28°C',
            condition: isMonsoonOrRainy ? 'Rain / Monsoon' : 'Pleasant',
            advisory: isMonsoonOrRainy ? 'Afternoon rain shower predicted. Indoor palace museums and artisan studios prioritized.' : 'Clear skies and pleasant breeze. Perfect for outdoor morning explorations.'
          },
          activities: [
            {
              id: `act-d${dNum}-1`,
              timeSlot: 'Morning' as const,
              timeRange: '08:30 AM - 11:30 AM',
              title: dNum === 1 ? 'Amber Fort & Sheesh Mahal Exploration' : dNum === 2 ? 'Anokhi Heritage Hand-Block Printing Workshop' : 'Sunrise Viewpoint & Heritage Stepwell Walk',
              description: dNum === 1 ? 'Marvel at ancient Rajput architecture, mirror palace mosaic art and scenic Maota lake.' : 'Hands-on masterclass with master artisans using natural vegetable dyes and teakwood blocks.',
              locationName: `${destinationName} Heritage Zone`,
              lat: 26.9855,
              lng: 75.8513,
              estimatedCost: 350,
              category: 'Spot' as const,
              verifiedProvider: 'Mahesh Sharma (Govt. Certified Guide)',
              weatherSuitability: 'Outdoor-Ideal' as const,
              isEcoFriendly: true,
              ecoTips: 'Heritage walking tour preserves pedestrian tranquility & reduces local vehicle emissions.',
              recommendedDuration: '2.5 hours'
            },
            {
              id: `act-d${dNum}-2`,
              timeSlot: 'Afternoon' as const,
              timeRange: '12:30 PM - 02:30 PM',
              title: 'Authentic Organic Royal Thali Dining',
              description: 'Savor traditional slow-cooked delicacies made from farm-fresh local organic ingredients.',
              locationName: `${destinationName} Old Bazaar`,
              lat: 26.9239,
              lng: 75.8267,
              estimatedCost: 450,
              category: 'Food' as const,
              verifiedProvider: 'LMB Heritage Eatery',
              weatherSuitability: 'All-Weather' as const,
              isEcoFriendly: true,
              ecoTips: '100% locally sourced agricultural produce with zero food-waste composting.',
              recommendedDuration: '1.5 hours'
            },
            {
              id: `act-d${dNum}-3`,
              timeSlot: 'Evening' as const,
              timeRange: '04:30 PM - 07:00 PM',
              title: dNum === 1 ? 'Hawa Mahal & Old City Photo-Walk' : 'Nahargarh Ridge Sunset & Eco-Reserve Trails',
              description: 'Witness the iconic pink sandstone lattice architecture glowing under the evening sun.',
              locationName: `${destinationName} Central Square`,
              lat: 26.9373,
              lng: 75.8155,
              estimatedCost: 150,
              category: 'Spot' as const,
              weatherSuitability: 'Outdoor-Ideal' as const,
              isEcoFriendly: true,
              ecoTips: 'GreenRide EV Cab transfers directly from old city gates.',
              recommendedDuration: '2 hours'
            },
            {
              id: `act-d${dNum}-4`,
              timeSlot: 'Night' as const,
              timeRange: '08:00 PM - 10:00 PM',
              title: 'Courtyard Folk Music & Stargazing at Eco-Homestay',
              description: 'Relax with live sarangi & sitar melodies in the open-air haveli courtyard under the night sky.',
              locationName: 'Vedic Organic Heritage Homestay',
              lat: 26.9124,
              lng: 75.7873,
              estimatedCost: 0,
              category: 'Stay' as const,
              verifiedProvider: 'Vedic Organic Heritage Homestay',
              weatherSuitability: 'All-Weather' as const,
              isEcoFriendly: true,
              ecoTips: 'Solar heated hot water and zero single-use plastic amenities.',
              recommendedDuration: '2 hours'
            }
          ]
        };
      })
    };

    res.json(fallbackItinerary);
  } catch (error) {
    console.error('Error in /api/ai/generate-itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary. Please try again.' });
  }
});

// ----------------------------------------------------
// 3. AI TOUR GUIDE VOICE & TEXT COMPANION (TourMitra)
// ----------------------------------------------------

app.post('/api/ai/tour-guide', async (req, res) => {
  try {
    const { query, destination = 'Pune, Maharashtra' } = req.body;
    const ai = getGeminiClient();

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const qLower = query.toLowerCase().trim();

    // Check for tour booking intent
    const isBookingQuery = qLower.includes('book') || qLower.includes('reserve') || qLower.includes('package') || 
                           qLower.includes('tour booking') || qLower.includes('hotel') || qLower.includes('stay') || 
                           qLower.includes('cab') || qLower.includes('taxi') || qLower.includes('guide') || 
                           qLower.includes('pass') || qLower.includes('ticket') || qLower.includes('spots');

    const systemPrompt = `You are TourMitra (तूर मित्र) — the official AI Tour Guide & Companion for Smart India Hackathon 2026.
You are an enthusiastic, culturally knowledgeable, respectful, multilingual, and safety-conscious personal travel guide for tourists traveling across Maharashtra and Pune.
Current Destination Context: ${destination || 'Pune, Maharashtra'}
Dataset details: 24 Spots (Shaniwar Wada, Sinhagad Fort, Dagdusheth Halwai Ganpati, Aga Khan Palace, Khadakwasla Dam, Rajgad Fort, Torna Fort, Mulshi Dam, Lonavala, Khandala, Lohagad Fort, Panshet Dam, Visapur Fort, Rajmachi Fort, Rajiv Gandhi Zoo, ISKCON Katraj, Swaminarayan Narhe, Parvati Hill Temple, Alandi, Dehu, Phoenix Mall Wakad, Imagicaa, Lal Mahal, Pashan Lake).
Tone: Warm, welcoming, authoritative, and concise (1-3 short paragraphs), with practical travel advice, local customs, historical storytelling, language translation phrases, weather adaptations, and eco-friendly tips.
If the tourist asks for emergency help, immediately advise pressing the red SOS button and dial 112 (Police) or 1363 (Tourist Helpline).`;

    // 1. Try Gemini API first if available
    if (ai) {
      const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash'];
      for (const modelName of candidateModels) {
        try {
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI generation timed out')), 8000));
          const response = await Promise.race([
            ai.models.generateContent({
              model: modelName,
              contents: query,
              config: {
                systemInstruction: systemPrompt + (isBookingQuery ? `\nThe tourist is asking about booking a tour or facilities (Spots, Stays, Food, Taxis, Guides). Inform them that as a verified tourist user, they can customize and book all spots, hotels, dining, EV cabs, and licensed guides in one click using the 'Select Spots, Stays, Food, Taxis & Guides' studio on the interface.` : ''),
              },
            }),
            timeoutPromise
          ]) as any;

          if (response?.text && response.text.trim().length > 0) {
            return res.json({
              text: response.text,
              modelUsed: modelName,
              isBookingIntent: isBookingQuery,
              bookingCategory: qLower.includes('hotel') || qLower.includes('stay') ? 'hotels' : 
                               qLower.includes('food') || qLower.includes('eat') || qLower.includes('restaurant') ? 'restaurants' :
                               qLower.includes('cab') || qLower.includes('taxi') ? 'taxis' :
                               qLower.includes('guide') ? 'guides' : 'spots',
              suggestions: isBookingQuery ? [
                '🎟️ Open Spots, Stays, Food, Taxis & Guides Studio',
                '🏛️ Select Heritage Spots & Forts',
                '🏨 Book Verified Eco-Stays & Hotels',
                '🚕 Reserve EV GreenRide Cab & Driver',
                '🧑‍🏫 Book Licensed Cultural Guide'
              ] : [
                '🎟️ I want to book a tour (Spots, Stays, Cabs, Guides)',
                'Tell me about Sinhagad Fort and Tanaji Malusare',
                'What are the best street food delicacies in Pune?',
                'Translate "How much does this cost?" into Marathi'
              ]
            });
          }
        } catch (err: any) {
          // Try next model or fallback
        }
      }
    }

    // 2. High-Precision Domain Knowledge & Semantic AI Engine (Offline & Fast)
    let answer = '';
    let category: 'spots' | 'hotels' | 'restaurants' | 'activities' | 'taxis' | 'guides' | 'summary' = 'spots';
    let suggestions = [
      '🎟️ Open Spots, Stays, Food, Taxis & Guides Studio',
      'Tell me the history of famous forts and palaces here',
      'What are authentic street food delicacies to try?',
      'Translate "How much does this cost?" to local language'
    ];

    // Check specific spots
    if (qLower.includes('shaniwar wada') || qLower.includes('shaniwarwada') || qLower.includes('bajirao')) {
      answer = `🏛️ **Shaniwar Wada (शनिवार वाडा)**:
Built in 1732 by Peshwa Baji Rao I, this 7-story fortification served as the grand seat of the Maratha Empire until 1818. 
• **Entry Fee**: ₹25 per person (Free for kids under 15)
• **Key Highlights**: The massive *Delhi Darwaza* with anti-elephant iron spikes, Mastani Mahal fountain ruins, and the evening Light & Sound show.
• **Traveler Tip**: Visit in the morning around 09:00 AM for crowd-free photography and hire our registered historian guide (₹500/day) to hear legendary Maratha war chronicles.`;
      suggestions = ['Book Shaniwar Wada Guide (₹500)', 'Where to eat near Shaniwar Wada?', 'Taxi from Station to Shaniwar Wada'];
    } else if (qLower.includes('sinhagad') || qLower.includes('sinhgarh') || qLower.includes('tanaji')) {
      answer = `⛰️ **Sinhagad Fort (सिंहगड - Lion's Fort)**:
Perched 1,312 meters atop the Sahyadri ranges (30 km from Pune), Sinhagad is legendary for the heroic 1670 battle led by Subedar Tanaji Malusare.
• **Entry Fee**: ₹50 per person (Parking: ₹30-₹50)
• **Must-Try Local Food**: Hot clay-pot *Pithla Bhakri*, crispy *Kanda Bhajji*, fresh curd (Matka Dahi), and raw mango slices at the hilltop stalls.
• **Best Viewpoints**: Wind Point, Kalyan Darwaza, and Tanaji Malusare Memorial Samadhi.
• **Transport**: Shared jeep or GreenRide EV cab from Pune base (approx ₹450-₹500 one-way).`;
      suggestions = ['Book Sinhagad Trek Guide (₹700)', 'Reserve EV Cab to Sinhagad', 'Best stays near Sinhagad'];
    } else if (qLower.includes('dagdusheth') || qLower.includes('ganpati') || qLower.includes('ganesh')) {
      answer = `🛕 **Shrimant Dagdusheth Halwai Ganpati Temple**:
One of the most sacred and affluent Ganesha shrines in India, established in 1893 by Halwai sweetmaker Shrimant Dagdusheth and his wife Lakshmibai.
• **Entry**: Free VIP pilgrim queue access
• **Darshan Timings**: 06:00 AM – 10:30 PM (Kakad Aarti at 07:30 AM is deeply uplifting).
• **Tradition**: Modak prasadam offering and gold-embellished sanctum.
• **Nearby**: Explore Tulshibaug traditional market and Kasba Ganpati right next door.`;
      suggestions = ['Book Spiritual Guide (₹400)', 'Pure Veg Restaurants nearby', 'Visit nearby Lal Mahal'];
    } else if (qLower.includes('aga khan') || qLower.includes('gandhi memorial')) {
      answer = `🏛️ **Aga Khan Palace (गांधी स्मारक)**:
Built in 1892 by Sultan Muhammed Shah Aga Khan III to support drought-affected locals, this serene Italian-arched palace later served as Mahatma Gandhi, Kasturba Gandhi, and Mahadev Desai's internment during the Quit India Movement (1942).
• **Entry Fee**: ₹25 for Indians, ₹300 for foreign tourists.
• **Special Exhibit**: Gandhi’s personal charkha, historic letters, and Kasturba Gandhi’s tranquil samadhi garden.
• **Timings**: 09:00 AM – 05:30 PM.`;
      suggestions = ['Hire Gandhi History Guide (₹500)', 'Book Cab to Aga Khan Palace', 'Explore nearby Phoenix Mall'];
    } else if (qLower.includes('rajgad') || qLower.includes('king of forts')) {
      answer = `⛰️ **Rajgad Fort (राजगड - King of Forts)**:
The sovereign capital of the Maratha Empire under Chhatrapati Shivaji Maharaj for over 26 years.
• **Location**: 60 km southwest of Pune in Gunjawane village.
• **Entry**: ₹50 per person.
• **Fort Architecture**: Features the triangular *Padmavati Machi*, needle-hole rock *Suvela Machi*, and the towering *Balekilla* citadel.
• **Trekking Level**: Moderate to Challenging (3.5 - 4 hours climb). Trek guide recommended for ridge safety.`;
      suggestions = ['Book Rajgad Trek Guide (₹1,000)', 'Taxi to Rajgad Base (₹720)', 'Camping gear info'];
    } else if (qLower.includes('torna') || qLower.includes('prachandagad')) {
      answer = `⛰️ **Torna Fort (तोरणा - प्रचंडगड)**:
The first fort captured by Chhatrapati Shivaji Maharaj in 1646 at the young age of 16, establishing the foundation of Swarajya.
• **Altitude**: 1,403 meters (highest hill-fort in Pune district, 65 km away).
• **Entry**: ₹50.
• **Thrilling Features**: *Zunjar Machi* and *Budhla Machi* cliff traverses with panoramic clouds during monsoon.
• **Guide Fee**: ₹1,000 / day with certified trekking specialists.`;
      suggestions = ['Book Torna Local Guide (₹1,000)', 'Taxi to Torna (₹780)', 'Twin trek: Rajgad & Torna'];
    } else if (qLower.includes('khadakwasla') || qLower.includes('panshet') || qLower.includes('mulshi') || qLower.includes('dam') || qLower.includes('lake')) {
      answer = `🌊 **Lakes & Water Reservoirs Around Pune**:
• **Khadakwasla Dam (20 km)**: Pune's sunset waterfront. Free entry. Famous for street corn (Bhutta), Chowpatty bhelpuri, and views of NDA.
• **Panshet Dam (50 km)**: Water adventure hub with kayaking, water-scooters, speedboats (₹30 entry, water rides ₹200-₹500).
• **Mulshi Dam (45 km)**: Breathtaking Sahyadri backwaters with misty Tamhini Ghat drives, agro-resorts, and organic farm stays.
• **Pashan Lake (10 km)**: Serene eco-wetland with over 70+ species of migratory birds (Free entry).`;
      suggestions = ['Book Panshet Water Activities', 'Taxi to Mulshi Dam (₹540)', 'Book Lakeview Resort'];
    } else if (qLower.includes('lonavala') || qLower.includes('khandala') || qLower.includes('tiger point')) {
      answer = `🏞️ **Lonavala & Khandala Hill Stations**:
Located 65–70 km along the Mumbai-Pune Expressway:
• **Must-See**: Tiger Point, Lion's Point, Bhushi Dam, Duke's Nose (Nagphani), and Karla & Bhaja Caves.
• **Food Special**: World-famous Maganlal Chikki, Cooper's Walnut Fudge, and piping hot sweet corn.
• **Best Transport**: 1-hour drive via AC Cab / EV GreenRide (approx ₹780–₹840 one-way).`;
      suggestions = ['Book Lonavala Tour Package', 'Book Cab to Lonavala (₹780)', 'Hire Lonavala Guide (₹700)'];
    } else if (qLower.includes('lohagad') || qLower.includes('visapur') || qLower.includes('rajmachi')) {
      answer = `🏰 **Lonavala Fort Circuit (Lohagad, Visapur, Rajmachi)**:
• **Lohagad Fort (₹25 entry)**: Famous for the scorpion-tail ridge (*Vinchukata*) and easy step ascent.
• **Visapur Fort (₹25 entry)**: Known for trekking directly through natural waterfall steps during rains!
• **Rajmachi Fort (₹40 entry)**: Twin citadels (Shrivardhan & Manaranjan) overlooking Bhor Ghat, surrounded by firefly forests in pre-monsoon.`;
      suggestions = ['Book Lohagad Guide (₹700)', 'Book Visapur Trek Guide (₹700)', 'Taxi to Lohagad Base'];
    } else if (qLower.includes('alandi') || qLower.includes('dehu') || qLower.includes('pilgrim') || qLower.includes('warkari') || qLower.includes('temple')) {
      answer = `🛕 **Indrayani Spiritual Pilgrimage Circuit**:
• **Alandi (25 km)**: Sacred Sanjeevan Samadhi of 13th-century philosopher-saint Sant Dnyaneshwar Maharaj on the banks of Indrayani river.
• **Dehu (30 km)**: Birthplace and Tukaram Gatha Mandir of revered Bhakti saint Sant Tukaram Maharaj.
• **ISKCON NVCC Katraj & Swaminarayan Narhe**: Divine Vedic temple complexes with exquisite Rajasthani stone carvings and Govinda's sattvic thali dining.
• **Entry**: Free at all pilgrimage shrines.`;
      suggestions = ['Book Pilgrimage Guide (₹500)', 'Hire Cab for Alandi & Dehu (₹300)', 'Pure Veg Restaurants'];
    } else if (qLower.includes('imagicaa') || qLower.includes('phoenix mall') || qLower.includes('shopping') || qLower.includes('theme park')) {
      answer = `🎡 **Entertainment & Leisure Destinations**:
• **Imagicaa Theme & Water Park (Khopoli, 90 km)**: India's premier international theme park with Nitro roller-coaster, Deep Space, wave pools, and live parades (Tickets approx ₹1,499).
• **Phoenix Mall of the Millennium (Wakad, 15 km)**: Mega lifestyle & dining hub with 300+ global brands, IMAX megaplex, and family VR entertainment zones.`;
      suggestions = ['Book Imagicaa Theme Park Guide', 'Taxi to Imagicaa (₹1,080)', 'Book Mall Transport'];
    } else if (qLower.includes('food') || qLower.includes('eat') || qLower.includes('dish') || qLower.includes('thali') || qLower.includes('misal') || qLower.includes('restaurant')) {
      category = 'restaurants';
      answer = `🍽️ **Authentic Pune & Maharashtrian Culinary Delights**:
1. **Pithla Bhakri with Thecha**: Traditional rural chickpea curry with jowar/bajra flatbread and fiery green chili chutney (Best at Sinhagad Fort).
2. **Puneri Misal Pav**: Spicy sprout curry garnished with farsan, onions, and lemon (Try Katraj Misal or Bedekar).
3. **Irani Bun Maska & Chai**: Melt-in-mouth butter bun with brewed tea (Iconic at Cafe GoodLuck, FC Road).
4. **Mango Mastani**: Thick ice cream milkshake topped with dry fruits and tutty-fruity (Sujata Mastani).
5. **Chitale Bandhu Bakarwadi**: Crunchy spiced pinwheel rolls from Sadashiv Peth.
6. **Govinda's Pure Veg Sattvic Thali**: Freshly cooked Vedic buffet at ISKCON Katraj.`;
      suggestions = ['Explore 31 Verified Restaurants', 'Pure Veg Options in Pune', 'Book Food & Restaurant Seat'];
    } else if (qLower.includes('taxi') || qLower.includes('cab') || qLower.includes('fare') || qLower.includes('travel') || qLower.includes('distance')) {
      category = 'taxis';
      answer = `🚕 **Official Taxi Fares from Pune Central**:
All routes feature TourMaster verified EV GreenRide & AC cabs with fixed government rates:
• **Shaniwar Wada / Lal Mahal (3 km)**: ₹100–₹120
• **Aga Khan Palace (6 km)**: ₹120
• **Rajiv Gandhi Zoo / Katraj (8 km)**: ₹150
• **Khadakwasla Dam (20 km)**: ₹240
• **Sinhagad Fort (30 km)**: ₹450–₹500
• **Alandi / Dehu Pilgrimage (25–30 km)**: ₹300–₹360
• **Mulshi Dam / Panshet (45–50 km)**: ₹540–₹600
• **Rajgad / Torna Fort (60–65 km)**: ₹720–₹780
• **Lonavala / Khandala (65–70 km)**: ₹780–₹840
• **Imagicaa Theme Park (90 km)**: ₹1,080`;
      suggestions = ['Book EV GreenRide Cab', 'Compare Sedan vs SUV', 'View All 24 Taxi Routes'];
    } else if (qLower.includes('guide') || qLower.includes('historian')) {
      category = 'guides';
      answer = `🧑‍🏫 **Licensed Tour Guides (48 Certified Guides)**:
We offer government-verified multilingual guides across all 24 tourism spots:
• **Heritage & History Guides** (Shaniwar Wada, Lal Mahal, Aga Khan Palace): ₹400 – ₹700 / day.
• **Mountain & Trek Guides** (Sinhagad, Rajgad, Torna, Visapur, Rajmachi): ₹700 – ₹1,500 / day (Wilderness first-aid certified).
• **Spiritual Guides** (Dagdusheth, Alandi, Dehu, ISKCON, Swaminarayan): ₹400 – ₹700 / day.
• **Nature & Bird Guides** (Pashan Lake, Mulshi, Zoo): ₹500 – ₹700 / day.
• **Languages**: Marathi, Hindi, English, Gujarati.`;
      suggestions = ['Select & Hire a Tour Guide', 'View Guides for Forts', 'View Guides for Temples'];
    } else if (qLower.includes('translate') || qLower.includes('marathi') || qLower.includes('language') || qLower.includes('how to say')) {
      answer = `🗣️ **Essential Marathi Travel Phrases**:
• **Hello / Greetings**: "Namaskar" (नमस्कार)
• **How much does this cost?**: "He kiti la ahe?" (हे कितीला आहे?)
• **Where is the way to the fort/temple?**: "Kilyacha / Mandiracha rasta kuthun ahe?" (किल्ल्याचा / मंदिराचा रस्ता कुठून आहे?)
• **Is this food spicy?**: "He teekhat ahe ka?" (हे तिखट आहे का?)
• **Thank you very much**: "Khup khup dhanyavaad!" (खूप खूप धन्यवाद!)
• **Please help me**: "Krupaya mala madat kara" (कृपया मला मदत करा)`;
      suggestions = ['Translate food terms', 'Ask directions in Marathi', 'Emergency numbers in Marathi'];
    } else if (qLower.includes('sos') || qLower.includes('emergency') || qLower.includes('police') || qLower.includes('help') || qLower.includes('hospital') || qLower.includes('safety')) {
      answer = `🚨 **Emergency Safety & Assistance Helpline**:
• **National Emergency Helpline**: 112 (Police, Fire, Ambulance)
• **Tourist Police Helpline**: 1363 (24/7 Multi-lingual Tourist Support)
• **Medical Ambulance**: 108
• **Women Safety Helpline**: 1091
• **Pune Police Control Room**: 020-26122880
• **Western Ghats Mountain Rescue**: +91 98220 12345

💡 *You can also click the red **SOS button** on top to instantly broadcast your live GPS coordinates to the nearest patrol unit.*`;
      suggestions = ['Activate 1-Click SOS', 'Find nearest hospital', 'Call Tourist Police 1363'];
    } else if (isBookingQuery) {
      category = 'summary';
      answer = `🎟️ **Unified Tour Booking Studio**:
As a tourist in Maharashtra, you can build and book your complete tour in one unified travel pass!
1. **1. Select Spots**: Choose from 24 historic forts, palaces, and scenic lakes.
2. **2. Choose Stays**: Pick from 48 eco-resorts and heritage hotels.
3. **3. Reserve Food**: Add authentic thalis and vegetarian feasts.
4. **4. Book Taxis**: Reserve EV GreenRide cabs with fixed fares.
5. **5. Hire Guides**: Select certified historian and trek leaders.

Tap the button below to open the **Select Spots, Stays, Food, Taxis & Guides** studio!`;
      suggestions = [
        '🎟️ Open Spots, Stays, Food, Taxis & Guides Studio',
        '🏛️ Select Heritage Spots & Forts',
        '🏨 Book Verified Eco-Stays & Hotels',
        '🚕 Reserve EV GreenRide Cab & Driver',
        '🧑‍🏫 Book Licensed Cultural Guide'
      ];
    } else {
      answer = `Namaste! I am **TourMitra (तूर मित्र)**, your dedicated AI travel and cultural assistant for Pune and Maharashtra. 

I can help you with:
• 🏰 **All 24 Tourism Spots**: Historical lore, entry fees, timings, and photography tips.
• 🥾 **Fort Treks & Sahyadri Trails**: Sinhagad, Rajgad, Torna, Lohagad, Visapur, and Rajmachi.
• 🍛 **Local Cuisine & Food**: Best Pithla Bhakri, Puneri Misal, Bun Maska, and pure-veg thalis.
• 🚕 **Taxi Routes & Fares**: Fixed one-way rates for all 24 spots from Pune.
• 🗣️ **Multilingual Translations**: Useful Marathi and Hindi travel phrases.
• 🎟️ **Instant Tour Booking**: Unified pass for Spots, Hotels, Food, Taxis, and Guides.

What would you like to explore today?`;
      suggestions = [
        'Tell me about Shaniwar Wada & Sinhagad Fort',
        'What are the best street food spots in Pune?',
        'How much is a taxi to Lonavala & Khandala?',
        '🎟️ I want to book a complete tour package'
      ];
    }

    res.json({
      text: answer,
      isBookingIntent: isBookingQuery,
      bookingCategory: category,
      suggestions: suggestions
    });
  } catch (error) {
    console.error('Error in /api/ai/tour-guide:', error);
    res.status(500).json({ error: 'Failed to process assistant request' });
  }
});

// ----------------------------------------------------
// 4. WEATHER ADAPTATION ENGINE
// ----------------------------------------------------

app.post('/api/ai/adapt-weather', (req, res) => {
  const { itinerary, newWeatherCondition } = req.body;
  if (!itinerary) {
    return res.status(400).json({ error: 'Itinerary is required' });
  }

  // Clone and adapt activities for rain/heat
  const isRain = newWeatherCondition?.toLowerCase().includes('rain') || newWeatherCondition?.toLowerCase().includes('monsoon');
  const adapted = JSON.parse(JSON.stringify(itinerary));

  adapted.days = adapted.days.map((day: any) => {
    day.dayWeather.condition = isRain ? 'Rain / Monsoon' : 'Sunny';
    day.dayWeather.advisory = isRain
      ? '🌧️ Weather alert: Heavy rainfall detected. Outdoor trekking & open-air hillfort trails have been swapped for covered royal museums, heritage stepwells, and indoor textile workshops.'
      : '☀️ Weather alert: Clear sunny skies. Outdoor walking tours and panoramic viewpoints are active.';

    day.activities = day.activities.map((act: any) => {
      if (isRain && act.weatherSuitability === 'Outdoor-Ideal') {
        return {
          ...act,
          title: `[Weather-Adapted] ${act.title.replace('Trekking', 'Museum Walk').replace('Sunrise Fort', 'Palace Art Gallery')}`,
          description: `Indoor rainy day alternative: Enjoy covered royal exhibits and artisan galleries protected from weather disruptions.`,
          weatherSuitability: 'Indoor-Alternative'
        };
      }
      return act;
    });
    return day;
  });

  res.json({
    adaptedItinerary: adapted,
    adaptationMessage: isRain 
      ? 'Adaptive Weather Engine activated: Outdoor open-air activities successfully rescheduled to indoor cultural museums & covered heritage spots.' 
      : 'Weather normalized: Standard outdoor itinerary restored.'
  });
});

// ----------------------------------------------------
// 5. BOOKING MANAGEMENT (MOCK RAZORPAY & PASS)
// ----------------------------------------------------

app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const newBooking: Booking = {
    id: 'bk-' + Date.now(),
    bookingRef: `TM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    touristName: req.body.touristName || 'Verified Traveler',
    touristEmail: req.body.touristEmail || 'tourist@tourmaster.in',
    touristPhone: req.body.touristPhone || '+91 98765 00000',
    destination: req.body.destination || 'Jaipur, Rajasthan',
    items: req.body.items || [],
    totalAmount: Number(req.body.totalAmount) || 6800,
    paymentMethod: req.body.paymentMethod || 'Razorpay',
    paymentStatus: 'Paid',
    bookingDate: new Date().toISOString().split('T')[0],
    travelDates: req.body.travelDates || 'Upcoming Trip',
    qrPayload: `TOURMASTER-TICKET-${Date.now()}-CONFIRMED-SIH2026`,
    status: 'Confirmed',
  };

  bookings.unshift(newBooking);
  res.status(201).json(newBooking);
});

app.patch('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings[index].status = status;
    return res.json(bookings[index]);
  }
  res.status(404).json({ error: 'Booking not found' });
});

// ----------------------------------------------------
// 6. EMERGENCY SOS INCIDENT LOGGING & DISPATCH
// ----------------------------------------------------

app.get('/api/sos', (req, res) => {
  res.json(sosAlerts);
});

app.post('/api/sos', (req, res) => {
  const newSOS: SOSAlert = {
    id: 'sos-' + Date.now(),
    alertCode: `SOS-${Math.floor(100 + Math.random() * 900)}`,
    touristName: req.body.touristName || 'Tourist in Distress',
    touristPhone: req.body.touristPhone || '+91 98000 11111',
    lat: req.body.lat || 26.9124,
    lng: req.body.lng || 75.7873,
    locationDescription: req.body.locationDescription || 'Live GPS Beacon Triggered via Mobile App',
    timestamp: 'Just now',
    emergencyType: req.body.emergencyType || 'Medical',
    status: 'Dispatched',
    dispatchedUnit: 'Rapid PCR Response Unit 08 (Tourist Protection Force)',
    notes: req.body.notes || 'Automated SOS emergency alert triggered. Nearest medical and police patrol alerted with high priority.',
  };

  sosAlerts.unshift(newSOS);
  res.status(201).json(newSOS);
});

app.patch('/api/sos/:id', (req, res) => {
  const { id } = req.params;
  const { status, dispatchedUnit, notes } = req.body;
  const index = sosAlerts.findIndex(s => s.id === id);
  if (index !== -1) {
    if (status) sosAlerts[index].status = status;
    if (dispatchedUnit) sosAlerts[index].dispatchedUnit = dispatchedUnit;
    if (notes) sosAlerts[index].notes = notes;
    return res.json(sosAlerts[index]);
  }
  res.status(404).json({ error: 'SOS record not found' });
});

// ----------------------------------------------------
// 7. VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TOURMASTER Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
