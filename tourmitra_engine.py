import os
import json
import re
import requests
from typing import Optional, List, Dict, Any

# Primary and fallback Gemini models supported by Google Generative AI API
GEMINI_MODELS = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
]

def get_gemini_api_key() -> Optional[str]:
    """Retrieve validated Gemini API Key from environment."""
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key or key == "MY_GEMINI_API_KEY":
        return None
    return key

def build_tourmitra_system_prompt(destination: str = "Pune, Maharashtra") -> str:
    """
    Construct the Master System Instruction for TourMitra AI Assistant.
    Instructs the LLM for general conversational language, multilingual dialogue,
    deep tourism expertise, booking integration, and safety.
    """
    return f"""You are **TourMitra (तूर मित्र)**, the official intelligent, culturally rich, and super-friendly AI Tour Guide & Travel Companion for TourMaster (Smart India Hackathon 2026, Problem Statement 26204) in {destination}.

PERSONA & TONE:
1. Warm, enthusiastic, and welcoming (Atithi Devo Bhava / अतिथी देवो भव). Act as a hip, knowledgeable local friend (Mitra) and cultural insider.
2. GENERAL LANGUAGE & CASUAL CONVERSATION:
   - Understand and talk in natural **general language**, informal greetings, casual chitchat (e.g. "hey", "wassup", "kaisa hai bhai", "kya chal raha hai", "suggest something fun", "bhai bhookh lagi hai", "bol mitra", "feeling tired").
   - Respond warmly with great energy and local flavor! Avoid stiff, bureaucratic language.
3. MULTILINGUAL & HINGLISH:
   - Fluently converse in English, Hinglish (Hindi in Latin script), Hindi (हिंदी), Marathi (मराठी), Gujarati, Tamil, Telugu, Bengali, French, German, Spanish, etc.
   - Always match the user's language, dialect, and informal/formal tone. If user asks in Hinglish, reply in lively natural Hinglish! If in Marathi, reply in fluent Marathi!

CORE CAPABILITIES & KNOWLEDGE:
1. Historical Lore & Forts: Shaniwar Wada (Peshwa Baji Rao I), Sinhagad Fort (Tanaji Malusare's 1670 battle, 'Gad aala pan Sinha gela'), Aga Khan Palace (Mahatma Gandhi memorial), ancient caves & temples (Dagdusheth Halwai Ganpati, Pataleshwar).
2. Authentic Food & Street Delicacies: Puneri Misal Pav (Katakirrr/Bedekar), Sinhagad Pithla Bhakri with Thecha & Matka Dahi, Sujata Mastani, Chitale Bakarwadi, Cafe GoodLuck Bun Maska & Irani Chai, Shabree Maharashtrian Thali. Pure Veg, Jain, and Halal options.
3. Travel Wisdom & Bargaining: Best timings to beat crowds, dress codes at temples, polite bargaining phrases in Marathi (e.g. "Bhaiya, thoda kami kara na?", "Kiti zhaale?").
4. Eco-Friendly & Sustainable: TourMaster EV Cabs, public transit/metro, walking heritage trails, supporting local registered artisans.
5. Tour Booking Integration: Guide tourists to book Spots, Stays/Hotels, Food, EV Taxis, and certified Guides through TourMaster's unified pass.
6. 24/7 Safety & SOS: National Emergency (112), Tourist Police Helpline (1363 - 24/7 Multilingual), Ambulance (108), Women Helpline (1091), and advising the user to click the top red SOS button for live GPS patrol dispatch.

FORMATTING:
- Use clean Markdown with bold highlights and emojis (🏛️, 🍲, ⛰️, 🎟️, 🚗, 🛡️, ✨). Keep answers snappy, informative (2-4 concise paragraphs or bulleted points).
"""

def detect_booking_intent(query: str) -> tuple[bool, str]:
    """Detect if query expresses intent to book and determine category."""
    q = query.lower()
    
    booking_pattern = r'\b(book|booking|reserve|reservation|package|tour pass|ticket|tickets|hotel|stay|resort|lodge|room|cab|taxi|driver|ride|guide|escort|tourist pass)\b'
    is_booking = bool(re.search(booking_pattern, q))
    
    if re.search(r'\b(hotel|stay|resort|lodge|room|accommodation|check-in)\b', q):
        category = "hotels"
    elif re.search(r'\b(food|eat|restaurant|cafe|dinner|lunch|breakfast|thali|dining)\b', q):
        category = "restaurants"
    elif re.search(r'\b(cab|taxi|driver|car|ev ride|transport|pickup|drop)\b', q):
        category = "taxis"
    elif re.search(r'\b(guide|escort|historian|interpreter|guided tour)\b', q):
        category = "guides"
    elif re.search(r'\b(activity|trek|trekking|adventure|boating|paragliding)\b', q):
        category = "activities"
    elif re.search(r'\b(package|all in one|summary|pass|full tour)\b', q):
        category = "summary"
    else:
        category = "spots"
        
    return is_booking, category

def generate_contextual_suggestions(query: str, reply_text: str, destination: str = "Pune") -> List[str]:
    """Generate smart dynamic follow-up chips based on context."""
    q = query.lower()
    
    # Safety first
    if re.search(r'\b(sos|emergency|help|police|safe|danger|hospital|ambulance|lost)\b', q):
        return [
            "🚨 Trigger 1-Click TourMaster Emergency SOS",
            "Nearest police station & tourist helpdesk",
            "Important tourist helpline numbers (1363 / 112)",
            "Safe travel guidelines for solo travelers"
        ]
    elif re.search(r'\b(food|eat|hungry|misal|bhakri|dish|delicacy|chai|sweets|thali)\b', q):
        return [
            "🎟️ Book Food & Heritage Dining Pass",
            "Where can I try the spiciest Puneri Misal?",
            "Tell me about Cafe GoodLuck's Bun Maska Chai",
            "What are pure vegetarian traditional thali spots?"
        ]
    elif re.search(r'\b(fort|sinhagad|shaniwar|history|monument|palace|temple|wada)\b', q):
        return [
            "🎟️ Book Fort Trek & Heritage Guide Pass",
            "Tell me the legend of Tanaji Malusare at Sinhagad",
            "What is the best time to visit Shaniwar Wada?",
            "How do I reach Aga Khan Palace by Metro?"
        ]
    elif re.search(r'\b(book|stay|hotel|taxi|cab|pass|reserve|ticket)\b', q):
        return [
            "🎟️ Open Spots, Stays, Food, Taxis & Guides Studio",
            "Show me top eco-certified hotels",
            "Book an EV cab for full-day city tour",
            "How does the unified QR Tourist Pass work?"
        ]
    elif re.search(r'\b(translate|translation|language|marathi|hindi|phrase|phrases|words|how to say)\b', q):
        return [
            "How to ask 'Can you reduce the price?' in Marathi",
            "Useful phrases for ordering food in Maharashtra",
            "How to politely ask directions in Hindi/Marathi",
            "🎟️ Book an English/Hindi speaking certified guide"
        ]
    elif re.search(r'\b(hi|hello|hey|wassup|kaisa|bol|kya haal|mood|chill)\b', q):
        return [
            "🎟️ I want to book a complete tour pass",
            "What are the top 5 must-visit spots in Pune?",
            "Suggest an authentic local street food trail",
            "Give me essential Marathi phrases for tourists"
        ]
    else:
        return [
            "🎟️ Book Spots, Stays, Food, Taxis & Guides",
            "Tell me the history of Shaniwar Wada",
            "What authentic street foods should I try?",
            "Give me eco-friendly travel recommendations"
        ]

def format_multi_turn_contents(query: str, history: Optional[List[Dict[str, str]]] = None) -> List[Dict[str, Any]]:
    """
    Format chat history and current query into Gemini REST API contents format.
    Ensures alternating user and model roles for high-coherence multi-turn reasoning.
    """
    contents = []
    
    if history and isinstance(history, list):
        recent_history = history[-8:]
        for item in recent_history:
            sender = item.get("sender", "").lower()
            text = item.get("text", "").strip()
            if not text:
                continue
            
            role = "user" if sender == "user" else "model"
            
            if contents and contents[-1]["role"] == role:
                contents[-1]["parts"][0]["text"] += f"\n{text}"
            else:
                contents.append({
                    "role": role,
                    "parts": [{"text": text}]
                })
    
    if contents and contents[-1]["role"] == "user":
        contents[-1]["parts"][0]["text"] += f"\n{query}"
    else:
        contents.append({
            "role": "user",
            "parts": [{"text": query}]
        })
        
    return contents

def call_gemini_tourmitra(
    query: str,
    destination: str = "Pune, Maharashtra",
    history: Optional[List[Dict[str, str]]] = None
) -> Optional[str]:
    """
    Execute Gemini LLM call with Master TourMitra instructions,
    multi-turn chat history, and automatic fallback across model versions.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        return None
    
    system_prompt = build_tourmitra_system_prompt(destination)
    contents = format_multi_turn_contents(query, history)
    
    payload = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.75,
            "topP": 0.95,
            "maxOutputTokens": 800
        }
    }
    
    for model in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            res = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=20)
            if res.status_code == 200:
                result = res.json()
                text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if text and text.strip():
                    return text.strip()
            else:
                print(f"[TourMitra Gemini Engine] Model {model} returned HTTP {res.status_code}")
        except Exception as e:
            print(f"[TourMitra Gemini Engine] Error calling {model}:", e)
            continue
            
    return None

# ---------------------------------------------------------------------------
# Porcupine & Vapi Voice Engine Helpers
# ---------------------------------------------------------------------------

WAKE_WORD_PATTERNS = [
    r'\bhey\s+tourmitra\b',
    r'\btourmitra\b',
    r'\btour\s+mitra\b',
    r'\bnamaste\s+tourmitra\b',
    r'\bnamaste\s+mitra\b',
    r'\bhey\s+mitra\b',
    r'\bwake\s+up\s+tourmitra\b',
    r'\bwake\s+up\b',
    r'\bare\s+you\s+listening\b',
    r'\bsuno\s+tourmitra\b',
    r'\bhey\s+tourmaster\b',
    r'\btourmaster\b',
]

def detect_wake_query(query: str) -> tuple[bool, bool, str, str]:
    """
    Porcupine-style Wake Word detector and Query Splitter.
    Returns:
      (is_wake, is_standalone_wake, matched_phrase, remaining_query)
    """
    q_stripped = query.strip()
    q_lower = q_stripped.lower()
    
    matched_phrase = ""
    for pattern in WAKE_WORD_PATTERNS:
        match = re.search(pattern, q_lower)
        if match:
            matched_phrase = match.group(0)
            break
            
    if not matched_phrase:
        return False, False, "", q_stripped
        
    # Remove the wake word from query to see if there is an attached command/query
    cleaned_after_wake = re.sub(re.escape(matched_phrase), "", q_lower, count=1, flags=re.IGNORECASE)
    # Strip common filler prepositions like "please", "can you", "tell me", commas, question marks
    cleaned_after_wake = re.sub(r'^[\s,:\.!?\-]+', '', cleaned_after_wake).strip()
    
    # Standalone wake if string is empty or just generic punctuation/greetings
    is_standalone = len(cleaned_after_wake) == 0 or cleaned_after_wake in [
        "hi", "hello", "hey", "namaste", "wassup", "sup", "bhai", "bol", "kaisa hai", "are you there"
    ]
    
    # Extract the original casing corresponding to remaining query
    if is_standalone:
        remaining_query = ""
    else:
        # Regex to strip the wake phrase from the original case query
        remaining_query = re.sub(re.escape(matched_phrase), "", q_stripped, count=1, flags=re.IGNORECASE).strip()
        remaining_query = re.sub(r'^[\s,:\.!?\-]+', '', remaining_query).strip()
        
    return True, is_standalone, matched_phrase, remaining_query

def generate_clean_voice_text(markdown_text: str, max_sentences: int = 4) -> str:
    """
    Generate natural, pronunciation-friendly plain speech text from Markdown.
    Strips markdown formatting, hashtags, asterisks, tables, URLs, and all emojis,
    creating crisp, fluid spoken audio for Vapi / Web Speech Synthesis engines.
    """
    if not markdown_text:
        return "Namaste! I am TourMitra, your travel companion. How can I help you today?"
        
    text = markdown_text
    
    # Strip markdown headers, bold, italics, code blocks
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`[^`]*`', '', text)
    text = re.sub(r'[\*\_~#>]', ' ', text)
    
    # Strip bullet points and list markers
    text = re.sub(r'^\s*[\-\+•\d+\.]\s+', ' ', text, flags=re.MULTILINE)
    
    # Strip URLs and link formats [text](url) -> text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'https?://\S+', '', text)
    
    # Strip all unicode emojis / symbols
    emoji_pattern = re.compile(
        "["
        "\U00010000-\U0010ffff"
        "\U00002600-\U000027bf"
        "\U00002300-\U000023ff"
        "\U00002b50-\U00002b55"
        "\U0000200d"
        "\U0000fe0f"
        "]+",
        flags=re.UNICODE
    )
    text = emoji_pattern.sub(' ', text)
    
    # Replace multiple spaces / newlines with single spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Take first few meaningful sentences to keep voice response punchy and fast (Vapi style)
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    if len(sentences) > max_sentences:
        spoken_slice = " ".join(sentences[:max_sentences])
    else:
        spoken_slice = " ".join(sentences) if sentences else text
        
    if len(spoken_slice) > 400:
        spoken_slice = spoken_slice[:397].rsplit(' ', 1)[0] + "..."
        
    return spoken_slice


def get_dedicated_wake_response(destination: str = "Pune, Maharashtra", user_query: str = "") -> tuple[str, str]:
    """
    Generate dedicated instant wake response when user invokes wake word.
    Returns (markdown_ui_text, clean_voice_text).
    """
    q_lower = user_query.lower()
    
    if "marathi" in q_lower or "kasa" in q_lower or "kase" in q_lower:
        md = (
            f"**नमस्कार! मी तूर मित्र (TourMitra)**, तुमचा AI प्रवास मित्र! 🎙️✨\n\n"
            f"मी पूर्णपणे जागा आणि तयार आहे. {destination} मध्ये किल्ले, खाद्यसंस्कृती किंवा प्रवासाबद्दल काय जाणून घ्यायचे आहे? विचारा, मी ऐकतोय!"
        )
        voice = f"Namaskar! Mi TourMitra, tumcha AI pravas mitra. Mi purna-pane zaga aani tayar aahe. {destination} baddal kay vicharayche aahe? Saanga, mi aiktoy!"
    elif "kaisa" in q_lower or "bhai" in q_lower or "bol" in q_lower or "kya haal" in q_lower:
        md = (
            f"**Namaste dost! TourMitra (तूर मित्र) is live & listening!** 🎙️✨\n\n"
            f"Main ekdum first class hoon! {destination} mein ghumne, khane, cab book karne ya lore janne ke liye batao, aaj kahan se shuru karein?"
        )
        voice = f"Namaste dost! TourMitra is live and listening! Main ekdum first class hoon. {destination} mein ghumne, hotel ya khane ke liye bataiye, aaj kahan se shuru karein?"
    else:
        md = (
            f"**Namaste! I am TourMitra (तूर मित्र)**, your 24/7 AI Voice & Cultural Companion in **{destination}**! 🎙️✨\n\n"
            f"🟢 **Wake Word Detected**: I am active, listening, and ready to guide your journey.\n\n"
            f"You can speak naturally or ask me about:\n"
            f"• 🏰 **Historical Forts & Monuments** (Sinhagad, Shaniwar Wada)\n"
            f"• 🍲 **Authentic Street Food** (Misal Pav, Pithla Bhakri)\n"
            f"• 🎟️ **Instant Tour Booking** (Spots, Stays, Taxis & Guides)\n"
            f"• 🚨 **24/7 Safety & Emergency SOS**\n\n"
            f"*I'm listening! Speak your question now or tap any suggestion below.*"
        )
        voice = f"Namaste! I am TourMitra, your AI travel companion in {destination}. I am awake and listening! How can I guide your journey today?"
        
    return md, voice

def offline_fallback_response(query: str, destination: str = "Pune, Maharashtra") -> str:
    """
    Rich offline knowledge base and conversational fallback engine for TourMitra.
    Guarantees seamless user experience even if external internet/API drops.
    """
    q_lower = query.lower()
    
    # 1. Emergency & SOS First
    if re.search(r'\b(sos|emergency|police|safe|danger|hospital|ambulance|help|lost|trouble|threat)\b', q_lower):
        return (
            "🚨 **EMERGENCY ASSISTANCE & TOURIST SAFETY PROTOCOL**:\n\n"
            "If you or someone nearby is in distress, please use these immediate 24/7 helplines:\n"
            "• 🚔 **National Emergency Helpline**: **112**\n"
            "• 🛡️ **Tourist Police Helpline**: **1363** (24/7 Multilingual Support)\n"
            "• 🚑 **Medical Ambulance**: **108**\n"
            "• 👩 **Women's Safety Helpline**: **1091**\n\n"
            "💡 **Instant In-App SOS**: Tap the **Red SOS button** in the top navigation bar to transmit your live GPS coordinates to the nearest Tourist Protection Patrol Unit!"
        )
    
    # 2. Local Language & Phrases
    elif re.search(r'\b(marathi|language|translate|translation|phrase|phrases|how to say|hindi|speak)\b', q_lower):
        return (
            "🗣️ **Essential Marathi & Hindi Phrases for Travelers in Maharashtra**:\n\n"
            "• **Greetings / Politeness**:\n"
            "  - *Namaskar! (नमस्कार)* = Hello / Greetings\n"
            "  - *Dhanyawaad (धन्यवाद)* = Thank you\n"
            "  - *Kase aahat? (कसे आहात?)* = How are you?\n\n"
            "• **Shopping & Bargaining**:\n"
            "  - *Kiti zhaale? (किती झाले?)* = How much does this cost?\n"
            "  - *Thoda kami kara na? (थोडा कमी करा ना?)* = Can you reduce the price a bit?\n"
            "  - *Bill dya na (बिल द्या ना)* = Please provide the bill.\n\n"
            "• **Directions & Commute**:\n"
            "  - *Kuthe jaaycha? (कुठे जायचं?)* = Where to go?\n"
            "  - *Hee bus/cab Shaniwar Wada la jaate ka?* = Does this cab/bus go to Shaniwar Wada?\n"
            "  - *Ithe thamba (इथे थांबा)* = Please stop here."
        )
    
    # 3. Food & Delicacies
    elif re.search(r'\b(food|misal|bhakri|eat|hungry|restaurant|mastani|dish|sweet|thali|chai|cafe|pithla|bakarwadi)\b', q_lower):
        return (
            "🍽️ **Authentic Local Food & Culinary Secrets of Pune**:\n\n"
            "1. 🌶️ **Puneri Misal Pav**: Spicy sprouted curry topped with farsan, onions & lemon. *Top spots: Katakirrr, Bedekar Tea Stall, Vaidya Upahar.*\n"
            "2. 🫓 **Pithla Bhakri with Thecha**: Rustic gram flour curry with jowar/bajra bhakri and spicy green chilli thecha at Sinhagad Fort.\n"
            "3. 🍧 **Sujata Mastani**: Iconic thick milkshake topped with ice cream, dry fruits & kesar mango.\n"
            "4. ☕ **Cafe GoodLuck Bun Maska & Irani Chai**: Legendary 1935 cafe on FC Road for warm buttery bun maska & spiced tea.\n"
            "5. 🥟 **Chitale Bandhu Bakarwadi**: World-famous crunchy spiced spiral rolls from Bajirao Road.\n"
            "6. 🍱 **Authentic Maharashtrian Thali**: Visit *Shabree* on FC Road or *Durvankur* for pure traditional feast!"
        )
    
    # 4. Forts & Historical Lore
    elif re.search(r'\b(shaniwar|wada|bajirao|peshwa)\b', q_lower):
        return (
            "🏛️ **Shaniwar Wada (शनिवार वाडा)**: The Grand Seat of the Maratha Empire!\n\n"
            "• **History**: Built in 1732 by Peshwa Baji Rao I, this 7-story palace fortress served as the political seat of the Maratha Empire until 1818.\n"
            "• **Key Highlights**: Delhi Darwaza with anti-elephant iron spikes, Mastani Mahal fountain ruins, Hazari Karanje, and lush gardens.\n"
            "• **Tip**: Visit early morning (08:30 AM) for crowd-free photography, and stay for the evening Light & Sound Show!\n"
            "• **Metro & Transport**: Appa Balwant Chowk Metro station & PMC E-Bus stand right outside."
        )
    elif re.search(r'\b(sinhagad|tanaji|fort|forts|trek|trekking)\b', q_lower):
        return (
            "⛰️ **Sinhagad Fort (सिंहगड - The Lion's Fort)**: Sahyadri's Legendary Fortress!\n\n"
            "• **Historical Legend**: Perched 1,312 meters atop Sahyadri hills (30 km from Pune), famous for the 1670 heroic battle by Subedar Tanaji Malusare. Chhatrapati Shivaji Maharaj famously said: *'Gad aala, pan Sinha gela'*.\n"
            "• **Culinary Delights**: Hot clay-pot *Pithla Bhakri* with fiery *Thecha*, crispy *Kanda Bhajji*, and fresh *Matka Dahi* served atop the cliff.\n"
            "• **Points to See**: Tanaji Memorial, Kalyan Darwaza, Wind Point, and Tanaji Kada.\n"
            "• **Transit**: Take a TourMaster verified GreenRide EV Cab directly to the fort base!"
        )
    elif re.search(r'\b(aga khan|gandhi|kasturba)\b', q_lower):
        return (
            "🏛️ **Aga Khan Palace (आगा खान पॅलेस)**: Monument of Serenity & National Freedom\n\n"
            "• **History**: Built in 1892 by Sultan Muhammed Shah Aga Khan III. During the 1942 Quit India Movement, Mahatma Gandhi, Kasturba Gandhi, and Mahadev Desai were interned here.\n"
            "• **Highlights**: Italian arches, tranquil lawns, Gandhi Smriti museum, and the Samadhis of Kasturba Gandhi and Mahadev Desai.\n"
            "• **Timings**: 09:00 AM – 05:30 PM. Entry: ₹25."
        )
    elif re.search(r'\b(dagdusheth|temple|temples|ganpati|ganesh|darshan)\b', q_lower):
        return (
            "🛕 **Shrimant Dagdusheth Halwai Ganpati Temple**: Sacred Divine Icon of Pune\n\n"
            "• **History**: Established in 1893 by Halwai Shrimant Dagdusheth and his wife Lakshmibai.\n"
            "• **Darshan Timings**: 06:00 AM – 10:30 PM (Morning Kakad Aarti at 07:30 AM).\n"
            "• **Nearby**: Explore Tulshibaug traditional market for brass artifacts and fresh modaks."
        )
    
    # 5. Booking & Tours
    elif re.search(r'\b(book|booking|reserve|hotel|hotels|taxi|taxis|cab|cabs|pass|ticket|package|stay|stays)\b', q_lower):
        return (
            f"🎟️ **Book Your All-In-One Tourism Experience in {destination}**:\n\n"
            f"With TourMaster's unified platform, you can customize and book:\n"
            f"• 🏛️ **24 Verified Tourism Spots** (Heritage monuments, forts, museums with instant QR)\n"
            f"• 🏨 **Verified Stays & Eco-Resorts** (Solar homestays & boutique heritage hotels)\n"
            f"• 🍲 **Heritage Dining & Food Passes** (Curated local thali & cafe dining vouchers)\n"
            f"• 🚗 **GreenRide EV Cabs & Taxis** (Zero-emission verified drivers with fixed fair rates)\n"
            f"• 👨‍🏫 **Certified Local Cultural Tour Guides** (Accredited multilingual historians)\n\n"
            f"👇 Click the **Open Booking Studio** button below to customize your instant travel pass!"
        )
    
    # 6. Casual greetings & general language chat
    elif re.search(r'\b(hi|hello|hey|wassup|sup|kaisa|kya haal|namaste|namaskar|bol|bhai|bro|mitra|dost|chill)\b', q_lower):
        return (
            f"**Namaste! (नमस्कार!)** I am **TourMitra (तूर मित्र)**, your 24/7 AI guide, friend, and travel buddy in {destination}! ✨\n\n"
            f"Main ekdum first class hoon! Aap bataiye—aaj kya explore karne ka plan hai?\n\n"
            f"• 🏰 **Historical Legends & Forts** (Shaniwar Wada, Sinhagad Fort, Aga Khan Palace)\n"
            f"• 🍲 **Authentic Foodie Trails** (Puneri Misal Pav, Pithla Bhakri, Sujata Mastani)\n"
            f"• 🗣️ **Local Translations & Slang** (Marathi phrases & travel tips)\n"
            f"• 🎟️ **1-Click Tour Booking** (Spots, Stays, Food, Taxis, Guides)\n\n"
            f"Bolo dost, kahan se shuru karein?"
        )
    
    # General destination overview
    else:
        return (
            f"Namaste! I am **TourMitra (तूर मित्र)**, your dedicated AI cultural guide and travel companion for **{destination}**! ✨\n\n"
            f"I can help you with:\n"
            f"• 🏛️ **24 Verified Tourist Spots & Forts** with history and secret tips\n"
            f"• 🍲 **Authentic Street Food & Traditional Thali** recommendations\n"
            f"• 🗣️ **Local Language Translations** (Marathi, Hindi, Hinglish)\n"
            f"• 🚗 **Zero-Emission EV Cabs & Metro Routes**\n"
            f"• 🎟️ **Instant 1-Click Tour Booking Pass**\n\n"
            f"What would you like to explore first?"
        )

def process_tourmitra_chat(
    query: str,
    destination: str = "Pune, Maharashtra",
    history: Optional[List[Dict[str, str]]] = None,
    is_voice_mode: bool = False
) -> Dict[str, Any]:
    """
    Main unified handler for TourMitra AI Chat and Vapi/Porcupine Voice Engine.
    Processes wake words, executes Gemini LLM with multi-turn context, detects booking intents,
    and returns both rich Markdown UI text and clean TTS-friendly voice text.
    """
    cleaned_query = query.strip()
    
    # 1. Porcupine Wake Word Detection
    is_wake, is_standalone_wake, wake_phrase, trailing_query = detect_wake_query(cleaned_query)
    
    # If standalone wake word invocation ("Hey TourMitra", "Wake up TourMitra")
    if is_wake and is_standalone_wake:
        md_text, voice_text = get_dedicated_wake_response(destination, cleaned_query)
        suggestions = [
            "🎟️ Book Tourism Tour (Spots, Stays, Taxis)",
            "What are the top 5 must-visit spots in Pune?",
            "Suggest an authentic local street food trail",
            "Give me essential Marathi phrases for tourists"
        ]
        return {
            "text": md_text,
            "voiceText": voice_text,
            "isWakeQuery": True,
            "wakeAcknowledged": True,
            "wakePhrase": wake_phrase or "Hey TourMitra",
            "isBookingIntent": False,
            "bookingCategory": "spots",
            "suggestions": suggestions,
            "modelUsed": "TourMitra Porcupine Wake Engine"
        }
        
    # If wake word with query (e.g. "Hey TourMitra tell me about Sinhagad Fort")
    effective_query = trailing_query if (is_wake and trailing_query) else cleaned_query
    
    is_booking, booking_cat = detect_booking_intent(effective_query)
    
    ai_text = call_gemini_tourmitra(effective_query, destination, history)
    
    if not ai_text:
        ai_text = offline_fallback_response(effective_query, destination)
        
    # If wake word was prefixed to a question, make sure response starts warmly
    if is_wake and not ai_text.lower().startswith("namaste"):
        ai_text = f"**Namaste! TourMitra is on it:** 🎙️✨\n\n{ai_text}"
        
    suggestions = generate_contextual_suggestions(effective_query, ai_text, destination)
    voice_text = generate_clean_voice_text(ai_text)
    
    return {
        "text": ai_text,
        "voiceText": voice_text,
        "isWakeQuery": is_wake,
        "wakeAcknowledged": is_wake,
        "wakePhrase": wake_phrase if is_wake else "",
        "isBookingIntent": is_booking,
        "bookingCategory": booking_cat,
        "suggestions": suggestions,
        "modelUsed": "Gemini 3.7 Flash Engine"
    }
