/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Robotics Hardware Simulation Canvas:
 * Real-time, 60 FPS interactive physics and circuit simulator for the 8 canonical
 * robotics hardware experiments. Renders sensor transduction, mechanical actuation,
 * and a scrolling live digital oscilloscope displaying pin voltages.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Activity,
  Sliders,
  Sparkles,
  Move,
  Maximize2,
  Minimize2,
  AlertTriangle,
} from 'lucide-react';
import { RoboticsExperiment } from '../data/roboticsExperimentsData';
import { soundFX } from '../utils/audio';

export interface HardwareFaults {
  groundBounce?: boolean;
  opticalOcclusion?: boolean;
  acousticMultipath?: boolean;
  inductiveSpike?: boolean;
  thermalDrift?: boolean;
}

export interface RoboticsHardwareSimCanvasProps {
  experiment: RoboticsExperiment;
  activeFaults?: HardwareFaults;
}

const getDefaultSimState = (id: string) => {
  if (id === 'exp_pir_servo_buzzer') {
    return {
      humanX: 120,
      humanY: 140,
      humanSpeed: 1.5,
      gateAngle: 0,
      targetGateAngle: 0,
      isTriggered: false,
      triggerTimer: 0,
      buzzerAlpha: 0,
    };
  } else if (id === 'exp_ultrasonic_radar') {
    return {
      radarAngle: 15,
      sweepDir: 1,
      obstacleX: 280,
      obstacleY: 110,
      echoDistance: 25.0,
      blips: [] as Array<{ angle: number; dist: number; alpha: number }>,
    };
  } else if (id === 'exp_ir_line_follower') {
    return {
      robotX: 0,
      robotY: 0,
      robotAngle: Math.PI / 2,
      leftIR: 0.6,
      rightIR: 0.6,
      leftPWM: 160,
      rightPWM: 160,
      trackProgress: 0,
      isDraggingRobot: false,
    };
  } else if (id === 'exp_mpu6050_balancing') {
    return {
      cartX: 250,
      cartVel: 0,
      poleAngle: 0.05,
      poleAngularVel: 0,
      integral: 0,
    };
  } else if (id === 'exp_ldr_solar_tracker') {
    return {
      sunX: 320,
      sunY: 65,
      panelAngle: 90,
      leftV: 2.5,
      rightV: 2.5,
      leftLux: 500,
      rightLux: 500,
    };
  } else if (id === 'exp_encoder_motor_pid') {
    return {
      wheelAngle: 0,
      actualRPM: 120,
      targetRPM: 120,
      channelAState: 0,
      channelBState: 0,
      tickCounter: 0,
      brakeLoad: 0.25,
      motorPWM: 135,
      integral: 0,
      isDraggingBrake: false,
    };
  } else if (id === 'exp_hall_effect_tachometer') {
    return {
      spindleAngle: 0,
      spindleRPM: 2400,
      targetRPM: 2400,
      pulseActive: false,
      hallOutV: 5.0,
      isDraggingThrottle: false,
    };
  } else if (id === 'exp_loadcell_smart_gripper') {
    return {
      gripperJawPos: 43.0,
      measuredForceGrams: 0,
      targetForceGrams: 150,
      autoGrasp: true,
      holdingObject: true,
      isEggCracked: false,
      rawCounts: 120000,
      isDraggingForce: false,
    };
  }
  return {};
};

export const RoboticsHardwareSimCanvas: React.FC<RoboticsHardwareSimCanvasProps> = ({
  experiment,
  activeFaults = {},
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundFX.getMuted());
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 200, y: 150 });
  const [oscilloscopeSpeed, setOscilloscopeSpeed] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simStateRef = useRef<any>(getDefaultSimState(experiment.id));
  const lastSoundTimeRef = useRef<number>(0);
  const oscHistoryRef = useRef<Array<number[]>>([]);
  const tRef = useRef<number>(0);

  const activeFaultsRef = useRef<HardwareFaults>(activeFaults);
  useEffect(() => {
    activeFaultsRef.current = activeFaults;
  }, [activeFaults]);

  const isRunningRef = useRef<boolean>(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const speedRef = useRef<number>(oscilloscopeSpeed);
  useEffect(() => {
    speedRef.current = oscilloscopeSpeed;
  }, [oscilloscopeSpeed]);

  const isDraggingRef = useRef<boolean>(isDragging);
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Reset experiment simulation state
  const resetSimulation = useCallback(() => {
    simStateRef.current = getDefaultSimState(experiment.id);
    oscHistoryRef.current = [];
    tRef.current = 0;
    if (experiment.id === 'exp_pir_servo_buzzer') {
      setDragPos({ x: 120, y: 140 });
    } else if (experiment.id === 'exp_ultrasonic_radar') {
      setDragPos({ x: 280, y: 110 });
    } else if (experiment.id === 'exp_ldr_solar_tracker') {
      setDragPos({ x: 320, y: 65 });
    }
  }, [experiment.id]);

  useEffect(() => {
    resetSimulation();
  }, [experiment.id, resetSimulation]);

  // Mouse & Touch Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 320;
    const x = Math.max(10, Math.min(width - 10, e.clientX - rect.left));
    const y = Math.max(10, Math.min(height - 10, e.clientY - rect.top));
    setIsDragging(true);
    setDragPos({ x, y });
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const state = simStateRef.current;
    if (!state) return;

    if (experiment.id === 'exp_pir_servo_buzzer') {
      state.humanX = x;
      state.humanY = y;
    } else if (experiment.id === 'exp_ultrasonic_radar') {
      state.obstacleX = x;
      state.obstacleY = y;
    } else if (experiment.id === 'exp_ir_line_follower') {
      state.robotX = x;
      state.robotY = y;
      state.isDraggingRobot = true;
    } else if (experiment.id === 'exp_mpu6050_balancing') {
      const cartX = state.cartX || width * 0.5;
      const angle = (x - cartX) * 0.004;
      state.poleAngle = Math.max(-0.6, Math.min(0.6, angle));
      state.poleAngularVel = 0;
    } else if (experiment.id === 'exp_ldr_solar_tracker') {
      state.sunX = x;
      state.sunY = y;
    } else if (experiment.id === 'exp_encoder_motor_pid') {
      const sliderStartX = width * 0.12;
      const sliderW = width * 0.76;
      if (y > height - 120 || x > width * 0.5) {
        state.isDraggingBrake = true;
        state.brakeLoad = Math.max(0, Math.min(1, (x - sliderStartX) / sliderW));
      }
    } else if (experiment.id === 'exp_hall_effect_tachometer') {
      const sliderStartX = width * 0.12;
      const sliderW = width * 0.76;
      if (y > height - 120) {
        state.isDraggingThrottle = true;
        const norm = Math.max(0, Math.min(1, (x - sliderStartX) / sliderW));
        state.targetRPM = Math.round(600 + norm * 4800);
      }
    } else if (experiment.id === 'exp_loadcell_smart_gripper') {
      // Button 1: Auto-Grasp Toggle (x: 14 to 124, y: 12 to 38)
      if (x >= 14 && x <= 124 && y >= 12 && y <= 38) {
        state.autoGrasp = !state.autoGrasp;
        soundFX.playTap();
      }
      // Button 2: Replace Cracked Egg / Tare (x: 130 to 240, y: 12 to 38)
      else if (x >= 130 && x <= 240 && y >= 12 && y <= 38) {
        state.isEggCracked = false;
        state.gripperJawPos = 43.0;
        state.measuredForceGrams = 0;
        soundFX.playSuccess();
      }
      // Slider: Target Grip Force (bottom bar)
      else if (y > height - 120) {
        state.isDraggingForce = true;
        const sliderStartX = width * 0.12;
        const sliderW = width * 0.76;
        const norm = Math.max(0, Math.min(1, (x - sliderStartX) / sliderW));
        state.targetForceGrams = Math.round(50 + norm * 300);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 320;
    const x = Math.max(15, Math.min(width - 15, e.clientX - rect.left));
    const y = Math.max(15, Math.min(height - 15, e.clientY - rect.top));
    setDragPos({ x, y });

    const state = simStateRef.current;
    if (!state) return;

    if (experiment.id === 'exp_pir_servo_buzzer') {
      state.humanX = Math.max(30, Math.min(width * 0.82, x));
      state.humanY = Math.max(30, Math.min(height - 85, y));
    } else if (experiment.id === 'exp_ultrasonic_radar') {
      state.obstacleX = Math.max(30, Math.min(width - 30, x));
      state.obstacleY = Math.max(30, Math.min(height - 100, y));
    } else if (experiment.id === 'exp_ir_line_follower') {
      if (state.isDraggingRobot) {
        state.robotX = x;
        state.robotY = y;
      }
    } else if (experiment.id === 'exp_mpu6050_balancing') {
      const cartX = state.cartX || width * 0.5;
      const angle = (x - cartX) * 0.004;
      state.poleAngle = Math.max(-0.6, Math.min(0.6, angle));
      state.poleAngularVel = 0;
    } else if (experiment.id === 'exp_ldr_solar_tracker') {
      state.sunX = Math.max(30, Math.min(width - 30, x));
      state.sunY = Math.max(30, Math.min(height - 120, y));
    } else if (experiment.id === 'exp_encoder_motor_pid') {
      if (state.isDraggingBrake) {
        const sliderStartX = width * 0.12;
        const sliderW = width * 0.76;
        state.brakeLoad = Math.max(0, Math.min(1, (x - sliderStartX) / sliderW));
      }
    } else if (experiment.id === 'exp_hall_effect_tachometer') {
      if (state.isDraggingThrottle) {
        const sliderStartX = width * 0.12;
        const sliderW = width * 0.76;
        const norm = Math.max(0, Math.min(1, (x - sliderStartX) / sliderW));
        state.targetRPM = Math.round(600 + norm * 4800);
      }
    } else if (experiment.id === 'exp_loadcell_smart_gripper') {
      if (state.isDraggingForce) {
        const sliderStartX = width * 0.12;
        const sliderW = width * 0.76;
        const norm = Math.max(0, Math.min(1, (x - sliderStartX) / sliderW));
        state.targetForceGrams = Math.round(50 + norm * 300);
      }
    }
  };

  const handlePointerUp = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    if (e) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    const state = simStateRef.current;
    if (state) {
      state.isDraggingRobot = false;
      state.isDraggingBrake = false;
      state.isDraggingThrottle = false;
      state.isDraggingForce = false;
    }
  };

  // Main 60 FPS Canvas Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;
    const MAX_OSC_SAMPLES = 180;

    const render = () => {
      const running = isRunningRef.current;
      const speed = speedRef.current;
      if (running) {
        tRef.current += 0.03 * (speed === 4 ? 1.4 : speed === 2 ? 1.2 : 1.0);
      }
      const t = tRef.current;
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 320;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Substrate dark lab background
      ctx.fillStyle = '#070a13';
      ctx.fillRect(0, 0, width, height);

      // Subtle engineering grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridGap = 25;
      for (let x = 0; x < width; x += gridGap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height - 70);
        ctx.stroke();
      }
      for (let y = 0; y < height - 70; y += gridGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // State references
      const state = simStateRef.current;
      if (!state) return;
      let oscVal1 = 0;
      let oscVal2 = 0;
      let oscVal3 = 0;

      // Fault injection synthesis
      const faults = activeFaultsRef.current || {};
      const hum50Hz = faults.groundBounce ? Math.sin(t * 50) * 0.45 : 0;
      const spikePhase = (t * 2.2) % 2.5;
      let flybackSpike = 0;
      if (faults.inductiveSpike && spikePhase < 0.12) {
        flybackSpike = Math.sin(spikePhase * 180) * Math.exp(-spikePhase * 35) * 8.5;
      }

      // =======================================================================
      // EXPERIMENT 1: PIR + SERVO GATE + BUZZER
      // =======================================================================
      if (experiment.id === 'exp_pir_servo_buzzer') {
        const pirX = width * 0.75;
        const pirY = (height - 70) * 0.5;

        // Auto-patrol human if not dragging and running
        if (running && !isDraggingRef.current) {
          state.humanX += state.humanSpeed;
          if (state.humanX > width * 0.82 || state.humanX < 50) {
            state.humanSpeed *= -1;
          }
        }
        state.humanX = Math.max(30, Math.min(width * 0.82, state.humanX || 120));
        state.humanY = Math.max(30, Math.min(height - 90, state.humanY || 140));

        // Draw PIR Sensor Optical Beams (Fresnel Cone Zones)
        const numBeams = 5;
        const beamSpan = Math.PI * 0.6;
        for (let b = 0; b < numBeams; b++) {
          const angle = Math.PI - beamSpan / 2 + (b * beamSpan) / (numBeams - 1);
          const beamLen = 220;

          const dist = Math.hypot(state.humanX - pirX, state.humanY - pirY);
          let angleDiff = Math.atan2(state.humanY - pirY, state.humanX - pirX) - angle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          const inBeam = dist < beamLen && Math.abs(angleDiff) < 0.22;

          ctx.fillStyle = inBeam ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.06)';
          ctx.beginPath();
          ctx.moveTo(pirX, pirY);
          ctx.arc(pirX, pirY, beamLen, angle - 0.12, angle + 0.12);
          ctx.closePath();
          ctx.fill();
        }

        // Check if Human crosses beams (detect motion)
        const distToPIR = Math.hypot(state.humanX - pirX, state.humanY - pirY);
        const insideSensZone = distToPIR < 200 && state.humanX < pirX;

        if (insideSensZone) {
          state.isTriggered = true;
          state.triggerTimer = 90; // Hold trigger
          state.targetGateAngle = 90;
          state.buzzerAlpha = 1.0;

          // Sound effect trigger throttle
          if (performance.now() - lastSoundTimeRef.current > 600) {
            lastSoundTimeRef.current = performance.now();
            soundFX.playPiezoBuzzer(2400, 0.15);
          }
        } else {
          if (state.triggerTimer > 0) {
            if (running) state.triggerTimer--;
          } else {
            state.isTriggered = false;
            state.targetGateAngle = 0;
            state.buzzerAlpha = Math.max(0, state.buzzerAlpha - 0.05);
          }
        }

        // Smooth servo gate movement
        if (running) {
          state.gateAngle += (state.targetGateAngle - state.gateAngle) * 0.12;
        }
        state.gateAngle = Math.max(0, Math.min(90, state.gateAngle || 0));

        // Draw Human Target (Glowing Thermal Body 37°C)
        const hRad = 18;
        const heatGrad = ctx.createRadialGradient(state.humanX, state.humanY, 2, state.humanX, state.humanY, 35);
        heatGrad.addColorStop(0, '#f97316');
        heatGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
        heatGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(state.humanX, state.humanY, 35, 0, Math.PI * 2);
        ctx.fill();

        // Human Icon Body
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(state.humanX, state.humanY, hRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('37°C', state.humanX, state.humanY + 4);

        // Draw PIR Sensor Box
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(pirX, pirY - 30, 45, 60, 6);
        ctx.fill();
        ctx.stroke();

        // Fresnel Dome
        ctx.fillStyle = state.isTriggered ? '#ef4444' : '#e2e8f0';
        ctx.beginPath();
        ctx.arc(pirX, pirY, 14, Math.PI / 2, (3 * Math.PI) / 2);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HC-SR501', pirX + 22, pirY + 45);

        // Draw Servo Mechanical Gate Arm
        const gatePivotX = pirX - 10;
        const gatePivotY = pirY + 70;
        const armLen = 55;
        const armRad = (state.gateAngle * Math.PI) / 180;
        const gateEndX = gatePivotX - Math.cos(armRad) * armLen;
        const gateEndY = gatePivotY - Math.sin(armRad) * armLen;

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(gatePivotX, gatePivotY);
        ctx.lineTo(gateEndX, gateEndY);
        ctx.stroke();

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(gatePivotX, gatePivotY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.font = '10px monospace';
        ctx.fillText(`SG90 Gate: ${Math.round(state.gateAngle)}°`, gatePivotX - 25, gatePivotY + 25);

        // Draw Buzzer Sound Waves when active
        if (state.buzzerAlpha > 0.05) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${state.buzzerAlpha})`;
          ctx.lineWidth = 2;
          for (let w = 1; w <= 3; w++) {
            ctx.beginPath();
            ctx.arc(pirX + 22, pirY - 45, Math.max(1, w * 12 * ((t * 2) % 1)), 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('BEEP!', pirX + 22, pirY - 55);
        }

        // Thermal drift spurious trigger
        if (faults.thermalDrift && running && (Math.sin(t * 1.5) > 0.72) && !state.isTriggered) {
          state.isTriggered = true;
          state.triggerTimer = 50;
          state.targetGateAngle = 90;
          state.buzzerAlpha = 1.0;
        }

        // Oscilloscope channel values
        oscVal1 = (state.isTriggered ? 5.0 : 0.0) + hum50Hz; // PIR digital out (5V)
        oscVal2 = 1.0 + (state.gateAngle / 90.0) + (faults.inductiveSpike ? flybackSpike * 0.2 : 0); // Servo PWM pulse width (1.0ms to 2.0ms)
        oscVal3 = (state.buzzerAlpha > 0.1 ? (Math.sin(t * 30) > 0 ? 5.0 : 0.0) : 0.0) + (faults.inductiveSpike ? flybackSpike * 0.4 : 0);
      }

      // =======================================================================
      // EXPERIMENT 2: ULTRASONIC HC-SR04 RADAR
      // =======================================================================
      else if (experiment.id === 'exp_ultrasonic_radar') {
        const radarCenterX = width * 0.5;
        const radarCenterY = height - 90;
        const maxRadarRadius = Math.max(10, Math.min(width * 0.42, height * 0.7));

        // Sweep Servo Angle back and forth (10° to 170°)
        if (running) {
          state.radarAngle += state.sweepDir * 1.5;
          if (state.radarAngle >= 170) state.sweepDir = -1;
          if (state.radarAngle <= 10) state.sweepDir = 1;
        }
        state.radarAngle = Math.max(10, Math.min(170, state.radarAngle || 15));

        const sweepRad = (state.radarAngle * Math.PI) / 180;

        // Draw Polar Radar Grid
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 1;
        for (let r = 1; r <= 4; r++) {
          const ringRad = (maxRadarRadius * r) / 4;
          ctx.beginPath();
          ctx.arc(radarCenterX, radarCenterY, ringRad, Math.PI, 0);
          ctx.stroke();
          ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
          ctx.font = '8px monospace';
          ctx.fillText(`${r * 25}cm`, radarCenterX + 4, radarCenterY - ringRad + 10);
        }

        // Radar Ray Radial Lines (30°, 60°, 90°, 120°, 150°)
        for (let a = 30; a <= 150; a += 30) {
          const aRad = (a * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(radarCenterX, radarCenterY);
          ctx.lineTo(
            radarCenterX - Math.cos(aRad) * maxRadarRadius,
            radarCenterY - Math.sin(aRad) * maxRadarRadius
          );
          ctx.stroke();
        }

        // Sweep Beam (Glowing Green Scanner Wedge)
        const sweepGrad = ctx.createRadialGradient(
          radarCenterX,
          radarCenterY,
          5,
          radarCenterX,
          radarCenterY,
          maxRadarRadius
        );
        sweepGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        sweepGrad.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
        ctx.fillStyle = sweepGrad;
        ctx.beginPath();
        ctx.moveTo(radarCenterX, radarCenterY);
        ctx.arc(radarCenterX, radarCenterY, maxRadarRadius, Math.PI - sweepRad - 0.15, Math.PI - sweepRad);
        ctx.closePath();
        ctx.fill();

        // Ultrasonic Beam Line
        const beamX = radarCenterX - Math.cos(sweepRad) * maxRadarRadius;
        const beamY = radarCenterY - Math.sin(sweepRad) * maxRadarRadius;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(radarCenterX, radarCenterY);
        ctx.lineTo(beamX, beamY);
        ctx.stroke();

        // Draw Draggable Obstacle Block
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(state.obstacleX - 16, state.obstacleY - 16, 32, 32, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TARGET', state.obstacleX, state.obstacleY + 3);

        // Distance Calculation from Radar Center
        const distPx = Math.hypot(state.obstacleX - radarCenterX, state.obstacleY - radarCenterY);
        const distCm = Math.min(100, Math.max(2, (distPx / maxRadarRadius) * 100));
        const targetAngleDeg = (Math.atan2(radarCenterY - state.obstacleY, radarCenterX - state.obstacleX) * 180) / Math.PI;

        // Check if current sweep beam intersects target
        if (Math.abs(state.radarAngle - targetAngleDeg) < 4 && distCm < 100) {
          state.echoDistance = distCm;
          state.blips.push({ angle: targetAngleDeg, dist: distCm, alpha: 1.0 });
          if (performance.now() - lastSoundTimeRef.current > 200) {
            lastSoundTimeRef.current = performance.now();
            soundFX.playUltrasonicPing();
          }
        }

        // Bounded blips array
        if (state.blips.length > 50) {
          state.blips.shift();
        }

        // Render Blips (Persistent echoes fading out)
        for (let i = state.blips.length - 1; i >= 0; i--) {
          const blip = state.blips[i];
          if (running) blip.alpha -= 0.02;
          if (blip.alpha <= 0) {
            state.blips.splice(i, 1);
            continue;
          }
          const bRad = (blip.angle * Math.PI) / 180;
          const bDistPx = (blip.dist / 100) * maxRadarRadius;
          const bx = radarCenterX - Math.cos(bRad) * bDistPx;
          const by = radarCenterY - Math.sin(bRad) * bDistPx;

          ctx.fillStyle = `rgba(239, 68, 68, ${blip.alpha})`;
          ctx.beginPath();
          ctx.arc(bx, by, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw HC-SR04 Sensor Base at Center
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(radarCenterX - 25, radarCenterY - 10, 50, 20, 4);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Angle: ${Math.round(state.radarAngle)}°  Distance: ${state.echoDistance.toFixed(1)} cm`, radarCenterX, 25);

        // Acoustic Multipath Reflection: Spurious ghost radar blips
        if (faults.acousticMultipath && running) {
          if (frameCount % 18 === 0) {
            const ghostAngle = (state.radarAngle + Math.sin(t * 7) * 45 + 180) % 180;
            const ghostDist = 12 + Math.abs(Math.sin(t * 4)) * 60;
            state.blips.push({ angle: ghostAngle, dist: ghostDist, alpha: 0.95 });
          }
          if (Math.sin(t * 9) > 0.15) {
            state.echoDistance = (state.echoDistance * 0.35 + 14.5 + Math.sin(t * 15) * 8);
          }
        }

        oscVal1 = (t * 20) % 20 < 1 ? 5.0 : 0.0; // Trigger pulse (10us)
        let echoPulseDur = Math.max(0.5, state.echoDistance / 10);
        if (faults.acousticMultipath && Math.sin(t * 14) > 0.3) {
          echoPulseDur = (echoPulseDur * 0.4 + 1.2);
        }
        oscVal2 = ((t * 20) % 20 < echoPulseDur ? 5.0 : 0.0) + hum50Hz; // Echo pulse width
        oscVal3 = Math.max(0, Math.min(180, state.radarAngle)) + (faults.inductiveSpike ? flybackSpike * 3 : 0); // Servo angle in degrees (0 to 180)
      }

      // =======================================================================
      // EXPERIMENT 4: MPU-6050 SELF-BALANCING INVERTED PENDULUM
      // =======================================================================
      else if (experiment.id === 'exp_mpu6050_balancing') {
        const floorY = height - 120;
        const poleLen = 95;

        // Inverted Pendulum Euler-Lagrange Simulation
        const g = 9.81;
        const m = 0.4;
        const l = 0.8;
        const dt = 0.016;

        // PID Control Loop
        const error = 0.0 - state.poleAngle;
        let controlForce = 0;

        if (running) {
          state.integral += error * dt;
          state.integral = Math.max(-0.25, Math.min(0.25, state.integral));
          const derivative = -state.poleAngularVel;

          const Kp = 20.0;
          const Ki = 1.2;
          const Kd = 3.2;
          controlForce = Kp * error + Ki * state.integral + Kd * derivative;

          // Physics update with damping
          const poleAngularAcc = (g / l) * Math.sin(state.poleAngle) - (controlForce / (m * l)) * Math.cos(state.poleAngle);
          state.poleAngularVel += poleAngularAcc * dt;
          state.poleAngularVel *= 0.992; // Viscous damping
          state.poleAngle += state.poleAngularVel * dt;

          if (faults.thermalDrift) {
            state.poleAngularVel += 0.05 * dt; // gyro zero-rate bias drift
          }
          if (faults.groundBounce) {
            state.poleAngle += Math.sin(t * 50) * 0.002;
          }

          // Cart acceleration with track friction
          const cartAcc = controlForce * 0.8;
          state.cartVel += cartAcc * dt;
          state.cartVel *= 0.985;
          state.cartX += state.cartVel * dt * 40;

          // Boundary clamping
          state.poleAngle = Math.max(-1.1, Math.min(1.1, state.poleAngle));
          if (!isFinite(state.poleAngle) || isNaN(state.poleAngle)) state.poleAngle = 0.05;
          if (!isFinite(state.poleAngularVel) || isNaN(state.poleAngularVel)) state.poleAngularVel = 0;
          if (!isFinite(state.cartX) || isNaN(state.cartX)) state.cartX = width * 0.5;
          if (!isFinite(state.cartVel) || isNaN(state.cartVel)) state.cartVel = 0;

          if (state.cartX < 80) {
            state.cartX = 80;
            state.cartVel = 0;
          }
          if (state.cartX > width - 80) {
            state.cartX = width - 80;
            state.cartVel = 0;
          }
        } else {
          controlForce = 20.0 * error + 3.2 * (-state.poleAngularVel);
        }

        // Draw Ground Track
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(30, floorY + 16);
        ctx.lineTo(width - 30, floorY + 16);
        ctx.stroke();

        // Draw Inverted Pendulum Cart Chassis
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(state.cartX - 35, floorY - 20, 70, 30, 8);
        ctx.fill();
        ctx.stroke();

        // Wheels
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(state.cartX - 22, floorY + 12, 10, 0, Math.PI * 2);
        ctx.arc(state.cartX + 22, floorY + 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // MPU-6050 Chip Icon on Cart
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.rect(state.cartX - 10, floorY - 14, 20, 18);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MPU', state.cartX, floorY - 2);

        // Draw Tilting Pendulum Pole
        const tipX = state.cartX + Math.sin(state.poleAngle) * poleLen;
        const tipY = floorY - 10 - Math.cos(state.poleAngle) * poleLen;

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(state.cartX, floorY - 10);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Tip Mass / Load
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Angle HUD
        const deg = (state.poleAngle * 180) / Math.PI;
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Pitch θ: ${deg.toFixed(2)}°  PID Output: ${controlForce.toFixed(1)} N`, width * 0.5, 30);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText('Drag Pendulum Tip to Disturb Balance', width * 0.5, 48);

        oscVal1 = (state.poleAngle * 180) / Math.PI + (faults.groundBounce ? hum50Hz * 3 : 0); // Filtered Pitch Angle in Degrees (-25 to +25)
        oscVal2 = (state.poleAngularVel * 180) / Math.PI + (faults.thermalDrift ? 24 : 0) + (faults.inductiveSpike ? flybackSpike * 8 : 0); // Gyro rate in °/s (-200 to +200)
        oscVal3 = Math.max(-255, Math.min(255, controlForce * 14)) + (faults.inductiveSpike ? flybackSpike * 25 : 0); // Motor PWM Output (-255 to +255)
      }

      // =======================================================================
      // EXPERIMENT 3: DUAL IR TCRT5000 LINE FOLLOWER ROBOT
      // =======================================================================
      else if (experiment.id === 'exp_ir_line_follower') {
        const trackCX = width * 0.5;
        const trackCY = (height - 70) * 0.52;
        const rx = Math.min(width * 0.40, 290);
        const ry = Math.min((height - 70) * 0.38, 92);

        // Parametric continuous track formula with organic bends
        const getTrackPoint = (s: number) => ({
          x: trackCX + rx * Math.cos(s),
          y: trackCY + ry * Math.sin(s) * (1 + 0.22 * Math.cos(2 * s)),
        });

        // 1. Draw Asphalt Roadbed
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 46;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const pt = getTrackPoint((i / 80) * Math.PI * 2);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.stroke();

        // 2. White Track Boundary Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Center Guide Line (High-absorption black tape)
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 11;
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const pt = getTrackPoint((i / 80) * Math.PI * 2);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.stroke();

        // Start / Finish Checkered Line
        const startPt = getTrackPoint(0);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startPt.x, startPt.y - 18);
        ctx.lineTo(startPt.x, startPt.y + 18);
        ctx.stroke();

        // Initialize robot position onto track if uninitialized
        if (!state.robotX || state.robotX === 0) {
          state.robotX = startPt.x;
          state.robotY = startPt.y;
          state.robotAngle = Math.PI / 2;
        }

        // Dual IR sensor positions in front of robot (18px ahead, ±8px lateral)
        const cosA = Math.cos(state.robotAngle);
        const sinA = Math.sin(state.robotAngle);
        const leftSensX = state.robotX + cosA * 18 - sinA * -8;
        const leftSensY = state.robotY + sinA * 18 + cosA * -8;
        const rightSensX = state.robotX + cosA * 18 - sinA * 8;
        const rightSensY = state.robotY + sinA * 18 + cosA * 8;

        // Accurate 120-point + fine subdivision search on continuous track spline
        let minDistL = 999;
        let minDistR = 999;
        let minDistRobot = 999;
        let bestI = 0;
        const NUM_SAMPLES = 120;
        for (let i = 0; i < NUM_SAMPLES; i++) {
          const tp = getTrackPoint((i / NUM_SAMPLES) * Math.PI * 2);
          const drobot = Math.hypot(state.robotX - tp.x, state.robotY - tp.y);
          if (drobot < minDistRobot) {
            minDistRobot = drobot;
            bestI = i;
          }
        }
        let closestTrackPt = getTrackPoint((bestI / NUM_SAMPLES) * Math.PI * 2);
        for (let sub = -6; sub <= 6; sub++) {
          const s = (((bestI + sub * 0.16) / NUM_SAMPLES) * Math.PI * 2);
          const tp = getTrackPoint(s);
          const dl = Math.hypot(leftSensX - tp.x, leftSensY - tp.y);
          const dr = Math.hypot(rightSensX - tp.x, rightSensY - tp.y);
          if (dl < minDistL) minDistL = dl;
          if (dr < minDistR) minDistR = dr;
          const drobot = Math.hypot(state.robotX - tp.x, state.robotY - tp.y);
          if (drobot < minDistRobot) {
            minDistRobot = drobot;
            closestTrackPt = tp;
          }
        }

        // Transduction: Black tape absorbs 950nm (4.5V), White reflects 950nm (0.6V)
        state.leftIR = minDistL <= 6 ? 4.5 : Math.max(0.6, 4.5 - (minDistL - 6) * 0.35);
        state.rightIR = minDistR <= 6 ? 4.5 : Math.max(0.6, 4.5 - (minDistR - 6) * 0.35);

        // Fault: Optical dust occlusion drops 950nm IR reflection by 80%
        if (faults.opticalOcclusion) {
          state.leftIR *= 0.2;
          state.rightIR *= 0.2;
        }
        if (faults.groundBounce) {
          state.leftIR = Math.max(0, Math.min(5, state.leftIR + hum50Hz));
          state.rightIR = Math.max(0, Math.min(5, state.rightIR + hum50Hz));
        }

        // Proportional Closed-Loop Steering Dynamics
        if (running && !state.isDraggingRobot) {
          if (minDistRobot > 85) {
            // Off-track auto-recovery: steer toward closest track point
            const targetHeading = Math.atan2(closestTrackPt.y - state.robotY, closestTrackPt.x - state.robotX);
            let headingDiff = targetHeading - state.robotAngle;
            while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
            while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;
            state.robotAngle += headingDiff * 0.08;
            state.robotX += Math.cos(state.robotAngle) * 1.6;
            state.robotY += Math.sin(state.robotAngle) * 1.6;
            state.leftPWM = 130;
            state.rightPWM = 130;
          } else {
            const error = state.leftIR - state.rightIR;
            const Kp = 38.0;
            const correction = error * Kp;
            state.leftPWM = Math.max(40, Math.min(255, 160 - correction));
            state.rightPWM = Math.max(40, Math.min(255, 160 + correction));

            const vL = state.leftPWM * 0.011;
            const vR = state.rightPWM * 0.011;
            const speed = (vL + vR) * 0.5;
            const omega = (vR - vL) / 16.0;

            state.robotAngle += omega * 0.36;
            state.robotX += Math.cos(state.robotAngle) * speed;
            state.robotY += Math.sin(state.robotAngle) * speed;
          }
        }

        // Angle normalization & bounds safety
        while (state.robotAngle > Math.PI) state.robotAngle -= Math.PI * 2;
        while (state.robotAngle < -Math.PI) state.robotAngle += Math.PI * 2;
        if (!isFinite(state.robotX) || isNaN(state.robotX)) state.robotX = startPt.x;
        if (!isFinite(state.robotY) || isNaN(state.robotY)) state.robotY = startPt.y;

        // Render Differential Drive Robot Chassis
        ctx.save();
        ctx.translate(state.robotX, state.robotY);
        ctx.rotate(state.robotAngle);

        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.roundRect(-18, -14, 36, 28, 6);
        ctx.fill();

        // Left & Right Drive Wheels with treads
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        [-16, 11].forEach((yOff) => {
          ctx.beginPath();
          ctx.roundRect(-10, yOff, 20, 5, 2);
          ctx.fill();
          ctx.stroke();
          // Tread marks
          ctx.strokeStyle = '#64748b';
          for (let tx = -8; tx <= 8; tx += 4) {
            ctx.beginPath();
            ctx.moveTo(tx, yOff);
            ctx.lineTo(tx, yOff + 5);
            ctx.stroke();
          }
        });

        // Main PCB Chassis
        ctx.fillStyle = '#0f766e';
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-16, -11, 32, 22, 5);
        ctx.fill();
        ctx.stroke();

        // Microcontroller IC & Power LED
        ctx.fillStyle = '#020617';
        ctx.fillRect(-8, -6, 16, 12);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(-11, 0, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Front Ball Caster
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(13, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Front Sensor Bar Bracket
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(15, -11, 4, 22);

        // Glowing 950nm Near-Infrared Sensor Dots (TCRT5000 Dual Array)
        [-8, 8].forEach((yPos, idx) => {
          const isLeft = idx === 0;
          const sensV = isLeft ? state.leftIR : state.rightIR;
          const isOverBlack = sensV > 2.5;

          // Invisible 950nm IR represented via soft radiant magenta halo
          const irGlow = ctx.createRadialGradient(18, yPos, 1, 18, yPos, 14);
          irGlow.addColorStop(0, 'rgba(217, 70, 239, 0.95)');
          irGlow.addColorStop(0.4, 'rgba(192, 132, 252, 0.45)');
          irGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.fillStyle = irGlow;
          ctx.beginPath();
          ctx.arc(18, yPos, 14, 0, Math.PI * 2);
          ctx.fill();

          // Physical Phototransistor Body
          ctx.fillStyle = isOverBlack ? '#1e1b4b' : '#38bdf8';
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(18, yPos, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });

        ctx.restore();

        // Telemetry HUD Card
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(14, 12, 260, 48, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`L-IR (A0): ${state.leftIR.toFixed(2)}V   PWM-L: ${Math.round(state.leftPWM)}`, 22, 26);
        ctx.fillStyle = '#10b981';
        ctx.fillText(`R-IR (A1): ${state.rightIR.toFixed(2)}V   PWM-R: ${Math.round(state.rightPWM)}`, 22, 39);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`ΔV Error: ${(state.leftIR - state.rightIR).toFixed(2)}V (Differential Drive)`, 22, 52);

        // Oscilloscope Channels
        oscVal1 = state.leftIR + (faults.inductiveSpike ? flybackSpike * 0.4 : 0); // A0 analog voltage (0.5V to 4.5V)
        oscVal2 = state.rightIR + (faults.inductiveSpike ? flybackSpike * 0.4 : 0); // A1 analog voltage (0.5V to 4.5V)
        oscVal3 = (state.leftPWM - state.rightPWM) + (faults.inductiveSpike ? flybackSpike * 25 : 0); // Differential effort (-255 to 255)
      }

      // =======================================================================
      // EXPERIMENT 5: DUAL-LDR SOLAR TRACKER & HELIOSTAT
      // =======================================================================
      else if (experiment.id === 'exp_ldr_solar_tracker') {
        const stationX = width * 0.5;
        const stationY = (height - 70) * 0.72;
        const sunX = Math.max(30, Math.min(width - 30, state.sunX || 320));
        const sunY = Math.max(25, Math.min(stationY - 50, state.sunY || 65));

        // 1. Draw Draggable Radiant Sun with Multilayer Corona
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 52);
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.2, '#fef08a');
        sunGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
        sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 52, 0, Math.PI * 2);
        ctx.fill();

        // Core Sun Disc & Dynamic Flare Rays
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < 8; a++) {
          const rayAng = (a * Math.PI) / 4 + t * 0.5;
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(rayAng) * 20, sunY + Math.sin(rayAng) * 20);
          ctx.lineTo(sunX + Math.cos(rayAng) * 32, sunY + Math.sin(rayAng) * 32);
          ctx.stroke();
        }

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SUN (DRAG)', sunX, sunY + 28);

        // 2. Incident Solar Flux Rays onto Station
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(stationX, stationY - 25);
        ctx.stroke();
        ctx.setLineDash([]);

        // Geometry: Sun Elevation relative to Station
        const dx = sunX - stationX;
        const dy = sunY - (stationY - 25);
        const sunAngleDeg = (Math.atan2(-dy, dx) * 180) / Math.PI; // 0° (right) to 180° (left)
        const deltaAngle = sunAngleDeg - state.panelAngle;

        // Shadow Fin Geometry:
        // When sun is to right (dx > 0, sunAngleDeg < 90), deltaAngle < 0,
        // shadow should be cast to the left (-X in panel coordinates).
        const finHeight = 32;
        const shadowOffset = Math.sin((deltaAngle * Math.PI) / 180) * finHeight * 1.2;
        const leftSensorOffset = -26;
        const rightSensorOffset = 26;

        // Illumination computation across dual CdS cells
        const cosIncidence = Math.max(0.12, Math.min(1.0, Math.cos((deltaAngle * Math.PI) / 180)));
        const isLeftShaded = Math.abs(shadowOffset - leftSensorOffset) < 14;
        const isRightShaded = Math.abs(shadowOffset - rightSensorOffset) < 14;

        state.leftV = isLeftShaded ? 0.8 : Math.min(5.0, 1.2 + cosIncidence * 3.7);
        state.rightV = isRightShaded ? 0.8 : Math.min(5.0, 1.2 + cosIncidence * 3.7);

        // Fault: Optical dust occlusion drops LDR sunlight lux by 80%
        if (faults.opticalOcclusion) {
          state.leftV *= 0.2;
          state.rightV *= 0.2;
        }
        // Fault: Thermal resistance drift unbalances CdS cell baseline
        if (faults.thermalDrift) {
          state.leftV = Math.min(5.0, state.leftV + 0.95);
        }
        // Fault: 50Hz mains hum ripple
        if (faults.groundBounce) {
          state.leftV = Math.max(0, Math.min(5, state.leftV + hum50Hz));
          state.rightV = Math.max(0, Math.min(5, state.rightV + hum50Hz));
        }

        // Pan Servo Closed-Loop Feedback Control with Deadband
        if (running) {
          const ldrDiff = state.leftV - state.rightV;
          const DEADBAND = 0.15;
          if (Math.abs(ldrDiff) > DEADBAND) {
            // Turning towards brighter sensor aligns panel normal to sun
            state.panelAngle += Math.sign(ldrDiff) * 0.8;
            state.panelAngle = Math.max(15, Math.min(165, state.panelAngle));
          }
        }

        // 3. Ground Pedestal Mount & SG90 Servo Case
        ctx.fillStyle = '#334155';
        ctx.fillRect(stationX - 18, stationY + 10, 36, 25);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(stationX - 18, stationY + 10, 36, 25);

        // Translucent Blue SG90 Servo Body
        ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(stationX - 14, stationY - 14, 28, 24, 4);
        ctx.fill();
        ctx.stroke();

        // 4. Pivoting Solar Panel Assembly
        ctx.save();
        ctx.translate(stationX, stationY - 14);
        // Panel face is perpendicular to its azimuth heading
        const panelRotRad = ((state.panelAngle - 90) * Math.PI) / 180;
        ctx.rotate(panelRotRad);

        // Solar Panel Silicon Base
        const panelW = 140;
        const panelH = 22;
        ctx.fillStyle = '#1e3a8a';
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 4);
        ctx.fill();
        ctx.stroke();

        // Photovoltaic Grid Busbars
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let gx = -panelW / 2 + 15; gx < panelW / 2; gx += 18) {
          ctx.beginPath();
          ctx.moveTo(gx, -panelH / 2);
          ctx.lineTo(gx, panelH / 2);
          ctx.stroke();
        }

        // Dynamic Cast Shadow from Central Fin onto Panel Face
        if (Math.abs(shadowOffset) > 2) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.beginPath();
          ctx.moveTo(0, -panelH / 2);
          ctx.lineTo(shadowOffset, -panelH / 2);
          ctx.lineTo(shadowOffset * 0.8, panelH / 2);
          ctx.lineTo(0, panelH / 2);
          ctx.closePath();
          ctx.fill();
        }

        // Dual CdS Photoresistor Cells
        [leftSensorOffset, rightSensorOffset].forEach((xPos, idx) => {
          const isShaded = idx === 0 ? isLeftShaded : isRightShaded;
          // Ceramic Base
          ctx.fillStyle = '#fed7aa';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(xPos, 0, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Serpentine Cadmium-Sulfide Track
          ctx.strokeStyle = isShaded ? '#78350f' : '#ea580c';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(xPos, 0, 3.5, 0, Math.PI);
          ctx.stroke();
        });

        // Central Opaque Shadow Fin (The Septum)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-2, -panelH / 2 - finHeight, 4, finHeight);
        ctx.strokeRect(-2, -panelH / 2 - finHeight, 4, finHeight);

        ctx.restore();

        // Real-Time Heliostat Telemetry HUD
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(14, 12, 280, 52, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Sun Azimuth: ${Math.round(sunAngleDeg)}°   Panel Servo: ${Math.round(state.panelAngle)}°`, 22, 26);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`Left LDR: ${state.leftV.toFixed(2)}V   Right LDR: ${state.rightV.toFixed(2)}V`, 22, 40);
        ctx.fillStyle = '#10b981';
        ctx.fillText(`Capture Efficiency: ${Math.round(cosIncidence * 100)}%   ΔV: ${(state.leftV - state.rightV).toFixed(2)}V`, 22, 54);

        oscVal1 = state.leftV; // Left light voltage (0 to 5V)
        oscVal2 = state.rightV; // Right light voltage (0 to 5V)
        oscVal3 = state.panelAngle + (faults.inductiveSpike ? flybackSpike * 4 : 0); // Servo pan angle (0° to 180°)
      }

      // =======================================================================
      // EXPERIMENT 6: ROTARY QUADRATURE ENCODER + MOTOR PID SPEED
      // =======================================================================
      else if (experiment.id === 'exp_encoder_motor_pid') {
        const motorCX = width * 0.40;
        const motorCY = (height - 70) * 0.48;
        const discRadius = 65;
        const numSlots = 20;

        // Physics: Draggable Mechanical Friction Brake Load (0.0 to 1.0)
        const brakeLoad = state.brakeLoad ?? 0.25;
        const targetRPM = 130;
        const loadTorque = 45 + brakeLoad * 260;
        const motorTorque = (state.motorPWM || 135) * 1.6;

        // Closed-Loop Velocity PI Controller Loop
        if (running) {
          state.actualRPM += (motorTorque - loadTorque) * 0.04;
          state.actualRPM = Math.max(15, Math.min(300, state.actualRPM));

          // Closed-Loop Velocity PI Controller Loop
          // Fault: Optical dust occlusion drops slotted encoder pulse amplitude below TTL logic threshold, dropping 80% of pulses
          const measuredRPM = faults.opticalOcclusion ? state.actualRPM * 0.2 : state.actualRPM;
          const rpmError = targetRPM - measuredRPM;
          state.integral = Math.max(-100, Math.min(100, (state.integral || 0) + rpmError * 0.05));
          const Kp = 1.8;
          const Ki = 0.35;
          state.motorPWM = Math.max(0, Math.min(255, 120 + Kp * rpmError + Ki * state.integral));

          // Angular Rotation of Encoder Disc with modulo bounds
          const rps = state.actualRPM / 60;
          state.wheelAngle = ((state.wheelAngle || 0) + rps * Math.PI * 2 * 0.016) % (Math.PI * 2);
        }

        // Authentic 90° Phase Shift Quadrature A & B Waveforms
        const thetaElecA = ((state.wheelAngle || 0) * numSlots) % (Math.PI * 2);
        const thetaElecB = ((state.wheelAngle || 0) * numSlots + Math.PI / 2) % (Math.PI * 2);
        const newChanA = thetaElecA < Math.PI ? 5.0 : 0.0;
        const newChanB = thetaElecB < Math.PI ? 5.0 : 0.0;

        // Optical encoder slot crossing click (throttled to avoid audio buffer saturation)
        if (state.channelAState !== undefined && newChanA !== state.channelAState) {
          const now = performance.now();
          if (now - (state.lastTickTime || 0) > 35) {
            state.lastTickTime = now;
            soundFX.playEncoderTick();
          }
        }

        state.channelAState = faults.opticalOcclusion ? newChanA * 0.2 : newChanA;
        state.channelBState = faults.opticalOcclusion ? newChanB * 0.2 : newChanB;

        // 1. Draw DC Motor Chassis Body (Behind Disc)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(motorCX - 125, motorCY - 35, 75, 70, 8);
        ctx.fill();
        ctx.stroke();

        // Motor Terminal Leads
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(motorCX - 125, motorCY - 14);
        ctx.lineTo(motorCX - 145, motorCY - 14);
        ctx.stroke();
        ctx.strokeStyle = '#020617';
        ctx.beginPath();
        ctx.moveTo(motorCX - 125, motorCY + 14);
        ctx.lineTo(motorCX - 145, motorCY + 14);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DC MOTOR', motorCX - 88, motorCY + 4);

        // Hardened Steel Driveshaft
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(motorCX - 50, motorCY - 6, 50, 12);

        // 2. Slotted Optical Encoder Disc
        ctx.save();
        ctx.translate(motorCX, motorCY);
        ctx.rotate(state.wheelAngle || 0);

        // Outer rim
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, discRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 20 Slotted Radial Optical Apertures
        for (let s = 0; s < numSlots; s++) {
          const slotAngle = (s * Math.PI * 2) / numSlots;
          const slotHalfWidth = (Math.PI / numSlots) * 0.45;
          ctx.fillStyle = '#070a13'; // Cutout slot
          ctx.beginPath();
          ctx.arc(0, 0, discRadius - 2, slotAngle - slotHalfWidth, slotAngle + slotHalfWidth);
          ctx.arc(0, 0, discRadius - 16, slotAngle + slotHalfWidth, slotAngle - slotHalfWidth, true);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Disc Center Aluminum Hub & Allen Screw
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // 3. Dual-Channel Optical Interrupter Fork (At Top Rim)
        const optoX = motorCX;
        const optoY = motorCY - discRadius + 8;

        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(optoX - 22, optoY - 18, 44, 24, 4);
        ctx.fill();
        ctx.stroke();

        // Glowing Optical IR Beam Lines (Channel A & Channel B)
        const isBeamAPassing = state.channelAState > 2.5;
        const isBeamBPassing = state.channelBState > 2.5;

        // Channel A Optical Beam
        ctx.strokeStyle = isBeamAPassing ? '#10b981' : '#ef4444';
        ctx.lineWidth = isBeamAPassing ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(optoX - 8, optoY - 14);
        ctx.lineTo(optoX - 8, optoY + 2);
        ctx.stroke();

        // Channel B Optical Beam
        ctx.strokeStyle = isBeamBPassing ? '#10b981' : '#ef4444';
        ctx.lineWidth = isBeamBPassing ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(optoX + 8, optoY - 14);
        ctx.lineTo(optoX + 8, optoY + 2);
        ctx.stroke();

        // Active Optical Indicator LEDs
        ctx.fillStyle = isBeamAPassing ? '#10b981' : '#334155';
        ctx.beginPath();
        ctx.arc(optoX - 8, optoY - 10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isBeamBPassing ? '#10b981' : '#334155';
        ctx.beginPath();
        ctx.arc(optoX + 8, optoY - 10, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 4. Draggable Friction Brake Shoe (Clamped on Disc Rim)
        const brakeX = motorCX + discRadius - 8;
        const brakeY = motorCY;

        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(brakeX, brakeY - 16, 22, 32, 4);
        ctx.fill();
        ctx.stroke();

        // Dynamic Thermal Friction Glow under High Brake Load
        if (brakeLoad > 0.3) {
          const frictionGlow = ctx.createRadialGradient(brakeX + 4, brakeY, 2, brakeX + 4, brakeY, 24);
          frictionGlow.addColorStop(0, `rgba(239, 68, 68, ${brakeLoad * 0.8})`);
          frictionGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = frictionGlow;
          ctx.beginPath();
          ctx.arc(brakeX + 4, brakeY, 24, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. Interactive Mechanical Brake Load Slider (Bottom Bar)
        const sliderX = width * 0.12;
        const sliderY = height - 90;
        const sliderW = width * 0.76;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(sliderX, sliderY, sliderW, 14, 7);
        ctx.fill();
        ctx.stroke();

        // Active Load Fill Bar
        const fillW = sliderW * brakeLoad;
        const brakeGrad = ctx.createLinearGradient(sliderX, sliderY, sliderX + fillW, sliderY);
        brakeGrad.addColorStop(0, '#10b981');
        brakeGrad.addColorStop(0.5, '#f59e0b');
        brakeGrad.addColorStop(1, '#ef4444');
        ctx.fillStyle = brakeGrad;
        ctx.beginPath();
        ctx.roundRect(sliderX, sliderY, fillW, 14, 7);
        ctx.fill();

        // Draggable Handle Knurled Grip
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sliderX + fillW, sliderY + 7, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`DRAG TO ADJUST MECHANICAL BRAKE LOAD: ${Math.round(brakeLoad * 100)}%`, width * 0.5, sliderY - 6);

        // Closed-Loop PID Telemetry HUD Card
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(14, 12, 280, 52, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Target Speed: ${targetRPM} RPM   Actual: ${Math.round(state.actualRPM)} RPM`, 22, 26);
        ctx.fillStyle = '#10b981';
        ctx.fillText(`PID Motor Output: ${Math.round(state.motorPWM)} PWM (${Math.round((state.motorPWM / 255) * 100)}% Duty)`, 22, 40);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`Phase Shift: 90° Quadrature (A: ${state.channelAState.toFixed(0)}V, B: ${state.channelBState.toFixed(0)}V)`, 22, 54);

        oscVal1 = state.channelAState + (faults.inductiveSpike ? flybackSpike : 0) + (faults.groundBounce ? hum50Hz : 0); // Pin 2 Channel A square wave (0V to 5V)
        oscVal2 = state.channelBState + (faults.inductiveSpike ? flybackSpike : 0) + (faults.groundBounce ? hum50Hz : 0); // Pin 3 Channel B square wave (0V to 5V, 90° out of phase)
        oscVal3 = state.actualRPM; // Motor rotational velocity (0 to 300 RPM)
      }

      // =======================================================================
      // EXPERIMENT 7: HALL EFFECT MAGNETIC SPINDLE TACHOMETER
      // =======================================================================
      else if (experiment.id === 'exp_hall_effect_tachometer') {
        const spindleCX = width * 0.36;
        const spindleCY = (height - 70) * 0.48;
        const rotorRadius = 54;

        // Smoothly track target throttle RPM
        const targetThrottleRPM = state.targetRPM || 2400;
        if (running) {
          state.spindleRPM += (targetThrottleRPM - state.spindleRPM) * 0.08;

          // Instantaneous angular rotation with modulo
          const omegaSpindle = (state.spindleRPM * Math.PI * 2) / 60;
          state.spindleAngle = ((state.spindleAngle || 0) + omegaSpindle * 0.016) % (Math.PI * 2);
        }

        // Neodymium Magnet Coordinates on Rotor Perimeter
        const magnetAngle = (state.spindleAngle || 0) % (Math.PI * 2);
        const magnetX = spindleCX + Math.cos(magnetAngle) * rotorRadius;
        const magnetY = spindleCY + Math.sin(magnetAngle) * rotorRadius;

        // Stationary A3144 Hall Sensor mounted at 3 o'clock position
        const sensorX = spindleCX + rotorRadius + 14;
        const sensorY = spindleCY;

        // Detection: Magnet South pole passes sensing face
        const distToSensor = Math.hypot(magnetX - sensorX, magnetY - sensorY);
        const isMagnetInZone = distToSensor < 22;

        if (isMagnetInZone) {
          state.hallOutV = 0.0; // Open collector pulls to 0V
          state.pulseActive = true;
        } else {
          state.hallOutV = 5.0; // 10k pull-up holds at 5V
          state.pulseActive = false;
        }

        // Faults: Flyback inductive spikes trigger false interrupt pulses; 50Hz mains hum
        if (faults.inductiveSpike && Math.abs(flybackSpike) > 2.5) {
          state.hallOutV = 0.0;
          state.pulseActive = true;
        }
        if (faults.groundBounce) {
          state.hallOutV = Math.max(0, Math.min(5, state.hallOutV + hum50Hz));
        }

        // 1. Draw High-Speed Rotating Spindle Hub
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(spindleCX, spindleCY, rotorRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rotating weight reduction cutouts
        for (let h = 0; h < 4; h++) {
          const holeAng = magnetAngle + (h * Math.PI) / 2;
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(spindleCX + Math.cos(holeAng) * 28, spindleCY + Math.sin(holeAng) * 28, 9, 0, Math.PI * 2);
          ctx.fill();
        }

        // Center Spindle Hex Nut
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(spindleCX, spindleCY, 14, 0, Math.PI * 2);
        ctx.fill();

        // 2. Embedded Neodymium Disc Magnet with South & North Poles
        ctx.save();
        ctx.translate(magnetX, magnetY);
        ctx.rotate(magnetAngle);

        // South Pole (Active triggering pole - Crimson)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 7, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('S', 3, 2.5);

        // North Pole (Blue)
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(0, 0, 7, Math.PI / 2, (3 * Math.PI) / 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('N', -3, 2.5);

        // Radiant Glowing Magnetic Dipole Flux Arcs
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.2;
        for (let r = 10; r <= 22; r += 6) {
          ctx.beginPath();
          ctx.arc(0, 0, r, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
        }

        ctx.restore();

        // 3. Stationary A3144 Hall Effect Sensor IC (TO-92 Package)
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = state.pulseActive ? '#10b981' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(sensorX - 5, sensorY - 14, 20, 28, 3);
        ctx.fill();
        ctx.stroke();

        // 3 Terminal Pins (VCC, GND, OUT)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        [-8, 0, 8].forEach((py) => {
          ctx.beginPath();
          ctx.moveTo(sensorX + 15, sensorY + py);
          ctx.lineTo(sensorX + 28, sensorY + py);
          ctx.stroke();
        });

        // Trigger indicator LED on sensor
        ctx.fillStyle = state.pulseActive ? '#10b981' : '#334155';
        ctx.beginPath();
        ctx.arc(sensorX + 5, sensorY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('A3144', sensorX + 2, sensorY - 18);

        // 4. Circular Tachometer Dial Gauge (Right Pane)
        const tachoCX = width * 0.76;
        const tachoCY = (height - 70) * 0.48;
        const tachoRadius = 55;

        // Dial Bezel & Face
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(tachoCX, tachoCY, tachoRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Radial Tick Marks (0 to 6000 RPM)
        const startRad = (3 * Math.PI) / 4;
        const sweepRad = (3 * Math.PI) / 2;
        for (let tk = 0; tk <= 12; tk++) {
          const tickAng = startRad + (tk / 12) * sweepRad;
          const isMajor = tk % 2 === 0;
          const tickLen = isMajor ? 8 : 4;
          const isRedline = tk >= 9;

          ctx.strokeStyle = isRedline ? '#ef4444' : '#94a3b8';
          ctx.lineWidth = isMajor ? 1.8 : 1;
          ctx.beginPath();
          ctx.moveTo(tachoCX + Math.cos(tickAng) * (tachoRadius - tickLen), tachoCY + Math.sin(tickAng) * (tachoRadius - tickLen));
          ctx.lineTo(tachoCX + Math.cos(tickAng) * (tachoRadius - 2), tachoCY + Math.sin(tickAng) * (tachoRadius - 2));
          ctx.stroke();
        }

        // Sweeping Tachometer Indicator Needle
        const normRPM = Math.max(0, Math.min(1, (state.spindleRPM || 0) / 6000));
        const needleAng = startRad + normRPM * sweepRad;

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(tachoCX, tachoCY);
        ctx.lineTo(tachoCX + Math.cos(needleAng) * (tachoRadius - 10), tachoCY + Math.sin(needleAng) * (tachoRadius - 10));
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tachoCX, tachoCY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Digital LCD Readout under Tachometer
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(state.spindleRPM)} RPM`, tachoCX, tachoCY + 28);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        const periodMs = state.spindleRPM > 1 ? (60000 / state.spindleRPM).toFixed(1) : '0.0';
        ctx.fillText(`Period: ${periodMs} ms`, tachoCX, tachoCY + 40);

        // 5. Interactive Throttle RPM Drag Slider (Bottom)
        const thrSliderX = width * 0.12;
        const thrSliderY = height - 90;
        const thrSliderW = width * 0.76;
        const thrNorm = Math.max(0, Math.min(1, (targetThrottleRPM - 600) / 4800));

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(thrSliderX, thrSliderY, thrSliderW, 14, 7);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(thrSliderX, thrSliderY, thrSliderW * thrNorm, 14, 7);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(thrSliderX + thrSliderW * thrNorm, thrSliderY + 7, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`DRAG THROTTLE RPM: ${targetThrottleRPM} RPM (600 - 5400 RPM)`, width * 0.5, thrSliderY - 6);

        // Pin Voltage Oscilloscope Channels
        oscVal1 = state.hallOutV; // Pin 2 digital output (5V pull-up idle, 0V falling pulse)
        oscVal2 = state.spindleRPM + (faults.inductiveSpike && Math.abs(flybackSpike) > 2.5 ? 1200 : 0); // Calculated shaft speed (0 to 6000 RPM)
        oscVal3 = (state.pulseActive ? 0.0 : 5.0) + (faults.inductiveSpike ? flybackSpike * 0.5 : 0); // Interrupt falling-edge trigger pulse (0V active / 5V idle)
      }

      // =======================================================================
      // EXPERIMENT 8: LOAD CELL WHEATSTONE BRIDGE & SMART GRIPPER
      // =======================================================================
      else if (experiment.id === 'exp_loadcell_smart_gripper') {
        const gripperCX = width * 0.44;
        const gripperCY = (height - 70) * 0.46;
        const eggWidth = 44; // mm resting outer diameter

        // Elastic Contact Force Dynamics
        const targetForce = state.targetForceGrams || 150;
        const compression = Math.max(0, eggWidth - state.gripperJawPos);
        state.measuredForceGrams = compression * 36.5;

        // Shell Fracture Check (Threshold = 300g) - Irreversible once fractured
        if (state.measuredForceGrams > 300) {
          if (!state.isEggCracked) {
            state.isEggCracked = true;
            soundFX.playEggCrack();
            soundFX.playPiezoBuzzer(3000, 0.25);
          }
        }

        // Closed-Loop Auto Grasp State Machine
        if (running && state.autoGrasp) {
          if (state.measuredForceGrams < targetForce) {
            state.gripperJawPos = Math.max(36.0, state.gripperJawPos - 0.12);
          } else if (state.measuredForceGrams > targetForce + 12) {
            state.gripperJawPos = Math.min(48.0, state.gripperJawPos + 0.12);
          }
        }

        // HX711 24-Bit ADC Digitization (120,000 zero tare + 2,400 counts/g)
        let thermalOffset = 0;
        if (faults.thermalDrift) {
          thermalOffset = Math.sin(t * 0.15) * 150000 + 120000;
          state.measuredForceGrams += thermalOffset / 2400;
        }
        if (faults.groundBounce) {
          state.measuredForceGrams += hum50Hz * 37.5;
        }

        state.rawCounts = 120000 + Math.round(state.measuredForceGrams * 2400) + Math.round(thermalOffset) + (faults.groundBounce ? Math.round(hum50Hz * 90000) : 0);
        const jawOpeningPx = state.gripperJawPos * 1.8;
        const servoAngle = Math.max(0, Math.min(90, (48 - state.gripperJawPos) * 5.2));

        // 1. Draw The Egg (Between Jaws)
        ctx.save();
        ctx.translate(gripperCX, gripperCY);

        // Soft Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 32, 22, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Egg Shell Gradient
        const eggGrad = ctx.createRadialGradient(-6, -10, 4, 0, 0, 32);
        eggGrad.addColorStop(0, '#fef3c7');
        eggGrad.addColorStop(0.7, '#fed7aa');
        eggGrad.addColorStop(1, '#f97316');
        ctx.fillStyle = eggGrad;
        ctx.strokeStyle = state.isEggCracked ? '#ef4444' : '#fb923c';
        ctx.lineWidth = state.isEggCracked ? 2 : 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 29, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Dynamic Shell Fracture Cracks if Force Exceeded 300g
        if (state.isEggCracked) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-10, -8);
          ctx.lineTo(-4, 0);
          ctx.lineTo(-12, 12);
          ctx.moveTo(8, -14);
          ctx.lineTo(2, -2);
          ctx.lineTo(10, 8);
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('CRACKED!', 0, -34);
        }

        ctx.restore();

        // 2. Aluminum Shear Bending Beam (Load Cell on Left Arm)
        const beamX = gripperCX - jawOpeningPx / 2 - 80;
        const beamY = gripperCY - 9;
        const beamW = 75;
        const beamH = 18;
        const deflectionY = Math.min(6, state.measuredForceGrams * 0.016);

        // Fixed Rigid Mounting Base on Left
        ctx.fillStyle = '#334155';
        ctx.fillRect(beamX - 18, beamY - 6, 18, beamH + 12);
        // Mounting Screws
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(beamX - 9, beamY + 1, 3, 0, Math.PI * 2);
        ctx.arc(beamX - 9, beamY + beamH - 1, 3, 0, Math.PI * 2);
        ctx.fill();

        // Deflecting Aluminum Beam with Binocular Cutouts
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(beamX, beamY);
        ctx.lineTo(beamX + beamW, beamY + deflectionY);
        ctx.lineTo(beamX + beamW, beamY + beamH + deflectionY);
        ctx.lineTo(beamX, beamY + beamH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Dual Relief Holes (Binocular Load Cell Cutout)
        ctx.fillStyle = '#070a13';
        ctx.beginPath();
        ctx.arc(beamX + 24, beamY + beamH / 2 + deflectionY * 0.3, 5, 0, Math.PI * 2);
        ctx.arc(beamX + 50, beamY + beamH / 2 + deflectionY * 0.7, 5, 0, Math.PI * 2);
        ctx.fill();

        // Piezoresistive Strain Gauges (Top = Tension, Bottom = Compression)
        ctx.strokeStyle = state.measuredForceGrams > 20 ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(beamX + 16, beamY - 2, 16, 3);

        ctx.strokeStyle = state.measuredForceGrams > 20 ? '#06b6d4' : '#38bdf8';
        ctx.strokeRect(beamX + 16, beamY + beamH - 1, 16, 3);

        // 4-Wire Wheatstone Bridge Lead Harness to HX711 (E+, E-, A+, A-)
        const wireColors = ['#ef4444', '#020617', '#10b981', '#ffffff'];
        wireColors.forEach((color, idx) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(beamX + 20, beamY + idx * 3);
          ctx.lineTo(beamX - 14, beamY + idx * 4 - 2);
          ctx.stroke();
        });

        // 3. Silicone Gripper Jaw Pads Clamping Egg
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(gripperCX - jawOpeningPx / 2 - 6, gripperCY - 22, 6, 44, 3);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(gripperCX + jawOpeningPx / 2, gripperCY - 22, 6, 44, 3);
        ctx.fill();
        ctx.stroke();

        // 4. Force Gauge Bar & Digital Scale HUD
        const forceBarX = width * 0.12;
        const forceBarY = height - 90;
        const forceBarW = width * 0.76;
        const normForce = Math.min(1, state.measuredForceGrams / 400);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(forceBarX, forceBarY, forceBarW, 14, 7);
        ctx.fill();
        ctx.stroke();

        // Color Zones: Safe (Green) -> Caution (Amber) -> Fracture (Red)
        const fillForceW = forceBarW * normForce;
        const fGrad = ctx.createLinearGradient(forceBarX, forceBarY, forceBarX + fillForceW, forceBarY);
        fGrad.addColorStop(0, '#10b981');
        fGrad.addColorStop(0.5, '#f59e0b');
        fGrad.addColorStop(1, '#ef4444');
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.roundRect(forceBarX, forceBarY, fillForceW, 14, 7);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(forceBarX + fillForceW, forceBarY + 7, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`TARGET GRIP FORCE: ${targetForce}g   |   MEASURED FORCE: ${state.measuredForceGrams.toFixed(1)}g (SAFE: 100-200g)`, width * 0.5, forceBarY - 6);

        // Top Status HUD & Interactive Buttons
        ctx.fillStyle = state.autoGrasp ? '#059669' : '#334155';
        ctx.beginPath();
        ctx.roundRect(14, 12, 110, 24, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(state.autoGrasp ? 'AUTO-GRASP: ON' : 'MANUAL GRIP: ON', 69, 27);

        // Replace Egg / Tare Button
        ctx.fillStyle = state.isEggCracked ? '#dc2626' : '#1e293b';
        ctx.strokeStyle = state.isEggCracked ? '#fca5a5' : '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(132, 12, 105, 24, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = state.isEggCracked ? '#ffffff' : '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(state.isEggCracked ? 'REPLACE EGG' : 'TARE SCALE', 184, 27);

        // Scale Telemetry Card
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(246, 12, 220, 48, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = state.isEggCracked ? '#ef4444' : '#10b981';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Load Cell: ${state.measuredForceGrams.toFixed(1)} g`, 254, 28);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '8px monospace';
        ctx.fillText(`HX711 24-bit: ${state.rawCounts} counts`, 254, 41);
        ctx.fillText(`Beam Deflection: ${(deflectionY * 0.1).toFixed(2)} mm`, 254, 53);

        oscVal1 = state.rawCounts + (faults.inductiveSpike ? flybackSpike * 25000 : 0); // HX711 24-bit count
        oscVal2 = Math.max(0, state.measuredForceGrams); // Grams force (0 to 1000g)
        oscVal3 = servoAngle + (faults.inductiveSpike ? flybackSpike * 2 : 0); // Gripper jaw closure angle (0° to 90°)
      }

      // =======================================================================
      // DEFAULT FALLBACK EXPERIMENT DRAWING
      // =======================================================================
      else {
        // Generic active transducer visualizer
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${experiment.title}`, width * 0.5, (height - 70) * 0.4);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText(`Transducer: ${experiment.transducerType}`, width * 0.5, (height - 70) * 0.4 + 25);
        ctx.fillText(`Actuator: ${experiment.actuatorType}`, width * 0.5, (height - 70) * 0.4 + 45);

        // Rotating gear / test particle
        const rotX = width * 0.5;
        const rotY = (height - 70) * 0.7;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(rotX, rotY, 35, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(rotX, rotY);
        ctx.lineTo(rotX + Math.cos(t * 3) * 35, rotY + Math.sin(t * 3) * 35);
        ctx.stroke();

        oscVal1 = Math.sin(t * 4) * 2.5 + 2.5;
        oscVal2 = Math.cos(t * 4) * 2.5 + 2.5;
        oscVal3 = (Math.sin(t * 8) > 0 ? 5 : 0);
      }

      // =======================================================================
      // LIVE DIGITAL OSCILLOSCOPE BOTTOM HUD
      // =======================================================================
      const oscY = height - 65;
      const oscH = 60;

      // Oscilloscope background chassis
      ctx.fillStyle = '#020408';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(10, oscY, width - 20, oscH);
      ctx.fill();
      ctx.stroke();

      // Oscilloscope center zero line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(15, oscY + oscH / 2);
      ctx.lineTo(width - 15, oscY + oscH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Store samples
      if (running && frameCount % speed === 0) {
        oscHistoryRef.current.push([oscVal1, oscVal2, oscVal3]);
        if (oscHistoryRef.current.length > MAX_OSC_SAMPLES) oscHistoryRef.current.shift();
      }
      frameCount++;

      // Render Oscilloscope Channels
      experiment.oscilloscopeChannels.forEach((ch, idx) => {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();

        const stepX = (width - 30) / MAX_OSC_SAMPLES;
        const history = oscHistoryRef.current;
        for (let i = 0; i < history.length; i++) {
          const val = history[i][idx] ?? 0;
          const range = ch.rangeMax - ch.rangeMin || 1;
          const normVal = Math.max(0, Math.min(1, (val - ch.rangeMin) / range));
          const px = 15 + i * stepX;
          const py = oscY + oscH - 6 - normVal * (oscH - 12);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });

      // Oscilloscope Legend Pill & Trigger Status
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('OSCILLOSCOPE', 18, oscY + 12);

      ctx.fillStyle = '#10b981';
      ctx.fillText('● TRIG\'D (AUTO)', 90, oscY + 12);

      let legOffset = 185;
      experiment.oscilloscopeChannels.forEach((ch) => {
        ctx.fillStyle = ch.color;
        ctx.fillText(`■ ${ch.name}`, legOffset, oscY + 12);
        legOffset += 130;
      });

      const numActiveFaults = [
        faults.groundBounce,
        faults.opticalOcclusion,
        faults.acousticMultipath,
        faults.inductiveSpike,
        faults.thermalDrift,
      ].filter(Boolean).length;

      if (numActiveFaults > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'right';
        ctx.fillText(`⚡ [${numActiveFaults} FAULT${numActiveFaults > 1 ? 'S' : ''} ACTIVE]`, width - 20, oscY + 12);
        ctx.textAlign = 'left';
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [experiment.id]);

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-ink-950 overflow-hidden shadow-xl space-y-3 p-4">
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono text-xs font-bold uppercase tracking-wider border border-brand-500/30">
            Hardware Simulation Canvas
          </span>
          <span className="text-xs font-mono text-ink-400">
            60 FPS Real-Time Physics & Pin Voltage Oscilloscope
          </span>
          {Object.values(activeFaults).some(Boolean) && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-rose-500/40 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Faults Injected ({Object.values(activeFaults).filter(Boolean).length})
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Timebase Speed Selector */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 text-[10px] font-mono">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setOscilloscopeSpeed(s);
                  soundFX.playTap();
                }}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  oscilloscopeSpeed === s
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'text-ink-400 hover:text-white'
                }`}
                title={`Oscilloscope Timebase: ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reset Simulation Button */}
          <button
            onClick={() => {
              resetSimulation();
              soundFX.playTap();
            }}
            title="Reset Simulation State"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-ink-300 border border-white/10 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 text-black shadow-xs'
                : 'bg-brand-500 text-white shadow-xs'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={() => {
              const muted = soundFX.toggleMute();
              setIsSoundMuted(muted);
              if (!muted) soundFX.playSuccess();
            }}
            title={isSoundMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-ink-300 border border-white/10 transition-colors cursor-pointer"
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Element */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl border border-white/10 overflow-hidden bg-black shadow-inner touch-none cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full block touch-none"
        />

        {/* Interactive Drag Hint */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono text-ink-300 pointer-events-none flex items-center gap-1.5">
          <Move className="w-3 h-3 text-brand-400" />
          <span>Click & Drag Object in Canvas</span>
        </div>
      </div>
    </div>
  );
};
