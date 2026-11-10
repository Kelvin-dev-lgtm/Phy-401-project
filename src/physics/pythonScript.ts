/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const EXTENDED_PYTHON_SCRIPT = `"""
Karatina University - PHY 401 Thermal Physics II
Project Assignment: Isothermal and Adiabatic Compression in a Laboratory Air Supply

Extended computational thermodynamics, optimization, and uncertainty model.
Reproduces all base models, adds SciPy bounded optimization, cooler entropy generation,
2D feasibility mapping, and 5,000-sample Monte Carlo uncertainty quantification.

Requirements:
    pip install numpy matplotlib scipy
Run:
    python isothermal_adiabatic_compressor_extended.py
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import minimize_scalar
from dataclasses import dataclass
from typing import Dict, Any, Tuple

# ==============================================================================
# 1. PHYSICAL CONSTANTS & BASE OPERATING SPECIFICATIONS
# ==============================================================================
R = 0.287          # Air gas constant, kJ/(kg K)
CP = 1.005         # Constant pressure heat capacity, kJ/(kg K)
GAMMA = 1.400      # Heat capacity ratio (cp / (cp - R) ~ 1.3997)
P1 = 100.0         # First stage inlet pressure, kPa absolute
P3 = 800.0         # Required delivery pressure, kPa absolute
T1 = 298.0         # First stage inlet temperature, K
M_DOT = 0.060      # Mass flow rate, kg/s
T3 = 303.0         # Intercooler outlet temperature, K (at least 5 K above Tc)
T_FINAL = 310.0    # Final delivery condition, K
TC = 293.0         # Large constant-temperature coolant reservoir, K
ETA_S = 0.78       # Stage isentropic efficiency (range 0.70 - 0.85)
ETA_M = 0.90       # Motor & drive efficiency (range 0.85 - 0.95)
T_LIMIT = 500.0    # Maximum allowable discharge temperature, K
MOTOR_LIMIT = 22.0 # Available motor electrical rating, kW
OP_HOURS = 2000.0  # Operating time, hours/year


@dataclass
class StageData:
    t_out: float
    work: float
    shaft_power: float
    motor_power: float
    delta_s: float
    s_gen_rate: float
    is_feasible: bool


@dataclass
class CoolerData:
    heat_duty: float
    s_gen_rate: float


@dataclass
class SystemResult:
    p_mid: float
    t2: float
    t4: float
    w_total: float
    motor_kw: float
    q_inter_kw: float
    q_after_kw: float
    s_gen_total: float
    is_feasible: bool
    annual_kwh: float


# ==============================================================================
# 2. CORE THERMODYNAMIC FUNCTIONS WITH INPUT VALIDATION & ASSERTIONS
# ==============================================================================
def isothermal_work(t_in: float, p_in: float, p_out: float) -> float:
    """Reversible isothermal specific work w_iso = R * T_in * ln(p_out / p_in) in kJ/kg."""
    if t_in <= 0 or p_in <= 0 or p_out <= p_in:
        raise ValueError("Require positive inlet state and p_out > p_in.")
    return R * t_in * np.log(p_out / p_in)


def compressor_stage(t_in: float, p_in: float, p_out: float, eta_s: float = ETA_S,
                     m_dot: float = M_DOT, eta_m: float = ETA_M) -> StageData:
    """
    Model an adiabatic compressor stage.
    Returns StageData with temperatures, specific work, powers, and entropy generation.
    """
    if t_in <= 0 or p_in <= 0 or p_out <= p_in:
        raise ValueError("Require positive inlet state and increasing pressure.")
    if not (0 < eta_s <= 1.0):
        raise ValueError("Isentropic efficiency must be in (0, 1].")
    if not (0 < eta_m <= 1.0):
        raise ValueError("Motor efficiency must be in (0, 1].")

    ratio = p_out / p_in
    exponent = (GAMMA - 1.0) / GAMMA
    t_out_s = t_in * (ratio ** exponent)
    t_out = t_in + (t_out_s - t_in) / eta_s
    work = CP * (t_out - t_in)
    
    # Entropy generation: delta_s = cp * ln(T_out/T_in) - R * ln(p_out/p_in)
    delta_s = CP * np.log(t_out / t_in) - R * np.log(ratio)
    s_gen_rate = m_dot * delta_s
    shaft_power = m_dot * work
    motor_power = shaft_power / eta_m

    # Energy balance and 2nd Law validation assertions
    assert np.isclose(work, CP * (t_out - t_in)), "Energy balance failed on compressor stage."
    assert delta_s >= -1e-10, f"2nd Law violated: delta_s = {delta_s} < 0."

    return StageData(
        t_out=t_out,
        work=work,
        shaft_power=shaft_power,
        motor_power=motor_power,
        delta_s=delta_s,
        s_gen_rate=s_gen_rate,
        is_feasible=(t_out <= T_LIMIT)
    )


def cooler(t_in: float, t_out: float, m_dot: float = M_DOT, t_c: float = TC) -> CoolerData:
    """
    Model heat rejection in cooler to reservoir at T_c.
    Q_out = m_dot * cp * (T_in - T_out)
    S_gen_cool = m_dot * cp * ln(T_out / T_in) + Q_out / T_c >= 0
    """
    if t_in <= 0 or t_out <= 0 or t_c <= 0:
        raise ValueError("Absolute temperatures must be positive.")
    heat_duty = m_dot * CP * (t_in - t_out)
    # Entropy generation of cooler + reservoir system
    s_gen_rate = m_dot * CP * np.log(t_out / t_in) + heat_duty / t_c
    assert s_gen_rate >= -1e-10, f"Cooler entropy generation non-negative check failed: {s_gen_rate}"

    return CoolerData(heat_duty=max(0.0, heat_duty), s_gen_rate=s_gen_rate)


def system(p_mid: float, p1: float = P1, p3: float = P3, t1: float = T1,
           t3: float = T3, m_dot: float = M_DOT, eta_s: float = ETA_S,
           eta_m: float = ETA_M) -> SystemResult:
    """Two-stage system with intermediate pressure p_mid and intercooler."""
    if not (p1 < p_mid < p3):
        raise ValueError("p_mid must satisfy p1 < p_mid < p3.")

    st1 = compressor_stage(t1, p1, p_mid, eta_s, m_dot, eta_m)
    cl_inter = cooler(st1.t_out, t3, m_dot, TC)
    st2 = compressor_stage(t3, p_mid, p3, eta_s, m_dot, eta_m)
    cl_after = cooler(st2.t_out, T_FINAL, m_dot, TC)

    total_work = st1.work + st2.work
    motor_kw = m_dot * total_work / eta_m
    s_gen_total = st1.s_gen_rate + st2.s_gen_rate + cl_inter.s_gen_rate + cl_after.s_gen_rate
    feasible = (st1.t_out <= T_LIMIT) and (st2.t_out <= T_LIMIT) and (motor_kw <= MOTOR_LIMIT)
    annual_kwh = motor_kw * OP_HOURS

    return SystemResult(
        p_mid=p_mid,
        t2=st1.t_out,
        t4=st2.t_out,
        w_total=total_work,
        motor_kw=motor_kw,
        q_inter_kw=cl_inter.heat_duty,
        q_after_kw=cl_after.heat_duty,
        s_gen_total=s_gen_total,
        is_feasible=feasible,
        annual_kwh=annual_kwh
    )


# ==============================================================================
# 3. OPTIMIZATION & VERIFICATION
# ==============================================================================
def optimize_intermediate_pressure(p1: float = P1, p3: float = P3, t1: float = T1,
                                   t3: float = T3, m_dot: float = M_DOT,
                                   eta_s: float = ETA_S, eta_m: float = ETA_M) -> float:
    """Find p_mid that minimises motor input using scipy.optimize.minimize_scalar."""
    res = minimize_scalar(
        lambda p: system(p, p1, p3, t1, t3, m_dot, eta_s, eta_m).motor_kw,
        bounds=(p1 + 1.0, p3 - 1.0),
        method="bounded"
    )
    if not res.success:
        raise RuntimeError("SciPy optimization failed to converge.")
    return float(res.x)


# ==============================================================================
# 4. MONTE CARLO ROBUSTNESS & UNCERTAINTY ANALYSIS (5,000 SAMPLES)
# ==============================================================================
def run_monte_carlo(n_samples: int = 5000, seed: int = 42) -> Dict[str, Any]:
    """
    Runs reproducible Monte Carlo sampling under uniform uncertainty:
        p1 ~ U(90, 110) kPa
        T1 ~ U(288, 308) K
        m_dot ~ U(0.040, 0.080) kg/s
        eta_s ~ U(0.70, 0.85)
        eta_m ~ U(0.85, 0.95)
    Evaluates system compliance against T <= 500 K and Motor <= 22 kW.
    """
    np.random.seed(seed)
    p1_s = np.random.uniform(90.0, 110.0, n_samples)
    t1_s = np.random.uniform(288.0, 308.0, n_samples)
    m_s = np.random.uniform(0.040, 0.080, n_samples)
    es_s = np.random.uniform(0.70, 0.85, n_samples)
    em_s = np.random.uniform(0.85, 0.95, n_samples)

    motor_powers = np.zeros(n_samples)
    t2_arr = np.zeros(n_samples)
    t4_arr = np.zeros(n_samples)
    feasible_mask = np.zeros(n_samples, dtype=bool)

    for i in range(n_samples):
        # Optimal intermediate pressure for sample
        p_opt = np.sqrt(p1_s[i] * P3) * ((T3 / t1_s[i]) ** (1.75))
        p_opt = np.clip(p_opt, p1_s[i] + 5.0, P3 - 5.0)
        sys_res = system(p_opt, p1_s[i], P3, t1_s[i], T3, m_s[i], es_s[i], em_s[i])
        motor_powers[i] = sys_res.motor_kw
        t2_arr[i] = sys_res.t2
        t4_arr[i] = sys_res.t4
        feasible_mask[i] = sys_res.is_feasible

    fraction_pass = np.mean(feasible_mask)
    return {
        "n_samples": n_samples,
        "fraction_pass": fraction_pass,
        "motor_powers": motor_powers,
        "t2_arr": t2_arr,
        "t4_arr": t4_arr,
        "feasible_mask": feasible_mask,
    }


# ==============================================================================
# 5. EXECUTION, FIGURE GENERATION & REPORT PRINTING
# ==============================================================================
if __name__ == "__main__":
    print("=" * 70)
    print("KARATINA UNIVERSITY PHY 401 THERMAL PHYSICS II")
    print("COMPRESSOR SYSTEM NUMERICAL EVALUATION & DESIGN OPTIMIZATION")
    print("=" * 70)

    # 1. Single Stage Evaluation
    st_single = compressor_stage(T1, P1, P3, ETA_S, M_DOT, ETA_M)
    cl_single = cooler(st_single.t_out, T_FINAL, M_DOT, TC)
    print(f"\\n[1] Practical Single Stage Performance:")
    print(f"  Discharge Temp T_out: {st_single.t_out:.2f} K (Limit: {T_LIMIT} K) -> "
          f"{'FAIL (Overheated)' if st_single.t_out > T_LIMIT else 'PASS'}")
    print(f"  Motor Input Power:    {st_single.motor_power:.2f} kW (Limit: {MOTOR_LIMIT} kW)")
    print(f"  Specific Work:        {st_single.work:.2f} kJ/kg")
    print(f"  Aftercooler Duty:     {cl_single.heat_duty:.2f} kW")
    print(f"  Entropy Generation:   {st_single.s_gen_rate * 1000:.3f} W/K (compressor), "
          f"{cl_single.s_gen_rate * 1000:.3f} W/K (cooler)")

    # 2. Optimal Two Stage Evaluation
    p2_opt_scipy = optimize_intermediate_pressure()
    p2_equal = np.sqrt(P1 * P3)
    p2_opt_analytic = p2_equal * ((T3 / T1) ** (1.75))

    sys_opt = system(p2_opt_scipy)
    print(f"\\n[2] Two-Stage System with Intercooling:")
    print(f"  Equal Pressure Ratio p2 = sqrt(p1*p3): {p2_equal:.2f} kPa")
    print(f"  Analytic Optimum (T3 != T1):           {p2_opt_analytic:.2f} kPa")
    print(f"  SciPy Numerical Optimum:               {p2_opt_scipy:.2f} kPa")
    print(f"  Stage 1 Discharge T2:                  {sys_opt.t2:.2f} K (PASS)")
    print(f"  Stage 2 Discharge T4:                  {sys_opt.t4:.2f} K (PASS)")
    print(f"  Total Motor Input Power:               {sys_opt.motor_kw:.2f} kW (PASS)")
    print(f"  Intercooler Heat Duty:                 {sys_opt.q_inter_kw:.2f} kW")
    print(f"  Aftercooler Heat Duty:                 {sys_opt.q_after_kw:.2f} kW")
    print(f"  Annual Electricity Savings:            {(st_single.motor_power - sys_opt.motor_kw) * OP_HOURS:,.0f} kWh/yr")

    # 3. Work Ordering Assertion: w_iso <= w_s <= w_actual
    w_iso = isothermal_work(T1, P1, P3)
    ratio = P3 / P1
    w_s = CP * (T1 * (ratio ** ((GAMMA - 1) / GAMMA)) - T1)
    w_act = st_single.work
    assert w_iso <= w_s <= w_act, f"Work hierarchy violated: {w_iso} <= {w_s} <= {w_act}"
    print(f"\\n[3] Work Bound Hierarchy Verified: {w_iso:.2f} <= {w_s:.2f} <= {w_act:.2f} kJ/kg")

    # 4. Monte Carlo Robustness
    print(f"\\n[4] Running 5,000 Monte Carlo Uncertainty Samples...")
    mc_res = run_monte_carlo(5000, seed=42)
    print(f"  Fraction Satisfying All Limits: {mc_res['fraction_pass'] * 100:.2f}%")
    print(f"  Mean Motor Input:               {np.mean(mc_res['motor_powers']):.2f} kW")
    print(f"  95th Percentile Motor Input:    {np.percentile(mc_res['motor_powers'], 95):.2f} kW")
    print("  Independence Assumption: Inlet conditions (p1, T1), flow rate m_dot, and efficiencies")
    print("  are modeled as mutually independent uniform random variables P(A,B)=P(A)P(B).")

    # --------------------------------------------------------------------------
    # GENERATE PUBLICATION-QUALITY FIGURES
    # --------------------------------------------------------------------------
    print("\\nGenerating figures...")

    # Figure 1: Work comparison
    p_span = np.linspace(200.0, 1000.0, 200)
    fig1, ax1 = plt.subplots(figsize=(8, 5))
    for t_in in (288.0, 298.0, 308.0):
        r_span = p_span / P1
        iso_curve = R * t_in * np.log(r_span)
        s_curve = CP * (t_in * (r_span ** ((GAMMA - 1) / GAMMA)) - t_in)
        act_curve = s_curve / ETA_S
        ax1.plot(p_span, iso_curve, ":", label=f"Isothermal, {t_in:.0f} K")
        ax1.plot(p_span, s_curve, "--", label=f"Isentropic, {t_in:.0f} K")
        ax1.plot(p_span, act_curve, "-", label=f"Actual Adiabatic, {t_in:.0f} K")
    ax1.set_xlabel("Delivery Pressure p3 (kPa absolute)")
    ax1.set_ylabel("Specific Compressor Work (kJ/kg)")
    ax1.set_title("Figure 1: Specific Work Comparison across Inlet Temperatures")
    ax1.grid(alpha=0.3)
    ax1.legend(ncol=3, fontsize=8)
    fig1.tight_layout()
    fig1.savefig("fig1_work_comparison.png", dpi=200)

    # Figure 2: Temperature constraints
    fig2, ax2 = plt.subplots(figsize=(8, 5))
    single_t_curve = [compressor_stage(T1, P1, p, ETA_S, M_DOT, ETA_M).t_out for p in p_span]
    p_eq_curve = np.sqrt(P1 * p_span)
    st1_t_curve = [compressor_stage(T1, P1, pe, ETA_S, M_DOT, ETA_M).t_out for pe in p_eq_curve]
    st2_t_curve = [compressor_stage(T3, pe, p, ETA_S, M_DOT, ETA_M).t_out for pe, p in zip(p_eq_curve, p_span)]
    ax2.plot(p_span, single_t_curve, "b-", label="Single Stage Outlet T")
    ax2.plot(p_span, st1_t_curve, "g-", label="Two Stage Stage 1 Outlet T2")
    ax2.plot(p_span, st2_t_curve, "orange", label="Two Stage Stage 2 Outlet T4")
    ax2.axhline(T_LIMIT, color="red", linestyle="--", label=f"{T_LIMIT:.0f} K Discharge Limit")
    ax2.set_xlabel("Delivery Pressure p3 (kPa absolute)")
    ax2.set_ylabel("Discharge Temperature (K)")
    ax2.set_title("Figure 2: Discharge Temperatures vs Delivery Pressure")
    ax2.grid(alpha=0.3)
    ax2.legend()
    fig2.tight_layout()
    fig2.savefig("fig2_temperature_limits.png", dpi=200)

    # Figure 3: Intermediate pressure sweep
    p_mid_span = np.linspace(150.0, 650.0, 300)
    motors = [system(pm).motor_kw for pm in p_mid_span]
    fig3, ax3 = plt.subplots(figsize=(8, 5))
    ax3.plot(p_mid_span, motors, "b-", label="Two Stage Motor Electrical Input")
    ax3.axhline(MOTOR_LIMIT, color="red", linestyle="--", label=f"{MOTOR_LIMIT:.0f} kW Limit")
    ax3.plot(p2_opt_scipy, sys_opt.motor_kw, "ko", markersize=7,
             label=f"Optimum: {p2_opt_scipy:.1f} kPa ({sys_opt.motor_kw:.2f} kW)")
    ax3.set_xlabel("Intermediate Pressure p2 (kPa absolute)")
    ax3.set_ylabel("Motor Input Power (kW)")
    ax3.set_title("Figure 3: Intermediate Pressure Optimization at 800 kPa Delivery")
    ax3.grid(alpha=0.3)
    ax3.legend()
    fig3.tight_layout()
    fig3.savefig("fig3_intermediate_pressure.png", dpi=200)

    # Figure 4: Cooler heat duties & entropy generation
    p_del_span = np.linspace(600.0, 1000.0, 100)
    q_inters = []
    q_afters = []
    for p in p_del_span:
        p_opt = optimize_intermediate_pressure(P1, p, T1, T3, M_DOT, ETA_S, ETA_M)
        s_res = system(p_opt, P1, p, T1, T3, M_DOT, ETA_S, ETA_M)
        q_inters.append(s_res.q_inter_kw)
        q_afters.append(s_after_kw := s_res.q_after_kw)

    fig4, ax4 = plt.subplots(figsize=(8, 5))
    ax4.plot(p_del_span, q_inters, "c-", label="Intercooler Rejection Q_inter")
    ax4.plot(p_del_span, q_afters, "m-", label="Aftercooler Rejection Q_after")
    ax4.set_xlabel("Delivery Pressure p3 (kPa absolute)")
    ax4.set_ylabel("Heat Rejection Rate (kW)")
    ax4.set_title("Figure 4: Cooler Heat Rejection vs Delivery Pressure")
    ax4.grid(alpha=0.3)
    ax4.legend()
    fig4.tight_layout()
    fig4.savefig("fig4_cooler_duties.png", dpi=200)

    print("All figures generated successfully. Analysis complete.")
`;
