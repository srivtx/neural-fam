/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * WokwiVirtualBreadboard:
 * Photorealistic, interactive vector breadboard simulation component.
 * Renders Arduino Uno R3, half/full solderless breadboards, high-fidelity electronic
 * modules, cubic bezier jumper wires, active current flow glow pulses, and live stimuli.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
  Sliders,
  Move,
  Flame,
  Radar,
  Activity,
  Compass,
  Cpu,
  Gauge,
  Sun,
  Scale,
  Zap,
} from 'lucide-react';
import {
  CircuitWire,
  CircuitComponentState,
  InteractiveStimulusState,
  WiringStep,
  WokwiCircuitConfig,
} from '../types/wokwiCircuit';
import { WOKWI_CIRCUITS } from '../data/wokwiCircuitsData';

export interface WokwiVirtualBreadboardProps {
  experimentId?: string;
  activeWiringStep?: number;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
  interactive?: boolean;
  showControls?: boolean;
  onStimulusChange?: (stimulus: InteractiveStimulusState) => void;
}

// ============================================================================
// HELPER: Coordinate Resolution for Pins
// ============================================================================

function getPinCoordinates(
  pinId: string,
  circuit: WokwiCircuitConfig,
  components: CircuitComponentState[]
): { x: number; y: number } {
  const [category, ...rest] = pinId.split(':');

  // 1. ARDUINO UNO R3 PINS
  if (category === 'arduino') {
    const pinName = rest.join(':');
    const { x: ax, y: ay } = circuit.arduinoPosition;

    // Female pin header geometry strictly matching rendered SVG header positions:
    // Upper Header Left (ax + 136, ay + 6): SCL, SDA, AREF, GND3, D13 - D8 (10 pins)
    // Upper Header Right (ax + 268, ay + 6): D7 - D0 (8 pins)
    // Lower Header Left / Power (ax + 150, ay + 216): IOREF, RST, 3.3V, 5V, GND1, GND2, VIN (7 pins)
    // Lower Header Right / Analog (ax + 256, ay + 216): A0 - A5 (6 pins)
    switch (pinName) {
      // Power Pins
      case 'IOREF': return { x: ax + 158.5 + 0 * 12.5, y: ay + 224.5 };
      case 'RESET':
      case 'RST':   return { x: ax + 158.5 + 1 * 12.5, y: ay + 224.5 };
      case '3.3V':  return { x: ax + 158.5 + 2 * 12.5, y: ay + 224.5 };
      case '5V':    return { x: ax + 158.5 + 3 * 12.5, y: ay + 224.5 };
      case 'GND':
      case 'GND1':  return { x: ax + 158.5 + 4 * 12.5, y: ay + 224.5 };
      case 'GND2':  return { x: ax + 158.5 + 5 * 12.5, y: ay + 224.5 };
      case 'VIN':   return { x: ax + 158.5 + 6 * 12.5, y: ay + 224.5 };

      // Analog Pins A0 - A5
      case 'A0': return { x: ax + 265.5 + 0 * 11.5, y: ay + 224.5 };
      case 'A1': return { x: ax + 265.5 + 1 * 11.5, y: ay + 224.5 };
      case 'A2': return { x: ax + 265.5 + 2 * 11.5, y: ay + 224.5 };
      case 'A3': return { x: ax + 265.5 + 3 * 11.5, y: ay + 224.5 };
      case 'A4': return { x: ax + 265.5 + 4 * 11.5, y: ay + 224.5 };
      case 'A5': return { x: ax + 265.5 + 5 * 11.5, y: ay + 224.5 };

      // Digital 0 - 7 (Upper Right Header)
      case 'D7': return { x: ax + 274.75 + 0 * 8, y: ay + 14.5 };
      case 'D6': return { x: ax + 274.75 + 1 * 8, y: ay + 14.5 };
      case 'D5': return { x: ax + 274.75 + 2 * 8, y: ay + 14.5 };
      case 'D4': return { x: ax + 274.75 + 3 * 8, y: ay + 14.5 };
      case 'D3': return { x: ax + 274.75 + 4 * 8, y: ay + 14.5 };
      case 'D2': return { x: ax + 274.75 + 5 * 8, y: ay + 14.5 };
      case 'D1': return { x: ax + 274.75 + 6 * 8, y: ay + 14.5 };
      case 'D0': return { x: ax + 274.75 + 7 * 8, y: ay + 14.5 };

      // Digital 8 - 13, GND, AREF, SDA, SCL (Upper Left Header)
      case 'SCL':  return { x: ax + 145.5 + 0 * 11.5, y: ay + 14.5 };
      case 'SDA':  return { x: ax + 145.5 + 1 * 11.5, y: ay + 14.5 };
      case 'AREF': return { x: ax + 145.5 + 2 * 11.5, y: ay + 14.5 };
      case 'GND3': return { x: ax + 145.5 + 3 * 11.5, y: ay + 14.5 };
      case 'D13':  return { x: ax + 145.5 + 4 * 11.5, y: ay + 14.5 };
      case 'D12':  return { x: ax + 145.5 + 5 * 11.5, y: ay + 14.5 };
      case 'D11':  return { x: ax + 145.5 + 6 * 11.5, y: ay + 14.5 };
      case 'D10':  return { x: ax + 145.5 + 7 * 11.5, y: ay + 14.5 };
      case 'D9':   return { x: ax + 145.5 + 8 * 11.5, y: ay + 14.5 };
      case 'D8':   return { x: ax + 145.5 + 9 * 11.5, y: ay + 14.5 };

      default: return { x: ax + 170, y: ay + 120 };
    }
  }

  // 2. BREADBOARD PINS: bb:rail:top:red:5, bb:rail:bottom:blue:12, bb:15:c
  if (category === 'bb') {
    const { x: bx, y: by } = circuit.breadboardPosition;
    const colPitch = 14.8;

    if (rest[0] === 'rail') {
      const pos = rest[1]; // 'top' or 'bottom'
      const line = rest[2]; // 'red' or 'blue'
      const colIdx = parseInt(rest[3] || '1', 10);
      const colX = bx + 36 + (colIdx - 1) * colPitch;

      if (pos === 'top') {
        const y = line === 'blue' ? by + 21.5 : by + 35.5;
        return { x: colX, y };
      } else {
        const y = line === 'red' ? by + 183.5 : by + 197.5;
        return { x: colX, y };
      }
    } else {
      // e.g. bb:15:c
      const colIdx = parseInt(rest[0], 10);
      const rowLetter = rest[1] ? rest[1].toLowerCase() : 'a';
      const colX = bx + 36 + (colIdx - 1) * colPitch;

      const letterMap: Record<string, number> = {
        a: by + 58.5,
        b: by + 70.5,
        c: by + 82.5,
        d: by + 94.5,
        e: by + 106.5,
        // center divider trough
        f: by + 124.5,
        g: by + 136.5,
        h: by + 148.5,
        i: by + 160.5,
        j: by + 172.5,
      };
      return { x: colX, y: letterMap[rowLetter] ?? by + 100 };
    }
  }

  // 3. ELECTRONIC MODULE BREAKOUT PINS
  // Look up component by matching prefix or category in components array
  const comp = components.find((c) => {
    switch (category) {
      case 'pir': return c.type === 'pir_hc_sr501' || c.id.startsWith('pir');
      case 'sonar': return c.type === 'ultrasonic_hc_sr04' || c.id.startsWith('sonar');
      case 'servo': return c.type === 'servo_sg90' || c.id.startsWith('servo');
      case 'lcd': return c.type === 'lcd1602_i2c' || c.id.startsWith('lcd');
      case 'buzzer': return c.type === 'piezo_buzzer' || c.id.startsWith('buzzer');
      case 'ir':
      case 'tcrt': return c.type === 'tcrt5000_ir' || c.id.startsWith('tcrt') || c.id.startsWith('ir');
      case 'l298n': return c.type === 'l298n_motor_driver' || c.id.startsWith('l298n');
      case 'mpu': return c.type === 'mpu6050_imu' || c.id.startsWith('mpu');
      case 'ldr': return c.type === 'dual_ldr_tracker' || c.id.startsWith('ldr');
      case 'encoder': return c.type === 'optical_encoder_motor' || c.id.startsWith('encoder');
      case 'hall': return c.type === 'hall_effect_sensor' || c.id.startsWith('hall');
      case 'hx711':
      case 'loadcell': return c.type === 'loadcell_hx711_gripper' || c.id.startsWith('hx711') || c.id.startsWith('loadcell');
      default: return c.id.startsWith(category) || c.type.includes(category);
    }
  });

  const cx = comp ? comp.x : 500;
  const cy = comp ? comp.y : 100;
  const pinName = rest.join(':');

  if (category === 'pir') {
    // HC-SR501 pins: VCC, OUT, GND
    switch (pinName) {
      case 'VCC': return { x: cx + 18, y: cy + 78 };
      case 'OUT': return { x: cx + 30, y: cy + 78 };
      case 'GND': return { x: cx + 42, y: cy + 78 };
      default: return { x: cx + 30, y: cy + 78 };
    }
  }

  if (category === 'sonar') {
    // HC-SR04 pins: VCC, TRIG, ECHO, GND
    switch (pinName) {
      case 'VCC':  return { x: cx + 32, y: cy + 84 };
      case 'TRIG': return { x: cx + 47, y: cy + 84 };
      case 'ECHO': return { x: cx + 62, y: cy + 84 };
      case 'GND':  return { x: cx + 77, y: cy + 84 };
      default: return { x: cx + 55, y: cy + 84 };
    }
  }

  if (category === 'servo') {
    // SG90 3-pin cable: GND (Brown), VCC (Red), PWM (Orange)
    switch (pinName) {
      case 'GND': return { x: cx + 24, y: cy + 74 };
      case 'VCC': return { x: cx + 40, y: cy + 74 };
      case 'PWM': return { x: cx + 56, y: cy + 74 };
      default: return { x: cx + 40, y: cy + 74 };
    }
  }

  if (category === 'lcd') {
    // PCF8574 I2C Backpack pins: GND, VCC, SDA, SCL
    switch (pinName) {
      case 'GND': return { x: cx + 13, y: cy - 4 };
      case 'VCC': return { x: cx + 23, y: cy - 4 };
      case 'SDA': return { x: cx + 33, y: cy - 4 };
      case 'SCL': return { x: cx + 43, y: cy - 4 };
      default: return { x: cx + 28, y: cy - 4 };
    }
  }

  if (category === 'buzzer') {
    // Piezo Buzzer pins: POS, NEG
    switch (pinName) {
      case 'POS': return { x: cx + 17, y: cy + 51 };
      case 'NEG': return { x: cx + 37, y: cy + 51 };
      default: return { x: cx + 27, y: cy + 51 };
    }
  }

  if (category === 'ir' || category === 'tcrt') {
    // TCRT5000 pins: VCC, GND, D0, A0
    switch (pinName) {
      case 'VCC': return { x: cx + 18, y: cy + 74 };
      case 'GND': return { x: cx + 30, y: cy + 74 };
      case 'D0':  return { x: cx + 42, y: cy + 74 };
      case 'A0':  return { x: cx + 54, y: cy + 74 };
      default: return { x: cx + 36, y: cy + 74 };
    }
  }

  if (category === 'l298n') {
    // L298N pins
    switch (pinName) {
      case 'ENA': return { x: cx + 22, y: cy + 120 };
      case 'IN1': return { x: cx + 34, y: cy + 120 };
      case 'IN2': return { x: cx + 46, y: cy + 120 };
      case 'IN3': return { x: cx + 58, y: cy + 120 };
      case 'IN4': return { x: cx + 70, y: cy + 120 };
      case 'ENB': return { x: cx + 82, y: cy + 120 };
      case 'VMS': return { x: cx + 105, y: cy + 120 };
      case 'GND': return { x: cx + 118, y: cy + 120 };
      case '5V':  return { x: cx + 131, y: cy + 120 };
      default: return { x: cx + 60, y: cy + 120 };
    }
  }

  if (category === 'mpu') {
    // MPU-6050 pins: VCC, GND, SCL, SDA, XDA, XCL, AD0, INT
    const pinMap: Record<string, number> = {
      VCC: 0,
      GND: 1,
      SCL: 2,
      SDA: 3,
      XDA: 4,
      XCL: 5,
      AD0: 6,
      INT: 7,
    };
    const idx = pinMap[pinName] ?? 0;
    return { x: cx + 14.5 + idx * 9, y: cy + 74 };
  }

  if (category === 'ldr') {
    switch (pinName) {
      case 'VCC':   return { x: cx + 22, y: cy + 74 };
      case 'GND':   return { x: cx + 36, y: cy + 74 };
      case 'OUT_L': return { x: cx + 50, y: cy + 74 };
      case 'OUT_R': return { x: cx + 64, y: cy + 74 };
      default: return { x: cx + 43, y: cy + 74 };
    }
  }

  if (category === 'encoder') {
    switch (pinName) {
      case 'VCC':   return { x: cx + 24, y: cy + 74 };
      case 'GND':   return { x: cx + 38, y: cy + 74 };
      case 'SIG_A': return { x: cx + 52, y: cy + 74 };
      case 'SIG_B': return { x: cx + 66, y: cy + 74 };
      default: return { x: cx + 45, y: cy + 74 };
    }
  }

  if (category === 'hall') {
    switch (pinName) {
      case 'VCC': return { x: cx + 22, y: cy + 74 };
      case 'GND': return { x: cx + 36, y: cy + 74 };
      case 'OUT': return { x: cx + 50, y: cy + 74 };
      default: return { x: cx + 36, y: cy + 74 };
    }
  }

  if (category === 'hx711' || category === 'loadcell') {
    switch (pinName) {
      case 'VCC': return { x: cx + 97, y: cy + 70 };
      case 'GND': return { x: cx + 107, y: cy + 70 };
      case 'DT':  return { x: cx + 117, y: cy + 70 };
      case 'SCK': return { x: cx + 127, y: cy + 70 };
      default: return { x: cx + 112, y: cy + 70 };
    }
  }

  // Fallback
  return { x: cx + 40, y: cy + 40 };
}

// Generate smooth cubic bezier SVG path between two pins with natural sag
function buildWireBezierPath(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  slackVal: number = 30
): string {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy);

  // Vertical sag influenced by distance and user slack
  const sag = (dist * 0.18 + slackVal) * (p1.y > p2.y ? 1 : 0.85);

  const cp1x = p1.x + dx * 0.28;
  const cp1y = p1.y + dy * 0.15 + sag;

  const cp2x = p1.x + dx * 0.72;
  const cp2y = p2.y - dy * 0.15 + sag;

  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const WokwiVirtualBreadboard: React.FC<WokwiVirtualBreadboardProps> = ({
  experimentId = 'exp_pir_servo_buzzer',
  activeWiringStep: propActiveWiringStep,
  onStepChange,
  className = '',
  interactive = true,
  showControls = true,
  onStimulusChange,
}) => {
  // Circuit configuration
  const circuit = useMemo(() => {
    return WOKWI_CIRCUITS[experimentId] || WOKWI_CIRCUITS['exp_pir_servo_buzzer'];
  }, [experimentId]);

  // Step-by-step wiring state
  const [internalStep, setInternalStep] = useState<number>(-1);
  const activeWiringStep =
    propActiveWiringStep !== undefined ? propActiveWiringStep : internalStep;

  // Viewport zoom & pan
  const [zoom, setZoom] = useState<number>(0.92);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 10 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Stimulus interactive state
  const [stimulus, setStimulus] = useState<InteractiveStimulusState>({
    targetPos: { x: 380, y: 80 },
    servoAngle: 0,
    distanceCm: 25.4,
    obstacleDetected: false,
    motorRpm: 1850,
    eggPressure: 42.8,
    lightAngle: 35,
    sunPos: { x: 580, y: 40 },
    potentiometerValue: 512,
    imuPitch: 4.2,
    imuRoll: -1.1,
    isPIRTriggered: false,
    lineTrackOffset: 0,
    isTared: false,
    hallTriggered: true,
    buzzerActive: false,
    buzzerFreq: 1000,
  });

  // Dragging in SVG canvas (for stimuli)
  const [draggingTarget, setDraggingTarget] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Sync stimulus change
  useEffect(() => {
    if (onStimulusChange) {
      onStimulusChange(stimulus);
    }
  }, [stimulus, onStimulusChange]);

  // Audio tone generation for active buzzer
  const playTone = useCallback((freq: number, durationMs: number = 100) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio playback fallback
    }
  }, [soundEnabled]);

  // Dynamic simulation loop (animates motors, servos, signals)
  useEffect(() => {
    let animId: number;
    let frame = 0;

    const loop = () => {
      frame++;

      setStimulus((prev) => {
        let next = { ...prev };

        // 1. PIR Simulation
        if (circuit.experimentId === 'exp_pir_servo_buzzer') {
          // Distance between PIR and target hand
          const pirX = 480;
          const pirY = 110;
          const dist = Math.hypot(prev.targetPos.x - pirX, prev.targetPos.y - pirY);
          const triggered = dist < 160;

          const targetAngle = triggered ? 90 : 0;
          const angleDelta = (targetAngle - prev.servoAngle) * 0.12;

          next.isPIRTriggered = triggered;
          next.servoAngle = Math.round(prev.servoAngle + angleDelta);
          next.buzzerActive = triggered && frame % 30 < 15;

          if (triggered && frame % 45 === 0) {
            playTone(1800, 80);
          }
        }

        // 2. Ultrasonic Sonar Simulation
        if (circuit.experimentId === 'exp_ultrasonic_radar') {
          // Obstacle target distance
          const sonarX = 540;
          const dist = Math.max(
            3,
            Math.min(180, Math.hypot(prev.targetPos.x - sonarX, prev.targetPos.y - 110) * 0.35)
          );
          next.distanceCm = parseFloat(dist.toFixed(1));
          next.obstacleDetected = dist < 20;

          // Servo radar sweep oscillation
          const sweepAngle = Math.round(90 + Math.sin(frame * 0.04) * 75);
          next.servoAngle = sweepAngle;

          if (dist < 20 && frame % 20 === 0) {
            playTone(2400, 60);
          }
        }

        // 3. Dual IR Line Follower
        if (circuit.experimentId === 'exp_ir_line_follower') {
          const offset = Math.sin(frame * 0.05) * 45;
          next.lineTrackOffset = offset;
        }

        // 4. MPU-6050 Balancing Robot
        if (circuit.experimentId === 'exp_mpu6050_balancing') {
          const wobble = Math.sin(frame * 0.08) * 8.5;
          next.imuPitch = parseFloat((wobble).toFixed(2));
          next.imuRoll = parseFloat((Math.cos(frame * 0.06) * 4.2).toFixed(2));
        }

        // 5. Dual LDR Solar Tracker
        if (circuit.experimentId === 'exp_ldr_solar_tracker') {
          const sunX = prev.sunPos.x;
          const trackerX = 520;
          const deltaX = sunX - trackerX;
          const targetAngle = Math.max(15, Math.min(165, 90 + deltaX * 0.35));
          const angleDelta = (targetAngle - prev.servoAngle) * 0.08;
          next.servoAngle = Math.round(prev.servoAngle + angleDelta);
        }

        // 6. Optical Encoder PID Motor
        if (circuit.experimentId === 'exp_encoder_motor_pid') {
          const jitter = (Math.random() - 0.5) * 20;
          next.motorRpm = Math.round(1800 + jitter);
        }

        // 7. Hall Effect Tachometer
        if (circuit.experimentId === 'exp_hall_effect_tachometer') {
          next.hallTriggered = frame % 12 < 3;
          if (next.hallTriggered && frame % 12 === 0) {
            playTone(850, 20);
          }
        }

        // 8. Load Cell & Egg Gripper
        if (circuit.experimentId === 'exp_loadcell_smart_gripper') {
          if (prev.eggPressure > 80 && frame % 30 === 0) {
            playTone(3200, 100);
          }
        }

        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [circuit.experimentId, playTone]);

  // Step change navigation
  const handleStepSelect = (step: number) => {
    setInternalStep(step);
    if (onStepChange) {
      onStepChange(step);
    }
  };

  const handleNextStep = () => {
    const maxSteps = circuit.wiringSteps.length - 1;
    if (activeWiringStep === -1) {
      handleStepSelect(0);
    } else if (activeWiringStep < maxSteps) {
      handleStepSelect(activeWiringStep + 1);
    } else {
      handleStepSelect(-1); // complete
    }
  };

  const handlePrevStep = () => {
    if (activeWiringStep === -1) {
      handleStepSelect(circuit.wiringSteps.length - 1);
    } else if (activeWiringStep > 0) {
      handleStepSelect(activeWiringStep - 1);
    } else {
      handleStepSelect(-1);
    }
  };

  // Pan handlers
  const handleMouseDownSvg = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'workbench-bg') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMoveSvg = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (draggingTarget && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = (e.clientX - rect.left - pan.x) / zoom;
      const svgY = (e.clientY - rect.top - pan.y) / zoom;

      if (draggingTarget === 'stimulus_target') {
        setStimulus((prev) => ({
          ...prev,
          targetPos: { x: svgX, y: svgY },
        }));
      } else if (draggingTarget === 'sun_target') {
        setStimulus((prev) => ({
          ...prev,
          sunPos: { x: svgX, y: svgY },
        }));
      }
    }
  };

  const handleMouseUpSvg = () => {
    setIsPanning(false);
    setDraggingTarget(null);
  };

  // Wire filtering based on active step
  const visibleWires = useMemo(() => {
    if (activeWiringStep === -1 || activeWiringStep === undefined) {
      return circuit.wires;
    }
    return circuit.wires.filter((w) => w.stepIndex <= activeWiringStep);
  }, [circuit.wires, activeWiringStep]);

  const activeStepDetails = useMemo(() => {
    if (activeWiringStep === -1 || activeWiringStep === undefined) return null;
    return circuit.wiringSteps.find((s) => s.stepIndex === activeWiringStep);
  }, [circuit.wiringSteps, activeWiringStep]);

  // Calculate LCD Telemetry lines
  const lcdTelemetry = useMemo(() => {
    switch (circuit.experimentId) {
      case 'exp_pir_servo_buzzer':
        return {
          line1: stimulus.isPIRTriggered ? 'PIR: MOTION DET!' : 'SEC: MONITORING',
          line2: stimulus.isPIRTriggered
            ? `GATE: OPEN  ${stimulus.servoAngle}°`
            : `GATE: CLOSED ${stimulus.servoAngle}°`,
        };
      case 'exp_ultrasonic_radar':
        return {
          line1: `DIST: ${stimulus.distanceCm.toFixed(1)} cm`,
          line2: `AZIMUTH: ${stimulus.servoAngle}° RADAR`,
        };
      case 'exp_ir_line_follower':
        return {
          line1: stimulus.lineTrackOffset < 0 ? 'IR: L-TAPE REF' : 'IR: R-TAPE REF',
          line2: `DIFF: ${(stimulus.lineTrackOffset).toFixed(0)} PWM TRACK`,
        };
      case 'exp_mpu6050_balancing':
        return {
          line1: `PITCH: ${stimulus.imuPitch > 0 ? '+' : ''}${stimulus.imuPitch.toFixed(1)}°`,
          line2: `ROLL:  ${stimulus.imuRoll > 0 ? '+' : ''}${stimulus.imuRoll.toFixed(1)}° BAL`,
        };
      case 'exp_ldr_solar_tracker':
        return {
          line1: `SOLAR AZ: ${stimulus.servoAngle}°`,
          line2: `SUN X: ${stimulus.sunPos.x.toFixed(0)} LUX BAL`,
        };
      case 'exp_encoder_motor_pid':
        return {
          line1: `RPM: ${stimulus.motorRpm} ACT`,
          line2: 'SET: 1800 PID: 72%',
        };
      case 'exp_hall_effect_tachometer':
        return {
          line1: stimulus.hallTriggered ? 'HALL: S-POLE DET' : 'HALL: IDLE HIGH',
          line2: 'TACH: 1420 RPM',
        };
      case 'exp_loadcell_smart_gripper':
        return {
          line1: `FORCE: ${stimulus.eggPressure.toFixed(1)} g`,
          line2: stimulus.eggPressure > 80 ? 'CRACK WARNING!' : 'STATUS: EGG SAFE',
        };
      default:
        return { line1: 'SYSTEM READY', line2: 'ARDUINO UNO R3' };
    }
  }, [circuit.experimentId, stimulus]);

  return (
    <div className={`relative flex flex-col w-full rounded-3xl overflow-hidden bg-ink-950 border border-ink-800 shadow-2xl select-none ${className}`}>
      {/* -------------------------------------------------------------------- */}
      {/* HEADER CONTROL BAR */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-ink-900/90 backdrop-blur-md border-b border-ink-800 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-400">
                Wokwi Breadboard Lab
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                60 FPS SIM
              </span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">{circuit.title}</h3>
          </div>
        </div>

        {/* View Controls & Sound */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playTone(1200, 100);
            }}
            className={`p-2 rounded-xl text-xs font-mono font-bold transition-all border ${
              soundEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'bg-ink-800/80 text-ink-400 border-ink-700 hover:text-white'
            }`}
            title={soundEnabled ? 'Mute Procedural Sound' : 'Enable Procedural Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Zoom In */}
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
            className="p-2 rounded-xl bg-ink-800/80 text-ink-300 hover:text-white border border-ink-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
            className="p-2 rounded-xl bg-ink-800/80 text-ink-300 hover:text-white border border-ink-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset Zoom */}
          <button
            onClick={() => {
              setZoom(0.92);
              setPan({ x: 20, y: 10 });
            }}
            className="p-2 rounded-xl bg-ink-800/80 text-ink-300 hover:text-white border border-ink-700 transition-colors"
            title="Reset Viewport"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* STEP-BY-STEP WIRING NAVIGATION BAR */}
      {/* -------------------------------------------------------------------- */}
      {showControls && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-2.5 bg-ink-900/60 border-b border-ink-800/80 text-xs font-mono z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ink-400 font-semibold">Wiring Mode:</span>
            <div className="flex flex-wrap items-center gap-1 bg-ink-950 p-1 rounded-xl border border-ink-800">
              <button
                onClick={() => handleStepSelect(-1)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeWiringStep === -1
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'text-ink-400 hover:text-white'
                }`}
              >
                Complete Circuit
              </button>
              {circuit.wiringSteps.map((step) => (
                <button
                  key={step.stepIndex}
                  onClick={() => handleStepSelect(step.stepIndex)}
                  className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center transition-all ${
                    activeWiringStep === step.stepIndex
                      ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-400/40'
                      : activeWiringStep > step.stepIndex || activeWiringStep === -1
                      ? 'bg-ink-800 text-emerald-400'
                      : 'text-ink-500 hover:text-white'
                  }`}
                  title={step.title}
                >
                  {step.stepIndex + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Stepper Prev / Next Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-ink-800 hover:bg-ink-700 text-ink-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <span>{activeWiringStep === circuit.wiringSteps.length - 1 ? 'Finish' : 'Next Step'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* ACTIVE STEP TIP CARD (FLOATING BANNER) */}
      {/* -------------------------------------------------------------------- */}
      {activeStepDetails && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs z-10 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                STEP {activeStepDetails.stepIndex + 1} OF {circuit.wiringSteps.length}
              </span>
              <span className="font-bold text-white text-sm">{activeStepDetails.title}</span>
            </div>
            <p className="text-ink-300 text-xs font-mono">{activeStepDetails.instruction}</p>
          </div>

          <div className="shrink-0 p-2.5 rounded-xl bg-ink-950/80 border border-white/5 space-y-1 sm:max-w-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 font-bold uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Engineering Audit</span>
            </div>
            <p className="text-[11px] text-ink-300 leading-snug">
              {activeStepDetails.engineeringTip}
            </p>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* INTERACTIVE WORKBENCH SVG CANVAS */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative w-full h-[480px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-[#0d1117] cursor-grab active:cursor-grabbing">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="w-full h-full block"
          onMouseDown={handleMouseDownSvg}
          onMouseMove={handleMouseMoveSvg}
          onMouseUp={handleMouseUpSvg}
          onMouseLeave={handleMouseUpSvg}
        >
          {/* DEFINITIONS & FILTERS */}
          <defs>
            {/* ESD Mat Grid Pattern */}
            <pattern id="workbenchGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f293d" strokeWidth="0.8" opacity="0.6" />
              <circle cx="20" cy="20" r="0.8" fill="#334155" opacity="0.4" />
            </pattern>

            {/* Neon Glow Filter for Active Current Pulsing Wires */}
            <filter id="neonPulseGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Wire Shadow Filter */}
            <filter id="wireDropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="3" dy="4" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.75" />
            </filter>

            {/* Arduino Uno PCB Gradient (Authentic Teal) */}
            <linearGradient id="arduinoPcbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00646e" />
              <stop offset="40%" stopColor="#005a63" />
              <stop offset="100%" stopColor="#00474e" />
            </linearGradient>

            {/* Metallic Silver Header Shield */}
            <linearGradient id="silverMetalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Breadboard Off-White Body Gradient */}
            <linearGradient id="breadboardBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            {/* LCD Backlight Blue Glow */}
            <radialGradient id="lcdBacklightGrad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="70%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#172554" />
            </radialGradient>

            {/* Fresnel Dome Gradient (PIR) */}
            <radialGradient id="fresnelDomeGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>

            {/* Ultrasonic Aluminum Transducer Cans */}
            <radialGradient id="sonarCanGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>

            {/* SG90 Servo Blue Plastic Shell */}
            <linearGradient id="servoShellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* WORKBENCH BACKGROUND WITH ESD GRID */}
          <rect
            id="workbench-bg"
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#workbenchGrid)"
          />

          {/* MAIN TRANSFORM CONTAINER (ZOOM & PAN) */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* -------------------------------------------------------------- */}
            {/* ARDUINO UNO R3 BOARD */}
            {/* -------------------------------------------------------------- */}
            <g
              transform={`translate(${circuit.arduinoPosition.x}, ${circuit.arduinoPosition.y})`}
              filter="drop-shadow(0px 14px 20px rgba(0,0,0,0.6))"
            >
              {/* PCB Base Outline (Authentic Contour with USB notch) */}
              <path
                d="M 12 0 L 328 0 A 12 12 0 0 1 340 12 L 340 228 A 12 12 0 0 1 328 240 L 12 240 A 12 12 0 0 1 0 228 L 0 12 A 12 12 0 0 1 12 0 Z"
                fill="url(#arduinoPcbGrad)"
                stroke="#00878a"
                strokeWidth="1.5"
              />

              {/* 4 Corner Standoff Screw Holes with Gold Ring */}
              {[
                { cx: 16, cy: 50 },
                { cx: 324, cy: 30 },
                { cx: 324, cy: 210 },
                { cx: 16, cy: 190 },
              ].map((hole, idx) => (
                <g key={idx}>
                  <circle cx={hole.cx} cy={hole.cy} r="6" fill="#ca8a04" opacity="0.8" />
                  <circle cx={hole.cx} cy={hole.cy} r="4" fill="#0d1117" />
                </g>
              ))}

              {/* USB-B Metal Socket */}
              <rect x="-8" y="18" width="58" height="42" rx="4" fill="url(#silverMetalGrad)" stroke="#475569" strokeWidth="1.2" />
              <rect x="0" y="24" width="38" height="30" rx="2" fill="#0f172a" />
              <rect x="10" y="32" width="18" height="14" rx="1" fill="#0284c7" />

              {/* DC Barrel Jack */}
              <rect x="-8" y="156" width="52" height="48" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
              <circle cx="18" cy="180" r="9" fill="#0f172a" />
              <circle cx="18" cy="180" r="4.5" fill="#94a3b8" />

              {/* 16 MHz Quartz Crystal (HC-49 Silver Can) */}
              <rect x="74" y="98" width="36" height="16" rx="8" fill="url(#silverMetalGrad)" stroke="#64748b" strokeWidth="1" />
              <text x="92" y="109" fill="#334155" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                16.000
              </text>

              {/* ATmega328P DIP-28 IC Socket & Chip */}
              <g transform="translate(148, 122)">
                {/* Black IC Socket Base */}
                <rect x="0" y="0" width="124" height="42" rx="3" fill="#111827" stroke="#374151" strokeWidth="1" />
                {/* Notch on Left */}
                <path d="M 0 16 A 5 5 0 0 1 0 26 Z" fill="#030712" />
                {/* DIP Legs (top and bottom) */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <React.Fragment key={i}>
                    <rect x={12 + i * 7.5} y="-3" width="3.5" height="4" fill="#94a3b8" />
                    <rect x={12 + i * 7.5} y="41" width="3.5" height="4" fill="#94a3b8" />
                  </React.Fragment>
                ))}
                {/* Laser Engraved Silkscreen */}
                <text x="62" y="24" fill="#9ca3af" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold" letterSpacing="0.5">
                  ATMEGA328P-PU
                </text>
              </g>

              {/* Reset Button (Red Tactile Switch) */}
              <rect x="58" y="18" width="22" height="22" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
              <circle cx="69" cy="29" r="6" fill="#dc2626" />

              {/* Power ON LED (Green) & L LED (Pin 13 Amber) */}
              <circle cx="270" cy="80" r="3" fill="#22c55e" filter="drop-shadow(0 0 4px #22c55e)" />
              <text x="270" y="92" fill="#e2e8f0" fontSize="6.5" fontFamily="monospace" textAnchor="middle">ON</text>

              <circle
                cx="248"
                cy="80"
                r="3"
                fill={stimulus.servoAngle > 0 || stimulus.isPIRTriggered ? '#f59e0b' : '#78350f'}
                filter={stimulus.servoAngle > 0 || stimulus.isPIRTriggered ? 'drop-shadow(0 0 4px #f59e0b)' : undefined}
              />
              <text x="248" y="92" fill="#e2e8f0" fontSize="6.5" fontFamily="monospace" textAnchor="middle">L</text>

              {/* TX and RX LEDs */}
              <circle cx="248" cy="104" r="2.5" fill="#f59e0b" opacity="0.85" />
              <text x="238" y="106" fill="#94a3b8" fontSize="6" fontFamily="monospace">TX</text>
              <circle cx="270" cy="104" r="2.5" fill="#f59e0b" opacity="0.6" />
              <text x="280" y="106" fill="#94a3b8" fontSize="6" fontFamily="monospace">RX</text>

              {/* Arduino Silkscreen Branding */}
              <text x="88" y="58" fill="#ffffff" fontSize="13" fontFamily="sans-serif" fontWeight="900" letterSpacing="1">
                ARDUINO
              </text>
              <text x="88" y="74" fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                UNO
              </text>
              <text x="88" y="85" fill="#94a3b8" fontSize="7" fontFamily="monospace">
                MADE IN ITALY
              </text>

              {/* ------------------------------------------------------------ */}
              {/* FEMALE PIN HEADERS */}
              {/* ------------------------------------------------------------ */}
              {/* 1. Upper Header Left: SCL, SDA, AREF, GND, D13 - D8 (10 pins) */}
              <g transform="translate(136, 6)">
                <rect x="0" y="0" width="120" height="18" rx="2" fill="#111827" stroke="#374151" strokeWidth="1" />
                {['SCL', 'SDA', 'AREF', 'GND', '13', '12', '~11', '~10', '~9', '8'].map((label, idx) => (
                  <g key={idx} transform={`translate(${6 + idx * 11.5}, 4)`}>
                    <rect x="0" y="0" width="7" height="9" rx="1" fill="#030712" />
                    <rect x="1.5" y="2" width="4" height="5" fill="#94a3b8" />
                    <text x="3.5" y="22" fill="#f8fafc" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {label}
                    </text>
                  </g>
                ))}
                <text x="60" y="-3" fill="#cbd5e1" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  DIGITAL (PWM~)
                </text>
              </g>

              {/* 2. Upper Header Right: D7 - D0 (8 pins) */}
              <g transform="translate(268, 6)">
                <rect x="0" y="0" width="68" height="18" rx="2" fill="#111827" stroke="#374151" strokeWidth="1" />
                {['7', '~6', '~5', '4', '~3', '2', 'TX>1', 'RX<0'].map((label, idx) => (
                  <g key={idx} transform={`translate(${4 + idx * 8}, 4)`}>
                    <rect x="0" y="0" width="5.5" height="9" rx="1" fill="#030712" />
                    <rect x="1" y="2" width="3.5" height="5" fill="#94a3b8" />
                    <text x="2.7" y="22" fill="#f8fafc" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {label}
                    </text>
                  </g>
                ))}
              </g>

              {/* 3. Lower Header Left: POWER (IOREF, RESET, 3.3V, 5V, GND, GND, VIN) */}
              <g transform="translate(150, 216)">
                <rect x="0" y="0" width="94" height="18" rx="2" fill="#111827" stroke="#374151" strokeWidth="1" />
                {['IOREF', 'RST', '3.3V', '5V', 'GND', 'GND', 'VIN'].map((label, idx) => (
                  <g key={idx} transform={`translate(${5 + idx * 12.5}, 4)`}>
                    <rect x="0" y="0" width="7" height="9" rx="1" fill="#030712" />
                    <rect x="1.5" y="2" width="4" height="5" fill="#94a3b8" />
                    <text x="3.5" y="-3" fill="#f8fafc" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {label}
                    </text>
                  </g>
                ))}
                <text x="47" y="26" fill="#cbd5e1" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  POWER
                </text>
              </g>

              {/* 4. Lower Header Right: ANALOG IN (A0 to A5) */}
              <g transform="translate(256, 216)">
                <rect x="0" y="0" width="78" height="18" rx="2" fill="#111827" stroke="#374151" strokeWidth="1" />
                {['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].map((label, idx) => (
                  <g key={idx} transform={`translate(${6 + idx * 11.5}, 4)`}>
                    <rect x="0" y="0" width="7" height="9" rx="1" fill="#030712" />
                    <rect x="1.5" y="2" width="4" height="5" fill="#94a3b8" />
                    <text x="3.5" y="-3" fill="#f8fafc" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {label}
                    </text>
                  </g>
                ))}
                <text x="39" y="26" fill="#cbd5e1" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  ANALOG IN
                </text>
              </g>
            </g>

            {/* -------------------------------------------------------------- */}
            {/* SOLDERLESS BREADBOARD (HALF-SIZE 30 ROWS) */}
            {/* -------------------------------------------------------------- */}
            <g
              transform={`translate(${circuit.breadboardPosition.x}, ${circuit.breadboardPosition.y})`}
              filter="drop-shadow(0px 16px 24px rgba(0,0,0,0.55))"
            >
              {/* Off-White ABS Plastic Casing */}
              <rect
                x="0"
                y="0"
                width="480"
                height="220"
                rx="8"
                fill="url(#breadboardBodyGrad)"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />

              {/* Interlocking Dovetail Side Tabs */}
              <path d="M 0 60 L -6 68 L -6 82 L 0 90 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
              <path d="M 0 130 L -6 138 L -6 152 L 0 160 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
              <path d="M 480 60 L 486 68 L 486 82 L 480 90 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

              {/* Red Positive (+) Stripe & Blue Negative (-) Stripe on Top Rail */}
              <line x1="28" y1="22" x2="460" y2="22" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="28" y1="36" x2="460" y2="36" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
              <text x="16" y="24" fill="#2563eb" fontSize="10" fontFamily="monospace" fontWeight="bold">-</text>
              <text x="16" y="38" fill="#dc2626" fontSize="10" fontFamily="monospace" fontWeight="bold">+</text>

              {/* Bottom Power Rail Stripes */}
              <line x1="28" y1="184" x2="460" y2="184" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="28" y1="198" x2="460" y2="198" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
              <text x="16" y="186" fill="#dc2626" fontSize="10" fontFamily="monospace" fontWeight="bold">+</text>
              <text x="16" y="200" fill="#2563eb" fontSize="10" fontFamily="monospace" fontWeight="bold">-</text>

              {/* Center IC Divider Trough */}
              <rect x="24" y="112" width="440" height="8" rx="2" fill="#cbd5e1" opacity="0.75" />

              {/* Column Letter Labels */}
              {['a', 'b', 'c', 'd', 'e'].map((letter, idx) => (
                <text key={letter} x="20" y={62 + idx * 12} fill="#64748b" fontSize="7" fontFamily="monospace">
                  {letter}
                </text>
              ))}
              {['f', 'g', 'h', 'i', 'j'].map((letter, idx) => (
                <text key={letter} x="20" y={128 + idx * 12} fill="#64748b" fontSize="7" fontFamily="monospace">
                  {letter}
                </text>
              ))}

              {/* 30 Tie-Point Columns with Holes */}
              {Array.from({ length: 30 }).map((_, colIdx) => {
                const x = 36 + colIdx * 14.8;
                return (
                  <g key={colIdx}>
                    {/* Column Number (every 5th) */}
                    {(colIdx + 1) % 5 === 0 && (
                      <text x={x} y="52" fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">
                        {colIdx + 1}
                      </text>
                    )}

                    {/* Top Rail Holes: Blue (-) and Red (+) */}
                    <rect x={x - 2.5} y="19" width="5" height="5" rx="1" fill="#1e293b" />
                    <rect x={x - 1} y="20.5" width="2" height="2" fill="#94a3b8" />

                    <rect x={x - 2.5} y="33" width="5" height="5" rx="1" fill="#1e293b" />
                    <rect x={x - 1} y="34.5" width="2" height="2" fill="#94a3b8" />

                    {/* Rows A - E (Upper Block) */}
                    {[0, 1, 2, 3, 4].map((rowIdx) => (
                      <React.Fragment key={rowIdx}>
                        <rect x={x - 2.5} y={56 + rowIdx * 12} width="5" height="5" rx="1" fill="#1e293b" />
                        <rect x={x - 1} y={57.5 + rowIdx * 12} width="2" height="2" fill="#94a3b8" />
                      </React.Fragment>
                    ))}

                    {/* Rows F - J (Lower Block) */}
                    {[0, 1, 2, 3, 4].map((rowIdx) => (
                      <React.Fragment key={rowIdx}>
                        <rect x={x - 2.5} y={122 + rowIdx * 12} width="5" height="5" rx="1" fill="#1e293b" />
                        <rect x={x - 1} y={123.5 + rowIdx * 12} width="2" height="2" fill="#94a3b8" />
                      </React.Fragment>
                    ))}

                    {/* Bottom Rail Holes: Red (+) and Blue (-) */}
                    <rect x={x - 2.5} y="181" width="5" height="5" rx="1" fill="#1e293b" />
                    <rect x={x - 1} y="182.5" width="2" height="2" fill="#94a3b8" />

                    <rect x={x - 2.5} y="195" width="5" height="5" rx="1" fill="#1e293b" />
                    <rect x={x - 1} y="196.5" width="2" height="2" fill="#94a3b8" />
                  </g>
                );
              })}
            </g>

            {/* -------------------------------------------------------------- */}
            {/* ELECTRONIC MODULES (PER EXPERIMENT) */}
            {/* Dynamic coordinate extraction from circuit.components */}
            {/* -------------------------------------------------------------- */}
            {(() => {
              const pirComp = circuit.components.find((c) => c.type === 'pir_hc_sr501' || c.id.startsWith('pir'));
              const pirX = pirComp ? pirComp.x : 480;
              const pirY = pirComp ? pirComp.y : 110;

              const sonarComp = circuit.components.find((c) => c.type === 'ultrasonic_hc_sr04' || c.id.startsWith('sonar'));
              const sonarX = sonarComp ? sonarComp.x : 540;
              const sonarY = sonarComp ? sonarComp.y : 110;

              const servoComp = circuit.components.find((c) => c.type === 'servo_sg90' || c.id.startsWith('servo'));
              const servoX = servoComp ? servoComp.x : 770;
              const servoY = servoComp ? servoComp.y : 120;

              const lcdComp = circuit.components.find((c) => c.type === 'lcd1602_i2c' || c.id.startsWith('lcd'));
              const lcdX = lcdComp ? lcdComp.x : 980;
              const lcdY = lcdComp ? lcdComp.y : 290;

              const buzzerComp = circuit.components.find((c) => c.type === 'piezo_buzzer' || c.id.startsWith('buzzer'));
              const buzzerX = buzzerComp ? buzzerComp.x : 770;
              const buzzerY = buzzerComp ? buzzerComp.y : 160;

              const tcrtComp = circuit.components.find((c) => c.type === 'tcrt5000_ir' || c.id.startsWith('tcrt') || c.id.startsWith('ir'));
              const tcrtX = tcrtComp ? tcrtComp.x : 480;
              const tcrtY = tcrtComp ? tcrtComp.y : 110;

              const l298nComp = circuit.components.find((c) => c.type === 'l298n_motor_driver' || c.id.startsWith('l298n'));
              const l298nX = l298nComp ? l298nComp.x : 820;
              const l298nY = l298nComp ? l298nComp.y : 110;

              const mpuComp = circuit.components.find((c) => c.type === 'mpu6050_imu' || c.id.startsWith('mpu'));
              const mpuX = mpuComp ? mpuComp.x : 540;
              const mpuY = mpuComp ? mpuComp.y : 120;

              const ldrComp = circuit.components.find((c) => c.type === 'dual_ldr_tracker' || c.id.startsWith('ldr'));
              const ldrX = ldrComp ? ldrComp.x : 520;
              const ldrY = ldrComp ? ldrComp.y : 110;

              const encoderComp = circuit.components.find((c) => c.type === 'optical_encoder_motor' || c.id.startsWith('encoder'));
              const encoderX = encoderComp ? encoderComp.x : 520;
              const encoderY = encoderComp ? encoderComp.y : 110;

              const hx711Comp = circuit.components.find((c) => c.type === 'loadcell_hx711_gripper' || c.id.startsWith('hx711') || c.id.startsWith('loadcell'));
              const hx711X = hx711Comp ? hx711Comp.x : 500;
              const hx711Y = hx711Comp ? hx711Comp.y : 110;

              const hallComp = circuit.components.find((c) => c.type === 'hall_effect_sensor' || c.id.startsWith('hall'));
              const hallX = hallComp ? hallComp.x : 520;
              const hallY = hallComp ? hallComp.y : 110;

              return (
                <>
                  {/* 1. PIR SENSOR (HC-SR501) */}
                  {pirComp && (
                    <g transform={`translate(${pirX}, ${pirY})`} filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))">
                      {/* Green PCB Base */}
                      <rect x="0" y="0" width="60" height="74" rx="4" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
                      {/* White Faceted Fresnel Dome */}
                      <circle cx="30" cy="34" r="24" fill="url(#fresnelDomeGrad)" stroke="#cbd5e1" strokeWidth="1" />
                      {/* Honeycomb Facet Grid Silhouette */}
                      <circle cx="30" cy="34" r="16" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 2" />
                      <circle cx="30" cy="34" r="8" fill="none" stroke="#94a3b8" strokeWidth="0.8" />
                      {/* Dual Trimpots (Sensitivity & Time Delay) */}
                      <circle cx="16" cy="62" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
                      <line x1="13" y1="62" x2="19" y2="62" stroke="#78350f" strokeWidth="1" />
                      <circle cx="44" cy="62" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
                      <line x1="41" y1="62" x2="47" y2="62" stroke="#78350f" strokeWidth="1" />
                      {/* 3 Header Pins at Bottom: VCC(18,78), OUT(30,78), GND(42,78) */}
                      {['VCC', 'OUT', 'GND'].map((p, idx) => (
                        <g key={p} transform={`translate(${14 + idx * 12}, 74)`}>
                          <rect x="0" y="0" width="8" height="8" fill="#111827" />
                          <circle cx="4" cy="4" r="2" fill="#e2e8f0" />
                        </g>
                      ))}
                      {/* Thermal trigger LED */}
                      <circle
                        cx="50"
                        cy="12"
                        r="2.5"
                        fill={stimulus.isPIRTriggered ? '#ef4444' : '#7f1d1d'}
                        filter={stimulus.isPIRTriggered ? 'drop-shadow(0 0 4px #ef4444)' : undefined}
                      />
                      <text x="30" y="-4" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        HC-SR501 PIR
                      </text>
                    </g>
                  )}

                  {/* 2. ULTRASONIC SENSOR (HC-SR04) */}
                  {sonarComp && (
                    <g transform={`translate(${sonarX}, ${sonarY})`} filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))">
                      {/* Blue PCB Breakout */}
                      <rect x="0" y="0" width="108" height="80" rx="4" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1.5" />
                      {/* Left Transducer Can (T - Transmitter) */}
                      <circle cx="30" cy="38" r="22" fill="url(#sonarCanGrad)" stroke="#64748b" strokeWidth="1.5" />
                      <circle cx="30" cy="38" r="14" fill="#1e293b" opacity="0.6" />
                      <text x="30" y="42" fill="#ffffff" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="900">
                        T
                      </text>
                      {/* Right Transducer Can (R - Receiver) */}
                      <circle cx="78" cy="38" r="22" fill="url(#sonarCanGrad)" stroke="#64748b" strokeWidth="1.5" />
                      <circle cx="78" cy="38" r="14" fill="#1e293b" opacity="0.6" />
                      <text x="78" y="42" fill="#ffffff" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="900">
                        R
                      </text>
                      {/* 4 Header Pins at bottom: VCC(32,84), TRIG(47,84), ECHO(62,84), GND(77,84) */}
                      {['VCC', 'TRIG', 'ECHO', 'GND'].map((p, idx) => (
                        <g key={p} transform={`translate(${28 + idx * 15}, 80)`}>
                          <rect x="0" y="0" width="8" height="8" fill="#111827" />
                          <circle cx="4" cy="4" r="2" fill="#e2e8f0" />
                        </g>
                      ))}
                      {/* Emitted Sound Wave Cones (Animated) */}
                      <path
                        d="M 30 16 A 28 28 0 0 0 10 0"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        opacity="0.8"
                        strokeDasharray="4 3"
                      />
                      <path
                        d="M 30 10 A 38 38 0 0 0 2 -12"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        opacity="0.5"
                        strokeDasharray="5 3"
                      />
                      <text x="54" y="-4" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        HC-SR04 SONAR
                      </text>
                    </g>
                  )}

                  {/* 3. MICRO SERVO MOTOR (SG90) */}
                  {servoComp && (
                    <g transform={`translate(${servoX}, ${servoY})`} filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))">
                      {/* Blue Translucent Plastic Casing */}
                      <rect x="0" y="0" width="80" height="74" rx="4" fill="url(#servoShellGrad)" stroke="#0284c7" strokeWidth="1.5" />
                      {/* Mounting Flanges */}
                      <rect x="-14" y="24" width="14" height="24" fill="#0284c7" />
                      <circle cx="-7" cy="36" r="3" fill="#ca8a04" />
                      <rect x="80" y="24" width="14" height="24" fill="#0284c7" />
                      <circle cx="87" cy="36" r="3" fill="#ca8a04" />
                      {/* Main Gear Axis & Spline */}
                      <circle cx="28" cy="36" r="18" fill="#0369a1" />
                      {/* Dynamic White Rotating Servo Horn */}
                      <g transform={`translate(28, 36) rotate(${stimulus.servoAngle - 90})`}>
                        <path d="M -8 -8 L 48 -5 A 8 8 0 0 1 48 5 L -8 8 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                        <circle cx="0" cy="0" r="7" fill="#cbd5e1" />
                        <circle cx="0" cy="0" r="3" fill="#64748b" />
                        <circle cx="16" cy="0" r="2" fill="#64748b" />
                        <circle cx="28" cy="0" r="2" fill="#64748b" />
                        <circle cx="40" cy="0" r="2" fill="#64748b" />
                      </g>
                      {/* 3-Pin Cable Terminal Header at Bottom: GND(24,74), VCC(40,74), PWM(56,74) */}
                      {[
                        { name: 'GND', color: '#78350f', x: 24 },
                        { name: 'VCC', color: '#ef4444', x: 40 },
                        { name: 'PWM', color: '#f97316', x: 56 },
                      ].map((pin) => (
                        <g key={pin.name} transform={`translate(${pin.x - 4}, 70)`}>
                          <rect x="0" y="0" width="8" height="8" rx="1" fill="#111827" />
                          <circle cx="4" cy="4" r="2" fill={pin.color} />
                        </g>
                      ))}
                      {/* Angle Badge */}
                      <rect x="44" y="52" width="32" height="16" rx="3" fill="#0f172a" opacity="0.8" />
                      <text x="60" y="63" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        {stimulus.servoAngle}°
                      </text>
                      <text x="40" y="-4" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        SG90 SERVO
                      </text>
                    </g>
                  )}

                  {/* 4. 16x2 I2C LCD DISPLAY (HD44780 + PCF8574) */}
                  {lcdComp && (
                    <g transform={`translate(${lcdX}, ${lcdY})`} filter="drop-shadow(0 12px 18px rgba(0,0,0,0.65))">
                      {/* PCB Carrier Board (Dark Emerald/Blue) */}
                      <rect x="0" y="0" width="220" height="110" rx="4" fill="#0f2b38" stroke="#164e63" strokeWidth="2" />
                      {/* 4 Corner Standoffs */}
                      {[
                        { cx: 8, cy: 8 },
                        { cx: 212, cy: 8 },
                        { cx: 212, cy: 102 },
                        { cx: 8, cy: 102 },
                      ].map((s, idx) => (
                        <circle key={idx} cx={s.cx} cy={s.cy} r="4" fill="#ca8a04" />
                      ))}
                      {/* Golden Display Bezel Frame */}
                      <rect x="18" y="14" width="184" height="82" rx="2" fill="#020617" stroke="#334155" strokeWidth="1" />
                      {/* Active Blue Backlight Screen */}
                      <rect x="24" y="20" width="172" height="70" rx="1" fill="url(#lcdBacklightGrad)" />
                      {/* Live Dot-Matrix Character Display Rows */}
                      <g fontFamily="monospace" fontSize="11" fontWeight="bold" fill="#67e8f9">
                        <text x="32" y="46" letterSpacing="1">
                          {lcdTelemetry.line1}
                        </text>
                        <text x="32" y="72" letterSpacing="1">
                          {lcdTelemetry.line2}
                        </text>
                      </g>
                      {/* PCF8574 I2C Backpack Pins at top left: GND(13,-4), VCC(23,-4), SDA(33,-4), SCL(43,-4) */}
                      {['GND', 'VCC', 'SDA', 'SCL'].map((p, idx) => (
                        <g key={p} transform={`translate(${10 + idx * 10}, 0)`}>
                          <rect x="0" y="-8" width="6" height="8" fill="#1e293b" />
                          <circle cx="3" cy="-4" r="1.5" fill="#e2e8f0" />
                        </g>
                      ))}
                      <text x="110" y="104" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">
                        16x2 I2C (0x27)
                      </text>
                    </g>
                  )}

                  {/* 5. PIEZO BUZZER */}
                  {buzzerComp && (
                    <g transform={`translate(${buzzerX}, ${buzzerY})`} filter="drop-shadow(0 8px 12px rgba(0,0,0,0.5))">
                      {/* Cylindrical Black Plastic Housing */}
                      <circle cx="28" cy="28" r="24" fill="#111827" stroke="#374151" strokeWidth="2" />
                      {/* Central Acoustic Aperture Hole */}
                      <circle cx="28" cy="28" r="7" fill="#030712" />
                      {/* Polarity (+) Indicator */}
                      <text x="14" y="20" fill="#ef4444" fontSize="10" fontWeight="bold" fontFamily="sans-serif">+</text>
                      {/* Pins: POS at (17, 51), NEG at (37, 51) */}
                      <rect x="14" y="48" width="6" height="6" fill="#111827" />
                      <circle cx="17" cy="51" r="1.5" fill="#e2e8f0" />
                      <rect x="34" y="48" width="6" height="6" fill="#111827" />
                      <circle cx="37" cy="51" r="1.5" fill="#e2e8f0" />
                      {/* Concentric Acoustic Ripple Rings (When Sounding) */}
                      {stimulus.buzzerActive && (
                        <>
                          <circle cx="28" cy="28" r="32" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.8" strokeDasharray="3 3" />
                          <circle cx="28" cy="28" r="42" fill="none" stroke="#22c55e" strokeWidth="1.2" opacity="0.4" />
                        </>
                      )}
                      <text x="28" y="-4" fill="#ffffff" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        PIEZO BUZZER
                      </text>
                    </g>
                  )}

                  {/* 6. TCRT5000 DUAL IR SENSOR ARRAY */}
                  {tcrtComp && (
                    <g transform={`translate(${tcrtX}, ${tcrtY})`} filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))">
                      <rect x="0" y="0" width="72" height="74" rx="4" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="1.5" />
                      {/* Left Optical Sensor: Emitter (Clear Blue) + Detector (Black) */}
                      <rect x="10" y="16" width="22" height="26" rx="2" fill="#0f172a" />
                      <circle cx="16" cy="28" r="4" fill="#60a5fa" opacity="0.8" />
                      <circle cx="26" cy="28" r="4" fill="#020617" />
                      {/* Right Optical Sensor */}
                      <rect x="40" y="16" width="22" height="26" rx="2" fill="#0f172a" />
                      <circle cx="46" cy="28" r="4" fill="#60a5fa" opacity="0.8" />
                      <circle cx="56" cy="28" r="4" fill="#020617" />
                      {/* LM393 Dual Comparator IC */}
                      <rect x="22" y="48" width="28" height="16" rx="1" fill="#111827" />
                      {/* Indicator LEDs */}
                      <circle cx="14" cy="56" r="2" fill="#ef4444" />
                      <circle cx="58" cy="56" r="2" fill="#22c55e" />
                      {/* 4 Header Pins at Bottom: VCC(18,74), GND(30,74), D0(42,74), A0(54,74) */}
                      {['VCC', 'GND', 'D0', 'A0'].map((p, idx) => (
                        <g key={p} transform={`translate(${14 + idx * 12}, 70)`}>
                          <rect x="0" y="0" width="8" height="8" rx="1" fill="#111827" />
                          <circle cx="4" cy="4" r="2" fill="#ca8a04" />
                        </g>
                      ))}
                      <text x="36" y="-4" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        TCRT5000 IR
                      </text>
                    </g>
                  )}

                  {/* 7. L298N DUAL H-BRIDGE MOTOR DRIVER */}
                  {l298nComp && (
                    <g transform={`translate(${l298nX}, ${l298nY})`} filter="drop-shadow(0 14px 20px rgba(0,0,0,0.6))">
                      {/* Red Heavy-Duty PCB */}
                      <rect x="0" y="0" width="140" height="120" rx="4" fill="#991b1b" stroke="#b91c1c" strokeWidth="2" />
                      {/* Large Black Finned Aluminum Heatsink */}
                      <rect x="30" y="16" width="80" height="42" rx="3" fill="#18181b" stroke="#27272a" strokeWidth="1" />
                      {/* Heat Sink Extrusion Fins */}
                      {[0, 1, 2, 3, 4, 5, 6].map((fin) => (
                        <rect key={fin} x={36 + fin * 10} y="16" width="4" height="42" fill="#27272a" />
                      ))}
                      {/* Blue Screw Terminals for Motors & Power */}
                      <rect x="6" y="24" width="18" height="28" fill="#1d4ed8" rx="2" />
                      <rect x="116" y="24" width="18" height="28" fill="#1d4ed8" rx="2" />
                      <rect x="42" y="90" width="56" height="22" fill="#1d4ed8" rx="2" />
                      {/* Screw Heads */}
                      <circle cx="15" cy="32" r="3" fill="#94a3b8" />
                      <circle cx="15" cy="44" r="3" fill="#94a3b8" />
                      <circle cx="125" cy="32" r="3" fill="#94a3b8" />
                      <circle cx="125" cy="44" r="3" fill="#94a3b8" />
                      {/* TT DC Motor Wheels with Motion Blur */}
                      <g transform="translate(-50, 20)">
                        <circle cx="15" cy="15" r="20" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
                        <circle cx="15" cy="15" r="14" fill="#1f2937" />
                        {/* Rotating Wheel Spokes */}
                        <g transform={`rotate(${stimulus.motorRpm * 0.2}, 15, 15)`}>
                          <line x1="15" y1="3" x2="15" y2="27" stroke="#eab308" strokeWidth="2" />
                          <line x1="3" y1="15" x2="27" y2="15" stroke="#eab308" strokeWidth="2" />
                        </g>
                      </g>
                      {/* 6 Logic Pin Header: ENA(22,120), IN1(34,120), IN2(46,120), IN3(58,120), IN4(70,120), ENB(82,120) */}
                      {['ENA', 'IN1', 'IN2', 'IN3', 'IN4', 'ENB'].map((p, idx) => (
                        <g key={p} transform={`translate(${18 + idx * 12}, 116)`}>
                          <rect x="0" y="0" width="8" height="8" rx="1" fill="#111827" />
                          <circle cx="4" cy="4" r="1.5" fill="#ca8a04" />
                        </g>
                      ))}
                      {/* 3 Power Screw Terminals at bottom right: VMS(105,120), GND(118,120), 5V(131,120) */}
                      {[
                        { name: 'VMS', x: 105 },
                        { name: 'GND', x: 118 },
                        { name: '5V', x: 131 },
                      ].map((term) => (
                        <g key={term.name} transform={`translate(${term.x - 4}, 116)`}>
                          <rect x="0" y="0" width="8" height="8" rx="1" fill="#1e3a8a" />
                          <circle cx="4" cy="4" r="2" fill="#94a3b8" />
                        </g>
                      ))}
                      <text x="70" y="-4" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        L298N DUAL H-BRIDGE
                      </text>
                    </g>
                  )}

                  {/* 8. MPU-6050 6-DOF IMU (GY-521) */}
                  {mpuComp && (
                    <g transform={`translate(${mpuX}, ${mpuY})`} filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))">
                      <rect x="0" y="0" width="88" height="74" rx="4" fill="#1e3a8a" stroke="#2563eb" strokeWidth="1.5" />
                      {/* InvenSense QFN MEMS Sensor Chip */}
                      <rect x="28" y="16" width="32" height="32" rx="2" fill="#090d16" stroke="#334155" strokeWidth="1" />
                      <text x="44" y="34" fill="#94a3b8" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        MPU6050
                      </text>
                      {/* 3D Attitude Pitch/Roll Gimbal Horizon Overlay */}
                      <g transform="translate(44, 32)">
                        <circle cx="0" cy="0" r="12" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.8" />
                        <g transform={`rotate(${stimulus.imuRoll}) translate(0, ${stimulus.imuPitch * 0.4})`}>
                          <line x1="-10" y1="0" x2="10" y2="0" stroke="#f59e0b" strokeWidth="1.5" />
                        </g>
                      </g>
                      {/* 8 Header Pins: VCC(14.5,74), GND(23.5,74), SCL(32.5,74), SDA(41.5,74), XDA, XCL, AD0, INT(77.5,74) */}
                      {['VCC', 'GND', 'SCL', 'SDA', 'XDA', 'XCL', 'AD0', 'INT'].map((p, idx) => (
                        <g key={p} transform={`translate(${11 + idx * 9}, 70)`}>
                          <rect x="0" y="0" width="7" height="8" rx="1" fill="#111827" />
                          <circle cx="3.5" cy="4" r="1.5" fill="#ca8a04" />
                        </g>
                      ))}
                      <text x="44" y="-4" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        GY-521 IMU
                      </text>
                    </g>
                  )}

                  {/* 9. DUAL CDS PHOTORESISTORS SOLAR TRACKER */}
                  {ldrComp && (
                    <g transform={`translate(${ldrX}, ${ldrY})`} filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))">
                      <rect x="0" y="0" width="86" height="74" rx="4" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
                      {/* Left CdS Photoresistor */}
                      <circle cx="22" cy="34" r="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
                      <path d="M 12 28 Q 22 24 32 28 T 12 36 T 32 40" fill="none" stroke="#dc2626" strokeWidth="1.2" />
                      {/* Right CdS Photoresistor */}
                      <circle cx="64" cy="34" r="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
                      <path d="M 54 28 Q 64 24 74 28 T 54 36 T 74 40" fill="none" stroke="#dc2626" strokeWidth="1.2" />
                      {/* 3D Vertical Center Shadow Divider Fin (Baffle) */}
                      <rect x="41" y="10" width="4" height="48" fill="#0f172a" rx="1" />
                      {/* Directional Cast Shadow from Sun */}
                      <polygon
                        points={`43,10 ${43 + (stimulus.sunPos.x - 560) * 0.15},58 43,58`}
                        fill="#000000"
                        opacity="0.45"
                      />
                      {/* 4 Header Pins at Bottom: VCC(22,74), GND(36,74), OUT_L(50,74), OUT_R(64,74) */}
                      {['VCC', 'GND', 'OUT_L', 'OUT_R'].map((p, idx) => (
                        <g key={p} transform={`translate(${18 + idx * 14}, 70)`}>
                          <rect x="0" y="0" width="8" height="8" rx="1" fill="#111827" />
                          <circle cx="4" cy="4" r="2" fill="#ca8a04" />
                        </g>
                      ))}
                      <text x="43" y="-4" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        DUAL-LDR HELIOSTAT
                      </text>
                    </g>
                  )}

                  {/* 10. ROTARY QUADRATURE ENCODER MOTOR */}
                  {encoderComp && (
                    <g transform={`translate(${encoderX}, ${encoderY})`} filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))">
                      <rect x="0" y="0" width="90" height="74" rx="4" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
                      {/* Slotted Encoder Disc on Shaft */}
                      <g transform="translate(45, 36)">
                        <circle cx="0" cy="0" r="26" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                        {/* Radial Optical Slots */}
                        {Array.from({ length: 16 }).map((_, i) => (
                          <line
                            key={i}
                            x1="0"
                            y1="0"
                            x2="24"
                            y2="0"
                            stroke="#0f172a"
                            strokeWidth="2.5"
                            transform={`rotate(${i * 22.5 + stimulus.motorRpm * 0.1})`}
                          />
                        ))}
                        <circle cx="0" cy="0" r="7" fill="#ca8a04" />
                      </g>
                      {/* U-Shaped Optical Interrupter Photogate */}
                      <rect x="58" y="24" width="16" height="24" fill="#030712" rx="2" />
                      <circle cx="66" cy="30" r="2" fill="#ef4444" />
                      <circle cx="66" cy="42" r="2" fill="#22c55e" />
                      {/* 4 Header Pins at Bottom: VCC(24,74), GND(38,74), SIG_A(52,74), SIG_B(66,74) */}
                      {['VCC', 'GND', 'SIG_A', 'SIG_B'].map((p, idx) => (
                        <g key={p} transform={`translate(${20 + idx * 14}, 70)`}>
                          <rect x="0" y="0" width="8" height="8" rx="1" fill="#111827" />
                          <circle cx="4" cy="4" r="2" fill="#ca8a04" />
                        </g>
                      ))}
                      <text x="45" y="-4" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        OPTICAL ENCODER
                      </text>
                    </g>
                  )}

                  {/* 11. LOAD CELL & HX711 + DELICATE EGG GRIPPER */}
                  {hx711Comp && (
                    <g transform={`translate(${hx711X}, ${hx711Y})`} filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))">
                      {/* Aluminum Shear Beam Load Cell */}
                      <rect x="0" y="10" width="80" height="24" rx="2" fill="url(#silverMetalGrad)" stroke="#64748b" strokeWidth="1.5" />
                      <circle cx="14" cy="22" r="4.5" fill="#334155" />
                      <circle cx="66" cy="22" r="4.5" fill="#334155" />
                      {/* Purple HX711 Breakout Board */}
                      <rect x="90" y="4" width="46" height="66" rx="3" fill="#581c87" stroke="#7e22ce" strokeWidth="1.5" />
                      <rect x="100" y="20" width="26" height="16" fill="#090d16" rx="1" />
                      {/* HX711 4 Header Pins: VCC(97,70), GND(107,70), DT(117,70), SCK(127,70) */}
                      {['VCC', 'GND', 'DT', 'SCK'].map((p, idx) => (
                        <g key={p} transform={`translate(${93 + idx * 10}, 66)`}>
                          <rect x="0" y="0" width="8" height="8" rx="1" fill="#111827" />
                          <circle cx="4" cy="4" r="1.5" fill="#ca8a04" />
                        </g>
                      ))}
                      {/* Gripper Jaws with Delicate Egg */}
                      <g transform="translate(24, 42)">
                        {/* Left Jaw */}
                        <path d="M 0 0 L 10 20 L 6 24 Z" fill="#475569" />
                        {/* Right Jaw */}
                        <path d="M 32 0 L 22 20 L 26 24 Z" fill="#475569" />
                        {/* Speckled Test Egg */}
                        <ellipse cx="16" cy="18" rx="9" ry="12" fill="#fed7aa" stroke="#fb923c" strokeWidth="1" />
                        <circle cx="14" cy="14" r="0.8" fill="#c2410c" />
                        <circle cx="18" cy="19" r="0.8" fill="#c2410c" />
                      </g>
                      <text x="65" y="-4" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        HX711 & LOAD CELL
                      </text>
                    </g>
                  )}

                  {/* 12. HALL EFFECT SENSOR (A3144) */}
                  {hallComp && (
                    <g transform={`translate(${hallX}, ${hallY})`} filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))">
                      <rect x="0" y="0" width="76" height="74" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                      {/* TO-92 Transistor Package */}
                      <path d="M 28 20 L 48 20 L 44 38 L 32 38 Z" fill="#030712" stroke="#475569" strokeWidth="1" />
                      {/* Rotating Flywheel Disc with Neodymium Magnets */}
                      <g transform="translate(38, 52)">
                        <circle cx="0" cy="0" r="16" fill="#475569" />
                        <rect x="-12" y="-3" width="8" height="6" fill="#dc2626" />
                        <text x="-8" y="2" fill="#ffffff" fontSize="5" fontWeight="bold">N</text>
                        <rect x="4" y="-3" width="8" height="6" fill="#2563eb" />
                        <text x="8" y="2" fill="#ffffff" fontSize="5" fontWeight="bold">S</text>
                      </g>
                      {/* 3 Header Pins at Bottom: VCC(22,74), GND(36,74), OUT(50,74) */}
                      {['VCC', 'GND', 'OUT'].map((p, idx) => (
                        <g key={p} transform={`translate(${18 + idx * 14}, 70)`}>
                          <rect x="0" y="0" width="8" height="8" rx="1" fill="#111827" />
                          <circle cx="4" cy="4" r="2" fill="#ca8a04" />
                        </g>
                      ))}
                      <text x="38" y="-4" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        A3144 HALL SENSOR
                      </text>
                    </g>
                  )}
                </>
              );
            })()}

            {/* -------------------------------------------------------------- */}
            {/* JUMPER WIRES (LAYERED WITH DROP SHADOW & CURRENT PULSE) */}
            {/* -------------------------------------------------------------- */}
            {visibleWires.map((wire) => {
              const fromCoord = getPinCoordinates(wire.fromPin, circuit, circuit.components);
              const toCoord = getPinCoordinates(wire.toPin, circuit, circuit.components);
              const d = buildWireBezierPath(fromCoord, toCoord, wire.slack || 30);
              const isActiveWire =
                activeWiringStep !== undefined &&
                activeWiringStep !== -1 &&
                wire.stepIndex === activeWiringStep;

              return (
                <g key={wire.id}>
                  {/* Layer 1: Ambient Drop Shadow Under Wire */}
                  <path
                    d={d}
                    fill="none"
                    stroke="#000000"
                    strokeWidth="5"
                    strokeOpacity="0.45"
                    strokeLinecap="round"
                    transform="translate(2, 4)"
                  />

                  {/* Layer 2: Main Insulation Jacket Tube */}
                  <path
                    d={d}
                    fill="none"
                    stroke={wire.color}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Layer 3: Cylindrical Specular Highlight Streak */}
                  <path
                    d={d}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.1"
                    strokeOpacity="0.45"
                    strokeLinecap="round"
                  />

                  {/* Layer 4: Active Current Pulse Glow Filter (When wire is in active step) */}
                  {isActiveWire && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="3.8"
                      strokeDasharray="10 8"
                      filter="url(#neonPulseGlow)"
                      className="animate-pulse"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0; -36"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                    </path>
                  )}

                  {/* Terminal Pin Shrouds / Jumper Boots at wire ends */}
                  {/* Start Terminal */}
                  <circle cx={fromCoord.x} cy={fromCoord.y} r="3" fill="#111827" stroke="#e2e8f0" strokeWidth="0.8" />
                  {/* End Terminal */}
                  <circle cx={toCoord.x} cy={toCoord.y} r="3" fill="#111827" stroke="#e2e8f0" strokeWidth="0.8" />
                </g>
              );
            })}

            {/* -------------------------------------------------------------- */}
            {/* DRAGGABLE CANVAS STIMULUS TARGETS */}
            {/* -------------------------------------------------------------- */}

            {/* A. PIR Draggable Hand Target */}
            {circuit.experimentId === 'exp_pir_servo_buzzer' && (
              <g
                transform={`translate(${stimulus.targetPos.x}, ${stimulus.targetPos.y})`}
                className="cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingTarget('stimulus_target');
                }}
              >
                {/* Thermal Radiation Glow */}
                <circle cx="0" cy="0" r="38" fill="#f97316" opacity="0.25" filter="url(#neonPulseGlow)" />
                <circle cx="0" cy="0" r="22" fill="#ea580c" opacity="0.8" stroke="#fdba74" strokeWidth="2" />
                <Flame className="w-6 h-6 -translate-x-3 -translate-y-3 text-white pointer-events-none" />
                <rect x="-40" y="26" width="80" height="18" rx="4" fill="#0f172a" opacity="0.85" />
                <text x="0" y="38" fill="#fed7aa" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  DRAG HUMAN (307K)
                </text>
              </g>
            )}

            {/* B. Sonar Obstacle Block Target */}
            {circuit.experimentId === 'exp_ultrasonic_radar' && (
              <g
                transform={`translate(${stimulus.targetPos.x}, ${stimulus.targetPos.y})`}
                className="cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingTarget('stimulus_target');
                }}
              >
                {/* Acoustic Target Echo Box */}
                <rect x="-24" y="-30" width="48" height="60" rx="4" fill="#b45309" stroke="#fde68a" strokeWidth="2" />
                <text x="0" y="4" fill="#ffffff" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                  OBJECT
                </text>
                <rect x="-35" y="34" width="70" height="18" rx="4" fill="#0f172a" opacity="0.85" />
                <text x="0" y="46" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {stimulus.distanceCm.toFixed(1)} cm
                </text>
              </g>
            )}

            {/* C. Solar Radiant Sun Target */}
            {circuit.experimentId === 'exp_ldr_solar_tracker' && (
              <g
                transform={`translate(${stimulus.sunPos.x}, ${stimulus.sunPos.y})`}
                className="cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingTarget('sun_target');
                }}
              >
                {/* Radiant Sun Corona */}
                <circle cx="0" cy="0" r="32" fill="#facc15" opacity="0.3" filter="url(#neonPulseGlow)" />
                <circle cx="0" cy="0" r="18" fill="#eab308" stroke="#fef08a" strokeWidth="2" />
                <Sun className="w-6 h-6 -translate-x-3 -translate-y-3 text-white pointer-events-none" />
                <rect x="-35" y="24" width="70" height="18" rx="4" fill="#0f172a" opacity="0.85" />
                <text x="0" y="36" fill="#fef08a" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  DRAG SUN
                </text>
              </g>
            )}
          </g>
        </svg>

        {/* BOTTOM HUD FLOATING SLIDERS FOR DIRECT CONTROL */}
        {interactive && (
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-ink-950/85 backdrop-blur-md border border-ink-800 text-xs font-mono z-20">
            {/* PIR Sensitivity / Target Distance */}
            {circuit.experimentId === 'exp_pir_servo_buzzer' && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-ink-400 font-bold shrink-0">PIR Proximity:</span>
                <input
                  type="range"
                  min="50"
                  max="350"
                  value={stimulus.targetPos.x}
                  onChange={(e) =>
                    setStimulus((prev) => ({
                      ...prev,
                      targetPos: { ...prev.targetPos, x: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-32 accent-brand-500 cursor-pointer"
                />
                <span className={`font-bold ${stimulus.isPIRTriggered ? 'text-emerald-400' : 'text-ink-400'}`}>
                  {stimulus.isPIRTriggered ? 'IN SENSING CONE' : 'OUT OF RANGE'}
                </span>
              </div>
            )}

            {/* Ultrasonic Distance Slider */}
            {circuit.experimentId === 'exp_ultrasonic_radar' && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-ink-400 font-bold shrink-0">Sonar Distance:</span>
                <input
                  type="range"
                  min="4"
                  max="150"
                  value={stimulus.distanceCm}
                  onChange={(e) =>
                    setStimulus((prev) => ({
                      ...prev,
                      distanceCm: parseFloat(e.target.value),
                    }))
                  }
                  className="w-36 accent-brand-500 cursor-pointer"
                />
                <span className="text-brand-300 font-bold font-mono">
                  {stimulus.distanceCm.toFixed(1)} cm
                </span>
              </div>
            )}

            {/* Solar Sun Azimuth Slider */}
            {circuit.experimentId === 'exp_ldr_solar_tracker' && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-ink-400 font-bold shrink-0">Sun Azimuth:</span>
                <input
                  type="range"
                  min="300"
                  max="740"
                  value={stimulus.sunPos.x}
                  onChange={(e) =>
                    setStimulus((prev) => ({
                      ...prev,
                      sunPos: { ...prev.sunPos, x: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-36 accent-amber-500 cursor-pointer"
                />
                <span className="text-amber-400 font-bold">Heliostat: {stimulus.servoAngle}°</span>
              </div>
            )}

            {/* Motor RPM Slider */}
            {circuit.experimentId === 'exp_encoder_motor_pid' && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-ink-400 font-bold shrink-0">Motor RPM:</span>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={stimulus.motorRpm}
                  onChange={(e) =>
                    setStimulus((prev) => ({
                      ...prev,
                      motorRpm: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-32 accent-brand-500 cursor-pointer"
                />
                <span className="text-brand-300 font-bold">{stimulus.motorRpm} RPM</span>
              </div>
            )}

            {/* Load Cell Grip Force & Tare */}
            {circuit.experimentId === 'exp_loadcell_smart_gripper' && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-ink-400 font-bold shrink-0">Egg Load:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={stimulus.eggPressure}
                  onChange={(e) =>
                    setStimulus((prev) => ({
                      ...prev,
                      eggPressure: parseFloat(e.target.value),
                    }))
                  }
                  className="w-28 accent-emerald-500 cursor-pointer"
                />
                <span className={`font-bold ${stimulus.eggPressure > 80 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {stimulus.eggPressure.toFixed(1)} g
                </span>
                <button
                  onClick={() =>
                    setStimulus((prev) => ({
                      ...prev,
                      isTared: !prev.isTared,
                      eggPressure: 0,
                    }))
                  }
                  className="px-2 py-0.5 rounded bg-ink-800 hover:bg-ink-700 text-ink-200 text-[10px] font-bold border border-ink-700"
                >
                  Tare Scale
                </button>
              </div>
            )}

            {/* Reset Stimulus Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setStimulus({
                    targetPos: { x: 380, y: 80 },
                    servoAngle: 0,
                    distanceCm: 25.4,
                    obstacleDetected: false,
                    motorRpm: 1850,
                    eggPressure: 42.8,
                    lightAngle: 35,
                    sunPos: { x: 580, y: 40 },
                    potentiometerValue: 512,
                    imuPitch: 4.2,
                    imuRoll: -1.1,
                    isPIRTriggered: false,
                    lineTrackOffset: 0,
                    isTared: false,
                    hallTriggered: true,
                    buzzerActive: false,
                    buzzerFreq: 1000,
                  })
                }
                className="px-2.5 py-1 rounded-xl bg-ink-800/80 hover:bg-ink-700 text-ink-300 text-xs font-bold transition-colors cursor-pointer border border-ink-700"
              >
                Reset Stimulus
              </button>
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* FOOTER WIRING REFERENCE & COLOR CODE LEGEND */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-ink-900 border-t border-ink-800 text-[11px] font-mono text-ink-400">
        <div className="flex items-center gap-3">
          <span className="font-bold text-ink-300 uppercase">Wire Color Codes:</span>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>+5V VCC</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-600" />
              <span>GND</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span>Signal / Trig</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Echo / Analog</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>PWM / Motor</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>I2C SDA</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>I2C SCL</span>
            </span>
          </div>
        </div>

        <div className="text-ink-500">
          <span>Drag canvas to pan • Drag stimuli to trigger sensors</span>
        </div>
      </div>
    </div>
  );
};
