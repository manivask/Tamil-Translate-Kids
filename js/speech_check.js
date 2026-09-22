"use strict";

// Intentionally independent of the game, speech synthesis, and audio recorder.
const SpeechCheck = {
  session: null,
  timer: null,
  init() {
    this.tamil = document.getElementById("check-tamil");
    this.english = document.getElementById("check-english");
    this.stop = document.getElementById("stop-check");
    this.status = document.getElementById("check-status");
    this.output = document.getElementById("check-results");
    this.output.textContent = `Browser: ${navigator.userAgent}\nSecure page: ${window.isSecureContext}\n`;
    this.tamil.addEventListener("click", () => this.start("ta-IN"));
    this.english.addEventListener("click", () => this.start("en-US"));
    this.stop.addEventListener("click", () => this.cancel());
    window.addEventListener("pagehide", () => this.cancel());
  },
  log(value) {
    this.output.textContent += `${value}\n`;
  },
  finish(recognition, status) {
    if (this.session !== recognition) return;
    this.session = null;
    clearTimeout(this.timer);
    this.tamil.disabled = this.english.disabled = false;
    this.stop.disabled = true;
    this.status.textContent = status;
    try { recognition.abort(); } catch (_) {}
  },
  cancel() {
    if (this.session) this.finish(this.session, "Check stopped.");
  },
  start(language) {
    if (this.session) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.isSecureContext || typeof Recognition !== "function") {
      this.status.textContent = "Speech recognition requires HTTPS and a browser exposing the speech API.";
      this.log(`${language}: ${this.status.textContent}`);
      return;
    }
    let recognition;
    try {
      recognition = new Recognition();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = true;
      this.session = recognition;
      this.tamil.disabled = this.english.disabled = true;
      this.stop.disabled = false;
      this.status.textContent = "Starting…";
      this.log(`\n${language}: requested`);
      let heard = false;
      recognition.onstart = () => {
        if (this.session === recognition) this.status.textContent = `Listening (${language})…`;
      };
      recognition.onresult = event => {
        if (this.session !== recognition) return;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript.trim();
          if (transcript) {
            heard = true;
            this.log(`${language}: ${result.isFinal ? "final" : "interim"}: ${transcript}`);
            this.status.textContent = `Recognized: ${transcript}`;
          }
        }
      };
      recognition.onerror = event => {
        if (this.session !== recognition) return;
        this.log(`${language}: ${event.error}; browser message: ${event.message || "(none supplied)"}`);
        this.finish(recognition, `Check failed: ${event.error}`);
      };
      recognition.onend = () => {
        if (this.session !== recognition) return;
        this.log(`${language}: ended; words recognized: ${heard}`);
        this.finish(recognition, heard ? "Speech was recognized. Try the other language." : "No words recognized. Try again or test the other language.");
      };
      this.timer = setTimeout(() => {
        if (this.session !== recognition) return;
        this.log(`${language}: timed out; words recognized: ${heard}`);
        this.finish(recognition, "Check ended after 20 seconds.");
      }, 20000);
      // Keep construction and start in the actual button click, with no await.
      recognition.start();
    } catch (error) {
      this.log(`${language}: ${error.name}: ${error.message}`);
      if (this.session) this.finish(recognition, "Could not start speech recognition.");
      else this.status.textContent = "Could not create a speech recognizer.";
    }
  }
};
SpeechCheck.init();
