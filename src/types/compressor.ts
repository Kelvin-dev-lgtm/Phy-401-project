/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompressorParameters {
  p1: number;       // Air inlet pressure (kPa absolute) [90 - 110]
  p3: number;       // Required delivery pressure (kPa absolute) [600 - 1000]
  t1: number;       // First stage inlet temperature (K) [288 - 308]
  mDot: number;     // Mass flow rate (kg/s) [0.040 - 0.080]
  t3: number;       // Intercooler outlet temperature (K) [>= Tc + 5]
  tFinal: number;   // Final aftercooler outlet temperature (K) [310]
  tc: number;       // Coolant reference temperature (K) [293]
  r: number;        // Air gas constant (kJ/(kg K)) [0.287]
  cp: number;       // Constant pressure heat capacity (kJ/(kg K)) [1.005]
  gamma: number;    // Heat capacity ratio [1.400]
  etaS: number;     // Isentropic efficiency per stage [0.70 - 0.85]
  etaM: number;     // Motor and drive efficiency [0.85 - 0.95]
  tLimit: number;   // Maximum air discharge temperature (K) [500]
  motorLimit: number; // Available motor rating (kW) [22.0]
  opHours: number;  // Operating time (h/year) [2000]
}

export interface StageResult {
  pIn: number;
  pOut: number;
  tIn: number;
  tOutS: number;    // Isentropic outlet temperature (K)
  tOut: number;     // Actual outlet temperature (K)
  pressureRatio: number;
  workS: number;    // Isentropic specific work (kJ/kg)
  workActual: number; // Actual specific work (kJ/kg)
  workIso: number;  // Isothermal specific work (kJ/kg)
  shaftPower: number; // kW
  motorPower: number; // kW
  deltaS: number;   // Entropy generation rate (kJ/(kg K))
  sGenComp: number; // kW/K (mDot * deltaS)
  isFeasibleTemp: boolean;
}

export interface CoolerResult {
  tIn: number;
  tOut: number;
  heatDuty: number; // kW (heat rejected)
  sGenCooler: number; // kW/K
}

export interface SingleStageResult {
  stage: StageResult;
  aftercooler: CoolerResult;
  motorInputKw: number;
  annualEnergyKwh: number;
  isFeasible: boolean;
  tempFeasible: boolean;
  motorFeasible: boolean;
}

export interface TwoStageResult {
  pMid: number;
  pEqual: number; // sqrt(p1 * p3)
  stage1: StageResult;
  intercooler: CoolerResult;
  stage2: StageResult;
  aftercooler: CoolerResult;
  totalWorkActual: number; // kJ/kg
  totalShaftPower: number; // kW
  motorInputKw: number;    // kW
  totalHeatRejected: number; // kW
  totalEntropyGen: number; // kW/K
  annualEnergyKwh: number;
  annualEnergySavedKwh: number;
  isFeasible: boolean;
  temp1Feasible: boolean;
  temp2Feasible: boolean;
  motorFeasible: boolean;
}

export interface MonteCarloSample {
  p1: number;
  t1: number;
  mDot: number;
  etaS: number;
  etaM: number;
  pMid: number;
  t2: number;
  t4: number;
  motorKw: number;
  feasible: boolean;
}

export interface MonteCarloStats {
  sampleCount: number;
  feasibleCount: number;
  feasibilityFraction: number;
  motorKwMean: number;
  motorKwMin: number;
  motorKwMax: number;
  motorKwP95: number;
  t2Mean: number;
  t2Max: number;
  t4Mean: number;
  t4Max: number;
  histogramMotor: { binStart: number; binEnd: number; count: number }[];
  histogramT2: { binStart: number; binEnd: number; count: number }[];
  histogramT4: { binStart: number; binEnd: number; count: number }[];
  failureCauses: {
    t2Exceeded: number;
    t4Exceeded: number;
    motorExceeded: number;
  };
}
