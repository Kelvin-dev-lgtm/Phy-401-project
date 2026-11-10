/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CompressorParameters } from '../types/compressor';
import {
  generateWorkCurves,
  generateDischargeTemperatureCurves,
  generateIntermediatePressureSweep,
  generateCoolerDutyCurves,
} from '../physics/thermo';

interface FiguresViewProps {
  params: CompressorParameters;
  optimalPMid: number;
}

export const FiguresView: React.FC<FiguresViewProps> = ({ params, optimalPMid }) => {
  const [activeFigure, setActiveFigure] = useState<1 | 2 | 3 | 4>(1);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; valX: number; valY: number } | null>(null);

  // SVG dimensions
  const width = 800;
  const height = 450;
  const padding = { top: 40, right: 40, bottom: 60, left: 70 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // ---------------------------------------------------------------------------
  // FIGURE 1 DATA: Work for Three Compression Processes
  // ---------------------------------------------------------------------------
  const workData = React.useMemo(() => generateWorkCurves([288, 298, 308], params.p1, 60), [params.p1]);
  const f1MinX = 200, f1MaxX = 1000;
  const f1MinY = 50, f1MaxY = 380;

  const f1ScaleX = (x: number) => padding.left + ((x - f1MinX) / (f1MaxX - f1MinX)) * plotWidth;
  const f1ScaleY = (y: number) => padding.top + plotHeight - ((y - f1MinY) / (f1MaxY - f1MinY)) * plotHeight;

  // ---------------------------------------------------------------------------
  // FIGURE 2 DATA: Temperature Constraints
  // ---------------------------------------------------------------------------
  const tempCurves = React.useMemo(() => generateDischargeTemperatureCurves(params, 60), [params]);
  const f2MinX = 200, f2MaxX = 1000;
  const f2MinY = 300, f2MaxY = 660;

  const f2ScaleX = (x: number) => padding.left + ((x - f2MinX) / (f2MaxX - f2MinX)) * plotWidth;
  const f2ScaleY = (y: number) => padding.top + plotHeight - ((y - f2MinY) / (f2MaxY - f2MinY)) * plotHeight;

  // ---------------------------------------------------------------------------
  // FIGURE 3 DATA: Intermediate Pressure Sweep & Optimum
  // ---------------------------------------------------------------------------
  const sweepData = React.useMemo(() => generateIntermediatePressureSweep(params, 100), [params]);
  const f3MinX = 150, f3MaxX = 650;
  const f3MinY = 17.0, f3MaxY = 22.5;

  const f3ScaleX = (x: number) => padding.left + ((x - f3MinX) / (f3MaxX - f3MinX)) * plotWidth;
  const f3ScaleY = (y: number) => padding.top + plotHeight - ((y - f3MinY) / (f3MaxY - f3MinY)) * plotHeight;

  // Minimum motor input in sweep
  const lowestSweepPoint = sweepData.reduce(
    (min, p) => (p.motorKw < min.motorKw ? p : min),
    sweepData[0] || { pMid: optimalPMid, motorKw: 17.85 }
  );

  // ---------------------------------------------------------------------------
  // FIGURE 4 DATA: Cooler Heat Rejection
  // ---------------------------------------------------------------------------
  const coolerData = React.useMemo(() => generateCoolerDutyCurves(params, 50), [params]);
  const f4MinX = 600, f4MaxX = 1000;
  const f4MinY = 6.0, f4MaxY = 13.0;

  const f4ScaleX = (x: number) => padding.left + ((x - f4MinX) / (f4MaxX - f4MinX)) * plotWidth;
  const f4ScaleY = (y: number) => padding.top + plotHeight - ((y - f4MinY) / (f4MaxY - f4MinY)) * plotHeight;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      {/* Figure Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white">Project Validation Figures</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Exact numerical reproduction of illustrative figures and assignment extensions
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveFigure(1)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeFigure === 1 ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Figure 1: Work Curves
          </button>
          <button
            onClick={() => setActiveFigure(2)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeFigure === 2 ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Figure 2: Temperatures
          </button>
          <button
            onClick={() => setActiveFigure(3)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeFigure === 3 ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Figure 3: p₂ Optimization
          </button>
          <button
            onClick={() => setActiveFigure(4)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeFigure === 4 ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Figure 4: Cooler Duties
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="mt-6 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-slate-950/70 border border-slate-800 rounded-xl p-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none font-mono"
            onMouseLeave={() => setHoverPos(null)}
          >
            {/* Grid & Axes Background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect
              x={padding.left}
              y={padding.top}
              width={plotWidth}
              height={plotHeight}
              fill="url(#grid)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />

            {/* FIGURE 1: WORK COMPARISON */}
            {activeFigure === 1 && (
              <g>
                {/* Horizontal & Vertical Tick Labels */}
                {[200, 400, 600, 800, 1000].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={f1ScaleX(tick)}
                      y1={padding.top}
                      x2={f1ScaleX(tick)}
                      y2={padding.top + plotHeight}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={f1ScaleX(tick)}
                      y={padding.top + plotHeight + 20}
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {[50, 100, 150, 200, 250, 300, 350].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      y1={f1ScaleY(tick)}
                      x2={padding.left + plotWidth}
                      y2={f1ScaleY(tick)}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padding.left - 10}
                      y={f1ScaleY(tick) + 4}
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="end"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {/* Plot curves for each temperature */}
                {[
                  { t: 288, color: '#38bdf8' },
                  { t: 298, color: '#4ade80' },
                  { t: 308, color: '#facc15' },
                ].map(({ t, color }) => {
                  const isoPath = workData
                    .map((d, i) => {
                      const pt = d.series.find((s) => s.tIn === t);
                      return `${i === 0 ? 'M' : 'L'} ${f1ScaleX(d.pFinal)} ${f1ScaleY(pt?.wIso || 0)}`;
                    })
                    .join(' ');

                  const isentropicPath = workData
                    .map((d, i) => {
                      const pt = d.series.find((s) => s.tIn === t);
                      return `${i === 0 ? 'M' : 'L'} ${f1ScaleX(d.pFinal)} ${f1ScaleY(pt?.wIsentropic || 0)}`;
                    })
                    .join(' ');

                  const actualPath = workData
                    .map((d, i) => {
                      const pt = d.series.find((s) => s.tIn === t);
                      return `${i === 0 ? 'M' : 'L'} ${f1ScaleX(d.pFinal)} ${f1ScaleY(pt?.wActual || 0)}`;
                    })
                    .join(' ');

                  return (
                    <g key={t}>
                      <path d={isoPath} fill="none" stroke={color} strokeWidth="1.75" strokeDasharray="3,3" opacity="0.85" />
                      <path d={isentropicPath} fill="none" stroke={color} strokeWidth="2" strokeDasharray="6,4" />
                      <path d={actualPath} fill="none" stroke={color} strokeWidth="2.5" />
                    </g>
                  );
                })}

                {/* Legend */}
                <g transform={`translate(${padding.left + 20}, ${padding.top + 15})`}>
                  <rect x="0" y="0" width="380" height="75" fill="rgba(15, 23, 42, 0.85)" rx="6" stroke="rgba(255,255,255,0.1)" />
                  <line x1="15" y1="20" x2="45" y2="20" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,3" />
                  <text x="55" y="24" fill="#cbd5e1" fontSize="10">··· Isothermal: w_iso = R·T·ln(p/p₁)</text>

                  <line x1="15" y1="40" x2="45" y2="40" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6,4" />
                  <text x="55" y="44" fill="#cbd5e1" fontSize="10">--- Isentropic (η_s = 1.0): w_s</text>

                  <line x1="15" y1="60" x2="45" y2="60" stroke="#94a3b8" strokeWidth="2.5" />
                  <text x="55" y="64" fill="#cbd5e1" fontSize="10">—— Actual Adiabatic (η_s = 0.78)</text>

                  <circle cx="280" cy="20" r="3.5" fill="#38bdf8" />
                  <text x="290" y="24" fill="#38bdf8" fontSize="10">288 K</text>
                  <circle cx="280" cy="40" r="3.5" fill="#4ade80" />
                  <text x="290" y="44" fill="#4ade80" fontSize="10">298 K</text>
                  <circle cx="280" cy="60" r="3.5" fill="#facc15" />
                  <text x="290" y="64" fill="#facc15" fontSize="10">308 K</text>
                </g>

                {/* Axes Titles */}
                <text
                  x={padding.left + plotWidth / 2}
                  y={height - 15}
                  fill="#cbd5e1"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  Delivery pressure p₃ (kPa absolute)
                </text>
                <text
                  x={20}
                  y={padding.top + plotHeight / 2}
                  fill="#cbd5e1"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="600"
                  transform={`rotate(-90 20 ${padding.top + plotHeight / 2})`}
                >
                  Specific compressor work (kJ/kg)
                </text>
              </g>
            )}

            {/* FIGURE 2: TEMPERATURE CONSTRAINTS */}
            {activeFigure === 2 && (
              <g>
                {/* Horizontal & Vertical Tick Labels */}
                {[200, 400, 600, 800, 1000].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={f2ScaleX(tick)}
                      y1={padding.top}
                      x2={f2ScaleX(tick)}
                      y2={padding.top + plotHeight}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={f2ScaleX(tick)}
                      y={padding.top + plotHeight + 20}
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {[350, 400, 450, 500, 550, 600, 650].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      y1={f2ScaleY(tick)}
                      x2={padding.left + plotWidth}
                      y2={f2ScaleY(tick)}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padding.left - 10}
                      y={f2ScaleY(tick) + 4}
                      fill={tick === 500 ? '#f87171' : '#94a3b8'}
                      fontSize="11"
                      fontWeight={tick === 500 ? '700' : 'normal'}
                      textAnchor="end"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {/* 500 K Limit Red Dashed Line */}
                <line
                  x1={padding.left}
                  y1={f2ScaleY(500)}
                  x2={padding.left + plotWidth}
                  y2={f2ScaleY(500)}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                />
                <text
                  x={padding.left + plotWidth - 10}
                  y={f2ScaleY(500) - 8}
                  fill="#ef4444"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  500 K Max Equipment Limit
                </text>

                {/* Overheating Region Shade above 500 K */}
                <rect
                  x={padding.left}
                  y={padding.top}
                  width={plotWidth}
                  height={f2ScaleY(500) - padding.top}
                  fill="rgba(239, 68, 68, 0.08)"
                />
                <text
                  x={f2ScaleX(700)}
                  y={f2ScaleY(560)}
                  fill="rgba(248, 113, 113, 0.4)"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  UNSAFE / OVERHEATING ZONE (&gt; 500 K)
                </text>

                {/* Single stage curve */}
                <path
                  d={tempCurves.map((d, i) => `${i === 0 ? 'M' : 'L'} ${f2ScaleX(d.pFinal)} ${f2ScaleY(d.singleStageT)}`).join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Two stage stage 1 curve */}
                <path
                  d={tempCurves.map((d, i) => `${i === 0 ? 'M' : 'L'} ${f2ScaleX(d.pFinal)} ${f2ScaleY(d.twoStageT2)}`).join(' ')}
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2"
                />

                {/* Two stage stage 2 curve */}
                <path
                  d={tempCurves.map((d, i) => `${i === 0 ? 'M' : 'L'} ${f2ScaleX(d.pFinal)} ${f2ScaleY(d.twoStageT4)}`).join(' ')}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                />

                {/* Legend */}
                <g transform={`translate(${padding.left + 20}, ${padding.top + 15})`}>
                  <rect x="0" y="0" width="310" height="95" fill="rgba(15, 23, 42, 0.85)" rx="6" stroke="rgba(255,255,255,0.1)" />
                  <line x1="15" y1="20" x2="45" y2="20" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="55" y="24" fill="#38bdf8" fontSize="11" fontWeight="600">Single stage outlet T (Violates limit &gt; 460 kPa)</text>

                  <line x1="15" y1="42" x2="45" y2="42" stroke="#4ade80" strokeWidth="2" />
                  <text x="55" y="46" fill="#4ade80" fontSize="11">Two stage first discharge T₂</text>

                  <line x1="15" y1="64" x2="45" y2="64" stroke="#f97316" strokeWidth="2" />
                  <text x="55" y="68" fill="#f97316" fontSize="11">Two stage second discharge T₄</text>

                  <line x1="15" y1="84" x2="45" y2="84" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,3" />
                  <text x="55" y="88" fill="#ef4444" fontSize="11">500 K maximum safe limit</text>
                </g>

                {/* Axes Titles */}
                <text
                  x={padding.left + plotWidth / 2}
                  y={height - 15}
                  fill="#cbd5e1"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  Delivery pressure (kPa absolute)
                </text>
                <text
                  x={20}
                  y={padding.top + plotHeight / 2}
                  fill="#cbd5e1"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="600"
                  transform={`rotate(-90 20 ${padding.top + plotHeight / 2})`}
                >
                  Discharge temperature (K)
                </text>
              </g>
            )}

            {/* FIGURE 3: INTERMEDIATE PRESSURE SWEEP */}
            {activeFigure === 3 && (
              <g>
                {/* Horizontal & Vertical Tick Labels */}
                {[200, 300, 400, 500, 600].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={f3ScaleX(tick)}
                      y1={padding.top}
                      x2={f3ScaleX(tick)}
                      y2={padding.top + plotHeight}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={f3ScaleX(tick)}
                      y={padding.top + plotHeight + 20}
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {[18, 19, 20, 21, 22].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      y1={f3ScaleY(tick)}
                      x2={padding.left + plotWidth}
                      y2={f3ScaleY(tick)}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padding.left - 10}
                      y={f3ScaleY(tick) + 4}
                      fill={tick === 22 ? '#f87171' : '#94a3b8'}
                      fontSize="11"
                      fontWeight={tick === 22 ? '700' : 'normal'}
                      textAnchor="end"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {/* 22 kW Limit Line */}
                <line
                  x1={padding.left}
                  y1={f3ScaleY(22.0)}
                  x2={padding.left + plotWidth}
                  y2={f3ScaleY(22.0)}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                />
                <text
                  x={padding.left + 20}
                  y={f3ScaleY(22.0) - 8}
                  fill="#ef4444"
                  fontSize="11"
                  fontWeight="bold"
                >
                  22 kW Available Motor Rating
                </text>

                {/* Sweep Curve */}
                <path
                  d={sweepData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${f3ScaleX(d.pMid)} ${f3ScaleY(d.motorKw)}`).join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Optimum Point Dot */}
                <circle
                  cx={f3ScaleX(lowestSweepPoint.pMid)}
                  cy={f3ScaleY(lowestSweepPoint.motorKw)}
                  r="6"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* Annotations */}
                <g transform={`translate(${f3ScaleX(lowestSweepPoint.pMid) - 75}, ${f3ScaleY(lowestSweepPoint.motorKw) + 18})`}>
                  <rect x="0" y="0" width="150" height="42" fill="rgba(15, 23, 42, 0.9)" rx="5" stroke="rgba(56, 189, 248, 0.4)" />
                  <text x="75" y="16" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                    Optimum p₂*: {lowestSweepPoint.pMid.toFixed(1)} kPa
                  </text>
                  <text x="75" y="32" fill="#e2e8f0" fontSize="10" textAnchor="middle">
                    Motor Input: {lowestSweepPoint.motorKw.toFixed(2)} kW
                  </text>
                </g>

                {/* Equal Pressure Ratio Comparison Marker */}
                <circle
                  cx={f3ScaleX(Math.sqrt(params.p1 * params.p3))}
                  cy={f3ScaleY(sweepData.find(s => Math.abs(s.pMid - Math.sqrt(params.p1 * params.p3)) < 5)?.motorKw || 17.86)}
                  r="4.5"
                  fill="#f59e0b"
                />

                {/* Legend */}
                <g transform={`translate(${padding.left + plotWidth - 280}, ${padding.top + plotHeight - 110})`}>
                  <rect x="0" y="0" width="270" height="90" fill="rgba(15, 23, 42, 0.85)" rx="6" stroke="rgba(255,255,255,0.1)" />
                  <line x1="15" y1="20" x2="40" y2="20" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="50" y="24" fill="#38bdf8" fontSize="10">Two stage motor input (kW)</text>

                  <line x1="15" y1="42" x2="40" y2="42" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,3" />
                  <text x="50" y="46" fill="#ef4444" fontSize="10">22 kW motor limit</text>

                  <circle cx="28" cy="62" r="4.5" fill="#0284c7" stroke="#fff" strokeWidth="1.5" />
                  <text x="50" y="66" fill="#e2e8f0" fontSize="10">Lowest feasible input (p₂* = {optimalPMid.toFixed(1)} kPa)</text>

                  <circle cx="28" cy="78" r="4" fill="#f59e0b" />
                  <text x="50" y="82" fill="#f59e0b" fontSize="10">Equal ratio √(p₁·p₃) = {Math.sqrt(params.p1 * params.p3).toFixed(1)} kPa</text>
                </g>

                {/* Axes Titles */}
                <text
                  x={padding.left + plotWidth / 2}
                  y={height - 15}
                  fill="#cbd5e1"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  Intermediate pressure p₂ (kPa absolute)
                </text>
                <text
                  x={20}
                  y={padding.top + plotHeight / 2}
                  fill="#cbd5e1"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="600"
                  transform={`rotate(-90 20 ${padding.top + plotHeight / 2})`}
                >
                  Motor input (kW)
                </text>
              </g>
            )}

            {/* FIGURE 4: COOLER HEAT REJECTION */}
            {activeFigure === 4 && (
              <g>
                {/* Horizontal & Vertical Tick Labels */}
                {[600, 700, 800, 900, 1000].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={f4ScaleX(tick)}
                      y1={padding.top}
                      x2={f4ScaleX(tick)}
                      y2={padding.top + plotHeight}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={f4ScaleX(tick)}
                      y={padding.top + plotHeight + 20}
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {[6, 8, 10, 12].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      y1={f4ScaleY(tick)}
                      x2={padding.left + plotWidth}
                      y2={f4ScaleY(tick)}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padding.left - 10}
                      y={f4ScaleY(tick) + 4}
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="end"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {/* Intercooler Q_inter path */}
                <path
                  d={coolerData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${f4ScaleX(d.pFinal)} ${f4ScaleY(d.qInter)}`).join(' ')}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                />

                {/* Aftercooler Q_after path */}
                <path
                  d={coolerData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${f4ScaleX(d.pFinal)} ${f4ScaleY(d.qAfter)}`).join(' ')}
                  fill="none"
                  stroke="#d946ef"
                  strokeWidth="2.5"
                />

                {/* Total heat rejection path */}
                <path
                  d={coolerData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${f4ScaleX(d.pFinal)} ${f4ScaleY(d.qTotal)}`).join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="5,4"
                />

                {/* Legend */}
                <g transform={`translate(${padding.left + 20}, ${padding.top + 15})`}>
                  <rect x="0" y="0" width="310" height="75" fill="rgba(15, 23, 42, 0.85)" rx="6" stroke="rgba(255,255,255,0.1)" />
                  <line x1="15" y1="20" x2="40" y2="20" stroke="#06b6d4" strokeWidth="2.5" />
                  <text x="50" y="24" fill="#06b6d4" fontSize="10">Intercooler Rejection Q̇_inter (T₂ → T₃ = {params.t3} K)</text>

                  <line x1="15" y1="40" x2="40" y2="40" stroke="#d946ef" strokeWidth="2.5" />
                  <text x="50" y="44" fill="#d946ef" fontSize="10">Aftercooler Rejection Q̇_after (T₄ → 310 K)</text>

                  <line x1="15" y1="60" x2="40" y2="60" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,4" />
                  <text x="50" y="64" fill="#f59e0b" fontSize="10">Combined Heat Rejection Q̇_total (kW)</text>
                </g>

                {/* Axes Titles */}
                <text
                  x={padding.left + plotWidth / 2}
                  y={height - 15}
                  fill="#cbd5e1"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  Delivery pressure p₃ (kPa absolute)
                </text>
                <text
                  x={20}
                  y={padding.top + plotHeight / 2}
                  fill="#cbd5e1"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="600"
                  transform={`rotate(-90 20 ${padding.top + plotHeight / 2})`}
                >
                  Cooler heat rejection rate (kW)
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Caption with explicit distinction between fixed and swept parameters (Assignment Requirement) */}
        <div className="w-full max-w-4xl mt-3 p-3.5 bg-slate-950/40 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-400">
          <strong className="text-slate-200">Figure {activeFigure} Caption &amp; Assumptions:</strong>
          {activeFigure === 1 && (
            <p className="mt-1 leading-relaxed">
              Comparison of specific compression work (kJ/kg) across delivery pressures 200–1,000 kPa absolute for inlet temperatures T₁ ∈ {'{'}288, 298, 308{'}'} K.
              <br />
              <span className="text-cyan-300">Swept Parameters:</span> Delivery pressure p₃ (200–1,000 kPa), inlet temperature T₁ (288, 298, 308 K).
              <br />
              <span className="text-slate-300">Fixed Inputs:</span> p₁ = 100 kPa, R = 0.287 kJ/(kg K), c_p = 1.005 kJ/(kg K), γ = 1.400, η_s = 0.78. Notice that w_iso &lt; w_s &lt; w_actual everywhere.
            </p>
          )}
          {activeFigure === 2 && (
            <p className="mt-1 leading-relaxed">
              Discharge temperatures for single-stage and two-stage compression systems with equal stage pressure ratios p₂ = √(p₁·p₃).
              <br />
              <span className="text-cyan-300">Swept Parameters:</span> Delivery pressure p₃ (200–1,000 kPa).
              <br />
              <span className="text-slate-300">Fixed Inputs:</span> p₁ = 100 kPa, T₁ = 298 K, T₃ = 303 K, η_s = 0.78, T_limit = 500 K. The single-stage compressor breaches the 500 K safety ceiling at p₃ ≈ 460 kPa, reaching {tempCurves[tempCurves.length - 1]?.singleStageT.toFixed(1)} K at 1,000 kPa, whereas two-stage stages stay comfortably under 460 K.
            </p>
          )}
          {activeFigure === 3 && (
            <p className="mt-1 leading-relaxed">
              Total motor electrical input power (kW) at 800 kPa delivery as a function of intermediate pressure p₂ swept from 150 to 650 kPa.
              <br />
              <span className="text-cyan-300">Swept Parameters:</span> Intermediate pressure p₂ (150–650 kPa).
              <br />
              <span className="text-slate-300">Fixed Inputs:</span> p₁ = 100 kPa, p₃ = 800 kPa, T₁ = 298 K, T₃ = 303 K, ṁ = 0.060 kg/s, η_s = 0.78, η_m = 0.90, Motor Limit = 22 kW. The global minimum occurs at p₂* = {optimalPMid.toFixed(1)} kPa (motor input {lowestSweepPoint.motorKw.toFixed(2)} kW), shifted above √(p₁·p₃) = {Math.sqrt(params.p1 * params.p3).toFixed(1)} kPa due to T₃ &gt; T₁.
            </p>
          )}
          {activeFigure === 4 && (
            <p className="mt-1 leading-relaxed">
              Intercooler and aftercooler heat rejection duties Q̇ (kW) for the optimized two-stage design across delivery pressures 600–1,000 kPa.
              <br />
              <span className="text-cyan-300">Swept Parameters:</span> Delivery pressure p₃ (600–1,000 kPa) with continuously re-optimized intermediate pressure p₂*(p₃).
              <br />
              <span className="text-slate-300">Fixed Inputs:</span> p₁ = 100 kPa, T₁ = 298 K, T₃ = 303 K, delivery T_final = 310 K, coolant Tc = 293 K, ṁ = 0.060 kg/s. All cooler entropy generation rates Ṡ_gen,cool satisfy the Second Law (Ṡ_gen ≥ 0).
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
