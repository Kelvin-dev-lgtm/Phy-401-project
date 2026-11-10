/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { CompressorParameters } from '../types/compressor';
import { generateFeasibilityMatrix } from '../physics/thermo';
import { ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface FeasibilityMapViewProps {
  params: CompressorParameters;
}

export const FeasibilityMapView: React.FC<FeasibilityMapViewProps> = ({ params }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    p3: number;
    t1: number;
    motorKw: number;
    t2: number;
    t4: number;
    feasible: boolean;
    failReason?: string;
  } | null>(null);

  // Generate 20x15 grid across p3 in [600, 1000] and T1 in [288, 308]
  const { p3Values, t1Values, matrix } = useMemo(
    () => generateFeasibilityMatrix(params, 20, 14),
    [params]
  );

  // Calculate percentage feasible in the domain
  const totalCells = p3Values.length * t1Values.length;
  let feasibleCells = 0;
  matrix.forEach((row) =>
    row.forEach((cell) => {
      if (cell.feasible) feasibleCells++;
    })
  );
  const feasibilityPercentage = (feasibleCells / totalCells) * 100;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            2D Operating Feasibility Map &amp; Constraint Boundaries
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Swept across delivery pressure 600–1,000 kPa and inlet temperature 288–308 K
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Domain Feasibility:</span>
            <span className={`text-xs font-mono font-bold ${
              feasibilityPercentage > 90 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {feasibilityPercentage.toFixed(1)}% ({feasibleCells}/{totalCells} cells)
            </span>
          </div>
        </div>
      </div>

      {/* Main Heatmap Grid */}
      <div className="mt-6 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-slate-950/80 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Inlet Temperature T₁ (K) ↑</span>
            <span>Delivery Pressure p₃ (kPa) →</span>
          </div>

          <div className="relative">
            {/* Heatmap Matrix Display */}
            <div className="grid gap-[2px] bg-slate-900 p-2 rounded-lg border border-slate-800"
                 style={{
                   gridTemplateColumns: `repeat(${p3Values.length}, minmax(0, 1fr))`,
                   gridTemplateRows: `repeat(${t1Values.length}, minmax(0, 1fr))`,
                 }}>
              {/* Matrix is ordered from max T1 to min T1 for standard Cartesian Y orientation */}
              {[...matrix].reverse().map((row, rowIdx) =>
                row.map((cell, colIdx) => {
                  let bgColor = 'bg-emerald-500/80';
                  if (!cell.feasible) {
                    bgColor = 'bg-rose-500/90';
                  } else if (cell.motorKw > 20.0) {
                    bgColor = 'bg-amber-500/80';
                  } else if (cell.motorKw > 18.5) {
                    bgColor = 'bg-cyan-600/80';
                  } else {
                    bgColor = 'bg-emerald-600/70';
                  }

                  return (
                    <button
                      key={`${rowIdx}-${colIdx}`}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onClick={() => setHoveredCell(cell)}
                      className={`h-6 sm:h-7 rounded-sm transition-transform hover:scale-110 hover:z-10 focus:outline-none cursor-pointer ${bgColor}`}
                      title={`p3: ${cell.p3.toFixed(0)} kPa, T1: ${cell.t1.toFixed(1)} K, Motor: ${cell.motorKw.toFixed(2)} kW`}
                    />
                  );
                })
              )}
            </div>

            {/* X-axis ticks */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2 px-2">
              <span>600 kPa (6 bar)</span>
              <span>700 kPa</span>
              <span>800 kPa (Base)</span>
              <span>900 kPa</span>
              <span>1000 kPa (10 bar)</span>
            </div>

            {/* Y-axis labels positioned on left */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1 px-2">
              <span>Y-Axis: 288 K (bottom) to 308 K (top)</span>
              <span>Resolution: {p3Values.length} × {t1Values.length} grid</span>
            </div>
          </div>

          {/* Color Ramp Legend */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600/80 inline-block" />
                <span>Feasible (&lt; 18.5 kW)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-cyan-600/80 inline-block" />
                <span>Optimal (18.5–20 kW)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-amber-500/80 inline-block" />
                <span>Near Limit (20–22 kW)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-rose-500/90 inline-block" />
                <span>Infeasible (&gt; 22 kW or &gt; 500 K)</span>
              </div>
            </div>

            <div className="text-slate-400 text-[11px]">
              Motor rating limit: {params.motorLimit} kW · Temp limit: {params.tLimit} K
            </div>
          </div>
        </div>

        {/* Selected / Hovered Cell Telemetry Card */}
        {hoveredCell ? (
          <div className="w-full max-w-4xl mt-4 p-4 bg-slate-950 border border-cyan-800/50 rounded-xl font-mono text-xs text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-semibold">SELECTED OPERATING POINT:</span>
                <span>p₃ = {hoveredCell.p3.toFixed(0)} kPa, T₁ = {hoveredCell.t1.toFixed(1)} K</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                hoveredCell.feasible ? 'bg-emerald-900/40 text-emerald-300' : 'bg-rose-900/40 text-rose-300'
              }`}>
                {hoveredCell.feasible ? 'FEASIBLE' : `INFEASIBLE (${hoveredCell.failReason || 'LIMIT EXCEEDED'})`}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 text-[10px] block">MOTOR ELECTRICAL INPUT</span>
                <span className={`text-base font-bold tabular-nums ${
                  hoveredCell.motorKw > params.motorLimit ? 'text-rose-400' : 'text-cyan-300'
                }`}>
                  {hoveredCell.motorKw.toFixed(2)} kW
                </span>
                <span className="text-[10px] text-slate-500 block">Limit: {params.motorLimit} kW</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block">STAGE 1 OUTLET TEMP T₂</span>
                <span className="text-base font-bold tabular-nums text-slate-200">
                  {hoveredCell.t2.toFixed(1)} K
                </span>
                <span className="text-[10px] text-slate-500 block">Safe under {params.tLimit} K</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block">STAGE 2 OUTLET TEMP T₄</span>
                <span className="text-base font-bold tabular-nums text-slate-200">
                  {hoveredCell.t4.toFixed(1)} K
                </span>
                <span className="text-[10px] text-slate-500 block">Safe under {params.tLimit} K</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block">MASS FLOW &amp; SPEED</span>
                <span className="text-base font-bold tabular-nums text-slate-200">
                  {params.mDot.toFixed(3)} kg/s
                </span>
                <span className="text-[10px] text-slate-500 block">η_s={params.etaS}, η_m={params.etaM}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl mt-4 p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Hover over or tap any cell in the 2D grid above to inspect motor load and stage temperatures at that operating coordinate.</span>
          </div>
        )}

        {/* Engineering Takeaway Note */}
        <div className="w-full max-w-4xl mt-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
          <strong className="text-cyan-300">Thermodynamic Analysis of Feasibility Boundaries:</strong>
          <br />
          Across the entire required delivery envelope (600–1,000 kPa) and ambient range (288–308 K) at base mass flow (0.060 kg/s), the staged system is robustly feasible because intercooling maintains stage discharge temperatures well below 500 K. Infeasibility only emerges if mass flow is increased to its upper limit (0.080 kg/s) combined with delivery pressures approaching 1,000 kPa, where the 22 kW motor limit becomes active.
        </div>
      </div>
    </div>
  );
};
