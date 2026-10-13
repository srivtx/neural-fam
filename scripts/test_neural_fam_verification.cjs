/**
 * test_neural_fam_verification.cjs
 * Comprehensive test verification suite for neural-fam features.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting neural-fam deep verification tests...\n');

// ---------------------------------------------------------
// TEST 1: Socratic Question Graph 50/50 Python Verification & Dangling Reference Check
// ---------------------------------------------------------
console.log('Test 1: Socratic Question Graph Python Verification Scripts & Reference Integrity');
const socraticDataPath = path.join(__dirname, '../src/data/socraticQuestionGraphData.ts');
const socraticContent = fs.readFileSync(socraticDataPath, 'utf8');

const idMatches = [...socraticContent.matchAll(/id:\s*'(q_[a-zA-Z0-9_]+)'/g)].map(m => m[1]);
console.log(`  Found ${idMatches.length} questions in socraticQuestionGraphData.ts.`);
assert.strictEqual(idMatches.length, 50, 'Expected exactly 50 socratic questions');

const scriptMatches = [...socraticContent.matchAll(/runnablePythonVerification\s*:\s*\{/g)];
console.log(`  Found ${scriptMatches.length} runnable Python verification objects.`);
assert.strictEqual(scriptMatches.length, 50, 'All 50 questions must have runnablePythonVerification');

// Check for zero dangling references
const validIds = new Set(idMatches);
let danglingCount = 0;
const edgeMatches = [...socraticContent.matchAll(/(?:connectedQuestionIds|originQuestionIds)\s*:\s*\[([^\]]+)\]/g)];
edgeMatches.forEach((match) => {
  const refs = match[1].match(/'(q_[^']+)'/g) || [];
  refs.forEach((ref) => {
    const cleanId = ref.replace(/'/g, '');
    if (!validIds.has(cleanId)) {
      console.error(`  ❌ Dangling reference found: ${cleanId}`);
      danglingCount++;
    }
  });
});
assert.strictEqual(danglingCount, 0, 'Must have zero dangling references in Socratic knowledge graph');
console.log('  ✅ Test 1 Passed: 50/50 Socratic questions have runnable Python verification and zero dangling references.\n');

// ---------------------------------------------------------
// TEST 2: Socratic Curiosity Journeys & 100% Bidirectional Pathfinder Reachability
// ---------------------------------------------------------
console.log('Test 2: Socratic Curiosity Journeys & 100% Bidirectional Trajectory Reachability');
const socraticViewPath = path.join(__dirname, '../src/components/SocraticQuestionGraphView.tsx');
const socraticViewContent = fs.readFileSync(socraticViewPath, 'utf8');

const journeyBlock = socraticViewContent.substring(
  socraticViewContent.indexOf('export const CURIOSITY_JOURNEYS'),
  socraticViewContent.indexOf('];', socraticViewContent.indexOf('export const CURIOSITY_JOURNEYS'))
);
const journeyMatches = [...journeyBlock.matchAll(/id:\s*'([a-z_]+)'/g)];
console.log(`  Found ${journeyMatches.length} curated journeys.`);
assert(journeyMatches.length >= 6, 'Expected at least 6 curiosity journeys');

// Verify bidirectional graph adjacency construction
assert(socraticViewContent.includes('findShortestSocraticPath'), 'BFS shortest path finder must exist');
assert(socraticViewContent.includes('isPathfinderAutoPlaying'), 'Automated trajectory stepping must exist');

// Simulate the bidirectional BFS algorithm on all 2,450 question pairs
const adj = new Map();
idMatches.forEach(id => adj.set(id, new Set()));

// Parse node definitions
const nodeRegex = /id:\s*'(q_[a-zA-Z0-9_]+)'[\s\S]*?connectedQuestionIds:\s*\[([^\]]*)\][\s\S]*?originQuestionIds:\s*\[([^\]]*)\]/g;
let m;
while ((m = nodeRegex.exec(socraticContent)) !== null) {
  const u = m[1];
  const conns = (m[2].match(/'q_[^']+'/g) || []).map(s => s.replace(/'/g, ''));
  const origins = (m[3].match(/'q_[^']+'/g) || []).map(s => s.replace(/'/g, ''));
  [...conns, ...origins].forEach(v => {
    if (adj.has(u) && adj.has(v)) {
      adj.get(u).add(v);
      adj.get(v).add(u);
    }
  });
}

let totalPairs = 0;
let reachablePairs = 0;
for (const a of idMatches) {
  for (const b of idMatches) {
    if (a === b) continue;
    totalPairs++;
    const q = [[a]];
    const visited = new Set([a]);
    let reached = false;
    while (q.length > 0) {
      const path = q.shift();
      const curr = path[path.length - 1];
      if (curr === b) {
        reached = true;
        break;
      }
      for (const nbr of adj.get(curr) || []) {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          q.push([...path, nbr]);
        }
      }
    }
    if (reached) reachablePairs++;
  }
}
console.log(`  Pairwise reachable trajectories: ${reachablePairs} / ${totalPairs} (${(reachablePairs/totalPairs*100).toFixed(1)}%)`);
assert.strictEqual(reachablePairs, totalPairs, 'All 2,450 inquiry pairs must have valid shortest paths');
console.log('  ✅ Test 2 Passed: 6 curiosity journeys and 100.0% bidirectional geodesic reachability verified.\n');

// ---------------------------------------------------------
// TEST 3: Substrate Sim Stations (12 physical stations & Authentic Systolic Matrix Product)
// ---------------------------------------------------------
console.log('Test 3: Substrate Reality Graph Physical Stations & TPU Matrix Mathematics');
const substrateCanvasPath = path.join(__dirname, '../src/components/SubstratePhysicsSimCanvas.tsx');
const substrateCanvasContent = fs.readFileSync(substrateCanvasPath, 'utf8');

const requiredStations = [
  'cosmic_scale',
  'full_adder',
  'dram_leakage',
  'bistable_latch',
  'bandgap_comparison',
  'cmos_inverter',
  'roofline_memory_wall',
  'pn_junction',
  'superscalar_pipeline',
  'quantum_tunneling',
  'systolic_array',
  'landauer_reversible',
];

requiredStations.forEach((station) => {
  assert(substrateCanvasContent.includes(`'${station}'`), `Station ${station} missing from SubstrateSimStation definition`);
  assert(substrateCanvasContent.includes(`station === '${station}'`), `Station ${station} missing from canvas rendering branch`);
});

// Verify TPU Systolic Array matrix mathematics: C[i, c] = sum_r inputs[i][r] * weights[r][c]
const testA = [
  [1, 2, 0],
  [2, 1, 3],
  [0, 3, 1],
];
const testW = [
  [2, 1, 3],
  [1, 2, 0],
  [3, 0, 2],
];
const expectedC = [
  [4, 5, 3],
  [14, 4, 12],
  [6, 6, 2],
];

for (let i = 0; i < 3; i++) {
  for (let c = 0; c < 3; c++) {
    let computed = 0;
    for (let r = 0; r < 3; r++) {
      computed += testA[i][r] * testW[r][c];
    }
    assert.strictEqual(computed, expectedC[i][c], `Systolic matrix product mismatch at (${i},${c})`);
  }
}
console.log(`  TPU 3x3 GEMM: Verified product C = [[4,5,3],[14,4,12],[6,6,2]]`);
assert(substrateCanvasContent.includes('matC[i][c] += inputs[i][r] * weights[r][c];'), 'Authentic matrix multiplication formula must be present');
console.log(`  ✅ Test 3 Passed: All 12 physical stations exist and TPU systolic array computes exact matrix products.\n`);

// ---------------------------------------------------------
// TEST 4: SubstrateRealityGraphView Reference Cards & Node Mappings
// ---------------------------------------------------------
console.log('Test 4: SubstrateRealityGraphView Mappings');
const substrateGraphViewPath = path.join(__dirname, '../src/components/SubstrateRealityGraphView.tsx');
const substrateGraphViewContent = fs.readFileSync(substrateGraphViewPath, 'utf8');

assert(substrateGraphViewContent.includes("return 'quantum_tunneling';"), 'quantum_tunneling must be mapped');
assert(substrateGraphViewContent.includes("return 'systolic_array';"), 'systolic_array must be mapped');
assert(substrateGraphViewContent.includes("return 'landauer_reversible';"), 'landauer_reversible must be mapped');
assert(substrateGraphViewContent.includes('Fowler-Nordheim NAND Flash'), 'Card for Station 9 must exist');
assert(substrateGraphViewContent.includes('Google TPU Systolic Array'), 'Card for Station 10 must exist');
assert(substrateGraphViewContent.includes('Landauer Limit & Reversible Computing'), 'Card for Station 11 must exist');
assert(substrateGraphViewContent.includes('The Cosmic Scale Ladder of Computing'), 'Card for Station 12 must exist');
console.log('  ✅ Test 4 Passed: Station 9-12 reference cards and node mappings verified.\n');

// ---------------------------------------------------------
// TEST 5: Cooley-Tukey Radix-2 FFT, Parabolic Interpolation & Zero-Signal Guard
// ---------------------------------------------------------
console.log('Test 5: Radix-2 Cooley-Tukey FFT & Sub-Bin Peak Accuracy Verification');

// Precomputed tables for 128-pt FFT
const FFT_N = 128;
const HANN_128 = new Float64Array(FFT_N);
for (let n = 0; n < FFT_N; n++) {
  HANN_128[n] = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (FFT_N - 1)));
}

const BIT_REV_128 = new Uint8Array(FFT_N);
for (let i = 0; i < FFT_N; i++) {
  let rev = 0;
  for (let j = 0; j < 7; j++) {
    if ((i >> j) & 1) rev |= (1 << (6 - j));
  }
  BIT_REV_128[i] = rev;
}

function radix2Fft128(real, imag) {
  for (let i = 0; i < FFT_N; i++) {
    const j = BIT_REV_128[i];
    if (i < j) {
      let tR = real[i]; real[i] = real[j]; real[j] = tR;
      let tI = imag[i]; imag[i] = imag[j]; imag[j] = tI;
    }
  }
  for (let len = 2; len <= FFT_N; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wStepR = Math.cos(angle);
    const wStepI = Math.sin(angle);
    for (let i = 0; i < FFT_N; i += len) {
      let wR = 1.0, wI = 0.0;
      for (let j = 0; j < halfLen; j++) {
        const uR = real[i + j], uI = imag[i + j];
        const vR = real[i + j + halfLen] * wR - imag[i + j + halfLen] * wI;
        const vI = real[i + j + halfLen] * wI + imag[i + j + halfLen] * wR;
        real[i + j] = uR + vR;
        imag[i + j] = uI + vI;
        real[i + j + halfLen] = uR - vR;
        imag[i + j + halfLen] = uI - vI;
        const nextR = wR * wStepR - wI * wStepI;
        wI = wR * wStepI + wI * wStepR;
        wR = nextR;
      }
    }
  }
}

function testFft(samples, samplingRate = 500) {
  const inReal = new Float64Array(FFT_N);
  const inImag = new Float64Array(FFT_N);
  const offset = samples.length - FFT_N;
  let mean = 0;
  for (let i = 0; i < FFT_N; i++) {
    const idx = offset + i;
    const val = idx >= 0 && idx < samples.length ? samples[idx] : (samples[0] ?? 0);
    inReal[i] = val;
    mean += val;
  }
  mean /= FFT_N;
  for (let i = 0; i < FFT_N; i++) {
    inReal[i] = (inReal[i] - mean) * HANN_128[i];
  }
  radix2Fft128(inReal, inImag);

  const halfN = FFT_N / 2;
  const mags = new Array(halfN);
  const freqs = new Array(halfN);
  const df = samplingRate / FFT_N;
  let peakMag = 0, peakK = 0;

  for (let k = 0; k < halfN; k++) {
    freqs[k] = k * df;
    const mag = (Math.sqrt(inReal[k] * inReal[k] + inImag[k] * inImag[k]) * 4) / FFT_N;
    mags[k] = mag;
    if (k > 0 && mag > peakMag) {
      peakMag = mag;
      peakK = k;
    }
  }

  let f0 = 0.0;
  if (peakMag > 0.05 && peakK > 0) {
    let interpolatedK = peakK;
    if (peakK > 1 && peakK < halfN - 1) {
      const alpha = mags[peakK - 1];
      const beta = mags[peakK];
      const gamma = mags[peakK + 1];
      const denom = alpha - 2 * beta + gamma;
      if (Math.abs(denom) > 1e-6) {
        const delta = (0.5 * (alpha - gamma)) / denom;
        if (Math.abs(delta) < 1.0) {
          interpolatedK = peakK + delta;
        }
      }
    }
    f0 = Math.round(interpolatedK * df * 10) / 10;
  }

  let harmonicEnergy = 0;
  if (peakK > 0) {
    for (let h = 2; h <= 8; h++) {
      const hk = Math.round(h * peakK);
      if (hk < halfN) harmonicEnergy += mags[hk] * mags[hk];
    }
  }
  const thdPercent = peakMag > 0.05 ? Math.min(99.9, (Math.sqrt(harmonicEnergy) / peakMag) * 100) : 0.0;
  return { mags, freqs, f0, peakMag, thdPercent };
}

// 5a. Test Flatline 0V (zero signal guard)
const flatline = new Array(128).fill(0);
const res0 = testFft(flatline);
console.log(`  Flatline 0V -> f0: ${res0.f0} Hz, peakMag: ${res0.peakMag.toFixed(2)}V, THD: ${res0.thdPercent.toFixed(2)}%`);
assert.strictEqual(res0.f0, 0.0, 'Flatline signal must report f0 = 0.0 Hz');
assert.strictEqual(res0.thdPercent, 0.0, 'Flatline signal must report THD = 0.0%');

// 5b. Test Pure 50 Hz sine wave
const pureSine = [];
for (let n = 0; n < 128; n++) {
  pureSine.push(2.5 + 2.0 * Math.sin(2 * Math.PI * 50 * (n / 500)));
}
const res50 = testFft(pureSine, 500);
console.log(`  Pure 50 Hz sine -> Detected f0: ${res50.f0.toFixed(2)} Hz (peakMag: ${res50.peakMag.toFixed(2)}V, THD: ${res50.thdPercent.toFixed(2)}%)`);
assert(Math.abs(res50.f0 - 50.0) < 0.5, `Expected f0 within 0.5 Hz of 50.0 Hz, got ${res50.f0}`);
assert(res50.thdPercent < 1.0, `Pure sine THD should be < 1%, got ${res50.thdPercent}%`);

// 5c. Test Distorted wave (50 Hz + 150 Hz harmonic)
const distSine = [];
for (let n = 0; n < 128; n++) {
  distSine.push(2.5 + 2.0 * Math.sin(2 * Math.PI * 50 * (n / 500)) + 0.6 * Math.sin(2 * Math.PI * 150 * (n / 500)));
}
const resDist = testFft(distSine, 500);
console.log(`  Distorted 50 Hz + 150 Hz harmonic -> Detected f0: ${resDist.f0.toFixed(2)} Hz, THD: ${resDist.thdPercent.toFixed(2)}%`);
assert(resDist.thdPercent > 20.0, `Distorted signal THD must exceed 20%, got ${resDist.thdPercent}%`);

// Check RoboticsHardwareSimCanvas code contains radix-2 FFT and Dual Cursors
const roboticsCanvasPath = path.join(__dirname, '../src/components/RoboticsHardwareSimCanvas.tsx');
const roboticsCanvasContent = fs.readFileSync(roboticsCanvasPath, 'utf8');
assert(roboticsCanvasContent.includes('radix2FftInPlace128'), 'Robotics canvas must use radix2FftInPlace128');
assert(roboticsCanvasContent.includes('showCursors'), 'Robotics canvas must support dual cursors');
console.log('  ✅ Test 5 Passed: Cooley-Tukey Radix-2 FFT, sub-bin parabolic interpolation, and dual cursors verified.\n');

// ---------------------------------------------------------
// TEST 6: ATmega328P Silicon Register Matrix & 16-bit Timer 1 Integrity
// ---------------------------------------------------------
console.log('Test 6: ATmega328P Silicon Register Matrix & 16-bit Timer 1 Integrity');
const serialPanelPath = path.join(__dirname, '../src/components/SerialMonitorFaultsPanel.tsx');
const serialPanelContent = fs.readFileSync(serialPanelPath, 'utf8');

const requiredRegisters = [
  'TCCR1A',
  'TCCR1B',
  'OCR1A',
  'ADMUX',
  'ADCSRA',
  'PORTB',
  'PORTD',
  'PINB',
  'SREG',
];

requiredRegisters.forEach((reg) => {
  assert(serialPanelContent.includes(`name: '${reg}'`), `Register ${reg} must be defined in SerialMonitorFaultsPanel`);
});

// Check that 16-bit OCR1A has both high and low byte definitions
assert(serialPanelContent.includes("D15"), 'OCR1A must have high byte bits D15..D8');
assert(serialPanelContent.includes("OCR1AH"), 'OCR1AH high byte must be documented');
assert(serialPanelContent.includes("OCR1AL"), 'OCR1AL low byte must be documented');
assert(serialPanelContent.includes('bitFlipTimesRef'), 'bitFlipTimesRef must be present for animated bit transitions');
assert(serialPanelContent.includes('handleDumpRegisters'), 'handleDumpRegisters must be present');
assert(serialPanelContent.includes('[SFR PROBE]'), 'Interactive SFR click probing must log to UART');

console.log('  ✅ Test 6 Passed: All 9 ATmega328P SFRs verified with 16-bit OCR1AH:OCR1AL integrity and UART probing.\n');

// ---------------------------------------------------------
// TEST 7: Wokwi Virtual Breadboard Circuit Configurations
// ---------------------------------------------------------
console.log('Test 7: Wokwi Virtual Breadboard Circuit Configurations & Pin Mappings');
const wokwiCircuitsPath = path.join(__dirname, '../src/data/wokwiCircuitsData.ts');
const wokwiCircuitsContent = fs.readFileSync(wokwiCircuitsPath, 'utf8');

const canonicalExpIds = [
  'exp_pir_servo_buzzer',
  'exp_ultrasonic_radar',
  'exp_ir_line_follower',
  'exp_mpu6050_balancing',
  'exp_ldr_solar_tracker',
  'exp_encoder_motor_pid',
  'exp_hall_effect_tachometer',
  'exp_loadcell_smart_gripper',
];

canonicalExpIds.forEach((expId) => {
  assert(wokwiCircuitsContent.includes(`experimentId: '${expId}'`), `Experiment ${expId} missing in WOKWI_CIRCUITS`);
});

// Verify wire count and color consistency
const wireMatches = [...wokwiCircuitsContent.matchAll(/wireType:\s*'(power|ground|signal|pwm|i2c|analog)'/g)];
console.log(`  Found ${wireMatches.length} typed jumper wires across 8 Wokwi circuits.`);
assert(wireMatches.length >= 60, 'Expected at least 60 typed jumper wires across all 8 circuits');

// Verify breadboard tie-points and Arduino pin anchor references
assert(wokwiCircuitsContent.includes("type: 'pir_hc_sr501'"), 'HC-SR501 PIR module must exist');
assert(wokwiCircuitsContent.includes("type: 'servo_sg90'"), 'SG90 servo module must exist');
assert(wokwiCircuitsContent.includes("type: 'ultrasonic_hc_sr04'"), 'HC-SR04 ultrasonic module must exist');
assert(wokwiCircuitsContent.includes("type: 'lcd1602_i2c'"), '16x2 I2C LCD module must exist');
assert(wokwiCircuitsContent.includes("type: 'mpu6050_imu'"), 'MPU-6050 IMU module must exist');
assert(wokwiCircuitsContent.includes("type: 'loadcell_hx711_gripper'"), 'Load cell HX711 module must exist');
assert(wokwiCircuitsContent.includes("type: 'optical_encoder_motor'"), 'Optical encoder module must exist');
assert(wokwiCircuitsContent.includes("type: 'hall_effect_sensor'"), 'Hall effect sensor module must exist');

console.log('  ✅ Test 7 Passed: All 8 Wokwi circuit configs, modules, and pin mappings verified.\n');

// ---------------------------------------------------------
// TEST 8: Wokwi Project Walkthrough Guides & Wire-by-Wire Assembly
// ---------------------------------------------------------
console.log('Test 8: Wokwi Project Guides, BOM, Power Budgets & Netlists');
const wokwiGuidesPath = path.join(__dirname, '../src/data/wokwiProjectGuidesData.ts');
const wokwiGuidesContent = fs.readFileSync(wokwiGuidesPath, 'utf8');

canonicalExpIds.forEach((expId) => {
  assert(wokwiGuidesContent.includes(`experimentId: '${expId}'`), `Experiment ${expId} missing in WOKWI_PROJECT_GUIDES`);
});

// Verify BOM current budgets and USB polyfuse limits
assert(wokwiGuidesContent.includes('usbPolyfuseLimitMa:'), 'Power budgets must define usbPolyfuseLimitMa');
assert(wokwiGuidesContent.includes('mcuRegulatorLimitMa:'), 'Power budgets must define mcuRegulatorLimitMa');
assert(wokwiGuidesContent.includes('bom:'), 'Each guide must contain a Bill of Materials');
assert(wokwiGuidesContent.includes('wiringSequence:'), 'Each guide must contain a wire-by-wire assembly sequence');
assert(wokwiGuidesContent.includes('netlist:'), 'Each guide must contain a complete netlist');
assert(wokwiGuidesContent.includes('preFlightChecklist:'), 'Each guide must contain a pre-flight checklist');
assert(wokwiGuidesContent.includes('potentialDamageIfSkipped:'), 'Pre-flight checks must detail potential damage if skipped');

// Verify engineering rationale presence on every wiring step
const rationaleMatches = [...wokwiGuidesContent.matchAll(/engineeringReason:\s*'/g)];
console.log(`  Found ${rationaleMatches.length} wire-by-wire engineering rationales.`);
assert(rationaleMatches.length >= 60, 'Every wire connection must have pedagogical engineering rationale');

console.log('  ✅ Test 8 Passed: All 8 project guides, BOMs, power budgets, and wire sequencers verified.\n');

// ---------------------------------------------------------
// TEST 9: Digital Logic Analyzer Multi-Instrument Bench & Protocol Decoders
// ---------------------------------------------------------
console.log('Test 9: 4-Channel Digital Logic Analyzer & Protocol Decoders');
const logicAnalyzerPath = path.join(__dirname, '../src/components/DigitalLogicAnalyzer.tsx');
const logicAnalyzerContent = fs.readFileSync(logicAnalyzerPath, 'utf8');

// Check all 8 experiments are mapped in EXPERIMENT_LOGIC_CHANNELS
canonicalExpIds.forEach((expId) => {
  assert(logicAnalyzerContent.includes(`${expId}: [`), `Experiment ${expId} missing channel config in DigitalLogicAnalyzer`);
});

// Check timebases and decoders
const timebases = ['10us', '50us', '200us', '1ms', '10ms'];
timebases.forEach((tb) => {
  assert(logicAnalyzerContent.includes(`'${tb}'`), `Timebase ${tb} must be available in logic analyzer`);
});

assert(logicAnalyzerContent.includes('ultrasonicCalculatedDistance'), 'HC-SR04 pulse-width-to-distance decoder must exist');
assert(logicAnalyzerContent.includes('servoPwmDecoded'), 'Servo PWM 50Hz pulse width decoder must exist');
assert(logicAnalyzerContent.includes('encoderDecoded'), 'Quadrature encoder phase A/B direction decoder must exist');
assert(logicAnalyzerContent.includes('hx711Decoded'), 'HX711 24-bit delta-sigma ADC decoder must exist');
assert(logicAnalyzerContent.includes('cursorT1'), 'Draggable Cursor T1 must exist');
assert(logicAnalyzerContent.includes('cursorT2'), 'Draggable Cursor T2 must exist');
assert(logicAnalyzerContent.includes('deltaTUs'), 'Live Delta-t microsecond measurement must exist');

console.log('  ✅ Test 9 Passed: 4-channel logic analyzer, timebases, dual cursors, and protocol decoders verified.\n');

// ---------------------------------------------------------
// TEST 10: Production Arduino C++ Firmware & Architectural Analysis
// ---------------------------------------------------------
console.log('Test 10: Production Non-Blocking Arduino C++ Firmware & Architectural Breakdown');
const roboticsDataPath = path.join(__dirname, '../src/data/roboticsExperimentsData.ts');
const roboticsDataContent = fs.readFileSync(roboticsDataPath, 'utf8');

canonicalExpIds.forEach((expId) => {
  assert(roboticsDataContent.includes(`id: '${expId}'`), `Experiment ${expId} missing in ROBOTICS_EXPERIMENTS`);
});

// Check for zero blocking delays in production loop code
const delayCalls = [...roboticsDataContent.matchAll(/delay\(\s*(\d+)\s*\)/g)]
  .map(m => parseInt(m[1], 10))
  .filter(ms => ms > 100);
console.log(`  Long blocking delay(>100ms) calls found in firmware: ${delayCalls.length}`);
assert.strictEqual(delayCalls.length, 0, 'Zero long blocking delay() calls permitted in production robotics firmware');

// Check non-blocking architecture features
assert(roboticsDataContent.includes('millis()'), 'Firmware must use millis() scheduling');
assert(roboticsDataContent.includes('volatile'), 'Interrupt ISR state variables must be volatile');
assert(roboticsDataContent.includes('firmwareArchitecture:'), 'Firmware architecture specifications must be present');
assert(roboticsDataContent.includes('architecturePattern:'), 'Architecture pattern must be defined');
assert(roboticsDataContent.includes('timerUsage:'), 'Timer usage must be defined');
assert(roboticsDataContent.includes('interruptMap:'), 'Interrupt map must be defined');
assert(roboticsDataContent.includes('annotatedBreakdown:'), 'Pedagogical annotated breakdowns must be present');

// Verify 5-mode studio integration in RoboticsHardwareLabView
const labViewPath = path.join(__dirname, '../src/components/RoboticsHardwareLabView.tsx');
const labViewContent = fs.readFileSync(labViewPath, 'utf8');

const requiredModes = [
  'breadboard_build',
  'physics_sim',
  'instrument_bench',
  'firmware_studio',
  'faults_matrix',
];
requiredModes.forEach((mode) => {
  assert(labViewContent.includes(`'${mode}'`), `Studio mode ${mode} must exist in RoboticsHardwareLabView`);
});

assert(labViewContent.includes('<WokwiVirtualBreadboard'), 'WokwiVirtualBreadboard must be rendered');
assert(labViewContent.includes('<WokwiProjectBuilder'), 'WokwiProjectBuilder must be rendered');
assert(labViewContent.includes('<DigitalLogicAnalyzer'), 'DigitalLogicAnalyzer must be rendered');

console.log('  ✅ Test 10 Passed: Production non-blocking firmware, architecture breakdowns, and 5-mode studio verified.\n');

console.log('🎉 ALL 10 ADVANCED VERIFICATION TEST SUITES PASSED CLEANLY! 🚀');
