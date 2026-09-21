/**
 * Tamil-Translate-Kids - Voice Recognition & Soft Tamil Voice Synthesis
 * Cross-platform speech engine for Android, iOS, and Desktop.
 * Uses the same recognition lifecycle as the working Chatbot app.
 */

const KidSpeechService = {
  recognition: null,
  isListening: false,
  isSpeaking: false,
  tamilVoice: null,
  englishVoice: null,
  audioPlayer: null,
  currentLanguage: "ta-IN",

  init() {
    this.audioPlayer = new Audio();
    // Keep one recognizer ready, just like Chatbot. In particular, do not
    // replace it immediately before start(): that can make iOS discard the
    // microphone gesture or throw a generic start error.
    this.initSpeechRecognition();
    this.setupVoices();
    if (window.speechSynthesis && "onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => this.setupVoices();
    }
  },

  setupVoices() {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

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

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
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
    this.stopSpeaking();
    this.logDiagnostic("Speech recognition requested", this.errorDetails(null));

    // This runs directly from the microphone button's click handler. Keep it
    // synchronous so iOS retains the user's microphone gesture.
    if (!window.isSecureContext) {
      this.logDiagnostic("Speech recognition blocked: insecure context");
      if (onError) onError("insecure-context");
      return false;
    }

    // Match Chatbot: reuse the ready recognizer and only construct one if the
    // browser did not provide it during initialization.
    if (!this.recognition) this.initSpeechRecognition();

    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }

    if (!this.recognition) {
      this.logDiagnostic("Speech recognition unavailable: API missing");
      if (onError) onError("speech-api-unavailable");
      return false;
    }

    // Reflect the active state before calling start(), as Chatbot does. This
    // prevents a second tap while iOS is opening the permission sheet.
    this.isListening = true;
    if (onStart) onStart();

    this.recognition.onstart = () => {
      this.isListening = true;
      this.logDiagnostic("Speech recognition started");
    };

    this.recognition.onresult = (event) => {
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

      if (onResult) {
        onResult({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim()
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("SpeechRecognition event note:", event.error);
      this.isListening = false;
      this.logDiagnostic("Speech recognition error", {
        error: event.error,
        message: event.message || "",
        ...this.errorDetails(null)
      });
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.logDiagnostic("Speech recognition ended");
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn("Recognition start exception:", err);
      this.isListening = false;
      this.logDiagnostic("Speech recognition start exception", this.errorDetails(err));
      if (onError) onError("recognition-start-failed");
      if (onEnd) onEnd();
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

  /**
   * Speak Tamil answer with soft, sweet, kid-friendly voice modulation.
   */
  speakTamil(tamilText) {
    if (!tamilText) return;
    this.stopSpeaking();
    this.isSpeaking = true;
    const cleanText = tamilText.replace(/[()]/g, "").trim();

    const playAudioFallback = () => {
      try {
        if (!this.audioPlayer) this.audioPlayer = new Audio();
        const encoded = encodeURIComponent(cleanText);
        this.audioPlayer.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encoded}`;
        this.audioPlayer.playbackRate = 0.9;
        this.audioPlayer.onended = () => { this.isSpeaking = false; };
        this.audioPlayer.onerror = () => { this.isSpeaking = false; };
        this.audioPlayer.play().catch(e => {
          console.warn("Audio notice:", e);
          this.isSpeaking = false;
        });
      } catch (err) {
        console.warn("Audio error:", err);
        this.isSpeaking = false;
      }
    };

    if (window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "ta-IN";
        utterance.rate = 0.85;
        utterance.pitch = 1.25; // Sweet, high-toned kid pitch
        utterance.volume = 1.0;

        if (this.tamilVoice) {
          utterance.voice = this.tamilVoice;
        }

        let started = false;
        utterance.onstart = () => {
          started = true;
        };
        utterance.onend = () => {
          this.isSpeaking = false;
        };
        utterance.onerror = () => {
          playAudioFallback();
        };

        window.speechSynthesis.speak(utterance);

        setTimeout(() => {
          if (!started && (!window.speechSynthesis.speaking)) {
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
    this.stopSpeaking();
    this.isSpeaking = true;
    if (window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(englishText);
        utterance.lang = "en-US";
        utterance.rate = 0.88;
        utterance.pitch = 1.15;

        if (this.englishVoice) {
          utterance.voice = this.englishVoice;
        }
        utterance.onend = () => { this.isSpeaking = false; };
        utterance.onerror = () => { this.isSpeaking = false; };
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        this.isSpeaking = false;
      }
    }
  }
};

if (typeof window !== "undefined") {
  window.KidSpeechService = KidSpeechService;
}
