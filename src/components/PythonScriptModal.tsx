/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EXTENDED_PYTHON_SCRIPT } from '../physics/pythonScript';
import { X, Copy, Check, Download, Terminal } from 'lucide-react';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(EXTENDED_PYTHON_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([EXTENDED_PYTHON_SCRIPT], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'isothermal_adiabatic_compressor_extended.py';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                isothermal_adiabatic_compressor_extended.py
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                NumPy, SciPy &amp; Matplotlib script meeting all PHY 401 computational requirements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Code Display */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-300 font-mono text-xs leading-relaxed select-text">
          <pre className="whitespace-pre overflow-x-auto">
            <code>{EXTENDED_PYTHON_SCRIPT}</code>
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Run with: python isothermal_adiabatic_compressor_extended.py</span>
          <span>Requires: numpy matplotlib scipy</span>
        </div>
      </div>
    </div>
  );
};
