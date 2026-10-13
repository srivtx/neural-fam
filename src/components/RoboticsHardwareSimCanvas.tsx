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
} from 'lucide-react';
import { RoboticsExperiment } from '../data/roboticsExperimentsData';
import { soundFX } from '../utils/audio';

interface RoboticsHardwareSimCanvasProps {
  experiment: RoboticsExperiment;
}

export const RoboticsHardwareSimCanvas: React.FC<RoboticsHardwareSimCanvasProps> = ({
  experiment,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundFX.getMuted());
  const [userParam1, setUserParam1] = useState<number>(50); // General interactive control 1
  const [userParam2, setUserParam2] = useState<number>(50); // General interactive control 2
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 200, y: 150 });
  const [oscilloscopeSpeed, setOscilloscopeSpeed] = useState<number>(2);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simStateRef = useRef<any>({});
  const lastSoundTimeRef = useRef<number>(0);

  // Initialize experiment-specific simulation state
  useEffect(() => {
    if (experiment.id === 'exp_pir_servo_buzzer') {
      simStateRef.current = {
        humanX: 120,
        humanY: 140,
        humanSpeed: 1.5,
        gateAngle: 0,
        targetGateAngle: 0,
        isTriggered: false,
        triggerTimer: 0,
        buzzerAlpha: 0,
      };
      setDragPos({ x: 120, y: 140 });
    } else if (experiment.id === 'exp_ultrasonic_radar') {
      simStateRef.current = {
        radarAngle: 0,
        sweepDir: 1,
        obstacleX: 280,
        obstacleY: 110,
        echoDistance: 25.0,
        blips: [] as Array<{ angle: number; dist: number; alpha: number }>,
      };
      setDragPos({ x: 280, y: 110 });
    } else if (experiment.id === 'exp_ir_line_follower') {
      simStateRef.current = {
        robotX: 200,
        robotY: 100,
        robotAngle: 0,
        leftIR: 0.5,
        rightIR: 0.5,
        leftPWM: 160,
        rightPWM: 160,
        trackProgress: 0,
      };
    } else if (experiment.id === 'exp_mpu6050_balancing') {
      simStateRef.current = {
        cartX: 250,
        cartVel: 0,
        poleAngle: 0.05, // Radians
        poleAngularVel: 0,
        integral: 0,
      };
    } else if (experiment.id === 'exp_ldr_solar_tracker') {
      simStateRef.current = {
        sunX: 300,
        sunY: 60,
        panelAngle: 90,
        leftLux: 500,
        rightLux: 500,
      };
      setDragPos({ x: 300, y: 60 });
    } else if (experiment.id === 'exp_encoder_motor_pid') {
      simStateRef.current = {
        wheelAngle: 0,
        actualRPM: 120,
        targetRPM: 120,
        channelAState: 0,
        channelBState: 0,
        tickCounter: 0,
      };
    } else if (experiment.id === 'exp_hall_effect_tachometer') {
      simStateRef.current = {
        spindleAngle: 0,
        spindleRPM: 1800,
        pulseActive: false,
      };
    } else if (experiment.id === 'exp_loadcell_smart_gripper') {
      simStateRef.current = {
        gripperJawPos: 20, // mm opening
        measuredForceGrams: 0,
        targetForceGrams: 150,
        holdingObject: true,
      };
    }
  }, [experiment.id]);

  // Mouse & Touch Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDragging(true);
    setDragPos({ x, y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(20, Math.min(canvas.clientWidth - 20, e.clientX - rect.left));
    const y = Math.max(20, Math.min(canvas.clientHeight - 80, e.clientY - rect.top));
    setDragPos({ x, y });

    // Update experiment target positions
    if (experiment.id === 'exp_pir_servo_buzzer') {
      simStateRef.current.humanX = x;
      simStateRef.current.humanY = y;
    } else if (experiment.id === 'exp_ultrasonic_radar') {
      simStateRef.current.obstacleX = x;
      simStateRef.current.obstacleY = y;
    } else if (experiment.id === 'exp_ldr_solar_tracker') {
      simStateRef.current.sunX = x;
      simStateRef.current.sunY = y;
    } else if (experiment.id === 'exp_mpu6050_balancing') {
      // Disturb pendulum angle with cursor
      const cartX = simStateRef.current.cartX || 250;
      const angle = (x - cartX) * 0.003;
      simStateRef.current.poleAngle = Math.max(-0.5, Math.min(0.5, angle));
      simStateRef.current.poleAngularVel = 0;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Main 60 FPS Canvas Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const oscHistory: Array<number[]> = [];
    const MAX_OSC_SAMPLES = 180;

    const render = () => {
      t += 0.03;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
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
      let oscVal1 = 0;
      let oscVal2 = 0;
      let oscVal3 = 0;

      // =======================================================================
      // EXPERIMENT 1: PIR + SERVO GATE + BUZZER
      // =======================================================================
      if (experiment.id === 'exp_pir_servo_buzzer') {
        const pirX = width * 0.75;
        const pirY = (height - 70) * 0.5;

        // Auto-patrol human if not dragging
        if (!isDragging) {
          state.humanX += state.humanSpeed;
          if (state.humanX > width * 0.85 || state.humanX < 50) {
            state.humanSpeed *= -1;
          }
        }

        // Draw PIR Sensor Optical Beams (Fresnel Cone Zones)
        const numBeams = 5;
        const beamSpan = Math.PI * 0.6;
        for (let b = 0; b < numBeams; b++) {
          const angle = Math.PI - beamSpan / 2 + (b * beamSpan) / (numBeams - 1);
          const beamLen = 220;

          const inBeam =
            Math.hypot(state.humanX - pirX, state.humanY - pirY) < beamLen &&
            Math.abs(Math.atan2(state.humanY - pirY, state.humanX - pirX) - angle) < 0.2;

          ctx.fillStyle = inBeam ? 'rgba(239, 68, 68, 0.22)' : 'rgba(56, 189, 248, 0.06)';
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
            soundFX.playTap();
          }
        } else {
          if (state.triggerTimer > 0) {
            state.triggerTimer--;
          } else {
            state.isTriggered = false;
            state.targetGateAngle = 0;
            state.buzzerAlpha = Math.max(0, state.buzzerAlpha - 0.05);
          }
        }

        // Smooth servo gate movement
        state.gateAngle += (state.targetGateAngle - state.gateAngle) * 0.12;

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
            ctx.arc(pirX + 22, pirY - 45, w * 12 * ((t * 2) % 1), 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('BEEP!', pirX + 22, pirY - 55);
        }

        // Oscilloscope channel values
        oscVal1 = state.isTriggered ? 5.0 : 0.0; // PIR digital out (5V)
        oscVal2 = 1.0 + (state.gateAngle / 90.0); // Servo PWM pulse width (1.0ms to 2.0ms)
        oscVal3 = state.buzzerAlpha > 0.1 ? (Math.sin(t * 30) > 0 ? 5.0 : 0.0) : 0.0;
      }

      // =======================================================================
      // EXPERIMENT 2: ULTRASONIC HC-SR04 RADAR
      // =======================================================================
      else if (experiment.id === 'exp_ultrasonic_radar') {
        const radarCenterX = width * 0.5;
        const radarCenterY = height - 90;
        const maxRadarRadius = Math.min(width * 0.42, height * 0.7);

        // Sweep Servo Angle back and forth (0° to 180°)
        state.radarAngle += state.sweepDir * 1.5;
        if (state.radarAngle >= 170) state.sweepDir = -1;
        if (state.radarAngle <= 10) state.sweepDir = 1;

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
        const distCm = (distPx / maxRadarRadius) * 100;
        const targetAngleDeg = (Math.atan2(radarCenterY - state.obstacleY, radarCenterX - state.obstacleX) * 180) / Math.PI;

        // Check if current sweep beam intersects target
        if (Math.abs(state.radarAngle - targetAngleDeg) < 4 && distCm < 100) {
          state.echoDistance = distCm;
          state.blips.push({ angle: targetAngleDeg, dist: distCm, alpha: 1.0 });
        }

        // Render Blips (Persistent echoes fading out)
        for (let i = state.blips.length - 1; i >= 0; i--) {
          const blip = state.blips[i];
          blip.alpha -= 0.02;
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

        oscVal1 = (t * 20) % 20 < 1 ? 5.0 : 0.0; // Trigger pulse (10us)
        oscVal2 = (t * 20) % 20 < (state.echoDistance / 10) ? 5.0 : 0.0; // Echo pulse width
        oscVal3 = (state.radarAngle / 180.0) * 5.0; // Servo analog angle
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
        state.integral += error * dt;
        state.integral = Math.max(-0.2, Math.min(0.2, state.integral));
        const derivative = -state.poleAngularVel;

        const Kp = 18.0;
        const Ki = 1.4;
        const Kd = 2.8;
        const controlForce = Kp * error + Ki * state.integral + Kd * derivative;

        // Physics update
        const poleAngularAcc = (g / l) * Math.sin(state.poleAngle) - (controlForce / (m * l)) * Math.cos(state.poleAngle);
        state.poleAngularVel += poleAngularAcc * dt;
        state.poleAngle += state.poleAngularVel * dt;

        // Cart acceleration
        const cartAcc = controlForce * 0.8;
        state.cartVel += cartAcc * dt;
        state.cartX += state.cartVel * dt * 40;

        // Boundary wrap
        if (state.cartX < 80) {
          state.cartX = 80;
          state.cartVel = 0;
        }
        if (state.cartX > width - 80) {
          state.cartX = width - 80;
          state.cartVel = 0;
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

        oscVal1 = state.poleAngle * 10; // Scaled angle
        oscVal2 = state.poleAngularVel * 2; // Gyro rate
        oscVal3 = Math.max(-5, Math.min(5, controlForce * 0.5)); // Motor command
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
      oscHistory.push([oscVal1, oscVal2, oscVal3]);
      if (oscHistory.length > MAX_OSC_SAMPLES) oscHistory.shift();

      // Render Oscilloscope Channels
      experiment.oscilloscopeChannels.forEach((ch, idx) => {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();

        const stepX = (width - 30) / MAX_OSC_SAMPLES;
        for (let i = 0; i < oscHistory.length; i++) {
          const val = oscHistory[i][idx] || 0;
          const normVal = Math.max(0, Math.min(1, (val - ch.rangeMin) / (ch.rangeMax - ch.rangeMin || 1)));
          const px = 15 + i * stepX;
          const py = oscY + oscH - 6 - normVal * (oscH - 12);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });

      // Oscilloscope Legend Pill
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('OSCILLOSCOPE (PIN VOLTAGE TRACE)', 18, oscY + 12);

      let legOffset = 180;
      experiment.oscilloscopeChannels.forEach((ch) => {
        ctx.fillStyle = ch.color;
        ctx.fillText(`■ ${ch.name}`, legOffset, oscY + 12);
        legOffset += 130;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [experiment.id, isRunning, isDragging, dragPos]);

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
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
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
          className="w-full h-full block"
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
