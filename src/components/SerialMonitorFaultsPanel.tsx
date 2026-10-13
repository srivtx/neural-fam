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

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const logCounterRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

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
    </div>
  );
};
