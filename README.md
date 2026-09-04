# 🌍 TourMaster AI - Unified Smart Tourism Platform
### Smart India Hackathon 2026 | Problem Statement: 26204 | Team NEXUS

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Ethicalvedant/tourmaster)
[![Python 3.11](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

---

## 📖 About TourMaster

**TourMaster AI** is an end-to-end intelligent tourism management and smart guide ecosystem engineered for modern travelers, tourism boards, and emergency response teams.

### ✨ Key Features
- 🧠 **AI Smart Itinerary Planner**: Powered by Google Gemini 2.5 Flash for personalized multi-day trip curation based on budget, style, and real-time conditions.
- 🗺️ **Interactive Geo-Explorer**: Dynamic Leaflet maps with live filtering across heritage spots, verified hotels, dining, guides, and transit.
- 🚨 **Emergency SOS Beacon**: Instant distress alert dispatch system with real-time GPS coordinates, PCR patrol routing, and emergency triage.
- 💬 **Multilingual AI Concierge**: Instant AI assistance for local etiquette, currency advice, spot recommendations, and safety alerts.
- 🛡️ **Verified Provider Directory**: Verified listing of licensed tour guides, certified hotels, and registered transport operators.

---

## 🚀 Instant Deployment on Render

Deploy TourMaster to production on Render with a single click:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Ethicalvedant/tourmaster)

For complete manual setup, Docker containerization, and custom domain configuration, check the **[Render Deployment Guide](DEPLOYMENT.md)**.

---

## 💻 Local Development

### Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.10 or higher
- **Gemini API Key**: Obtain a free key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Ethicalvedant/tourmaster.git
cd tourmaster

# Install Python backend dependencies
pip install -r requirements.txt

# Install Node.js frontend dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` or `.env.local` file in the root directory:

```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
PORT=5000
FLASK_DEBUG=1
```

### 3. Run the Application

#### Option A: Fullstack Dev Server (Recommended for development)
```bash
# Terminal 1: Start Python Backend (Port 5000)
npm run dev:flask

# Terminal 2: Start Vite Frontend with Hot Reload (Port 3000)
npm run dev
```

#### Option B: Production Preview (Single Port)
```bash
# Build frontend bundle
npm run build

# Start production server
npm run start:prod
# Or: python app.py
```
Visit `http://localhost:5000` to view the production app.

---

## 📁 Repository Architecture & Collections

For a detailed breakdown of all components, services, data flow, and layers, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

```
tourmaster/
├── 🎨 FRONTEND COLLECTION   -> /src (React 19, TypeScript, Tailwind 4, Domain Portals)
├── ⚙️ BACKEND COLLECTION    -> app.py & main.py (Flask REST APIs & Gemini Engine)
├── 🔌 API & CONNECTIVES     -> /src/services/api.ts (Type-safe centralized API connector)
├── 📊 DATASETS & SCHEMAS     -> /src/data (tourism_data.json) & /src/types.ts
├── 🚀 DEPLOYMENT & CI/CD    -> render.yaml, build.sh, Dockerfile
└── 📚 DOCUMENTATION         -> README.md, ARCHITECTURE.md, DEPLOYMENT.md
```

---

## 🛡️ Health & API Verification

When deployed, the backend exposes a health check endpoint:

```bash
curl https://<your-app>.onrender.com/api/health
```

---

## 📜 License
Developed for Smart India Hackathon 2026 by Team NEXUS.
