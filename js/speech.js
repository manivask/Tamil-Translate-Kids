/**
 * Tamil-Translate-Kids - Voice Recognition & Speech Synthesis (ta-IN)
 * Integrates SpeechRecognition for Tamil speech-to-text and SpeechSynthesis for Tamil TTS.
 */

const KidSpeechService = {
  recognition: null,
  isListening: false,
  tamilVoice: null,
  onTranscriptCallback: null,
  onStateChangeCallback: null,

  init() {
    // 1. Initialize Speech Recognition
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = "ta-IN"; // Tamil (India)

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      };

      this.recognition.onresult = (event) => {
        let transcript = "";
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }

        if (this.onTranscriptCallback) {
          this.onTranscriptCallback(transcript, isFinal);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech Recognition Error:", event.error);
        this.isListening = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false, event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      };
    }

    // 2. Initialize Voices for Text-to-Speech
    this.loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  },

  loadVoices() {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    // Look for Tamil voice (ta-IN, ta, Valluvar, Tamil, etc.)
    this.tamilVoice = voices.find(v => v.lang.startsWith("ta") || v.name.toLowerCase().includes("tamil")) || null;
  },

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  startListening(onTranscript, onStateChange) {
    this.onTranscriptCallback = onTranscript;
    this.onStateChangeCallback = onStateChange;

    if (!this.recognition) {
      this.init();
    }

    if (!this.recognition) {
      if (onStateChange) onStateChange(false, "not_supported");
      return;
    }

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already active or failed to start:", e);
    }
  },

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("Stop recognition error:", e);
      }
    }
    this.isListening = false;
  },

  // Speak Tamil text out loud for kids to hear correct pronunciation
  speakTamil(tamilText) {
    if (!window.speechSynthesis || !tamilText) return;

    window.speechSynthesis.cancel(); // Stop any previous utterance

    const utterance = new SpeechSynthesisUtterance(tamilText);
    utterance.lang = "ta-IN";
    utterance.rate = 0.85; // Slightly slower for kids to hear clearly
    utterance.pitch = 1.1; // Friendly pitch

    if (this.tamilVoice) {
      utterance.voice = this.tamilVoice;
    }

    window.speechSynthesis.speak(utterance);
  },

  // Speak English sentence
  speakEnglish(englishText) {
    if (!window.speechSynthesis || !englishText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(englishText);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.05;

    window.speechSynthesis.speak(utterance);
  }
};

if (typeof window !== "undefined") {
  window.KidSpeechService = KidSpeechService;
}
