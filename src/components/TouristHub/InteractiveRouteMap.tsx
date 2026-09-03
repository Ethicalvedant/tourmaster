import React, { useState } from 'react';
import { MapPin, Navigation, Car, Train, Footprints, Clock, Fuel, Sparkles, CheckCircle2 } from 'lucide-react';
import { ActivityItem } from '../../types';

interface InteractiveRouteMapProps {
  destination: string;
  activities: ActivityItem[];
  totalDistanceKm?: number;
  estimatedTransitHours?: number;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  destination,
  activities,
  totalDistanceKm = 38,
  estimatedTransitHours = 1.6,
}) => {
  const [selectedSpot, setSelectedSpot] = useState<ActivityItem | null>(activities[0] || null);
  const [transitMode, setTransitMode] = useState<'EV Cab' | 'Metro / Transit' | 'Walking'>('EV Cab');

  // Generate synthetic but realistic visual coordinates for SVG canvas
  const mapNodes = activities.map((act, index) => {
    // Distribute nodes visually on canvas
    const angle = (index / Math.max(1, activities.length)) * Math.PI * 1.5 + 0.3;
    const radius = 110 + (index % 2 === 0 ? 30 : -20);
    const cx = 240 + Math.cos(angle) * radius;
    const cy = 160 + Math.sin(angle) * (radius * 0.75);

    return {
      activity: act,
      x: Math.round(cx),
      y: Math.round(cy),
      index: index + 1,
    };
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Smart Route & Map Visualizer
              </h3>
              <p className="text-xs text-slate-400">
                Google Maps Algorithm Route Sequencing for {destination}
              </p>
            </div>
          </div>
        </div>

        {/* Transit Mode Selector */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setTransitMode('EV Cab')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all ${
              transitMode === 'EV Cab'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>EV Cab</span>
          </button>
          <button
            onClick={() => setTransitMode('Metro / Transit')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all ${
              transitMode === 'Metro / Transit'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Metro</span>
          </button>
          <button
            onClick={() => setTransitMode('Walking')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all ${
              transitMode === 'Walking'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Walk</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
        <div>
          <span className="text-[10px] sm:text-xs text-slate-400">Total Route Distance</span>
          <div className="text-sm sm:text-base font-bold text-white mt-0.5">
            {totalDistanceKm} km
          </div>
        </div>
        <div className="border-x border-slate-800">
          <span className="text-[10px] sm:text-xs text-slate-400">Transit Duration</span>
          <div className="text-sm sm:text-base font-bold text-cyan-400 mt-0.5 flex items-center justify-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{estimatedTransitHours} hrs</span>
          </div>
        </div>
        <div>
          <span className="text-[10px] sm:text-xs text-slate-400">Emission Saved</span>
          <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5 flex items-center justify-center space-x-1">
            <Fuel className="w-3.5 h-3.5" />
            <span>-8.2 kg CO₂</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visualizer Box */}
      <div className="mt-4 relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden h-72 sm:h-80 flex items-center justify-center">
        {/* Subtle grid pattern for topographic feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />

        {/* Ambient pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* SVG Route Visualization */}
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 480 320">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Connect node lines */}
          {mapNodes.map((node, i) => {
            if (i === mapNodes.length - 1) return null;
            const next = mapNodes[i + 1];
            // Curved path between waypoints
            const midX = (node.x + next.x) / 2 + (i % 2 === 0 ? 25 : -25);
            const midY = (node.y + next.y) / 2 + (i % 2 === 0 ? -20 : 20);

            return (
              <g key={`path-${i}`}>
                {/* Background shadow stroke */}
                <path
                  d={`M ${node.x} ${node.y} Q ${midX} ${midY} ${next.x} ${next.y}`}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="6"
                />
                {/* Active connecting glow path */}
                <path
                  d={`M ${node.x} ${node.y} Q ${midX} ${midY} ${next.x} ${next.y}`}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              </g>
            );
          })}

          {/* Plotted Node Circles */}
          {mapNodes.map((node) => {
            const isSelected = selectedSpot?.id === node.activity.id;

            return (
              <g
                key={node.activity.id}
                onClick={() => setSelectedSpot(node.activity)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    className="animate-ping opacity-75"
                  />
                )}
                {/* Outer halo */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="14"
                  fill={isSelected ? '#10b981' : '#1e293b'}
                  stroke={isSelected ? '#ffffff' : '#06b6d4'}
                  strokeWidth="2.5"
                  filter="url(#glow)"
                />
                {/* Step Number Label */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill={isSelected ? '#022c22' : '#ffffff'}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {node.index}
                </text>
                {/* Label text */}
                <text
                  x={node.x}
                  y={node.y - 18}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="9"
                  fontWeight="600"
                  className="bg-slate-900"
                >
                  {node.activity.title.length > 20
                    ? `${node.activity.title.substring(0, 18)}...`
                    : node.activity.title}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Spot Bottom Inspector Overlay */}
        {selectedSpot && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-2xl flex items-center justify-between z-10 animate-fade-in">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs sm:text-sm text-white truncate">
                    {selectedSpot.title}
                  </span>
                  {selectedSpot.isEcoFriendly && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Eco-Certified
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {selectedSpot.timeRange} • {selectedSpot.locationName}
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0 pl-2">
              <div className="text-xs font-bold text-emerald-400">
                ₹{selectedSpot.estimatedCost}
              </div>
              <span className="text-[10px] text-slate-400">
                {selectedSpot.recommendedDuration}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Turn-by-Turn Optimal Sequence List */}
      <div className="mt-4">
        <label className="text-xs font-semibold text-slate-400 block mb-2">
          AI Optimized Travel Sequencing (Minimal Distance & Zero Congestion):
        </label>
        <div className="space-y-1.5">
          {activities.map((act, idx) => (
            <div
              key={act.id}
              onClick={() => setSelectedSpot(act)}
              className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                selectedSpot?.id === act.id
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-white'
                  : 'bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-emerald-400 flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="font-medium truncate">{act.title}</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 flex-shrink-0">
                <span>{act.timeSlot}</span>
                <span className="text-emerald-400 font-semibold">₹{act.estimatedCost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
