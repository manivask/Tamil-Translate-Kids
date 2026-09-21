/**
 * Tamil-Translate-Kids - Mobile & iOS Optimized Speech Service
 * Reliable SpeechRecognition (ta-IN) & Natural Soft Tamil Voice Synthesis.
 */

const KidSpeechService = {
  recognition: null,
  isListening: false,
  tamilVoice: null,
  englishVoice: null,
  onTranscriptCallback: null,
  onStateChangeCallback: null,
  audioPlayer: null,

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

    // Preference list for sweet, soft, natural Tamil voices:
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

  // Synchronous recognition starter for iOS Safari / Mobile
  startListening(onTranscript, onStateChange) {
    this.onTranscriptCallback = onTranscript;
    this.onStateChangeCallback = onStateChange;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (onStateChange) onStateChange(false, "not_supported");
      return;
    }

    // Abort any existing recognition instance
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.lang = "ta-IN"; // Tamil (India)

      rec.onstart = () => {
        this.isListening = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      };

      rec.onaudiostart = () => {
        if (this.onStateChangeCallback) this.onStateChangeCallback(true, "recording_audio");
      };

      rec.onspeechstart = () => {
        if (this.onStateChangeCallback) this.onStateChangeCallback(true, "speech_detected");
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

        if (this.onTranscriptCallback && transcript.trim()) {
          this.onTranscriptCallback(transcript, isFinal);
        }
      };

      rec.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
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

      this.recognition = rec;
      // Start synchronously within user gesture callstack
      rec.start();

    } catch (err) {
      console.warn("Start recognition error:", err);
      this.isListening = false;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(false, err.name || "start_error");
      }
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
   * Speak Tamil with sweet, gentle kid-friendly voice modulation.
   */
  speakTamil(tamilText) {
    if (!tamilText) return;
    const cleanText = tamilText.replace(/[()]/g, "").trim();

    // Natural online audio stream player (plays immediately on mobile)
    const playAudioFallback = () => {
      try {
        if (!this.audioPlayer) this.audioPlayer = new Audio();
        const encoded = encodeURIComponent(cleanText);
        this.audioPlayer.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encoded}`;
        this.audioPlayer.playbackRate = 0.9;
        this.audioPlayer.play().catch(e => console.warn("Audio play notice:", e));
      } catch (err) {
        console.warn("Fallback audio error:", err);
      }
    };

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "ta-IN";
        utterance.rate = 0.85; // Sweet, clear pace
        utterance.pitch = 1.25; // Gentle, high-toned kid pitch
        utterance.volume = 1.0;

        if (this.tamilVoice) {
          utterance.voice = this.tamilVoice;
        }

        let didStart = false;
        utterance.onstart = () => {
          didStart = true;
        };

        utterance.onerror = () => {
          playAudioFallback();
        };

        window.speechSynthesis.speak(utterance);

        // If synthesis is not supported on this mobile device, fallback to natural audio
        setTimeout(() => {
          if (!didStart && (!window.speechSynthesis.speaking)) {
            playAudioFallback();
          }
        }, 350);

      } catch (e) {
        playAudioFallback();
      }
    } else {
      playAudioFallback();
    }
  },

  speakEnglish(englishText) {
    if (!englishText) return;
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(englishText);
        utterance.lang = "en-US";
        utterance.rate = 0.88;
        utterance.pitch = 1.15;

        if (this.englishVoice) {
          utterance.voice = this.englishVoice;
        }
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  }
};

if (typeof window !== "undefined") {
  window.KidSpeechService = KidSpeechService;
}
