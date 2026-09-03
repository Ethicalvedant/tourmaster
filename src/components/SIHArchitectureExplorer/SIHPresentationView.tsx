import React, { useState } from 'react';
import { Presentation, ShieldCheck, Sparkles, Layers, Cpu, CheckCircle2, TrendingUp, Leaf, Database, Bot, CloudSun, MapPin, Radio, ArrowRight, ExternalLink } from 'lucide-react';

export const SIHPresentationView: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(1);

  const slides = [
    {
      id: 1,
      title: 'Problem Statement & Team NEXUS',
      subtitle: 'Smart India Hackathon 2026 • PS ID 26204',
      render: () => (
        <div className="space-y-6 text-center py-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SMART INDIA HACKATHON 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            TOUR<span className="text-emerald-400">MASTER</span>
          </h1>

          <div className="max-w-2xl mx-auto bg-slate-950 p-6 rounded-2xl border border-slate-800 text-left space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-semibold text-emerald-400">Problem Statement ID:</span>
              <span className="font-mono font-bold text-white">26204</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Problem Statement Title:</span>
              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                Student Innovation - A solution/idea that can boost the current situation of the tourism industries including hotels, travel and others.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Theme</span>
                <span className="font-bold text-white">Travel & Tourism</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Category & Team</span>
                <span className="font-bold text-emerald-400">Software • Team NEXUS</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Proposed Solution & Core Pillars',
      subtitle: 'Unified AI Ecosystem for Responsible Indian Tourism',
      render: () => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: '1. Unified Platform',
                desc: 'Consolidates spots, stays, restaurants, EV taxis, and guides in one single verified application.',
                tag: 'All-in-One Hub',
              },
              {
                title: '2. Gemini AI Personalization',
                desc: 'Captures budget, duration, group size, and interests to generate customized, day-wise itineraries.',
                tag: 'Gemini 3.7 Flash',
              },
              {
                title: '3. Adaptive Weather Plans',
                desc: 'Dynamically reschedules outdoor trekking to indoor cultural museums upon live rain or heat warnings.',
                tag: 'OpenWeather Sync',
              },
              {
                title: '4. Smart Budget Optimizer',
                desc: 'Prevents tourist overspending while maximizing revenue flow to indigenous homestays and artisans.',
                tag: 'Cost Intelligence',
              },
              {
                title: '5. Sustainability & Eco-Score',
                desc: 'Calculates an objective 0-100 rating (Eco Stay + EV Transit + Local Vendors + Route Efficiency).',
                tag: 'Green Algorithm',
              },
              {
                title: '6. Safety & SOS Helpline',
                desc: '1-click emergency SOS broadcast with GPS coordinates, dial 112 / 1363, and live PCR dispatch.',
                tag: '24/7 Protection',
              },
            ].map((col, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  {col.tag}
                </span>
                <h4 className="font-bold text-white text-sm">{col.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{col.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Technical Approach & System Architecture',
      subtitle: 'End-to-End Data Pipeline from User Query to Execution',
      render: () => (
        <div className="space-y-4">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              NEXUS Full-Stack Architecture Matrix:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">Frontend Layer</span>
                <span className="text-white font-medium block">React 19 + TypeScript</span>
                <span className="text-slate-400 text-[10px]">Tailwind CSS • Motion • Responsive</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">Backend & API</span>
                <span className="text-white font-medium block">Express / Node.js Engine</span>
                <span className="text-slate-400 text-[10px]">REST API • Session State • Routing</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold block mb-1">Intelligence & LLM</span>
                <span className="text-white font-medium block">Gemini 3.7 Flash</span>
                <span className="text-slate-400 text-[10px]">@google/genai • Structured JSON</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">Maps, Weather & Pay</span>
                <span className="text-white font-medium block">Google Maps & Razorpay</span>
                <span className="text-slate-400 text-[10px]">OpenWeather API • QR Passes</span>
              </div>
            </div>

            {/* Visual Workflow Flowchart */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div className="font-semibold text-white mb-2">Dataflow Execution Cycle:</div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-slate-800 px-2.5 py-1 rounded-md text-emerald-400 font-bold">1. Tourist Preferences</span>
                <span>→</span>
                <span className="bg-slate-800 px-2.5 py-1 rounded-md text-cyan-400 font-bold">2. Master Data & Weather</span>
                <span>→</span>
                <span className="bg-slate-800 px-2.5 py-1 rounded-md text-purple-400 font-bold">3. Budget & Route Optimizer</span>
                <span>→</span>
                <span className="bg-slate-800 px-2.5 py-1 rounded-md text-amber-400 font-bold">4. Gemini AI Day Plans</span>
                <span>→</span>
                <span className="bg-slate-800 px-2.5 py-1 rounded-md text-teal-400 font-bold">5. Unified Pass & SOS</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Feasibility & Viability Matrix',
      subtitle: 'How TourMaster Solves Practical Tourism Industry Bottlenecks',
      render: () => (
        <div className="space-y-3 overflow-x-auto">
          <table className="w-full text-left text-xs bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Challenge in Tourism</th>
                <th className="p-3">Industry Bottleneck</th>
                <th className="p-3 text-emerald-400">TourMaster AI Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-white">Fragmented Experience</td>
                <td className="p-3 text-slate-400">Multiple separate apps for stays, cabs, tickets</td>
                <td className="p-3 text-emerald-400">Unified all-in-one portal with bundled e-tickets</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Overpriced & Blind Trips</td>
                <td className="p-3 text-slate-400">Difficult to estimate and manage total trip budget</td>
                <td className="p-3 text-emerald-400">Smart Budget Optimizer with cost savings tips</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Sudden Weather Chaos</td>
                <td className="p-3 text-slate-400">Rain/heat ruins scheduled outdoor treks</td>
                <td className="p-3 text-emerald-400">Dynamic weather engine auto-swaps indoor cultural spots</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Traveler Safety</td>
                <td className="p-3 text-slate-400">Slow emergency reporting in unfamiliar cities</td>
                <td className="p-3 text-emerald-400">1-click SOS broadcast with GPS coordinates to Police PCR</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Vendor Exploitation</td>
                <td className="p-3 text-slate-400">Middlemen take large cuts from local artisans</td>
                <td className="p-3 text-emerald-400">Direct provider portal routing revenue to local vendors</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Sustainability Score & Social Impact',
      subtitle: 'The Mathematical Equation for Responsible Travel',
      render: () => (
        <div className="space-y-4">
          <div className="bg-slate-950 p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Sustainability Score Formula:
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono font-bold text-sm text-white">
              FINAL ECO SCORE = ECO STAY (25) + EV / PUBLIC TRANSIT (25) + LOCAL BUSINESSES (25) + ROUTE EFFICIENCY (25)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every travel itinerary receives an audited green score encouraging tourists to choose solar homestays, electric cabs, and registered cultural artisans.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-emerald-400 block mb-1">For Tourists</span>
              <p className="text-xs text-slate-400">Saves planning time, optimizes budget, provides weather assurance, and ensures 24/7 SOS safety.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-teal-400 block mb-1">For Local Businesses</span>
              <p className="text-xs text-slate-400">Direct visibility and booking management for small hotels, EV drivers, and folk craft workshops.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-cyan-400 block mb-1">For Authorities</span>
              <p className="text-xs text-slate-400">Centralized control room to monitor tourist dispersion, prevent overcrowding, and manage emergency response.</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[activeSlide - 1];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Slide Navigation Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Interactive Deck Viewer
              </span>
              <span className="text-xs text-slate-400">Slide {activeSlide} of {slides.length}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
              {current.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{current.subtitle}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={activeSlide === 1}
              onClick={() => setActiveSlide((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-300"
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {slides.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlide(s.id)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    activeSlide === s.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {s.id}
                </button>
              ))}
            </div>
            <button
              disabled={activeSlide === slides.length}
              onClick={() => setActiveSlide((prev) => Math.min(slides.length, prev + 1))}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-xs font-bold text-slate-950"
            >
              Next
            </button>
          </div>
        </div>

        {/* Slide Content Box */}
        <div className="mt-6">{current.render()}</div>
      </div>
    </div>
  );
};
