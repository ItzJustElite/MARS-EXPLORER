// Lightweight synthesized Web Audio sound generator
// Zero external assets, works offline and instantly!

class SoundEngine {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private droneOsc: OscillatorNode | null = null
  private droneGain: GainNode | null = null

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
    if (muted && this.droneGain) {
      this.droneGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0)
    } else if (!muted && this.droneGain && this.ctx) {
      this.droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime)
    }
  }

  getMuted(): boolean {
    return this.isMuted
  }

  // Soft atmospheric cosmic drone in the background
  startAmbientDrone() {
    if (this.isMuted || this.droneOsc) return
    try {
      this.init()
      if (!this.ctx) return

      const osc = this.ctx.createOscillator()
      const filter = this.ctx.createBiquadFilter()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(55, this.ctx.currentTime) // Low A note

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(120, this.ctx.currentTime)

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      this.droneOsc = osc
      this.droneGain = gain
    } catch {
      // Audio autoplay policy catch
    }
  }

  // Futuristic UI button click
  playClick() {
    if (this.isMuted) return
    try {
      this.init()
      if (!this.ctx) return

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.06)

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.06)
    } catch {
      // Ignored
    }
  }

  // Soft high-tech beacon select chime
  playBeaconSelect() {
    if (this.isMuted) return
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const freqs = [523.25, 659.25, 783.99] // C5, E5, G5 chord

      freqs.forEach((freq, i) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.05)

        gain.gain.setValueAtTime(0.08, now + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now + i * 0.05)
        osc.stop(now + i * 0.05 + 0.35)
      })
    } catch {
      // Ignored
    }
  }

  // Round victory / score fanfare
  playScoreCelebration(points: number) {
    if (this.isMuted) return
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const chord = points > 3500 ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25]

      chord.forEach((freq, idx) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.08)

        gain.gain.setValueAtTime(0.15, now + idx * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now + idx * 0.08)
        osc.stop(now + idx * 0.08 + 0.5)
      })
    } catch {
      // Ignored
    }
  }
}

export const sound = new SoundEngine()
