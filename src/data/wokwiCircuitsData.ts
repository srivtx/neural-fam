/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Wokwi Circuits Dataset:
 * Comprehensive circuit layouts, module positions, color-coded jumper wires,
 * and step-by-step wiring instructions for all 8 canonical robotics experiments.
 */

import { WokwiCircuitConfig, CircuitWire, WiringStep, CircuitComponentState } from '../types/wokwiCircuit';

export const WOKWI_CIRCUITS: Record<string, WokwiCircuitConfig> = {
  // --------------------------------------------------------------------------
  // EXPERIMENT 1: PIR Motion Sensor + SG90 Servo Gate + Piezo Buzzer
  // --------------------------------------------------------------------------
  exp_pir_servo_buzzer: {
    experimentId: 'exp_pir_servo_buzzer',
    title: 'PIR Motion Sensor + Servo Security Gate + Piezo Chime',
    arduinoPosition: { x: 80, y: 320 },
    breadboardPosition: { x: 460, y: 310 },
    breadboardType: 'half',
    components: [
      {
        id: 'pir_1',
        type: 'pir_hc_sr501',
        x: 480,
        y: 110,
        rotation: 0,
        label: 'HC-SR501 PIR Sensor',
        state: { triggered: false, timeDelay: 4.0, sensitivity: 0.8 },
      },
      {
        id: 'servo_1',
        type: 'servo_sg90',
        x: 770,
        y: 120,
        rotation: 0,
        label: 'SG90 Micro Servo (Gate)',
        state: { angle: 0, targetAngle: 0 },
      },
      {
        id: 'buzzer_1',
        type: 'piezo_buzzer',
        x: 670,
        y: 430,
        rotation: 0,
        label: 'Piezo Buzzer (Chime)',
        state: { active: false, freq: 1000 },
      },
      {
        id: 'lcd_1',
        type: 'lcd1602_i2c',
        x: 1020,
        y: 330,
        rotation: 0,
        label: '16x2 I2C LCD Display',
        state: { line1: 'SEC: ARMED IDLE', line2: 'GATE: CLOSED  0°' },
      },
    ],
    wires: [
      // Step 0: Power rails to Breadboard
      {
        id: 'w_pwr_5v',
        fromPin: 'arduino:5V',
        toPin: 'bb:rail:top:red:5',
        color: '#ef4444',
        wireType: 'power',
        isConnected: true,
        stepIndex: 0,
        label: 'Arduino 5V → Breadboard + Rail',
        slack: 35,
      },
      {
        id: 'w_pwr_gnd',
        fromPin: 'arduino:GND1',
        toPin: 'bb:rail:top:blue:5',
        color: '#1f2937',
        wireType: 'ground',
        isConnected: true,
        stepIndex: 0,
        label: 'Arduino GND → Breadboard - Rail',
        slack: 30,
      },
      // Step 1: PIR Power & Ground
      {
        id: 'w_pir_vcc',
        fromPin: 'pir:VCC',
        toPin: 'bb:rail:top:red:8',
        color: '#ef4444',
        wireType: 'power',
        isConnected: true,
        stepIndex: 1,
        label: 'PIR VCC → +5V Rail',
        slack: 25,
      },
      {
        id: 'w_pir_gnd',
        fromPin: 'pir:GND',
        toPin: 'bb:rail:top:blue:8',
        color: '#1f2937',
        wireType: 'ground',
        isConnected: true,
        stepIndex: 1,
        label: 'PIR GND → GND Rail',
        slack: 20,
      },
      // Step 2: PIR Signal to D2 (Interrupt pin)
      {
        id: 'w_pir_out',
        fromPin: 'pir:OUT',
        toPin: 'arduino:D2',
        color: '#eab308',
        wireType: 'signal',
        isConnected: true,
        stepIndex: 2,
        label: 'PIR OUT → Arduino Pin D2',
        slack: -40,
      },
      // Step 3: Servo Power & Ground (External Rail with Decoupling)
      {
        id: 'w_servo_vcc',
        fromPin: 'servo:VCC',
        toPin: 'bb:rail:top:red:22',
        color: '#ef4444',
        wireType: 'power',
        isConnected: true,
        stepIndex: 3,
        label: 'Servo VCC → 5V Rail (External)',
        slack: 30,
      },
      {
        id: 'w_servo_gnd',
        fromPin: 'servo:GND',
        toPin: 'bb:rail:top:blue:22',
        color: '#1f2937',
        wireType: 'ground',
        isConnected: true,
        stepIndex: 3,
        label: 'Servo GND → Common GND',
        slack: 25,
      },
      // Step 4: Servo PWM to D9
      {
        id: 'w_servo_pwm',
        fromPin: 'servo:PWM',
        toPin: 'arduino:D9',
        color: '#3b82f6',
        wireType: 'pwm',
        isConnected: true,
        stepIndex: 4,
        label: 'Servo PWM (Orange) → Pin D9',
        slack: -50,
      },
      // Step 5: Buzzer Wiring (D8 & GND)
      {
        id: 'w_buzzer_pos',
        fromPin: 'buzzer:POS',
        toPin: 'arduino:D8',
        color: '#10b981',
        wireType: 'signal',
        isConnected: true,
        stepIndex: 5,
        label: 'Buzzer (+) → Pin D8',
        slack: -30,
      },
      {
        id: 'w_buzzer_neg',
        fromPin: 'buzzer:NEG',
        toPin: 'bb:rail:bottom:blue:18',
        color: '#1f2937',
        wireType: 'ground',
        isConnected: true,
        stepIndex: 5,
        label: 'Buzzer (-) → GND Rail',
        slack: 20,
      },
      // Step 6: I2C LCD telemetry
      {
        id: 'w_lcd_vcc',
        fromPin: 'lcd:VCC',
        toPin: 'bb:rail:top:red:28',
        color: '#ef4444',
        wireType: 'power',
        isConnected: true,
        stepIndex: 6,
        label: 'LCD VCC → +5V Rail',
        slack: 20,
      },
      {
        id: 'w_lcd_gnd',
        fromPin: 'lcd:GND',
        toPin: 'bb:rail:top:blue:28',
        color: '#1f2937',
        wireType: 'ground',
        isConnected: true,
        stepIndex: 6,
        label: 'LCD GND → GND Rail',
        slack: 15,
      },
      {
        id: 'w_lcd_sda',
        fromPin: 'lcd:SDA',
        toPin: 'arduino:SDA',
        color: '#f97316',
        wireType: 'i2c',
        isConnected: true,
        stepIndex: 6,
        label: 'LCD SDA → Arduino SDA (A4)',
        slack: -45,
      },
      {
        id: 'w_lcd_scl',
        fromPin: 'lcd:SCL',
        toPin: 'arduino:SCL',
        color: '#a855f7',
        wireType: 'i2c',
        isConnected: true,
        stepIndex: 6,
        label: 'LCD SCL → Arduino SCL (A5)',
        slack: -55,
      },
    ],
    wiringSteps: [
      {
        stepIndex: 0,
        title: 'Step 1: Primary Power Rails',
        instruction: 'Connect Arduino 5V to Breadboard Red (+) rail and GND to Blue (-) rail.',
        color: '#ef4444',
        wireIds: ['w_pwr_5v', 'w_pwr_gnd'],
        fromPin: 'Arduino 5V / GND',
        toPin: 'Breadboard Power Rails',
        engineeringTip: 'Always establish common ground first to prevent floating potentials and electrostatic discharge.',
        voltageRating: '5.0V DC Regulated',
      },
      {
        stepIndex: 1,
        title: 'Step 2: PIR Pyroelectric Sensor Power',
        instruction: 'Route 5V and GND jumpers to the HC-SR501 VCC and GND pins.',
        color: '#ef4444',
        wireIds: ['w_pir_vcc', 'w_pir_gnd'],
        fromPin: 'Breadboard Rails',
        toPin: 'PIR VCC / GND',
        engineeringTip: 'HC-SR501 draws ~50 µA in standby; thermal stabilization takes ~30-60s on initial power up.',
        voltageRating: '4.5V - 12V Tolerant',
      },
      {
        stepIndex: 2,
        title: 'Step 3: PIR Digital Trigger Line',
        instruction: 'Connect PIR OUT (center pin) to Arduino Digital Pin 2.',
        color: '#eab308',
        wireIds: ['w_pir_out'],
        fromPin: 'PIR OUT',
        toPin: 'Arduino D2 (INT0)',
        engineeringTip: 'Pin 2 supports hardware interrupt INT0, enabling instant sub-microsecond event wakeups.',
        voltageRating: '3.3V Logic High Output',
      },
      {
        stepIndex: 3,
        title: 'Step 4: SG90 Servo Power Bus',
        instruction: 'Connect Servo Red wire to 5V rail and Brown/Black wire to Common GND.',
        color: '#ef4444',
        wireIds: ['w_servo_vcc', 'w_servo_gnd'],
        fromPin: 'Breadboard Rails',
        toPin: 'SG90 Power Terminal',
        engineeringTip: 'DANGER: SG90 stall current spikes up to 500mA. Add a 100µF capacitor to prevent MCU brownout!',
        voltageRating: '4.8V - 6.0V DC',
      },
      {
        stepIndex: 4,
        title: 'Step 5: Servo 50 Hz PWM Control',
        instruction: 'Connect Servo Orange wire (Signal) to Arduino Digital Pin 9 (~PWM).',
        color: '#3b82f6',
        wireIds: ['w_servo_pwm'],
        fromPin: 'SG90 PWM Pin',
        toPin: 'Arduino Pin 9',
        engineeringTip: 'Arduino Servo library uses Timer1 to output precision 1.0ms (0°) to 2.0ms (180°) pulses.',
        voltageRating: '5V TTL PWM Pulse Train',
      },
      {
        stepIndex: 5,
        title: 'Step 6: Piezo Chime Buzzer',
        instruction: 'Connect Buzzer (+) to Digital Pin 8 and (-) to common GND.',
        color: '#10b981',
        wireIds: ['w_buzzer_pos', 'w_buzzer_neg'],
        fromPin: 'Arduino D8 / GND',
        toPin: 'Piezo Terminal',
        engineeringTip: 'Pin 8 outputs tone() square waves at 1 kHz to 4 kHz resonant cavity frequencies.',
        voltageRating: '5V Square Wave',
      },
      {
        stepIndex: 6,
        title: 'Step 7: I2C Telemetry Display (LCD1602)',
        instruction: 'Connect LCD VCC/GND, SDA to Arduino SDA (A4) and SCL to SCL (A5).',
        color: '#f97316',
        wireIds: ['w_lcd_vcc', 'w_lcd_gnd', 'w_lcd_sda', 'w_lcd_scl'],
        fromPin: 'Arduino SDA / SCL / 5V / GND',
        toPin: 'PCF8574 Backpack Header',
        engineeringTip: 'I2C operates at 100 kHz standard mode with 4.7 kΩ internal pull-ups to 5V.',
        voltageRating: '5.0V I2C Bus (0x27)',
      },
    ],
    lcdTemplate: {
      line1: 'SEC: ARMED IDLE',
      line2: 'GATE: CLOSED  0°',
    },
  },

  // --------------------------------------------------------------------------
  // EXPERIMENT 2: Ultrasonic Time-of-Flight Radar Scanner (HC-SR04 + Servo + LCD)
  // --------------------------------------------------------------------------
  exp_ultrasonic_radar: {
    experimentId: 'exp_ultrasonic_radar',
    title: 'Acoustic Ultrasonic Time-of-Flight Radar Scanner',
    arduinoPosition: { x: 80, y: 320 },
    breadboardPosition: { x: 460, y: 310 },
    breadboardType: 'half',
    components: [
      {
        id: 'sonar_1',
        type: 'ultrasonic_hc_sr04',
        x: 540,
        y: 110,
        rotation: 0,
        label: 'HC-SR04 Ultrasonic Transducer',
        state: { distanceCm: 25.4, echoTimeUs: 1476 },
      },
      {
        id: 'servo_radar',
        type: 'servo_sg90',
        x: 540,
        y: 200,
        rotation: 0,
        label: 'SG90 Azimuth Radar Gimbal',
        state: { angle: 90 },
      },
      {
        id: 'lcd_radar',
        type: 'lcd1602_i2c',
        x: 880,
        y: 330,
        rotation: 0,
        label: '16x2 I2C Radar Telemetry',
        state: { line1: 'DIST: 25.4 cm', line2: 'AZIMUTH: 90° RADAR' },
      },
      {
        id: 'buzzer_radar',
        type: 'piezo_buzzer',
        x: 780,
        y: 160,
        rotation: 0,
        label: 'Proximity Warning Chime',
        state: { active: false },
      },
    ],
    wires: [
      // Rail power
      { id: 'w2_pwr_5v', fromPin: 'arduino:5V', toPin: 'bb:rail:top:red:4', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 0 },
      { id: 'w2_pwr_gnd', fromPin: 'arduino:GND1', toPin: 'bb:rail:top:blue:4', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 0 },
      // HC-SR04 power
      { id: 'w2_sonar_vcc', fromPin: 'sonar:VCC', toPin: 'bb:rail:top:red:10', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 1 },
      { id: 'w2_sonar_gnd', fromPin: 'sonar:GND', toPin: 'bb:rail:top:blue:10', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 1 },
      // HC-SR04 Trig -> D12
      { id: 'w2_sonar_trig', fromPin: 'sonar:TRIG', toPin: 'arduino:D12', color: '#eab308', wireType: 'trigger', isConnected: true, stepIndex: 2, label: 'Trig → Pin 12', slack: -30 },
      // HC-SR04 Echo -> D11
      { id: 'w2_sonar_echo', fromPin: 'sonar:ECHO', toPin: 'arduino:D11', color: '#22c55e', wireType: 'echo', isConnected: true, stepIndex: 3, label: 'Echo → Pin 11', slack: -35 },
      // SG90 Servo
      { id: 'w2_servo_vcc', fromPin: 'servo:VCC', toPin: 'bb:rail:top:red:18', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 4 },
      { id: 'w2_servo_gnd', fromPin: 'servo:GND', toPin: 'bb:rail:top:blue:18', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 4 },
      { id: 'w2_servo_pwm', fromPin: 'servo:PWM', toPin: 'arduino:D9', color: '#3b82f6', wireType: 'pwm', isConnected: true, stepIndex: 4, label: 'Servo PWM → D9', slack: -45 },
      // Buzzer
      { id: 'w2_buzz_pos', fromPin: 'buzzer:POS', toPin: 'arduino:D8', color: '#10b981', wireType: 'signal', isConnected: true, stepIndex: 5 },
      { id: 'w2_buzz_neg', fromPin: 'buzzer:NEG', toPin: 'bb:rail:top:blue:20', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 5 },
      // LCD I2C
      { id: 'w2_lcd_vcc', fromPin: 'lcd:VCC', toPin: 'bb:rail:top:red:26', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 6 },
      { id: 'w2_lcd_gnd', fromPin: 'lcd:GND', toPin: 'bb:rail:top:blue:26', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 6 },
      { id: 'w2_lcd_sda', fromPin: 'lcd:SDA', toPin: 'arduino:SDA', color: '#f97316', wireType: 'i2c', isConnected: true, stepIndex: 6, label: 'LCD SDA → SDA', slack: -50 },
      { id: 'w2_lcd_scl', fromPin: 'lcd:SCL', toPin: 'arduino:SCL', color: '#a855f7', wireType: 'i2c', isConnected: true, stepIndex: 6, label: 'LCD SCL → SCL', slack: -60 },
    ],
    wiringSteps: [
      { stepIndex: 0, title: 'Step 1: Power Backbone', instruction: 'Connect Arduino 5V and GND to Breadboard distribution rails.', color: '#ef4444', wireIds: ['w2_pwr_5v', 'w2_pwr_gnd'], fromPin: 'Arduino 5V / GND', toPin: 'Breadboard Rails', engineeringTip: 'Ensures stable 5V rail for 40 kHz piezoceramic drive burst.' },
      { stepIndex: 1, title: 'Step 2: HC-SR04 Power Lines', instruction: 'Connect VCC to 5V and GND to breadboard ground rail.', color: '#ef4444', wireIds: ['w2_sonar_vcc', 'w2_sonar_gnd'], fromPin: 'HC-SR04 VCC / GND', toPin: 'Power Rails', engineeringTip: 'Transducers require clean 5V to drive 8-cycle 40 kHz sonic pulse.' },
      { stepIndex: 2, title: 'Step 3: 10 µs Trigger Pulse Pin', instruction: 'Connect HC-SR04 TRIG pin to Arduino Digital Pin 12.', color: '#eab308', wireIds: ['w2_sonar_trig'], fromPin: 'TRIG', toPin: 'Arduino Pin 12', engineeringTip: 'Firmware writes HIGH for 10 microseconds to fire ultrasonic burst.' },
      { stepIndex: 3, title: 'Step 4: Echo Pulse Measurement Pin', instruction: 'Connect HC-SR04 ECHO pin to Arduino Digital Pin 11.', color: '#22c55e', wireIds: ['w2_sonar_echo'], fromPin: 'ECHO', toPin: 'Arduino Pin 11', engineeringTip: 'Pulse duration width directly reflects flight time: d = (t × 0.0343) / 2.' },
      { stepIndex: 4, title: 'Step 5: Azimuth Gimbal Servo', instruction: 'Connect SG90 Servo to 5V, GND, and Digital Pin 9 (PWM).', color: '#3b82f6', wireIds: ['w2_servo_vcc', 'w2_servo_gnd', 'w2_servo_pwm'], fromPin: 'SG90 Servo', toPin: 'Arduino Pin 9', engineeringTip: 'Sweeps the acoustic beam across a 180° radial field of view.' },
      { stepIndex: 5, title: 'Step 6: Proximity Audio Alert', instruction: 'Wire Piezo Buzzer (+) to Digital Pin 8 and (-) to GND.', color: '#10b981', wireIds: ['w2_buzz_pos', 'w2_buzz_neg'], fromPin: 'Buzzer', toPin: 'Arduino Pin 8', engineeringTip: 'Sounds progressive frequency chirps as obstacles enter warning threshold (<15cm).' },
      { stepIndex: 6, title: 'Step 7: Real-Time Radar Screen', instruction: 'Wire 16x2 I2C LCD (SDA to Pin A4/SDA, SCL to Pin A5/SCL).', color: '#f97316', wireIds: ['w2_lcd_vcc', 'w2_lcd_gnd', 'w2_lcd_sda', 'w2_lcd_scl'], fromPin: 'LCD I2C Port', toPin: 'Arduino SDA / SCL', engineeringTip: 'Displays distance in cm and current azimuth scan angle at 20 Hz update rate.' },
    ],
  },

  // --------------------------------------------------------------------------
  // EXPERIMENT 3: Dual IR Reflective Array Line-Following Robot (TCRT5000 + L298N)
  // --------------------------------------------------------------------------
  exp_ir_line_follower: {
    experimentId: 'exp_ir_line_follower',
    title: 'Dual IR Reflective Array Line-Following Robot',
    arduinoPosition: { x: 80, y: 320 },
    breadboardPosition: { x: 460, y: 310 },
    breadboardType: 'half',
    components: [
      {
        id: 'tcrt_1',
        type: 'tcrt5000_ir',
        x: 480,
        y: 110,
        rotation: 0,
        label: 'TCRT5000 Dual IR Sensor Array',
        state: { leftReflection: 0.15, rightReflection: 0.88, lineDetected: 'left' },
      },
      {
        id: 'l298n_1',
        type: 'l298n_motor_driver',
        x: 820,
        y: 170,
        rotation: 0,
        label: 'L298N Dual H-Bridge Motor Driver',
        state: { motorLeftSpeed: 180, motorRightSpeed: 70, heatSinkTemp: 34.2 },
      },
    ],
    wires: [
      { id: 'w3_pwr_5v', fromPin: 'arduino:5V', toPin: 'bb:rail:top:red:3', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 0 },
      { id: 'w3_pwr_gnd', fromPin: 'arduino:GND1', toPin: 'bb:rail:top:blue:3', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 0 },
      // TCRT5000 VCC/GND
      { id: 'w3_ir_vcc', fromPin: 'ir:VCC', toPin: 'bb:rail:top:red:7', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 1 },
      { id: 'w3_ir_gnd', fromPin: 'ir:GND', toPin: 'bb:rail:top:blue:7', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 1 },
      // TCRT5000 D0 Left -> D2, D0 Right -> D3
      { id: 'w3_ir_left', fromPin: 'ir:D0', toPin: 'arduino:D2', color: '#eab308', wireType: 'signal', isConnected: true, stepIndex: 2, label: 'IR Left → Pin 2', slack: -30 },
      { id: 'w3_ir_right', fromPin: 'ir:A0', toPin: 'arduino:D3', color: '#22c55e', wireType: 'signal', isConnected: true, stepIndex: 2, label: 'IR Right → Pin 3', slack: -35 },
      // L298N Motor Driver Control Lines: IN1(4), IN2(5), IN3(6), IN4(7), ENA(9), ENB(10)
      { id: 'w3_l298n_in1', fromPin: 'l298n:IN1', toPin: 'arduino:D4', color: '#3b82f6', wireType: 'signal', isConnected: true, stepIndex: 3, label: 'IN1 → D4', slack: -40 },
      { id: 'w3_l298n_in2', fromPin: 'l298n:IN2', toPin: 'arduino:D5', color: '#3b82f6', wireType: 'signal', isConnected: true, stepIndex: 3, label: 'IN2 → D5', slack: -45 },
      { id: 'w3_l298n_in3', fromPin: 'l298n:IN3', toPin: 'arduino:D6', color: '#3b82f6', wireType: 'signal', isConnected: true, stepIndex: 3, label: 'IN3 → D6', slack: -50 },
      { id: 'w3_l298n_in4', fromPin: 'l298n:IN4', toPin: 'arduino:D7', color: '#3b82f6', wireType: 'signal', isConnected: true, stepIndex: 3, label: 'IN4 → D7', slack: -55 },
      { id: 'w3_l298n_ena', fromPin: 'l298n:ENA', toPin: 'arduino:D9', color: '#f97316', wireType: 'pwm', isConnected: true, stepIndex: 4, label: 'ENA (PWM) → D9', slack: -40 },
      { id: 'w3_l298n_enb', fromPin: 'l298n:ENB', toPin: 'arduino:D10', color: '#a855f7', wireType: 'pwm', isConnected: true, stepIndex: 4, label: 'ENB (PWM) → D10', slack: -45 },
      { id: 'w3_l298n_gnd', fromPin: 'l298n:GND', toPin: 'bb:rail:top:blue:15', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 5, label: 'L298N Common Ground' },
    ],
    wiringSteps: [
      { stepIndex: 0, title: 'Step 1: System Power Bus', instruction: 'Connect Arduino 5V and GND to Breadboard top power rails.', color: '#ef4444', wireIds: ['w3_pwr_5v', 'w3_pwr_gnd'], fromPin: 'Arduino 5V / GND', toPin: 'Breadboard Power Rails', engineeringTip: 'Common ground between logic and high-power motor stages is mandatory to prevent gate floating.' },
      { stepIndex: 1, title: 'Step 2: TCRT5000 Optical Power', instruction: 'Connect VCC and GND pins of the TCRT5000 sensor board to 5V & GND rails.', color: '#ef4444', wireIds: ['w3_ir_vcc', 'w3_ir_gnd'], fromPin: 'TCRT5000', toPin: 'Power Rails', engineeringTip: 'Infrared LEDs operate at 950 nm wavelength with ~20 mA forward drive current.' },
      { stepIndex: 2, title: 'Step 3: Line Reflection Digital Inputs', instruction: 'Wire TCRT5000 Left Output to Pin D2, and Right Output to Pin D3.', color: '#eab308', wireIds: ['w3_ir_left', 'w3_ir_right'], fromPin: 'TCRT5000 D0 / A0', toPin: 'Arduino Pins D2 & D3', engineeringTip: 'LM393 comparators switch LOW when black surface absorbs IR photons, HIGH on white reflection.' },
      { stepIndex: 3, title: 'Step 4: L298N Direction Gates (H-Bridge)', instruction: 'Wire IN1 to D4, IN2 to D5, IN3 to D6, IN4 to D7.', color: '#3b82f6', wireIds: ['w3_l298n_in1', 'w3_l298n_in2', 'w3_l298n_in3', 'w3_l298n_in4'], fromPin: 'L298N IN1-IN4', toPin: 'Arduino Pins D4-D7', engineeringTip: 'Configures bipolar bridge transistors for Forward, Reverse, or Dynamic Braking modes.' },
      { stepIndex: 4, title: 'Step 5: Motor PWM Speed Enable (ENA / ENB)', instruction: 'Connect ENA to Pin 9 (PWM) and ENB to Pin 10 (PWM).', color: '#f97316', wireIds: ['w3_l298n_ena', 'w3_l298n_enb'], fromPin: 'L298N ENA / ENB', toPin: 'Arduino PWM Pins 9 & 10', engineeringTip: 'Removing the hardware jumpers allows microcontrollers to modulate motor speed via analogWrite().' },
      { stepIndex: 5, title: 'Step 6: High Current Ground Tie', instruction: 'Connect L298N power terminal GND to Arduino Common Ground.', color: '#1f2937', wireIds: ['w3_l298n_gnd'], fromPin: 'L298N GND', toPin: 'Arduino Common Ground', engineeringTip: 'CRITICAL: Floating ground causes inductive kickback spikes to fry microcontroller input stages.' },
    ],
  },

  // --------------------------------------------------------------------------
  // EXPERIMENT 4: MPU-6050 6-DOF IMU Self-Balancing Robot
  // --------------------------------------------------------------------------
  exp_mpu6050_balancing: {
    experimentId: 'exp_mpu6050_balancing',
    title: 'MPU-6050 6-DOF IMU Self-Balancing Inverted Pendulum',
    arduinoPosition: { x: 80, y: 320 },
    breadboardPosition: { x: 460, y: 310 },
    breadboardType: 'half',
    components: [
      {
        id: 'mpu_1',
        type: 'mpu6050_imu',
        x: 540,
        y: 120,
        rotation: 0,
        label: 'MPU-6050 6-DOF IMU (GY-521)',
        state: { pitch: 4.2, roll: -1.1, ax: 0.08, gz: 12.4 },
      },
      {
        id: 'l298n_bal',
        type: 'l298n_motor_driver',
        x: 820,
        y: 170,
        rotation: 0,
        label: 'Balancing Motor Driver',
        state: { motorLeftSpeed: 140, motorRightSpeed: 140 },
      },
      {
        id: 'lcd_imu',
        type: 'lcd1602_i2c',
        x: 880,
        y: 330,
        rotation: 0,
        label: '16x2 IMU Telemetry Screen',
        state: { line1: 'PITCH: +4.2° BAL', line2: 'PID OUT: 142 PWM' },
      },
    ],
    wires: [
      { id: 'w4_pwr_5v', fromPin: 'arduino:5V', toPin: 'bb:rail:top:red:4', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 0 },
      { id: 'w4_pwr_gnd', fromPin: 'arduino:GND1', toPin: 'bb:rail:top:blue:4', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 0 },
      // MPU-6050 VCC to 5V (onboard 3.3V LDO regulator on GY-521), GND to GND
      { id: 'w4_mpu_vcc', fromPin: 'mpu:VCC', toPin: 'bb:rail:top:red:10', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 1 },
      { id: 'w4_mpu_gnd', fromPin: 'mpu:GND', toPin: 'bb:rail:top:blue:10', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 1 },
      // MPU-6050 I2C lines: SCL -> SCL (A5), SDA -> SDA (A4)
      { id: 'w4_mpu_scl', fromPin: 'mpu:SCL', toPin: 'arduino:SCL', color: '#a855f7', wireType: 'i2c', isConnected: true, stepIndex: 2, label: 'MPU SCL → SCL', slack: -40 },
      { id: 'w4_mpu_sda', fromPin: 'mpu:SDA', toPin: 'arduino:SDA', color: '#f97316', wireType: 'i2c', isConnected: true, stepIndex: 2, label: 'MPU SDA → SDA', slack: -50 },
      // MPU-6050 INT to D2
      { id: 'w4_mpu_int', fromPin: 'mpu:INT', toPin: 'arduino:D2', color: '#eab308', wireType: 'signal', isConnected: true, stepIndex: 3, label: 'DMP INT → Pin 2', slack: -30 },
      // Motor driver PWM and direction
      { id: 'w4_drv_in1', fromPin: 'l298n:IN1', toPin: 'arduino:D6', color: '#3b82f6', wireType: 'signal', isConnected: true, stepIndex: 4, label: 'IN1 → D6' },
      { id: 'w4_drv_in2', fromPin: 'l298n:IN2', toPin: 'arduino:D7', color: '#3b82f6', wireType: 'signal', isConnected: true, stepIndex: 4, label: 'IN2 → D7' },
      { id: 'w4_drv_ena', fromPin: 'l298n:ENA', toPin: 'arduino:D9', color: '#3b82f6', wireType: 'pwm', isConnected: true, stepIndex: 4, label: 'ENA (PWM) → D9' },
      // LCD I2C
      { id: 'w4_lcd_sda', fromPin: 'lcd:SDA', toPin: 'arduino:SDA', color: '#f97316', wireType: 'i2c', isConnected: true, stepIndex: 5 },
      { id: 'w4_lcd_scl', fromPin: 'lcd:SCL', toPin: 'arduino:SCL', color: '#a855f7', wireType: 'i2c', isConnected: true, stepIndex: 5 },
    ],
    wiringSteps: [
      { stepIndex: 0, title: 'Step 1: Power Rails', instruction: 'Connect Arduino 5V and GND to Breadboard distribution bus.', color: '#ef4444', wireIds: ['w4_pwr_5v', 'w4_pwr_gnd'], fromPin: 'Arduino 5V / GND', toPin: 'Breadboard Rails', engineeringTip: 'Stable power is essential for IMU low-noise capacitive MEMS accelerometers.' },
      { stepIndex: 1, title: 'Step 2: GY-521 IMU Power', instruction: 'Connect MPU-6050 VCC to 5V and GND to GND.', color: '#ef4444', wireIds: ['w4_mpu_vcc', 'w4_mpu_gnd'], fromPin: 'MPU-6050 VCC / GND', toPin: 'Power Rails', engineeringTip: 'GY-521 has an onboard 662K 3.3V LDO regulator; powers the InvenSense chip safely from 5V.' },
      { stepIndex: 2, title: 'Step 3: Fast I2C Bus (400 kHz)', instruction: 'Wire SCL to Arduino SCL and SDA to Arduino SDA.', color: '#a855f7', wireIds: ['w4_mpu_scl', 'w4_mpu_sda'], fromPin: 'MPU-6050 SCL / SDA', toPin: 'Arduino SCL / SDA', engineeringTip: 'Set Wire.setClock(400000) for Fast Mode I2C to avoid loop latency jitter in PID balancing calculations.' },
      { stepIndex: 3, title: 'Step 4: DMP Data-Ready Interrupt', instruction: 'Connect MPU-6050 INT pin to Arduino Digital Pin 2 (INT0).', color: '#eab308', wireIds: ['w4_mpu_int'], fromPin: 'MPU-6050 INT', toPin: 'Arduino Pin 2', engineeringTip: 'Triggers ISR precisely at 100 Hz / 200 Hz as the onboard Digital Motion Processor (DMP) computes quaternion packets.' },
      { stepIndex: 4, title: 'Step 5: Balancing Motor PWM Stage', instruction: 'Connect Motor Driver direction lines (D6, D7) and PWM pin (D9).', color: '#3b82f6', wireIds: ['w4_drv_in1', 'w4_drv_in2', 'w4_drv_ena'], fromPin: 'Motor Driver', toPin: 'Arduino Pins 6, 7, 9', engineeringTip: 'High-frequency 31 kHz PWM modulation prevents audible coil whine and enhances torque responsiveness.' },
      { stepIndex: 5, title: 'Step 6: Attitude Telemetry LCD', instruction: 'Daisy-chain LCD SDA & SCL onto the shared I2C bus.', color: '#f97316', wireIds: ['w4_lcd_sda', 'w4_lcd_scl'], fromPin: 'LCD Screen', toPin: 'I2C Bus', engineeringTip: 'Both MPU-6050 (0x68) and PCF8574 (0x27) coexist on the same 2-wire bus with distinct addresses.' },
    ],
  },

  // --------------------------------------------------------------------------
  // EXPERIMENT 5: Dual CdS Photoresistors (LDR) Solar Tracker & Heliostat
  // --------------------------------------------------------------------------
  exp_ldr_solar_tracker: {
    experimentId: 'exp_ldr_solar_tracker',
    title: 'Dual-LDR Photoresistor Solar Tracker & Heliostat',
    arduinoPosition: { x: 80, y: 320 },
    breadboardPosition: { x: 460, y: 310 },
    breadboardType: 'half',
    components: [
      {
        id: 'ldr_tracker',
        type: 'dual_ldr_tracker',
        x: 520,
        y: 110,
        rotation: 0,
        label: 'Dual CdS Cells with 3D Shadow Divider Fin',
        state: { ldrLeftLux: 820, ldrRightLux: 340, sunAzimuth: 35, shadowOffset: -18 },
      },
      {
        id: 'servo_solar',
        type: 'servo_sg90',
        x: 770,
        y: 120,
        rotation: 0,
        label: 'Azimuth Heliostat Actuator',
        state: { angle: 125 },
      },
      {
        id: 'lcd_solar',
        type: 'lcd1602_i2c',
        x: 880,
        y: 330,
        rotation: 0,
        label: '16x2 Solar Telemetry',
        state: { line1: 'L:820 R:340 LUX', line2: 'HELIOS: 125° TRK' },
      },
    ],
    wires: [
      { id: 'w5_pwr_5v', fromPin: 'arduino:5V', toPin: 'bb:rail:top:red:4', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 0 },
      { id: 'w5_pwr_gnd', fromPin: 'arduino:GND1', toPin: 'bb:rail:top:blue:4', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 0 },
      // LDR Voltage Divider VCC & GND
      { id: 'w5_ldr_vcc', fromPin: 'ldr:VCC', toPin: 'bb:rail:top:red:10', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 1 },
      { id: 'w5_ldr_gnd', fromPin: 'ldr:GND', toPin: 'bb:rail:top:blue:10', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 1 },
      // LDR Analog Voltage Out to A0 and A1
      { id: 'w5_ldr_a0', fromPin: 'ldr:OUT_L', toPin: 'arduino:A0', color: '#22c55e', wireType: 'analog', isConnected: true, stepIndex: 2, label: 'LDR Left → Pin A0', slack: 30 },
      { id: 'w5_ldr_a1', fromPin: 'ldr:OUT_R', toPin: 'arduino:A1', color: '#eab308', wireType: 'analog', isConnected: true, stepIndex: 2, label: 'LDR Right → Pin A1', slack: 35 },
      // Servo PWM to D9
      { id: 'w5_servo_vcc', fromPin: 'servo:VCC', toPin: 'bb:rail:top:red:20', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 3 },
      { id: 'w5_servo_gnd', fromPin: 'servo:GND', toPin: 'bb:rail:top:blue:20', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 3 },
      { id: 'w5_servo_pwm', fromPin: 'servo:PWM', toPin: 'arduino:D9', color: '#3b82f6', wireType: 'pwm', isConnected: true, stepIndex: 3, label: 'Servo PWM → D9', slack: -40 },
      // LCD
      { id: 'w5_lcd_sda', fromPin: 'lcd:SDA', toPin: 'arduino:SDA', color: '#f97316', wireType: 'i2c', isConnected: true, stepIndex: 4 },
      { id: 'w5_lcd_scl', fromPin: 'lcd:SCL', toPin: 'arduino:SCL', color: '#a855f7', wireType: 'i2c', isConnected: true, stepIndex: 4 },
    ],
    wiringSteps: [
      { stepIndex: 0, title: 'Step 1: Power Bus', instruction: 'Connect 5V and GND from Arduino to Breadboard.', color: '#ef4444', wireIds: ['w5_pwr_5v', 'w5_pwr_gnd'], fromPin: 'Arduino 5V / GND', toPin: 'Breadboard Rails', engineeringTip: '5V rail serves as ADC reference voltage; ensure low ripple.' },
      { stepIndex: 1, title: 'Step 2: Dual LDR Voltage Divider Grid', instruction: 'Connect 10 kΩ pull-down resistors from LDR pins to GND, and LDR top pins to 5V.', color: '#ef4444', wireIds: ['w5_ldr_vcc', 'w5_ldr_gnd'], fromPin: '5V / GND Rails', toPin: 'LDR Divider Junctions', engineeringTip: 'Vout = 5V × (R_pull / (R_LDR + R_pull)). Resistance drops from 500kΩ in dark to 1kΩ in bright sun.' },
      { stepIndex: 2, title: 'Step 3: Dual Analog Sensing Lines', instruction: 'Connect Left LDR junction to Pin A0, Right LDR junction to Pin A1.', color: '#22c55e', wireIds: ['w5_ldr_a0', 'w5_ldr_a1'], fromPin: 'LDR Junctions', toPin: 'Arduino Pins A0 & A1', engineeringTip: '10-bit ATmega328P ADC digitizes optical photon differential with 4.88 mV resolution.' },
      { stepIndex: 3, title: 'Step 4: Heliostat Actuator Servo', instruction: 'Connect SG90 servo VCC, GND, and PWM control to Pin D9.', color: '#3b82f6', wireIds: ['w5_servo_vcc', 'w5_servo_gnd', 'w5_servo_pwm'], fromPin: 'Servo SG90', toPin: 'Arduino Pin D9', engineeringTip: 'Proportional controller drives servo angle to equalize photon flux: ΔV = V_left - V_right → 0.' },
      { stepIndex: 4, title: 'Step 5: Sun Telemetry Display', instruction: 'Connect LCD I2C lines to display real-time lux differential.', color: '#f97316', wireIds: ['w5_lcd_sda', 'w5_lcd_scl'], fromPin: 'LCD I2C', toPin: 'Arduino SDA / SCL', engineeringTip: 'Shows active solar tracking error angle and illumination balance.' },
    ],
  },

  // --------------------------------------------------------------------------
  // EXPERIMENT 6: Rotary Quadrature Optical Encoder & Closed-Loop Motor PID
  // --------------------------------------------------------------------------
  exp_encoder_motor_pid: {
    experimentId: 'exp_encoder_motor_pid',
    title: 'Rotary Quadrature Encoder & Closed-Loop Motor Speed Control',
    arduinoPosition: { x: 80, y: 320 },
    breadboardPosition: { x: 460, y: 310 },
    breadboardType: 'half',
    components: [
      {
        id: 'encoder_motor',
        type: 'optical_encoder_motor',
        x: 520,
        y: 110,
        rotation: 0,
        label: 'Slotted Disc Motor with Optical Interrupter Photogate',
        state: { currentRpm: 1850, targetRpm: 1800, pidPwm: 184, phaseA: true, phaseB: false },
      },
      {
        id: 'l298n_enc',
        type: 'l298n_motor_driver',
        x: 820,
        y: 170,
        rotation: 0,
        label: 'L298N High-Current Driver',
        state: { motorSpeed: 184 },
      },
      {
        id: 'lcd_enc',
        type: 'lcd1602_i2c',
        x: 880,
        y: 330,
        rotation: 0,
        label: '16x2 Tachometer PID Display',
        state: { line1: 'RPM:1850 SET:1800', line2: 'PID PWM: 184 (72%)' },
      },
    ],
    wires: [
      { id: 'w6_pwr_5v', fromPin: 'arduino:5V', toPin: 'bb:rail:top:red:4', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 0 },
      { id: 'w6_pwr_gnd', fromPin: 'arduino:GND1', toPin: 'bb:rail:top:blue:4', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 0 },
      // Optical Encoder Power
      { id: 'w6_enc_vcc', fromPin: 'encoder:VCC', toPin: 'bb:rail:top:red:10', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 1 },
      { id: 'w6_enc_gnd', fromPin: 'encoder:GND', toPin: 'bb:rail:top:blue:10', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 1 },
      // Optical Encoder Phase A -> D2 (Interrupt INT0), Phase B -> D3 (Interrupt INT1)
      { id: 'w6_enc_a', fromPin: 'encoder:SIG_A', toPin: 'arduino:D2', color: '#eab308', wireType: 'signal', isConnected: true, stepIndex: 2, label: 'Phase A → Pin 2 (INT0)', slack: -35 },
      { id: 'w6_enc_b', fromPin: 'encoder:SIG_B', toPin: 'arduino:D3', color: '#22c55e', wireType: 'signal', isConnected: true, stepIndex: 2, label: 'Phase B → Pin 3 (INT1)', slack: -40 },
      // Motor Driver PWM to D9
      { id: 'w6_mot_pwm', fromPin: 'l298n:ENA', toPin: 'arduino:D9', color: '#3b82f6', wireType: 'pwm', isConnected: true, stepIndex: 3, label: 'Motor PWM → D9', slack: -30 },
      { id: 'w6_mot_dir', fromPin: 'l298n:IN1', toPin: 'arduino:D8', color: '#3b82f6', wireType: 'signal', isConnected: true, stepIndex: 3, label: 'Motor DIR → D8', slack: -35 },
      // LCD
      { id: 'w6_lcd_sda', fromPin: 'lcd:SDA', toPin: 'arduino:SDA', color: '#f97316', wireType: 'i2c', isConnected: true, stepIndex: 4 },
      { id: 'w6_lcd_scl', fromPin: 'lcd:SCL', toPin: 'arduino:SCL', color: '#a855f7', wireType: 'i2c', isConnected: true, stepIndex: 4 },
    ],
    wiringSteps: [
      { stepIndex: 0, title: 'Step 1: Power Backbone', instruction: 'Connect 5V and GND to Breadboard rails.', color: '#ef4444', wireIds: ['w6_pwr_5v', 'w6_pwr_gnd'], fromPin: 'Arduino 5V / GND', toPin: 'Breadboard Rails', engineeringTip: 'Optical emitter infrared LEDs need stable DC current to prevent pulse jitter.' },
      { stepIndex: 1, title: 'Step 2: Optical Photogate Power', instruction: 'Connect optical encoder breakout VCC to 5V and GND to GND.', color: '#ef4444', wireIds: ['w6_enc_vcc', 'w6_enc_gnd'], fromPin: 'Encoder VCC / GND', toPin: 'Power Rails', engineeringTip: 'Uses infrared phototransistor with internal Schmitt trigger for crisp square wave edges.' },
      { stepIndex: 2, title: 'Step 3: Quadrature Phase A & B Interrupts', instruction: 'Wire Phase A to Pin 2 and Phase B to Pin 3.', color: '#eab308', wireIds: ['w6_enc_a', 'w6_enc_b'], fromPin: 'Encoder Phase A & B', toPin: 'Arduino Pins 2 & 3', engineeringTip: 'Phase B lagging Phase A by 90° reveals rotational direction; state transitions yield 4x resolution.' },
      { stepIndex: 3, title: 'Step 4: Motor Drive PWM Output', instruction: 'Wire Arduino Pin 9 to L298N ENA and Pin 8 to IN1.', color: '#3b82f6', wireIds: ['w6_mot_pwm', 'w6_mot_dir'], fromPin: 'Arduino Pins 8 & 9', toPin: 'L298N Motor Terminals', engineeringTip: 'Firmware executes Discrete PID algorithm: u(t) = Kp·e + Ki·∫e + Kd·de/dt at 50 Hz sample rate.' },
      { stepIndex: 4, title: 'Step 5: Telemetry Display', instruction: 'Connect LCD I2C to show measured RPM vs target setpoint.', color: '#f97316', wireIds: ['w6_lcd_sda', 'w6_lcd_scl'], fromPin: 'LCD I2C', toPin: 'Arduino SDA / SCL', engineeringTip: 'Real-time readout of velocity error and control effort percentage.' },
    ],
  },

  // --------------------------------------------------------------------------
  // EXPERIMENT 7: Hall Effect Magnetic Tachometer & Limit Switch
  // --------------------------------------------------------------------------
  exp_hall_effect_tachometer: {
    experimentId: 'exp_hall_effect_tachometer',
    title: 'Hall Effect Magnetic Tachometer & Limit Switch',
    arduinoPosition: { x: 80, y: 320 },
    breadboardPosition: { x: 460, y: 310 },
    breadboardType: 'half',
    components: [
      {
        id: 'hall_1',
        type: 'hall_effect_sensor',
        x: 520,
        y: 110,
        rotation: 0,
        label: 'A3144 Hall Effect Sensor with Flywheel Neodymium Magnet',
        state: { magneticFieldGauss: 480, triggered: true, rpm: 1420 },
      },
      {
        id: 'buzzer_hall',
        type: 'piezo_buzzer',
        x: 770,
        y: 160,
        rotation: 0,
        label: 'RPM Acoustic Clicker',
        state: { active: false },
      },
      {
        id: 'lcd_hall',
        type: 'lcd1602_i2c',
        x: 880,
        y: 330,
        rotation: 0,
        label: '16x2 Magnetic Tachometer',
        state: { line1: 'MAG: DETECT 480G', line2: 'TACH: 1420 RPM' },
      },
    ],
    wires: [
      { id: 'w7_pwr_5v', fromPin: 'arduino:5V', toPin: 'bb:rail:top:red:4', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 0 },
      { id: 'w7_pwr_gnd', fromPin: 'arduino:GND1', toPin: 'bb:rail:top:blue:4', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 0 },
      // Hall A3144: VCC, GND, OUT (with 10k pull-up to 5V)
      { id: 'w7_hall_vcc', fromPin: 'hall:VCC', toPin: 'bb:rail:top:red:12', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 1 },
      { id: 'w7_hall_gnd', fromPin: 'hall:GND', toPin: 'bb:rail:top:blue:12', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 1 },
      // Hall OUT -> Pin 2
      { id: 'w7_hall_out', fromPin: 'hall:OUT', toPin: 'arduino:D2', color: '#eab308', wireType: 'signal', isConnected: true, stepIndex: 2, label: 'Hall OUT → Pin 2', slack: -30 },
      // Buzzer
      { id: 'w7_buzz_pos', fromPin: 'buzzer:POS', toPin: 'arduino:D8', color: '#10b981', wireType: 'signal', isConnected: true, stepIndex: 3 },
      { id: 'w7_buzz_neg', fromPin: 'buzzer:NEG', toPin: 'bb:rail:top:blue:18', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 3 },
      // LCD
      { id: 'w7_lcd_sda', fromPin: 'lcd:SDA', toPin: 'arduino:SDA', color: '#f97316', wireType: 'i2c', isConnected: true, stepIndex: 4 },
      { id: 'w7_lcd_scl', fromPin: 'lcd:SCL', toPin: 'arduino:SCL', color: '#a855f7', wireType: 'i2c', isConnected: true, stepIndex: 4 },
    ],
    wiringSteps: [
      { stepIndex: 0, title: 'Step 1: Power Backbone', instruction: 'Connect 5V and GND to breadboard rails.', color: '#ef4444', wireIds: ['w7_pwr_5v', 'w7_pwr_gnd'], fromPin: 'Arduino 5V / GND', toPin: 'Breadboard Rails', engineeringTip: 'Standard regulated 5V power bus.' },
      { stepIndex: 1, title: 'Step 2: A3144 Hall Transducer Power & Pullup', instruction: 'Connect A3144 VCC to 5V and GND to GND with a 10 kΩ pull-up resistor on OUT.', color: '#ef4444', wireIds: ['w7_hall_vcc', 'w7_hall_gnd'], fromPin: 'A3144 VCC / GND', toPin: 'Power Rails', engineeringTip: 'A3144 has open-collector output; external or INPUT_PULLUP resistor is strictly required.' },
      { stepIndex: 2, title: 'Step 3: Magnetic Revolution Interrupt Pin', instruction: 'Connect Hall OUT to Arduino Pin 2 (INT0).', color: '#eab308', wireIds: ['w7_hall_out'], fromPin: 'Hall OUT', toPin: 'Arduino Pin 2', engineeringTip: 'Lorentz force F = q(v × B) pushes electrons sideways, dropping output to 0V when South pole passes.' },
      { stepIndex: 3, title: 'Step 4: Revolution Acoustic Feedback', instruction: 'Wire Piezo Buzzer to Digital Pin 8 for audio ticks.', color: '#10b981', wireIds: ['w7_buzz_pos', 'w7_buzz_neg'], fromPin: 'Buzzer', toPin: 'Arduino Pin 8', engineeringTip: 'Generates short 5 ms clicks on each flywheel rotation event.' },
      { stepIndex: 4, title: 'Step 5: Tachometer LCD Telemetry', instruction: 'Wire LCD I2C to display calculated RPM and Gauss state.', color: '#f97316', wireIds: ['w7_lcd_sda', 'w7_lcd_scl'], fromPin: 'LCD I2C', toPin: 'Arduino SDA / SCL', engineeringTip: 'Calculates RPM: 60,000,000 / Δt_microseconds per revolution.' },
    ],
  },

  // --------------------------------------------------------------------------
  // EXPERIMENT 8: Load Cell Strain Gauge Wheatstone Bridge & Delicate Egg Gripper
  // --------------------------------------------------------------------------
  exp_loadcell_smart_gripper: {
    experimentId: 'exp_loadcell_smart_gripper',
    title: 'Load Cell Strain Gauge Wheatstone Bridge & Force Gripper',
    arduinoPosition: { x: 80, y: 320 },
    breadboardPosition: { x: 460, y: 310 },
    breadboardType: 'half',
    components: [
      {
        id: 'hx711_loadcell',
        type: 'loadcell_hx711_gripper',
        x: 520,
        y: 110,
        rotation: 0,
        label: 'Aluminum Shear Beam Load Cell + HX711 24-bit ADC + Egg Gripper',
        state: { forceGrams: 42.8, rawAdc: 184502, eggSafe: true, tared: false },
      },
      {
        id: 'servo_grip',
        type: 'servo_sg90',
        x: 770,
        y: 120,
        rotation: 0,
        label: 'Smart Gripper Actuator',
        state: { angle: 65 },
      },
      {
        id: 'lcd_grip',
        type: 'lcd1602_i2c',
        x: 880,
        y: 330,
        rotation: 0,
        label: '16x2 Precision Scales Telemetry',
        state: { line1: 'FORCE: 42.8 g SAFE', line2: 'GRIP: 65° (420 mN)' },
      },
      {
        id: 'buzzer_grip',
        type: 'piezo_buzzer',
        x: 770,
        y: 200,
        rotation: 0,
        label: 'Excess Force Overload Alarm',
        state: { active: false },
      },
    ],
    wires: [
      { id: 'w8_pwr_5v', fromPin: 'arduino:5V', toPin: 'bb:rail:top:red:4', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 0 },
      { id: 'w8_pwr_gnd', fromPin: 'arduino:GND1', toPin: 'bb:rail:top:blue:4', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 0 },
      // HX711 VCC & GND
      { id: 'w8_hx_vcc', fromPin: 'hx711:VCC', toPin: 'bb:rail:top:red:14', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 1 },
      { id: 'w8_hx_gnd', fromPin: 'hx711:GND', toPin: 'bb:rail:top:blue:14', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 1 },
      // HX711 Serial Data DT -> Pin 3, Serial Clock SCK -> Pin 2
      { id: 'w8_hx_dt', fromPin: 'hx711:DT', toPin: 'arduino:D3', color: '#eab308', wireType: 'signal', isConnected: true, stepIndex: 2, label: 'HX711 DT → Pin 3', slack: -35 },
      { id: 'w8_hx_sck', fromPin: 'hx711:SCK', toPin: 'arduino:D2', color: '#22c55e', wireType: 'signal', isConnected: true, stepIndex: 2, label: 'HX711 SCK → Pin 2', slack: -40 },
      // Gripper Servo
      { id: 'w8_servo_vcc', fromPin: 'servo:VCC', toPin: 'bb:rail:top:red:22', color: '#ef4444', wireType: 'power', isConnected: true, stepIndex: 3 },
      { id: 'w8_servo_gnd', fromPin: 'servo:GND', toPin: 'bb:rail:top:blue:22', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 3 },
      { id: 'w8_servo_pwm', fromPin: 'servo:PWM', toPin: 'arduino:D9', color: '#3b82f6', wireType: 'pwm', isConnected: true, stepIndex: 3, label: 'Servo PWM → D9', slack: -45 },
      // Buzzer
      { id: 'w8_buzz_pos', fromPin: 'buzzer:POS', toPin: 'arduino:D8', color: '#10b981', wireType: 'signal', isConnected: true, stepIndex: 4 },
      { id: 'w8_buzz_neg', fromPin: 'buzzer:NEG', toPin: 'bb:rail:top:blue:24', color: '#1f2937', wireType: 'ground', isConnected: true, stepIndex: 4 },
      // LCD
      { id: 'w8_lcd_sda', fromPin: 'lcd:SDA', toPin: 'arduino:SDA', color: '#f97316', wireType: 'i2c', isConnected: true, stepIndex: 5 },
      { id: 'w8_lcd_scl', fromPin: 'lcd:SCL', toPin: 'arduino:SCL', color: '#a855f7', wireType: 'i2c', isConnected: true, stepIndex: 5 },
    ],
    wiringSteps: [
      { stepIndex: 0, title: 'Step 1: Low-Noise Power Rails', instruction: 'Connect 5V and GND from Arduino to Breadboard.', color: '#ef4444', wireIds: ['w8_pwr_5v', 'w8_pwr_gnd'], fromPin: 'Arduino 5V / GND', toPin: 'Breadboard Rails', engineeringTip: 'Differential strain gauges measure microvolt signals; keep ground routing star-connected.' },
      { stepIndex: 1, title: 'Step 2: HX711 Instrumentation ADC Power', instruction: 'Connect HX711 VCC to 5V and GND to GND.', color: '#ef4444', wireIds: ['w8_hx_vcc', 'w8_hx_gnd'], fromPin: 'HX711 VCC / GND', toPin: 'Power Rails', engineeringTip: 'HX711 includes an internal low-noise analog voltage regulator for Wheatstone excitation.' },
      { stepIndex: 2, title: 'Step 3: 24-Bit Serial Synchronous Data Interface', instruction: 'Connect HX711 DT (Data) to Pin 3 and SCK (Clock) to Pin 2.', color: '#eab308', wireIds: ['w8_hx_dt', 'w8_hx_sck'], fromPin: 'HX711 DT / SCK', toPin: 'Arduino Pins 2 & 3', engineeringTip: 'Pulsing SCK 24 times shifts out 24-bit 2’s complement value; 25th pulse selects Channel A 128x gain.' },
      { stepIndex: 3, title: 'Step 4: Smart Gripper Actuator', instruction: 'Connect SG90 gripper servo to 5V, GND, and Pin 9 (PWM).', color: '#3b82f6', wireIds: ['w8_servo_vcc', 'w8_servo_gnd', 'w8_servo_pwm'], fromPin: 'Servo SG90', toPin: 'Arduino Pin 9', engineeringTip: 'Closed-loop compliance loop stops servo closing immediately when target force threshold (50g) is met.' },
      { stepIndex: 4, title: 'Step 5: Shell Fracture Protection Alarm', instruction: 'Connect Piezo Buzzer to Digital Pin 8 for overload alert.', color: '#10b981', wireIds: ['w8_buzz_pos', 'w8_buzz_neg'], fromPin: 'Buzzer', toPin: 'Arduino Pin 8', engineeringTip: 'Sounds emergency alert if measured force exceeds eggshell fracture point (>85g).' },
      { stepIndex: 5, title: 'Step 6: Force Metric LCD Display', instruction: 'Connect LCD I2C to show mass in grams and gripper angle in real-time.', color: '#f97316', wireIds: ['w8_lcd_sda', 'w8_lcd_scl'], fromPin: 'LCD I2C', toPin: 'Arduino SDA / SCL', engineeringTip: 'Displays calibration tare status and live compressive force in grams and millinewtons.' },
    ],
  },
};
