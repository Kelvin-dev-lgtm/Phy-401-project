/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CompressorParameters,
  CoolerResult,
  SingleStageResult,
  StageResult,
  TwoStageResult,
} from '../types/compressor';

export const BASE_PARAMETERS: CompressorParameters = {
  p1: 100.0,      // kPa absolute
  p3: 800.0,      // kPa absolute
  t1: 298.0,      // K
  mDot: 0.060,    // kg/s
  t3: 303.0,      // K
  tFinal: 310.0,  // K
  tc: 293.0,      // K
  r: 0.287,       // kJ/(kg K)
  cp: 1.005,      // kJ/(kg K)
  gamma: 1.400,   // dimensionless
  etaS: 0.78,     // dimensionless
  etaM: 0.90,     // dimensionless
  tLimit: 500.0,  // K
  motorLimit: 22.0, // kW
  opHours: 2000.0, // h/year
};

/**
 * Reversible isothermal specific work:
 * w_iso = R * T_in * ln(p_out / p_in)
 */
export function isothermalWork(tIn: number, pIn: number, pOut: number, R: number): number {
  if (tIn <= 0 || pIn <= 0 || pOut <= pIn) {
    throw new Error('Require positive inlet state and p_out > p_in.');
  }
  return R * tIn * Math.log(pOut / pIn);
}

/**
 * Single compressor stage evaluation (isentropic and practical adiabatic).
 */
export function compressorStage(
  tIn: number,
  pIn: number,
  pOut: number,
  etaS: number,
  mDot: number,
  etaM: number,
  params: CompressorParameters
): StageResult {
  if (tIn <= 0 || pIn <= 0 || pOut <= pIn) {
    throw new Error('Require positive absolute temperature and pressure ratio > 1.');
  }
  if (etaS <= 0 || etaS > 1.0) {
    throw new Error('Isentropic efficiency must be in (0, 1].');
  }
  if (etaM <= 0 || etaM > 1.0) {
    throw new Error('Motor efficiency must be in (0, 1].');
  }

  const { r: R, cp: CP, gamma: GAMMA, tLimit } = params;
  const pressureRatio = pOut / pIn;
  const exponent = (GAMMA - 1.0) / GAMMA; // 0.285714 for gamma=1.4

  // Isentropic outlet temperature
  const tOutS = tIn * Math.pow(pressureRatio, exponent);
  // Practical adiabatic outlet temperature
  const tOut = tIn + (tOutS - tIn) / etaS;

  // Specific work
  const workS = CP * (tOutS - tIn);
  const workActual = CP * (tOut - tIn);
  const workIso = isothermalWork(tIn, pIn, pOut, R);

  // Shaft and motor input power
  const shaftPower = mDot * workActual;
  const motorPower = shaftPower / etaM;

  // Entropy generation rate per kg: delta_s = cp * ln(T_out / T_in) - R * ln(p_out / p_in)
  const deltaS = CP * Math.log(tOut / tIn) - R * Math.log(pressureRatio);
  // Total rate of entropy generation: S_gen_comp = m_dot * delta_s
  const sGenComp = mDot * deltaS;

  return {
    pIn,
    pOut,
    tIn,
    tOutS,
    tOut,
    pressureRatio,
    workS,
    workActual,
    workIso,
    shaftPower,
    motorPower,
    deltaS,
    sGenComp,
    isFeasibleTemp: tOut <= tLimit,
  };
}

/**
 * Cooler evaluation (intercooler or aftercooler).
 * Q_out = m_dot * cp * (T_in - T_out)
 * S_gen_cool = m_dot * cp * ln(T_out / T_in) + Q_out / Tc
 */
export function cooler(
  tIn: number,
  tOut: number,
  mDot: number,
  tc: number,
  cp: number
): CoolerResult {
  if (tIn <= 0 || tOut <= 0 || tc <= 0) {
    throw new Error('Absolute temperatures must be positive.');
  }
  const heatDuty = mDot * cp * (tIn - tOut);
  // S_gen_cool = m_dot * cp * ln(T_out / T_in) + Q_out / Tc
  const sGenCooler = mDot * cp * Math.log(tOut / tIn) + heatDuty / tc;

  return {
    tIn,
    tOut,
    heatDuty: Math.max(0, heatDuty),
    sGenCooler,
  };
}

/**
 * Model practical single stage compressor from p1 to p3.
 */
export function evaluateSingleStage(params: CompressorParameters): SingleStageResult {
  const stage = compressorStage(
    params.t1,
    params.p1,
    params.p3,
    params.etaS,
    params.mDot,
    params.etaM,
    params
  );

  const aftercooler = cooler(
    stage.tOut,
    params.tFinal,
    params.mDot,
    params.tc,
    params.cp
  );

  const motorInputKw = stage.motorPower;
  const annualEnergyKwh = motorInputKw * params.opHours;

  const tempFeasible = stage.tOut <= params.tLimit;
  const motorFeasible = motorInputKw <= params.motorLimit;
  const isFeasible = tempFeasible && motorFeasible;

  return {
    stage,
    aftercooler,
    motorInputKw,
    annualEnergyKwh,
    isFeasible,
    tempFeasible,
    motorFeasible,
  };
}

/**
 * Model two-stage compressor with intermediate pressure pMid.
 */
export function evaluateTwoStage(
  pMid: number,
  params: CompressorParameters
): TwoStageResult {
  if (pMid <= params.p1 || pMid >= params.p3) {
    throw new Error('Intermediate pressure p_mid must satisfy p1 < p_mid < p3.');
  }

  // Stage 1: p1 -> pMid at T1
  const stage1 = compressorStage(
    params.t1,
    params.p1,
    pMid,
    params.etaS,
    params.mDot,
    params.etaM,
    params
  );

  // Intercooler: cools stage 1 discharge (T2) down to T3
  const intercooler = cooler(
    stage1.tOut,
    params.t3,
    params.mDot,
    params.tc,
    params.cp
  );

  // Stage 2: pMid -> p3 at T3
  const stage2 = compressorStage(
    params.t3,
    pMid,
    params.p3,
    params.etaS,
    params.mDot,
    params.etaM,
    params
  );

  // Aftercooler: cools stage 2 discharge (T4) down to delivery temperature 310 K
  const aftercooler = cooler(
    stage2.tOut,
    params.tFinal,
    params.mDot,
    params.tc,
    params.cp
  );

  const totalWorkActual = stage1.workActual + stage2.workActual;
  const totalShaftPower = params.mDot * totalWorkActual;
  const motorInputKw = totalShaftPower / params.etaM;
  const totalHeatRejected = intercooler.heatDuty + aftercooler.heatDuty;
  const totalEntropyGen =
    stage1.sGenComp +
    stage2.sGenComp +
    intercooler.sGenCooler +
    aftercooler.sGenCooler;

  const annualEnergyKwh = motorInputKw * params.opHours;
  const single = evaluateSingleStage(params);
  const annualEnergySavedKwh = Math.max(0, single.annualEnergyKwh - annualEnergyKwh);

  const temp1Feasible = stage1.tOut <= params.tLimit;
  const temp2Feasible = stage2.tOut <= params.tLimit;
  const motorFeasible = motorInputKw <= params.motorLimit;
  const isFeasible = temp1Feasible && temp2Feasible && motorFeasible;

  const pEqual = Math.sqrt(params.p1 * params.p3);

  return {
    pMid,
    pEqual,
    stage1,
    intercooler,
    stage2,
    aftercooler,
    totalWorkActual,
    totalShaftPower,
    motorInputKw,
    totalHeatRejected,
    totalEntropyGen,
    annualEnergyKwh,
    annualEnergySavedKwh,
    isFeasible,
    temp1Feasible,
    temp2Feasible,
    motorFeasible,
  };
}

/**
 * Analytical optimal intermediate pressure when T3 != T1:
 * p_mid* = sqrt(p1 * p3) * (T3 / T1)^( gamma / (2 * (gamma - 1)) )
 */
export function analyticalOptimalIntermediatePressure(params: CompressorParameters): number {
  const pEqual = Math.sqrt(params.p1 * params.p3);
  const exponent = params.gamma / (2.0 * (params.gamma - 1.0)); // 1.4 / 0.8 = 1.75
  const tempRatio = params.t3 / params.t1;
  return pEqual * Math.pow(tempRatio, exponent);
}

/**
 * Numerically find optimal intermediate pressure minimizing motor input:
 * Uses bounded golden-section search between p1 and p3.
 */
export function findOptimalIntermediatePressure(
  params: CompressorParameters,
  tolerance: number = 0.01
): { pMidOpt: number; minMotorKw: number; result: TwoStageResult } {
  let a = params.p1 + 1.0;
  let b = params.p3 - 1.0;
  const phi = (1 + Math.sqrt(5)) / 2;
  const resphi = 2 - phi;

  let x1 = a + resphi * (b - a);
  let x2 = b - resphi * (b - a);
  let f1 = evaluateTwoStage(x1, params).motorInputKw;
  let f2 = evaluateTwoStage(x2, params).motorInputKw;

  while (Math.abs(b - a) > tolerance) {
    if (f1 < f2) {
      b = x2;
      x2 = x1;
      f2 = f1;
      x1 = a + resphi * (b - a);
      f1 = evaluateTwoStage(x1, params).motorInputKw;
    } else {
      a = x1;
      x1 = x2;
      f1 = f2;
      x2 = b - resphi * (b - a);
      f2 = evaluateTwoStage(x2, params).motorInputKw;
    }
  }

  const pMidOpt = (a + b) / 2;
  const result = evaluateTwoStage(pMidOpt, params);
  return { pMidOpt, minMotorKw: result.motorInputKw, result };
}

/**
 * Sweep intermediate pressure p2 over 150-650 kPa for Figure 3.
 */
export function generateIntermediatePressureSweep(
  params: CompressorParameters,
  steps: number = 100
): {
  pMid: number;
  motorKw: number;
  t2: number;
  t4: number;
  qInter: number;
  qAfter: number;
  feasible: boolean;
}[] {
  const minP = Math.max(params.p1 + 5, 150.0);
  const maxP = Math.min(params.p3 - 5, 650.0);
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const pMid = minP + (i / steps) * (maxP - minP);
    const res = evaluateTwoStage(pMid, params);
    data.push({
      pMid,
      motorKw: res.motorInputKw,
      t2: res.stage1.tOut,
      t4: res.stage2.tOut,
      qInter: res.intercooler.heatDuty,
      qAfter: res.aftercooler.heatDuty,
      feasible: res.isFeasible,
    });
  }

  return data;
}

/**
 * Work curves across delivery pressure (200 - 1000 kPa) for T1 in (288, 298, 308 K) - Figure 1.
 */
export function generateWorkCurves(
  temperatures: number[] = [288, 298, 308],
  p1: number = 100.0,
  steps: number = 60
): {
  pFinal: number;
  series: {
    tIn: number;
    wIso: number;
    wIsentropic: number;
    wActual: number;
  }[];
}[] {
  const pMin = 200.0;
  const pMax = 1000.0;
  const results = [];

  for (let i = 0; i <= steps; i++) {
    const pFinal = pMin + (i / steps) * (pMax - pMin);
    const ratio = pFinal / p1;
    const exponent = (1.4 - 1.0) / 1.4;

    const series = temperatures.map((tIn) => {
      const wIso = 0.287 * tIn * Math.log(ratio);
      const tOutS = tIn * Math.pow(ratio, exponent);
      const wIsentropic = 1.005 * (tOutS - tIn);
      const tOut = tIn + (tOutS - tIn) / 0.78;
      const wActual = 1.005 * (tOut - tIn);
      return { tIn, wIso, wIsentropic, wActual };
    });

    results.push({ pFinal, series });
  }

  return results;
}

/**
 * Discharge temperatures of single stage vs two stage with equal pressure ratios (Figure 2).
 */
export function generateDischargeTemperatureCurves(
  params: CompressorParameters,
  steps: number = 60
): {
  pFinal: number;
  singleStageT: number;
  twoStageT2: number;
  twoStageT4: number;
  singleFeasible: boolean;
  twoFeasible: boolean;
}[] {
  const pMin = 200.0;
  const pMax = 1000.0;
  const results = [];

  for (let i = 0; i <= steps; i++) {
    const pFinal = pMin + (i / steps) * (pMax - pMin);
    const pEqual = Math.sqrt(params.p1 * pFinal);

    const single = compressorStage(params.t1, params.p1, pFinal, params.etaS, params.mDot, params.etaM, params);
    const stage1 = compressorStage(params.t1, params.p1, pEqual, params.etaS, params.mDot, params.etaM, params);
    const stage2 = compressorStage(params.t3, pEqual, pFinal, params.etaS, params.mDot, params.etaM, params);

    results.push({
      pFinal,
      singleStageT: single.tOut,
      twoStageT2: stage1.tOut,
      twoStageT4: stage2.tOut,
      singleFeasible: single.tOut <= params.tLimit,
      twoFeasible: stage1.tOut <= params.tLimit && stage2.tOut <= params.tLimit,
    });
  }

  return results;
}

/**
 * Intercooler and aftercooler heat rejection against delivery pressure (600 - 1000 kPa) - Figure 4.
 */
export function generateCoolerDutyCurves(
  params: CompressorParameters,
  steps: number = 50
): {
  pFinal: number;
  qInter: number;
  qAfter: number;
  qTotal: number;
  sGenInter: number;
  sGenAfter: number;
}[] {
  const pMin = 600.0;
  const pMax = 1000.0;
  const results = [];

  for (let i = 0; i <= steps; i++) {
    const pFinal = pMin + (i / steps) * (pMax - pMin);
    const currentParams = { ...params, p3: pFinal };
    const { pMidOpt } = findOptimalIntermediatePressure(currentParams);
    const res = evaluateTwoStage(pMidOpt, currentParams);

    results.push({
      pFinal,
      qInter: res.intercooler.heatDuty,
      qAfter: res.aftercooler.heatDuty,
      qTotal: res.totalHeatRejected,
      sGenInter: res.intercooler.sGenCooler,
      sGenAfter: res.aftercooler.sGenCooler,
    });
  }

  return results;
}

/**
 * 2D Feasibility map across delivery pressure (600 - 1000 kPa) and inlet temperature (288 - 308 K) - Figure 5.
 */
export function generateFeasibilityMatrix(
  params: CompressorParameters,
  pSteps: number = 20,
  tSteps: number = 15
): {
  p3Values: number[];
  t1Values: number[];
  matrix: {
    p3: number;
    t1: number;
    motorKw: number;
    t2: number;
    t4: number;
    feasible: boolean;
    failReason?: 'TEMP_1' | 'TEMP_2' | 'MOTOR';
  }[][];
} {
  const p3Min = 600.0;
  const p3Max = 1000.0;
  const t1Min = 288.0;
  const t1Max = 308.0;

  const p3Values: number[] = [];
  for (let i = 0; i <= pSteps; i++) {
    p3Values.push(p3Min + (i / pSteps) * (p3Max - p3Min));
  }

  const t1Values: number[] = [];
  for (let j = 0; j <= tSteps; j++) {
    t1Values.push(t1Min + (j / tSteps) * (t1Max - t1Min));
  }

  const matrix = t1Values.map((t1) => {
    return p3Values.map((p3) => {
      const p = { ...params, p3, t1 };
      const { pMidOpt } = findOptimalIntermediatePressure(p);
      const res = evaluateTwoStage(pMidOpt, p);

      let failReason: 'TEMP_1' | 'TEMP_2' | 'MOTOR' | undefined = undefined;
      if (!res.temp1Feasible) failReason = 'TEMP_1';
      else if (!res.temp2Feasible) failReason = 'TEMP_2';
      else if (!res.motorFeasible) failReason = 'MOTOR';

      return {
        p3,
        t1,
        motorKw: res.motorInputKw,
        t2: res.stage1.tOut,
        t4: res.stage2.tOut,
        feasible: res.isFeasible,
        failReason,
      };
    });
  });

  return { p3Values, t1Values, matrix };
}
