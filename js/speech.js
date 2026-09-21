/**
 * Tamil-Translate-Kids - Enhanced Voice Recognition & Soft Tamil Kid Voice Synthesis
 * Cross-platform support for iOS (iPhone/iPad Safari/Chrome), Android, and Desktop.
 */

const KidSpeechService = {
  recognition: null,
  isListening: false,
  tamilVoice: null,
  englishVoice: null,
  onTranscriptCallback: null,
  onStateChangeCallback: null,
  audioPlayer: null,
  hasMicPermission: false,

  init() {
    this.audioPlayer = new Audio();
    this.setupVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => this.setupVoices();
    }
  },

  setupVoices() {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Preference list for soft, natural, kid-friendly Tamil voices:
    // Kani, Latha, Google தமிழ், Valluvar, or any ta-*
    this.tamilVoice = 
      voices.find(v => v.lang.startsWith("ta") && (v.name.toLowerCase().includes("kani") || v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("natural"))) ||
      voices.find(v => v.lang.startsWith("ta") || v.name.toLowerCase().includes("tamil")) ||
      null;

    this.englishVoice = 
      voices.find(v => v.lang.startsWith("en") && (v.name.toLowerCase().includes("kid") || v.name.toLowerCase().includes("child") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("natural"))) ||
      voices.find(v => v.lang.startsWith("en-US")) ||
      voices.find(v => v.lang.startsWith("en")) ||
      null;
  },

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  // Request Microphone Permission explicitly (Fixes iPhone/Safari blocking)
  async ensureMicPermission() {
    if (this.hasMicPermission) return true;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop audio tracks immediately after granting permission
        stream.getTracks().forEach(track => track.stop());
        this.hasMicPermission = true;
        return true;
      } catch (err) {
        console.warn("Microphone access request error:", err);
        return false;
      }
    }
    return true; // Fallback for browsers without getUserMedia
  },

  // Create fresh instance of recognition (Fixes iOS WebKit state bugs)
  createRecognitionInstance() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return null;

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.lang = "ta-IN"; // Tamil (India)

    rec.onstart = () => {
      this.isListening = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback(true);
    };

    rec.onresult = (event) => {
      let transcript = "";
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      if (this.onTranscriptCallback && transcript) {
        this.onTranscriptCallback(transcript, isFinal);
      }
    };

    rec.onerror = (event) => {
      console.warn("Speech Recognition Error:", event.error);
      this.isListening = false;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(false, event.error);
      }
    };

    rec.onend = () => {
      this.isListening = false;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(false);
      }
    };

    return rec;
  },

  async startListening(onTranscript, onStateChange) {
    this.onTranscriptCallback = onTranscript;
    this.onStateChangeCallback = onStateChange;

    if (!this.isSupported()) {
      if (onStateChange) onStateChange(false, "not_supported");
      return;
    }

    // Explicit mic check for iOS / Mobile Safari & Chrome
    try {
      await this.ensureMicPermission();
    } catch (e) {
      console.warn("Mic permission error:", e);
    }

    // Always create a fresh instance on mobile to prevent stuck recognition
    try {
      if (this.recognition && this.isListening) {
        this.recognition.abort();
      }
    } catch (e) {}

    this.recognition = this.createRecognitionInstance();
    if (!this.recognition) {
      if (onStateChange) onStateChange(false, "not_supported");
      return;
    }

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition failed to start:", e);
      // Retry once after brief timeout if busy
      setTimeout(() => {
        try {
          this.recognition = this.createRecognitionInstance();
          if (this.recognition) this.recognition.start();
        } catch (err) {
          if (onStateChange) onStateChange(false, err.message || "start_failed");
        }
      }, 150);
    }
  },

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        try {
          this.recognition.abort();
        } catch (err) {}
      }
    }
    this.isListening = false;
  },

  /**
   * Speak Tamil with soft, sweet, kid-friendly voice modulation.
   * Uses Web Speech Synthesis with high-pitch female/soft voice,
   * with fallback to natural pronunciation audio.
   */
  speakTamil(tamilText) {
    if (!tamilText) return;

    // Try SpeechSynthesis first
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop any playing speech

      const cleanText = tamilText.replace(/[()]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "ta-IN";
      
      // Soft, gentle, kid-friendly pitch & rate
      utterance.rate = 0.85; // Gentle pace so kids can hear each syllable
      utterance.pitch = 1.25; // Cheerful, sweet, high-toned kid pitch
      utterance.volume = 1.0;

      if (this.tamilVoice) {
        utterance.voice = this.tamilVoice;
      }

      // If synthesis succeeds, play
      let synthesisStarted = false;
      utterance.onstart = () => {
        synthesisStarted = true;
      };

      utterance.onerror = () => {
        // Fallback to natural audio stream if TTS engine fails on device
        this.playNaturalTamilAudio(cleanText);
      };

      window.speechSynthesis.speak(utterance);

      // Timeout check: on some iPhones, speechSynthesis can hang if no voice installed
      setTimeout(() => {
        if (!synthesisStarted && window.speechSynthesis.speaking === false) {
          this.playNaturalTamilAudio(cleanText);
        }
      }, 400);

    } else {
      this.playNaturalTamilAudio(tamilText);
    }
  },

  // Natural high-clarity soft audio playback fallback
  playNaturalTamilAudio(text) {
    if (!this.audioPlayer) {
      this.audioPlayer = new Audio();
    }
    try {
      const encoded = encodeURIComponent(text);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encoded}`;
      this.audioPlayer.src = url;
      this.audioPlayer.playbackRate = 0.9; // Soft and clear
      this.audioPlayer.play().catch(e => {
        console.warn("Audio fallback autoplay notice:", e);
      });
    } catch (e) {
      console.warn("Natural audio error:", e);
    }
  },

  // Speak English sentence
  speakEnglish(englishText) {
    if (!englishText) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(englishText);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      utterance.pitch = 1.15; // Friendly upbeat pitch

      if (this.englishVoice) {
        utterance.voice = this.englishVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }
};

if (typeof window !== "undefined") {
  window.KidSpeechService = KidSpeechService;
}
