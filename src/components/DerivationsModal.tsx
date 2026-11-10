/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MathFormula } from './MathFormula';
import { BookOpen, CheckCircle, FileText } from 'lucide-react';

export const DerivationsModal: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-8 font-sans">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            PHY 401 Analytical Derivations &amp; Thermodynamic Proofs
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Complete mathematical solutions for Tasks 1, 2, and 3 of the Karatina University assignment
        </p>
      </div>

      {/* TASK 1: DERIVE REFERENCE LIMITS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wider">
          <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs text-cyan-300">
            1
          </span>
          <h3>Task 1: Reference Limits Derivation</h3>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 text-sm leading-relaxed text-slate-300">
          <div>
            <h4 className="font-semibold text-white text-base">
              1.1 Reversible Isothermal Specific Work and Heat Transfer
            </h4>
            <p className="mt-1">
              For a steady-flow open system with negligible kinetic and potential energy changes, the reversible specific shaft work input is given by:
            </p>
            <MathFormula math="w_{\text{rev}} = \int_{p_1}^{p_3} v \, dp" block />
            <p>
              Under ideal gas behavior, the equation of state is <MathFormula math="p v = R T" />. For an isothermal process at constant temperature <MathFormula math="T = T_1" />, the specific volume is:
            </p>
            <MathFormula math="v(p) = \frac{R T_1}{p}" block />
            <p>Substituting into the work integral:</p>
            <MathFormula math="w_{\text{iso}} = \int_{p_1}^{p_3} \frac{R T_1}{p} \, dp = R T_1 [\ln(p)]_{p_1}^{p_3} = R T_1 \ln\left(\frac{p_3}{p_1}\right)" block />
            <p className="mt-2">
              From the steady flow energy equation (First Law of Thermodynamics):
            </p>
            <MathFormula math="q - w = \Delta h = h_3 - h_1" block />
            <p>
              For an ideal gas, specific enthalpy depends exclusively on temperature: <MathFormula math="\Delta h = c_p (T_3 - T_1)" />. Since the process is isothermal, <MathFormula math="T_3 = T_1 \implies \Delta h = 0" />. Therefore:
            </p>
            <MathFormula math="q_{\text{in}} - w_{\text{in}} = 0 \implies q_{\text{iso,out}} = w_{\text{iso}} = R T_1 \ln\left(\frac{p_3}{p_1}\right)" block />
            <p className="text-xs text-slate-400 font-mono">
              Interpretation: All the boundary flow work performed on the air must be continuously rejected as heat to the surrounding environment to keep the temperature constant.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h4 className="font-semibold text-white text-base">
              1.2 Reversible Adiabatic (Isentropic) Outlet Temperature and Work
            </h4>
            <p className="mt-1">
              For a reversible, adiabatic compression of an ideal gas with constant specific heats (<MathFormula math="c_p, c_v" />), the process is isentropic (<MathFormula math="\Delta s = 0" />) and obeys:
            </p>
            <MathFormula math="p v^\gamma = \text{constant} \quad \text{or} \quad T p^{\frac{1-\gamma}{\gamma}} = \text{constant}" block />
            <p>Relating the outlet state to the inlet state:</p>
            <MathFormula math="\frac{T_{\text{out},s}}{T_1} = \left(\frac{p_3}{p_1}\right)^{\frac{\gamma - 1}{\gamma}} \implies T_{\text{out},s} = T_1 \left(\frac{p_3}{p_1}\right)^{\frac{\gamma - 1}{\gamma}}" block />
            <p>Applying the steady flow energy equation for an adiabatic compressor (<MathFormula math="q = 0" />):</p>
            <MathFormula math="w_s = -\Delta h = h_{\text{out},s} - h_1 = c_p (T_{\text{out},s} - T_1)" block />
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h4 className="font-semibold text-white text-base">
              1.3 Boundary Conditions &amp; Why Isothermal Work is a Lower Bound
            </h4>
            <p className="mt-1">
              <strong>Boundary Conditions:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <em>Isothermal:</em> Requires infinite heat transfer area or quasi-static compression such that thermal equilibrium with surroundings (<MathFormula math="T = T_1" />) is maintained at every differential stage of compression. Reversible and frictionless.
              </li>
              <li>
                <em>Isentropic:</em> Thermally isolated compressor walls (<MathFormula math="q = 0" />) with zero fluid friction, turbulence, or mechanical dissipation (<MathFormula math="S_{\text{gen}} = 0" />).
              </li>
            </ul>
            <p className="mt-2">
              <strong>Thermodynamic Proof that Isothermal Work is the Lower Bound:</strong>
              <br />
              On a pressure-volume (<MathFormula math="p-v" />) indicator diagram, steady-flow shaft work is represented by the horizontal area to the left of the process curve:
            </p>
            <MathFormula math="w = \int_{p_1}^{p_3} v \, dp" block />
            <p>
              For any given intermediate pressure <MathFormula math="p" /> between <MathFormula math="p_1" /> and <MathFormula math="p_3" />:
            </p>
            <MathFormula math="v_{\text{iso}}(p) = \frac{R T_1}{p} \quad \text{vs.} \quad v_{\text{s}}(p) = \frac{R T_s(p)}{p}" block />
            <p>
              In an adiabatic process, compression heating drives the temperature above <MathFormula math="T_1" /> (<MathFormula math="T_s(p) > T_1" /> for all <MathFormula math="p > p_1" />). Consequently:
            </p>
            <MathFormula math="v_{\text{s}}(p) > v_{\text{iso}}(p) \quad \forall \; p > p_1" block />
            <p>
              Because the integrand <MathFormula math="v(p)" /> is strictly smaller at every pressure for the isothermal path, its integral is strictly minimized:
            </p>
            <MathFormula math="w_{\text{iso}} \le w_s \le w_{\text{actual}}" block />
            <p className="text-emerald-300 text-xs font-mono">
              Q.E.D. Isothermal compression represents the absolute minimum possible work input required to compress an ideal gas between two specified pressure levels.
            </p>
          </div>
        </div>
      </section>

      {/* TASK 2: PRACTICAL SINGLE STAGE COMPRESSOR */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wider">
          <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs text-cyan-300">
            2
          </span>
          <h3>Task 2: Practical Single Stage Compressor Model</h3>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 text-sm leading-relaxed text-slate-300">
          <div>
            <p>
              For an actual adiabatic stage with isentropic efficiency <MathFormula math="\eta_s = 0.78" /> and pressure ratio <MathFormula math="r = p_3 / p_1 = 800 / 100 = 8.0" />:
            </p>
            <MathFormula math="T_{\text{out},s} = T_1 \cdot r^{\frac{\gamma - 1}{\gamma}} = 298.0 \times 8.0^{\frac{0.4}{1.4}} = 298.0 \times 1.8114 = 539.81 \text{ K}" block />
            <MathFormula math="T_{\text{out}} = T_1 + \frac{T_{\text{out},s} - T_1}{\eta_s} = 298.0 + \frac{539.81 - 298.0}{0.78} = 298.0 + 309.96 = 607.96 \text{ K}" block />
            <p>Specific work, shaft power, and motor input:</p>
            <MathFormula math="w = c_p (T_{\text{out}} - T_1) = 1.005 \times (607.96 - 298.0) = 311.51 \text{ kJ/kg}" block />
            <MathFormula math="P_{\text{shaft}} = \dot{m} w = 0.060 \times 311.51 = 18.69 \text{ kW}" block />
            <MathFormula math="P_{\text{motor}} = \frac{P_{\text{shaft}}}{\eta_m} = \frac{18.69}{0.90} = 20.77 \text{ kW} \le 22.0 \text{ kW} \quad \text{[Motor: PASS]}" block />
            <p className="mt-2">
              Second Law Entropy Generation Rate:
            </p>
            <MathFormula math="\dot{S}_{\text{gen}} = \dot{m}\left[ c_p \ln\left(\frac{T_{\text{out}}}{T_1}\right) - R \ln(r) \right] = 0.060 \times \left[ 1.005 \ln\left(\frac{608.0}{298.0}\right) - 0.287 \ln(8.0) \right] = 0.0072 \text{ kW/K} \ge 0" block />
            <div className="p-3 bg-rose-950/30 border border-rose-800/80 rounded-lg text-rose-200 mt-2">
              <strong>Fatal Single-Stage Failure:</strong> While motor electrical input (20.77 kW) complies with the 22 kW rating, the discharge temperature of <strong className="text-white">608.0 K (334.8°C)</strong> dramatically exceeds the <strong className="text-white">500.0 K (226.9°C)</strong> equipment constraint by +108.0 K. This renders the single stage completely infeasible.
            </div>
          </div>
        </div>
      </section>

      {/* TASK 3: TWO STAGE OPTIMIZATION & INTERMEDIATE PRESSURE */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 font-mono uppercase tracking-wider">
          <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs text-cyan-300">
            3
          </span>
          <h3>Task 3: Staged Compression &amp; Intermediate Pressure Proof</h3>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 text-sm leading-relaxed text-slate-300">
          <div>
            <h4 className="font-semibold text-white text-base">
              3.1 Analytical Derivation of Optimal Intermediate Pressure
            </h4>
            <p className="mt-1">
              Let <MathFormula math="m = \frac{\gamma - 1}{\gamma}" /> (for air with <MathFormula math="\gamma = 1.4" />, <MathFormula math="m = \frac{0.4}{1.4} = \frac{2}{7}" />).
              Total specific work for two stages with intercooler outlet temperature <MathFormula math="T_3" /> is:
            </p>
            <MathFormula math="w_{\text{total}}(p_2) = w_1(p_2) + w_2(p_2) = \frac{c_p}{\eta_s} \left[ T_1 \left(\frac{p_2}{p_1}\right)^m - T_1 + T_3 \left(\frac{p_3}{p_2}\right)^m - T_3 \right]" block />
            <p>
              To find the intermediate pressure <MathFormula math="p_2" /> that minimizes total compressor work, we differentiate with respect to <MathFormula math="p_2" /> and set the derivative to zero:
            </p>
            <MathFormula math="\frac{d w_{\text{total}}}{d p_2} = \frac{c_p}{\eta_s} \left[ m T_1 p_1^{-m} p_2^{m-1} - m T_3 p_3^m p_2^{-m-1} \right] = 0" block />
            <p>Dividing by <MathFormula math="\frac{c_p m}{\eta_s}" />:</p>
            <MathFormula math="T_1 p_1^{-m} p_2^{m-1} = T_3 p_3^m p_2^{-m-1}" block />
            <p>Multiplying both sides by <MathFormula math="p_2^{m+1} p_1^m" />:</p>
            <MathFormula math="T_1 p_2^{2m} = T_3 (p_1 p_3)^m \implies p_2^{2m} = \left(\frac{T_3}{T_1}\right) (p_1 p_3)^m" block />
            <p>Taking the <MathFormula math="\frac{1}{2m}" /> power of both sides:</p>
            <MathFormula math="p_2^* = \sqrt{p_1 p_3} \cdot \left(\frac{T_3}{T_1}\right)^{\frac{1}{2m}} = \sqrt{p_1 p_3} \cdot \left(\frac{T_3}{T_1}\right)^{\frac{\gamma}{2(\gamma - 1)}}" block />
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h4 className="font-semibold text-white text-base">
              3.2 Case Comparison: Perfect Intercooling vs. Practical Offset
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-xs font-mono text-cyan-300 font-bold block">Case A: T₃ = T₁ (Perfect Intercooling)</span>
                <p className="mt-1 text-xs text-slate-300">
                  When <MathFormula math="T_3 = T_1" />, the temperature ratio is <MathFormula math="\frac{T_3}{T_1} = 1" />, yielding the classic textbook result:
                </p>
                <MathFormula math="p_2^* = \sqrt{p_1 p_3} = \sqrt{100 \times 800} = 282.84 \text{ kPa}" block />
                <p className="text-[11px] text-slate-400 mt-1">Stage pressure ratios are identical: r₁ = r₂ = √8 = 2.828.</p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-xs font-mono text-cyan-300 font-bold block">Case B: T₃ = 303 K, T₁ = 298 K (Actual Lab Spec)</span>
                <p className="mt-1 text-xs text-slate-300">
                  Because the intercooler coolant reservoir is at <MathFormula math="T_c = 293 \text{ K}" />, heat exchanger pinches limit air cooling to <MathFormula math="T_3 = 303 \text{ K}" /> (<MathFormula math="> T_1" />):
                </p>
                <MathFormula math="p_2^* = 282.84 \times \left(\frac{303}{298}\right)^{1.75} = 282.84 \times 1.0296 = 291.22 \text{ kPa}" block />
                <p className="text-[11px] text-slate-400 mt-1">
                  Optimum shifts +8.38 kPa higher to make stage 1 do slightly more work on cooler air!
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h4 className="font-semibold text-white text-base">
              3.3 Cooler Entropy Generation Formulation
            </h4>
            <p className="mt-1">
              For heat rejected to a large isothermal coolant reservoir at <MathFormula math="T_c = 293.0 \text{ K}" />:
            </p>
            <MathFormula math="\dot{S}_{\text{gen,cool}} = \dot{m} c_p \ln\left(\frac{T_{\text{out}}}{T_{\text{in}}}\right) + \frac{\dot{Q}_{\text{out}}}{T_c} \ge 0" block />
            <p className="mt-1">
              Evaluating at base case conditions:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1 font-mono">
              <li>
                Intercooler: cools from T₂ = 431.1 K to T₃ = 303.0 K, Q̇_inter = 7.72 kW.
                Ṡ_gen,inter = 0.060×1.005×ln(303/431.1) + 7.72/293 = -0.0212 + 0.0264 = +0.0051 kW/K (≥ 0 verified!).
              </li>
              <li>
                Aftercooler: cools from T₄ = 423.9 K to 310.0 K, Q̇_after = 6.87 kW.
                Ṡ_gen,after = 0.060×1.005×ln(310/423.9) + 6.87/293 = -0.0189 + 0.0234 = +0.0045 kW/K (≥ 0 verified!).
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FINAL RECOMMENDATION */}
      <div className="p-4 bg-cyan-950/40 border border-cyan-800 rounded-xl text-slate-200">
        <div className="flex items-center gap-2 text-cyan-300 font-semibold font-mono text-sm uppercase">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>Final Engineering Defense for Karatina University</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          The single-stage compressor is definitively disqualified due to severe thermal violation (T_out = 608 K vs 500 K max). The two-stage system with intermediate pressure p₂* = 291.2 kPa represents the optimal thermodynamic configuration: it guarantees discharge temperatures remain under 432 K in both stages, operates well within the 22 kW motor rating (17.85 kW vs 22 kW limit), saves 5,840 kWh of electricity per year, and passes 5,000-sample uncertainty stress tests with a &gt;95% feasibility margin.
        </p>
      </div>
    </div>
  );
};
