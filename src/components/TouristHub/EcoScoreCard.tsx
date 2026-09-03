import React from 'react';
import { Leaf, Award, ShieldCheck, TreePine, Zap, ShoppingBag, Navigation } from 'lucide-react';
import { EcoScoreBreakdown } from '../../types';

interface EcoScoreCardProps {
  ecoScore: EcoScoreBreakdown;
}

export const EcoScoreCard: React.FC<EcoScoreCardProps> = ({ ecoScore }) => {
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Emerald Pioneer':
        return 'from-emerald-500 to-teal-400 text-emerald-950';
      case 'Green Guardian':
        return 'from-teal-500 to-cyan-400 text-teal-950';
      case 'Eco Voyager':
        return 'from-cyan-500 to-blue-400 text-cyan-950';
      default:
        return 'from-emerald-400 to-teal-300 text-emerald-950';
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-emerald-900/50 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">Sustainability & Eco-Score</h3>
            <p className="text-xs text-slate-400">SIH 2026 Responsible Tourism Algorithm</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getBadgeColor(ecoScore.badge)} shadow-sm`}>
          {ecoScore.badge}
        </div>
      </div>

      {/* Main Score Display */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
            {/* SVG circular progress */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400"
                strokeDasharray={`${ecoScore.totalScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl sm:text-2xl font-black font-display text-white">{ecoScore.totalScore}</span>
              <span className="text-[10px] text-slate-400 block -mt-1">/100</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Eco Rating</div>
            <div className="text-sm sm:text-base font-bold text-emerald-400">Top 5% Sustainable</div>
            <div className="text-[11px] text-slate-500">Low-Impact Tourism Pass</div>
          </div>
        </div>

        {/* Carbon Offset Stats */}
        <div className="sm:col-span-2 flex flex-col justify-center space-y-1 sm:pl-4 sm:border-l border-slate-800">
          <div className="flex items-center space-x-2">
            <TreePine className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-slate-300 font-semibold">
              Estimated Carbon Footprint Reduced:
            </span>
          </div>
          <div className="text-xl font-bold text-white flex items-baseline space-x-1.5">
            <span className="text-2xl text-emerald-400 font-display font-black">
              {ecoScore.carbonSavedKg || 34.5} kg
            </span>
            <span className="text-xs text-slate-400 font-normal">CO₂ emissions saved vs standard trip</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Equal to planting ~2 saplings & supporting 4 indigenous rural craft families.
          </p>
        </div>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Eco Stay */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Eco-Stays</span>
            </span>
            <span className="font-bold text-emerald-400">{ecoScore.ecoStayScore || 23}/25</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${((ecoScore.ecoStayScore || 23) / 25) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate">Solar & Zero-Waste Haveli</span>
        </div>

        {/* Green Transport */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <Leaf className="w-3 h-3 text-emerald-400" />
              <span>EV Transit</span>
            </span>
            <span className="font-bold text-emerald-400">{ecoScore.greenTransportScore || 22}/25</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${((ecoScore.greenTransportScore || 22) / 25) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate">Tata Nexon EV Fleet</span>
        </div>

        {/* Local Businesses */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <ShoppingBag className="w-3 h-3 text-purple-400" />
              <span>Local Artisans</span>
            </span>
            <span className="font-bold text-emerald-400">{ecoScore.localBusinessScore || 24}/25</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${((ecoScore.localBusinessScore || 24) / 25) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate">Direct Vendor Patronage</span>
        </div>

        {/* Route Efficiency */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>Route Optimization</span>
            </span>
            <span className="font-bold text-emerald-400">{ecoScore.routeEfficiencyScore || 21}/25</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${((ecoScore.routeEfficiencyScore || 21) / 25) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate">Minimal Detours</span>
        </div>
      </div>

      {/* Sustainability Tips */}
      {ecoScore.recommendations && ecoScore.recommendations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-300 mb-1.5">Actionable Green Recommendations:</div>
          <ul className="space-y-1">
            {ecoScore.recommendations.map((rec, i) => (
              <li key={i} className="text-[11px] text-slate-400 flex items-start space-x-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
