/**
 * Tamil-Translate-Kids - Web Audio FX Synthesizer
 * Generates instant kid-friendly celebratory chimes, fanfares, star dings & sounds.
 */

const KidAudioFX = {
  ctx: null,
  // Sound effects are off by default so login never plays a surprise sound.
  enabled: (() => {
    try { return localStorage.getItem("ttk-sound-enabled") === "true"; }
    catch (_) { return false; }
  })(),

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    try { localStorage.setItem("ttk-sound-enabled", String(this.enabled)); } catch (_) {}
    if (!this.enabled && this.ctx && this.ctx.state === "running") {
      // Stop any tones that are currently playing when sound is switched off.
      try { this.ctx.suspend(); } catch (_) {}
    } else if (this.enabled && this.ctx && this.ctx.state === "suspended") {
      try { this.ctx.resume(); } catch (_) {}
    }
    return this.enabled;
  },

  init() {
    if (!this.enabled) return;
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  // Play a simple synthesized chime/tone
  playTone(freq, type = "sine", duration = 0.2, delay = 0, gainVal = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  },

  // Victory fanfare when pass match (>= 70% or threshold)
  playSuccessFanfare() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, "triangle", 0.35, idx * 0.12, 0.2);
    });
  },

  // High pitch star ding
  playStarDing(count = 1) {
    this.init();
    for (let i = 0; i < count; i++) {
      this.playTone(880 + i * 220, "sine", 0.4, i * 0.15, 0.22);
    }
  },

  // Soft click / flip
  playClick() {
    this.playTone(440, "sine", 0.08, 0, 0.08);
  },

  // Try again soft gentle cue
  playTryAgain() {
    this.init();
    this.playTone(330, "sine", 0.25, 0, 0.15);
    this.playTone(261.63, "sine", 0.4, 0.2, 0.12);
  },

  // Mic start listening beep
  playMicStart() {
    this.init();
    this.playTone(587.33, "sine", 0.15, 0, 0.15);
    this.playTone(880.00, "sine", 0.2, 0.1, 0.18);
  },

  // Mic stop beep
  playMicStop() {
    this.init();
    this.playTone(783.99, "sine", 0.12, 0, 0.12);
    this.playTone(523.25, "sine", 0.18, 0.1, 0.12);
  }
};

if (typeof window !== "undefined") {
  window.KidAudioFX = KidAudioFX;
}
