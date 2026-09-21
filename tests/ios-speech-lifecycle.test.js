"use strict";

// Reproduces the WebKit API shape exposed by iPhone Safari. This verifies the
// recognizer is constructed and started in the microphone tap's call stack.
const assert = require("node:assert");
const fs = require("node:fs");
const vm = require("node:vm");

const recognizers = [];

class WebKitSpeechRecognitionMock {
  constructor() {
    recognizers.push(this);
    this.lang = "";
  }

  start() {
    this.started = true;
  }

  stop() {
    this.stopped = true;
  }
}

const context = {
  console,
  Audio: class { pause() {} },
  URL: { revokeObjectURL() {} },
  SpeechSynthesisUtterance: class {},
  navigator: {
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
    platform: "iPhone",
    maxTouchPoints: 5
  },
  speechSynthesis: { getVoices: () => [], cancel() {} },
  webkitSpeechRecognition: WebKitSpeechRecognitionMock,
  isSecureContext: true,
  location: { origin: "https://example.github.io" }
};
context.window = context;
vm.createContext(context);
vm.runInContext(
  fs.readFileSync("js/speech.js", "utf8"),
  context,
  { filename: "js/speech.js" }
);

const service = context.KidSpeechService;
service.init();
assert.strictEqual(recognizers.length, 0, "page initialization does not create a recognizer");

let startCalls = 0;
let endCalls = 0;
let transcript = null;
assert.strictEqual(service.startListening({
  onStart: () => { startCalls += 1; },
  onEnd: () => { endCalls += 1; },
  onResult: (result) => { transcript = result; }
}), true);

assert.strictEqual(recognizers.length, 1, "start creates the WebKit recognizer in the tap gesture");
assert.strictEqual(recognizers[0].lang, "ta-IN", "Tamil recognition language is used");
assert.strictEqual(recognizers[0].started, true, "recognition starts successfully");
recognizers[0].onstart();
assert.strictEqual(startCalls, 1, "the UI receives its listening callback");

recognizers[0].onresult({
  resultIndex: 0,
  results: [{ 0: { transcript: "வணக்கம்" }, isFinal: true }]
});
assert.strictEqual(transcript.final, "வணக்கம்", "final Tamil text reaches the UI");
assert.strictEqual(transcript.interim, "", "no interim text is reported for a final result");

recognizers[0].onend();
assert.strictEqual(endCalls, 1, "the UI receives its stopped callback");
assert.strictEqual(service.isListening, false, "listening state is cleaned up");

console.log("PASS: iPhone WebKit speech-recognition lifecycle");
