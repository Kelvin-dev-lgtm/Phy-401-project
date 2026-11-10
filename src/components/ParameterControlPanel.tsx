/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CompressorParameters } from '../types/compressor';
import { Sliders, Zap, Thermometer, Gauge, Settings2 } from 'lucide-react';

interface ParameterControlPanelProps {
  params: CompressorParameters;
  onChange: (newParams: CompressorParameters) => void;
  pMidMode: 'auto-optimal' | 'equal-ratio' | 'manual';
  setPMidMode: (mode: 'auto-optimal' | 'equal-ratio' | 'manual') => void;
  manualPMid: number;
  setManualPMid: (p: number) => void;
  optimalPMid: number;
  equalPMid: number;
}

export const ParameterControlPanel: React.FC<ParameterControlPanelProps> = ({
  params,
  onChange,
  pMidMode,
  setPMidMode,
  manualPMid,
  setManualPMid,
  optimalPMid,
  equalPMid,
}) => {
  const updateParam = <K extends keyof CompressorParameters>(key: K, value: number) => {
    onChange({ ...params, [key]: value });
  };

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'base':
        onChange({
          p1: 100.0,
          p3: 800.0,
          t1: 298.0,
          mDot: 0.060,
          t3: 303.0,
          tFinal: 310.0,
          tc: 293.0,
          r: 0.287,
          cp: 1.005,
          gamma: 1.400,
          etaS: 0.78,
          etaM: 0.90,
          tLimit: 500.0,
          motorLimit: 22.0,
          opHours: 2000.0,
        });
        setPMidMode('auto-optimal');
        break;
      case 'hot':
        onChange({ ...params, t1: 308.0, t3: 305.0 });
        break;
      case 'max-flow':
        onChange({ ...params, mDot: 0.080 });
        break;
      case 'high-pressure':
        onChange({ ...params, p3: 1000.0 });
        break;
      case 'low-demand':
        onChange({ ...params, p3: 600.0, mDot: 0.040, t1: 288.0 });
        break;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-tight text-white uppercase tracking-wider font-mono">
            Operating Specifications
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">Table 1 Parameters</span>
      </div>

      {/* Preset Buttons */}
      <div className="mt-4 mb-5">
        <span className="block text-xs font-mono text-slate-400 mb-2">Scenario Presets:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset('base')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
          >
            Base Case (8 bar)
          </button>
          <button
            onClick={() => applyPreset('hot')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
          >
            Hot Ambient (308 K)
          </button>
          <button
            onClick={() => applyPreset('max-flow')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
          >
            Max Flow (0.08 kg/s)
          </button>
          <button
            onClick={() => applyPreset('high-pressure')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
          >
            10 bar (1,000 kPa)
          </button>
        </div>
      </div>

      {/* Parameter Sliders */}
      <div className="space-y-4">
        {/* p1: Inlet Pressure */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium">Inlet Pressure p₁</span>
            <span className="font-mono text-cyan-300 tabular-nums">
              {params.p1.toFixed(1)} <span className="text-slate-400">kPa</span>
            </span>
          </div>
          <input
            type="range"
            min={90}
            max={110}
            step={1}
            value={params.p1}
            onChange={(e) => updateParam('p1', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>90 kPa</span>
            <span>Base: 100 kPa</span>
            <span>110 kPa</span>
          </div>
        </div>

        {/* p3: Delivery Pressure */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium">Delivery Pressure p₃</span>
            <span className="font-mono text-cyan-300 tabular-nums">
              {params.p3.toFixed(0)} <span className="text-slate-400">kPa ({ (params.p3 / 100).toFixed(1) } bar)</span>
            </span>
          </div>
          <input
            type="range"
            min={600}
            max={1000}
            step={10}
            value={params.p3}
            onChange={(e) => updateParam('p3', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>600 kPa (6 bar)</span>
            <span>Base: 800 kPa</span>
            <span>1000 kPa (10 bar)</span>
          </div>
        </div>

        {/* T1: First Stage Inlet Temperature */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium">Inlet Temperature T₁</span>
            <span className="font-mono text-amber-300 tabular-nums">
              {params.t1.toFixed(1)} <span className="text-slate-400">K ({(params.t1 - 273.15).toFixed(1)}°C)</span>
            </span>
          </div>
          <input
            type="range"
            min={288}
            max={308}
            step={1}
            value={params.t1}
            onChange={(e) => updateParam('t1', parseFloat(e.target.value))}
            className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>288 K (14.9°C)</span>
            <span>Base: 298 K (24.9°C)</span>
            <span>308 K (34.9°C)</span>
          </div>
        </div>

        {/* mDot: Mass flow rate */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium">Mass Flow Rate ṁ</span>
            <span className="font-mono text-cyan-300 tabular-nums">
              {params.mDot.toFixed(3)} <span className="text-slate-400">kg/s ({(params.mDot * 3600).toFixed(1)} kg/h)</span>
            </span>
          </div>
          <input
            type="range"
            min={0.040}
            max={0.080}
            step={0.002}
            value={params.mDot}
            onChange={(e) => updateParam('mDot', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0.040 kg/s</span>
            <span>Base: 0.060 kg/s</span>
            <span>0.080 kg/s</span>
          </div>
        </div>

        {/* Efficiencies: eta_s and eta_m */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-medium">Isentropic η_s</span>
              <span className="font-mono text-slate-300 tabular-nums">{params.etaS.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.70}
              max={0.85}
              step={0.01}
              value={params.etaS}
              onChange={(e) => updateParam('etaS', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.70</span>
              <span>0.85</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-medium">Motor η_m</span>
              <span className="font-mono text-slate-300 tabular-nums">{params.etaM.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.85}
              max={0.95}
              step={0.01}
              value={params.etaM}
              onChange={(e) => updateParam('etaM', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.85</span>
              <span>0.95</span>
            </div>
          </div>
        </div>

        {/* Cooler & Reservoir Temps */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-medium">Intercooler T₃</span>
              <span className="font-mono text-cyan-300 tabular-nums">{params.t3.toFixed(0)} K</span>
            </div>
            <input
              type="range"
              min={params.tc + 5}
              max={320}
              step={1}
              value={params.t3}
              onChange={(e) => updateParam('t3', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>≥ Tc+5 ({params.tc + 5} K)</span>
              <span>Base: 303 K</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-medium">Coolant Tc</span>
              <span className="font-mono text-slate-300 tabular-nums">{params.tc.toFixed(0)} K</span>
            </div>
            <input
              type="range"
              min={280}
              max={300}
              step={1}
              value={params.tc}
              onChange={(e) => updateParam('tc', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>280 K</span>
              <span>293 K</span>
            </div>
          </div>
        </div>

        {/* Intermediate Pressure p2 Mode Selection */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-300 font-semibold">Intermediate Pressure p₂ Strategy</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg text-xs font-mono mb-3">
            <button
              onClick={() => setPMidMode('auto-optimal')}
              className={`py-1.5 px-2 rounded text-center transition-colors ${
                pMidMode === 'auto-optimal' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Optimum p₂*
            </button>
            <button
              onClick={() => setPMidMode('equal-ratio')}
              className={`py-1.5 px-2 rounded text-center transition-colors ${
                pMidMode === 'equal-ratio' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              √(p₁·p₃)
            </button>
            <button
              onClick={() => setPMidMode('manual')}
              className={`py-1.5 px-2 rounded text-center transition-colors ${
                pMidMode === 'manual' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Manual
            </button>
          </div>

          {pMidMode === 'manual' ? (
            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-300 mb-1">
                <span>Selected p₂:</span>
                <span>{manualPMid.toFixed(1)} kPa</span>
              </div>
              <input
                type="range"
                min={params.p1 + 5}
                max={params.p3 - 5}
                step={2}
                value={manualPMid}
                onChange={(e) => setManualPMid(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>Optimum: {optimalPMid.toFixed(1)} kPa</span>
                <span>Equal: {equalPMid.toFixed(1)} kPa</span>
              </div>
            </div>
          ) : (
            <div className="text-xs font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Numerical &amp; Analytic p₂*:</span>
                <span className="text-cyan-300 font-semibold">{optimalPMid.toFixed(1)} kPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Equal Ratio √(p₁·p₃):</span>
                <span className="text-slate-300">{equalPMid.toFixed(1)} kPa</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 leading-tight">
                {params.t3 > params.t1
                  ? `Shifted +${(optimalPMid - equalPMid).toFixed(1)} kPa because T₃ (${params.t3} K) > T₁ (${params.t1} K)`
                  : 'Identical because T₃ = T₁'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
