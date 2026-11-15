// Lightweight synthesized Web Audio sound generator.
// All sounds are generated procedurally (zero external assets), so the game
// works offline and no audio licensing/credits are required. Everything is
// tuned to a low, grim, lo-fi space palette to match the ambient drone.
//
// Credits: NASA imagery attribution lives in public/panoramas/README.txt and
// in the in-game Credits panel. Audio is original synthesis.

class SoundEngine {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private droneNodes: { osc1: OscillatorNode; osc2: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null = null

  private init() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume()
    if (this.ctx) return
    if (typeof window === 'undefined') return
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtx) this.ctx = new AudioCtx()
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
    if (muted) {
      if (this.droneNodes) this.droneNodes.gain.gain.setValueAtTime(0, this.ctx?.currentTime || 0)
    } else if (this.droneNodes && this.ctx) {
      this.droneNodes.gain.gain.setValueAtTime(0.05, this.ctx.currentTime)
    }
  }

  getMuted(): boolean { return this.isMuted }

  // Low, grim ambient drone with slow LFO movement.
  startAmbientDrone() {
    if (this.isMuted || this.droneNodes) return
    try {
      this.init()
      if (!this.ctx) return
      const ctx = this.ctx
      const now = ctx.currentTime

      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(55, now) // A1
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(82.4, now) // E2
      osc2.detune.setValueAtTime(-7, now)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(150, now)
      filter.Q.setValueAtTime(1.2, now)

      gain.gain.setValueAtTime(0.0, now)
      gain.gain.linearRampToValueAtTime(0.05, now + 1.5)

      lfo.type = 'sine'
      lfo.frequency.setValueAtTime(0.07, now)
      lfoGain.gain.setValueAtTime(60, now)
      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      lfo.start(now)

      this.droneNodes = { osc1, osc2, lfo, gain }
    } catch {
      // Audio autoplay policy catch
    }
  }

  stopAmbientDrone() {
    if (!this.droneNodes || !this.ctx) return
    try {
      const { osc1, osc2, lfo, gain } = this.droneNodes
      const now = this.ctx.currentTime
      gain.gain.linearRampToValueAtTime(0, now + 1)
      osc1.stop(now + 1.1)
      osc2.stop(now + 1.1)
      lfo.stop(now + 1.1)
      this.droneNodes = null
    } catch {
      this.droneNodes = null
    }
  }

  // ---- helpers ----
  private tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.12, slide?: number, filterFreq?: number) {
    if (this.isMuted) return
    try {
      this.init()
      if (!this.ctx) return
      const ctx = this.ctx
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      if (filterFreq) {
        const f = ctx.createBiquadFilter()
        f.type = 'lowpass'
        f.frequency.setValueAtTime(filterFreq, now)
        osc.connect(f)
        f.connect(g)
      } else {
        osc.connect(g)
      }
      g.connect(ctx.destination)

      osc.type = type
      osc.frequency.setValueAtTime(freq, now)
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), now + dur)

      g.gain.setValueAtTime(gain, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + dur)

      osc.start(now)
      osc.stop(now + dur + 0.02)
    } catch {
      // ignored
    }
  }

  private noise(dur: number, gain = 0.06, filterFreq = 400) {
    if (this.isMuted) return
    try {
      this.init()
      if (!this.ctx) return
      const ctx = this.ctx
      const now = ctx.currentTime
      const bufferSize = Math.floor(ctx.sampleRate * dur)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(filterFreq, now)
      const g = ctx.createGain()
      g.gain.setValueAtTime(gain, now)
      g.gain.exponentialRampToValueAtTime(0.001, now + dur)
      src.connect(filter)
      filter.connect(g)
      g.connect(ctx.destination)
      src.start(now)
      src.stop(now + dur + 0.02)
    } catch {
      // ignored
    }
  }

  // ---- public SFX (all low-tone) ----

  playClick() {
    this.tone(150, 0.07, 'square', 0.09, 70, 600)
    this.noise(0.04, 0.04, 500)
  }

  playHover() {
    this.tone(110, 0.04, 'sine', 0.04, undefined, 300)
  }

  playBeaconSelect() {
    this.tone(110, 0.12, 'sine', 0.1, 165, 700)
    setTimeout(() => this.tone(165, 0.18, 'sine', 0.09, 110, 700), 90)
  }

  playNavigate() {
    this.tone(130, 0.09, 'triangle', 0.08, 90, 600)
    this.noise(0.05, 0.03, 400)
  }

  playGuess() {
    this.tone(90, 0.14, 'sine', 0.12, 60, 500)
    this.noise(0.06, 0.05, 350)
  }

  playHint() {
    this.tone(180, 0.08, 'sine', 0.07, 120, 500)
  }

  playToggle() {
    this.tone(120, 0.06, 'square', 0.07, 180, 500)
  }

  playReveal(points: number) {
    const chord = points >= 4000
      ? [110, 165, 220]
      : points >= 1500
        ? [98, 130.8, 164.8]
        : [82.4, 110, 130.8]
    chord.forEach((f, i) => setTimeout(() => this.tone(f, 0.4, 'sine', 0.1, f * 0.5, 700), i * 110))
  }

  playScoreCelebration(points: number) {
    this.playReveal(points)
    if (points >= 4500) {
      setTimeout(() => this.tone(220, 0.3, 'triangle', 0.08, 330, 900), 360)
    }
  }

  playBullseye() {
    this.tone(110, 0.15, 'sine', 0.12, 220, 800)
    setTimeout(() => this.tone(220, 0.25, 'sine', 0.1, 110, 900), 120)
    setTimeout(() => this.tone(330, 0.3, 'triangle', 0.08, 165, 1000), 260)
  }

  playGameOver() {
    [220, 165, 110, 82.4].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.35, 'sine', 0.09, f * 0.6, 600), i * 180),
    )
  }

  playError() {
    this.tone(110, 0.18, 'sawtooth', 0.08, 55, 400)
    this.noise(0.12, 0.04, 300)
  }

  playSuccess() {
    this.tone(165, 0.12, 'sine', 0.1, 220, 700)
    setTimeout(() => this.tone(220, 0.18, 'sine', 0.09, 165, 800), 100)
  }

  playExit() {
    this.tone(130, 0.12, 'sine', 0.08, 65, 500)
  }
}

export const sound = new SoundEngine()
