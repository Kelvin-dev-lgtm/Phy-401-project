/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CompressorParameters, SingleStageResult, TwoStageResult } from '../types/compressor';

interface ThermodynamicDiagramProps {
  params: CompressorParameters;
  singleResult: SingleStageResult;
  twoResult: TwoStageResult;
}

export const ThermodynamicDiagram: React.FC<ThermodynamicDiagramProps> = ({
  params,
  singleResult,
  twoResult,
}) => {
  const [diagramType, setDiagramType] = useState<'pv' | 'ts'>('pv');

  // Physical State Points Calculation
  // Gas constant R = 0.287 kJ/(kg K)
  const R = params.r;

  // Specific volumes v = R * T / p (m^3/kg)
  const v1 = (R * params.t1) / params.p1; // State 1: p1, T1
  const v2 = (R * twoResult.stage1.tOut) / twoResult.pMid; // State 2: p2, T2
  const v3 = (R * params.t3) / twoResult.pMid; // State 3: p2, T3 (intercooled)
  const v4 = (R * twoResult.stage2.tOut) / params.p3; // State 4: p3, T4
  const v5 = (R * params.tFinal) / params.p3; // State 5: p3, 310 K
  const vSingleOut = (R * singleResult.stage.tOut) / params.p3; // Single stage out: p3, Tout

  // Entropy calculations relative to state 1: s - s1 = cp * ln(T / T1) - R * ln(p / p1)
  const cp = params.cp;
  const s1 = 0.0;
  const s2 = cp * Math.log(twoResult.stage1.tOut / params.t1) - R * Math.log(twoResult.pMid / params.p1);
  const s3 = cp * Math.log(params.t3 / params.t1) - R * Math.log(twoResult.pMid / params.p1);
  const s4 = s3 + cp * Math.log(twoResult.stage2.tOut / params.t3) - R * Math.log(params.p3 / twoResult.pMid);
  const s5 = s3 + cp * Math.log(params.tFinal / params.t3) - R * Math.log(params.p3 / twoResult.pMid);
  const sSingleOut = cp * Math.log(singleResult.stage.tOut / params.t1) - R * Math.log(params.p3 / params.p1);

  // SVG dimensions
  const svgW = 600;
  const svgH = 340;
  const pad = { top: 35, right: 35, bottom: 45, left: 60 };
  const pW = svgW - pad.left - pad.right;
  const pH = svgH - pad.top - pad.bottom;

  // P-v Scalers: v spans [0.08, 0.95] m^3/kg, p spans [80, 850] kPa
  const pvMinV = 0.08, pvMaxV = 0.95;
  const pvMinP = 80, pvMaxP = 850;
  const scalePvX = (v: number) => pad.left + ((v - pvMinV) / (pvMaxV - pvMinV)) * pW;
  const scalePvY = (p: number) => pad.top + pH - ((p - pvMinP) / (pvMaxP - pvMinP)) * pH;

  // T-s Scalers: s spans [-0.35, 0.15] kJ/(kg K), T spans [280, 630] K
  const tsMinS = -0.35, tsMaxS = 0.15;
  const tsMinT = 280, tsMaxT = 630;
  const scaleTsX = (s: number) => pad.left + ((s - tsMinS) / (tsMaxS - tsMinS)) * pW;
  const scaleTsY = (t: number) => pad.top + pH - ((t - tsMinT) / (tsMaxT - tsMinT)) * pH;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            Thermodynamic State Space Visualization
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {diagramType === 'pv' ? 'P-v (Pressure vs Specific Volume)' : 'T-s (Temperature vs Specific Entropy)'}
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg text-xs font-mono">
          <button
            onClick={() => setDiagramType('pv')}
            className={`px-3 py-1 rounded transition-colors ${
              diagramType === 'pv' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            P-v Diagram
          </button>
          <button
            onClick={() => setDiagramType('ts')}
            className={`px-3 py-1 rounded transition-colors ${
              diagramType === 'ts' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            T-s Diagram
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex justify-center">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-w-xl select-none font-mono">
            {/* Background Grid */}
            <rect x={pad.left} y={pad.top} width={pW} height={pH} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {diagramType === 'pv' ? (
              <g>
                {/* Work Saved Shaded Polygon between Two-Stage and Single-Stage from p2 to p3 */}
                <polygon
                  points={`
                    ${scalePvX(v3)},${scalePvY(twoResult.pMid)}
                    ${scalePvX(v2)},${scalePvY(twoResult.pMid)}
                    ${scalePvX(vSingleOut)},${scalePvY(params.p3)}
                    ${scalePvX(v4)},${scalePvY(params.p3)}
                  `}
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="rgba(56, 189, 248, 0.4)"
                  strokeDasharray="3,3"
                />
                <text
                  x={(scalePvX(v3) + scalePvX(vSingleOut)) / 2}
                  y={(scalePvY(twoResult.pMid) + scalePvY(params.p3)) / 2 + 5}
                  fill="#38bdf8"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  WORK SAVED
                </text>

                {/* Single Stage Compression Path 1 -> 2' */}
                <line
                  x1={scalePvX(v1)}
                  y1={scalePvY(params.p1)}
                  x2={scalePvX(vSingleOut)}
                  y2={scalePvY(params.p3)}
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />

                {/* Stage 1: 1 -> 2 */}
                <line
                  x1={scalePvX(v1)}
                  y1={scalePvY(params.p1)}
                  x2={scalePvX(v2)}
                  y2={scalePvY(twoResult.pMid)}
                  stroke="#34d399"
                  strokeWidth="2.5"
                />

                {/* Intercooler: 2 -> 3 (Isobaric cooling along p2) */}
                <line
                  x1={scalePvX(v2)}
                  y1={scalePvY(twoResult.pMid)}
                  x2={scalePvX(v3)}
                  y2={scalePvY(twoResult.pMid)}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Stage 2: 3 -> 4 */}
                <line
                  x1={scalePvX(v3)}
                  y1={scalePvY(twoResult.pMid)}
                  x2={scalePvX(v4)}
                  y2={scalePvY(params.p3)}
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                />

                {/* Aftercooler: 4 -> 5 (Isobaric cooling along p3) */}
                <line
                  x1={scalePvX(v4)}
                  y1={scalePvY(params.p3)}
                  x2={scalePvX(v5)}
                  y2={scalePvY(params.p3)}
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray="2,2"
                />

                {/* State Point Markers */}
                {[
                  { x: scalePvX(v1), y: scalePvY(params.p1), label: '1 (Inlet)', col: '#34d399', offX: 10, offY: 5 },
                  { x: scalePvX(v2), y: scalePvY(twoResult.pMid), label: '2 (T₂)', col: '#34d399', offX: 10, offY: -5 },
                  { x: scalePvX(v3), y: scalePvY(twoResult.pMid), label: '3 (T₃)', col: '#38bdf8', offX: -45, offY: -5 },
                  { x: scalePvX(v4), y: scalePvY(params.p3), label: '4 (T₄)', col: '#fbbf24', offX: -35, offY: -10 },
                  { x: scalePvX(v5), y: scalePvY(params.p3), label: '5 (310K)', col: '#a855f7', offX: -50, offY: 15 },
                  { x: scalePvX(vSingleOut), y: scalePvY(params.p3), label: "2' (Single 608K)", col: '#f43f5e', offX: 10, offY: -8 },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="4.5" fill={pt.col} stroke="#fff" strokeWidth="1.5" />
                    <text x={pt.x + pt.offX} y={pt.y + pt.offY} fill={pt.col} fontSize="10" fontWeight="bold">
                      {pt.label}
                    </text>
                  </g>
                ))}

                {/* Axes Labels */}
                <text x={pad.left + pW / 2} y={svgH - 10} fill="#cbd5e1" fontSize="11" textAnchor="middle">
                  Specific Volume v (m³/kg)
                </text>
                <text x={20} y={pad.top + pH / 2} fill="#cbd5e1" fontSize="11" textAnchor="middle" transform={`rotate(-90 20 ${pad.top + pH / 2})`}>
                  Pressure p (kPa absolute)
                </text>
              </g>
            ) : (
              <g>
                {/* T-s Diagram */}
                {/* 500 K Limit line */}
                <line
                  x1={pad.left}
                  y1={scaleTsY(500)}
                  x2={pad.left + pW}
                  y2={scaleTsY(500)}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <text x={pad.left + pW - 10} y={scaleTsY(500) - 6} fill="#ef4444" fontSize="10" textAnchor="end">
                  500 K Ceiling
                </text>

                {/* Single stage path 1 -> 2' (breaching 500 K) */}
                <line
                  x1={scaleTsX(s1)}
                  y1={scaleTsY(params.t1)}
                  x2={scaleTsX(sSingleOut)}
                  y2={scaleTsY(singleResult.stage.tOut)}
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />

                {/* Stage 1: 1 -> 2 */}
                <line
                  x1={scaleTsX(s1)}
                  y1={scaleTsY(params.t1)}
                  x2={scaleTsX(s2)}
                  y2={scaleTsY(twoResult.stage1.tOut)}
                  stroke="#34d399"
                  strokeWidth="2.5"
                />

                {/* Intercooling: 2 -> 3 (cooling decreases entropy and temp) */}
                <line
                  x1={scaleTsX(s2)}
                  y1={scaleTsY(twoResult.stage1.tOut)}
                  x2={scaleTsX(s3)}
                  y2={scaleTsY(params.t3)}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Stage 2: 3 -> 4 */}
                <line
                  x1={scaleTsX(s3)}
                  y1={scaleTsY(params.t3)}
                  x2={scaleTsX(s4)}
                  y2={scaleTsY(twoResult.stage2.tOut)}
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                />

                {/* State Points */}
                {[
                  { x: scaleTsX(s1), y: scaleTsY(params.t1), label: '1 (298K)', col: '#34d399', offX: -40, offY: 15 },
                  { x: scaleTsX(s2), y: scaleTsY(twoResult.stage1.tOut), label: `2 (${twoResult.stage1.tOut.toFixed(0)}K)`, col: '#34d399', offX: 10, offY: -5 },
                  { x: scaleTsX(s3), y: scaleTsY(params.t3), label: '3 (303K)', col: '#38bdf8', offX: -45, offY: -5 },
                  { x: scaleTsX(s4), y: scaleTsY(twoResult.stage2.tOut), label: `4 (${twoResult.stage2.tOut.toFixed(0)}K)`, col: '#fbbf24', offX: 10, offY: -5 },
                  { x: scaleTsX(sSingleOut), y: scaleTsY(singleResult.stage.tOut), label: `2' (Single ${singleResult.stage.tOut.toFixed(0)}K - OVERHEATED)`, col: '#f43f5e', offX: -140, offY: -10 },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="4.5" fill={pt.col} stroke="#fff" strokeWidth="1.5" />
                    <text x={pt.x + pt.offX} y={pt.y + pt.offY} fill={pt.col} fontSize="10" fontWeight="bold">
                      {pt.label}
                    </text>
                  </g>
                ))}

                {/* Axes Labels */}
                <text x={pad.left + pW / 2} y={svgH - 10} fill="#cbd5e1" fontSize="11" textAnchor="middle">
                  Specific Entropy Δs relative to State 1 (kJ/(kg·K))
                </text>
                <text x={20} y={pad.top + pH / 2} fill="#cbd5e1" fontSize="11" textAnchor="middle" transform={`rotate(-90 20 ${pad.top + pH / 2})`}>
                  Temperature T (K)
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className="w-full mt-3 text-xs font-mono text-slate-400 text-center">
          {diagramType === 'pv' ? (
            <span>
              The shaded region represents the <strong className="text-cyan-300">work saved by intercooling</strong> between intermediate pressure p₂ ({twoResult.pMid.toFixed(0)} kPa) and final pressure p₃ ({params.p3.toFixed(0)} kPa).
            </span>
          ) : (
            <span>
              On the T-s plane, intercooling cools state 2 down to 303 K (State 3), preventing stage 2 from ever exceeding 500 K.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
