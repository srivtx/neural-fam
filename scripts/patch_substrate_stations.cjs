// scripts/patch_substrate_stations.cjs
const fs = require('fs');
const path = require('path');

const canvasPath = path.resolve(__dirname, '../src/components/SubstratePhysicsSimCanvas.tsx');
let content = fs.readFileSync(canvasPath, 'utf-8');

// 1. Expand SubstrateSimStation type
content = content.replace(
  `export type SubstrateSimStation =
  | 'cosmic_scale'
  | 'full_adder'
  | 'dram_leakage'
  | 'bistable_latch'
  | 'bandgap_comparison'
  | 'cmos_inverter'
  | 'roofline_memory_wall'
  | 'pn_junction'
  | 'superscalar_pipeline';`,
  `export type SubstrateSimStation =
  | 'cosmic_scale'
  | 'full_adder'
  | 'dram_leakage'
  | 'bistable_latch'
  | 'bandgap_comparison'
  | 'cmos_inverter'
  | 'roofline_memory_wall'
  | 'pn_junction'
  | 'superscalar_pipeline'
  | 'quantum_tunneling'
  | 'systolic_array'
  | 'landauer_reversible';`
);

// 2. Insert state variables for Stations 10, 11, 12
const stateInjectionMarker = `  // Initialize pipeline if empty when switching to superscalar_pipeline`;
const newStationStates = `  // ==========================================
  // STATION 10: QUANTUM TUNNELING & FLASH FLOATING GATE
  // ==========================================
  const [tunnelBarrierWidthNm, setTunnelBarrierWidthNm] = useState<number>(2.4);
  const [tunnelBarrierHeightEv] = useState<number>(3.2);
  const [electronEnergyEv, setElectronEnergyEv] = useState<number>(1.1);
  const [trappedElectrons, setTrappedElectrons] = useState<number>(120);
  const [flashCellType, setFlashCellType] = useState<'slc' | 'mlc' | 'tlc' | 'qlc'>('tlc');
  const [isTunnelingPulse, setIsTunnelingPulse] = useState<boolean>(false);

  const tunnelingPhysics = useMemo(() => {
    const d = tunnelBarrierWidthNm;
    const V0 = tunnelBarrierHeightEv;
    const E = Math.min(V0 - 0.05, electronEnergyEv);
    const kappa = 5.123 * Math.sqrt(Math.max(0.01, V0 - E));
    const factor = 16 * (E / V0) * (1 - E / V0);
    const exponent = -2 * kappa * d;
    const transProb = factor * Math.exp(Math.max(-80, exponent));
    const deltaVth = (trappedElectrons / 450) * 4.0;
    const baseVth = 1.2;
    const effectiveVth = baseVth + deltaVth;
    const numLevels = flashCellType === 'slc' ? 2 : flashCellType === 'mlc' ? 4 : flashCellType === 'tlc' ? 8 : 16;
    const activeLevel = Math.min(numLevels - 1, Math.floor((trappedElectrons / 450) * numLevels));
    return { kappa, transProb, effectiveVth, deltaVth, numLevels, activeLevel };
  }, [tunnelBarrierWidthNm, tunnelBarrierHeightEv, electronEnergyEv, trappedElectrons, flashCellType]);

  const triggerProgramPulse = () => {
    setIsTunnelingPulse(true);
    setTrappedElectrons((prev) => Math.min(450, prev + 60));
    soundFX.playTap();
    setTimeout(() => setIsTunnelingPulse(false), 350);
  };

  const triggerErasePulse = () => {
    setIsTunnelingPulse(true);
    setTrappedElectrons((prev) => Math.max(0, prev - 120));
    soundFX.playTap();
    setTimeout(() => setIsTunnelingPulse(false), 350);
  };

  // ==========================================
  // STATION 11: 2D SYSTOLIC ARRAY MATRIX ENGINE
  // ==========================================
  const [systolicCycle, setSystolicCycle] = useState<number>(0);
  const [systolicAutoClock, setSystolicAutoClock] = useState<boolean>(false);
  const [systolicMode, setSystolicMode] = useState<'weight_stationary' | 'output_stationary'>('weight_stationary');

  const systolicWeights = useMemo(() => [
    [2, 1, 3],
    [1, 2, 0],
    [3, 0, 2],
  ], []);

  const systolicInputs = useMemo(() => [
    [1, 2, 0],
    [2, 1, 3],
    [0, 3, 1],
  ], []);

  const stepSystolicClock = useCallback(() => {
    setSystolicCycle((c) => (c + 1) % 10);
    soundFX.playTap();
  }, []);

  useEffect(() => {
    if (station !== 'systolic_array' || !systolicAutoClock) return;
    const interval = setInterval(() => {
      setSystolicCycle((c) => (c + 1) % 10);
    }, 750);
    return () => clearInterval(interval);
  }, [station, systolicAutoClock]);

  // ==========================================
  // STATION 12: THERMODYNAMIC LANDAUER LIMIT & REVERSIBLE COMPUTING
  // ==========================================
  const [landauerTempK, setLandauerTempK] = useState<number>(300);
  const [landauerBitState, setLandauerBitState] = useState<0 | 1>(1);
  const [landauerErasing, setLandauerErasing] = useState<boolean>(false);
  const [totalHeatDissipatedZJ, setTotalHeatDissipatedZJ] = useState<number>(0);
  const [erasureCount, setErasureCount] = useState<number>(0);
  const [reversibleGate, setReversibleGate] = useState<'fredkin' | 'toffoli'>('fredkin');
  const [revInputA, setRevInputA] = useState<0 | 1>(1);
  const [revInputB, setRevInputB] = useState<0 | 1>(0);
  const [revInputC, setRevInputC] = useState<0 | 1>(1);

  const landauerEnergyZJ = useMemo(() => {
    const kB = 1.380649e-23;
    const energyJoules = kB * landauerTempK * Math.LN2;
    return energyJoules * 1e21;
  }, [landauerTempK]);

  const reversibleOutputs = useMemo(() => {
    if (reversibleGate === 'fredkin') {
      const outA = revInputA;
      const outB = revInputA === 1 ? revInputC : revInputB;
      const outC = revInputA === 1 ? revInputB : revInputC;
      return { outA, outB, outC };
    } else {
      const outA = revInputA;
      const outB = revInputB;
      const outC = (revInputC ^ (revInputA & revInputB)) as 0 | 1;
      return { outA, outB, outC };
    }
  }, [reversibleGate, revInputA, revInputB, revInputC]);

  const triggerLandauerErasure = () => {
    setLandauerErasing(true);
    setLandauerBitState(0);
    setErasureCount((c) => c + 1);
    setTotalHeatDissipatedZJ((prev) => prev + landauerEnergyZJ);
    soundFX.playTap();
    setTimeout(() => setLandauerErasing(false), 500);
  };

`;

content = content.replace(stateInjectionMarker, newStationStates + stateInjectionMarker);

// 3. Dispatchers in render() loop
const renderDispatcherMarker = `      } else if (station === 'superscalar_pipeline') {
        renderSuperscalarPipeline(
          ctx,
          width,
          height,
          stages,
          dataForwarding,
          cycleCount,
          committedCount,
          currentCPI,
          activeHazard,
          flushAnimation,
          time
        );
      }`;

const newRenderDispatchers = `      } else if (station === 'superscalar_pipeline') {
        renderSuperscalarPipeline(
          ctx,
          width,
          height,
          stages,
          dataForwarding,
          cycleCount,
          committedCount,
          currentCPI,
          activeHazard,
          flushAnimation,
          time
        );
      } else if (station === 'quantum_tunneling') {
        renderQuantumTunneling(
          ctx,
          width,
          height,
          tunnelBarrierWidthNm,
          electronEnergyEv,
          tunnelingPhysics,
          isTunnelingPulse,
          flashCellType,
          time
        );
      } else if (station === 'systolic_array') {
        renderSystolicArray(
          ctx,
          width,
          height,
          systolicCycle,
          systolicWeights,
          systolicInputs,
          systolicMode,
          time
        );
      } else if (station === 'landauer_reversible') {
        renderLandauerReversible(
          ctx,
          width,
          height,
          landauerTempK,
          landauerBitState,
          landauerErasing,
          landauerEnergyZJ,
          totalHeatDissipatedZJ,
          erasureCount,
          reversibleGate,
          revInputA,
          revInputB,
          revInputC,
          reversibleOutputs,
          time
        );
      }`;

content = content.replace(renderDispatcherMarker, newRenderDispatchers);

// 4. Drawing functions for Stations 10, 11, 12 right before `return (`
const returnMarker = `  return (
    <div className={\`flex flex-col space-y-3 bg-ink-950 p-4 rounded-2xl border border-ink-800 shadow-xl \${className}\`}>`;

const drawingFunctions = `  // ========================================================
  // RENDER STATION 10: QUANTUM TUNNELING & FLASH FLOATING GATE
  // ========================================================
  const renderQuantumTunneling = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    dNm: number,
    energyEv: number,
    physics: {
      kappa: number;
      transProb: number;
      effectiveVth: number;
      deltaVth: number;
      numLevels: number;
      activeLevel: number;
    },
    isPulse: boolean,
    cellType: 'slc' | 'mlc' | 'tlc' | 'qlc',
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 640;
    const isCompact = w < 460;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 9px monospace' : 'bold 12px monospace';
    ctx.fillText(
      isCompact
        ? 'QUANTUM TUNNELING & FLASH'
        : 'QUANTUM TUNNELING BARRIER & FLASH FLOATING GATE (FOWLER-NORDHEIM)',
      isMobile ? 12 : 24,
      24
    );

    const padL = isMobile ? 12 : 24;
    const availW = w - padL * 2;
    const midX = padL + availW * 0.52;

    const leftW = isMobile ? availW : availW * 0.48;
    const boxY = 42;
    const boxH = h - 75;

    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(padL, boxY, leftW, boxH);
    ctx.strokeRect(padL, boxY, leftW, boxH);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('1. SCHRÖDINGER WAVEPACKET TUNNELING', padL + 8, boxY + 16);

    const bCenter = padL + leftW * 0.55;
    const bWidthPx = Math.max(16, Math.min(60, dNm * 8));
    const bLeft = bCenter - bWidthPx / 2;
    const bRight = bCenter + bWidthPx / 2;
    const bTop = boxY + 45;
    const bBottom = boxY + boxH - 25;

    ctx.fillStyle = isPulse ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = isPulse ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(bLeft, bTop, bWidthPx, bBottom - bTop);
    ctx.strokeRect(bLeft, bTop, bWidthPx, bBottom - bTop);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SiO2 Barrier (V0 = 3.2 eV)', bCenter, bTop - 6);
    ctx.fillText(\`Width d = \${dNm.toFixed(1)} nm\`, bCenter, bBottom + 14);

    const eLevelY = bBottom - (energyEv / 3.2) * (bBottom - bTop);
    ctx.strokeStyle = '#fbbf24';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL + 10, eLevelY);
    ctx.lineTo(padL + leftW - 10, eLevelY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(\`E = \${energyEv.toFixed(1)} eV\`, padL + 12, eLevelY - 4);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const k = 0.25;
    const omega = 3.5;
    const amp = (bBottom - bTop) * 0.22;

    for (let x = padL + 10; x < bLeft; x += 2) {
      const relX = x - padL;
      const yWave = eLevelY - Math.sin(k * relX - t * omega) * amp;
      if (x === padL + 10) ctx.moveTo(x, yWave);
      else ctx.lineTo(x, yWave);
    }
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const startY = eLevelY - Math.sin(k * (bLeft - padL) - t * omega) * amp;
    ctx.moveTo(bLeft, startY);

    const decayFraction = Math.max(0.04, Math.exp(-physics.kappa * (dNm * 0.35)));
    const endY = eLevelY - Math.sin(k * (bLeft - padL) - t * omega) * amp * decayFraction;
    ctx.quadraticCurveTo(bCenter, eLevelY, bRight, endY);
    ctx.stroke();

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    const transAmp = amp * Math.max(0.12, Math.sqrt(physics.transProb) * 2.5);
    ctx.moveTo(bRight, endY);
    for (let x = bRight; x < padL + leftW - 10; x += 2) {
      const relX = x - bRight;
      const yWave = eLevelY - Math.sin(k * relX - t * omega) * transAmp;
      ctx.lineTo(x, yWave);
    }
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(\`Tunneling Prob T: \${physics.transProb.toExponential(2)}\`, padL + 12, boxY + boxH - 10);

    if (!isMobile) {
      const rightW = availW - leftW - 16;
      const rightX = midX + 8;

      ctx.fillStyle = '#0a0f1d';
      ctx.strokeStyle = '#1e293b';
      ctx.fillRect(rightX, boxY, rightW, boxH);
      ctx.strokeRect(rightX, boxY, rightW, boxH);

      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('2. NAND FLASH FLOATING GATE CHARGE CELL', rightX + 8, boxY + 16);

      const cellY = boxY + 30;
      const cellW = rightW - 24;
      const cellLeft = rightX + 12;

      ctx.fillStyle = '#334155';
      ctx.fillRect(cellLeft, cellY, cellW, 16);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Control Gate (CG)', cellLeft + cellW / 2, cellY + 11);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(cellLeft, cellY + 18, cellW, 6);

      ctx.fillStyle = isPulse ? '#dc2626' : '#6366f1';
      ctx.fillRect(cellLeft, cellY + 26, cellW, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(\`Floating Gate [\${trappedElectrons} e⁻ Trapped]\`, cellLeft + cellW / 2, cellY + 38);

      const numDots = Math.min(40, Math.floor(trappedElectrons / 10));
      for (let i = 0; i < numDots; i++) {
        const dx = cellLeft + 8 + ((i * 19) % (cellW - 16));
        const dy = cellY + 29 + ((i * 7) % 12);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isPulse ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(cellLeft, cellY + 46, cellW, 8);

      if (isPulse) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        for (let sp = 0; sp < 4; sp++) {
          const sx = cellLeft + cellW * 0.2 + sp * (cellW * 0.2);
          ctx.beginPath();
          ctx.moveTo(sx, cellY + 46);
          ctx.lineTo(sx - 3, cellY + 50);
          ctx.lineTo(sx + 3, cellY + 52);
          ctx.lineTo(sx, cellY + 54);
          ctx.stroke();
        }
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cellLeft, cellY + 56, cellW, 20);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.fillText('P-type Silicon Substrate (Inversion Channel)', cellLeft + cellW / 2, cellY + 70);

      const histY = cellY + 86;
      const histH = boxH - 120;
      ctx.fillStyle = '#060a12';
      ctx.fillRect(cellLeft, histY, cellW, histH);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(cellLeft, histY, cellW, histH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(\`\${cellType.toUpperCase()} Voltage Distribution Histograms (\${physics.numLevels} States):\`, cellLeft + 6, histY + 12);

      const nLevels = physics.numLevels;
      const peakSpacing = (cellW - 20) / nLevels;
      for (let lvl = 0; lvl < nLevels; lvl++) {
        const px = cellLeft + 12 + lvl * peakSpacing;
        const isActive = lvl === physics.activeLevel;
        ctx.strokeStyle = isActive ? '#34d399' : '#64748b';
        ctx.fillStyle = isActive ? 'rgba(52, 211, 153, 0.25)' : 'rgba(100, 116, 139, 0.1)';
        ctx.lineWidth = isActive ? 2 : 1;

        ctx.beginPath();
        for (let bx = -12; bx <= 12; bx += 2) {
          const by = Math.exp(-((bx / 5) ** 2)) * (histH - 28);
          const drawX = px + bx;
          const drawY = histY + histH - 4 - by;
          if (bx === -12) ctx.moveTo(drawX, drawY);
          else ctx.lineTo(drawX, drawY);
        }
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = isActive ? '#34d399' : '#64748b';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(\`L\${lvl}\`, px, histY + histH - 6);
      }

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(\`Vth: \${physics.effectiveVth.toFixed(2)}V (ΔVth = +\${physics.deltaVth.toFixed(2)}V)\`, cellLeft + cellW - 6, histY + 12);
    }

    ctx.restore();
  };

  // ========================================================
  // RENDER STATION 11: 2D SYSTOLIC ARRAY MATRIX ENGINE
  // ========================================================
  const renderSystolicArray = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    cycle: number,
    weights: number[][],
    inputs: number[][],
    mode: 'weight_stationary' | 'output_stationary',
    _t: number
  ) => {
    ctx.save();
    const isMobile = w < 640;
    const isCompact = w < 460;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 9px monospace' : 'bold 12px monospace';
    ctx.fillText(
      isCompact
        ? 'TPU 2D SYSTOLIC ARRAY ENGINE'
        : '2D SYSTOLIC ARRAY MATRIX MULTIPLICATION (GOOGLE TPU v1 DATAFLOW)',
      isMobile ? 12 : 24,
      24
    );

    const padL = isMobile ? 12 : 24;
    const availW = w - padL * 2;
    const boxY = 42;
    const boxH = h - 68;

    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(padL, boxY, availW, boxH);
    ctx.strokeRect(padL, boxY, availW, boxH);

    const gridDim = 3;
    const cellSize = isMobile ? 48 : 64;
    const cellGap = isMobile ? 14 : 22;
    const totalGridW = gridDim * cellSize + (gridDim - 1) * cellGap;
    const startX = padL + (availW * 0.5) - totalGridW / 2 + 30;
    const startY = boxY + (boxH / 2) - totalGridW / 2 + 10;

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(\`DATAFLOW: \${mode.toUpperCase().replace('_', ' ')} | CLK CYCLE: \${cycle}/9\`, padL + 12, boxY + 18);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Arithmetic Intensity: 2.0 FLOPs/Byte (Zero Memory Bus Stalls)', padL + availW - 12, boxY + 18);

    for (let r = 0; r < gridDim; r++) {
      for (let c = 0; c < gridDim; c++) {
        const peX = startX + c * (cellSize + cellGap);
        const peY = startY + r * (cellSize + cellGap);
        const arrivalCycle = r + c;
        const isActiveNow = cycle >= arrivalCycle && cycle <= arrivalCycle + 2;
        const isDone = cycle > arrivalCycle + 2;

        if (c === 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(peX - 35, peY + cellSize / 2);
          ctx.lineTo(peX, peY + cellSize / 2);
          ctx.stroke();

          const inputIdx = cycle - r;
          const inVal = inputIdx >= 0 && inputIdx < 3 ? inputs[r][inputIdx] : 0;
          ctx.fillStyle = inVal > 0 ? '#38bdf8' : '#475569';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(\`A[\${r}] = \${inVal}\`, peX - 8, peY + cellSize / 2 - 4);
        }

        if (c < gridDim - 1) {
          ctx.strokeStyle = isActiveNow ? '#38bdf8' : '#334155';
          ctx.lineWidth = isActiveNow ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(peX + cellSize, peY + cellSize / 2);
          ctx.lineTo(peX + cellSize + cellGap, peY + cellSize / 2);
          ctx.stroke();
        }

        if (r < gridDim - 1) {
          ctx.strokeStyle = isActiveNow ? '#34d399' : '#334155';
          ctx.lineWidth = isActiveNow ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(peX + cellSize / 2, peY + cellSize);
          ctx.lineTo(peX + cellSize / 2, peY + cellSize + cellGap);
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(peX + cellSize / 2, peY + cellSize);
          ctx.lineTo(peX + cellSize / 2, peY + cellSize + 25);
          ctx.stroke();
        }

        ctx.fillStyle = isActiveNow
          ? 'rgba(56, 189, 248, 0.22)'
          : isDone
          ? 'rgba(52, 211, 153, 0.15)'
          : '#111827';
        ctx.strokeStyle = isActiveNow ? '#38bdf8' : isDone ? '#34d399' : '#374151';
        ctx.lineWidth = isActiveNow ? 2 : 1;
        ctx.fillRect(peX, peY, cellSize, cellSize);
        ctx.strokeRect(peX, peY, cellSize, cellSize);

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(\`PE(\${r},\${c})\`, peX + 4, peY + 11);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText(\`W: \${weights[r][c]}\`, peX + 4, peY + 24);

        let partialSum = 0;
        for (let k = 0; k < 3; k++) {
          if (cycle >= arrivalCycle + k + 1) {
            partialSum += inputs[r][k] * weights[r][c];
          }
        }

        ctx.fillStyle = isActiveNow ? '#38bdf8' : '#34d399';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(\`Σ: \${partialSum}\`, peX + 4, peY + cellSize - 8);

        if (isActiveNow) {
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(peX - 2, peY - 2, cellSize + 4, cellSize + 4);
        }
      }
    }

    ctx.restore();
  };

  // ========================================================
  // RENDER STATION 12: THERMODYNAMIC LANDAUER & REVERSIBLE
  // ========================================================
  const renderLandauerReversible = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    tempK: number,
    bitState: 0 | 1,
    isErasing: boolean,
    energyZJ: number,
    totalHeatZJ: number,
    erasureCount: number,
    gateType: 'fredkin' | 'toffoli',
    revInA: 0 | 1,
    revInB: 0 | 1,
    revInC: 0 | 1,
    revOutputs: { outA: number; outB: number; outC: number },
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 640;
    const isCompact = w < 460;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 9px monospace' : 'bold 12px monospace';
    ctx.fillText(
      isCompact
        ? 'LANDAUER LIMIT & REVERSIBLE GATES'
        : 'THERMODYNAMIC LANDAUER LIMIT (kB·T·ln 2) & REVERSIBLE COMPUTATION (FREDKIN/TOFFOLI)',
      isMobile ? 12 : 24,
      24
    );

    const padL = isMobile ? 12 : 24;
    const availW = w - padL * 2;
    const boxY = 42;
    const boxH = h - 68;

    const leftW = isMobile ? availW : availW * 0.48;
    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(padL, boxY, leftW, boxH);
    ctx.strokeRect(padL, boxY, leftW, boxH);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('1. IRREVERSIBLE BIT ERASURE & LANDAUER HEAT', padL + 8, boxY + 16);

    const wellCenterX = padL + leftW / 2;
    const wellCenterY = boxY + boxH * 0.62;
    const wellSpanX = leftW * 0.38;
    const barrierHeight = isErasing ? 8 : 45;

    ctx.strokeStyle = isErasing ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let px = -wellSpanX; px <= wellSpanX; px += 2) {
      const normX = px / (wellSpanX * 0.65);
      const potY = barrierHeight * (1 - normX * normX) ** 2;
      const drawX = wellCenterX + px;
      const drawY = wellCenterY - potY;
      if (px === -wellSpanX) ctx.moveTo(drawX, drawY);
      else ctx.lineTo(drawX, drawY);
    }
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Well 0', wellCenterX - wellSpanX * 0.65, wellCenterY + 14);
    ctx.fillText('Well 1', wellCenterX + wellSpanX * 0.65, wellCenterY + 14);

    const thermalJitter = Math.sin(t * 12) * (tempK / 300) * 4;
    const particleX = bitState === 0
      ? wellCenterX - wellSpanX * 0.65 + thermalJitter
      : wellCenterX + wellSpanX * 0.65 + thermalJitter;
    const particleY = wellCenterY - (isErasing ? 8 : 0);

    ctx.fillStyle = isErasing ? '#ef4444' : '#facc15';
    ctx.beginPath();
    ctx.arc(particleX, particleY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (isErasing) {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      for (let ph = 0; ph < 5; ph++) {
        const phR = 10 + ph * 6 + ((t * 20) % 8);
        ctx.beginPath();
        ctx.arc(particleX, particleY, phR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(\`Landauer Heat (kB·T·ln2): \${energyZJ.toFixed(2)} zJ / bit\`, padL + 8, boxY + boxH - 24);
    ctx.fillText(\`Total Dissipated: \${totalHeatZJ.toFixed(2)} zJ (\${erasureCount} erasures)\`, padL + 8, boxY + boxH - 10);

    if (!isMobile) {
      const rightX = padL + leftW + 16;
      const rightW = availW - leftW - 16;

      ctx.fillStyle = '#0a0f1d';
      ctx.strokeStyle = '#1e293b';
      ctx.fillRect(rightX, boxY, rightW, boxH);
      ctx.strokeRect(rightX, boxY, rightW, boxH);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(\`2. REVERSIBLE \${gateType.toUpperCase()} GATE (ZERO DISSIPATION)\`, rightX + 8, boxY + 16);

      const lineSpacing = 28;
      const startLineY = boxY + 45;
      const inX = rightX + 24;
      const outX = rightX + rightW - 24;
      const gateCenterX = rightX + rightW / 2;

      const lines = [
        { label: 'A', inVal: revInA, outVal: revOutputs.outA, y: startLineY },
        { label: 'B', inVal: revInB, outVal: revOutputs.outB, y: startLineY + lineSpacing },
        { label: 'C', inVal: revInC, outVal: revOutputs.outC, y: startLineY + lineSpacing * 2 },
      ];

      lines.forEach((l) => {
        ctx.strokeStyle = l.inVal === 1 ? '#34d399' : '#475569';
        ctx.lineWidth = l.inVal === 1 ? 2.5 : 1.2;
        ctx.beginPath();
        ctx.moveTo(inX, l.y);
        ctx.lineTo(outX, l.y);
        ctx.stroke();

        ctx.fillStyle = l.inVal === 1 ? '#34d399' : '#94a3b8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(\`\${l.label}=\${l.inVal}\`, inX - 6, l.y + 3);

        ctx.fillStyle = l.outVal === 1 ? '#34d399' : '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(\`\${l.label}'=\${l.outVal}\`, outX + 6, l.y + 3);
      });

      ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.8;
      ctx.fillRect(gateCenterX - 18, startLineY - 8, 36, lineSpacing * 2 + 16);
      ctx.strokeRect(gateCenterX - 18, startLineY - 8, 36, lineSpacing * 2 + 16);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(gateType.toUpperCase(), gateCenterX, startLineY + lineSpacing);

      ctx.fillStyle = '#064e3b';
      ctx.fillRect(rightX + 8, boxY + boxH - 32, rightW - 16, 22);
      ctx.strokeStyle = '#059669';
      ctx.strokeRect(rightX + 8, boxY + boxH - 32, rightW - 16, 22);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BIJECTIVE MAPPING: ΔS_info = 0 ⇒ LANDAUER HEAT = 0.000 zJ', rightX + rightW / 2, boxY + boxH - 18);
    }

    ctx.restore();
  };

`;

content = content.replace(returnMarker, drawingFunctions + returnMarker);

// 5. Add Top Station Buttons
const stationButtonMarker = `          <button
            onClick={() => {
              setStation('superscalar_pipeline');
              soundFX.playTap();
            }}
            className={\`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap \${
              station === 'superscalar_pipeline'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }\`}
          >
            <Workflow className="w-3.5 h-3.5 inline mr-1" />
            RISC-V Superscalar Pipeline
          </button>`;

const newStationButtons = `          <button
            onClick={() => {
              setStation('superscalar_pipeline');
              soundFX.playTap();
            }}
            className={\`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap \${
              station === 'superscalar_pipeline'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }\`}
          >
            <Workflow className="w-3.5 h-3.5 inline mr-1" />
            RISC-V Superscalar Pipeline
          </button>

          <button
            onClick={() => {
              setStation('quantum_tunneling');
              soundFX.playTap();
            }}
            className={\`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap \${
              station === 'quantum_tunneling'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }\`}
          >
            <Zap className="w-3.5 h-3.5 inline mr-1" />
            Quantum Tunneling & Flash
          </button>

          <button
            onClick={() => {
              setStation('systolic_array');
              soundFX.playTap();
            }}
            className={\`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap \${
              station === 'systolic_array'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }\`}
          >
            <Cpu className="w-3.5 h-3.5 inline mr-1" />
            TPU Systolic Array Engine
          </button>

          <button
            onClick={() => {
              setStation('landauer_reversible');
              soundFX.playTap();
            }}
            className={\`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap \${
              station === 'landauer_reversible'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }\`}
          >
            <Flame className="w-3.5 h-3.5 inline mr-1" />
            Landauer Limit & Reversible
          </button>`;

content = content.replace(stationButtonMarker, newStationButtons);

// 6. Add Station Control Panels at bottom
const controlPanelMarker = `            Cycle = <strong className="text-cyan-300">{cycleCount}</strong> | Committed ={' '}
            <strong className="text-emerald-300">{committedCount}</strong> | CPI ={' '}
            <strong className={currentCPI > 1.3 ? 'text-amber-400' : 'text-emerald-400'}>{currentCPI.toFixed(2)}</strong> | Stalls ={' '}
            <strong className={stallCount > 0 ? 'text-rose-400' : 'text-ink-400'}>{stallCount}</strong>
          </div>
        </div>
      )}`;

const newControlPanels = `            Cycle = <strong className="text-cyan-300">{cycleCount}</strong> | Committed ={' '}
            <strong className="text-emerald-300">{committedCount}</strong> | CPI ={' '}
            <strong className={currentCPI > 1.3 ? 'text-amber-400' : 'text-emerald-400'}>{currentCPI.toFixed(2)}</strong> | Stalls ={' '}
            <strong className={stallCount > 0 ? 'text-rose-400' : 'text-ink-400'}>{stallCount}</strong>
          </div>
        </div>
      )}

      {station === 'quantum_tunneling' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono text-[11px]">Barrier Oxide Width:</span>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.2"
                value={tunnelBarrierWidthNm}
                onChange={(e) => setTunnelBarrierWidthNm(parseFloat(e.target.value))}
                className="w-24 accent-sky-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-sky-400 text-xs">{tunnelBarrierWidthNm.toFixed(1)} nm</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono text-[11px]">Electron Energy:</span>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.1"
                value={electronEnergyEv}
                onChange={(e) => setElectronEnergyEv(parseFloat(e.target.value))}
                className="w-20 accent-amber-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-amber-400 text-xs">{electronEnergyEv.toFixed(1)} eV</span>
            </div>

            <div className="flex items-center gap-1 bg-ink-950 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
              {(['slc', 'mlc', 'tlc', 'qlc'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setFlashCellType(mode);
                    soundFX.playTap();
                  }}
                  className={\`px-2 py-0.5 rounded cursor-pointer font-bold \${
                    flashCellType === mode ? 'bg-sky-500 text-ink-950' : 'text-ink-400 hover:text-white'
                  }\`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={triggerProgramPulse}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer text-xs font-mono"
            >
              ⚡ 18V Program Pulse (+e⁻)
            </button>

            <button
              onClick={triggerErasePulse}
              className="px-3 py-1 bg-ink-800 hover:bg-ink-700 text-ink-300 font-bold rounded-lg cursor-pointer text-xs font-mono"
            >
              ↺ Erase Pulse (-e⁻)
            </button>
          </div>

          <div className="text-ink-300 font-mono text-xs">
            P(Tunnel) = <strong className="text-emerald-400">{tunnelingPhysics.transProb.toExponential(2)}</strong> | Vth ={' '}
            <strong className="text-amber-300">{tunnelingPhysics.effectiveVth.toFixed(2)}V</strong>
          </div>
        </div>
      )}

      {station === 'systolic_array' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={stepSystolicClock}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg cursor-pointer"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step Systolic Clock</span>
            </button>

            <button
              onClick={() => {
                setSystolicAutoClock((prev) => !prev);
                soundFX.playTap();
              }}
              className={\`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono font-bold cursor-pointer transition-colors \${
                systolicAutoClock ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-300'
              }\`}
            >
              {systolicAutoClock ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{systolicAutoClock ? 'Auto: RUNNING' : 'Auto Clock'}</span>
            </button>

            <button
              onClick={() => {
                setSystolicCycle(0);
                soundFX.playTap();
              }}
              className="p-1.5 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded-lg cursor-pointer"
              title="Reset Systolic Wavefront"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <span className="text-ink-400 font-mono text-[11px]">
              Wavefront Diagonal: Row 0 @ t, Row 1 @ t+1, Row 2 @ t+2
            </span>
          </div>

          <div className="text-ink-300 font-mono text-xs">
            Cycle = <strong className="text-cyan-300">{systolicCycle}</strong>/9 | Intensity ={' '}
            <strong className="text-emerald-300">2.0 FLOPs/B</strong> (100% Data Reuse)
          </div>
        </div>
      )}

      {station === 'landauer_reversible' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono text-[11px]">Die Temp T:</span>
              <input
                type="range"
                min="4"
                max="450"
                step="5"
                value={landauerTempK}
                onChange={(e) => setLandauerTempK(parseInt(e.target.value))}
                className="w-24 accent-rose-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-rose-400 text-xs">{landauerTempK} K</span>
            </div>

            <button
              onClick={triggerLandauerErasure}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer text-xs font-mono"
            >
              🔥 Erase Bit to 0 (Dissipate kB·T·ln2)
            </button>

            <button
              onClick={() => {
                setLandauerBitState(1);
                soundFX.playTap();
              }}
              className="px-2.5 py-1 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded-lg font-mono text-xs cursor-pointer"
            >
              Set Bit = 1
            </button>

            <div className="flex items-center gap-1 bg-ink-950 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
              {(['fredkin', 'toffoli'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setReversibleGate(g);
                    soundFX.playTap();
                  }}
                  className={\`px-2 py-0.5 rounded cursor-pointer font-bold \${
                    reversibleGate === g ? 'bg-emerald-500 text-ink-950' : 'text-ink-400 hover:text-white'
                  }\`}
                >
                  {g.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Input toggles A, B, C */}
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => {
                  setRevInputA((a) => (a === 1 ? 0 : 1));
                  soundFX.playTap();
                }}
                className={\`px-1.5 py-0.5 rounded cursor-pointer font-bold \${
                  revInputA === 1 ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-400'
                }\`}
              >
                A={revInputA}
              </button>
              <button
                onClick={() => {
                  setRevInputB((b) => (b === 1 ? 0 : 1));
                  soundFX.playTap();
                }}
                className={\`px-1.5 py-0.5 rounded cursor-pointer font-bold \${
                  revInputB === 1 ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-400'
                }\`}
              >
                B={revInputB}
              </button>
              <button
                onClick={() => {
                  setRevInputC((c) => (c === 1 ? 0 : 1));
                  soundFX.playTap();
                }}
                className={\`px-1.5 py-0.5 rounded cursor-pointer font-bold \${
                  revInputC === 1 ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-400'
                }\`}
              >
                C={revInputC}
              </button>
            </div>
          </div>

          <div className="text-ink-300 font-mono text-xs">
            Heat = <strong className="text-rose-400">{landauerEnergyZJ.toFixed(2)} zJ</strong>/bit | Total:{' '}
            <strong className="text-amber-300">{totalHeatDissipatedZJ.toFixed(2)} zJ</strong>
          </div>
        </div>
      )}`;

content = content.replace(controlPanelMarker, newControlPanels);

fs.writeFileSync(canvasPath, content, 'utf-8');
console.log('Successfully patched SubstratePhysicsSimCanvas.tsx with Stations 10, 11, and 12!');
