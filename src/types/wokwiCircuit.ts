/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Wokwi Circuit Simulation Types:
 * Type definitions for photorealistic vector breadboard, Arduino Uno R3,
 * electronic modules, bezier jumper wires, and interactive stimulus state machines.
 */

export type WireColorCode =
  | 'red'       // +5V / VCC
  | 'black'     // GND / Common Ground
  | 'yellow'    // Signal / Trigger
  | 'green'     // Echo / Analog Data
  | 'blue'      // PWM Motor / Servo
  | 'orange'    // I2C SDA
  | 'purple'    // I2C SCL
  | 'white'     // Analog Sensor Output
  | 'brown'     // Negative Reference / GND
  | 'gray';     // Bus / Clock

export type WireType =
  | 'power'
  | 'ground'
  | 'signal'
  | 'pwm'
  | 'i2c'
  | 'analog'
  | 'echo'
  | 'trigger'
  | 'spi';

export interface CircuitWire {
  id: string;
  fromPin: string;
  toPin: string;
  color: string;
  wireType: WireType;
  isConnected: boolean;
  stepIndex: number;
  label?: string;
  slack?: number;
  fromLabel?: string;
  toLabel?: string;
}

export type ElectronicModuleType =
  | 'arduino_uno'
  | 'breadboard_half'
  | 'breadboard_full'
  | 'pir_hc_sr501'
  | 'ultrasonic_hc_sr04'
  | 'servo_sg90'
  | 'lcd1602_i2c'
  | 'piezo_buzzer'
  | 'tcrt5000_ir'
  | 'l298n_motor_driver'
  | 'mpu6050_imu'
  | 'dual_ldr_tracker'
  | 'optical_encoder_motor'
  | 'hall_effect_sensor'
  | 'loadcell_hx711_gripper';

export interface CircuitComponentState {
  id: string;
  type: ElectronicModuleType | string;
  x: number;
  y: number;
  rotation?: number; // in degrees
  scale?: number;
  label?: string;
  state: { [key: string]: any };
}

export interface InteractiveStimulusState {
  targetPos: { x: number; y: number };
  servoAngle: number;         // 0° to 180°
  distanceCm: number;         // 2cm to 400cm
  obstacleDetected: boolean;
  motorRpm: number;           // 0 to 3000 RPM
  eggPressure: number;        // 0 to 100 grams
  lightAngle: number;         // -80° to +80°
  sunPos: { x: number; y: number };
  potentiometerValue: number; // 0 to 1023
  imuPitch: number;           // -45° to +45°
  imuRoll: number;            // -45° to +45°
  isPIRTriggered: boolean;
  lineTrackOffset: number;    // -100 to +100
  isTared: boolean;
  hallTriggered: boolean;
  activeWiringStep?: number;
  buzzerActive?: boolean;
  buzzerFreq?: number;
}

export interface WiringStep {
  stepIndex: number;
  title: string;
  instruction: string;
  color: string;
  wireIds: string[];
  fromPin: string;
  toPin: string;
  engineeringTip: string;
  voltageRating?: string;
}

export interface WokwiCircuitConfig {
  experimentId: string;
  title: string;
  arduinoPosition: { x: number; y: number };
  breadboardPosition: { x: number; y: number };
  breadboardType: 'half' | 'full';
  components: CircuitComponentState[];
  wires: CircuitWire[];
  wiringSteps: WiringStep[];
  lcdTemplate?: {
    line1: string;
    line2: string;
  };
}

export interface PinAnchor {
  x: number;
  y: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  label?: string;
}
