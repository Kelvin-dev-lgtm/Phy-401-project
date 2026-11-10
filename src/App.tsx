/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CompressorParameters } from './types/compressor';
import {
  BASE_PARAMETERS,
  evaluateSingleStage,
  evaluateTwoStage,
  findOptimalIntermediatePressure,
  analyticalOptimalIntermediatePressure,
} from './physics/thermo';
import { TopNav } from './components/TopNav';
import { ParameterControlPanel } from './components/ParameterControlPanel';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { ThermodynamicDiagram } from './components/ThermodynamicDiagram';
import { FiguresView } from './components/FiguresView';
import { FeasibilityMapView } from './components/FeasibilityMapView';
import { MonteCarloView } from './components/MonteCarloView';
import { DerivationsModal } from './components/DerivationsModal';
import { PythonScriptModal } from './components/PythonScriptModal';
import { FileDown, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  const [params, setParams] = useState<CompressorParameters>(BASE_PARAMETERS);
  const [activeTab, setActiveTab] = useState<'overview' | 'figures' | 'feasibility' | 'monte-carlo' | 'theory'>('overview');
  const [pMidMode, setPMidMode] = useState<'auto-optimal' | 'equal-ratio' | 'manual'>('auto-optimal');
  const [manualPMid, setManualPMid] = useState<number>(291.2);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);

  // Thermodynamic Computations
  const singleResult = useMemo(() => evaluateSingleStage(params), [params]);

  const { pMidOpt: optimalPMid } = useMemo(
    () => findOptimalIntermediatePressure(params),
    [params]
  );

  const equalPMid = useMemo(() => Math.sqrt(params.p1 * params.p3), [params.p1, params.p3]);

  // Determine active intermediate pressure
  const effectivePMid = useMemo(() => {
    if (pMidMode === 'auto-optimal') return optimalPMid;
    if (pMidMode === 'equal-ratio') return equalPMid;
    return Math.max(params.p1 + 1, Math.min(params.p3 - 1, manualPMid));
  }, [pMidMode, optimalPMid, equalPMid, manualPMid, params.p1, params.p3]);

  const twoResult = useMemo(
    () => evaluateTwoStage(effectivePMid, params),
    [effectivePMid, params]
  );

  const handleResetParameters = () => {
    setParams(BASE_PARAMETERS);
    setPMidMode('auto-optimal');
    setManualPMid(291.2);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Contract (1-line Brand, 4-5 nav links, 1 primary action) */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onResetParameters={handleResetParameters}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Academic Header Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
                <span>PHY 401 Thermal Physics II</span>
                <span aria-hidden="true">·</span>
                <span>Laboratory Compressor Design &amp; Optimization</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Isothermal, Adiabatic &amp; Two-Stage Compressor Analysis
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Design evaluation for Karatina University pneumatic air supply: comparing reversible isothermal limits, practical single-stage limits, intermediate pressure optimization with intercooling, cooler entropy generation, and 5,000-sample uncertainty robustness.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
              <button
                onClick={() => setActiveTab('theory')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Read Derivations</span>
              </button>
              <button
                onClick={() => setIsPythonModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>View Python Model</span>
              </button>
            </div>
          </div>
        </div>

        {/* Console Layout: Split into Parameter Column and Workspace Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Parameter Control Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <ParameterControlPanel
              params={params}
              onChange={setParams}
              pMidMode={pMidMode}
              setPMidMode={setPMidMode}
              manualPMid={manualPMid}
              setManualPMid={setManualPMid}
              optimalPMid={optimalPMid}
              equalPMid={equalPMid}
            />

            {/* Quick Cycle Diagram Card */}
            <ThermodynamicDiagram
              params={params}
              singleResult={singleResult}
              twoResult={twoResult}
            />
          </div>

          {/* Right Main Stage Viewport (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'overview' && (
              <ExecutiveSummary
                singleResult={singleResult}
                twoResult={twoResult}
                params={params}
                optimalPMid={optimalPMid}
              />
            )}

            {activeTab === 'figures' && (
              <FiguresView
                params={params}
                optimalPMid={optimalPMid}
              />
            )}

            {activeTab === 'feasibility' && (
              <FeasibilityMapView
                params={params}
              />
            )}

            {activeTab === 'monte-carlo' && (
              <MonteCarloView
                params={params}
              />
            )}

            {activeTab === 'theory' && (
              <DerivationsModal />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Karatina University · Department of Physical Sciences · PHY 401 Thermal Physics II
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Air: R=0.287 kJ/(kg K), cp=1.005 kJ/(kg K), γ=1.400</span>
            <span aria-hidden="true">·</span>
            <span>Limits: T ≤ 500 K, Motor ≤ 22 kW</span>
          </div>
        </div>
      </footer>

      {/* Python Script Modal */}
      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />
    </div>
  );
}
