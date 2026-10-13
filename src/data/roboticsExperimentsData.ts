/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Robotics & Physical Computing Experiments Dataset:
 * Maps the 8 canonical robotics hardware experiments from first-principles
 * physical transduction (pyroelectricity, piezoelectricity, Lorentz force, Wheatstone bridge)
 * to real-time microcontroller state machines, circuit schematics, and Arduino C++ firmware.
 */

export interface ComponentPinout {
  name: string;
  type: 'sensor' | 'actuator' | 'passive' | 'ic';
  pinConnection: string;
  notes?: string;
}

export interface HardwareTrap {
  trap: string;
  physicalReason: string;
  solution: string;
}

export interface OscilloscopeChannel {
  id: string;
  name: string;
  color: string;
  unit: string;
  rangeMin: number;
  rangeMax: number;
  description: string;
}

export interface RoboticsExperiment {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  category: 'transducers_actuators' | 'autonomous_navigation' | 'inertial_control' | 'precision_force';
  categoryLabel: string;
  iconName: string;
  tagline: string;
  transducerType: string;
  actuatorType: string;
  physics: {
    governingLaw: string;
    equation: string;
    equationExplanation: string;
    physicalTransduction: string;
  };
  wiring: {
    microcontroller: string;
    components: ComponentPinout[];
    schematicSummary: string;
    powerRequirements: string;
  };
  hardwareTraps: HardwareTrap[];
  oscilloscopeChannels: OscilloscopeChannel[];
  arduinoCode: string;
  socraticQuestions: {
    question: string;
    answer: string;
  }[];
}

export const ROBOTICS_EXPERIMENTS: RoboticsExperiment[] = [
  // 1. PIR + SERVO GATE + BUZZER
  {
    id: 'exp_pir_servo_buzzer',
    order: 1,
    title: 'Passive Infrared (PIR) Security Gate & Chime',
    subtitle: 'Thermal blackbody radiation to differential pyroelectric charge, driving PWM servo latch and piezo chime.',
    category: 'transducers_actuators',
    categoryLabel: 'Transducers & Actuators',
    iconName: 'Flame',
    tagline: 'Sense invisible human thermal photons (9.4 µm) to actuate mechanical doors and auditory alerts.',
    transducerType: 'Dual-Slot Pyroelectric Crystal (LiTaO₃) + Silicon Optical Filter Window',
    actuatorType: 'Micro Servo Motor (SG90, 50Hz PWM) + Piezoelectric Buzzer',
    physics: {
      governingLaw: 'Wien’s Displacement Law & Pyroelectric Displacement Current',
      equation: '\\lambda_{\\text{peak}} = \\frac{b}{T} \\approx 9.4\\ \\mu\\text{m}, \\quad I = A \\gamma \\frac{dT}{dt}',
      equationExplanation:
        'Human skin at 307 K radiates thermal infrared peaking at 9.4 µm. Crossing faceted Fresnel lens beams creates a rapid temperature change (dT/dt) across dual pyroelectric crystals, squeezing out a displacement current amplified into a 5V digital HIGH pulse.',
      physicalTransduction:
        'Infrared photons → Black coating absorption → Crystal lattice thermal expansion → Internal electric dipole jiggle → Unpinned surface electron surge → JFET buffer amplification → Digital HIGH.',
    },
    wiring: {
      microcontroller: 'Arduino Uno R3 (ATmega328P)',
      components: [
        { name: 'HC-SR501 PIR Sensor', type: 'sensor', pinConnection: 'VCC → 5V, GND → GND, OUT → Digital Pin 2' },
        { name: 'SG90 Micro Servo', type: 'actuator', pinConnection: 'VCC → External 5V, GND → Common GND, PWM → Digital Pin 9' },
        { name: 'Active/Passive Buzzer', type: 'actuator', pinConnection: 'Positive → Digital Pin 8, Negative → GND' },
        { name: 'Decoupling Capacitor', type: 'passive', pinConnection: '100 µF across Servo VCC and GND', notes: 'Buffers voltage sags' },
      ],
      schematicSummary:
        'PIR sensor Digital Pin 2 acts as interrupt-capable trigger. Servo driven via 50 Hz PWM on Pin 9. Piezo buzzer driven via tone() on Pin 8.',
      powerRequirements: 'PIR consumes ~50 µA idle; SG90 servo draws up to 500 mA stall current (requires separate external 5V rail).',
    },
    hardwareTraps: [
      {
        trap: 'Brownout Reset & Endless False Trigger Loop',
        physicalReason:
          'When the servo turns on, its DC motor coils draw ~500 mA spike. If powered directly from Arduino 5V pin, the rail sags below 4.2V, causing PIR op-amp to misread voltage drop as thermal movement.',
        solution: 'Power the servo from an external 5V power supply with a shared common ground, and put a 100 µF electrolytic capacitor across power rails.',
      },
      {
        trap: 'No Detection When Human Sits Still',
        physicalReason:
          'Pyroelectric crystals only generate current when dT/dt ≠ 0. Constant temperature produces zero displacement current.',
        solution: 'Use PIR for entry/motion detection; use optical ToF or ultrasonic sensors for static presence verification.',
      },
    ],
    oscilloscopeChannels: [
      { id: 'ch_pir', name: 'PIR Output (Pin 2)', color: '#38bdf8', unit: 'V', rangeMin: 0, rangeMax: 5, description: 'Digital pulse: 0V idle, 3.3V/5V on thermal motion' },
      { id: 'ch_servo', name: 'Servo PWM (Pin 9)', color: '#f59e0b', unit: 'V', rangeMin: 0, rangeMax: 5, description: '50Hz PWM pulse train: 1.0ms (0°) to 2.0ms (90°)' },
      { id: 'ch_buzzer', name: 'Buzzer Audio (Pin 8)', color: '#10b981', unit: 'V', rangeMin: 0, rangeMax: 5, description: '1 kHz square wave oscillation' },
    ],
    arduinoCode: `// ====================================================================
// PIR Sensor + Servo Gate + Buzzer Autonomous Entrance System
// ====================================================================
#include <Servo.h>

const int PIR_PIN = 2;       // Digital Input from PIR Out
const int BUZZER_PIN = 8;    // Output to Piezo Buzzer
const int SERVO_PIN = 9;     // 50Hz PWM Output to Servo Motor

Servo gateServo;
bool isGateOpen = false;
unsigned long motionTime = 0;
const unsigned long GATE_HOLD_MS = 4000; // Hold gate open for 4 seconds

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  gateServo.attach(SERVO_PIN);
  gateServo.write(0);        // Initial state: Gate closed at 0 degrees

  Serial.begin(115200);
  Serial.println("PIR Security Gate Initialized. Calibrating sensor...");
  delay(2000); // Allow PIR sensor to stabilize thermal baseline
}

void loop() {
  int motionDetected = digitalRead(PIR_PIN);

  if (motionDetected == HIGH) {
    motionTime = millis();
    
    if (!isGateOpen) {
      Serial.println("Motion Detected! Sounding chime & opening gate.");
      // 1. Play Welcome Chime
      tone(BUZZER_PIN, 1046, 120); // High C6 tone
      delay(140);
      tone(BUZZER_PIN, 1318, 200); // E6 tone
      
      // 2. Open Gate (0 deg -> 90 deg)
      gateServo.write(90);
      isGateOpen = true;
    }
  }

  // Auto-close gate after timeout with no motion
  if (isGateOpen && (millis() - motionTime > GATE_HOLD_MS)) {
    Serial.println("Timeout elapsed. Closing gate.");
    tone(BUZZER_PIN, 523, 100); // Low C5 closing notification
    gateServo.write(0);          // Return gate to closed
    isGateOpen = false;
  }
}`,
    socraticQuestions: [
      {
        question: 'Why does holding a clear sheet of glass block the PIR sensor, but not a digital camera?',
        answer: 'Ordinary silicate glass is transparent to visible light (0.4–0.7 µm) but absorbs long-wave thermal infrared (8–14 µm) almost 100%, acting as an opaque thermal shield.',
      },
      {
        question: 'Why does moving a giant block of ice past a warm wall trigger the PIR sensor?',
        answer: 'The sensor measures differential thermal contrast: Slot A cooling down while Slot B remains warm generates an inverted negative voltage pulse, which triggers the comparator just like heat.',
      },
    ],
  },

  // 2. ULTRASONIC HC-SR04 RADAR SWEEP
  {
    id: 'exp_ultrasonic_radar',
    order: 2,
    title: 'Acoustic Ultrasonic Time-of-Flight Radar Scanner',
    subtitle: 'Piezoelectric 40 kHz acoustic burst time-of-flight with 180° servo radar sweeping.',
    category: 'transducers_actuators',
    categoryLabel: 'Transducers & Actuators',
    iconName: 'Radar',
    tagline: 'Emit high-frequency acoustic waves and calculate distance from microsecond round-trip echoes.',
    transducerType: 'Piezoelectric Ceramic Ultrasonic Transducer (40 kHz Transmitter & Receiver)',
    actuatorType: 'Micro Servo (SG90 180° continuous sweeping arm)',
    physics: {
      governingLaw: 'Acoustic Speed of Sound & Time-of-Flight (ToF)',
      equation: 'd = \\frac{v_{\\text{sound}} \\cdot \\Delta t}{2}, \\quad v_{\\text{sound}} \\approx 331.3 + 0.606 \\cdot T_{^\\circ\\text{C}} \\text{ m/s}',
      equationExplanation:
        'At 20°C, sound propagates through air at 343.4 m/s (29.1 µs/cm). Emitting an 8-cycle 40 kHz acoustic ping and measuring the time Δt until the reflected echo strikes the receiver transducer gives target distance d with millimeter precision.',
      physicalTransduction:
        'Electrical 10 µs pulse → Piezo ceramic expands/contracts → 40 kHz air pressure waves → Bounce off obstacle → Reflected pressure waves deform receiver piezo crystal → Microvolt electrical charge generated.',
    },
    wiring: {
      microcontroller: 'Arduino Uno R3 (ATmega328P)',
      components: [
        { name: 'HC-SR04 Ultrasonic Sensor', type: 'sensor', pinConnection: 'VCC → 5V, GND → GND, Trig → Pin 11, Echo → Pin 12' },
        { name: 'SG90 Radar Servo', type: 'actuator', pinConnection: 'VCC → 5V, GND → GND, PWM → Pin 10' },
        { name: 'Status Indicator LED', type: 'passive', pinConnection: 'Pin 13 → 220Ω Resistor → Anode, Cathode → GND' },
      ],
      schematicSummary:
        'Trig pin pulsed for 10 µs; Echo pin outputs a high pulse whose duration in microseconds equals round-trip travel time. Servo steps 0° to 180° in 1° increments.',
      powerRequirements: 'HC-SR04 draws 15 mA active during 40 kHz burst; Servo draws ~200-400 mA while panning.',
    },
    hardwareTraps: [
      {
        trap: 'Acoustic Specular Reflection at Angles > 45°',
        physicalReason:
          'If an obstacle is slanted relative to the acoustic wavefront, sound waves bounce away like light off a flat mirror instead of reflecting back to the receiver, causing infinite timeout readings.',
        solution: 'Fuse ultrasonic sensing with infrared optical proximity or pan the sensor through multiple angles to catch normal reflections.',
      },
      {
        trap: 'Temperature Error in Distance Calculations',
        physicalReason:
          'The speed of sound changes by ~0.6 m/s per °C. Between winter (0°C, 331 m/s) and summer (35°C, 352 m/s), distance calculation shifts by over 6%.',
        solution: 'Incorporate a DHT22/BMP280 temperature sensor to dynamically recalculate the speed of sound in firmware.',
      },
    ],
    oscilloscopeChannels: [
      { id: 'ch_trig', name: 'Trigger Pulse (Pin 11)', color: '#38bdf8', unit: 'V', rangeMin: 0, rangeMax: 5, description: '10 µs trigger initiate pulse' },
      { id: 'ch_echo', name: 'Echo Pulse (Pin 12)', color: '#10b981', unit: 'V', rangeMin: 0, rangeMax: 5, description: 'Pulse width proportional to distance (58 µs per cm)' },
      { id: 'ch_angle', name: 'Servo Angle (Pin 10)', color: '#f59e0b', unit: 'Deg', rangeMin: 0, rangeMax: 180, description: 'Continuous angular radar pan' },
    ],
    arduinoCode: `// ====================================================================
// HC-SR04 Ultrasonic 180-Degree Radar Scanner
// ====================================================================
#include <Servo.h>

const int TRIG_PIN = 11;
const int ECHO_PIN = 12;
const int SERVO_PIN = 10;

Servo radarServo;

float measureDistanceCm() {
  // 1. Clear trigger line
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // 2. Send 10 microsecond trigger pulse
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // 3. Measure duration of high echo pin in microseconds
  long durationUs = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout (~5m range)
  
  if (durationUs == 0) return 400.0; // Out of range or no echo
  
  // Speed of sound = 343 m/s = 0.0343 cm/us -> Distance = (duration * 0.0343) / 2
  return (durationUs * 0.0343) / 2.0;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  radarServo.attach(SERVO_PIN);
  Serial.println("Radar Initialized. Sweeping 0 -> 180 degrees...");
}

void loop() {
  // Sweep Forward: 0 to 180 degrees
  for (int angle = 15; angle <= 165; angle += 3) {
    radarServo.write(angle);
    delay(30); // Allow mechanical settling
    float distance = measureDistanceCm();
    Serial.print(angle);
    Serial.print(",");
    Serial.println(distance);
  }
  
  // Sweep Backward: 180 down to 0 degrees
  for (int angle = 165; angle >= 15; angle -= 3) {
    radarServo.write(angle);
    delay(30);
    float distance = measureDistanceCm();
    Serial.print(angle);
    Serial.print(",");
    Serial.println(distance);
  }
}`,
    socraticQuestions: [
      {
        question: 'Why does sound take 58 microseconds to travel 1 centimeter and back?',
        answer: 'Speed of sound is 343 m/s = 0.0343 cm/µs. Traveling 1 cm out and 1 cm back is 2 cm. Time = 2 cm / 0.0343 cm/µs ≈ 58.3 µs.',
      },
      {
        question: 'Why does an ultrasonic sensor struggle to detect fluffy fabrics or soft foam?',
        answer: 'Soft porous materials absorb acoustic vibrations rather than providing a rigid acoustic impedance mismatch, absorbing the 40 kHz sound waves with near-zero reflection.',
      },
    ],
  },

  // 3. DUAL IR TCRT5000 LINE FOLLOWER
  {
    id: 'exp_ir_line_follower',
    order: 3,
    title: 'Dual IR Reflective Array Line-Following Robot',
    subtitle: 'Phototransistor optical albedo comparison driving differential motor PWM steering.',
    category: 'autonomous_navigation',
    categoryLabel: 'Autonomous Navigation',
    iconName: 'Bot',
    tagline: 'Exploit surface albedo contrast to keep an autonomous mobile robot locked onto a path.',
    transducerType: 'TCRT5000 Optical Reflective Sensor (GaAs IR LED 950nm + NPN Phototransistor)',
    actuatorType: 'Dual H-Bridge DC Gearmotors (L298N / TB6612FNG Differential Drive)',
    physics: {
      governingLaw: 'Lambertian Diffuse Reflection & Optical Albedo',
      equation: 'I_{\\text{collector}} \\propto \\rho_{\\text{surface}} \\cdot I_{\\text{LED}} \\cos(\\theta), \\quad \\Delta v = K_p (S_L - S_R)',
      equationExplanation:
        'White paper possesses high optical albedo (ρ ≈ 0.85), reflecting 950 nm infrared photons back into the phototransistor base to drive it into electrical saturation. Black tape absorbs IR photons (ρ < 0.05), starving the base and cutting off collector current. Differential error drives proportional motor steering.',
      physicalTransduction:
        'Forward bias current emits 950 nm photons → Photons reflect off surface → Photons excite electron-hole pairs in silicon phototransistor depletion zone → Collector current flows → Voltage divider pulls input LOW.',
    },
    wiring: {
      microcontroller: 'Arduino Uno R3 (ATmega328P)',
      components: [
        { name: 'Left TCRT5000 IR Sensor', type: 'sensor', pinConnection: 'VCC → 5V, GND → GND, D0 → Pin A0' },
        { name: 'Right TCRT5000 IR Sensor', type: 'sensor', pinConnection: 'VCC → 5V, GND → GND, D0 → Pin A1' },
        { name: 'L298N Dual H-Bridge Driver', type: 'ic', pinConnection: 'IN1 → Pin 4, IN2 → Pin 5, IN3 → Pin 6, IN4 → Pin 7, ENA → Pin 3 (PWM), ENB → Pin 9 (PWM)' },
        { name: 'Dual TT DC Gear Motors', type: 'actuator', pinConnection: 'Left motor to OUT1/OUT2, Right motor to OUT3/OUT4' },
      ],
      schematicSummary:
        'Dual IR analog sensors read reflection contrast into ADC. L298N controls bidirectional DC motor speed via hardware timer PWM pins 3 and 9.',
      powerRequirements: 'Sensors consume 20 mA each; Dual TT DC motors consume 300 mA running, 1.2 A stall (powered from 2S Li-Ion 7.4V battery pack).',
    },
    hardwareTraps: [
      {
        trap: 'Ambient Sunlight / Halogen Glare Saturation',
        physicalReason:
          'Sunlight and incandescent bulbs emit massive continuous near-infrared radiation (950 nm), flooding the phototransistor and making black lines appear bright white.',
        solution: 'Use 38 kHz modulated infrared pulses with synchronous demodulation, or add physical shroud skirts around the sensor array.',
      },
      {
        trap: 'Motor Inductive Back-EMF Noise Resets Microcontroller',
        physicalReason:
          'Brushed DC motors spark as mechanical commutators disconnect, generating hundred-volt inductive voltage spikes (L di/dt) that feed back onto logic lines.',
        solution: 'Solder 0.1 µF ceramic bypass capacitors directly across motor terminals and use optocoupled motor drivers.',
      },
    ],
    oscilloscopeChannels: [
      { id: 'ch_left_ir', name: 'Left IR Reflectance (A0)', color: '#38bdf8', unit: 'V', rangeMin: 0, rangeMax: 5, description: 'Analog voltage: ~0.5V white surface, ~4.5V black line' },
      { id: 'ch_right_ir', name: 'Right IR Reflectance (A1)', color: '#10b981', unit: 'V', rangeMin: 0, rangeMax: 5, description: 'Right reflectance voltage' },
      { id: 'ch_pwm_diff', name: 'Motor Differential PWM', color: '#f59e0b', unit: 'PWM', rangeMin: -255, rangeMax: 255, description: 'Steering effort: Left vs Right motor speed' },
    ],
    arduinoCode: `// ====================================================================
// Dual TCRT5000 Differential Line Follower with Proportional Steering
// ====================================================================
const int LEFT_IR_PIN = A0;
const int RIGHT_IR_PIN = A1;

// L298N Motor Driver Pins
const int ENA = 3;  // Left Motor PWM Speed
const int IN1 = 4;
const int IN2 = 5;
const int IN3 = 6;
const int IN4 = 7;
const int ENB = 9;  // Right Motor PWM Speed

const int BASE_SPEED = 160;   // Base PWM 0-255
const int THRESHOLD = 500;   // ADC Threshold between black and white
const float KP = 0.35;        // Proportional steering gain

void setMotors(int leftSpeed, int rightSpeed) {
  // Left Motor Forward
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, constrain(leftSpeed, 0, 255));

  // Right Motor Forward
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, constrain(rightSpeed, 0, 255));
}

void setup() {
  pinMode(LEFT_IR_PIN, INPUT);
  pinMode(RIGHT_IR_PIN, INPUT);
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int leftVal = analogRead(LEFT_IR_PIN);
  int rightVal = analogRead(RIGHT_IR_PIN);

  // Error: negative if drifting right, positive if drifting left
  int error = leftVal - rightVal;
  int correction = (int)(error * KP);

  int leftMotorSpeed = BASE_SPEED - correction;
  int rightMotorSpeed = BASE_SPEED + correction;

  setMotors(leftMotorSpeed, rightMotorSpeed);
  delay(10); // 100 Hz control loop
}`,
    socraticQuestions: [
      {
        question: 'Why do line-following sensors use near-infrared (950 nm) instead of visible green or blue LEDs?',
        answer: 'Silicon phototransistors have peak spectral quantum efficiency around 900–950 nm, and carbon black printing ink absorbs 950 nm almost completely.',
      },
    ],
  },

  // 4. MPU-6050 INVERTED PENDULUM (SELF-BALANCING)
  {
    id: 'exp_mpu6050_balancing',
    order: 4,
    title: 'MPU-6050 6-DOF IMU Self-Balancing Inverted Pendulum',
    subtitle: 'MEMS capacitive accelerometer and Coriolis gyro fused via Complementary Filter into PID balance torque.',
    category: 'inertial_control',
    categoryLabel: 'Inertial Navigation & Control',
    iconName: 'Compass',
    tagline: 'Balance an unstable inverted pendulum in real time using high-speed sensor fusion and PID closed-loop control.',
    transducerType: '6-Axis MEMS IMU (Capacitive Micro-Machined Accelerometer + Vibrating Ring Gyroscope)',
    actuatorType: 'Dual High-Torque DC Gearmotors with Wheel Encoders',
    physics: {
      governingLaw: 'Euler-Lagrange Inverted Pendulum Dynamics & Sensor Fusion',
      equation: 'J \\ddot{\\theta} = m g l \\sin(\\theta) - \\tau_{\\text{motor}}, \\quad \\theta_t = \\alpha (\\theta_{t-1} + \\omega_{\\text{gyro}} \\Delta t) + (1-\\alpha) \\theta_{\\text{acc}}',
      equationExplanation:
        'An inverted pendulum has an unstable saddle equilibrium at θ=0. Accelerometers measure gravity vector with high low-frequency accuracy but suffer from vibration noise. Gyroscopes measure angular velocity with zero vibration noise but drift over time due to bias integration. Complementary filter fuses both into a drift-free angle estimate.',
      physicalTransduction:
        'Tilting shifts silicon proof mass between differential capacitive comb fingers (ΔC ∝ acceleration) → Coriolis force twists vibrating ring tuning fork (ΔV ∝ angular rate) → Internal 16-bit ADC samples at 1 kHz → I2C digital stream.',
    },
    wiring: {
      microcontroller: 'Arduino Uno R3 (ATmega328P)',
      components: [
        { name: 'MPU-6050 6-DOF IMU', type: 'sensor', pinConnection: 'VCC → 5V/3.3V, GND → GND, SDA → A4, SCL → A5, INT → Pin 2' },
        { name: 'L298N Motor Driver', type: 'ic', pinConnection: 'PWM speed on Pins 5 & 6, Direction on Pins 7, 8, 9, 10' },
        { name: 'Dual DC Motors', type: 'actuator', pinConnection: 'Connected to balancing chassis drive wheels' },
        { name: '4.7 kΩ Pull-up Resistors', type: 'passive', pinConnection: 'Across I2C SDA and SCL to 3.3V', notes: 'Guarantees fast 400kHz I2C clock edges' },
      ],
      schematicSummary:
        'MPU-6050 talks over hardware I2C (Pins A4/A5) at 400 kHz Fast-Mode. Interrupt pin 2 triggers control loop calculation every 10 ms (100 Hz).',
      powerRequirements: 'MPU-6050 draws ~3.8 mA; motors draw up to 2 A during rapid balance recovery corrections.',
    },
    hardwareTraps: [
      {
        trap: 'Gyroscope Zero-Rate Bias Drift',
        physicalReason:
          'Thermal gradients and silicon packaging stress cause the gyroscope output to read a non-zero angular rate (e.g. +1.5 °/s) even when sitting dead still. Integrating this creates runaway angle drift.',
        solution: 'Execute a 500-sample calibration routine at startup to calculate and subtract static gyro offsets.',
      },
      {
        trap: 'I2C Bus Lockup from Motor Spark Interference',
        physicalReason:
          'Motor brush arcs induce high-frequency voltage spikes onto adjacent SDA/SCL lines, holding the line low and freezing the microcontroller I2C state machine.',
        solution: 'Twist I2C wires, route them physically away from motor leads, and implement an I2C bus recovery timeout in software.',
      },
    ],
    oscilloscopeChannels: [
      { id: 'ch_pitch', name: 'Filtered Pitch Angle θ', color: '#38bdf8', unit: 'Deg', rangeMin: -25, rangeMax: 25, description: 'True fused angle from vertical (0° is balanced)' },
      { id: 'ch_gyro_rate', name: 'Raw Gyro Rate (dθ/dt)', color: '#f59e0b', unit: '°/s', rangeMin: -200, rangeMax: 200, description: 'Instantaneous rotational velocity' },
      { id: 'ch_pid_out', name: 'PID Motor Output u(t)', color: '#10b981', unit: 'PWM', rangeMin: -255, rangeMax: 255, description: 'Corrective torque applied to wheels' },
    ],
    arduinoCode: `// ====================================================================
// MPU-6050 Complementary Filter + PID Inverted Pendulum Controller
// ====================================================================
#include <Wire.h>

const int MPU_ADDR = 0x68;
float gyroBiasY = 0.0;
float pitchAngle = 0.0;
unsigned long prevTime = 0;

// PID Tuning Constants
float Kp = 24.0;
float Ki = 1.2;
float Kd = 1.8;
float integral = 0.0;
float prevError = 0.0;

void setup() {
  Wire.begin();
  Wire.setClock(400000); // 400kHz Fast I2C
  Serial.begin(115200);

  // Wake up MPU-6050 (clear sleep bit)
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);

  // Calibrate Gyroscope Offsets
  Serial.println("Calibrating IMU... Keep robot still.");
  for (int i = 0; i < 300; i++) {
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x45); // Gyro Y register
    Wire.endTransmission(false);
    Wire.requestFrom(MPU_ADDR, 2, true);
    int16_t rawGyroY = Wire.read() << 8 | Wire.read();
    gyroBiasY += (rawGyroY / 131.0);
    delay(4);
  }
  gyroBiasY /= 300.0;
  prevTime = micros();
}

void loop() {
  // Read Raw Accelerometer and Gyroscope Data
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // Accel X register
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);
  int16_t accX = Wire.read() << 8 | Wire.read();
  int16_t accY = Wire.read() << 8 | Wire.read();
  int16_t accZ = Wire.read() << 8 | Wire.read();

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x45); // Gyro Y register
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 2, true);
  int16_t rawGyroY = Wire.read() << 8 | Wire.read();

  // Convert to physical units
  float accPitch = atan2((float)accX, (float)accZ) * 180.0 / PI;
  float gyroRate = (rawGyroY / 131.0) - gyroBiasY;

  // Calculate delta time
  unsigned long now = micros();
  float dt = (now - prevTime) / 1000000.0;
  prevTime = now;

  // Complementary Filter Fusion (98% Gyro integration, 2% Accel gravity)
  pitchAngle = 0.98 * (pitchAngle + gyroRate * dt) + 0.02 * accPitch;

  // PID Balancing Loop (Target = 0.0 degrees)
  float error = 0.0 - pitchAngle;
  integral += error * dt;
  integral = constrain(integral, -50.0, 50.0); // Anti-windup
  float derivative = (error - prevError) / dt;
  prevError = error;

  float output = Kp * error + Ki * integral + Kd * derivative;
  int motorPwm = constrain((int)output, -255, 255);

  Serial.print("Angle:");
  Serial.print(pitchAngle);
  Serial.print(" MotorPWM:");
  Serial.println(motorPwm);
  delay(5);
}`,
    socraticQuestions: [
      {
        question: 'Why can’t you balance an inverted pendulum using ONLY the accelerometer?',
        answer: 'When the robot moves wheels rapidly to catch itself, the horizontal acceleration corrupts the gravity vector measurement, tricking the accelerometer into thinking the robot tilted even further.',
      },
    ],
  },

  // 5. DUAL-LDR SOLAR TRACKER
  {
    id: 'exp_ldr_solar_tracker',
    order: 5,
    title: 'Dual-LDR Photoresistor Solar Tracker & Heliostat',
    subtitle: 'Cadmium-sulfide bandgap photo-conduction bridge driving pan-tilt servo tracking.',
    category: 'transducers_actuators',
    categoryLabel: 'Transducers & Actuators',
    iconName: 'Activity',
    tagline: 'Track the sun’s trajectory across the sky with maximum solar cell energy harvest efficiency.',
    transducerType: 'Cadmium Sulfide (CdS) Photoresistor (Photoconductive Semiconductor Cell)',
    actuatorType: 'Pan-Tilt Dual Servo Gimbal (Azimuth & Elevation SG90 Servos)',
    physics: {
      governingLaw: 'Semiconductor Photoconductivity & Voltage Divider Bridge',
      equation: 'R_{\\text{LDR}} \\propto L^{-\\alpha}, \\quad V_{\\text{out}} = V_{\\text{cc}} \\frac{R_{\\text{fixed}}}{R_{\\text{LDR}} + R_{\\text{fixed}}}',
      equationExplanation:
        'Incident light photons with energy hν > E_g excite valence electrons into the conduction band, slashing the LDR resistance from 1 MΩ (dark) down to 500 Ω (bright sunlight). A physical dividing shadow barrier creates differential illumination across dual LDRs, steering servos toward zero differential.',
      physicalTransduction:
        'Solar photons strike CdS lattice → Electron-hole pairs generated → Bulk electrical resistivity drops → Voltage divider shifts voltage toward Vcc → Microcontroller ADC detects differential.',
    },
    wiring: {
      microcontroller: 'Arduino Uno R3 (ATmega328P)',
      components: [
        { name: 'Left CdS Photoresistor', type: 'sensor', pinConnection: 'One leg to 5V, other leg to Pin A0 & 10kΩ Resistor to GND' },
        { name: 'Right CdS Photoresistor', type: 'sensor', pinConnection: 'One leg to 5V, other leg to Pin A1 & 10kΩ Resistor to GND' },
        { name: 'Pan Azimuth Servo', type: 'actuator', pinConnection: 'PWM to Pin 9, VCC to 5V, GND to GND' },
        { name: 'Opaque Shadow Fin', type: 'passive', pinConnection: 'Physical cardboard or 3D-printed septum between LDRs' },
      ],
      schematicSummary: 'Dual 10kΩ pull-down resistors form two voltage dividers into analog inputs A0 and A1.',
      powerRequirements: 'LDR circuits consume under 1 mA; Pan servo draws up to 300 mA when rotating the solar panel payload.',
    },
    hardwareTraps: [
      {
        trap: 'Continuous Servo Jitter / Hunting Oscillations',
        physicalReason:
          'Analog noise and slight cloud flickers cause LDR differences to fluctuate around zero, causing the servo to constantly twitch back and forth, burning out gears.',
        solution: 'Implement an angular deadband threshold: only move servos if |Left - Right| > Deadband (e.g. > 15 ADC counts).',
      },
    ],
    oscilloscopeChannels: [
      { id: 'ch_ldr_l', name: 'Left Light Intensity (A0)', color: '#38bdf8', unit: 'V', rangeMin: 0, rangeMax: 5, description: 'Voltage increases with brightness' },
      { id: 'ch_ldr_r', name: 'Right Light Intensity (A1)', color: '#10b981', unit: 'V', rangeMin: 0, rangeMax: 5, description: 'Right photoresistor voltage' },
      { id: 'ch_servo_pan', name: 'Pan Servo Angle', color: '#f59e0b', unit: 'Deg', rangeMin: 0, rangeMax: 180, description: 'Servo heading angle' },
    ],
    arduinoCode: `// ====================================================================
// Dual-LDR Solar Tracker with Deadband Stability
// ====================================================================
#include <Servo.h>

const int LDR_LEFT = A0;
const int LDR_RIGHT = A1;
const int SERVO_PIN = 9;

Servo panServo;
int currentAngle = 90;
const int DEADBAND = 25; // Minimum ADC difference to trigger movement

void setup() {
  pinMode(LDR_LEFT, INPUT);
  pinMode(LDR_RIGHT, INPUT);
  panServo.attach(SERVO_PIN);
  panServo.write(currentAngle);
  Serial.begin(115200);
}

void loop() {
  int leftLight = analogRead(LDR_LEFT);
  int rightLight = analogRead(LDR_RIGHT);
  int diff = leftLight - rightLight;

  if (abs(diff) > DEADBAND) {
    if (diff > 0 && currentAngle < 175) {
      currentAngle += 1; // Turn left toward brighter side
    } else if (diff < 0 && currentAngle > 5) {
      currentAngle -= 1; // Turn right toward brighter side
    }
    panServo.write(currentAngle);
  }

  delay(40); // 25 Hz smooth tracking rate
}`,
    socraticQuestions: [
      {
        question: 'Why is an opaque divider partition (shadow fin) mandatory between the two LDRs?',
        answer: 'Without a divider, both LDRs receive diffuse ambient sunlight equally from all angles. The divider casts a physical shadow on one sensor when the sun is off-center, creating the differential signal needed to guide the motor.',
      },
    ],
  },

  // 6. ROTARY QUADRATURE ENCODER
  {
    id: 'exp_encoder_motor_pid',
    order: 6,
    title: 'Rotary Quadrature Encoder & Closed-Loop Motor Speed Control',
    subtitle: 'Dual-channel 90° optical phase decoding driving hardware interrupt PID velocity regulation.',
    category: 'inertial_control',
    categoryLabel: 'Inertial Navigation & Control',
    iconName: 'RotateCcw',
    tagline: 'Transform continuous rotation into discrete digital ticks to measure exact speed, angle, and position.',
    transducerType: 'Optical / Magnetic Quadrature Encoder (Dual Hall Elements / Photocoupler Discs)',
    actuatorType: 'Brushed DC Gearmotor with PWM Speed Drive',
    physics: {
      governingLaw: 'Quadrature Phase Encoding & Nyquist-Shannon Sampling',
      equation: '\\Delta \\phi = 90^\\circ, \\quad \\text{Direction} = \\text{sgn}(A \\oplus B), \\quad \\text{RPM} = \\frac{\\text{Ticks} \\times 60}{\\text{PPR} \\times \\Delta t}',
      equationExplanation:
        'Channel A and Channel B emit square waves phase-shifted by 90° (π/2 radians). Reading the state of Channel B on the rising edge of Channel A determines direction of rotation (clockwise vs counter-clockwise). Counting pulses across time interval Δt calculates precise instantaneous shaft RPM.',
      physicalTransduction:
        'Slotted wheel cuts optical infrared beam → Phototransistor switches ON/OFF → Schmitt trigger squares pulse → Hardware Pin Change Interrupt triggers inside CPU in nanoseconds.',
    },
    wiring: {
      microcontroller: 'Arduino Uno R3 (ATmega328P)',
      components: [
        { name: 'Encoder Channel A', type: 'sensor', pinConnection: 'Pin 2 (Hardware Interrupt INT0)' },
        { name: 'Encoder Channel B', type: 'sensor', pinConnection: 'Pin 3 (Hardware Interrupt INT1)' },
        { name: 'DC Motor Driver (L298N)', type: 'ic', pinConnection: 'PWM to Pin 5, Direction to Pin 4' },
        { name: 'Optical Slotted Disc Motor', type: 'actuator', pinConnection: '12V DC Gearmotor with 334 PPR Encoder' },
      ],
      schematicSummary: 'Encoder outputs wired directly to hardware interrupt pins 2 and 3 for microsecond-accurate pulse counting.',
      powerRequirements: 'Optical encoder consumes 15 mA; DC motor consumes 500 mA to 2.5 A under mechanical load.',
    },
    hardwareTraps: [
      {
        trap: 'Interrupt Starvation & Skipped Encoder Ticks',
        physicalReason:
          'If the microcontroller uses delay() or long Serial.print() inside interrupt routines, encoder ticks arriving at 5 kHz are dropped, causing position drift.',
        solution: 'Keep the Interrupt Service Routine (ISR) to a single line: increment tick counter and return immediately.',
      },
    ],
    oscilloscopeChannels: [
      { id: 'ch_enc_a', name: 'Encoder Channel A (Pin 2)', color: '#38bdf8', unit: 'V', rangeMin: 0, rangeMax: 5, description: 'Square wave pulse train' },
      { id: 'ch_enc_b', name: 'Encoder Channel B (Pin 3)', color: '#10b981', unit: 'V', rangeMin: 0, rangeMax: 5, description: '90° phase shifted square wave' },
      { id: 'ch_measured_rpm', name: 'Measured RPM', color: '#f59e0b', unit: 'RPM', rangeMin: 0, rangeMax: 300, description: 'Instantaneous filtered motor speed' },
    ],
    arduinoCode: `// ====================================================================
// Closed-Loop DC Motor PI Velocity Controller with Quadrature Encoder
// ====================================================================
const int ENC_A = 2; // Interrupt 0
const int ENC_B = 3; // Interrupt 1
const int MOTOR_PWM = 5;
const int MOTOR_DIR = 4;

volatile long encoderTicks = 0;
const int PPR = 334; // Pulses Per Revolution
float targetRPM = 120.0;

// PI Constants
float Kp = 1.4;
float Ki = 0.25;
float integral = 0.0;
unsigned long lastComputeTime = 0;

void IRAM_ATTR onEncoderA() {
  // Read Channel B to determine rotational direction
  if (digitalRead(ENC_B) == LOW) {
    encoderTicks++;
  } else {
    encoderTicks--;
  }
}

void setup() {
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  pinMode(MOTOR_PWM, OUTPUT);
  pinMode(MOTOR_DIR, OUTPUT);

  attachInterrupt(digitalPinToInterrupt(ENC_A), onEncoderA, RISING);
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();
  if (now - lastComputeTime >= 50) { // 20 Hz PI loop
    float dt = (now - lastComputeTime) / 1000.0;
    lastComputeTime = now;

    // Calculate instantaneous RPM
    noInterrupts();
    long ticks = encoderTicks;
    encoderTicks = 0;
    interrupts();

    float currentRPM = ((float)ticks / (float)PPR) * (60.0 / dt);
    float error = targetRPM - currentRPM;
    integral += error * dt;

    float output = Kp * error + Ki * integral;
    int pwm = constrain((int)output, 0, 255);

    digitalWrite(MOTOR_DIR, HIGH); // Forward
    analogWrite(MOTOR_PWM, pwm);

    Serial.print("TargetRPM:");
    Serial.print(targetRPM);
    Serial.print(" ActualRPM:");
    Serial.println(currentRPM);
  }
}`,
    socraticQuestions: [
      {
        question: 'Why do we need TWO channels (A and B) instead of just one encoder track?',
        answer: 'A single channel tells you how fast the wheel is turning, but cannot tell whether it is turning forward or backward. The 90° phase shift between A and B reveals direction based on which channel rises first.',
      },
    ],
  },

  // 7. HALL EFFECT MAGNETIC TACHOMETER
  {
    id: 'exp_hall_effect_tachometer',
    order: 7,
    title: 'Hall Effect Magnetic Tachometer & Limit Switch',
    subtitle: 'Lorentz force transverse voltage deflection detecting rotating magnetic poles.',
    category: 'transducers_actuators',
    categoryLabel: 'Transducers & Actuators',
    iconName: 'Cpu',
    tagline: 'Detect magnetic flux without physical contact to build frictionless tachometers and brushless motor drivers.',
    transducerType: 'A3144 Unipolar Hall Effect Sensor (Indium Arsenide / Silicon Semiconductor Slab)',
    actuatorType: 'Brushless DC Motor Rotor or High-Speed Spindle',
    physics: {
      governingLaw: 'Lorentz Force & The Classical Hall Effect',
      equation: '\\mathbf{F} = q(\\mathbf{E} + \\mathbf{v} \\times \\mathbf{B}), \\quad V_H = \\frac{I B}{n q d}',
      equationExplanation:
        'Current I flows through a semiconductor strip of thickness d. When magnetic field B passes perpendicular to the current, the magnetic Lorentz force curves moving charge carriers to one edge, creating a transverse electrostatic potential VH that triggers an open-collector digital switch.',
      physicalTransduction:
        'Neodymium magnet passes sensor → Magnetic flux B deflects conduction electrons → Hall voltage VH exceeds threshold → Internal Schmitt trigger activates → Open-collector transistor pulls signal to 0V.',
    },
    wiring: {
      microcontroller: 'Arduino Uno R3 (ATmega328P)',
      components: [
        { name: 'A3144 Hall Effect Sensor', type: 'sensor', pinConnection: 'Pin 1: VCC (5V), Pin 2: GND, Pin 3: Signal to Pin 2 (Interrupt 0)' },
        { name: '10 kΩ Pull-up Resistor', type: 'passive', pinConnection: 'Between VCC (5V) and Signal (Pin 2)', notes: 'Required for open-collector output' },
        { name: 'Neodymium Disc Magnet', type: 'passive', pinConnection: 'Mounted on rotating wheel or motor shaft' },
      ],
      schematicSummary: 'Open-collector Hall switch pulls Arduino hardware interrupt Pin 2 LOW each time South magnetic pole passes.',
      powerRequirements: 'A3144 consumes ~4 mA active.',
    },
    hardwareTraps: [
      {
        trap: 'Magnet Polarity Blindness (North vs South)',
        physicalReason:
          'Unipolar Hall sensors like the A3144 only respond to the South pole of a magnet. Passing the North pole produces zero deflection.',
        solution: 'Flip the magnet 180° if the sensor does not trigger, or use an omnipolar / bipolar latching Hall sensor.',
      },
    ],
    oscilloscopeChannels: [
      { id: 'ch_hall_sig', name: 'Hall Digital Output (Pin 2)', color: '#38bdf8', unit: 'V', rangeMin: 0, rangeMax: 5, description: '5V idle (pull-up), sharp 0V pulse when magnet passes' },
      { id: 'ch_rpm', name: 'Calculated Spindle RPM', color: '#10b981', unit: 'RPM', rangeMin: 0, rangeMax: 6000, description: 'Shaft rotational speed' },
      { id: 'ch_hall_pulse', name: 'Interrupt Edge Trigger', color: '#f59e0b', unit: 'V', rangeMin: 0, rangeMax: 5, description: 'Active falling edge pulse capture (0V active / 5V idle)' },
    ],
    arduinoCode: `// ====================================================================
// Hall Effect High-Speed Magnetic Spindle Tachometer
// ====================================================================
const int HALL_PIN = 2; // External Interrupt 0

volatile unsigned long lastPassTimeUs = 0;
volatile unsigned long periodUs = 0;

void IRAM_ATTR onMagnetPass() {
  unsigned long now = micros();
  unsigned long delta = now - lastPassTimeUs;
  if (delta > 2000) { // 2ms debounce (max 30,000 RPM)
    periodUs = delta;
    lastPassTimeUs = now;
  }
}

void setup() {
  pinMode(HALL_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(HALL_PIN), onMagnetPass, FALLING);
  Serial.begin(115200);
  Serial.println("Hall Tachometer Ready. Spin magnet...");
}

void loop() {
  noInterrupts();
  unsigned long p = periodUs;
  unsigned long lastTime = lastPassTimeUs;
  interrupts();

  // If no magnet passed in last 1.5 seconds, RPM is zero
  if (micros() - lastTime > 1500000) {
    p = 0;
  }

  float rpm = 0.0;
  if (p > 0) {
    rpm = (60.0 * 1000000.0) / (float)p;
  }

  Serial.print("Period(us): ");
  Serial.print(p);
  Serial.print(" | RPM: ");
  Serial.println(rpm);
  delay(100);
}`,
    socraticQuestions: [
      {
        question: 'Why are Hall sensors preferred over optical encoders in automotive wheels and dirty robotic gearboxes?',
        answer: 'Optical sensors get blinded by dust, oil, and mud. Magnetic fields pass straight through mud, water, plastic, and grease with zero physical wear.',
      },
    ],
  },

  // 8. LOAD CELL STRAIN GAUGE WHEATSTONE BRIDGE
  {
    id: 'exp_loadcell_smart_gripper',
    order: 8,
    title: 'Load Cell Strain Gauge Wheatstone Bridge & Force Gripper',
    subtitle: 'Piezoresistive foil deformation digitized by HX711 24-bit delta-sigma ADC for adaptive robotic gripping.',
    category: 'precision_force',
    categoryLabel: 'Precision Force & Touch',
    iconName: 'Scale',
    tagline: 'Measure sub-gram mechanical forces to give robotic hands the delicate touch required to pick an egg without cracking it.',
    transducerType: 'Full-Bridge Piezoresistive Metal Foil Strain Gauge (Wheatstone Bridge on Aluminum Bending Beam)',
    actuatorType: 'Precision Robotic Gripper Motor with Force-Limit Cutoff',
    physics: {
      governingLaw: 'Hooke’s Law, Piezoresistivity & The Wheatstone Bridge',
      equation: '\\frac{\\Delta R}{R} = G \\cdot \\epsilon, \\quad V_{\\text{diff}} = V_{\\text{exc}} \\left( \\frac{R_1}{R_1 + R_2} - \\frac{R_3}{R_3 + R_4} \\right) \\approx V_{\\text{exc}} \\cdot \\frac{G \\epsilon}{4}',
      equationExplanation:
        'Mechanical force bends an aluminum shear beam, stretching upper strain gauges (tension: +ΔR) and compressing lower gauges (compression: -ΔR). A 4-gauge Wheatstone bridge converts microscopic resistance changes into a millivolt differential signal (typically 2 mV/V) amplified by an on-chip 128x low-noise amplifier in the HX711 24-bit ADC.',
      physicalTransduction:
        'Gripper force bends aluminum bar → Constantan foil wire stretches → Wire cross-section shrinks and lengthens → Electrical resistance increases → Balanced Wheatstone bridge tilts by microvolts → HX711 digitizes 16 million counts.',
    },
    wiring: {
      microcontroller: 'Arduino Uno R3 (ATmega328P)',
      components: [
        { name: '4-Wire 1kg Load Cell', type: 'sensor', pinConnection: 'Red: E+, Black: E-, White: A-, Green: A+' },
        { name: 'HX711 24-Bit ADC Module', type: 'ic', pinConnection: 'VCC → 5V, GND → GND, DT → Pin 3, SCK → Pin 2' },
        { name: 'Gripper Servo Motor', type: 'actuator', pinConnection: 'PWM → Pin 9, VCC → External 5V, GND → GND' },
      ],
      schematicSummary: 'HX711 provides 4.3V excitation voltage across bridge and clocks 24-bit two’s complement serial readings into Pin 3.',
      powerRequirements: 'HX711 and bridge draw ~1.6 mA active (ideal for battery operation).',
    },
    hardwareTraps: [
      {
        trap: 'Thermal Drift & Zero-Point Creep',
        physicalReason:
          'Thermal expansion of aluminum bends the beam slightly even with no external weight, causing grams of zero-point drift as ambient temperature fluctuates.',
        solution: 'Use a full 4-gauge Wheatstone bridge (where thermal expansion cancels symmetrically across opposite arms) and execute software auto-tare.',
      },
    ],
    oscilloscopeChannels: [
      { id: 'ch_load_raw', name: 'HX711 24-bit ADC Reading', color: '#38bdf8', unit: 'Counts', rangeMin: -100000, rangeMax: 1000000, description: 'Raw digitized bridge voltage' },
      { id: 'ch_force_grams', name: 'Calibrated Force (Grams)', color: '#10b981', unit: 'g', rangeMin: 0, rangeMax: 1000, description: 'Real-time contact force' },
      { id: 'ch_gripper_pos', name: 'Gripper Servo Angle', color: '#f59e0b', unit: 'Deg', rangeMin: 0, rangeMax: 90, description: 'Gripper jaw closure state' },
    ],
    arduinoCode: `// ====================================================================
// HX711 24-Bit Load Cell Adaptive Force-Feedback Robotic Gripper
// ====================================================================
#include <Servo.h>

const int HX_DT = 3;
const int HX_SCK = 2;
const int GRIPPER_SERVO = 9;

Servo gripper;
float calibrationFactor = -420.0; // Calibration factor determined with 100g test weight
long zeroOffset = 0;
const float TARGET_HOLD_FORCE_GRAMS = 150.0; // Maximum safe grip force

long readHX711Raw() {
  while (digitalRead(HX_DT) == HIGH); // Wait for ADC ready
  long count = 0;
  for (int i = 0; i < 24; i++) {
    digitalWrite(HX_SCK, HIGH);
    delayMicroseconds(1);
    count = (count << 1) | digitalRead(HX_DT);
    digitalWrite(HX_SCK, LOW);
    delayMicroseconds(1);
  }
  // 25th pulse sets channel A gain 128
  digitalWrite(HX_SCK, HIGH);
  delayMicroseconds(1);
  digitalWrite(HX_SCK, LOW);
  
  // Sign extend 24-bit two's complement to 32-bit long
  if (count & 0x800000) count |= 0xFF000000;
  return count;
}

void setup() {
  pinMode(HX_DT, INPUT);
  pinMode(HX_SCK, OUTPUT);
  gripper.attach(GRIPPER_SERVO);
  gripper.write(0); // Open gripper jaw
  Serial.begin(115200);

  // Tare zero reading
  delay(500);
  zeroOffset = readHX711Raw();
  Serial.println("Smart Gripper Initialized & Tared. Ready to grasp.");
}

void loop() {
  long raw = readHX711Raw();
  float forceGrams = (float)(raw - zeroOffset) / calibrationFactor;
  if (forceGrams < 0) forceGrams = 0;

  Serial.print("Force(g): ");
  Serial.println(forceGrams);

  // Adaptive grasp loop: close gripper slowly until target force reached
  static int jawAngle = 0;
  if (forceGrams < TARGET_HOLD_FORCE_GRAMS && jawAngle < 85) {
    jawAngle += 1; // Gently tighten grip
    gripper.write(jawAngle);
  } else if (forceGrams > TARGET_HOLD_FORCE_GRAMS + 20 && jawAngle > 0) {
    jawAngle -= 1; // Relieve excessive pressure
    gripper.write(jawAngle);
  }

  delay(20);
}`,
    socraticQuestions: [
      {
        question: 'Why does the Wheatstone bridge need a 24-bit ADC like the HX711 instead of the Arduino’s built-in 10-bit ADC?',
        answer: 'A 10-bit ADC has 1,024 steps across 5V (~4.9 mV per step). A load cell output changes by only 2 mV over its ENTIRE range! The Arduino 10-bit ADC would only see 0 or 1 step, completely unable to resolve sub-gram weights. The HX711 provides 16 million steps with a built-in 128x amplifier.',
      },
    ],
  },
];
