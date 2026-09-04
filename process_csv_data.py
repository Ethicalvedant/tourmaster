import csv
import io
import json
import re
import os

RAW_ENTERTAINMENT = """tourism_spot,entertainment_place,distance_from_spot_km
Shaniwar Wada,Seven Wonders Dream Park,3.0
Shaniwar Wada,The Pavillion,2.9
Sinhagad Fort,Khadakwasla Dam,12.0
Sinhagad Fort,Fun Time Multiplex,20.0
Dagdusheth Halwai Ganpati,Laxmi Road,0.8
Dagdusheth Halwai Ganpati,Darshan Museum,2.3
Aga Khan Palace,Phoenix Marketcity Pune,2.5
Aga Khan Palace,Osho Teerth Park,2.5
Khadakwasla Dam,Sinhagad Fort,12.0
Khadakwasla Dam,Fun Time Multiplex,9.0
Rajgad Fort,Gunjavane Dam,8.0
Rajgad Fort,Torna Fort,12.0
Torna Fort,Gunjavane Dam,2.9
Torna Fort,Rajgad Fort,12.1
Mulshi Dam,Mulshi Backwaters Viewpoint,2.0
Mulshi Dam,Tamhini Ghat,20.0
Lonavala,Della Adventure Park,6.0
Lonavala,Imagicaa Theme Park,25.0
Khandala,Khandala Ghat View Point,0.5
Khandala,Della Adventure Park,4.0
Lohagad Fort,Visapur Fort,1.2
Lohagad Fort,Bhaja Caves,2.4
Panshet Dam,Panshet Boating,1.0
Panshet Dam,Krishnai Water Park,6.4
Visapur Fort,Lohagad Fort,1.2
Visapur Fort,Bhaja Caves,2.5
Rajmachi Fort,Rajmachi Point,5.0
Rajmachi Fort,Lonavala Lake,12.0
Rajiv Gandhi Zoological Park,Pune Snake Park,0.0
Rajiv Gandhi Zoological Park,Seven Wonders Dream Park,5.0
"ISKCON NVCC, Katraj",Pune Snake Park,3.0
"ISKCON NVCC, Katraj",Flying Panda Theme Park,4.0
"Swaminarayan Temple, Narhe",Butterfly Trampoline Park,3.0
"Swaminarayan Temple, Narhe",Fun Time Multiplex,4.0
Parvati Hill,Seven Wonders Dream Park,2.0
Parvati Hill,Sarasbaug,2.0
Alandi,Nova Fun Zone & Trampoline Park,3.0
Alandi,"Appu Ghar, Nigdi",12.0
Dehu,"Appu Ghar, Nigdi",8.0
Dehu,"Bird Valley Udyan, Chinchwad",10.0
Phoenix Mall of the Millennium,Indoor Gaming Zone,0.0
Phoenix Mall of the Millennium,Cinema / Multiplex,0.0
Imagicaa,Imagicaa Theme Park,0.0
Imagicaa,Imagicaa Water Park,0.0
Lal Mahal,Shaniwar Wada,0.5
Lal Mahal,Laxmi Road Shopping Area,0.8
Pashan Lake,Gram Sanskruti Udyan,4.0
Pashan Lake,The Pavillion Mall,4.0"""

RAW_GUIDES = """Tourism Spot,Guide Name,Approx. Guide Price
Shaniwar Wada,Pune Heritage Guide,₹500
Shaniwar Wada,Maratha History Guide,₹700
Sinhagad Fort,Sinhagad Local Trek Guide,₹700
Sinhagad Fort,Sahyadri Trek Guide,₹1,000
Dagdusheth Halwai Ganpati,Pune Temple Guide,₹400
Dagdusheth Halwai Ganpati,Pune Heritage Guide,₹600
Aga Khan Palace,Gandhi History Guide,₹500
Aga Khan Palace,Pune Heritage Guide,₹700
Khadakwasla Dam,Pune Nature Guide,₹500
Khadakwasla Dam,Local Sightseeing Guide,₹700
Rajgad Fort,Rajgad Trek Guide,₹1,000
Rajgad Fort,Sahyadri Adventure Guide,₹1,500
Torna Fort,Torna Trek Guide,₹1,000
Torna Fort,Sahyadri Local Guide,₹1,500
Mulshi Dam,Mulshi Nature Guide,₹700
Mulshi Dam,Adventure & Nature Guide,₹1,000
Lonavala,Lonavala Sightseeing Guide,₹700
Lonavala,Adventure Tour Guide,₹1,000
Khandala,Khandala Local Guide,₹600
Khandala,Hill Station Guide,₹800
Lohagad Fort,Lohagad Trek Guide,₹700
Lohagad Fort,Fort History Guide,₹1,000
Panshet Dam,Panshet Local Guide,₹600
Panshet Dam,Water Adventure Guide,₹900
Visapur Fort,Visapur Trek Guide,₹700
Visapur Fort,Sahyadri Trek Guide,₹1,000
Rajmachi Fort,Rajmachi Trek Guide,₹1,000
Rajmachi Fort,Adventure Trek Guide,₹1,500
Rajiv Gandhi Zoological Park,Wildlife Guide,₹500
Rajiv Gandhi Zoological Park,Nature & Wildlife Guide,₹700
"ISKCON NVCC, Katraj",Spiritual Guide,₹400
"ISKCON NVCC, Katraj",Temple & Culture Guide,₹600
"Swaminarayan Temple, Narhe",Temple Guide,₹400
"Swaminarayan Temple, Narhe",Spiritual & Architecture Guide,₹600
Parvati Hill Temple,Pune Heritage Guide,₹500
Parvati Hill Temple,Temple & History Guide,₹700
Alandi,Pilgrimage Guide,₹500
Alandi,Dnyaneshwar Maharaj Heritage Guide,₹700
Dehu,Pilgrimage Guide,₹500
Dehu,Sant Tukaram Heritage Guide,₹700
Phoenix Mall of the Millennium,Shopping Guide,₹300
Phoenix Mall of the Millennium,Entertainment Guide,₹500
Imagicaa,Theme Park Guide,₹500
Imagicaa,Adventure & Family Guide,₹800
Lal Mahal,Maratha History Guide,₹400
Lal Mahal,Heritage Guide,₹600
Pashan Lake,Nature & Birdwatching Guide,₹500
Pashan Lake,Photography & Nature Guide,₹700"""

RAW_HOTELS = """Tourism Spot,Nearby Hotel / Resort,Approx. Distance from Tourism Spot
Shaniwar Wada,Shantai Hotel,1.5 km
Shaniwar Wada,Pride Premier Pune,2.0 km
Sinhagad Fort,Sorina Hillside Resort,3.8 km
Sinhagad Fort,Wildernest Hilltop Resort,5.9 km
Dagdusheth Halwai Ganpati,Poona Guest House,0.1 km
Dagdusheth Halwai Ganpati,Shantai Hotel,1.7 km
Aga Khan Palace,Hyatt Pune,0.3 km
Aga Khan Palace,Magnus Nexstar Suites Kalyani Nagar,0.4 km
Khadakwasla Dam,SPOT ON 75667 Hotel Peacock Garden Lodge,1.6 km
Khadakwasla Dam,Wildernest Hilltop Resort,2.5 km
Rajgad Fort,Rajgad Resort / nearby stays,5 km
Rajgad Fort,Rajgad Valley Resort,8 km
Torna Fort,Hilltop Heaven Resort,3.1 km
Torna Fort,Cosmicstays Rajgad Vista Stay Play,8.5 km
Mulshi Dam,Malhar Machi Mountain Resorts,1.0 km
Mulshi Dam,Raanjan Hills Resort,2.4 km
Lonavala,Radisson Resort & Spa Lonavala,3 km
Lonavala,Regenta SGS Greenotel - Lonavala,2 km
Khandala,Della Resorts,3 km
Khandala,Radisson Resort & Spa Lonavala,5 km
Lohagad Fort,The Chavni,2 km
Lohagad Fort,The Voyage Zen Oasis,4 km
Panshet Dam,MTDC Resort Panshet,0.7 km
Panshet Dam,The Hosteller Panshet Lakeview,3.0 km
Visapur Fort,The Chavni,1.1 km
Visapur Fort,The Voyage Zen Oasis,3.2 km
Rajmachi Fort,Trek Rajmachi,0.6 km
Rajmachi Fort,Upper Deck Resort,5.1 km
Rajiv Gandhi Zoological Park,Hotel Utsav Deluxe,4.0 km
Rajiv Gandhi Zoological Park,Deccan Pavilion Katraj,5.7 km
"ISKCON NVCC, Katraj",Hotel HMR Royal Inn,4 km
"ISKCON NVCC, Katraj",Hotel Nirmal's Executive,5 km
"Swaminarayan Temple, Narhe",OYO Hotel Aarambh,0.5 km
"Swaminarayan Temple, Narhe",Wow Executive Lodging & Boarding,3 km
Parvati Hill,Hotel Utsav Deluxe,2.0 km
Parvati Hill,Gandharv Residency,2.3 km
Alandi,Akshay Lodge,0.5 km
Alandi,OYO Ashoka Hotel Lodge Marriage Hall,1 km
Dehu,Local hotels/lodges near Dehu Temple,3 km
Dehu,Hotels near Dehu Road,6 km
Phoenix Mall of the Millennium,The Orchid Hotel Pune,8 km
Phoenix Mall of the Millennium,Radisson Blu Pune Hinjawadi,7 km
Phoenix Marketcity Pune,Four Points by Sheraton Hotel & Serviced Apartments Pune,2 km
Phoenix Marketcity Pune,HHI (Hotel Hindusthan International) Pune,2 km
Amanora Mall,Amanora The Fern Pune Series by Marriott,0.2 km
Amanora Mall,Itsy Hotels Anand Executive,0.3 km
Seasons Mall,Cocoon Hotel,1.1 km
Seasons Mall,Monarch Guestline Magarpatta,0.8 km
Imagicaa,Novotel Imagicaa Khopoli,0.2 km
Imagicaa,Radisson Resort & Spa Khopoli,0.3 km
Pashan Lake,OYO 7673 The Ark Apartment Hotel,0.9 km
Pashan Lake,Hamlet by Daily Stays,2.3 km"""

RAW_RESTAURANTS = """Tourism Spot,Restaurant,Approx. Distance from Tourism Spot
Shaniwar Wada,Sudamache Pohe,0.1 km
Shaniwar Wada,Hotel Aatithya,0.7 km
Shaniwar Wada,Shahji's Parantha House,0.8 km
Shaniwar Wada,Mohan Ice Cream,1.0 km
Shaniwar Wada,Maratha Samrat,1.8 km
Sinhagad Fort,Hotel Sagara Prime,3.8 km
Sinhagad Fort,Hotel Swagat Family Restaurant,4.0 km
Sinhagad Fort,Local Sinhagad food stalls,3 km
Dagdusheth Halwai Ganpati,Shahji's Parantha House,0.6 km
Dagdusheth Halwai Ganpati,Shreeji Ice Cream,0.6 km
Dagdusheth Halwai Ganpati,Hotel Pyasa Restaurant,0.3 km
Dagdusheth Halwai Ganpati,Cafe GoodLuck,1.5 km
Dagdusheth Halwai Ganpati,Moreshwar Foodee Corner,0.6 km
Aga Khan Palace,Barbeque Nation - Kalyani Nagar - Pune,0.5 km
Aga Khan Palace,Saffron Restaurant - North Indian Restaurant in Pune,1.0 km
Aga Khan Palace,Her Highness Restaurant,1.5 km
Khadakwasla Dam,Hotel Mejwani Pure Veg,1.2 km
Khadakwasla Dam,Crostarizza,1.3 km
Khadakwasla Dam,Mircho Misal,1.5 km
Khadakwasla Dam,GrillKarlo,1.6 km
Rajgad Fort,Rajgad Valley Restaurant,5 km
Rajgad Fort,Rajgad Resort Restaurant,6 km
Torna Fort,Torna Valley Restaurant,4 km
Torna Fort,Local village restaurants,5 km
Mulshi Dam,Basho's Resort & Restaurant,5.6 km
Mulshi Dam,Quick Bite,7.6 km
Mulshi Dam,Tikona Picnic,8.5 km
Mulshi Dam,Dining Cliff Cafe,8.7 km
Lonavala,Lonavala Local Delights,3 km
Lonavala,Della Villa Bistro,6 km
Lonavala,Mapro Garden Restaurant,7 km
Khandala,Della Villa Bistro,2 km
Khandala,The Sattva,5 km
Lohagad Fort,The Chavni,2 km
Lohagad Fort,Lohagad Wadi local restaurants,3 km
Panshet Dam,MTDC Panshet Restaurant,1 km
Panshet Dam,Panshet Lake View Restaurant,3 km
Visapur Fort,The Chavni,2 km
Visapur Fort,Malavli local restaurants,4 km
Rajmachi Fort,Rajmachi local food stalls,1 km
Rajmachi Fort,Udhewadi Village Restaurants,2 km
Rajiv Gandhi Zoological Park,Hotel Utsav Deluxe,4 km
Rajiv Gandhi Zoological Park,Deccan Pavilion,5 km
"ISKCON NVCC, Katraj",Govinda's -International Chain Of Restaurant,0.1 km
"ISKCON NVCC, Katraj",Krushnasagar Pure Veg Restaurant,3 km
"Swaminarayan Temple, Narhe",Narayan dining,0.5 km
"Swaminarayan Temple, Narhe",Shreeji Pure Veg - Narhe,2 km
Parvati Hill,The Sky Kitchen & Banquets,2.3 km
Parvati Hill,Cafe Peter,1.8 km
Parvati Hill,La Casetta,2.2 km
Parvati Hill,Jolly Jars,1.2 km
Alandi,Local restaurants near Alandi Temple,1 km
Alandi,Prasad restaurants near temple,1 km
Dehu,Restaurants near Dehu Gatha Temple,1 km
Dehu,Local Maharashtrian restaurants,2 km
Phoenix Mall of the Millennium,Restaurants inside Phoenix Mall,0.2 km
Phoenix Mall of the Millennium,Food court,0.2 km
Phoenix Marketcity Pune,Copper Chimney Viman Nagar,0.5 km
Phoenix Marketcity Pune,Restaurants inside Phoenix Marketcity,0.2 km
Amanora Mall,Hard Rock Cafe,0 km
Amanora Mall,Wah Marathi,0.3 km
Amanora Mall,Burger King,0.2 km
Amanora Mall,Indimex,0.3 km
Seasons Mall,Shanghai Spice & Sizzlers,0 km
Seasons Mall,Wah Marathi,0.1 km
Seasons Mall,Hard Rock Cafe,0.3 km
Seasons Mall,Cafe Arabia,0.1 km
Imagicaa,Novotel Imagicaa Restaurant,0.2 km
Imagicaa,Imagicaa Food Court,0.2 km
Lal Mahal,Restaurants near Shaniwar Wada,1 km
Lal Mahal,Sudamache Pohe,1 km
Pashan Lake,Restaurants near Pashan-Sus Road,1 km
Pashan Lake,Café/restaurant options near Baner,3 km"""

RAW_SPOTS = """Tourism Spot,Approx. Distance from Pune,Best Known For
Shaniwar Wada,3 km,"Maratha history, heritage"
Sinhagad Fort,30 km,"Fort, trekking, scenery"
Dagdusheth Halwai Ganpati,3 km,Famous temple
Aga Khan Palace,6 km,"History, Gandhi memorial"
Khadakwasla Dam,20 km,"Lake, sunset, nature"
Rajgad Fort,60 km,"Trekking, Maratha history"
Torna Fort,65 km,"Trekking, historic fort"
Mulshi Dam,45 km,"Mountains, lake, nature"
Lonavala,65 km,"Hills, waterfalls, viewpoints"
Khandala,70 km,"Hill station, viewpoints"
Lohagad Fort,65 km,"Trekking, fort"
Panshet Dam,50 km,"Water activities, nature"
Visapur Fort,65 km,"Trekking, fort"
Rajmachi Fort,80 km,"Trekking, Sahyadri scenery"
Rajiv Gandhi Zoological Park,8 km,"Wildlife, family tourism"
"ISKCON NVCC, Katraj",12 km,"Krishna temple, spiritual tourism"
"Swaminarayan Temple, Narhe",15 km,"Hindu temple, architecture, spirituality"
Parvati Hill Temple,6 km,"Temple, city views, heritage"
Alandi,25 km,"Sant Dnyaneshwar Samadhi, pilgrimage"
Dehu,30 km,"Sant Tukaram Maharaj, pilgrimage"
Phoenix Mall of the Millennium,15 km,"Shopping, food, entertainment"
Phoenix Marketcity Pune,8 km,"Shopping, luxury retail, dining"
Amanora Mall,10 km,"Lifestyle, entertainment, shopping"
Seasons Mall,10 km,"Cinema, food court, shopping"
Imagicaa,90 km,"Theme park, rides, family entertainment"
Lal Mahal,3 km,Shivaji Maharaj history
Pashan Lake,10 km,"Birdwatching, nature, walking" """

# Normalized Spot Metadata
SPOT_COORDS = {
    "Shaniwar Wada": (18.5196, 73.8553, "Heritage & Culture", 25, 4.6, 92, "/images/spots/shaniwar-wada.jpg"),
    "Sinhagad Fort": (18.3663, 73.7558, "Adventure & Trekking", 50, 4.8, 96, "/images/spots/sinhagad-fort.jpg"),
    "Dagdusheth Halwai Ganpati": (18.5165, 73.8561, "Spiritual & Wellness", 0, 4.9, 94, "/images/spots/dagdusheth-halwai-ganpati.jpg"),
    "Aga Khan Palace": (18.5524, 73.9015, "Heritage & Culture", 25, 4.6, 94, "/images/spots/aga-khan-palace.jpg"),
    "Khadakwasla Dam": (18.4287, 73.7661, "Nature & Wildlife", 0, 4.5, 91, "/images/spots/khadakwasla-dam.jpg"),
    "Rajgad Fort": (18.2582, 73.6828, "Adventure & Trekking", 50, 4.8, 98, "/images/spots/rajgad-fort.jpg"),
    "Torna Fort": (18.2772, 73.6231, "Adventure & Trekking", 50, 4.7, 97, "/images/spots/torna-fort.jpg"),
    "Mulshi Dam": (18.5028, 73.4939, "Nature & Wildlife", 0, 4.6, 95, "/images/spots/mulshi-dam.jpg"),
    "Lonavala": (18.7557, 73.4091, "Nature & Wildlife", 50, 4.7, 93, "/images/spots/lonavala.jpg"),
    "Khandala": (18.7617, 73.3768, "Nature & Wildlife", 50, 4.6, 92, "/images/spots/khandala.jpg"),
    "Lohagad Fort": (18.7058, 73.4794, "Adventure & Trekking", 50, 4.7, 95, "/images/spots/lohagad-fort.jpg"),
    "Panshet Dam": (18.3756, 73.5939, "Nature & Wildlife", 30, 4.5, 94, "/images/spots/panshet-dam.jpg"),
    "Visapur Fort": (18.7186, 73.4878, "Adventure & Trekking", 50, 4.7, 95, "/images/spots/visapur-fort.jpg"),
    "Rajmachi Fort": (18.8286, 73.3986, "Adventure & Trekking", 50, 4.8, 97, "/images/spots/rajmachi-fort.jpg"),
    "Rajiv Gandhi Zoological Park": (18.4552, 73.8617, "Nature & Wildlife", 40, 4.4, 90, "/images/spots/rajiv-gandhi-zoological-park.jpg"),
    "ISKCON NVCC, Katraj": (18.4485, 73.8804, "Spiritual & Wellness", 0, 4.8, 93, "/images/spots/iskcon-nvcc-katraj.jpg"),
    "Swaminarayan Temple, Narhe": (18.4467, 73.8189, "Spiritual & Wellness", 0, 4.7, 92, "/images/spots/swaminarayan-temple-narhe.jpg"),
    "Parvati Hill": (18.4980, 73.8475, "Heritage & Culture", 0, 4.6, 92, "/images/spots/parvati-hill.jpg"),
    "Parvati Hill Temple": (18.4980, 73.8475, "Spiritual & Wellness", 0, 4.6, 92, "/images/spots/parvati-hill-temple.jpg"),
    "Alandi": (18.6772, 73.8967, "Spiritual & Wellness", 0, 4.8, 91, "/images/spots/alandi.jpg"),
    "Dehu": (18.7189, 73.7717, "Spiritual & Wellness", 0, 4.7, 90, "/images/spots/dehu.jpg"),
    "Phoenix Mall of the Millennium": (18.5986, 73.7667, "Eco-Tourism & Rural", 0, 4.7, 88, "/images/spots/phoenix-mall-of-the-millennium.jpg"),
    "Phoenix Marketcity Pune": (18.5622, 73.9167, "Eco-Tourism & Rural", 0, 4.7, 89, "/images/spots/phoenix-marketcity-pune.jpg"),
    "Amanora Mall": (18.5194, 73.9317, "Eco-Tourism & Rural", 0, 4.6, 88, "/images/spots/amanora-mall.jpg"),
    "Seasons Mall": (18.5186, 73.9333, "Eco-Tourism & Rural", 0, 4.6, 88, "/images/spots/seasons-mall.jpg"),
    "Imagicaa": (18.7492, 73.2844, "Adventure & Trekking", 1499, 4.6, 88, "/images/spots/imagicaa.jpg"),
    "Lal Mahal": (18.5194, 73.8561, "Heritage & Culture", 10, 4.5, 91, "/images/spots/lal-mahal.jpg"),
    "Pashan Lake": (18.5367, 73.7844, "Nature & Wildlife", 0, 4.4, 95, "/images/spots/pashan-lake.jpg")
}

def parse_price(val_str):
    nums = re.findall(r'\d+', val_str.replace(',', ''))
    return int(nums[0]) if nums else 500

def parse_dist(dist_str):
    nums = re.findall(r'[\d\.]+', str(dist_str))
    return float(nums[0]) if nums else 1.0

# 1. Parse Spots
spots_list = []
reader_spots = csv.DictReader(io.StringIO(RAW_SPOTS.strip()))
for i, row in enumerate(reader_spots):
    name = row.get("Tourism Spot", "").strip()
    dist_pune = row.get("Approx. Distance from Pune", "0 km").strip()
    best_known = row.get("Best Known For", "Heritage spot").strip()
    
    meta = SPOT_COORDS.get(name, (18.5204, 73.8567, "Heritage & Culture", 25, 4.7, 92, "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"))
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    
    spots_list.append({
        "id": f"spot-{slug}",
        "name": name,
        "city": "Pune",
        "state": "Maharashtra",
        "category": meta[2],
        "description": f"{name} in Maharashtra. Best known for: {best_known}.",
        "lat": meta[0],
        "lng": meta[1],
        "timings": "08:00 AM - 06:30 PM",
        "entryFee": meta[3],
        "rating": meta[4],
        "reviewsCount": int(meta[4] * 6200),
        "ecoScore": meta[5],
        "isVerified": True,
        "imageUrl": meta[6],
        "bestTimeToVisit": "Morning slot (08:30 AM - 11:30 AM)",
        "nearestTransport": f"EV Cab / PMC Transit ({dist_pune} from Pune Hub)",
        "distanceFromPune": dist_pune,
        "tags": [t.strip() for t in best_known.split(',')] + ["Verified", "SIH2026"]
    })

# 2. Parse Hotels
hotels_list = []
reader_hotels = csv.DictReader(io.StringIO(RAW_HOTELS.strip()))
hotel_prices = [1200, 1800, 2400, 3200, 4500, 5800, 2800, 3500]
for i, row in enumerate(reader_hotels):
    spot = row.get("Tourism Spot", "").strip()
    hotel_name = row.get("Nearby Hotel / Resort", "").strip()
    dist_str = row.get("Approx. Distance from Tourism Spot", "1.0 km").strip()
    if not hotel_name:
        continue
    
    dist_km = parse_dist(dist_str)
    price = hotel_prices[i % len(hotel_prices)]
    rating = round(4.3 + (i % 6) * 0.1, 1)
    if rating > 5.0: rating = 4.9
    
    hotels_list.append({
        "id": f"hotel-{i+1}",
        "tourismSpot": spot,
        "hotelName": hotel_name,
        "distanceFromSpot": dist_str,
        "distanceKm": dist_km,
        "rating": rating,
        "pricePerNight": price,
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
        "amenities": ["Free WiFi", "AC", "Breakfast", "Eco-Certified Stays", "Verified Host"]
    })

# 3. Parse Restaurants
restaurants_list = []
reader_rest = csv.DictReader(io.StringIO(RAW_RESTAURANTS.strip()))
rest_prices = [250, 400, 600, 350, 800, 500, 300, 750]
cuisines = ["Authentic Maharashtrian & Thali", "North Indian & Mughlai", "Street Food & Snacks", "Cafe & Beverages", "Pure Veg Regional Delights", "Multi-Cuisine & Biryani"]
for i, row in enumerate(reader_rest):
    spot = row.get("Tourism Spot", "").strip()
    rest_name = row.get("Restaurant", "").strip()
    dist_str = row.get("Approx. Distance from Tourism Spot", "0.5 km").strip()
    if not rest_name:
        continue
    
    dist_km = parse_dist(dist_str)
    price_two = rest_prices[i % len(rest_prices)]
    rating = round(4.2 + (i % 7) * 0.1, 1)
    if rating > 5.0: rating = 4.8
    cuisine = cuisines[i % len(cuisines)]
    is_pure_veg = "pure veg" in rest_name.lower() or "pohe" in rest_name.lower() or "ice cream" in rest_name.lower() or "thali" in cuisine.lower() or (i % 2 == 0)
    
    restaurants_list.append({
        "id": f"rest-{i+1}",
        "tourismSpot": spot,
        "restaurantName": rest_name,
        "distanceFromSpot": dist_str,
        "distanceKm": dist_km,
        "cuisine": cuisine,
        "priceForTwo": price_two,
        "rating": rating,
        "isPureVeg": is_pure_veg
    })

# 4. Parse Guides
guides_list = []
reader_guides = csv.DictReader(io.StringIO(RAW_GUIDES.strip()))
for i, row in enumerate(reader_guides):
    spot = row.get("Tourism Spot", "").strip()
    guide_name = row.get("Guide Name", "").strip()
    price_str = row.get("Approx. Guide Price", "₹500").strip()
    if not guide_name:
        continue
    
    price_inr = parse_price(price_str)
    rating = round(4.6 + (i % 4) * 0.1, 1)
    if rating > 5.0: rating = 4.9
    
    guides_list.append({
        "id": f"guide-{i+1}",
        "tourismSpot": spot,
        "guideName": guide_name,
        "approxGuidePrice": price_str,
        "priceINR": price_inr,
        "dailyRate": price_inr,
        "rating": rating,
        "languages": ["English", "Hindi", "Marathi"],
        "experienceYears": 3 + (i % 12),
        "specialization": "Heritage & Historical Lore" if "heritage" in guide_name.lower() or "history" in guide_name.lower() else "Trek & Adventure" if "trek" in guide_name.lower() else "Culture & Local Tourism"
    })

# 5. Parse Entertainment & Activities
entertainments_list = []
reader_ent = csv.DictReader(io.StringIO(RAW_ENTERTAINMENT.strip()))
ent_fees = [50, 100, 200, 350, 0, 150, 500, 750]
for i, row in enumerate(reader_ent):
    spot = row.get("tourism_spot", "").strip()
    ent_place = row.get("entertainment_place", "").strip()
    dist_str = row.get("distance_from_spot_km", "1.0").strip()
    if not ent_place:
        continue
    
    dist_km = parse_dist(dist_str)
    fee = ent_fees[i % len(ent_fees)]
    rating = round(4.4 + (i % 5) * 0.1, 1)
    
    entertainments_list.append({
        "id": f"ent-{i+1}",
        "tourismSpot": spot,
        "entertainmentPlace": ent_place,
        "distanceFromSpot": f"{dist_km} km",
        "distanceKm": dist_km,
        "category": "Theme Park & Rides" if "park" in ent_place.lower() or "imagicaa" in ent_place.lower() else "Shopping & Mall" if "mall" in ent_place.lower() or "pavillion" in ent_place.lower() else "Nature & Viewpoint" if "dam" in ent_place.lower() or "point" in ent_place.lower() else "Sightseeing & Leisure",
        "approxEntryFee": fee,
        "rating": rating
    })

# 6. Generate Taxis from Spot Distances
taxis_list = []
for i, s in enumerate(spots_list):
    dist_km = parse_dist(s["distanceFromPune"])
    fare = round(max(300, dist_km * 18 + 150))
    taxis_list.append({
        "id": f"taxi-{i+1}",
        "tourismSpot": s["name"],
        "distanceFromPune": s["distanceFromPune"],
        "distanceKm": dist_km,
        "approxTaxiFare": f"₹{fare}",
        "fareAmount": fare,
        "bestTravelOption": f"GreenRide Zero-Emission EV Cab (Direct from Pune Hub to {s['name']})"
    })

print(f"Parsed summary: {len(spots_list)} spots, {len(hotels_list)} hotels, {len(restaurants_list)} restaurants, {len(guides_list)} guides, {len(entertainments_list)} entertainments, {len(taxis_list)} taxis.")

# Generate full JSON database
full_db = {
    "touristSpots": spots_list,
    "hotelsList": hotels_list,
    "restaurantsList": restaurants_list,
    "entertainmentsList": entertainments_list,
    "taxisList": taxis_list,
    "guidesList": guides_list,
    "serviceProviders": [
        {
            "id": f"prov-hotel-{h['id']}",
            "name": h["hotelName"],
            "type": "Hotel",
            "city": "Pune",
            "rating": h["rating"],
            "verified": True,
            "pricePerUnit": h["pricePerNight"],
            "unitLabel": "per night",
            "description": f"Verified comfortable stay near {h['tourismSpot']} ({h['distanceFromSpot']}).",
            "contactNumber": "+91 98220 12345",
            "availableSlots": 8,
            "ecoCertified": True,
            "ecoTier": "Gold Green",
            "image": h["image"],
            "amenities": h["amenities"]
        } for h in hotels_list[:15]
    ] + [
        {
            "id": f"prov-guide-{g['id']}",
            "name": g["guideName"],
            "type": "Guide",
            "city": "Pune",
            "rating": g["rating"],
            "verified": True,
            "pricePerUnit": g["priceINR"],
            "unitLabel": "per day tour",
            "description": f"Accredited local guide specialized in {g['specialization']} at {g['tourismSpot']}.",
            "contactNumber": "+91 98500 54321",
            "availableSlots": 3,
            "ecoCertified": True,
            "ecoTier": "Gold Green",
            "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            "languages": g["languages"]
        } for g in guides_list[:15]
    ],
    "bookings": [],
    "sosAlerts": [],
    "destinations": [
        {
            "id": "dest-pune",
            "name": "Pune, Maharashtra",
            "city": "Pune",
            "state": "Maharashtra",
            "description": "The cultural capital of Maharashtra with Sahyadri hill forts, historic Peshwa palaces, and iconic food trails.",
            "imageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
            "spotsCount": len(spots_list),
            "rating": 4.8,
            "weather": "25°C Pleasant",
            "avgEcoScore": 93,
            "tagline": "Oxford of the East & Maratha Heritage Hub"
        }
    ],
    "advisories": [
        {
            "id": "adv-1",
            "title": "Sahyadri Forts Weekend Trekking Safety Advisory",
            "severity": "Info",
            "category": "Crowd Management",
            "targetCity": "Pune, Maharashtra",
            "message": "Start fort treks before 07:30 AM to avoid midday heat. EV Cabs and verified guides are available at base camps.",
            "issuedBy": "Maharashtra Tourism Development Corporation (MTDC)",
            "timestamp": "Today",
            "active": True
        }
    ],
    "feedbacksList": [],
    "complaintsList": []
}

# Write JSON
json_path = os.path.join("src", "data", "tourism_data.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(full_db, f, indent=2, ensure_ascii=False)
print(f"Updated {json_path} with {len(spots_list)} spots and complete CSV data!")

# Generate PostgreSQL schema.sql
sql_lines = [
    "-- ============================================================================",
    "-- TOURMASTER AI - PostgreSQL Database Schema & Seed Data",
    "-- Smart India Hackathon 2026 (Problem Statement 26204)",
    "-- ============================================================================",
    "",
    "CREATE TABLE IF NOT EXISTS tourist_spots (",
    "    id VARCHAR(64) PRIMARY KEY,",
    "    name VARCHAR(255) NOT NULL,",
    "    city VARCHAR(100) DEFAULT 'Pune',",
    "    state VARCHAR(100) DEFAULT 'Maharashtra',",
    "    category VARCHAR(100),",
    "    description TEXT,",
    "    lat NUMERIC(10, 6),",
    "    lng NUMERIC(10, 6),",
    "    timings VARCHAR(100),",
    "    entry_fee NUMERIC(10, 2) DEFAULT 0,",
    "    rating NUMERIC(3, 2) DEFAULT 4.5,",
    "    reviews_count INT DEFAULT 0,",
    "    eco_score INT DEFAULT 90,",
    "    is_verified BOOLEAN DEFAULT TRUE,",
    "    image_url TEXT,",
    "    distance_from_pune VARCHAR(50)",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS hotels (",
    "    id VARCHAR(64) PRIMARY KEY,",
    "    tourism_spot VARCHAR(255) NOT NULL,",
    "    hotel_name VARCHAR(255) NOT NULL,",
    "    distance_from_spot VARCHAR(50),",
    "    distance_km NUMERIC(6, 2),",
    "    rating NUMERIC(3, 2) DEFAULT 4.5,",
    "    price_per_night NUMERIC(10, 2) NOT NULL,",
    "    image_url TEXT",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS restaurants (",
    "    id VARCHAR(64) PRIMARY KEY,",
    "    tourism_spot VARCHAR(255) NOT NULL,",
    "    restaurant_name VARCHAR(255) NOT NULL,",
    "    distance_from_spot VARCHAR(50),",
    "    distance_km NUMERIC(6, 2),",
    "    cuisine VARCHAR(255),",
    "    price_for_two NUMERIC(10, 2),",
    "    rating NUMERIC(3, 2) DEFAULT 4.5,",
    "    is_pure_veg BOOLEAN DEFAULT FALSE",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS guides (",
    "    id VARCHAR(64) PRIMARY KEY,",
    "    tourism_spot VARCHAR(255) NOT NULL,",
    "    guide_name VARCHAR(255) NOT NULL,",
    "    approx_guide_price VARCHAR(50),",
    "    price_inr NUMERIC(10, 2),",
    "    rating NUMERIC(3, 2) DEFAULT 4.8,",
    "    specialization VARCHAR(255)",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS entertainments (",
    "    id VARCHAR(64) PRIMARY KEY,",
    "    tourism_spot VARCHAR(255) NOT NULL,",
    "    entertainment_place VARCHAR(255) NOT NULL,",
    "    distance_from_spot_km NUMERIC(6, 2),",
    "    category VARCHAR(100),",
    "    approx_entry_fee NUMERIC(10, 2),",
    "    rating NUMERIC(3, 2)",
    ");",
    "",
    "CREATE TABLE IF NOT EXISTS taxi_routes (",
    "    id VARCHAR(64) PRIMARY KEY,",
    "    tourism_spot VARCHAR(255) NOT NULL,",
    "    distance_from_pune VARCHAR(50),",
    "    distance_km NUMERIC(6, 2),",
    "    approx_taxi_fare VARCHAR(50),",
    "    fare_amount NUMERIC(10, 2),",
    "    best_travel_option TEXT",
    ");",
    "",
    "-- SEED DATA INSERTIONS",
]

for s in spots_list:
    desc_clean = s['description'].replace("'", "''")
    sql_lines.append(f"INSERT INTO tourist_spots (id, name, city, state, category, description, lat, lng, timings, entry_fee, rating, reviews_count, eco_score, is_verified, image_url, distance_from_pune) VALUES ('{s['id']}', '{s['name']}', '{s['city']}', '{s['state']}', '{s['category']}', '{desc_clean}', {s['lat']}, {s['lng']}, '{s['timings']}', {s['entryFee']}, {s['rating']}, {s['reviewsCount']}, {s['ecoScore']}, TRUE, '{s['imageUrl']}', '{s['distanceFromPune']}') ON CONFLICT (id) DO UPDATE SET entry_fee = EXCLUDED.entry_fee, rating = EXCLUDED.rating;")

for h in hotels_list:
    hname_clean = h['hotelName'].replace("'", "''")
    sql_lines.append(f"INSERT INTO hotels (id, tourism_spot, hotel_name, distance_from_spot, distance_km, rating, price_per_night, image_url) VALUES ('{h['id']}', '{h['tourismSpot']}', '{hname_clean}', '{h['distanceFromSpot']}', {h['distanceKm']}, {h['rating']}, {h['pricePerNight']}, '{h['image']}') ON CONFLICT (id) DO NOTHING;")

for r in restaurants_list:
    rname_clean = r['restaurantName'].replace("'", "''")
    sql_lines.append(f"INSERT INTO restaurants (id, tourism_spot, restaurant_name, distance_from_spot, distance_km, cuisine, price_for_two, rating, is_pure_veg) VALUES ('{r['id']}', '{r['tourismSpot']}', '{rname_clean}', '{r['distanceFromSpot']}', {r['distanceKm']}, '{r['cuisine']}', {r['priceForTwo']}, {r['rating']}, {str(r['isPureVeg']).upper()}) ON CONFLICT (id) DO NOTHING;")

for g in guides_list:
    gname_clean = g['guideName'].replace("'", "''")
    sql_lines.append(f"INSERT INTO guides (id, tourism_spot, guide_name, approx_guide_price, price_inr, rating, specialization) VALUES ('{g['id']}', '{g['tourismSpot']}', '{gname_clean}', '{g['approxGuidePrice']}', {g['priceINR']}, {g['rating']}, '{g['specialization']}') ON CONFLICT (id) DO NOTHING;")

for e in entertainments_list:
    ename_clean = e['entertainmentPlace'].replace("'", "''")
    sql_lines.append(f"INSERT INTO entertainments (id, tourism_spot, entertainment_place, distance_from_spot_km, category, approx_entry_fee, rating) VALUES ('{e['id']}', '{e['tourismSpot']}', '{ename_clean}', {e['distanceKm']}, '{e['category']}', {e['approxEntryFee']}, {e['rating']}) ON CONFLICT (id) DO NOTHING;")

for t in taxis_list:
    sql_lines.append(f"INSERT INTO taxi_routes (id, tourism_spot, distance_from_pune, distance_km, approx_taxi_fare, fare_amount, best_travel_option) VALUES ('{t['id']}', '{t['tourismSpot']}', '{t['distanceFromPune']}', {t['distanceKm']}, '{t['approxTaxiFare']}', {t['fareAmount']}, '{t['bestTravelOption']}') ON CONFLICT (id) DO NOTHING;")

with open("schema.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))
print("Created schema.sql PostgreSQL database script!")

# Generate mockTourismData.ts
ts_content = f"""/**
 * ============================================================================
 * TourMaster AI - Unified Master Tourism Dataset (PostgreSQL Synced)
 * ============================================================================
 * Sourced directly from PostgreSQL Relational Database Schema & SIH 2026 Datasets.
 */

import {{ 
  TouristSpot, HotelItem, RestaurantItem, EntertainmentItem, TaxiRoute, GuideItem, Destination,
  ServiceProvider, Booking, SOSAlert, OrganisationAdvisory, FeedbackItem, ComplaintItem, DayPlan
}} from '../types';

export const MASTER_TOURIST_SPOTS: TouristSpot[] = {json.dumps(spots_list, indent=2)};

export const MASTER_HOTELS: HotelItem[] = {json.dumps(hotels_list, indent=2)};

export const MASTER_RESTAURANTS: RestaurantItem[] = {json.dumps(restaurants_list, indent=2)};

export const MASTER_ENTERTAINMENTS: EntertainmentItem[] = {json.dumps(entertainments_list, indent=2)};

export const MASTER_TAXIS: TaxiRoute[] = {json.dumps(taxis_list, indent=2)};

export const MASTER_GUIDES: GuideItem[] = {json.dumps(guides_list, indent=2)};

export const POPULAR_DESTINATIONS: Destination[] = {json.dumps(full_db['destinations'], indent=2)};

export const INITIAL_SERVICE_PROVIDERS: ServiceProvider[] = [
  {{
    id: 'prov-1',
    name: 'Shantai Hotel & Suites Pune',
    type: 'Hotel',
    city: 'Pune',
    rating: 4.8,
    verified: true,
    pricePerUnit: 1200,
    unitLabel: 'per night',
    description: 'Heritage-facing boutique eco hotel near Shaniwar Wada with green certification.',
    contactNumber: '+91 98220 55441',
    availableSlots: 8,
    ecoCertified: true,
    ecoTier: 'Gold Green',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80',
    amenities: ['Solar Heated Water', 'Organic Breakfast', 'EV Charging Spot', 'Waste Composting'],
    isLiveAvailable: true,
    kycStatus: 'Verified',
    licenseNumber: 'MAH-PUN-HTL-8821',
    joinedYear: 2021
  }},
  {{
    id: 'prov-2',
    name: 'GreenRide Pune Electric Fleet',
    type: 'Taxi',
    city: 'Pune',
    rating: 4.9,
    verified: true,
    pricePerUnit: 14,
    unitLabel: 'per km',
    description: 'Zero-emission EV taxi fleet covering all Pune Sahyadri fort circuits and airport corridors.',
    contactNumber: '+91 98900 12345',
    availableSlots: 20,
    ecoCertified: true,
    ecoTier: 'Platinum Zero-Carbon',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    vehicleTypes: ['Tata Nexon EV', 'MG ZS EV', 'Electric Mini Bus'],
    isLiveAvailable: true,
    kycStatus: 'Verified',
    licenseNumber: 'MAH-PUN-EV-2024',
    joinedYear: 2022
  }},
  {{
    id: 'prov-3',
    name: 'Sahyadri Licensed Tour Guides Association',
    type: 'Guide',
    city: 'Pune',
    rating: 4.9,
    verified: true,
    pricePerUnit: 800,
    unitLabel: 'per day',
    description: 'Government licensed heritage historians and wilderness first-aid certified mountain guides.',
    contactNumber: '+91 94220 11223',
    availableSlots: 15,
    ecoCertified: true,
    ecoTier: 'Gold Green',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    languages: ['Marathi', 'Hindi', 'English'],
    isLiveAvailable: true,
    kycStatus: 'Verified',
    licenseNumber: 'MAH-PUN-GDE-5531',
    joinedYear: 2017
  }}
];

export const VERIFIED_SERVICE_PROVIDERS: ServiceProvider[] = INITIAL_SERVICE_PROVIDERS;

export const EMERGENCY_NUMBERS = [
  {{ name: 'National Emergency Helpline', number: '112', desc: 'All emergencies, Police, Fire, Ambulance' }},
  {{ name: 'Tourist Police Helpline', number: '1363', desc: '24x7 Multi-lingual Tourist Assistance' }},
  {{ name: 'Ambulance / Medical', number: '108', desc: 'Emergency Medical Response & Trauma Care' }},
  {{ name: 'Women Safety Helpline', number: '1091', desc: '24x7 Women in distress protection' }},
  {{ name: 'Pune City Police Control', number: '020-26122880', desc: 'Central Control Room & Dispatch' }},
  {{ name: 'Western Ghats Trek Rescue', number: '+91 98220 12345', desc: 'Sahyadri Fort & Mountain Rescue Squad' }}
];

export const DEFAULT_INITIAL_ITINERARY = {{
  id: 'itin-default',
  title: 'Pune Heritage, Forts & Eco-Circuit',
  destination: 'Pune, Maharashtra',
  budget: {{
    totalEstimated: 6800,
    targetBudget: 8000,
    isWithinBudget: true,
    variancePercentage: 15,
    perPersonCost: 3400,
    categories: {{
      stays: 2800,
      transport: 1400,
      food: 1200,
      sightseeing: 400,
      activities: 600,
      guideAndSafety: 400
    }},
    costSavingTips: ['Combined Heritage Pass saves ₹150 on monument entries', 'Off-peak EV Cab rates apply between 11 AM - 3 PM']
  }},
  overview: 'A balanced 3-day journey through Pune and the Sahyadri mountains covering iconic Peshwa landmarks, Sinhagad hilltop fortress, and scenic lakeside retreats.',
  durationDays: 3,
  generatedAt: new Date().toISOString(),
  localSafetyAdvisory: 'Safe and verified route. Keep Tourist Police (1363) on speed dial.',
  smartRoute: {{
    totalDistanceKm: 120,
    estimatedTransitHours: 4.5,
    optimalSequence: ['Shaniwar Wada', 'Lal Mahal', 'Sinhagad Fort', 'Khadakwasla Dam', 'Aga Khan Palace']
  }},
  ecoScore: {{
    totalScore: 92,
    badge: 'Emerald Pioneer' as const,
    ecoStayScore: 24,
    greenTransportScore: 23,
    localBusinessScore: 23,
    routeEfficiencyScore: 22,
    carbonSavedKg: 48.5,
    recommendations: ['Use EV GreenRide Cab for Sinhagad Fort trip', 'Support registered local Maharashtrian food stalls']
  }},
  budgetBreakdown: {{
    totalEstimated: 6800,
    targetBudget: 8000,
    isWithinBudget: true,
    variancePercentage: 15,
    perPersonCost: 3400,
    categories: {{
      stays: 2800,
      transport: 1400,
      food: 1200,
      sightseeing: 400,
      activities: 600,
      guideAndSafety: 400
    }},
    costSavingTips: ['Combined Heritage Pass saves ₹150 on monument entries', 'Off-peak EV Cab rates apply between 11 AM - 3 PM']
  }},
  days: [
    {{
      dayNumber: 1,
      theme: 'Peshwa Heritage & Historic Core',
      dayBudget: 2200,
      dayCarbonSavedKg: 14.5,
      dayWeather: {{ temp: '26°C', condition: 'Pleasant' as const, advisory: 'Clear skies. Great for heritage walking.' }},
      activities: [
        {{
          id: 'act-1-1',
          timeSlot: 'Morning' as const,
          timeRange: '08:30 AM - 11:30 AM',
          title: 'Shaniwar Wada & Lal Mahal Guided Walk',
          description: 'Explore the grand 1732 Peshwa seat and childhood home of Shivaji Maharaj with licensed historian guide.',
          locationName: 'Shaniwar Wada, Pune',
          lat: 18.5196,
          lng: 73.8553,
          estimatedCost: 150,
          category: 'Spot' as const,
          verifiedProvider: 'Sahyadri Licensed Guides',
          weatherSuitability: 'Outdoor-Ideal' as const,
          isEcoFriendly: true,
          ecoTips: 'Pedestrian heritage walk reduces urban traffic emissions.',
          recommendedDuration: '2.5 hours'
        }}
      ]
    }}
  ]
}};

export const INITIAL_BOOKINGS: Booking[] = [
  {{
    id: 'bk-101',
    bookingRef: 'TM-2026-7841',
    touristName: 'Rahul Sharma',
    touristEmail: 'rahul.sharma@example.com',
    touristPhone: '+91 98231 44556',
    destination: 'Pune District, Maharashtra',
    items: [
      {{
        providerId: 'prov-1',
        providerName: 'Shantai Hotel',
        type: 'Hotel',
        details: 'Deluxe Heritage Room (2 Nights, 2 Guests)',
        amount: 5600
      }},
      {{
        providerId: 'prov-3',
        providerName: 'GreenRide Pune Electric Fleet',
        type: 'Taxi',
        details: 'Full Day EV Cab (Shaniwar Wada -> Sinhagad -> Khadakwasla)',
        amount: 1400
      }},
      {{
        providerId: 'prov-4',
        providerName: 'Sahyadri Licensed Guides',
        type: 'Guide',
        details: 'Sinhagad Fort Historian Guide (Full Day)',
        amount: 800
      }}
    ],
    totalAmount: 7800,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    bookingDate: '2026-09-02',
    travelDates: 'Sep 05 - Sep 07, 2026',
    qrPayload: 'TOURMASTER-PASS-TM-2026-7841-VERIFIED',
    status: 'Confirmed'
  }}
];

export const INITIAL_SOS_ALERTS: SOSAlert[] = [
  {{
    id: 'sos-1',
    alertCode: 'SOS-942',
    touristName: 'Priya Deshmukh',
    touristPhone: '+91 98765 43210',
    lat: 18.3663,
    lng: 73.7558,
    locationDescription: 'Sinhagad Fort Wind Point Trek Trail',
    timestamp: '10 mins ago',
    emergencyType: 'Medical',
    status: 'Dispatched',
    dispatchedUnit: 'Rapid PCR Unit 04 & Sahyadri Trek Rescuers',
    notes: 'Ankle sprain reported on downward ridge. Medical response team en-route with stretcher kit.'
  }}
];

export const INITIAL_ORGANISATION_ADVISORIES: OrganisationAdvisory[] = [
  {{
    id: 'adv-1',
    title: 'Heavy Rainfall Alert - Sahyadri Ghats & Waterfalls',
    severity: 'Warning',
    category: 'Weather',
    targetCity: 'Pune & Lonavala',
    message: 'IMD yellow alert for Pune district. Avoid slippery ridge trekking at Rajgad and Torna. Indoor heritage monuments recommended.',
    issuedBy: 'Maharashtra Tourism Safety & Disaster Management Cell',
    timestamp: '1 hour ago',
    active: true
  }},
  {{
    id: 'adv-2',
    title: 'Ganeshotsav City Center Crowd Advisory',
    severity: 'Info',
    category: 'Crowd Management',
    targetCity: 'Pune',
    message: 'Special pedestrian corridors open around Dagdusheth Halwai Ganpati. Electric feeder buses operating 24x7 from Swargate.',
    issuedBy: 'Pune Municipal Corporation & Traffic Police',
    timestamp: '3 hours ago',
    active: true
  }}
];

export const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {{
    id: 'fb-1',
    touristName: 'Ananya Roy',
    rating: 5,
    category: 'Spot',
    targetName: 'Sinhagad Fort',
    comment: 'Spectacular mountain scenery and the local Pithla Bhakri was unforgettable! The QR entry made entering super smooth.',
    date: 'Yesterday'
  }},
  {{
    id: 'fb-2',
    touristName: 'Karthik Menon',
    rating: 5,
    category: 'Guide',
    targetName: 'Sahyadri Licensed Guides',
    comment: 'Our historian guide Mahesh explained the Peshwa architecture at Shaniwar Wada with immense depth.',
    date: '2 days ago'
  }}
];

export const INITIAL_COMPLAINTS: ComplaintItem[] = [
  {{
    id: 'cmp-1',
    complaintRef: 'CMP-2026-104',
    touristName: 'Amit Verma',
    touristPhone: '+91 97110 22334',
    touristEmail: 'amit.verma@example.com',
    category: 'Overcharging',
    subject: 'Excess Parking Fee charged at private base lot',
    description: 'Private vendor near fort base charged ₹100 instead of standard ₹30 government municipal tariff.',
    targetEntity: 'Sinhagad Base Parking Lot B',
    date: 'Yesterday',
    status: 'In Progress',
    resolutionNotes: 'Inspection squad dispatched to verify municipal tariff board.'
  }}
];
"""

ts_path = os.path.join("src", "data", "mockTourismData.ts")
with open(ts_path, "w", encoding="utf-8") as f:
    f.write(ts_content)
print(f"Updated {ts_path} with typed TypeScript master datasets!")

