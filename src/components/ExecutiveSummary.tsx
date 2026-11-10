/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SingleStageResult, TwoStageResult, CompressorParameters } from '../types/compressor';
import { AlertTriangle, CheckCircle2, Flame, Zap, ArrowDownRight, Wind } from 'lucide-react';

interface ExecutiveSummaryProps {
  singleResult: SingleStageResult;
  twoResult: TwoStageResult;
  params: CompressorParameters;
  optimalPMid: number;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  singleResult,
  twoResult,
  params,
  optimalPMid,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Single Stage Verdict Card */}
        <div className={`p-5 rounded-xl border ${
          singleResult.isFeasible
            ? 'bg-emerald-950/20 border-emerald-800/60'
            : 'bg-rose-950/20 border-rose-800/60'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400">Single-Stage System (100 → 800 kPa)</span>
              <h3 className="text-lg font-bold text-white mt-1">Single Compressor Stage</h3>
            </div>
            {singleResult.isFeasible ? (
              <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 bg-emerald-900/40 px-2 py-1 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" /> FEASIBLE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-400 bg-rose-900/40 px-2 py-1 rounded">
                <AlertTriangle className="w-3.5 h-3.5" /> REJECTED (OVERHEATING)
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-mono text-slate-400 block">Discharge Temperature</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-2xl font-bold font-mono tabular-nums ${
                  singleResult.stage.tOut > params.tLimit ? 'text-rose-400' : 'text-slate-100'
                }`}>
                  {singleResult.stage.tOut.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400">K</span>
              </div>
              <span className="text-[11px] font-mono text-rose-300">
                Limit: {params.tLimit} K (+{(singleResult.stage.tOut - params.tLimit).toFixed(1)} K excess)
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 block">Motor Electrical Input</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-100">
                  {singleResult.motorInputKw.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-slate-400">kW</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Limit: {params.motorLimit} kW ({(params.motorLimit - singleResult.motorInputKw).toFixed(2)} kW margin)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            <strong className="text-rose-400">Engineering Conclusion:</strong> A single-stage compressor is non-viable for this Karatina University laboratory. Compressing 100 kPa air directly to 800 kPa pushes the outlet temperature to {singleResult.stage.tOut.toFixed(1)} K, severely violating the 500 K safety ceiling and risking rapid lubrication breakdown.
          </div>
        </div>

        {/* Two Stage Verdict Card */}
        <div className={`p-5 rounded-xl border ${
          twoResult.isFeasible
            ? 'bg-cyan-950/20 border-cyan-800/60'
            : 'bg-amber-950/20 border-amber-800/60'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400">Recommended Two-Stage System</span>
              <h3 className="text-lg font-bold text-white mt-1">Staged with Intercooler</h3>
            </div>
            {twoResult.isFeasible ? (
              <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-300 bg-cyan-900/40 px-2 py-1 rounded">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> RECOMMENDED CONFIGURATION
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-400 bg-amber-900/40 px-2 py-1 rounded">
                <AlertTriangle className="w-3.5 h-3.5" /> RE-CALIBRATE LIMITS
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div>
              <span className="text-xs font-mono text-slate-400 block">Stage 1 Temp T₂</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                  {twoResult.stage1.tOut.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400">K</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Margin: +{(params.tLimit - twoResult.stage1.tOut).toFixed(1)} K</span>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 block">Stage 2 Temp T₄</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                  {twoResult.stage2.tOut.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400">K</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Margin: +{(params.tLimit - twoResult.stage2.tOut).toFixed(1)} K</span>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 block">Motor Power</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono tabular-nums text-cyan-300">
                  {twoResult.motorInputKw.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-slate-400">kW</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Margin: {(params.motorLimit - twoResult.motorInputKw).toFixed(2)} kW</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            <strong className="text-cyan-300">Engineering Recommendation:</strong> The two-stage compressor with intercooling meets all operating and equipment limits. Both stage discharge temperatures remain safely below 500 K ({twoResult.stage1.tOut.toFixed(1)} K &amp; {twoResult.stage2.tOut.toFixed(1)} K), motor load is well within the 22 kW rating ({twoResult.motorInputKw.toFixed(2)} kW), and annual power consumption drops significantly.
          </div>
        </div>
      </div>

      {/* KPI Quantitative Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Annual Energy Saved */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ANNUAL ENERGY SAVINGS</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {twoResult.annualEnergySavedKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs font-mono text-slate-400">kWh/year</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {((1 - twoResult.motorInputKw / singleResult.motorInputKw) * 100).toFixed(1)}% reduction in electricity
          </span>
        </div>

        {/* Metric 2: Specific Work Saved */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SPECIFIC WORK SAVINGS</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-cyan-300">
              {(singleResult.stage.workActual - twoResult.totalWorkActual).toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">kJ/kg</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            2-stage: {twoResult.totalWorkActual.toFixed(1)} vs single: {singleResult.stage.workActual.toFixed(1)} kJ/kg
          </span>
        </div>

        {/* Metric 3: Cooler Heat Duties */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>COOLER HEAT DUTIES</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-300">
              {twoResult.totalHeatRejected.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">kW</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Intercooler: {twoResult.intercooler.heatDuty.toFixed(2)} kW · Aftercooler: {twoResult.aftercooler.heatDuty.toFixed(2)} kW
          </span>
        </div>

        {/* Metric 4: Entropy Generation */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL ENTROPY GEN Ṡ_gen</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-purple-300">
              {(twoResult.totalEntropyGen * 1000).toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">W/K</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Gouy-Stodola: {(twoResult.totalEntropyGen * params.tc).toFixed(2)} kW exergy destruction
          </span>
        </div>
      </div>

      {/* Comparison Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            Detailed Thermodynamic State &amp; Performance Comparison
          </h4>
          <span className="text-xs font-mono text-slate-400">T₁ = {params.t1} K · p₁ = {params.p1} kPa · p₃ = {params.p3} kPa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Metric / Parameter</th>
                <th className="py-2.5 px-4 font-medium">Reversible Isothermal</th>
                <th className="py-2.5 px-4 font-medium">Reversible Isentropic</th>
                <th className="py-2.5 px-4 font-medium">Practical Single Stage</th>
                <th className="py-2.5 px-4 font-medium text-cyan-300">Two-Stage (Optimal p₂)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-2 px-4 text-slate-200">Specific Work (kJ/kg)</td>
                <td className="py-2 px-4 tabular-nums">{singleResult.stage.workIso.toFixed(2)}</td>
                <td className="py-2 px-4 tabular-nums">{singleResult.stage.workS.toFixed(2)}</td>
                <td className="py-2 px-4 tabular-nums text-rose-300 font-semibold">{singleResult.stage.workActual.toFixed(2)}</td>
                <td className="py-2 px-4 tabular-nums text-cyan-300 font-semibold">{twoResult.totalWorkActual.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-slate-200">Stage 1 Discharge Temp (K)</td>
                <td className="py-2 px-4 tabular-nums">{params.t1.toFixed(1)}</td>
                <td className="py-2 px-4 tabular-nums">{singleResult.stage.tOutS.toFixed(1)}</td>
                <td className="py-2 px-4 tabular-nums text-rose-400 font-bold">{singleResult.stage.tOut.toFixed(1)}</td>
                <td className="py-2 px-4 tabular-nums text-emerald-400">{twoResult.stage1.tOut.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-slate-200">Stage 2 Discharge Temp (K)</td>
                <td className="py-2 px-4 tabular-nums">N/A</td>
                <td className="py-2 px-4 tabular-nums">N/A</td>
                <td className="py-2 px-4 tabular-nums">N/A</td>
                <td className="py-2 px-4 tabular-nums text-emerald-400">{twoResult.stage2.tOut.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-slate-200">Motor Input Power (kW)</td>
                <td className="py-2 px-4 tabular-nums">{(params.mDot * singleResult.stage.workIso / params.etaM).toFixed(2)}</td>
                <td className="py-2 px-4 tabular-nums">{(params.mDot * singleResult.stage.workS / params.etaM).toFixed(2)}</td>
                <td className="py-2 px-4 tabular-nums">{singleResult.motorInputKw.toFixed(2)}</td>
                <td className="py-2 px-4 tabular-nums text-cyan-300 font-semibold">{twoResult.motorInputKw.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-slate-200">Intercooler Heat Duty (kW)</td>
                <td className="py-2 px-4 tabular-nums">N/A</td>
                <td className="py-2 px-4 tabular-nums">N/A</td>
                <td className="py-2 px-4 tabular-nums">0.00</td>
                <td className="py-2 px-4 tabular-nums">{twoResult.intercooler.heatDuty.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-slate-200">Aftercooler Heat Duty (kW)</td>
                <td className="py-2 px-4 tabular-nums">N/A</td>
                <td className="py-2 px-4 tabular-nums">N/A</td>
                <td className="py-2 px-4 tabular-nums">{singleResult.aftercooler.heatDuty.toFixed(2)}</td>
                <td className="py-2 px-4 tabular-nums">{twoResult.aftercooler.heatDuty.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-slate-200">Entropy Generation Rate (W/K)</td>
                <td className="py-2 px-4 tabular-nums">0.00 (Reversible)</td>
                <td className="py-2 px-4 tabular-nums">0.00 (Reversible)</td>
                <td className="py-2 px-4 tabular-nums">
                  {((singleResult.stage.sGenComp + singleResult.aftercooler.sGenCooler) * 1000).toFixed(2)}
                </td>
                <td className="py-2 px-4 tabular-nums text-purple-300">{(twoResult.totalEntropyGen * 1000).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-slate-200">Annual Energy Demand (kWh)</td>
                <td className="py-2 px-4 tabular-nums">
                  {((params.mDot * singleResult.stage.workIso / params.etaM) * params.opHours).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="py-2 px-4 tabular-nums">
                  {((params.mDot * singleResult.stage.workS / params.etaM) * params.opHours).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="py-2 px-4 tabular-nums">{singleResult.annualEnergyKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="py-2 px-4 tabular-nums text-cyan-300 font-bold">{twoResult.annualEnergyKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-slate-200">Feasibility Status</td>
                <td className="py-2 px-4 text-slate-400">Theoretical Limit</td>
                <td className="py-2 px-4 text-slate-400">Theoretical Limit</td>
                <td className="py-2 px-4 text-rose-400 font-bold">FAIL (T &gt; 500 K)</td>
                <td className="py-2 px-4 text-emerald-400 font-bold">PASS (All Limits Satisfied)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
