/**
 * Tamil-Translate-Kids - Voice Recognition & Soft Tamil Voice Synthesis
 * Cross-platform speech engine for Android, iOS, and Desktop.
 * Keeps Safari's recognizer creation inside the microphone tap gesture.
 */

const KidSpeechService = {
  recognition: null,
  isListening: false,
  isStarting: false,
  recognitionTimer: null,
  speechGeneration: 0,
  isSpeaking: false,
  tamilVoice: null,
  englishVoice: null,
  audioPlayer: null,
  currentLanguage: "ta-IN",
  languageMode: "ta-IN",
  languageStorageKey: "tamil_kids_voice_input_mode",

  init() {
    this.restoreInputLanguage();
    this.audioPlayer = new Audio();
    this.setupVoices();
    if (window.speechSynthesis && "onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => this.setupVoices();
    }
  },

  getDeviceLanguage() {
    return (typeof navigator !== "undefined" && navigator.language) || "ta-IN";
  },

  setInputLanguage(mode, { persist = true } = {}) {
    const supportedModes = ["ta-IN", "en-US", "device"];
    this.languageMode = supportedModes.includes(mode) ? mode : "ta-IN";
    this.currentLanguage = this.languageMode === "device" ? this.getDeviceLanguage() : this.languageMode;
    if (persist) {
      try { localStorage.setItem(this.languageStorageKey, this.languageMode); } catch (_) {}
    }
    this.logDiagnostic("Voice input language changed", {
      mode: this.languageMode,
      language: this.currentLanguage
    });
    return this.currentLanguage;
  },

  restoreInputLanguage() {
    let savedMode = "ta-IN";
    try { savedMode = localStorage.getItem(this.languageStorageKey) || savedMode; } catch (_) {}
    this.setInputLanguage(savedMode, { persist: false });
  },

  setupVoices() {
    if (!window.speechSynthesis) return;
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      if (!voices || voices.length === 0) return;

      this.tamilVoice = 
        voices.find(v => {
          const l = (v.lang || "").toLowerCase().replace("_", "-");
          const n = (v.name || "").toLowerCase();
          return (l.startsWith("ta") && (n.includes("kani") || n.includes("female") || n.includes("natural") || n.includes("valluvar") || n.includes("latha") || n.includes("vani") || n.includes("iniyan"))) ||
                 (n.includes("tamil") || n.includes("தமிழ்"));
        }) ||
        voices.find(v => {
          const l = (v.lang || "").toLowerCase().replace("_", "-");
          return l.startsWith("ta") || l === "ta-in" || l === "ta-lk" || l === "ta-sg";
        }) ||
        null;

      this.englishVoice = 
        voices.find(v => {
          const l = (v.lang || "").toLowerCase().replace("_", "-");
          const n = (v.name || "").toLowerCase();
          return l.startsWith("en") && (n.includes("kid") || n.includes("child") || n.includes("samantha") || n.includes("natural") || n.includes("female"));
        }) ||
        voices.find(v => (v.lang || "").toLowerCase().replace("_", "-") === "en-us") ||
        voices.find(v => (v.lang || "").toLowerCase().startsWith("en")) ||
        null;
    } catch (_) {}
  },

  isSupported() {
    return typeof this.getRecognitionConstructor() === "function";
  },

  getRecognitionConstructor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  },

  initSpeechRecognition() {
    const SpeechRecognition = this.getRecognitionConstructor();
    if (typeof SpeechRecognition !== "function") return;

    try {
      // Safari associates access to its Siri-powered recognition service with
      // the user gesture. Recreate the recognizer during the microphone tap,
      // rather than reusing one constructed while the page was loading.
      if (this.recognition) {
        try { this.recognition.abort(); } catch (_) {}
      }
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;
      this.recognition.maxAlternatives = 1;
    } catch (e) {
      this.recognition = null;
      console.warn("SpeechRecognition init error:", e);
      this.logDiagnostic("Speech recognizer construction failed", this.errorDetails(e));
    }
  },

  errorDetails(error) {
    return {
      name: error && error.name ? error.name : "unknown",
      message: error && error.message ? error.message : String(error || "unknown"),
      language: this.currentLanguage,
      secureContext: window.isSecureContext,
      origin: window.location.origin,
      hasSpeechRecognition: !!window.SpeechRecognition,
      hasWebkitSpeechRecognition: !!window.webkitSpeechRecognition,
      userAgent: navigator.userAgent
    };
  },

  logDiagnostic(action, details = {}) {
    if (window.KidAppLogger) KidAppLogger.log("VOICE", action, details);
  },

  stopSpeaking() {
    this.speechGeneration += 1;
    if (window.responsiveVoice && typeof responsiveVoice.cancel === "function") {
      try { responsiveVoice.cancel(); } catch (_) {}
    }
    if (this.audioPlayer) {
      try {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
      } catch (_) {}
      if (this.audioPlayer.src && this.audioPlayer.src.startsWith("blob:")) {
        URL.revokeObjectURL(this.audioPlayer.src);
      }
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    this.isSpeaking = false;
  },

  startListening({ onStart, onResult, onError, onEnd } = {}) {
    if (this.isStarting || this.isListening) return false;
    this.stopSpeaking();
    this.logDiagnostic("Speech recognition requested", this.errorDetails(null));

    // This runs directly from the microphone button's click handler. Keep it
    // synchronous so iOS retains the user's microphone gesture.
    if (!window.isSecureContext) {
      this.logDiagnostic("Speech recognition blocked: insecure context");
      if (onError) onError("insecure-context");
      return false;
    }

    // Must remain synchronous and within the mic button's click call stack.
    // Safari otherwise rejects its speech service with service-not-allowed.
    this.initSpeechRecognition();

    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }

    if (!this.recognition) {
      this.logDiagnostic("Speech recognition unavailable: API missing");
      if (onError) onError("speech-api-unavailable");
      return false;
    }

    const recognition = this.recognition;
    const active = () => this.recognition === recognition;
    let heardSpeech = false;
    const finish = (error) => {
      if (!active()) return;
      clearTimeout(this.recognitionTimer);
      this.recognition = null;
      this.isStarting = false;
      this.isListening = false;
      if (error) {
        try { recognition.abort(); } catch (_) {}
        if (onError) onError(error);
      }
      if (onEnd) onEnd();
    };
    this.isStarting = true;
    // Some Safari failures emit neither an error nor an end event.
    this.recognitionTimer = setTimeout(() => finish("recognition-timeout"), 20000);

    this.recognition.onstart = () => {
      if (!active()) return;
      this.isStarting = false;
      this.isListening = true;
      this.logDiagnostic("Speech recognition started");
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      if (!active()) return;
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript.trim();
        if (!transcript) continue;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript + " ";
        }
      }

      heardSpeech = heardSpeech || !!(finalTranscript || interimTranscript);
      if (onResult) {
        onResult({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim()
        });
      }
    };

    this.recognition.onerror = (event) => {
      if (!active()) return;
      console.warn("SpeechRecognition event note:", event.error);
      this.isListening = false;
      this.logDiagnostic("Speech recognition error", {
        ...this.errorDetails(null),
        error: event.error,
        message: event.message || ""
      });
      finish(event.error);
    };

    this.recognition.onend = () => {
      if (!active()) return;
      this.logDiagnostic("Speech recognition ended");
      finish(heardSpeech ? null : "no-speech");
    };

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn("Recognition start exception:", err);
      this.isListening = false;
      this.logDiagnostic("Speech recognition start exception", this.errorDetails(err));
      const errorName = err && err.name ? err.name : "";
      finish(errorName === "NotAllowedError" ? "not-allowed" : "recognition-start-failed");
      return false;
    }
  },

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        try {
          this.recognition.abort();
        } catch (_) {}
      }
    }
  },

  cancelListening() {
    const recognition = this.recognition;
    this.recognition = null;
    clearTimeout(this.recognitionTimer);
    this.isStarting = false;
    this.isListening = false;
    if (recognition) {
      try { recognition.abort(); } catch (_) {}
    }
  },

  /**
   * Speak Tamil answer with soft, sweet, kid-friendly voice modulation.
   */
  speakTamil(tamilText) {
    if (!tamilText) return;
    this.stopSpeaking();
    this.cancelListening();
    const generation = this.speechGeneration;
    this.isSpeaking = true;
    const cleanText = tamilText.replace(/[()]/g, "").trim();

    // 1. Audio stream playback helper using reliable tw-ob endpoint
    const playAudioStream = () => {
      if (generation !== this.speechGeneration) return;
      try {
        if (!this.audioPlayer) this.audioPlayer = new Audio();
        const encoded = encodeURIComponent(cleanText);
        this.audioPlayer.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encoded}`;
        this.audioPlayer.playbackRate = 0.92;
        this.audioPlayer.onended = () => {
          if (generation === this.speechGeneration) this.isSpeaking = false;
        };
        this.audioPlayer.onerror = (err) => {
          console.warn("Tamil audio stream notice:", err);
          if (generation === this.speechGeneration) this.isSpeaking = false;
        };
        if (typeof this.audioPlayer.play === "function") {
          const playPromise = this.audioPlayer.play();
          if (playPromise !== undefined && typeof playPromise.catch === "function") {
            playPromise.catch(e => {
              console.warn("Audio play promise notice:", e);
              if (generation === this.speechGeneration) this.isSpeaking = false;
            });
          }
        }
      } catch (err) {
        console.warn("Audio stream error:", err);
        if (generation === this.speechGeneration) this.isSpeaking = false;
      }
    };

    // 2. Ensure SpeechSynthesis voices are initialized
    this.setupVoices();

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "ta-IN";
        utterance.rate = 0.88;
        utterance.pitch = 1.05;
        utterance.volume = 1.0;

        if (this.tamilVoice) {
          utterance.voice = this.tamilVoice;
        }

        let started = false;
        utterance.onstart = () => {
          started = true;
          this.isSpeaking = true;
        };
        utterance.onend = () => {
          if (generation === this.speechGeneration) this.isSpeaking = false;
        };
        utterance.onerror = (e) => {
          console.warn("SpeechSynthesis Tamil notice:", e);
          playAudioStream();
        };

        window.speechSynthesis.speak(utterance);

        setTimeout(() => {
          if (!this.tamilVoice || (!started && !window.speechSynthesis.speaking)) {
            playAudioStream();
          }
        }, 150);
        return;
      } catch (e) {
        console.warn("SpeechSynthesis exception:", e);
        playAudioStream();
        return;
      }
    }

    playAudioStream();
  },

  speakEnglish(englishText) {
    if (!englishText) return;
    this.stopSpeaking();
    this.cancelListening();
    const generation = this.speechGeneration;
    this.isSpeaking = true;

    const playAudioStream = () => {
      if (generation !== this.speechGeneration) return;
      try {
        if (!this.audioPlayer) this.audioPlayer = new Audio();
        const encoded = encodeURIComponent(englishText);
        this.audioPlayer.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encoded}`;
        this.audioPlayer.playbackRate = 0.95;
        this.audioPlayer.onended = () => {
          if (generation === this.speechGeneration) this.isSpeaking = false;
        };
        this.audioPlayer.onerror = () => {
          if (generation === this.speechGeneration) this.isSpeaking = false;
        };
        if (typeof this.audioPlayer.play === "function") {
          const playPromise = this.audioPlayer.play();
          if (playPromise !== undefined && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
              if (generation === this.speechGeneration) this.isSpeaking = false;
            });
          }
        }
      } catch (_) {
        if (generation === this.speechGeneration) this.isSpeaking = false;
      }
    };

    this.setupVoices();

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(englishText);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        utterance.pitch = 1.05;
        utterance.volume = 1.0;

        if (this.englishVoice) {
          utterance.voice = this.englishVoice;
        }
        utterance.onend = () => {
          if (generation === this.speechGeneration) this.isSpeaking = false;
        };
        utterance.onerror = () => {
          playAudioStream();
        };
        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        playAudioStream();
        return;
      }
    }

    playAudioStream();
  }
};

if (typeof window !== "undefined") {
  window.KidSpeechService = KidSpeechService;
}
