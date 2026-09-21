/**
 * Tamil-Translate-Kids - Voice Recognition & Soft Tamil Voice Synthesis
 * Cross-platform speech engine for Android, iOS Safari/Chrome, and Desktop.
 * Mimics and matches the robust Apple/iPhone Speech Recognition architecture from Chatbot.
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
    this.setupVoices();
    this.initSpeechRecognition();
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
      console.warn("SpeechRecognition init error:", e);
    }
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

    // SpeechRecognition.start() must run in the original tap call stack on
    // iOS. Do not await getUserMedia before it: doing so loses the user gesture
    // and iOS reports NotAllowedError even when the browser has mic access.
    if (!window.isSecureContext) {
      if (onError) onError("insecure-context");
      return false;
    }

    if (!this.recognition) {
      this.initSpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }

    if (onStart) onStart();

    if (!this.recognition) {
      if (onError) onError("speech-api-unavailable");
      return false;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      if (onStart) onStart();
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
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn("Recognition start exception:", err);
      this.isListening = false;
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
