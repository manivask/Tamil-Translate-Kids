"use strict";

// Reproduces the WebKit API shape exposed by iPhone Safari. This verifies the
// recognizer is constructed and started in the microphone tap's call stack.
const assert = require("node:assert");
const fs = require("node:fs");
const vm = require("node:vm");

const recognizers = [];
const timers = new Map();
let timerId = 0;

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

  abort() { this.aborted = true; }
}

const context = {
  console,
  setTimeout(fn) { timers.set(++timerId, fn); return timerId; },
  clearTimeout(id) { timers.delete(id); },
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

service.startListening();
assert.strictEqual(service.isStarting, true);
assert.strictEqual(service.startListening(), false, "double taps cannot overlap pending sessions");
const stale = recognizers.at(-1);
service.cancelListening();
let newStarts = 0;
service.startListening({ onStart: () => newStarts++ });
stale.onstart();
stale.onend();
assert.strictEqual(service.isStarting, true, "late events cannot clear the new session");
assert.strictEqual(newStarts, 0);
service.cancelListening();

let error;
let finishes = 0;
service.startListening({ onError: value => error = value, onEnd: () => finishes++ });
const failed = recognizers.at(-1);
failed.onerror({ error: "service-not-allowed" });
failed.onend();
assert.strictEqual(error, "service-not-allowed");
assert.strictEqual(finishes, 1, "error followed by end finishes only once");
assert.strictEqual(timers.size, 0);

service.startListening({ onError: value => error = value });
recognizers.at(-1).onend();
assert.strictEqual(error, "no-speech", "silent termination is explained");
service.startListening({ onError: value => error = value });
const hung = recognizers.at(-1);
timers.get(service.recognitionTimer)();
assert.strictEqual(error, "recognition-timeout");
assert.strictEqual(hung.aborted, true, "hung sessions release the microphone");
assert.strictEqual(service.isStarting, false);

let utterance;
context.speechSynthesis.speak = value => { utterance = value; };
service.speakTamil("வணக்கம்");
const delayedFallback = [...timers.values()][0];
service.startListening();
delayedFallback();
utterance.onerror();
assert.strictEqual(service.audioPlayer.src, undefined, "cancelled pronunciation cannot restart audio over recognition");
service.cancelListening();
console.log("PASS: pending taps, stale events, errors, silence, timeout, and cancelled pronunciation");

vm.runInContext(fs.readFileSync("js/app.js", "utf8"), context, { filename: "js/app.js" });
const app = context.App;
const element = () => ({ textContent: "", classList: { add() {}, remove() {}, toggle() {} } });
app.elements = {
  spokenTextDisplay: element(), micPromptText: element(), listeningHint: element(),
  manualInputBox: element(), manualTextInput: element(), micBtn: element()
};
let evaluations = [];
app.evaluateTamilInput = value => evaluations.push(value);
context.scrollTo = () => {};
app.toggleMic();
recognizers.at(-1).onerror({ error: "service-not-allowed" });
assert.match(app.elements.spokenTextDisplay.textContent, /service-not-allowed/);
assert.match(app.elements.listeningHint.textContent, /Siri/);
app.toggleMic();
const previousCard = recognizers.at(-1);
app.showScreen("topic");
previousCard.onresult({ resultIndex: 0, results: [{ 0: { transcript: "old answer" }, isFinal: true }] });
assert.strictEqual(evaluations.length, 0, "navigation discards results from the previous card");
app.toggleMic();
const finalSession = recognizers.at(-1);
finalSession.onstart();
const result = { resultIndex: 0, results: [{ 0: { transcript: "வணக்கம்" }, isFinal: true }] };
finalSession.onresult(result);
finalSession.onresult(result);
finalSession.onend();
assert.deepStrictEqual(evaluations, ["வணக்கம்"], "a final answer is evaluated exactly once");
assert.strictEqual(service.recognition, null);
console.log("PASS: app error visibility, navigation cancellation, and single evaluation");
