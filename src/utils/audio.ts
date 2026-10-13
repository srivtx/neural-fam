/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API lightweight synthesizer for crisp feedback
class SoundFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check saved mute state
    const saved = localStorage.getItem('neural_sound_muted');
    if (saved === 'true') {
      this.isMuted = true;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('neural_sound_muted', String(this.isMuted));
    return this.isMuted;
  }

  // Play a soft high chime when an action succeeds or quiz question is correct
  public playSuccess() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio might be blocked by autoplay policies
    }
  }

  // Play a triumphant chord when a milestone or badge is unlocked
  public playMilestone() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.06, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.4);
      });
    } catch {
      // Autoplay silent ignore
    }
  }

  // Subtle tap sound for UI button toggles
  public playTap() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // ignore
    }
  }

  // --- Physical Substrate & Mathematical Sonification Synthesizers ---

  // Sonification of Quantum Wavepacket Tunneling: an eerie frequency dispersive sweep
  public playQuantumTunneling() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(1420, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // ignore
    }
  }

  // Sonification of Clock Pulse / Jitter: crisp micro-tick
  public playClockTick(hz: number = 1000) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(hz, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // ignore
    }
  }

  // Sonification of DRAM Trench Thermal Leakage: descending exponential discharge hum
  public playDramLeakage() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.4);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.41);
    } catch {
      // ignore
    }
  }

  // Sonification of DRAM Sense-Amp Capacitor Refresh: bright capacitive restoration ping
  public playDramRefresh() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // ignore
    }
  }

  // Sonification of Logic Gate Toggle (CMOS Inverter / NAND / Flip-Flop)
  public playLogicGateToggle(state: boolean) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // Low to High is higher pitch, High to Low is lower pitch
      osc.frequency.setValueAtTime(state ? 520 : 380, now);
      osc.frequency.exponentialRampToValueAtTime(state ? 780 : 260, now + 0.04);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // ignore
    }
  }

  // Sonification of High-Dimensional Collapse (d = 2 -> 4096)
  // Vanishing cosine variance (Var = 1/d): noise narrows into a pure 432 Hz sinusoid
  public playHighDimCollapse(dim: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Normalize dim in [2, 4096]
      const t = Math.min(1, Math.max(0, Math.log2(dim / 2) / 11));
      // Base frequency 432 Hz, variance creates sideband modulation
      const centerFreq = 432;
      const detuneSpread = (1 - t) * 600; // wide detuning at d=2, collapses to 0 at d=4096

      osc.type = t > 0.8 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(centerFreq + (Math.random() - 0.5) * detuneSpread, now);
      osc.frequency.exponentialRampToValueAtTime(centerFreq, now + 0.18);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // ignore
    }
  }

  // Grokking Phase Transition Snap: Discordant dissonance resolving to pure major triad
  public playHarmonicResolution() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const triad = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5

      triad.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // start with discordant microtonal offset then snap to pure harmonic
        const offset = (idx % 2 === 0 ? 1 : -1) * (30 / (idx + 1));
        osc.frequency.setValueAtTime(freq + offset, now);
        osc.frequency.exponentialRampToValueAtTime(freq, now + 0.12);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.55);
      });
    } catch {
      // ignore
    }
  }

  // Bus Contention warning buzz
  public playBusContention() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // ignore
    }
  }

  // Dimension Collapse Chord: As dimension scales 2 -> 4096, detuned cluster filters into pure 432 Hz sine tone
  public playDimensionCollapseChord(dimension: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq = 432.0; // Pure Pythagorean A
      // Spread decreases proportionally to 1 / sqrt(dimension)
      const spreadHz = Math.max(0.5, 90.0 / Math.sqrt(Math.max(1, dimension)));
      const numPartials = dimension > 50 ? 2 : 4;

      for (let i = 0; i < numPartials; i++) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const detuneOffset = (i - (numPartials - 1) / 2) * spreadHz;
        osc.type = dimension >= 100 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq + detuneOffset, now);

        const vol = 0.05 / numPartials;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.38);
      }
    } catch {
      // ignore
    }
  }

  // Superposition Resonance: Sonifies cross-feature interference vs clean sparse recovery
  public playSuperpositionResonance(sparsity: number, isCleanRecovery: boolean = true) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      if (isCleanRecovery) {
        // High sparsity: pristine shimmering overtone
        const freqs = [528.0, 660.0, 792.0]; // Solfeggio / Harmonic triad
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.03);
          gain.gain.setValueAtTime(0.03, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.03);
          osc.stop(now + idx * 0.03 + 0.3);
        });
      } else {
        // Low sparsity / dense interference: dissonant buzzy cluster
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180 + (1 - sparsity) * 80, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // ignore
    }
  }

  // Cosmic Ladder Scale Sonification: sweeps from deep macro acoustic drone (65Hz) to pure quantum chime (2080Hz)
  public playCosmicLadderScale(scaleExponent: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const clampedExp = Math.max(0, Math.min(9, scaleExponent));
      // 0 -> 65Hz, 9 -> 2080Hz (spanning 5 octaves of physical scale)
      const targetFreq = 65 * Math.pow(2, (clampedExp / 9) * 5);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = clampedExp < 2 ? 'triangle' : clampedExp < 6 ? 'sine' : 'sine';
      osc.frequency.setValueAtTime(targetFreq, now);

      const vol = 0.04;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // ignore
    }
  }

  // --- Authentic Physical Computing & Substrate Audio Synthesizers ---

  /**
   * Resonant piezoelectric square wave buzzer with characteristic sharp rise/fall
   * and high-Q odd-harmonic buzz.
   */
  public playPiezoBuzzer(freqHz: number = 2400, duration: number = 0.15) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freqHz, now);

      // Resonant bandpass filter peaking at the buzzer's acoustic chamber resonance
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freqHz, now);
      filter.Q.setValueAtTime(3.5, now);

      const attack = 0.003; // sharp 3ms rise
      const release = 0.015; // sharp mechanical decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + attack);
      const sustainEnd = Math.max(now + attack, now + duration - release);
      gain.gain.setValueAtTime(0.07, sustainEnd);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * High-frequency 40kHz Doppler-downshifted ultrasonic radar ping.
   * Sine chirp sweep 2200Hz -> 880Hz with subtle exponential acoustic echo tail.
   */
  public playUltrasonicPing() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Fast downshifted Doppler sweep: 2200Hz -> 880Hz -> 440Hz tail
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.065, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.018, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Micro-pulse 490Hz / 980Hz Arduino timer carrier hum with subtle mechanical resonance.
   * Simulates motor stator coil chopping at PWM timer clock rates.
   */
  public playMotorPWMHum(dutyCycle: number = 0.5) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const carrierFreq = dutyCycle > 0.65 ? 980 : 490; // Standard Arduino timer PWM carrier
      const duration = 0.10;

      // PWM switching carrier oscillator
      const oscCarrier = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gainCarrier = this.ctx.createGain();

      oscCarrier.type = 'square';
      oscCarrier.frequency.setValueAtTime(carrierFreq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(1.8, now);

      // Low-frequency mechanical rotor vibration (60-80Hz)
      const oscRotor = this.ctx.createOscillator();
      const gainRotor = this.ctx.createGain();
      oscRotor.type = 'triangle';
      oscRotor.frequency.setValueAtTime(70, now);

      const normDuty = Math.max(0.05, Math.min(1.0, dutyCycle));
      const amp = 0.035 * normDuty;

      gainCarrier.gain.setValueAtTime(0.0001, now);
      gainCarrier.gain.linearRampToValueAtTime(amp, now + 0.005);
      gainCarrier.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      gainRotor.gain.setValueAtTime(0.0001, now);
      gainRotor.gain.linearRampToValueAtTime(amp * 0.5, now + 0.005);
      gainRotor.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscCarrier.connect(filter);
      filter.connect(gainCarrier);
      gainCarrier.connect(this.ctx.destination);

      oscRotor.connect(gainRotor);
      gainRotor.connect(this.ctx.destination);

      oscCarrier.start(now);
      oscCarrier.stop(now + duration + 0.01);
      oscRotor.start(now);
      oscRotor.stop(now + duration + 0.01);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Ultra-short 5ms transient impulse click for optical encoder slot crossings.
   * Damped high-frequency impulse simulating photodiode state toggle.
   */
  public playEncoderTick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(3200, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.005);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.005);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.006);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Granular noise burst simulating physical shell fracture under compressive load.
   * Multi-stage micro-fracture acoustic impulses with high-frequency brittle crunch.
   */
  public playEggCrack() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const sampleRate = this.ctx.sampleRate;
      const duration = 0.16;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      // Procedural brittle fracture synthesis: multiple overlapping fracture snaps
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const snap1 = Math.exp(-t * 90);
        const snap2 = t > 0.02 ? Math.exp(-(t - 0.02) * 110) : 0;
        const snap3 = t > 0.05 ? Math.exp(-(t - 0.05) * 140) : 0;
        const snap4 = t > 0.09 ? Math.exp(-(t - 0.09) * 160) : 0;
        const envelope = snap1 * 0.9 + snap2 * 0.75 + snap3 * 0.55 + snap4 * 0.4;
        const white = Math.random() * 2 - 1;
        data[i] = white * envelope;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(this.ctx.currentTime);
      noise.stop(this.ctx.currentTime + duration + 0.01);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Dual mechanical transient (contact bounce) for electromagnetic switch toggling.
   * Initial armature strike followed ~7ms later by secondary bounce transient.
   */
  public playRelayClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Primary contact impact
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(350, now + 0.007);
      gain1.gain.setValueAtTime(0.045, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.007);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.008);

      // Contact bounce transient (~7ms later)
      const bounceTime = now + 0.007;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2000, bounceTime);
      osc2.frequency.exponentialRampToValueAtTime(500, bounceTime + 0.005);
      gain2.gain.setValueAtTime(0.03, bounceTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, bounceTime + 0.005);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(bounceTime);
      osc2.stop(bounceTime + 0.006);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Low-frequency avalanche noise burst simulating Zener/avalanche breakdown.
   * Procedural micro-plasma ionization discharge with thermal shot noise.
   */
  public playDiodeBreakdown() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const sampleRate = this.ctx.sampleRate;
      const duration = 0.22;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      let prev = 0;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const decay = Math.exp(-t * 14);
        const white = Math.random() * 2 - 1;
        prev = (prev + 0.08 * white) / 1.08; // Brown noise low-pass integration
        const plasmaSpike = Math.random() < 0.04 ? (Math.random() * 2 - 1) * 0.7 : 0;
        data[i] = (prev * 2.2 + plasmaSpike) * decay;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.065, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(this.ctx.currentTime);
      noise.stop(this.ctx.currentTime + duration + 0.01);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Descending frequency chirp (600Hz -> 200Hz) for processor instruction stall bubbles.
   * Simulates CPU clock-cycle bubble insertion on hazard or branch misprediction.
   */
  public playPipelineStall() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.16);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.16);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // Audio safety fallback
    }
  }
}

export const soundFX = new SoundFX();

// Standalone functional exports for ergonomic procedural audio access
export const playPiezoBuzzer = (freqHz?: number, duration?: number) => soundFX.playPiezoBuzzer(freqHz, duration);
export const playUltrasonicPing = () => soundFX.playUltrasonicPing();
export const playMotorPWMHum = (dutyCycle?: number) => soundFX.playMotorPWMHum(dutyCycle);
export const playEncoderTick = () => soundFX.playEncoderTick();
export const playEggCrack = () => soundFX.playEggCrack();
export const playRelayClick = () => soundFX.playRelayClick();
export const playDiodeBreakdown = () => soundFX.playDiodeBreakdown();
export const playPipelineStall = () => soundFX.playPipelineStall();

