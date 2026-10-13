/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SerialMonitorFaultsPanel:
 * An authentic, interactive ATmega328P / Arduino UART Serial Monitor and Hardware
 * Fault Injection Matrix for the Robotics & Physical Computing Laboratory.
 *
 * Features:
 * - Real-time UART data stream formatted with timestamps, ADC counts, PID errors, and hardware status flags.
 * - Dynamic Baud Rate switching (9600 Baud vs 115200 Baud).
 * - Autoscroll, Clear, Copy Log, and Stream Pause/Resume.
 * - Interactive Command CLI with presets (HELP, STATUS, TARE, CALIBRATE, SET_KP, RESET_IMU, TRIGGER_RADAR, INJECT_FAULT).
 * - 5-channel Hardware Fault Injection Matrix (Ground bounce, dust occlusion, acoustic multipath, inductive flyback, thermal drift).
 * - Full synchronization with the 60 FPS visual physics simulation & digital storage oscilloscope.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Terminal,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Play,
  Pause,
  Send,
  EyeOff,
  Radio,
  Sparkles,
  Flame,
  Layers,
  ChevronDown,
  Info,
  CornerDownLeft,
  Cpu,
} from 'lucide-react';
import { RoboticsExperiment } from '../data/roboticsExperimentsData';
import { HardwareFaults, RoboticsHardwareSimCanvas } from './RoboticsHardwareSimCanvas';
import { soundFX } from '../utils/audio';
import { copyTextToClipboard } from '../utils/clipboard';

export interface SerialMonitorFaultsPanelProps {
  experiment: RoboticsExperiment;
  activeFaults: HardwareFaults;
  onToggleFault: (faultKey: keyof HardwareFaults) => void;
  onResetFaults: () => void;
  onSetAllFaults: (enabled: boolean) => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'telemetry' | 'warn' | 'fault' | 'cal' | 'cmd' | 'reply' | 'system';
  content: string;
}

export interface AtmegaBitDef {
  name: string;
  bitIndex: number;
  value: number;
  description: string;
}

export interface AtmegaRegisterDef {
  name: string;
  category: 'timer' | 'adc' | 'gpio' | 'status';
  address: string;
  decimalValue: number;
  hexValue: string;
  description: string;
  siliconPurpose: string;
  bits: AtmegaBitDef[];
}

const FAULT_DEFINITIONS: Array<{
  key: keyof HardwareFaults;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  color: string;
  description: string;
  physicalImpact: string;
  affectedExperiments: string[];
}> = [
  {
    key: 'groundBounce',
    name: 'Ground Bounce / 50Hz Mains Hum',
    icon: Activity,
    tag: 'EMI / Power Plane',
    color: 'amber',
    description: 'Injects 50Hz sinusoidal AC ripple on analog ADC lines and reference ground plane.',
    physicalImpact: 'Distorts analog sensor ADC readings with ±450mV periodic hum ripple; creates PID jitter and false edge noise.',
    affectedExperiments: ['exp_ir_line_follower', 'exp_ldr_solar_tracker', 'exp_mpu6050_balancing', 'exp_loadcell_smart_gripper', 'exp_pir_servo_buzzer'],
  },
  {
    key: 'opticalOcclusion',
    name: 'Optical Sensor Dust Occlusion',
    icon: EyeOff,
    tag: 'Optical / Transduction',
    color: 'rose',
    description: 'Drops TCRT5000 IR / slotted encoder / photocell reflective and transmitted signal by 80%.',
    physicalImpact: 'Signal drops below Schmitt trigger logic thresholds (drops 80% encoder pulses -> motor PID saturates PWM to 255; line follower loses black tape).',
    affectedExperiments: ['exp_ir_line_follower', 'exp_encoder_motor_pid', 'exp_ldr_solar_tracker'],
  },
  {
    key: 'acousticMultipath',
    name: 'Acoustic Multipath Reflection',
    icon: Radio,
    tag: 'Acoustics / Wave Physics',
    color: 'purple',
    description: 'Generates spurious secondary HC-SR04 ghost radar echoes from parasitic acoustic paths.',
    physicalImpact: 'Transducer receives false phantom returns; distance jumps erratically between true target and ghost multipath surfaces.',
    affectedExperiments: ['exp_ultrasonic_radar'],
  },
  {
    key: 'inductiveSpike',
    name: 'Motor Inductive Flyback Spike',
    icon: Sparkles,
    tag: 'High Voltage Transients',
    color: 'red',
    description: 'Injects periodic high-voltage inductive kickback spikes (L di/dt) from unsuppressed motor windings.',
    physicalImpact: 'Generates ringing high-voltage transients (+8V to +30V) coupling into microcontroller logic pins and oscilloscope probes.',
    affectedExperiments: ['exp_encoder_motor_pid', 'exp_ir_line_follower', 'exp_mpu6050_balancing', 'exp_hall_effect_tachometer', 'exp_loadcell_smart_gripper'],
  },
  {
    key: 'thermalDrift',
    name: 'Thermal Resistance Drift',
    icon: Flame,
    tag: 'Thermal / Piezoresistive',
    color: 'orange',
    description: 'Drifts strain gauge Wheatstone bridge, CdS photoresistors, and MEMS gyro baseline calibration.',
    physicalImpact: 'Baseline resistance creeps uncompensated; load cell tare drifts +75g causing gripper jaw slip; gyro zero-rate accumulates integral windup.',
    affectedExperiments: ['exp_loadcell_smart_gripper', 'exp_ldr_solar_tracker', 'exp_mpu6050_balancing', 'exp_pir_servo_buzzer'],
  },
];

const PRESET_COMMANDS = [
  'HELP',
  'STATUS',
  'TARE',
  'CALIBRATE',
  'SET_KP 1.8',
  'RESET_IMU',
  'TRIGGER_RADAR',
  'INJECT_FAULT',
];

export const SerialMonitorFaultsPanel: React.FC<SerialMonitorFaultsPanelProps> = ({
  experiment,
  activeFaults,
  onToggleFault,
  onResetFaults,
  onSetAllFaults,
}) => {
  const [baudRate, setBaudRate] = useState<9600 | 115200>(115200);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [inputCommand, setInputCommand] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showSimCanvas, setShowSimCanvas] = useState<boolean>(true);
  const [showRegisters, setShowRegisters] = useState<boolean>(true);
  const [regCategoryFilter, setRegCategoryFilter] = useState<'all' | 'timer' | 'adc' | 'gpio' | 'status'>('all');
  const [tickCount, setTickCount] = useState<number>(0);

  const lastTxTimeRef = useRef<number>(0);
  const lastRxTimeRef = useRef<number>(0);
  const prevRegsRef = useRef<Record<string, number>>({});
  const bitFlipTimesRef = useRef<Record<string, number>>({});

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const logCounterRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  // Continuous MCU system timer heartbeat
  useEffect(() => {
    const timer = setInterval(() => {
      setTickCount((prev) => prev + 1);
    }, 380);
    return () => clearInterval(timer);
  }, []);

  // Active fault count
  const activeFaultCount = useMemo(() => {
    return Object.values(activeFaults).filter(Boolean).length;
  }, [activeFaults]);

  // Initial welcome message when switching experiments
  useEffect(() => {
    startTimeRef.current = Date.now();
    logCounterRef.current = 0;
    const initialLogs: LogEntry[] = [
      {
        id: `sys-${Date.now()}-1`,
        timestamp: '00:00.000',
        type: 'system',
        content: `--- COM3 OPENED AT ${baudRate} BAUD (8-N-1) ---`,
      },
      {
        id: `sys-${Date.now()}-2`,
        timestamp: '00:00.015',
        type: 'system',
        content: `ATmega328P Initialized @ 16.000 MHz | Experiment: ${experiment.title}`,
      },
      {
        id: `sys-${Date.now()}-3`,
        timestamp: '00:00.030',
        type: 'system',
        content: `Transducer: ${experiment.transducerType} | Firmware Ready. Type 'HELP' for commands.`,
      },
    ];
    setLogs(initialLogs);
  }, [experiment.id, baudRate]);

  // Real-time UART Data Stream Generator
  useEffect(() => {
    if (!isStreaming) return;

    const intervalMs = baudRate === 115200 ? 180 : 850;

    const intervalId = setInterval(() => {
      logCounterRef.current += 1;
      lastTxTimeRef.current = Date.now();
      setTickCount((prev) => prev + 1);
      const elapsed = Date.now() - startTimeRef.current;
      const mins = Math.floor(elapsed / 60000).toString().padStart(2, '0');
      const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
      const ms = (elapsed % 1000).toString().padStart(3, '0');
      const timeStr = `${mins}:${secs}.${ms}`;

      // Generate telemetry line based on experiment and active faults
      const expId = experiment.id;
      let logType: LogEntry['type'] = 'telemetry';
      let content = '';

      const count = logCounterRef.current;

      if (expId === 'exp_pir_servo_buzzer') {
        if (activeFaults.thermalDrift && count % 5 === 0) {
          logType = 'fault';
          content = `[PIR] [THERMAL_DRIFT] LiTaO3 crystal delta-T/dt drift: Spurious motion pulse fired on Pin 2!`;
        } else if (activeFaults.groundBounce && count % 4 === 0) {
          logType = 'warn';
          content = `[PIR] [NOISE_ERR] Ground bounce: ADC V_REF ripple +/-420mV on comparator rail.`;
        } else {
          const triggered = count % 8 === 0 || count % 8 === 1;
          content = `[PIR] D2: ${triggered ? 'HIGH' : 'LOW'} | GateAngle: ${triggered ? '90' : '0'} deg | Audio: ${triggered ? '1000Hz' : 'OFF'} | STAT: ${triggered ? 'MOTION_DETECTED' : 'ARMED'}`;
        }
      } else if (expId === 'exp_ultrasonic_radar') {
        if (activeFaults.acousticMultipath && count % 3 === 0) {
          logType = 'fault';
          const ghostDist = (15.2 + (count % 7) * 7.4).toFixed(1);
          content = `[RADAR] [MULTIPATH_ALERT] Spurious echo echo: ${ghostDist}cm (Phantom return detected, angle: ${(count * 12) % 180} deg)`;
        } else if (activeFaults.groundBounce && count % 4 === 0) {
          logType = 'warn';
          content = `[RADAR] [ECHO_JITTER] 50Hz hum on comparator input: Echo pulse width jitter +/-28us.`;
        } else {
          const angle = (count * 6) % 180;
          const dist = (24.0 + Math.sin(count * 0.4) * 6.5).toFixed(1);
          content = `[RADAR] Pan: ${angle.toString().padStart(3, ' ')} deg | Pulse: 1450us | Dist: ${dist}cm | Target: TRACKED`;
        }
      } else if (expId === 'exp_ir_line_follower') {
        if (activeFaults.opticalOcclusion) {
          logType = 'fault';
          content = `[LINE] [FAULT: DUST_OCCLUSION] TCRT5000 signal dropped 80%! A0: 0.12V, A1: 0.14V | TRACK LOST`;
        } else if (activeFaults.inductiveSpike && count % 4 === 0) {
          logType = 'warn';
          content = `[PWR] [FLYBACK_SPIKE] Motor H-Bridge L(di/dt): +28.4V inductive kickback spike on VCC!`;
        } else if (activeFaults.groundBounce && count % 5 === 0) {
          logType = 'warn';
          content = `[LINE] [NOISE_WARN] Ground hum on analog lines: A0/A1 ripple +/-380mV`;
        } else {
          const lIR = (2.2 + Math.sin(count * 0.5) * 1.8).toFixed(2);
          const rIR = (2.2 - Math.sin(count * 0.5) * 1.8).toFixed(2);
          const pwmL = Math.round(160 - Math.sin(count * 0.5) * 60);
          const pwmR = Math.round(160 + Math.sin(count * 0.5) * 60);
          content = `[LINE] A0(L): ${lIR}V | A1(R): ${rIR}V | PWM_L: ${pwmL} | PWM_R: ${pwmR} | Heading: LOCKED`;
        }
      } else if (expId === 'exp_mpu6050_balancing') {
        if (activeFaults.thermalDrift && count % 4 === 0) {
          logType = 'fault';
          content = `[IMU] [BIAS_DRIFT] MEMS Gyro zero-rate drift: +3.2 deg/s uncompensated | PID integral windup!`;
        } else if (activeFaults.inductiveSpike && count % 5 === 0) {
          logType = 'warn';
          content = `[IMU] [I2C_GLITCH] Motor transients induced high-frequency spike on SDA/SCL lines.`;
        } else {
          const pitch = (Math.sin(count * 0.3) * 3.4).toFixed(2);
          const rate = (Math.cos(count * 0.3) * 14.2).toFixed(1);
          const pwm = Math.round(Math.sin(count * 0.3) * 68);
          content = `[IMU] Pitch: ${pitch} deg | GyroRate: ${rate} deg/s | PID_u: ${pwm} PWM | STAT: BALANCED`;
        }
      } else if (expId === 'exp_ldr_solar_tracker') {
        if (activeFaults.opticalOcclusion) {
          logType = 'fault';
          content = `[SOLAR] [OCCLUDED] Photocell optical aperture dirty: Flux -80% | Left: 0.22V, Right: 0.21V`;
        } else if (activeFaults.thermalDrift && count % 4 === 0) {
          logType = 'warn';
          content = `[SOLAR] [THERMAL_OFFSET] CdS temperature coefficient imbalance (+0.92V): Pan offset 28 deg from sun!`;
        } else {
          const lV = (3.45 + Math.sin(count * 0.2) * 0.4).toFixed(2);
          const rV = (3.40 - Math.sin(count * 0.2) * 0.4).toFixed(2);
          const pan = Math.round(90 + Math.sin(count * 0.2) * 25);
          content = `[SOLAR] LDR_L(A0): ${lV}V | LDR_R(A1): ${rV}V | Delta: ${(parseFloat(lV) - parseFloat(rV)).toFixed(2)}V | ServoPan: ${pan} deg`;
        }
      } else if (expId === 'exp_encoder_motor_pid') {
        if (activeFaults.opticalOcclusion) {
          logType = 'fault';
          content = `[PID] [FAULT: MISSED_TICKS] Slotted optical fork occluded! Pulse amp 1.0V < 2.5V TTL. Measured: 24.2 RPM => PWM SATURATED (255)!`;
        } else if (activeFaults.inductiveSpike && count % 4 === 0) {
          logType = 'warn';
          content = `[PWR] [FLYBACK_SPIKE] Motor commutation arc: +31.5V inductive spike clamped by snubber.`;
        } else {
          const rpm = (129.5 + Math.sin(count * 0.4) * 2.8).toFixed(1);
          const pwm = Math.round(135 - Math.sin(count * 0.4) * 8);
          content = `[PID] Target: 130 RPM | Measured: ${rpm} RPM | Err: ${(130 - parseFloat(rpm)).toFixed(1)} | PWM: ${pwm} (53%) | LOCKED`;
        }
      } else if (expId === 'exp_hall_effect_tachometer') {
        if (activeFaults.inductiveSpike && count % 4 === 0) {
          logType = 'warn';
          content = `[TACHO] [NOISE_TRIGGER] Motor brush arc triggered false falling-edge interrupt on Pin 2!`;
        } else if (activeFaults.groundBounce && count % 5 === 0) {
          logType = 'warn';
          content = `[TACHO] [ANALOG_HUM] 50Hz hum on 5V pull-up rail: 4.62V - 5.38V oscillation.`;
        } else {
          const rpm = Math.round(2400 + Math.sin(count * 0.25) * 45);
          content = `[TACHO] SpindleRPM: ${rpm} | Period: ${Math.round(60000000 / rpm)}us | D2_IRQ: FALLING | MagnetCount: ${count * 4}`;
        }
      } else if (expId === 'exp_loadcell_smart_gripper') {
        if (activeFaults.thermalDrift && count % 3 === 0) {
          logType = 'fault';
          content = `[HX711] [THERMAL_DRIFT] Wheatstone gauge self-heating (+68,000 counts / +28.3g). False tare drift detected!`;
        } else if (activeFaults.groundBounce && count % 4 === 0) {
          logType = 'warn';
          content = `[HX711] [GND_BOUNCE] 50Hz AC mains hum on E+/E- excitation: Raw counts oscillating +/-42,000.`;
        } else {
          const force = (148.5 + Math.sin(count * 0.3) * 3.2).toFixed(1);
          const rawCounts = Math.round(120000 + parseFloat(force) * 2400);
          content = `[HX711] ADC: ${rawCounts} counts | Force: ${force}g | Target: 150.0g | Servo: 42.1 deg | Mode: AUTO_GRASP`;
        }
      } else {
        content = `[MCU] Status: OK | ADC0: 512 | Timer1: 0x${((count * 13) % 65535).toString(16)} | Heap: 1482 bytes`;
      }

      setLogs((prev) => {
        const nextLogs = [
          ...prev,
          {
            id: `uart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: timeStr,
            type: logType,
            content,
          },
        ];
        // Retain max 180 items
        if (nextLogs.length > 180) {
          return nextLogs.slice(nextLogs.length - 180);
        }
        return nextLogs;
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [experiment.id, baudRate, isStreaming, activeFaults]);

  // Autoscroll handling
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Handle Command Submit
  const handleSendCommand = (cmdToRun?: string) => {
    const rawCmd = (cmdToRun || inputCommand).trim();
    if (!rawCmd) return;

    soundFX.playTap();
    lastRxTimeRef.current = Date.now();
    setTickCount((prev) => prev + 1);
    const cmdUpper = rawCmd.toUpperCase();
    const elapsed = Date.now() - startTimeRef.current;
    const mins = Math.floor(elapsed / 60000).toString().padStart(2, '0');
    const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
    const ms = (elapsed % 1000).toString().padStart(3, '0');
    const timeStr = `${mins}:${secs}.${ms}`;

    // Add command to history
    setCommandHistory((prev) => [rawCmd, ...prev.slice(0, 20)]);
    setHistoryIndex(-1);
    setInputCommand('');

    // Generate realistic ATmega328P replies based on active experiment
    const responseLogs: LogEntry[] = [
      {
        id: `cmd-${Date.now()}`,
        timestamp: timeStr,
        type: 'cmd',
        content: `>> ${rawCmd}`,
      },
    ];

    if (cmdUpper === 'HELP') {
      responseLogs.push({
        id: `rep-${Date.now()}-1`,
        timestamp: timeStr,
        type: 'reply',
        content: `--- ATmega328P FIRMWARE COMMAND SET ---`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-2`,
        timestamp: timeStr,
        type: 'reply',
        content: `HELP             - Show available serial commands & syntax`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-3`,
        timestamp: timeStr,
        type: 'reply',
        content: `STATUS           - Dump MCU registers, peripheral state & fault matrix`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-4`,
        timestamp: timeStr,
        type: 'reply',
        content: `TARE             - Zero-calibrate sensor baseline offset into EEPROM`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-5`,
        timestamp: timeStr,
        type: 'reply',
        content: `CALIBRATE        - Run 2-point ADC reference voltage calibration`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-6`,
        timestamp: timeStr,
        type: 'reply',
        content: `SET_KP <float>   - Set PID proportional gain Kp (e.g. SET_KP 1.8)`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-7`,
        timestamp: timeStr,
        type: 'reply',
        content: `RESET_IMU        - Re-zero MPU-6050 gyro bias & reset complementary filter`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-8`,
        timestamp: timeStr,
        type: 'reply',
        content: `TRIGGER_RADAR    - Fire immediate 10us ultrasonic echo pulse on Pin 11`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-9`,
        timestamp: timeStr,
        type: 'reply',
        content: `INJECT_FAULT <f> - Toggle fault: GROUND, DUST, MULTIPATH, SPIKE, DRIFT, RESET`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-10`,
        timestamp: timeStr,
        type: 'reply',
        content: `CLEAR            - Clear serial terminal buffer`,
      });
    } else if (cmdUpper === 'STATUS') {
      responseLogs.push({
        id: `rep-${Date.now()}-1`,
        timestamp: timeStr,
        type: 'reply',
        content: `[STATUS] MCU: ATmega328P @ 16.0MHz | VCC: 5.02V | Free SRAM: 1482 bytes`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-2`,
        timestamp: timeStr,
        type: 'reply',
        content: `[STATUS] Experiment: ${experiment.title} (${experiment.id})`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-3`,
        timestamp: timeStr,
        type: 'reply',
        content: `[FAULT MATRIX] GroundBounce: ${activeFaults.groundBounce ? 'ENGAGED' : 'NOMINAL'} | Dust: ${activeFaults.opticalOcclusion ? 'ENGAGED' : 'NOMINAL'} | Multipath: ${activeFaults.acousticMultipath ? 'ENGAGED' : 'NOMINAL'} | Spike: ${activeFaults.inductiveSpike ? 'ENGAGED' : 'NOMINAL'} | Drift: ${activeFaults.thermalDrift ? 'ENGAGED' : 'NOMINAL'}`,
      });
    } else if (cmdUpper === 'TARE') {
      if (experiment.id === 'exp_loadcell_smart_gripper') {
        responseLogs.push({
          id: `rep-${Date.now()}-1`,
          timestamp: timeStr,
          type: 'cal',
          content: `[CAL] Offset: 8421000 | Scale: 420.5 cnt/g | TARE complete (Net: 0.00g).`,
        });
      } else {
        responseLogs.push({
          id: `rep-${Date.now()}-1`,
          timestamp: timeStr,
          type: 'cal',
          content: `[CAL] Sensor baseline offset zeroed to ambient environment. EEPROM updated.`,
        });
      }
    } else if (cmdUpper === 'CALIBRATE') {
      responseLogs.push({
        id: `rep-${Date.now()}-1`,
        timestamp: timeStr,
        type: 'cal',
        content: `[CAL] Running 2-point ADC sensor calibration routine...`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-2`,
        timestamp: timeStr,
        type: 'cal',
        content: `[CAL] Point 0: 0.000V => ADC count 0 | Point 1: 5.000V => ADC count 1023`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-3`,
        timestamp: timeStr,
        type: 'cal',
        content: `[CAL] Calibration coefficient written: 1.00000. Linearity R^2 = 0.9998. OK.`,
      });
    } else if (cmdUpper.startsWith('SET_KP')) {
      const parts = rawCmd.split(/\s+/);
      const val = parts[1] || '1.8';
      responseLogs.push({
        id: `rep-${Date.now()}-1`,
        timestamp: timeStr,
        type: 'reply',
        content: `[PID] Proportional gain updated: Kp = ${parseFloat(val).toFixed(3)}. Stored in EEPROM (0x0040).`,
      });
    } else if (cmdUpper === 'RESET_IMU') {
      responseLogs.push({
        id: `rep-${Date.now()}-1`,
        timestamp: timeStr,
        type: 'cal',
        content: `[IMU] MPU-6050 Auto-Calibration initiated (100 samples)...`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-2`,
        timestamp: timeStr,
        type: 'cal',
        content: `[IMU] Zero-rate offsets zeroed: [gx: +0.01, gy: -0.02, gz: +0.00] deg/s. Fusion filter reset.`,
      });
    } else if (cmdUpper === 'TRIGGER_RADAR') {
      responseLogs.push({
        id: `rep-${Date.now()}-1`,
        timestamp: timeStr,
        type: 'reply',
        content: `[RADAR] 10us Trigger pulse emitted on Pin 11. Listening on Pin 12...`,
      });
      responseLogs.push({
        id: `rep-${Date.now()}-2`,
        timestamp: timeStr,
        type: 'reply',
        content: `[RADAR] Echo pulse captured: 1450us => Calculated distance: 25.0 cm. OK.`,
      });
    } else if (cmdUpper.startsWith('INJECT_FAULT')) {
      const parts = cmdUpper.split(/\s+/);
      const faultArg = parts[1] || '';
      if (faultArg === 'GROUND' || faultArg === 'GROUND_BOUNCE') {
        onToggleFault('groundBounce');
        responseLogs.push({
          id: `rep-${Date.now()}`,
          timestamp: timeStr,
          type: 'fault',
          content: `[FAULT MATRIX] Toggled Ground Bounce / 50Hz Mains Hum.`,
        });
      } else if (faultArg === 'DUST' || faultArg === 'OPTICAL') {
        onToggleFault('opticalOcclusion');
        responseLogs.push({
          id: `rep-${Date.now()}`,
          timestamp: timeStr,
          type: 'fault',
          content: `[FAULT MATRIX] Toggled Optical Sensor Dust Occlusion.`,
        });
      } else if (faultArg === 'MULTIPATH' || faultArg === 'RADAR') {
        onToggleFault('acousticMultipath');
        responseLogs.push({
          id: `rep-${Date.now()}`,
          timestamp: timeStr,
          type: 'fault',
          content: `[FAULT MATRIX] Toggled Acoustic Multipath Reflection.`,
        });
      } else if (faultArg === 'SPIKE' || faultArg === 'FLYBACK') {
        onToggleFault('inductiveSpike');
        responseLogs.push({
          id: `rep-${Date.now()}`,
          timestamp: timeStr,
          type: 'fault',
          content: `[FAULT MATRIX] Toggled Motor Inductive Flyback Spike.`,
        });
      } else if (faultArg === 'DRIFT' || faultArg === 'THERMAL') {
        onToggleFault('thermalDrift');
        responseLogs.push({
          id: `rep-${Date.now()}`,
          timestamp: timeStr,
          type: 'fault',
          content: `[FAULT MATRIX] Toggled Thermal Resistance Drift.`,
        });
      } else if (faultArg === 'RESET' || faultArg === 'CLEAR') {
        onResetFaults();
        responseLogs.push({
          id: `rep-${Date.now()}`,
          timestamp: timeStr,
          type: 'reply',
          content: `[FAULT MATRIX] All faults cleared. Microcontroller nominal state restored.`,
        });
      } else {
        responseLogs.push({
          id: `rep-${Date.now()}`,
          timestamp: timeStr,
          type: 'reply',
          content: `[FAULT MATRIX] Usage: INJECT_FAULT <GROUND | DUST | MULTIPATH | SPIKE | DRIFT | RESET>`,
        });
      }
    } else if (cmdUpper === 'CLEAR') {
      setLogs([]);
      return;
    } else {
      responseLogs.push({
        id: `rep-${Date.now()}-err`,
        timestamp: timeStr,
        type: 'warn',
        content: `[ERR] Unknown command: '${rawCmd}'. Type 'HELP' for supported command set.`,
      });
    }

    setLogs((prev) => [...prev, ...responseLogs]);
  };

  // Keyboard navigation for command history
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCommand('');
      }
    }
  };

  // Copy Logs to Clipboard
  const handleCopyLogs = async () => {
    const textToCopy = logs
      .map((l) => `[${l.timestamp}] ${l.content}`)
      .join('\n');
    const ok = await copyTextToClipboard(textToCopy);
    if (ok) {
      setIsCopied(true);
      soundFX.playSuccess();
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // 9 canonical ATmega328P Silicon Registers
  const registers = useMemo((): AtmegaRegisterDef[] => {
    const count = tickCount;
    const now = Date.now();
    const isTxActive = now - lastTxTimeRef.current < 350;
    const isRxActive = now - lastRxTimeRef.current < 350;
    const isHeartbeatHigh = Math.floor(now / 500) % 2 === 1;

    // 1. TCCR1A (0x80)
    const tccr1aBits: AtmegaBitDef[] = [
      { name: 'COM1A1', bitIndex: 7, value: 1, description: 'Clear OC1A on Compare Match (non-inverting PWM)' },
      { name: 'COM1A0', bitIndex: 6, value: 0, description: 'Normal port operation, OC1A disconnected if 0' },
      { name: 'COM1B1', bitIndex: 5, value: 0, description: 'Compare Output Mode B bit 1' },
      { name: 'COM1B0', bitIndex: 4, value: 0, description: 'Compare Output Mode B bit 0' },
      { name: '-', bitIndex: 3, value: 0, description: 'Reserved bit' },
      { name: '-', bitIndex: 2, value: 0, description: 'Reserved bit' },
      { name: 'WGM11', bitIndex: 1, value: 1, description: 'Waveform Generation Mode bit 1' },
      { name: 'WGM10', bitIndex: 0, value: 0, description: 'Waveform Generation Mode bit 0' },
    ];
    const tccr1aVal = 0x82;

    // 2. TCCR1B (0x81)
    const isNoiseCanceler = activeFaults.groundBounce ? 1 : 0;
    const tccr1bBits: AtmegaBitDef[] = [
      { name: 'ICNC1', bitIndex: 7, value: isNoiseCanceler, description: 'Input Capture Noise Canceler (activated during ground bounce EMI)' },
      { name: 'ICES1', bitIndex: 6, value: 1, description: 'Input Capture Edge Select (1 = Rising edge trigger)' },
      { name: '-', bitIndex: 5, value: 0, description: 'Reserved bit' },
      { name: 'WGM13', bitIndex: 4, value: 1, description: 'Waveform Generation Mode bit 3' },
      { name: 'WGM12', bitIndex: 3, value: 1, description: 'Waveform Generation Mode bit 2' },
      { name: 'CS12', bitIndex: 2, value: 0, description: 'Clock Select bit 2' },
      { name: 'CS11', bitIndex: 1, value: 1, description: 'Clock Select bit 1 (Prescaler 8 -> 2.0 MHz Timer Clock)' },
      { name: 'CS10', bitIndex: 0, value: 0, description: 'Clock Select bit 0' },
    ];
    const tccr1bVal = 0x1a | (isNoiseCanceler ? 0x80 : 0x00);

    // 3. OCR1A (0x88/0x89, 16-bit PWM Compare Register)
    let ocr1aVal = Math.round(3000 + Math.sin(count * 0.35) * 550);
    if (activeFaults.inductiveSpike) ocr1aVal = Math.min(4800, ocr1aVal + 800);
    if (activeFaults.opticalOcclusion) ocr1aVal = 4000;
    const ocr1aBits: AtmegaBitDef[] = [
      // High Byte: OCR1AH (0x89)
      { name: 'D15', bitIndex: 15, value: (ocr1aVal >> 15) & 1, description: 'OCR1AH Bit 15 (High Byte)' },
      { name: 'D14', bitIndex: 14, value: (ocr1aVal >> 14) & 1, description: 'OCR1AH Bit 14 (High Byte)' },
      { name: 'D13', bitIndex: 13, value: (ocr1aVal >> 13) & 1, description: 'OCR1AH Bit 13 (High Byte)' },
      { name: 'D12', bitIndex: 12, value: (ocr1aVal >> 12) & 1, description: 'OCR1AH Bit 12 (High Byte)' },
      { name: 'D11', bitIndex: 11, value: (ocr1aVal >> 11) & 1, description: 'OCR1AH Bit 11 (High Byte)' },
      { name: 'D10', bitIndex: 10, value: (ocr1aVal >> 10) & 1, description: 'OCR1AH Bit 10 (High Byte)' },
      { name: 'D9', bitIndex: 9, value: (ocr1aVal >> 9) & 1, description: 'OCR1AH Bit 9 (High Byte)' },
      { name: 'D8', bitIndex: 8, value: (ocr1aVal >> 8) & 1, description: 'OCR1AH Bit 8 (High Byte)' },
      // Low Byte: OCR1AL (0x88)
      { name: 'D7', bitIndex: 7, value: (ocr1aVal >> 7) & 1, description: 'OCR1AL Bit 7 (Low Byte)' },
      { name: 'D6', bitIndex: 6, value: (ocr1aVal >> 6) & 1, description: 'OCR1AL Bit 6 (Low Byte)' },
      { name: 'D5', bitIndex: 5, value: (ocr1aVal >> 5) & 1, description: 'OCR1AL Bit 5 (Low Byte)' },
      { name: 'D4', bitIndex: 4, value: (ocr1aVal >> 4) & 1, description: 'OCR1AL Bit 4 (Low Byte)' },
      { name: 'D3', bitIndex: 3, value: (ocr1aVal >> 3) & 1, description: 'OCR1AL Bit 3 (Low Byte)' },
      { name: 'D2', bitIndex: 2, value: (ocr1aVal >> 2) & 1, description: 'OCR1AL Bit 2 (Low Byte)' },
      { name: 'D1', bitIndex: 1, value: (ocr1aVal >> 1) & 1, description: 'OCR1AL Bit 1 (Low Byte)' },
      { name: 'D0', bitIndex: 0, value: (ocr1aVal >> 0) & 1, description: 'OCR1AL Bit 0 (Low Byte)' },
    ];

    // 4. ADMUX (0x7C)
    const muxChannel = count % 3;
    const admuxBits: AtmegaBitDef[] = [
      { name: 'REFS1', bitIndex: 7, value: 0, description: 'Reference Selection Bit 1' },
      { name: 'REFS0', bitIndex: 6, value: 1, description: 'Reference Selection Bit 0 (1 = AVCC with external C at AREF pin)' },
      { name: 'ADLAR', bitIndex: 5, value: 0, description: 'ADC Left Adjust Result (0 = 10-bit right aligned)' },
      { name: '-', bitIndex: 4, value: 0, description: 'Reserved bit' },
      { name: 'MUX3', bitIndex: 3, value: 0, description: 'Analog Channel Select 3' },
      { name: 'MUX2', bitIndex: 2, value: 0, description: 'Analog Channel Select 2' },
      { name: 'MUX1', bitIndex: 1, value: (muxChannel >> 1) & 1, description: 'Analog Channel Select 1' },
      { name: 'MUX0', bitIndex: 0, value: muxChannel & 1, description: 'Analog Channel Select 0' },
    ];
    const admuxVal = 0x40 | muxChannel;

    // 5. ADCSRA (0x7A)
    const isConverting = isTxActive;
    const isAdcComplete = !isConverting && count % 2 === 0;
    const adcsraBits: AtmegaBitDef[] = [
      { name: 'ADEN', bitIndex: 7, value: 1, description: 'ADC Enable (1 = SAR conversion circuitry energized)' },
      { name: 'ADSC', bitIndex: 6, value: isConverting ? 1 : 0, description: 'ADC Start Conversion (1 = conversion underway in hardware)' },
      { name: 'ADATE', bitIndex: 5, value: 0, description: 'ADC Auto Trigger Enable' },
      { name: 'ADIF', bitIndex: 4, value: isAdcComplete ? 1 : 0, description: 'ADC Interrupt Flag (1 = conversion result latched in ADCL/ADCH)' },
      { name: 'ADIE', bitIndex: 3, value: 1, description: 'ADC Interrupt Enable' },
      { name: 'ADPS2', bitIndex: 2, value: 1, description: 'ADC Prescaler Bit 2' },
      { name: 'ADPS1', bitIndex: 1, value: 1, description: 'ADC Prescaler Bit 1' },
      { name: 'ADPS0', bitIndex: 0, value: 1, description: 'ADC Prescaler Bit 0 (/128 division -> 125 kHz ADC clock)' },
    ];
    const adcsraVal = 0x87 | (isConverting ? 0x40 : 0) | (isAdcComplete ? 0x10 : 0);

    // 6. PORTB (0x25)
    const isPwmActive = count % 2 === 1;
    const portbBits: AtmegaBitDef[] = [
      { name: 'PB7', bitIndex: 7, value: 0, description: 'XTAL2 pin' },
      { name: 'PB6', bitIndex: 6, value: 1, description: 'XTAL1 oscillator input' },
      { name: 'PB5', bitIndex: 5, value: isHeartbeatHigh ? 1 : 0, description: 'Pin 13 Builtin LED System Heartbeat (1 Hz toggle)' },
      { name: 'PB4', bitIndex: 4, value: 0, description: 'Pin 12 (SPI MISO / Sensor input)' },
      { name: 'PB3', bitIndex: 3, value: activeFaults.acousticMultipath ? (count % 2) : 1, description: 'Pin 11 (SPI MOSI / Ultrasound Trigger)' },
      { name: 'PB2', bitIndex: 2, value: 1, description: 'Pin 10 (SPI SS / Servo PWM enable)' },
      { name: 'PB1', bitIndex: 1, value: isPwmActive ? 1 : 0, description: 'Pin 9 (Timer1 OC1A Hardware PWM channel)' },
      { name: 'PB0', bitIndex: 0, value: 0, description: 'Pin 8 General GPIO' },
    ];
    const portbVal =
      0x40 |
      (isHeartbeatHigh ? 0x20 : 0) |
      (portbBits[4].value ? 0x08 : 0) |
      0x04 |
      (isPwmActive ? 0x02 : 0);

    // 7. PORTD (0x2B)
    const portdBits: AtmegaBitDef[] = [
      { name: 'PD7', bitIndex: 7, value: 0, description: 'Pin 7 General GPIO' },
      { name: 'PD6', bitIndex: 6, value: isPwmActive ? 1 : 0, description: 'Pin 6 (Timer0 OC0A PWM output)' },
      { name: 'PD5', bitIndex: 5, value: 0, description: 'Pin 5 (Timer0 OC0B PWM output)' },
      { name: 'PD4', bitIndex: 4, value: 1, description: 'Pin 4 Direction Output' },
      { name: 'PD3', bitIndex: 3, value: 0, description: 'Pin 3 (INT1 External Interrupt)' },
      { name: 'PD2', bitIndex: 2, value: activeFaults.opticalOcclusion ? 0 : 1, description: 'Pin 2 (INT0 External Interrupt / Optical Encoder)' },
      { name: 'PD1', bitIndex: 1, value: isTxActive ? 1 : 0, description: 'Pin 1 (USART TX - pulses during UART transmission)' },
      { name: 'PD0', bitIndex: 0, value: isRxActive ? 1 : 0, description: 'Pin 0 (USART RX - pulses during command input)' },
    ];
    const portdVal =
      (isPwmActive ? 0x40 : 0) |
      0x10 |
      (portdBits[2].value ? 0x04 : 0) |
      (isTxActive ? 0x02 : 0) |
      (isRxActive ? 0x01 : 0);

    // 8. PINB (0x23)
    const emiNoise = activeFaults.groundBounce && count % 3 === 0;
    const pinbBits: AtmegaBitDef[] = [
      { name: 'PINB7', bitIndex: 7, value: 0, description: 'Input pin level 7' },
      { name: 'PINB6', bitIndex: 6, value: 1, description: 'Input pin level 6' },
      { name: 'PINB5', bitIndex: 5, value: isHeartbeatHigh ? 1 : 0, description: 'Pin 13 state' },
      { name: 'PINB4', bitIndex: 4, value: emiNoise ? 1 : 0, description: 'Pin 12 input (flips with ground bounce hum)' },
      { name: 'PINB3', bitIndex: 3, value: activeFaults.inductiveSpike ? (count % 2) : 1, description: 'Pin 11 echo input' },
      { name: 'PINB2', bitIndex: 2, value: 1, description: 'Pin 10 input' },
      { name: 'PINB1', bitIndex: 1, value: emiNoise ? 1 : 0, description: 'Pin 9 input (EMI noise injected)' },
      { name: 'PINB0', bitIndex: 0, value: 0, description: 'Pin 8 input' },
    ];
    const pinbVal =
      0x40 |
      (isHeartbeatHigh ? 0x20 : 0) |
      (emiNoise ? 0x10 : 0) |
      (pinbBits[4].value ? 0x08 : 0) |
      0x04 |
      (emiNoise ? 0x02 : 0);

    // 9. SREG (0x5F)
    const isNeg = Math.sin(count * 0.35) < -0.2;
    const isZero = Math.abs(Math.sin(count * 0.35)) < 0.1;
    const isOverflow = !!activeFaults.inductiveSpike || (!!activeFaults.opticalOcclusion && count % 4 === 0);
    const sregBits: AtmegaBitDef[] = [
      { name: 'I', bitIndex: 7, value: 1, description: 'Global Interrupt Enable (1 = SEI enabled)' },
      { name: 'T', bitIndex: 6, value: 0, description: 'Bit Copy Storage (BLD/BST)' },
      { name: 'H', bitIndex: 5, value: 0, description: 'Half Carry Flag' },
      { name: 'S', bitIndex: 4, value: (isNeg ? 1 : 0) ^ (isOverflow ? 1 : 0), description: 'Sign Bit (N XOR V)' },
      { name: 'V', bitIndex: 3, value: isOverflow ? 1 : 0, description: "Two's Complement Overflow (1 during inductive surge / PID saturation)" },
      { name: 'N', bitIndex: 2, value: isNeg ? 1 : 0, description: 'Negative Flag (1 if arithmetic result is negative)' },
      { name: 'Z', bitIndex: 1, value: isZero ? 1 : 0, description: 'Zero Flag (1 if calculation result is exactly zero)' },
      { name: 'C', bitIndex: 0, value: activeFaults.groundBounce ? (count % 2) : 0, description: 'Carry Flag (1 on arithmetic carry/borrow or false ripple)' },
    ];
    const sregVal =
      0x80 |
      (sregBits[4].value ? 0x10 : 0) |
      (isOverflow ? 0x08 : 0) |
      (isNeg ? 0x04 : 0) |
      (isZero ? 0x02 : 0) |
      (sregBits[7].value ? 0x01 : 0);

    const list: AtmegaRegisterDef[] = [
      {
        name: 'TCCR1A',
        category: 'timer',
        address: '0x80',
        decimalValue: tccr1aVal,
        hexValue: `0x${tccr1aVal.toString(16).toUpperCase().padStart(2, '0')}`,
        description: 'Timer/Counter1 Control Register A',
        siliconPurpose: 'Configures compare output mode (COM1A/B) and lowest 2 bits of waveform generator for 16-bit Timer 1.',
        bits: tccr1aBits,
      },
      {
        name: 'TCCR1B',
        category: 'timer',
        address: '0x81',
        decimalValue: tccr1bVal,
        hexValue: `0x${tccr1bVal.toString(16).toUpperCase().padStart(2, '0')}`,
        description: 'Timer/Counter1 Control Register B',
        siliconPurpose: 'Controls Input Capture Noise Canceler, Edge Select, upper waveform bits, and prescaler clock division (16MHz / 8).',
        bits: tccr1bBits,
      },
      {
        name: 'OCR1A',
        category: 'timer',
        address: '0x88/0x89',
        decimalValue: ocr1aVal,
        hexValue: `0x${ocr1aVal.toString(16).toUpperCase().padStart(4, '0')}`,
        description: 'Output Compare Register 1A (16-bit PWM Duty: OCR1AH:OCR1AL)',
        siliconPurpose: `16-bit comparator matched against TCNT1 continuously. High byte (0x89) buffered via TEMP latch; low byte (0x88) latches full word.`,
        bits: ocr1aBits,
      },
      {
        name: 'ADMUX',
        category: 'adc',
        address: '0x7C',
        decimalValue: admuxVal,
        hexValue: `0x${admuxVal.toString(16).toUpperCase().padStart(2, '0')}`,
        description: 'ADC Multiplexer Selection Register',
        siliconPurpose: `Connects analog multiplexer input bus to pin A${muxChannel}. Configures AVCC (5.0V) as voltage reference standard.`,
        bits: admuxBits,
      },
      {
        name: 'ADCSRA',
        category: 'adc',
        address: '0x7A',
        decimalValue: adcsraVal,
        hexValue: `0x${adcsraVal.toString(16).toUpperCase().padStart(2, '0')}`,
        description: 'ADC Control and Status Register A',
        siliconPurpose: 'Controls ADC peripheral power, triggers successive-approximation conversions (ADSC), sets interrupt flag (ADIF) on completion.',
        bits: adcsraBits,
      },
      {
        name: 'PORTB',
        category: 'gpio',
        address: '0x25',
        decimalValue: portbVal,
        hexValue: `0x${portbVal.toString(16).toUpperCase().padStart(2, '0')}`,
        description: 'Port B Data Output Register (Pins 8–13)',
        siliconPurpose: 'Drives output voltage latches for digital pins 8 to 13, including Pin 13 LED (PB5) and Timer1 PWM (PB1).',
        bits: portbBits,
      },
      {
        name: 'PORTD',
        category: 'gpio',
        address: '0x2B',
        decimalValue: portdVal,
        hexValue: `0x${portdVal.toString(16).toUpperCase().padStart(2, '0')}`,
        description: 'Port D Data Output Register (Pins 0–7 & UART)',
        siliconPurpose: 'Drives digital pins 0 to 7. PD1 and PD0 connect directly to hardware UART transmitter and receiver shift registers.',
        bits: portdBits,
      },
      {
        name: 'PINB',
        category: 'gpio',
        address: '0x23',
        decimalValue: pinbVal,
        hexValue: `0x${pinbVal.toString(16).toUpperCase().padStart(2, '0')}`,
        description: 'Port B Input Pins Address Register',
        siliconPurpose: 'Synchronizer latches reading physical voltage levels present on Port B pins. Directly reflects external sensor transitions & EMI bounce.',
        bits: pinbBits,
      },
      {
        name: 'SREG',
        category: 'status',
        address: '0x5F',
        decimalValue: sregVal,
        hexValue: `0x${sregVal.toString(16).toUpperCase().padStart(2, '0')}`,
        description: 'AVR CPU Status Register',
        siliconPurpose: "Maintains ALU condition flags: Global Interrupts (I), Two's complement Overflow (V), Negative (N), Zero (Z), and Carry (C).",
        bits: sregBits,
      },
    ];

    // Detect bit transitions and record timestamps
    list.forEach((reg) => {
      const prev = prevRegsRef.current[reg.name] ?? reg.decimalValue;
      if (prev !== reg.decimalValue) {
        reg.bits.forEach((b) => {
          if (((prev ^ reg.decimalValue) & (1 << b.bitIndex)) !== 0) {
            bitFlipTimesRef.current[`${reg.name}_${b.bitIndex}`] = Date.now();
          }
        });
        prevRegsRef.current[reg.name] = reg.decimalValue;
      }
    });

    return list;
  }, [tickCount, activeFaults, experiment.id]);

  const filteredRegisters = useMemo(() => {
    if (regCategoryFilter === 'all') return registers;
    return registers.filter((r) => r.category === regCategoryFilter);
  }, [registers, regCategoryFilter]);

  const handleDumpRegisters = () => {
    soundFX.playTap();
    const elapsed = Date.now() - startTimeRef.current;
    const mins = Math.floor(elapsed / 60000).toString().padStart(2, '0');
    const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
    const ms = (elapsed % 1000).toString().padStart(3, '0');
    const timeStr = `${mins}:${secs}.${ms}`;

    const dumpLine = registers
      .map((r) => `${r.name}=${r.hexValue}`)
      .join(' | ');

    setLogs((prev) => [
      ...prev,
      {
        id: `regdump-${Date.now()}`,
        timestamp: timeStr,
        type: 'reply',
        content: `[ATmega328P SFR DUMP] ${dumpLine}`,
      },
    ]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* SECTION 1: HARDWARE FAULT INJECTION SUITE */}
      <div className="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200/60 dark:border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                Chaos Engineering & Physical Reliability
              </span>
              {activeFaultCount > 0 && (
                <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md animate-pulse">
                  {activeFaultCount} FAULT{activeFaultCount > 1 ? 'S' : ''} ACTIVE
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-ink-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Hardware Fault Injection Matrix</span>
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Inject authentic physical anomalies into ADC lines, optical paths, motor rails, and thermal bridges to stress-test firmware robustness.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onResetFaults();
                soundFX.playTap();
              }}
              className="px-3 py-1.5 rounded-xl bg-ink-100 hover:bg-ink-200 dark:bg-white/5 dark:hover:bg-white/10 text-ink-700 dark:text-ink-300 text-xs font-bold transition-colors cursor-pointer border border-ink-200 dark:border-white/10"
            >
              Reset All (Nominal)
            </button>
            <button
              onClick={() => {
                onSetAllFaults(true);
                soundFX.playSuccess();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer border border-rose-500/30"
            >
              Stress Test (All 5)
            </button>
          </div>
        </div>

        {/* 5-Card Fault Injection Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {FAULT_DEFINITIONS.map((f) => {
            const isEngaged = !!activeFaults[f.key];
            const isApplicableToCurrent = f.affectedExperiments.includes(experiment.id);
            const Icon = f.icon;

            return (
              <div
                key={f.key}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isEngaged
                    ? 'bg-rose-500/10 dark:bg-rose-950/25 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-ink-50 dark:bg-ink-950 border-ink-200/60 dark:border-white/5 hover:border-brand-500/30'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md text-ink-600 dark:text-ink-300 bg-white/40 dark:bg-white/5 border border-ink-200 dark:border-white/10">
                      {f.tag}
                    </span>
                    <button
                      onClick={() => {
                        onToggleFault(f.key);
                        soundFX.playTap();
                      }}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        isEngaged ? 'bg-rose-500' : 'bg-ink-300 dark:bg-ink-700'
                      }`}
                      aria-label={`Toggle ${f.name}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isEngaged ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isEngaged ? 'bg-rose-500/20 text-rose-500' : 'bg-white dark:bg-white/5 text-ink-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink-900 dark:text-white leading-tight">
                        {f.name}
                      </h4>
                      <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5 leading-snug">
                        {f.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-ink-200/50 dark:border-white/5 space-y-1">
                  <div className="text-[10px] text-ink-600 dark:text-ink-300">
                    <strong className="text-ink-900 dark:text-white">Effect: </strong>
                    {f.physicalImpact}
                  </div>
                  {isApplicableToCurrent ? (
                    <span className="inline-block text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ● Active in {experiment.title}
                    </span>
                  ) : (
                    <span className="inline-block text-[9px] font-mono text-ink-400 dark:text-ink-500">
                      ○ Secondary impact on current experiment
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: SYNCHRONIZED VISUAL SIMULATION & OSCILLOSCOPE FEED */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              Live Hardware Oscilloscope & Transduction Feed
            </span>
          </div>
          <button
            onClick={() => setShowSimCanvas(!showSimCanvas)}
            className="flex items-center gap-1 text-xs font-mono font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
          >
            <span>{showSimCanvas ? 'Collapse Simulator' : 'Expand Simulator'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSimCanvas ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showSimCanvas && (
          <div className="animate-fade-in">
            <RoboticsHardwareSimCanvas experiment={experiment} activeFaults={activeFaults} />
          </div>
        )}
      </div>

      {/* SECTION 3: ATmega328P INTERACTIVE SERIAL CONSOLE PANEL */}
      <div className="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 shadow-sm space-y-4">
        {/* Console Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-200/60 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-ink-900 dark:text-white">
                  COM3: USB Serial (ATmega328P UART)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] font-mono text-ink-500 dark:text-ink-400">
                16.0 MHz Clock · 8 Data Bits · No Parity · 1 Stop Bit (8-N-1)
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Baud Rate Selector */}
            <div className="flex items-center bg-ink-100 dark:bg-ink-950 border border-ink-200 dark:border-white/10 rounded-xl p-0.5 text-xs font-mono">
              {[9600, 115200].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setBaudRate(b as any);
                    soundFX.playTap();
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    baudRate === b
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                  }`}
                >
                  {b} Baud
                </button>
              ))}
            </div>

            {/* Stream Pause/Resume Toggle */}
            <button
              onClick={() => {
                setIsStreaming(!isStreaming);
                soundFX.playTap();
              }}
              title={isStreaming ? 'Pause UART stream' : 'Resume UART stream'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                isStreaming
                  ? 'bg-ink-100 dark:bg-ink-950 border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-800'
                  : 'bg-amber-500 text-black border-amber-600'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Autoscroll Toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                autoScroll
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
                  : 'bg-ink-100 dark:bg-ink-950 border-ink-200 dark:border-white/10 text-ink-500'
              }`}
            >
              Autoscroll: {autoScroll ? 'ON' : 'OFF'}
            </button>

            {/* Clear Console */}
            <button
              onClick={() => {
                setLogs([]);
                soundFX.playTap();
              }}
              title="Clear Console Output"
              className="p-1.5 rounded-xl bg-ink-100 hover:bg-ink-200 dark:bg-ink-950 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-white/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Copy Log */}
            <button
              onClick={handleCopyLogs}
              title="Copy All Serial Output"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-ink-100 hover:bg-ink-200 dark:bg-ink-950 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-300 border border-ink-200 dark:border-white/10 text-xs font-bold transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy Log'}</span>
            </button>
          </div>
        </div>

        {/* Console Log Terminal Window */}
        <div
          ref={logContainerRef}
          className="w-full h-80 sm:h-96 rounded-2xl bg-[#070a13] border border-ink-800 p-4 font-mono text-xs overflow-y-auto space-y-1 shadow-inner select-text"
        >
          {logs.map((log) => {
            let textColor = 'text-emerald-400';
            if (log.type === 'cmd') textColor = 'text-cyan-400 font-bold';
            else if (log.type === 'reply') textColor = 'text-sky-300';
            else if (log.type === 'cal') textColor = 'text-amber-300 font-semibold';
            else if (log.type === 'warn') textColor = 'text-amber-400';
            else if (log.type === 'fault') textColor = 'text-rose-400 font-semibold';
            else if (log.type === 'system') textColor = 'text-ink-400';

            return (
              <div key={log.id} className="leading-relaxed flex items-start gap-2.5 break-all">
                <span className="text-ink-600 select-none text-[10px] shrink-0 pt-0.5">
                  [{log.timestamp}]
                </span>
                <span className={`${textColor} flex-1`}>{log.content}</span>
              </div>
            );
          })}
        </div>

        {/* Command Preset Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-500">
            <span>Quick Presets:</span>
            <span>History: ArrowUp / ArrowDown</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setInputCommand(cmd);
                  handleSendCommand(cmd);
                }}
                className="px-2.5 py-1 rounded-lg bg-ink-100 hover:bg-ink-200 dark:bg-ink-950 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-300 font-mono text-xs font-semibold border border-ink-200 dark:border-white/10 transition-colors cursor-pointer"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Command Input Bar */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-brand-500 font-bold text-xs select-none">
              &gt;&gt;
            </span>
            <input
              type="text"
              value={inputCommand}
              onChange={(e) => setInputCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter UART command (e.g. HELP, STATUS, TARE, CALIBRATE, SET_KP 1.8)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/10 text-ink-900 dark:text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-ink-400"
            />
          </div>

          <button
            onClick={() => handleSendCommand()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <span>Send</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SECTION 4: ATmega328P SILICON REGISTER & TIMER MATRIX */}
      <div className="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200/60 dark:border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20">
                16.0 MHz AVR HARVARD ARCHITECTURE
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CLOCKS RUNNING</span>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-ink-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-500" />
              <span>ATmega328P Silicon Register & Timer Matrix</span>
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Live hardware I/O special function registers (SFRs) controlling Timer 1 PWM, 10-bit Successive Approximation ADC, Port B/D GPIO latches, and the SREG ALU condition flags. Bit transitions reflect live physics and injected faults.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDumpRegisters}
              title="Dump All Registers to Serial Monitor"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-100 hover:bg-ink-200 dark:bg-ink-950 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-300 border border-ink-200 dark:border-white/10 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-brand-500" />
              <span>Dump to UART</span>
            </button>
            <button
              onClick={() => setShowRegisters(!showRegisters)}
              className="flex items-center gap-1 text-xs font-mono font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
            >
              <span>{showRegisters ? 'Collapse Registers' : 'Expand Registers'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRegisters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showRegisters && (
          <div className="space-y-4 animate-fade-in">
            {/* Category Filter Pills & Bit Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                {[
                  { id: 'all', label: 'All SFRs (9)' },
                  { id: 'timer', label: 'Timers (TCCR1A, TCCR1B, OCR1A)' },
                  { id: 'adc', label: 'ADC (ADMUX, ADCSRA)' },
                  { id: 'gpio', label: 'GPIO (PORTB, PORTD, PINB)' },
                  { id: 'status', label: 'ALU Status (SREG)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setRegCategoryFilter(cat.id as any);
                      soundFX.playTap();
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all border cursor-pointer ${
                      regCategoryFilter === cat.id
                        ? 'bg-brand-500 text-white border-brand-400 shadow-xs'
                        : 'bg-ink-100 dark:bg-ink-950 text-ink-600 dark:text-ink-400 border-ink-200 dark:border-white/10 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-mono text-ink-500 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500 text-[8px] flex items-center justify-center font-bold text-emerald-400">1</span>
                  <span>Set (High)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-ink-200 dark:bg-ink-950 border border-ink-400 text-[8px] flex items-center justify-center font-bold text-ink-400">0</span>
                  <span>Clear (Low)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm ring-1 ring-cyan-400 bg-cyan-500/40 text-[8px] flex items-center justify-center font-bold text-cyan-200 animate-pulse">●</span>
                  <span>Bit Flip</span>
                </span>
              </div>
            </div>

            {/* Register Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredRegisters.map((reg) => (
                <div
                  key={reg.name}
                  className="rounded-2xl border border-ink-200 dark:border-white/10 bg-white/70 dark:bg-ink-950/70 p-4 space-y-3 shadow-xs transition-all hover:border-brand-500/40"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-ink-200/50 dark:border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-ink-900 dark:text-white">
                        {reg.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-ink-100 dark:bg-ink-900 text-ink-500 border border-ink-200 dark:border-white/10">
                        {reg.address}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20">
                        {reg.hexValue}
                      </span>
                      <span className="text-[10px] text-ink-400">
                        ({reg.decimalValue})
                      </span>
                    </div>
                  </div>

                  {/* Register Silicon Function Description */}
                  <p className="text-[11px] text-ink-600 dark:text-ink-400 leading-snug line-clamp-2">
                    {reg.siliconPurpose}
                  </p>

                  {/* 8-Bit Interactive Graphic Matrix */}
                  <div className="space-y-1 pt-1 overflow-x-auto no-scrollbar">
                    <div className="grid grid-cols-8 gap-1 min-w-[220px]">
                      {reg.bits.map((b) => {
                        const isFlipped = (Date.now() - (bitFlipTimesRef.current[`${reg.name}_${b.bitIndex}`] || 0)) < 600;
                        return (
                          <div
                            key={b.bitIndex}
                            onClick={() => {
                              soundFX.playTap();
                              const now = new Date();
                              const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
                              setLogs((prev) => [
                                ...prev,
                                {
                                  id: `sfr_${Date.now()}_${b.bitIndex}`,
                                  timestamp: timeStr,
                                  type: 'telemetry',
                                  content: `[SFR PROBE] ${reg.name}[${b.bitIndex}] (${b.name}) = ${b.value} | ${b.description}`,
                                },
                              ]);
                            }}
                            title={`Bit ${b.bitIndex} (${b.name}): ${b.value === 1 ? 'HIGH (1)' : 'LOW (0)'}\n${b.description}\n(Click to probe in UART)`}
                            className={`flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all cursor-pointer min-w-0 select-none ${
                              isFlipped
                                ? 'ring-2 ring-cyan-400 bg-cyan-500/40 text-cyan-200 scale-105 shadow-md animate-pulse'
                                : b.value === 1
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/25'
                                : 'bg-ink-50 dark:bg-ink-900/60 border-ink-200 dark:border-white/10 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
                            }`}
                          >
                            <span className="text-[7.5px] font-mono opacity-60 uppercase truncate max-w-full">
                              {b.name}
                            </span>
                            <span className="text-xs font-mono font-black pt-0.5">
                              {b.value}
                            </span>
                            <span className="text-[6.5px] font-mono text-ink-400 opacity-50">
                              b{b.bitIndex}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
