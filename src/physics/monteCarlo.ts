/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompressorParameters, MonteCarloSample, MonteCarloStats } from '../types/compressor';
import { evaluateTwoStage, findOptimalIntermediatePressure } from './thermo';

/**
 * Deterministic PRNG: Mulberry32
 * Ensures 100% reproducible Monte Carlo results.
 */
function createMulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function runMonteCarloSimulation(
  baseParams: CompressorParameters,
  sampleCount: number = 5000,
  seed: number = 42
): MonteCarloStats {
  const rng = createMulberry32(seed);

  // Parameter uniform bounds
  const p1Min = 90.0, p1Max = 110.0;
  const t1Min = 288.0, t1Max = 308.0;
  const mDotMin = 0.040, mDotMax = 0.080;
  const etaSMin = 0.70, etaSMax = 0.85;
  const etaMMin = 0.85, etaMMax = 0.95;

  const samples: MonteCarloSample[] = [];
  let feasibleCount = 0;
  let t2Failures = 0;
  let t4Failures = 0;
  let motorFailures = 0;

  const motorKwValues: number[] = [];
  const t2Values: number[] = [];
  const t4Values: number[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const p1 = p1Min + rng() * (p1Max - p1Min);
    const t1 = t1Min + rng() * (t1Max - t1Min);
    const mDot = mDotMin + rng() * (mDotMax - mDotMin);
    const etaS = etaSMin + rng() * (etaSMax - etaSMin);
    const etaM = etaMMin + rng() * (etaMMax - etaMMin);

    const sampleParams: CompressorParameters = {
      ...baseParams,
      p1,
      t1,
      mDot,
      etaS,
      etaM,
    };

    // Calculate optimal intermediate pressure for this sample
    const { pMidOpt } = findOptimalIntermediatePressure(sampleParams, 0.5);
    const res = evaluateTwoStage(pMidOpt, sampleParams);

    const t2 = res.stage1.tOut;
    const t4 = res.stage2.tOut;
    const motorKw = res.motorInputKw;

    const t2Ok = t2 <= sampleParams.tLimit;
    const t4Ok = t4 <= sampleParams.tLimit;
    const motorOk = motorKw <= sampleParams.motorLimit;
    const isSampleFeasible = t2Ok && t4Ok && motorOk;

    if (isSampleFeasible) {
      feasibleCount++;
    } else {
      if (!t2Ok) t2Failures++;
      if (!t4Ok) t4Failures++;
      if (!motorOk) motorFailures++;
    }

    motorKwValues.push(motorKw);
    t2Values.push(t2);
    t4Values.push(t4);

    if (i < 200) {
      // Keep subset for scatter / quick table preview
      samples.push({
        p1,
        t1,
        mDot,
        etaS,
        etaM,
        pMid: pMidOpt,
        t2,
        t4,
        motorKw,
        feasible: isSampleFeasible,
      });
    }
  }

  // Calculate statistics
  motorKwValues.sort((a, b) => a - b);
  const motorKwSum = motorKwValues.reduce((a, b) => a + b, 0);
  const motorKwMean = motorKwSum / sampleCount;
  const motorKwMin = motorKwValues[0];
  const motorKwMax = motorKwValues[sampleCount - 1];
  const motorKwP95 = motorKwValues[Math.floor(sampleCount * 0.95)];

  const t2Sum = t2Values.reduce((a, b) => a + b, 0);
  const t2Mean = t2Sum / sampleCount;
  const t2Max = Math.max(...t2Values);

  const t4Sum = t4Values.reduce((a, b) => a + b, 0);
  const t4Mean = t4Sum / sampleCount;
  const t4Max = Math.max(...t4Values);

  // Generate histogram for motorKw (15 bins)
  const binCount = 15;
  const motorBinWidth = (motorKwMax - motorKwMin) / binCount;
  const histogramMotor = Array.from({ length: binCount }, (_, idx) => {
    const binStart = motorKwMin + idx * motorBinWidth;
    const binEnd = binStart + motorBinWidth;
    const count = motorKwValues.filter((v) =>
      idx === binCount - 1 ? v >= binStart && v <= binEnd : v >= binStart && v < binEnd
    ).length;
    return { binStart, binEnd, count };
  });

  // Histogram for T2
  const t2Min = Math.min(...t2Values);
  const t2BinWidth = (t2Max - t2Min) / binCount;
  const histogramT2 = Array.from({ length: binCount }, (_, idx) => {
    const binStart = t2Min + idx * t2BinWidth;
    const binEnd = binStart + t2BinWidth;
    const count = t2Values.filter((v) =>
      idx === binCount - 1 ? v >= binStart && v <= binEnd : v >= binStart && v < binEnd
    ).length;
    return { binStart, binEnd, count };
  });

  // Histogram for T4
  const t4Min = Math.min(...t4Values);
  const t4BinWidth = (t4Max - t4Min) / binCount;
  const histogramT4 = Array.from({ length: binCount }, (_, idx) => {
    const binStart = t4Min + idx * t4BinWidth;
    const binEnd = binStart + t4BinWidth;
    const count = t4Values.filter((v) =>
      idx === binCount - 1 ? v >= binStart && v <= binEnd : v >= binStart && v < binEnd
    ).length;
    return { binStart, binEnd, count };
  });

  return {
    sampleCount,
    feasibleCount,
    feasibilityFraction: feasibleCount / sampleCount,
    motorKwMean,
    motorKwMin,
    motorKwMax,
    motorKwP95,
    t2Mean,
    t2Max,
    t4Mean,
    t4Max,
    histogramMotor,
    histogramT2,
    histogramT4,
    failureCauses: {
      t2Exceeded: t2Failures,
      t4Exceeded: t4Failures,
      motorExceeded: motorFailures,
    },
  };
}
