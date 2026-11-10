/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, BookOpen, RotateCcw } from 'lucide-react';

interface TopNavProps {
  activeTab: 'overview' | 'figures' | 'feasibility' | 'monte-carlo' | 'theory';
  setActiveTab: (tab: 'overview' | 'figures' | 'feasibility' | 'monte-carlo' | 'theory') => void;
  onOpenPythonModal: () => void;
  onResetParameters: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenPythonModal,
  onResetParameters,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap">
            Karatina University <span className="text-cyan-400 font-mono text-sm ml-1">PHY 401</span>
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-500 font-mono">
            / Thermal Physics II
          </span>
        </div>

        {/* Zone 2: Single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'overview' ? 'text-cyan-400 font-semibold underline underline-offset-8 decoration-cyan-400 decoration-2' : ''
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('figures')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'figures' ? 'text-cyan-400 font-semibold underline underline-offset-8 decoration-cyan-400 decoration-2' : ''
            }`}
          >
            Validation Figures
          </button>
          <button
            onClick={() => setActiveTab('feasibility')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'feasibility' ? 'text-cyan-400 font-semibold underline underline-offset-8 decoration-cyan-400 decoration-2' : ''
            }`}
          >
            2D Feasibility Map
          </button>
          <button
            onClick={() => setActiveTab('monte-carlo')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'monte-carlo' ? 'text-cyan-400 font-semibold underline underline-offset-8 decoration-cyan-400 decoration-2' : ''
            }`}
          >
            Monte Carlo (5,000)
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'theory' ? 'text-cyan-400 font-semibold underline underline-offset-8 decoration-cyan-400 decoration-2' : ''
            }`}
          >
            Derivations &amp; Proofs
          </button>
        </nav>

        {/* Zone 3: 1 primary action button + utility reset */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onResetParameters}
            title="Reset parameters to assignment base case"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenPythonModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-950"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Python Script (.py)</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="lg:hidden flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-800/80 overflow-x-auto text-xs font-medium text-slate-400 no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'overview' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('figures')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'figures' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Figures
        </button>
        <button
          onClick={() => setActiveTab('feasibility')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'feasibility' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Feasibility
        </button>
        <button
          onClick={() => setActiveTab('monte-carlo')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'monte-carlo' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Monte Carlo
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'theory' ? 'text-cyan-400 font-semibold' : ''}`}
        >
          Derivations
        </button>
      </div>
    </header>
  );
};
