class AudioSynthService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  // Engine sound nodes
  private engineNoiseNode: AudioNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  // Wind turbulence nodes
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;

  // Hypersonic engine nodes
  private hypersonicOsc: OscillatorNode | null = null;
  private hypersonicGain: GainNode | null = null;

  // Master output
  private masterGain: GainNode | null = null;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create Brown/Pink noise for jet engine rumble
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise approximation
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Engine filter & gain
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(160, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      // Wind filter & gain
      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      // Connect noise to engine & wind paths
      noiseSource.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      noiseSource.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.masterGain);

      // Hypersonic high-frequency turbine synthesizer
      this.hypersonicOsc = this.ctx.createOscillator();
      this.hypersonicOsc.type = 'sawtooth';
      this.hypersonicOsc.frequency.setValueAtTime(320, this.ctx.currentTime);

      const hypersonicFilter = this.ctx.createBiquadFilter();
      hypersonicFilter.type = 'lowpass';
      hypersonicFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

      this.hypersonicGain = this.ctx.createGain();
      this.hypersonicGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      this.hypersonicOsc.connect(hypersonicFilter);
      hypersonicFilter.connect(this.hypersonicGain);
      this.hypersonicGain.connect(this.masterGain);

      noiseSource.start();
      this.hypersonicOsc.start();
      this.engineNoiseNode = noiseSource;
      this.isInitialized = true;
    } catch {
      // Gracefully silent if Web Audio not supported
    }
  }

  public updateTelemetry(thrustFraction: number, airspeed: number, hypersonicFactor: number) {
    if (!this.ctx || !this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    try {
      // Engine pitch and volume based on thrust (0 to 1)
      if (this.engineFilter && this.engineGain) {
        const engineCutoff = 120 + thrustFraction * 350 + (hypersonicFactor * 400);
        this.engineFilter.frequency.setTargetAtTime(engineCutoff, now, 0.1);
        const engineVol = 0.05 + thrustFraction * 0.2 + (hypersonicFactor * 0.15);
        this.engineGain.gain.setTargetAtTime(engineVol, now, 0.1);
      }

      // Wind sound based on airspeed (knots)
      if (this.windFilter && this.windGain) {
        const normalizedSpeed = Math.min(Math.max((airspeed - 100) / 700, 0), 1.5);
        this.windFilter.frequency.setTargetAtTime(300 + normalizedSpeed * 900, now, 0.15);
        this.windGain.gain.setTargetAtTime(0.02 + normalizedSpeed * 0.18, now, 0.15);
      }

      // Hypersonic turbine tone
      if (this.hypersonicOsc && this.hypersonicGain) {
        if (hypersonicFactor > 0.05) {
          const oscFreq = 220 + hypersonicFactor * 520;
          this.hypersonicOsc.frequency.setTargetAtTime(oscFreq, now, 0.2);
          this.hypersonicGain.gain.setTargetAtTime(hypersonicFactor * 0.14, now, 0.1);
        } else {
          this.hypersonicGain.gain.setTargetAtTime(0.0001, now, 0.2);
        }
      }
    } catch {
      // Audio parameter update failed
    }
  }

  public playSonicBoom() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.3);
    } catch {
      // Audio context error
    }
  }

  public playHudBeep(freq = 1200, duration = 0.08) {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Audio error
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.18, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }
}

export const audioSynth = new AudioSynthService();
