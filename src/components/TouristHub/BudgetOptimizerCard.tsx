import React from 'react';
import { IndianRupee, PieChart, TrendingDown, CheckCircle2, AlertCircle, Lightbulb, ShieldCheck } from 'lucide-react';
import { BudgetBreakdown } from '../../types';

interface BudgetOptimizerCardProps {
  budget: BudgetBreakdown;
  travelersCount?: number;
}

export const BudgetOptimizerCard: React.FC<BudgetOptimizerCardProps> = ({ budget, travelersCount = 2 }) => {
  const savings = Math.max(0, budget.targetBudget - budget.totalEstimated);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative ambient */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">Smart Budget Optimizer</h3>
            <p className="text-xs text-slate-400">Cost-effective distribution across verified vendors</p>
          </div>
        </div>

        {budget.isWithinBudget ? (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Within Budget ({budget.variancePercentage || 8}% Saved)</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Budget Alert</span>
          </div>
        )}
      </div>

      {/* Target vs Estimated Summary */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Your Target Budget</span>
          <div className="text-lg sm:text-xl font-bold font-display text-slate-200 mt-0.5">
            ₹{budget.targetBudget.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">Specified trip limit</span>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
          <span className="text-[11px] text-emerald-400 font-medium">AI-Optimized Cost</span>
          <div className="text-lg sm:text-xl font-bold font-display text-emerald-400 mt-0.5">
            ₹{budget.totalEstimated.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-300/80">
            ≈ ₹{(budget.perPersonCost || Math.round(budget.totalEstimated / travelersCount)).toLocaleString('en-IN')} / person
          </span>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Estimated Direct Savings</span>
          <div className="text-lg sm:text-xl font-bold font-display text-teal-300 mt-0.5 flex items-center space-x-1">
            <TrendingDown className="w-4 h-4 text-emerald-400 inline" />
            <span>₹{savings.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[10px] text-slate-500">Via bundled local passes</span>
        </div>
      </div>

      {/* Category Cost Distribution Bars */}
      <div className="mt-5 space-y-2.5">
        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Expense Distribution by Category</span>
          <span className="text-[10px] text-slate-400">Verified Price Matrix</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {/* Stays */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Eco-Stays & Hotels</span>
              <span className="font-semibold text-slate-200">₹{(budget.categories.stays || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${Math.min(100, ((budget.categories.stays || 0) / budget.totalEstimated) * 100)}%` }}
              />
            </div>
          </div>

          {/* Transport */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>EV & Local Transit</span>
              <span className="font-semibold text-slate-200">₹{(budget.categories.transport || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, ((budget.categories.transport || 0) / budget.totalEstimated) * 100)}%` }}
              />
            </div>
          </div>

          {/* Food */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Authentic Food & Meals</span>
              <span className="font-semibold text-slate-200">₹{(budget.categories.food || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${Math.min(100, ((budget.categories.food || 0) / budget.totalEstimated) * 100)}%` }}
              />
            </div>
          </div>

          {/* Sightseeing */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Monument Entry Passes</span>
              <span className="font-semibold text-slate-200">₹{(budget.categories.sightseeing || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full"
                style={{ width: `${Math.min(100, ((budget.categories.sightseeing || 0) / budget.totalEstimated) * 100)}%` }}
              />
            </div>
          </div>

          {/* Activities & Workshops */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Artisan Workshops</span>
              <span className="font-semibold text-slate-200">₹{(budget.categories.activities || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${Math.min(100, ((budget.categories.activities || 0) / budget.totalEstimated) * 100)}%` }}
              />
            </div>
          </div>

          {/* Guide & Safety */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Certified Guide & Insurance</span>
              <span className="font-semibold text-slate-200">₹{(budget.categories.guideAndSafety || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${Math.min(100, ((budget.categories.guideAndSafety || 0) / budget.totalEstimated) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cost Saving Recommendations */}
      {budget.costSavingTips && budget.costSavingTips.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400 mb-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>TourMaster AI Budget Tips:</span>
          </div>
          <div className="space-y-1">
            {budget.costSavingTips.map((tip, idx) => (
              <div key={idx} className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
