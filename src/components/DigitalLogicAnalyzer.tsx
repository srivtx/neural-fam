/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DigitalLogicAnalyzer:
 * Professional-grade, authentic in-browser 4-Channel Digital Logic Analyzer
 * complementing the DSO oscilloscope across all 8 canonical robotics hardware experiments.
 *
 * Features:
 * - 4 Dedicated digital channels configured per experiment (PIR, Ultrasonic, Line Follower,
 *   Inverted Pendulum, Solar Tracker, Encoder PID, Tachometer, Smart Gripper).
 * - Real-time 5V HIGH vs 0V LOW square waves with scrolling live capture or triggered burst packets.
 * - Timebase selector: 10 µs/div, 50 µs/div, 200 µs/div, 1 ms/div, 10 ms/div.
 * - Hardware controls: Run / Stop, Single Shot Capture, Reset, Trigger Source (CH0-CH3), Trigger Edge (Rising/Falling).
 * - Dual Timing Cursors: Draggable T1 & T2 with live Δt calculation and physical domain conversion.
 * - Protocol Decoders:
 *   1. Ultrasonic HC-SR04: pulse width to distance d = (v * Δt) / 2
 *   2. Servo PWM: 50 Hz pulse width (1.0ms -> 0°, 1.5ms -> 90°, 2.0ms -> 180°)
 *   3. Quadrature Encoder: Phase A/B lead-lag into Direction (CW/CCW) and 4X RPM calculation
 *   4. HX711 24-bit ADC: 24 SCK clock pulses into 24-bit delta-sigma ADC value and grams
 *   5. I2C Bus Decoder: START, Address 0x68, ACK, Register 0x3B, STOP
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Crosshair,
  Binary,
  Layers,
  Download,
  Info,
  Sparkles,
  Compass,
  Radar,
  Flame,
  Activity,
  Cpu,
  Scale,
  Zap,
  ArrowRight,
  Check,
  ChevronDown,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ROBOTICS_EXPERIMENTS, RoboticsExperiment } from '../data/roboticsExperimentsData';
import { soundFX } from '../utils/audio';

// ====================================================================
// TYPES & CHANNEL DEFINITIONS
// ====================================================================

export interface LogicChannelDef {
  id: string;
  channelIndex: 0 | 1 | 2 | 3;
  name: string;
  pin: string;
  color: string;
  description: string;
}

export type TimebaseKey = '10us' | '50us' | '200us' | '1ms' | '10ms';

export interface TimebaseOption {
  key: TimebaseKey;
  label: string;
  usPerDiv: number; // microseconds per horizontal division (10 divs total)
  samplingRateStr: string;
}

export const TIMEBASE_OPTIONS: TimebaseOption[] = [
  { key: '10us', label: '10 µs/div', usPerDiv: 10, samplingRateStr: '100 MSa/s' },
  { key: '50us', label: '50 µs/div', usPerDiv: 50, samplingRateStr: '50 MSa/s' },
  { key: '200us', label: '200 µs/div', usPerDiv: 200, samplingRateStr: '10 MSa/s' },
  { key: '1ms', label: '1 ms/div', usPerDiv: 1000, samplingRateStr: '2 MSa/s' },
  { key: '10ms', label: '10 ms/div', usPerDiv: 10000, samplingRateStr: '200 kSa/s' },
];

// Configuration of 4 digital channels for each of the 8 experiments
export const EXPERIMENT_LOGIC_CHANNELS: Record<string, LogicChannelDef[]> = {
  exp_pir_servo_buzzer: [
    { id: 'ch0', channelIndex: 0, name: 'PIR Sensor OUT', pin: 'D2', color: '#38bdf8', description: 'Thermal motion detection output (Active HIGH)' },
    { id: 'ch1', channelIndex: 1, name: 'Servo Gate PWM', pin: 'D9', color: '#f59e0b', description: '50 Hz Servo control pulse (1.0ms-2.0ms)' },
    { id: 'ch2', channelIndex: 2, name: 'Piezo Buzzer Tone', pin: 'D8', color: '#10b981', description: '1.0 kHz square wave alarm oscillation' },
    { id: 'ch3', channelIndex: 3, name: 'System Alert Interrupt', pin: 'INT0', color: '#ec4899', description: 'MCU hardware interrupt trigger pulse' },
  ],
  exp_ultrasonic_radar: [
    { id: 'ch0', channelIndex: 0, name: 'TRIG Pulse (10µs)', pin: 'D11', color: '#38bdf8', description: '10 µs sonic burst initiation strobe' },
    { id: 'ch1', channelIndex: 1, name: 'ECHO Input (Var)', pin: 'D12', color: '#f59e0b', description: 'Echo return pulse: width proportional to distance' },
    { id: 'ch2', channelIndex: 2, name: 'Servo Sweep PWM', pin: 'D9', color: '#10b981', description: '50 Hz radar azimuth sweep position pulse' },
    { id: 'ch3', channelIndex: 3, name: 'Echo Detect Interrupt', pin: 'INT1', color: '#ec4899', description: 'Falling edge input capture interrupt strobe' },
  ],
  exp_ir_line_follower: [
    { id: 'ch0', channelIndex: 0, name: 'Left IR D0', pin: 'D4', color: '#38bdf8', description: 'LM393 optical comparator (0V line, 5V white)' },
    { id: 'ch1', channelIndex: 1, name: 'Right IR D0', pin: 'D5', color: '#f59e0b', description: 'LM393 optical comparator (0V line, 5V white)' },
    { id: 'ch2', channelIndex: 2, name: 'Left Motor PWM', pin: 'D6', color: '#10b981', description: '976 Hz Timer 0 fast PWM drive enable' },
    { id: 'ch3', channelIndex: 3, name: 'Right Motor PWM', pin: 'D5', color: '#ec4899', description: '976 Hz Timer 0 differential drive PWM' },
  ],
  exp_mpu6050_balancing: [
    { id: 'ch0', channelIndex: 0, name: 'I2C SCL', pin: 'A5', color: '#38bdf8', description: '400 kHz Fast-Mode I2C bus serial clock' },
    { id: 'ch1', channelIndex: 1, name: 'I2C SDA', pin: 'A4', color: '#f59e0b', description: 'I2C bi-directional serial data bus' },
    { id: 'ch2', channelIndex: 2, name: 'MPU-6050 INT', pin: 'D2', color: '#10b981', description: '100 Hz Data-Ready hardware interrupt' },
    { id: 'ch3', channelIndex: 3, name: 'Motor Direction PWM', pin: 'D9', color: '#ec4899', description: '490 Hz inverted pendulum balancing drive' },
  ],
  exp_ldr_solar_tracker: [
    { id: 'ch0', channelIndex: 0, name: 'Left LDR Comparator', pin: 'D2', color: '#38bdf8', description: 'Differential illuminance threshold output' },
    { id: 'ch1', channelIndex: 1, name: 'Right LDR Comparator', pin: 'D3', color: '#f59e0b', description: 'Differential illuminance threshold output' },
    { id: 'ch2', channelIndex: 2, name: 'Pan Servo PWM', pin: 'D9', color: '#10b981', description: '50 Hz solar azimuth tracking servo command' },
    { id: 'ch3', channelIndex: 3, name: 'Tracking Deadband Gate', pin: 'D7', color: '#ec4899', description: 'Motor jitter inhibition deadband gate' },
  ],
  exp_encoder_motor_pid: [
    { id: 'ch0', channelIndex: 0, name: 'Encoder Phase A', pin: 'D2 (INT0)', color: '#38bdf8', description: 'Optical quadrature phase A channel' },
    { id: 'ch1', channelIndex: 1, name: 'Encoder Phase B', pin: 'D3 (INT1)', color: '#f59e0b', description: 'Optical quadrature phase B (90° shifted)' },
    { id: 'ch2', channelIndex: 2, name: 'Motor PWM Drive', pin: 'D9', color: '#10b981', description: '490 Hz H-Bridge MOSFET gate speed command' },
    { id: 'ch3', channelIndex: 3, name: 'PID Control Loop Tick', pin: 'D13', color: '#ec4899', description: '1 kHz Timer 2 periodic PID execution strobe' },
  ],
  exp_hall_effect_tachometer: [
    { id: 'ch0', channelIndex: 0, name: 'Hall Sensor OUT', pin: 'D2 (INT0)', color: '#38bdf8', description: 'Open-collector Hall switch (Active LOW)' },
    { id: 'ch1', channelIndex: 1, name: 'Index Pulse Trigger', pin: 'D4', color: '#f59e0b', description: 'Once-per-revolution rotor index pulse' },
    { id: 'ch2', channelIndex: 2, name: 'BLDC Inverter Gate', pin: 'D9', color: '#10b981', description: '120° electrical commutation gate window' },
    { id: 'ch3', channelIndex: 3, name: 'Timer 1 Input Capture', pin: 'ICP1', color: '#ec4899', description: 'MCU 16-bit Timer 1 ICP1 capture event' },
  ],
  exp_loadcell_smart_gripper: [
    { id: 'ch0', channelIndex: 0, name: 'HX711 DOUT', pin: 'D3', color: '#38bdf8', description: '24-bit delta-sigma ADC serial data stream' },
    { id: 'ch1', channelIndex: 1, name: 'HX711 SCK Clock', pin: 'D2', color: '#f59e0b', description: '24+1 SCK positive clock pulses from MCU' },
    { id: 'ch2', channelIndex: 2, name: 'Gripper Servo PWM', pin: 'D9', color: '#10b981', description: '50 Hz gripper finger displacement command' },
    { id: 'ch3', channelIndex: 3, name: 'Force Cutoff Interrupt', pin: 'D7', color: '#ec4899', description: 'Egg safety force-limit emergency shutdown' },
  ],
};

export interface DigitalLogicAnalyzerProps {
  experiment?: RoboticsExperiment;
  onSelectExperiment?: (expId: string) => void;
  className?: string;
}

// ====================================================================
// COMPONENT
// ====================================================================

export const DigitalLogicAnalyzer: React.FC<DigitalLogicAnalyzerProps> = ({
  experiment: propExperiment,
  onSelectExperiment,
  className = '',
}) => {
  // Experiment selection
  const [activeExpId, setActiveExpId] = useState<string>(
    propExperiment ? propExperiment.id : ROBOTICS_EXPERIMENTS[1].id // Default to Ultrasonic Radar
  );

  useEffect(() => {
    if (propExperiment && propExperiment.id !== activeExpId) {
      setActiveExpId(propExperiment.id);
    }
  }, [propExperiment]);

  const activeExp = useMemo(() => {
    return ROBOTICS_EXPERIMENTS.find((e) => e.id === activeExpId) || ROBOTICS_EXPERIMENTS[1];
  }, [activeExpId]);

  const channels = useMemo(() => {
    return EXPERIMENT_LOGIC_CHANNELS[activeExpId] || EXPERIMENT_LOGIC_CHANNELS.exp_ultrasonic_radar;
  }, [activeExpId]);

  // Instrument state
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isSingleShotArmed, setIsSingleShotArmed] = useState<boolean>(false);
  const [triggerStatus, setTriggerStatus] = useState<'AUTO' | 'ARMED' | 'TRIG’D' | 'STOP'>('AUTO');
  const [timebaseKey, setTimebaseKey] = useState<TimebaseKey>('200us');
  const [triggerSource, setTriggerSource] = useState<0 | 1 | 2 | 3>(0);
  const [triggerEdge, setTriggerEdge] = useState<'rising' | 'falling'>('rising');
  const [triggerOffsetUs, setTriggerOffsetUs] = useState<number>(0); // Horizontal pan offset in µs
  const [channelMuted, setChannelMuted] = useState<[boolean, boolean, boolean, boolean]>([false, false, false, false]);
  const [channelInverted, setChannelInverted] = useState<[boolean, boolean, boolean, boolean]>([false, false, false, false]);

  // Dual Timing Cursors: stored as offset in µs relative to Trigger (T=0)
  const [showCursors, setShowCursors] = useState<boolean>(true);
  const [cursorT1Us, setCursorT1Us] = useState<number>(100); // 100 µs (Trigger start)
  const [cursorT2Us, setCursorT2Us] = useState<number>(1550); // 1550 µs (Echo end)
  const [activeCursorDrag, setActiveCursorDrag] = useState<'T1' | 'T2' | 'PAN' | null>(null);

  // Simulation physical parameters
  const [ultrasonicDistCm, setUltrasonicDistCm] = useState<number>(24.87); // 24.87 cm -> 1450 µs pulse
  const [servoAngleDeg, setServoAngleDeg] = useState<number>(90); // 90° -> 1.50 ms pulse
  const [encoderRpm, setEncoderRpm] = useState<number>(1500); // 1500 RPM
  const [encoderDirection, setEncoderDirection] = useState<'CW' | 'CCW'>('CW');
  const [loadcellGrams, setLoadcellGrams] = useState<number>(150); // 150 grams
  const [tachometerRpm, setTachometerRpm] = useState<number>(3000); // 3000 RPM

  // UI state
  const [activeDecoderTab, setActiveDecoderTab] = useState<'auto' | 'ultrasonic' | 'servo' | 'encoder' | 'hx711' | 'i2c'>('auto');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoverTimeUs, setHoverTimeUs] = useState<number | null>(null);

  // Refs for animation & high-speed rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeOffsetRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(performance.now());
  const dragStartPosRef = useRef<{ x: number; y: number; initialT1: number; initialT2: number; initialOffset: number }>({
    x: 0,
    y: 0,
    initialT1: 0,
    initialT2: 0,
    initialOffset: 0,
  });

  const currentTimebase = useMemo(() => {
    return TIMEBASE_OPTIONS.find((t) => t.key === timebaseKey) || TIMEBASE_OPTIONS[2];
  }, [timebaseKey]);

  // Total screen window in microseconds (10 divisions across canvas)
  const totalWindowUs = currentTimebase.usPerDiv * 10;

  // ====================================================================
  // SIGNAL EVALUATION ENGINE (Microsecond Resolution)
  // Evaluates digital state (0 or 1) of any channel at microsecond t
  // ====================================================================
  const evaluateSignal = useCallback(
    (expId: string, channelIdx: 0 | 1 | 2 | 3, tUs: number): number => {
      // 1. ULTRASONIC RADAR
      if (expId === 'exp_ultrasonic_radar') {
        const cycle = 60000; // 60 ms ping cycle
        const t = ((tUs % cycle) + cycle) % cycle;
        const speedSoundCmPerUs = 0.03432; // 343.2 m/s
        const echoWidthUs = Math.round((2 * ultrasonicDistCm) / speedSoundCmPerUs); // e.g. 1450 µs
        const trigStart = 100;
        const trigEnd = 110; // 10 µs
        const echoStart = 560; // 450 µs transducer delay
        const echoEnd = echoStart + echoWidthUs;

        if (channelIdx === 0) {
          // CH0: TRIG Pulse (D11, 10µs)
          return t >= trigStart && t < trigEnd ? 1 : 0;
        } else if (channelIdx === 1) {
          // CH1: ECHO Input (D12)
          return t >= echoStart && t < echoEnd ? 1 : 0;
        } else if (channelIdx === 2) {
          // CH2: Servo Sweep PWM (D9, 50Hz, 1.0-2.0ms)
          const pwmT = ((tUs % 20000) + 20000) % 20000;
          return pwmT < 1500 ? 1 : 0;
        } else if (channelIdx === 3) {
          // CH3: Echo Detect Interrupt (falling edge)
          return t >= echoEnd && t < echoEnd + 25 ? 1 : 0;
        }
      }

      // 2. PIR GATE & CHIME
      if (expId === 'exp_pir_servo_buzzer') {
        const cycle = 40000; // 40 ms
        const t = ((tUs % cycle) + cycle) % cycle;
        const isMotion = t < 32000;
        const servoTon = 1000 + (servoAngleDeg / 180) * 1000; // 1.0 to 2.0 ms

        if (channelIdx === 0) {
          // CH0: PIR Sensor OUT (D2)
          return isMotion ? 1 : 0;
        } else if (channelIdx === 1) {
          // CH1: Servo Gate PWM (D9)
          const pwmT = ((tUs % 20000) + 20000) % 20000;
          return pwmT < (isMotion ? servoTon : 1050) ? 1 : 0;
        } else if (channelIdx === 2) {
          // CH2: Piezo Buzzer Tone (D8, 1kHz)
          if (!isMotion) return 0;
          const buzzT = ((tUs % 1000) + 1000) % 1000;
          return buzzT < 500 ? 1 : 0;
        } else if (channelIdx === 3) {
          // CH3: System Alert Interrupt
          return t >= 50 && t < 90 ? 1 : 0;
        }
      }

      // 3. LINE FOLLOWER
      if (expId === 'exp_ir_line_follower') {
        const pwmPeriod = 1024; // 976 Hz
        const tPwm = ((tUs % pwmPeriod) + pwmPeriod) % pwmPeriod;
        const scanCycle = 12000;
        const tScan = ((tUs % scanCycle) + scanCycle) % scanCycle;

        if (channelIdx === 0) {
          // CH0: Left IR D0 (D4) - 0 on black line, 1 on white
          return tScan < 8000 ? 1 : 0;
        } else if (channelIdx === 1) {
          // CH1: Right IR D0 (D5)
          return tScan > 4000 && tScan < 11000 ? 1 : 0;
        } else if (channelIdx === 2) {
          // CH2: Left Motor PWM (D6, ~78% duty)
          return tPwm < 800 ? 1 : 0;
        } else if (channelIdx === 3) {
          // CH3: Right Motor PWM (D5, ~48% duty)
          return tPwm < 490 ? 1 : 0;
        }
      }

      // 4. INVERTED PENDULUM (MPU-6050 & I2C)
      if (expId === 'exp_mpu6050_balancing') {
        const loopCycle = 10000; // 100 Hz MPU-6050 sample rate (10ms)
        const t = ((tUs % loopCycle) + loopCycle) % loopCycle;

        if (channelIdx === 2) {
          // CH2: MPU-6050 INT (D2) Data-ready strobe at start of cycle
          return t >= 50 && t < 100 ? 1 : 0;
        } else if (channelIdx === 0) {
          // CH0: I2C SCL (A5) - 400 kHz clock burst (2.5 µs period) between 150µs and 470µs
          if (t >= 150 && t < 470) {
            const clkT = (t - 150) % 2.5;
            return clkT < 1.25 ? 1 : 0;
          }
          return 1; // Pulled HIGH idle
        } else if (channelIdx === 1) {
          // CH1: I2C SDA (A4) - START condition, Address 0x68, ACK, Register 0x3B, STOP
          if (t < 147) return 1;
          if (t >= 147 && t < 152) return 0; // START condition (drops while SCL HIGH)
          if (t >= 152 && t < 468) {
            // Clocked bit pattern
            const bitIndex = Math.floor((t - 152) / 2.5);
            // 0x68 + W (0b11010000) then ACK (0) then Reg 0x3B (0b00111011)
            const sampleData = [1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0];
            return sampleData[bitIndex % sampleData.length] ?? 1;
          }
          if (t >= 468 && t < 472) return 0; // Pre-stop
          return 1; // STOP condition & pullup
        } else if (channelIdx === 3) {
          // CH3: Motor Direction PWM (D9, 490Hz)
          const pwmT = ((tUs % 2040) + 2040) % 2040;
          return pwmT < 1180 ? 1 : 0;
        }
      }

      // 5. SOLAR TRACKER
      if (expId === 'exp_ldr_solar_tracker') {
        const frameT = ((tUs % 20000) + 20000) % 20000;
        if (channelIdx === 0) {
          // CH0: Left LDR Comparator
          return 1;
        } else if (channelIdx === 1) {
          // CH1: Right LDR Comparator
          return 0;
        } else if (channelIdx === 2) {
          // CH2: Pan Servo PWM (D9, 50Hz, 1.42ms)
          return frameT < 1420 ? 1 : 0;
        } else if (channelIdx === 3) {
          // CH3: Tracking Deadband Gate
          return 1;
        }
      }

      // 6. ENCODER PID
      if (expId === 'exp_encoder_motor_pid') {
        // 16 PPR direct shaft * 4X quad decode = 64 edges per rev
        // Quadrant period in µs = (60 * 1e6) / (RPM * 64)
        const quadPeriodUs = Math.max(10, Math.round((60 * 1000000) / (Math.max(100, encoderRpm) * 64)));
        const fullPeriodUs = quadPeriodUs * 4;

        if (channelIdx === 0) {
          // CH0: Encoder Phase A (D2)
          const pA = ((tUs % fullPeriodUs) + fullPeriodUs) % fullPeriodUs;
          return pA < fullPeriodUs / 2 ? 1 : 0;
        } else if (channelIdx === 1) {
          // CH1: Encoder Phase B (D3)
          // For CW: Phase A leads Phase B (Phase B shifted by +quadPeriodUs)
          // For CCW: Phase B leads Phase A (Phase B shifted by -quadPeriodUs)
          const shift = encoderDirection === 'CW' ? quadPeriodUs : -quadPeriodUs;
          const pB = (((tUs - shift) % fullPeriodUs) + fullPeriodUs) % fullPeriodUs;
          return pB < fullPeriodUs / 2 ? 1 : 0;
        } else if (channelIdx === 2) {
          // CH2: Motor PWM Drive (D9, 490Hz, 72% duty)
          const pwmT = ((tUs % 2040) + 2040) % 2040;
          return pwmT < 1468 ? 1 : 0;
        } else if (channelIdx === 3) {
          // CH3: PID Control Loop Tick (1kHz, 30µs execution)
          const tickT = ((tUs % 1000) + 1000) % 1000;
          return tickT < 30 ? 1 : 0;
        }
      }

      // 7. TACHOMETER
      if (expId === 'exp_hall_effect_tachometer') {
        // 2 pole pairs = 2 Hall pulses per rev
        const hallPeriodUs = Math.max(50, Math.round((60 * 1000000) / (Math.max(100, tachometerRpm) * 2)));
        const tHall = ((tUs % hallPeriodUs) + hallPeriodUs) % hallPeriodUs;

        if (channelIdx === 0) {
          // CH0: Hall Sensor OUT (D2, Active LOW, 1200µs pulse)
          return tHall < 1200 ? 0 : 1;
        } else if (channelIdx === 1) {
          // CH1: Index Pulse Trigger (once per rev = 2 * hallPeriodUs)
          const revPeriod = hallPeriodUs * 2;
          const tRev = ((tUs % revPeriod) + revPeriod) % revPeriod;
          return tRev < 200 ? 1 : 0;
        } else if (channelIdx === 2) {
          // CH2: BLDC Inverter Gate (120° commutation = 1/3 of hallPeriodUs)
          return tHall < hallPeriodUs / 3 ? 1 : 0;
        } else if (channelIdx === 3) {
          // CH3: Timer 1 Input Capture (strobe on Hall falling edge)
          return tHall < 20 ? 1 : 0;
        }
      }

      // 8. SMART GRIPPER (HX711 24-bit ADC)
      if (expId === 'exp_loadcell_smart_gripper') {
        const cycle = 25000; // 40 Hz conversion rate
        const t = ((tUs % cycle) + cycle) % cycle;
        // Raw count for loadcell grams (10000 offset + 733 counts/g)
        const rawCount = Math.round(10000 + loadcellGrams * 733.33);

        if (channelIdx === 0) {
          // CH0: HX711 DOUT (D3)
          if (t < 200) return 1; // Idle HIGH
          if (t >= 200 && t < 250) return 0; // Data Ready falling edge
          if (t >= 250 && t < 300) {
            // 24 bits shifted out on SCK rising edge (2µs per clock pulse)
            const bitIdx = Math.floor((t - 250) / 2);
            if (bitIdx < 24) {
              const bitVal = (rawCount >> (23 - bitIdx)) & 1;
              return bitVal;
            }
          }
          return 1; // Returned HIGH
        } else if (channelIdx === 1) {
          // CH1: HX711 SCK Clock (D2)
          // 25 pulses from 250µs to 300µs (2.0µs period: 1.0µs HIGH, 1.0µs LOW)
          if (t >= 250 && t < 300) {
            const clkT = (t - 250) % 2.0;
            return clkT < 1.0 ? 1 : 0;
          }
          return 0; // Idle LOW
        } else if (channelIdx === 2) {
          // CH2: Gripper Servo PWM (D9, 50Hz, 1.38ms)
          const pwmT = ((tUs % 20000) + 20000) % 20000;
          return pwmT < 1380 ? 1 : 0;
        } else if (channelIdx === 3) {
          // CH3: Force Cutoff Interrupt (Active if load > 200g)
          return loadcellGrams > 200 && t < 60 ? 1 : 0;
        }
      }

      return 0;
    },
    [ultrasonicDistCm, servoAngleDeg, encoderRpm, encoderDirection, loadcellGrams, tachometerRpm]
  );

  // ====================================================================
  // DECODED VALUE CALCULATIONS FOR LIVE PROTOCOL DISPLAY
  // ====================================================================

  // 1. Ultrasonic Distance
  const ultrasonicCalculatedDistance = useMemo(() => {
    // Pulse width = cursor delta or simulated width
    const deltaT = Math.abs(cursorT2Us - cursorT1Us);
    const speedSoundCmPerUs = 0.03432; // 343.2 m/s
    const distCm = (speedSoundCmPerUs * deltaT) / 2;
    const distInches = distCm / 2.54;
    return {
      deltaTUs: deltaT,
      distCm: Number(distCm.toFixed(2)),
      distInches: Number(distInches.toFixed(2)),
    };
  }, [cursorT1Us, cursorT2Us]);

  // 2. Servo PWM Angle
  const servoPwmDecoded = useMemo(() => {
    // Determine pulse width around cursor T1/T2 or simulated value
    const deltaT = Math.abs(cursorT2Us - cursorT1Us);
    const pulseWidthMs = deltaT / 1000;
    // Standard servo: 1.0 ms = 0°, 1.5 ms = 90°, 2.0 ms = 180°
    const angleClamped = Math.max(0, Math.min(180, (pulseWidthMs - 1.0) * 180));
    const dutyCycle = ((pulseWidthMs / 20.0) * 100).toFixed(2);
    return {
      pulseWidthMs: Number(pulseWidthMs.toFixed(3)),
      angleDeg: Number(angleClamped.toFixed(1)),
      frequencyHz: 50.0,
      dutyPercent: dutyCycle,
    };
  }, [cursorT1Us, cursorT2Us]);

  // 3. Quadrature Encoder
  const encoderDecoded = useMemo(() => {
    const deltaT = Math.abs(cursorT2Us - cursorT1Us);
    const estimatedFreqHz = deltaT > 0 ? (1000000 / deltaT) : 0;
    // 4X quad decode: edges per sec = freq * 4
    const rpmCalc = (estimatedFreqHz * 60) / 64;
    return {
      direction: encoderDirection,
      leadLag: encoderDirection === 'CW' ? 'Phase A leads Phase B (+90°)' : 'Phase B leads Phase A (-90°)',
      stateSequence: encoderDirection === 'CW' ? '00 → 10 → 11 → 01 → 00' : '00 → 01 → 11 → 10 → 00',
      calculatedRpm: Math.round(rpmCalc > 0 && rpmCalc < 10000 ? rpmCalc : encoderRpm),
      resolution: '4X Quadrature (64 Edges/Rev)',
    };
  }, [cursorT1Us, cursorT2Us, encoderDirection, encoderRpm]);

  // 4. HX711 24-bit ADC
  const hx711Decoded = useMemo(() => {
    const rawCounts = Math.round(10000 + loadcellGrams * 733.33);
    const hexStr = '0x' + (rawCounts & 0xffffff).toString(16).toUpperCase().padStart(6, '0');
    const binStr = (rawCounts & 0xffffff).toString(2).padStart(24, '0').match(/.{1,4}/g)?.join(' ') || '';
    return {
      rawCounts,
      hexStr,
      binStr,
      loadGrams: loadcellGrams,
      gainMode: 'Channel A, Gain 128 (25 SCK pulses)',
      sckPeriodUs: 2.0,
      sckFreqKhz: 500,
    };
  }, [loadcellGrams]);

  // ====================================================================
  // CANVAS RENDERING ENGINE
  // ====================================================================
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Left channel label gutter
    const gutterWidth = 175;
    const waveAreaWidth = width - gutterWidth;
    const numChannels = 4;
    const channelHeight = (height - 32) / numChannels;
    const timeAxisHeight = 32;

    // Background chassis
    ctx.fillStyle = '#0b0f19'; // Deep obsidian instrument background
    ctx.fillRect(0, 0, width, height);

    // Gutter background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, gutterWidth, height);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gutterWidth, 0);
    ctx.lineTo(gutterWidth, height);
    ctx.stroke();

    // ---------------------------------------------------------------
    // 1. HORIZONTAL & VERTICAL GRID
    // ---------------------------------------------------------------
    const numDivisions = 10;
    const divWidthPx = waveAreaWidth / numDivisions;

    // Major division vertical grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= numDivisions; i++) {
      const gx = gutterWidth + i * divWidthPx;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height - timeAxisHeight);
      ctx.stroke();

      // Minor subdivision ticks
      if (i < numDivisions) {
        ctx.strokeStyle = '#172033';
        for (let sub = 1; sub <= 4; sub++) {
          const subX = gx + (sub * divWidthPx) / 5;
          ctx.beginPath();
          ctx.moveTo(subX, height - timeAxisHeight - 6);
          ctx.lineTo(subX, height - timeAxisHeight);
          ctx.stroke();
        }
        ctx.strokeStyle = '#1e293b';
      }
    }

    // Time calculations
    const timeWindowUs = totalWindowUs;
    const triggerScreenX = gutterWidth + divWidthPx * 1.5; // Trigger positioned at 1.5 div
    const timeAtScreenStartUs = -1.5 * currentTimebase.usPerDiv + triggerOffsetUs;

    // Convert time (µs) to canvas X (px)
    const timeToPx = (tUs: number): number => {
      const offsetFromStartUs = tUs - timeAtScreenStartUs;
      return gutterWidth + (offsetFromStartUs / timeWindowUs) * waveAreaWidth;
    };

    // Convert canvas X (px) to time (µs)
    const pxToTime = (px: number): number => {
      const ratio = (px - gutterWidth) / waveAreaWidth;
      return timeAtScreenStartUs + ratio * timeWindowUs;
    };

    // ---------------------------------------------------------------
    // 2. TIME AXIS (BOTTOM STRIP)
    // ---------------------------------------------------------------
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(gutterWidth, height - timeAxisHeight, waveAreaWidth, timeAxisHeight);
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(gutterWidth, height - timeAxisHeight);
    ctx.lineTo(width, height - timeAxisHeight);
    ctx.stroke();

    ctx.font = '10px "JetBrains Mono", Menlo, monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';

    for (let i = 0; i <= numDivisions; i++) {
      const divTimeUs = timeAtScreenStartUs + i * currentTimebase.usPerDiv;
      const gx = gutterWidth + i * divWidthPx;

      let labelStr = '';
      if (Math.abs(divTimeUs) < 0.001) {
        labelStr = 'T=0';
      } else if (currentTimebase.usPerDiv >= 1000) {
        labelStr = `${(divTimeUs / 1000).toFixed(1)}ms`;
      } else {
        labelStr = `${Math.round(divTimeUs)}µs`;
      }

      ctx.fillText(labelStr, gx, height - 12);
    }

    // ---------------------------------------------------------------
    // 3. CHANNELS WAVEFORM RENDERING
    // ---------------------------------------------------------------
    channels.forEach((ch, chIdx) => {
      const topY = chIdx * channelHeight;
      const botY = topY + channelHeight;
      const waveHighY = topY + 14; // 5V HIGH level
      const waveLowY = botY - 14; // 0V LOW level

      // Channel horizontal separator
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, botY);
      ctx.lineTo(width, botY);
      ctx.stroke();

      // Channel 0V and 5V dotted rail baselines
      ctx.strokeStyle = '#152033';
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(gutterWidth, waveHighY);
      ctx.lineTo(width, waveHighY);
      ctx.moveTo(gutterWidth, waveLowY);
      ctx.lineTo(width, waveLowY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Left gutter channel header
      const isMuted = channelMuted[chIdx];
      const isInverted = channelInverted[chIdx];

      // Channel color swatch & pin label
      ctx.fillStyle = isMuted ? '#475569' : ch.color;
      ctx.fillRect(10, topY + 12, 4, channelHeight - 24);

      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillStyle = isMuted ? '#64748b' : '#f8fafc';
      ctx.textAlign = 'left';
      ctx.fillText(`CH${chIdx}`, 20, topY + 22);

      // Channel pin badge
      ctx.font = 'bold 9px "JetBrains Mono", Menlo, monospace';
      ctx.fillStyle = isMuted ? '#475569' : ch.color;
      ctx.fillText(`[${ch.pin}]`, 52, topY + 22);

      // Channel functional name
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      const truncName = ch.name.length > 18 ? ch.name.slice(0, 16) + '..' : ch.name;
      ctx.fillText(truncName, 20, topY + 38);

      // Instantaneous state indicator at Cursor T1
      const sampleAtT1 = evaluateSignal(activeExpId, ch.channelIndex as any, cursorT1Us);
      const displayVal = isInverted ? 1 - sampleAtT1 : sampleAtT1;

      // Logic level status pill
      ctx.fillStyle = displayVal === 1 ? (isMuted ? '#334155' : ch.color) : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(118, topY + 14, 46, 20, 6);
      ctx.fill();

      ctx.fillStyle = displayVal === 1 ? '#020617' : '#64748b';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(displayVal === 1 ? 'HIGH' : 'LOW', 141, topY + 28);

      // Skip waveform drawing if channel is muted
      if (isMuted) return;

      // Sample waveform across the visible screen width
      ctx.save();
      ctx.beginPath();
      ctx.rect(gutterWidth, topY, waveAreaWidth, channelHeight);
      ctx.clip();

      const pixelStep = 2; // Step by 2 pixels for crisp 60 FPS performance
      let prevVal: number | null = null;
      let prevY = waveLowY;

      ctx.lineWidth = 2.2;
      ctx.strokeStyle = ch.color;
      ctx.shadowColor = ch.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();

      // Gradient under waveform for high-tech aesthetic
      const fillPath = new Path2D();
      let fillStarted = false;

      for (let px = gutterWidth; px <= width; px += pixelStep) {
        const tUs = pxToTime(px);
        let val = evaluateSignal(activeExpId, ch.channelIndex as any, tUs);
        if (isInverted) val = 1 - val;

        const currY = val === 1 ? waveHighY : waveLowY;

        if (px === gutterWidth) {
          ctx.moveTo(px, currY);
          fillPath.moveTo(px, waveLowY);
          fillPath.lineTo(px, currY);
          fillStarted = true;
        } else {
          if (val !== prevVal && prevVal !== null) {
            // Vertical logic transition edge
            ctx.lineTo(px, prevY);
            ctx.lineTo(px, currY);

            fillPath.lineTo(px, prevY);
            fillPath.lineTo(px, currY);
          } else {
            ctx.lineTo(px, currY);
            fillPath.lineTo(px, currY);
          }
        }

        prevVal = val;
        prevY = currY;
      }

      ctx.stroke();

      // Shaded fill under high pulses
      if (fillStarted) {
        fillPath.lineTo(width, waveLowY);
        fillPath.closePath();
        ctx.fillStyle = `${ch.color}15`; // 8% opacity fill
        ctx.shadowBlur = 0;
        ctx.fill(fillPath);
      }

      ctx.restore();
    });

    // ---------------------------------------------------------------
    // 4. TRIGGER LINE & MARKER (T=0)
    // ---------------------------------------------------------------
    const trigX = timeToPx(0);
    if (trigX >= gutterWidth && trigX <= width) {
      // Trigger dashed vertical guide
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(trigX, 0);
      ctx.lineTo(trigX, height - timeAxisHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Trigger inverted triangle flag
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(trigX - 7, 0);
      ctx.lineTo(trigX + 7, 0);
      ctx.lineTo(trigX, 10);
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 9px system-ui';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('T', trigX, 8);
    }

    // ---------------------------------------------------------------
    // 5. DUAL TIMING CURSORS (T1 & T2)
    // ---------------------------------------------------------------
    if (showCursors) {
      const c1X = timeToPx(cursorT1Us);
      const c2X = timeToPx(cursorT2Us);

      // Shaded delta measurement region between T1 and T2
      if (c1X >= gutterWidth || c2X >= gutterWidth) {
        const leftX = Math.max(gutterWidth, Math.min(c1X, c2X));
        const rightX = Math.min(width, Math.max(c1X, c2X));
        if (rightX > leftX) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
          ctx.fillRect(leftX, 0, rightX - leftX, height - timeAxisHeight);

          // Horizontal measurement dimension bar at the top
          const midX = (leftX + rightX) / 2;
          const deltaUs = Math.abs(cursorT2Us - cursorT1Us);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(leftX, 24);
          ctx.lineTo(rightX, 24);
          ctx.moveTo(leftX, 20);
          ctx.lineTo(leftX, 28);
          ctx.moveTo(rightX, 20);
          ctx.lineTo(rightX, 28);
          ctx.stroke();

          // Delta label pill
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(midX - 44, 14, 88, 20, 4);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.stroke();

          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'center';
          ctx.fillText(`Δt = ${deltaUs.toFixed(1)}µs`, midX, 28);
        }
      }

      // Render Cursor T1 (Neon Cyan)
      if (c1X >= gutterWidth && c1X <= width) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(c1X, 0);
        ctx.lineTo(c1X, height - timeAxisHeight);
        ctx.stroke();

        // Cursor T1 Handle Flag
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(c1X - 16, 2, 32, 16, 4);
        ctx.fill();
        ctx.fillStyle = '#020617';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('T1', c1X, 14);
      }

      // Render Cursor T2 (Neon Amber)
      if (c2X >= gutterWidth && c2X <= width) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(c2X, 0);
        ctx.lineTo(c2X, height - timeAxisHeight);
        ctx.stroke();

        // Cursor T2 Handle Flag
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(c2X - 16, 2, 32, 16, 4);
        ctx.fill();
        ctx.fillStyle = '#020617';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('T2', c2X, 14);
      }
    }

    // ---------------------------------------------------------------
    // 6. HOVER TIME READOUT (CROSSHAIR GUIDE)
    // ---------------------------------------------------------------
    if (hoverTimeUs !== null) {
      const hX = timeToPx(hoverTimeUs);
      if (hX >= gutterWidth && hX <= width) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(hX, 0);
        ctx.lineTo(hX, height - timeAxisHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [
    channels,
    evaluateSignal,
    activeExpId,
    totalWindowUs,
    currentTimebase,
    triggerOffsetUs,
    channelMuted,
    channelInverted,
    showCursors,
    cursorT1Us,
    cursorT2Us,
    hoverTimeUs,
  ]);

  // ====================================================================
  // ANIMATION LOOP (Smooth Scrolling or Static Packet Inspection)
  // ====================================================================
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      if (isRunning) {
        // Continuous smooth live scroll
        timeOffsetRef.current += dt * (currentTimebase.usPerDiv / 40);
        // In free-running mode, keep offset updating smoothly
        setTriggerOffsetUs((prev) => {
          const next = prev + (dt * currentTimebase.usPerDiv) / 100;
          return next > 100000 ? 0 : next;
        });
      }

      renderCanvas();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, currentTimebase, renderCanvas]);

  // Canvas size adjustment
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = (isFullscreen ? 520 : 380) * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${isFullscreen ? 520 : 380}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      renderCanvas();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isFullscreen, renderCanvas]);

  // ====================================================================
  // INTERACTIVE CURSOR & PAN DRAG HANDLERS
  // ====================================================================
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const gutterWidth = 175;
    const waveAreaWidth = rect.width - gutterWidth;

    if (clickX < gutterWidth) return; // In gutter

    const timeWindowUs = totalWindowUs;
    const timeAtScreenStartUs = -1.5 * currentTimebase.usPerDiv + triggerOffsetUs;
    const timeToPx = (tUs: number) =>
      gutterWidth + ((tUs - timeAtScreenStartUs) / timeWindowUs) * waveAreaWidth;

    const c1X = timeToPx(cursorT1Us);
    const c2X = timeToPx(cursorT2Us);

    const hitTolerance = 14;

    if (showCursors && Math.abs(clickX - c1X) <= hitTolerance) {
      setActiveCursorDrag('T1');
      soundFX.playTap();
    } else if (showCursors && Math.abs(clickX - c2X) <= hitTolerance) {
      setActiveCursorDrag('T2');
      soundFX.playTap();
    } else {
      setActiveCursorDrag('PAN');
      dragStartPosRef.current = {
        x: clickX,
        y: e.clientY,
        initialT1: cursorT1Us,
        initialT2: cursorT2Us,
        initialOffset: triggerOffsetUs,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const gutterWidth = 175;
    const waveAreaWidth = rect.width - gutterWidth;

    if (currX < gutterWidth) {
      setHoverTimeUs(null);
      return;
    }

    const timeWindowUs = totalWindowUs;
    const timeAtScreenStartUs = -1.5 * currentTimebase.usPerDiv + triggerOffsetUs;
    const pxToTime = (px: number) =>
      timeAtScreenStartUs + ((px - gutterWidth) / waveAreaWidth) * timeWindowUs;

    const tAtMouse = pxToTime(currX);
    setHoverTimeUs(tAtMouse);

    if (activeCursorDrag === 'T1') {
      setCursorT1Us(Math.round(tAtMouse));
    } else if (activeCursorDrag === 'T2') {
      setCursorT2Us(Math.round(tAtMouse));
    } else if (activeCursorDrag === 'PAN') {
      const dxPx = currX - dragStartPosRef.current.x;
      const dtUs = (dxPx / waveAreaWidth) * timeWindowUs;
      setTriggerOffsetUs(dragStartPosRef.current.initialOffset - dtUs);
    }
  };

  const handleMouseUp = () => {
    setActiveCursorDrag(null);
  };

  // Cursor snap to nearest signal transition edge
  const snapCursorToNearestEdge = (cursor: 'T1' | 'T2') => {
    const targetUs = cursor === 'T1' ? cursorT1Us : cursorT2Us;
    const searchSpanUs = currentTimebase.usPerDiv * 1.5;
    const stepUs = Math.max(1, currentTimebase.usPerDiv / 100);

    let bestEdgeUs = targetUs;
    let minDiff = Infinity;

    // Scan for edge in trigger source channel
    for (let t = targetUs - searchSpanUs; t <= targetUs + searchSpanUs; t += stepUs) {
      const sPrev = evaluateSignal(activeExpId, triggerSource, t - stepUs);
      const sCurr = evaluateSignal(activeExpId, triggerSource, t);
      if (sPrev !== sCurr) {
        const diff = Math.abs(t - targetUs);
        if (diff < minDiff) {
          minDiff = diff;
          bestEdgeUs = t;
        }
      }
    }

    if (cursor === 'T1') {
      setCursorT1Us(Math.round(bestEdgeUs));
    } else {
      setCursorT2Us(Math.round(bestEdgeUs));
    }
    soundFX.playTap();
  };

  // Single Shot Trigger action
  const handleSingleShot = () => {
    setIsRunning(false);
    setIsSingleShotArmed(true);
    setTriggerStatus('ARMED');
    soundFX.playTap();

    setTimeout(() => {
      // Capture triggered frame centered at T=0
      setTriggerOffsetUs(0);
      setTriggerStatus('TRIG’D');
      setIsSingleShotArmed(false);
      soundFX.playSuccess();
    }, 280);
  };

  // Reset Analyzer state
  const handleReset = () => {
    setTriggerOffsetUs(0);
    setCursorT1Us(100);
    setCursorT2Us(1550);
    setIsRunning(true);
    setTriggerStatus('AUTO');
    soundFX.playTap();
  };

  // Export CSV of transitions
  const handleExportCSV = () => {
    const rows = ['Timestamp_us,CH0_State,CH1_State,CH2_State,CH3_State'];
    const totalPoints = 500;
    const dt = totalWindowUs / totalPoints;

    for (let i = 0; i < totalPoints; i++) {
      const t = Math.round(i * dt);
      const s0 = evaluateSignal(activeExpId, 0, t);
      const s1 = evaluateSignal(activeExpId, 1, t);
      const s2 = evaluateSignal(activeExpId, 2, t);
      const s3 = evaluateSignal(activeExpId, 3, t);
      rows.push(`${t},${s0},${s1},${s2},${s3}`);
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logic_analyzer_${activeExpId}_capture.csv`;
    a.click();
    URL.revokeObjectURL(url);
    soundFX.playSuccess();
  };

  // ====================================================================
  // RENDER UI
  // ====================================================================

  return (
    <div className={`space-y-4 ${className}`} ref={containerRef}>
      {/* ------------------------------------------------------------- */}
      {/* TOP CONTROL CONSOLE (HARDWARE BENCH INSTRUMENT BEZEL)           */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-ink-950 border border-ink-800 rounded-3xl p-5 shadow-xl text-white">
        {/* Top Header Strip: Experiment Selector & Bench Indicators */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-ink-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-brand-400 uppercase">
                  Virtual Bench 4-Channel Logic Analyzer
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {currentTimebase.samplingRateStr}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>{activeExp.title}</span>
                <span className="text-xs font-mono font-normal text-ink-400">· Logic Probes</span>
              </h2>
            </div>
          </div>

          {/* Experiment Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-ink-400">Experiment:</label>
            <select
              value={activeExpId}
              onChange={(e) => {
                setActiveExpId(e.target.value);
                if (onSelectExperiment) onSelectExperiment(e.target.value);
                soundFX.playTap();
              }}
              className="bg-ink-900 border border-ink-700 text-xs font-mono rounded-xl px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {ROBOTICS_EXPERIMENTS.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  0{exp.order}. {exp.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Primary Controls Toolbar */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
          {/* RUN / STOP / SINGLE SHOT BUTTONS */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                setTriggerStatus(isRunning ? 'STOP' : 'AUTO');
                soundFX.playTap();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                isRunning
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30 hover:bg-emerald-400'
                  : 'bg-amber-500 text-black shadow-md shadow-amber-500/30 hover:bg-amber-400'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'RUN' : 'STOP'}</span>
            </button>

            <button
              onClick={handleSingleShot}
              disabled={isSingleShotArmed}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-200 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>SINGLE SHOT</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-xs font-bold bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-400 hover:text-white transition-all cursor-pointer"
              title="Reset Time & Cursors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Status Indicator Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-900 border border-ink-800 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning
                    ? 'bg-emerald-400 animate-pulse'
                    : isSingleShotArmed
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-[11px] font-bold text-ink-300">{triggerStatus}</span>
            </div>
          </div>

          {/* TIMEBASE SELECTOR */}
          <div className="flex items-center gap-1 bg-ink-900 p-1 rounded-2xl border border-ink-800">
            <span className="text-[10px] font-mono text-ink-400 px-2 font-bold">TIMEBASE:</span>
            {TIMEBASE_OPTIONS.map((tb) => {
              const isSelected = timebaseKey === tb.key;
              return (
                <button
                  key={tb.key}
                  onClick={() => {
                    setTimebaseKey(tb.key);
                    soundFX.playTap();
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-ink-400 hover:text-ink-200 hover:bg-ink-800/60'
                  }`}
                >
                  {tb.label}
                </button>
              );
            })}
          </div>

          {/* TRIGGER SOURCE & EDGE CONTROLS */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1 bg-ink-900 p-1 rounded-xl border border-ink-800">
              <span className="text-[10px] text-ink-400 px-1 font-bold">TRIG SRC:</span>
              {[0, 1, 2, 3].map((chNum) => (
                <button
                  key={chNum}
                  onClick={() => {
                    setTriggerSource(chNum as any);
                    soundFX.playTap();
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    triggerSource === chNum
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-ink-400 hover:text-white'
                  }`}
                >
                  CH{chNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setTriggerEdge(triggerEdge === 'rising' ? 'falling' : 'rising');
                soundFX.playTap();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-ink-900 border border-ink-800 text-ink-300 hover:text-white transition-all cursor-pointer"
              title="Toggle Trigger Edge"
            >
              <span>{triggerEdge === 'rising' ? 'EDGE: ↑ RISING' : 'EDGE: ↓ FALLING'}</span>
            </button>
          </div>

          {/* AUXILIARY CONTROLS (CURSORS & EXPORT) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowCursors(!showCursors);
                soundFX.playTap();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                showCursors
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-ink-900 border-ink-800 text-ink-400 hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>CURSORS</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-ink-900 border border-ink-800 text-ink-300 hover:text-white transition-all cursor-pointer"
              title="Export transition capture to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-xs font-bold bg-ink-900 border border-ink-800 text-ink-400 hover:text-white transition-all cursor-pointer"
              title="Toggle Fullscreen Canvas"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN LOGIC ANALYZER WAVEFORM CANVAS                           */}
      {/* ------------------------------------------------------------- */}
      <div className="relative rounded-3xl overflow-hidden border border-ink-800 bg-ink-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full cursor-crosshair block select-none"
        />

        {/* Canvas Overlay Instructions & Quick Drag Helpers */}
        <div className="absolute top-3 right-4 flex items-center gap-2 pointer-events-none opacity-80">
          <span className="text-[10px] font-mono text-ink-400 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
            Drag T1/T2 to measure · Drag canvas to pan
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DUAL TIMING CURSOR & PHYSICAL MEASUREMENT HUD                */}
      {/* ------------------------------------------------------------- */}
      {showCursors && (
        <div className="bg-ink-950 border border-ink-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
                Dual Timing Cursors &amp; Physical Transduction Readout
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => snapCursorToNearestEdge('T1')}
                className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
              >
                Snap T1 to Edge
              </button>
              <button
                onClick={() => snapCursorToNearestEdge('T2')}
                className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 cursor-pointer"
              >
                Snap T2 to Edge
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Cursor T1 Position */}
            <div className="p-3 rounded-2xl bg-ink-900 border border-cyan-500/30 space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">
                Cursor T1 (Reference)
              </span>
              <div className="text-lg font-black font-mono text-cyan-300">
                {cursorT1Us > 0 ? `+${cursorT1Us.toFixed(1)}` : cursorT1Us.toFixed(1)} µs
              </div>
              <p className="text-[10px] font-mono text-ink-400">Relative to Trigger (T=0)</p>
            </div>

            {/* Cursor T2 Position */}
            <div className="p-3 rounded-2xl bg-ink-900 border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 font-bold block uppercase">
                Cursor T2 (Target)
              </span>
              <div className="text-lg font-black font-mono text-amber-300">
                {cursorT2Us > 0 ? `+${cursorT2Us.toFixed(1)}` : cursorT2Us.toFixed(1)} µs
              </div>
              <p className="text-[10px] font-mono text-ink-400">Relative to Trigger (T=0)</p>
            </div>

            {/* Delta Time (Δt) */}
            <div className="p-3 rounded-2xl bg-ink-900 border border-brand-500/30 space-y-1">
              <span className="text-[10px] font-mono text-brand-400 font-bold block uppercase">
                Interval (Δt = |T2 - T1|)
              </span>
              <div className="text-lg font-black font-mono text-brand-300">
                {Math.abs(cursorT2Us - cursorT1Us).toFixed(1)} µs
              </div>
              <p className="text-[10px] font-mono text-ink-400">
                f ={' '}
                {Math.abs(cursorT2Us - cursorT1Us) > 0
                  ? `${(1000000 / Math.abs(cursorT2Us - cursorT1Us)).toFixed(1)} Hz`
                  : '—'}
              </p>
            </div>

            {/* Physical Domain Translation */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">
                Physical Decoded Metric
              </span>
              <div className="text-lg font-black font-mono text-emerald-300">
                {activeExpId === 'exp_ultrasonic_radar' && (
                  <span>{ultrasonicCalculatedDistance.distCm} cm</span>
                )}
                {activeExpId === 'exp_pir_servo_buzzer' && (
                  <span>{servoPwmDecoded.angleDeg}° Horn</span>
                )}
                {activeExpId === 'exp_encoder_motor_pid' && (
                  <span>{encoderDecoded.calculatedRpm} RPM</span>
                )}
                {activeExpId === 'exp_loadcell_smart_gripper' && (
                  <span>{hx711Decoded.loadGrams} g Load</span>
                )}
                {activeExpId === 'exp_hall_effect_tachometer' && (
                  <span>{tachometerRpm} RPM</span>
                )}
                {activeExpId === 'exp_mpu6050_balancing' && <span>400 kHz I2C</span>}
                {activeExpId === 'exp_ir_line_follower' && <span>976 Hz Motor PWM</span>}
                {activeExpId === 'exp_ldr_solar_tracker' && <span>50 Hz Sun Servo</span>}
              </div>
              <p className="text-[10px] font-mono text-emerald-400/80">
                {activeExpId === 'exp_ultrasonic_radar' && `d = (v · Δt)/2 (${ultrasonicCalculatedDistance.distInches} in)`}
                {activeExpId === 'exp_pir_servo_buzzer' && `${servoPwmDecoded.pulseWidthMs} ms PWM Pulse`}
                {activeExpId === 'exp_encoder_motor_pid' && `${encoderDecoded.direction} Direction`}
                {activeExpId === 'exp_loadcell_smart_gripper' && `Raw: ${hx711Decoded.hexStr}`}
                {activeExpId === 'exp_hall_effect_tachometer' && 'Instantaneous Commutation'}
                {activeExpId === 'exp_mpu6050_balancing' && 'MPU-6050 Burst Stream'}
                {activeExpId === 'exp_ir_line_follower' && 'Differential Steering Duty'}
                {activeExpId === 'exp_ldr_solar_tracker' && 'Closed-loop deadband gate'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PROTOCOL DECODERS & HARDWARE INTERACTIVE BENCH                */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-ink-950 border border-ink-800 rounded-3xl p-6 shadow-xl space-y-5 text-white">
        {/* Protocol Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">
                Integrated Hardware Decoders
              </span>
              <h3 className="text-sm sm:text-base font-bold">
                Live Protocol Bus Analyzer &amp; Transduction Decoders
              </h3>
            </div>
          </div>

          {/* Quick Decoder Tabs */}
          <div className="flex items-center gap-1.5 bg-ink-900 p-1 rounded-2xl border border-ink-800 overflow-x-auto no-scrollbar">
            {[
              { id: 'ultrasonic', label: 'Ultrasonic (HC-SR04)', exp: 'exp_ultrasonic_radar' },
              { id: 'servo', label: 'Servo PWM (50Hz)', exp: 'exp_pir_servo_buzzer' },
              { id: 'encoder', label: 'Quadrature Encoder', exp: 'exp_encoder_motor_pid' },
              { id: 'hx711', label: 'HX711 24-Bit ADC', exp: 'exp_loadcell_smart_gripper' },
            ].map((tab) => {
              const isMatch = activeExpId === tab.exp;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveExpId(tab.exp);
                    soundFX.playTap();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                    isMatch
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'text-ink-400 hover:text-white hover:bg-ink-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* DECODER 1: ULTRASONIC HC-SR04 PROTOCOL DECODER              */}
        {/* ----------------------------------------------------------- */}
        {activeExpId === 'exp_ultrasonic_radar' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-ink-900 border border-ink-800">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase">
                  Transduction Decoding: CH0 (TRIG, D11) &amp; CH1 (ECHO, D12)
                </span>
                <h4 className="text-sm font-bold text-white">
                  HC-SR04 Acoustic Time-of-Flight Packet Decoder
                </h4>
                <p className="text-xs text-ink-300">
                  Calculates roundtrip sound wave transit through dry air (speed v = 343.2 m/s at 20°C).
                </p>
              </div>

              {/* Interactive Target Distance Slider */}
              <div className="flex flex-col gap-1 sm:w-64">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-ink-400">Target Distance:</span>
                  <span className="text-sky-300 font-bold">{ultrasonicDistCm.toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="150.0"
                  step="0.5"
                  value={ultrasonicDistCm}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setUltrasonicDistCm(val);
                    // Automatically update cursor T2 to match echo pulse end
                    const echoWidth = (2 * val) / 0.03432;
                    setCursorT2Us(Math.round(560 + echoWidth));
                  }}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Protocol Packet Breakdown Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-ink-900/80 border border-sky-500/20 space-y-1">
                <span className="text-[10px] font-mono text-sky-400 font-bold block">1. TRIGGER STROBE</span>
                <div className="text-sm font-mono font-bold text-white">10.0 µs Pulse</div>
                <p className="text-[10px] font-mono text-ink-400">Initiates 8-cycle 40kHz sonic burst</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900/80 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold block">2. ACOUSTIC FLIGHT</span>
                <div className="text-sm font-mono font-bold text-white">450.0 µs Hold</div>
                <p className="text-[10px] font-mono text-ink-400">Transducer settling &amp; emission delay</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900/80 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">3. ECHO PULSE WIDTH</span>
                <div className="text-sm font-mono font-bold text-emerald-300">
                  {Math.round((2 * ultrasonicDistCm) / 0.03432)} µs
                </div>
                <p className="text-[10px] font-mono text-ink-400">HIGH until reflected wave detected</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900/80 border border-brand-500/20 space-y-1">
                <span className="text-[10px] font-mono text-brand-400 font-bold block">4. DECODED DISTANCE</span>
                <div className="text-base font-mono font-black text-brand-300">
                  {ultrasonicDistCm.toFixed(2)} cm
                </div>
                <p className="text-[10px] font-mono text-ink-400">
                  d = (343.2 m/s · Δt) / 2 = {(ultrasonicDistCm / 2.54).toFixed(2)} in
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* DECODER 2: SERVO PWM PROTOCOL DECODER                        */}
        {/* ----------------------------------------------------------- */}
        {(activeExpId === 'exp_pir_servo_buzzer' || activeExpId === 'exp_ldr_solar_tracker') && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-ink-900 border border-ink-800">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  Actuator Protocol: CH1 (Servo Gate PWM, Pin D9)
                </span>
                <h4 className="text-sm font-bold text-white">
                  50 Hz Servo Pulse Width Modulation (PWM) Decoder
                </h4>
                <p className="text-xs text-ink-300">
                  Decodes high-pulse width (1.0 ms → 0°, 1.5 ms → 90°, 2.0 ms → 180°).
                </p>
              </div>

              {/* Interactive Servo Angle Slider */}
              <div className="flex flex-col gap-1 sm:w-64">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-ink-400">Target Horn Angle:</span>
                  <span className="text-amber-300 font-bold">{servoAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="1"
                  value={servoAngleDeg}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setServoAngleDeg(val);
                    const pulseWidthUs = 1000 + (val / 180) * 1000;
                    setCursorT1Us(0);
                    setCursorT2Us(Math.round(pulseWidthUs));
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold block">PULSE WIDTH (Ton)</span>
                <div className="text-sm font-mono font-bold text-white">
                  {(1.0 + (servoAngleDeg / 180) * 1.0).toFixed(3)} ms
                </div>
                <p className="text-[10px] font-mono text-ink-400">Microsecond range: 1000 - 2000 µs</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">FRAME RATE</span>
                <div className="text-sm font-mono font-bold text-white">50.0 Hz (20.0 ms)</div>
                <p className="text-[10px] font-mono text-ink-400">Standard analog servo frame period</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-sky-500/20 space-y-1">
                <span className="text-[10px] font-mono text-sky-400 font-bold block">DUTY CYCLE</span>
                <div className="text-sm font-mono font-bold text-white">
                  {(((1.0 + (servoAngleDeg / 180) * 1.0) / 20.0) * 100).toFixed(2)} %
                </div>
                <p className="text-[10px] font-mono text-ink-400">Ton / 20ms</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-brand-500/20 space-y-1">
                <span className="text-[10px] font-mono text-brand-400 font-bold block">CALCULATED HORN ANGLE</span>
                <div className="text-base font-mono font-black text-brand-300">{servoAngleDeg}.0°</div>
                <p className="text-[10px] font-mono text-ink-400">θ = (Ton - 1.0ms) · 180°</p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* DECODER 3: QUADRATURE ENCODER DECODER                        */}
        {/* ----------------------------------------------------------- */}
        {activeExpId === 'exp_encoder_motor_pid' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-ink-900 border border-ink-800">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  Quadrature State Machine: CH0 (Phase A) &amp; CH1 (Phase B)
                </span>
                <h4 className="text-sm font-bold text-white">
                  2-Channel Optical Quadrature Rotary Encoder Decoder
                </h4>
                <p className="text-xs text-ink-300">
                  Decodes 90° phase lead-lag into direction (CW/CCW) and 4X edge transitions into shaft RPM.
                </p>
              </div>

              {/* Interactive RPM & Direction Controls */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 w-44">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-ink-400">Motor Speed:</span>
                    <span className="text-cyan-300 font-bold">{encoderRpm} RPM</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="3600"
                    step="50"
                    value={encoderRpm}
                    onChange={(e) => setEncoderRpm(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => {
                    setEncoderDirection(encoderDirection === 'CW' ? 'CCW' : 'CW');
                    soundFX.playTap();
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    encoderDirection === 'CW'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {encoderDirection === 'CW' ? '↻ CW (Forward)' : '↺ CCW (Reverse)'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-cyan-500/20 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block">PHASE RELATIONSHIP</span>
                <div className="text-sm font-mono font-bold text-white">{encoderDecoded.leadLag}</div>
                <p className="text-[10px] font-mono text-ink-400">90° electrical phase offset</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">DIRECTION</span>
                <div className="text-sm font-mono font-bold text-emerald-300">
                  {encoderDirection === 'CW' ? 'CLOCKWISE (+)' : 'COUNTER-CLOCKWISE (-)'}
                </div>
                <p className="text-[10px] font-mono text-ink-400">Gray code 2-bit transition sequence</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold block">QUADRANT TRANSITIONS</span>
                <div className="text-xs font-mono font-bold text-amber-300">{encoderDecoded.stateSequence}</div>
                <p className="text-[10px] font-mono text-ink-400">{encoderDecoded.resolution}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-brand-500/20 space-y-1">
                <span className="text-[10px] font-mono text-brand-400 font-bold block">CALCULATED SPEED</span>
                <div className="text-base font-mono font-black text-brand-300">{encoderRpm} RPM</div>
                <p className="text-[10px] font-mono text-ink-400">
                  f_quad = {Math.round((encoderRpm * 64) / 60)} transitions/sec
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* DECODER 4: HX711 24-BIT DELTA-SIGMA ADC PROTOCOL DECODER     */}
        {/* ----------------------------------------------------------- */}
        {activeExpId === 'exp_loadcell_smart_gripper' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-ink-900 border border-ink-800">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">
                  Serial Bus Protocol: CH0 (HX711 DOUT, D3) &amp; CH1 (SCK Clock, D2)
                </span>
                <h4 className="text-sm font-bold text-white">
                  HX711 24-Bit Delta-Sigma Precision ADC Frame Decoder
                </h4>
                <p className="text-xs text-ink-300">
                  Decodes 24 positive SCK clock pulses shifting two&apos;s-complement bits MSB-first plus 25th gain selection pulse.
                </p>
              </div>

              {/* Interactive Applied Force / Load Slider */}
              <div className="flex flex-col gap-1 sm:w-64">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-ink-400">Load Applied:</span>
                  <span className="text-purple-300 font-bold">{loadcellGrams} grams</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="450"
                  step="5"
                  value={loadcellGrams}
                  onChange={(e) => setLoadcellGrams(parseInt(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-purple-500/20 space-y-1">
                <span className="text-[10px] font-mono text-purple-400 font-bold block">SCK BURST CLOCK</span>
                <div className="text-sm font-mono font-bold text-white">25 Pulses @ 500 kHz</div>
                <p className="text-[10px] font-mono text-ink-400">24 Data bits + 1 Gain 128 pulse</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-sky-500/20 space-y-1">
                <span className="text-[10px] font-mono text-sky-400 font-bold block">HEX REGISTER VALUE</span>
                <div className="text-sm font-mono font-bold text-sky-300">{hx711Decoded.hexStr}</div>
                <p className="text-[10px] font-mono text-ink-400">{hx711Decoded.rawCounts} raw counts</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold block">BINARY STREAM (MSB→LSB)</span>
                <div className="text-[11px] font-mono font-bold text-amber-300 tracking-wider">
                  {hx711Decoded.binStr}
                </div>
                <p className="text-[10px] font-mono text-ink-400">Bit 23 (Sign) down to Bit 0</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">CALIBRATED FORCE</span>
                <div className="text-base font-mono font-black text-emerald-300">{loadcellGrams}.0 g</div>
                <p className="text-[10px] font-mono text-ink-400">
                  {loadcellGrams > 200 ? '⚠️ Shell Fracture Risk (>200g)' : '✓ Safe Egg Grasp'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* DECODER 5: I2C FAST MODE PROTOCOL DECODER (INVERTED PENDULUM) */}
        {/* ----------------------------------------------------------- */}
        {activeExpId === 'exp_mpu6050_balancing' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-ink-900 border border-ink-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase">
                  Serial Bus Protocol: CH0 (I2C SCL, A5) &amp; CH1 (I2C SDA, A4)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  400 kHz Fast Mode
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                MPU-6050 6-DOF Inertial Sensor Register Read Sequence
              </h4>
              <p className="text-xs text-ink-300">
                Synchronized 100 Hz hardware interrupt (D2) triggers 14-byte burst read of accelerometer &amp; gyroscope FIFO registers.
              </p>
            </div>

            {/* I2C Frame Visual Ribbon */}
            <div className="flex items-center gap-2 overflow-x-auto p-3 rounded-2xl bg-black/60 border border-ink-800 text-xs font-mono no-scrollbar">
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                [START]
              </span>
              <span className="text-ink-500">→</span>
              <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                ADDR: 0x68 + W
              </span>
              <span className="text-emerald-400 font-bold">ACK</span>
              <span className="text-ink-500">→</span>
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                REG: 0x3B (ACCEL_XOUT_H)
              </span>
              <span className="text-emerald-400 font-bold">ACK</span>
              <span className="text-ink-500">→</span>
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                [RESTART]
              </span>
              <span className="text-ink-500">→</span>
              <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                ADDR: 0x68 + R
              </span>
              <span className="text-emerald-400 font-bold">ACK</span>
              <span className="text-ink-500">→</span>
              <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                DATA: 14 Bytes FIFO Stream
              </span>
              <span className="text-ink-500">→</span>
              <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                [STOP]
              </span>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* DECODER 6: HALL EFFECT COMMUTATION (TACHOMETER)              */}
        {/* ----------------------------------------------------------- */}
        {activeExpId === 'exp_hall_effect_tachometer' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-ink-900 border border-ink-800">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  Magnetic Transduction: CH0 (Hall OUT, D2) &amp; CH3 (Timer 1 ICP1)
                </span>
                <h4 className="text-sm font-bold text-white">
                  BLDC Rotor Electronic Commutation &amp; RPM Capture
                </h4>
                <p className="text-xs text-ink-300">
                  Hall switch open-collector pulls LOW for 1.2 ms on magnetic pole transit, captured by 16-bit Timer 1 ICP1.
                </p>
              </div>

              {/* Interactive RPM Slider */}
              <div className="flex flex-col gap-1 sm:w-64">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-ink-400">Rotor Speed:</span>
                  <span className="text-emerald-300 font-bold">{tachometerRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="6000"
                  step="100"
                  value={tachometerRpm}
                  onChange={(e) => setTachometerRpm(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">HALL PULSE PERIOD</span>
                <div className="text-sm font-mono font-bold text-white">
                  {((60 * 1000) / (tachometerRpm * 2)).toFixed(2)} ms
                </div>
                <p className="text-[10px] font-mono text-ink-400">2 pulses per mechanical revolution</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-sky-500/20 space-y-1">
                <span className="text-[10px] font-mono text-sky-400 font-bold block">ELECTRICAL FREQUENCY</span>
                <div className="text-sm font-mono font-bold text-white">
                  {((tachometerRpm * 2) / 60).toFixed(1)} Hz
                </div>
                <p className="text-[10px] font-mono text-ink-400">Commutation frequency</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold block">ICP1 TIMER TICK</span>
                <div className="text-sm font-mono font-bold text-amber-300">0.5 µs / Tick</div>
                <p className="text-[10px] font-mono text-ink-400">16-bit ATmega328P Timer 1 Prescaler 8</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-ink-900 border border-brand-500/20 space-y-1">
                <span className="text-[10px] font-mono text-brand-400 font-bold block">CALCULATED RPM</span>
                <div className="text-base font-mono font-black text-brand-300">{tachometerRpm} RPM</div>
                <p className="text-[10px] font-mono text-ink-400">RPM = (60 · f_hall) / 2</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
