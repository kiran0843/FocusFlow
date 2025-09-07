// Audio notification system for Pomodoro timer
// This creates simple audio notifications using Web Audio API

/**
 * AudioNotification - Simple audio notification system
 */
export class AudioNotification {
  constructor() {
    this.audioContext = null
    this.isEnabled = true
  }

  // Initialize audio context
  init() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  // Play notification sound
  playNotification(type = 'complete') {
    if (!this.isEnabled || !this.audioContext) return

    const frequencies = {
      complete: [523.25, 659.25, 783.99], // C5, E5, G5
      start: [440, 554.37], // A4, C#5
      pause: [349.23, 392.00], // F4, G4
      break: [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    }

    const freq = frequencies[type] || frequencies.complete
    const duration = 0.5
    const gain = 0.3

    freq.forEach((frequency, index) => {
      setTimeout(() => {
        this.playTone(frequency, duration, gain)
      }, index * 100)
    })
  }

  // Play a single tone
  playTone(frequency, duration, gain) {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // Enable/disable audio
  setEnabled(enabled) {
    this.isEnabled = enabled
  }

  // Play session complete sound
  playSessionComplete() {
    this.playNotification('complete')
  }

  // Play session start sound
  playSessionStart() {
    this.playNotification('start')
  }

  // Play pause sound
  playPause() {
    this.playNotification('pause')
  }

  // Play break start sound
  playBreakStart() {
    this.playNotification('break')
  }
}

// Create global instance
export const audioNotification = new AudioNotification()

// Initialize on first user interaction
if (typeof window !== 'undefined') {
  const initAudio = () => {
    audioNotification.init()
    document.removeEventListener('click', initAudio)
    document.removeEventListener('keydown', initAudio)
  }

  document.addEventListener('click', initAudio)
  document.addEventListener('keydown', initAudio)
}

export default AudioNotification

