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
assert.strictEqual(recognizers[0].lang, "en-US", "English recognition language is used");
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

// These are API simulations, not real-device browser tests. In particular,
// microphone permission does not guarantee access to an iOS speech service.
for (const browser of ["Version/18.0 Mobile/15E148 Safari/604.1", "CriOS/140.0.0.0 Mobile/15E148 Safari/604.1"]) {
  context.navigator.userAgent = `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 ${browser}`;
  context.navigator.permissions = { query: async () => ({ state: "granted" }) };
  context.navigator.mediaDevices = { getUserMedia() { throw new Error("Recognition must not request a competing audio stream"); } };
  for (const code of ["not-allowed", "service-not-allowed", "language-not-supported", "audio-capture", "network", "no-speech"]) {
    app.toggleMic();
    const failedSession = recognizers.at(-1);
    failedSession.onerror({ error: code });
    failedSession.onend();
    assert.ok(app.elements.spokenTextDisplay.textContent.includes(`(${code})`));
    assert.strictEqual(app.isListening, false);
    assert.strictEqual(service.isStarting, false);
    assert.strictEqual(service.recognition, null);
  }
  context.webkitSpeechRecognition = undefined;
  app.toggleMic();
  assert.match(app.elements.spokenTextDisplay.textContent, /speech-api-unavailable/);
  context.webkitSpeechRecognition = class extends WebKitSpeechRecognitionMock {
    start() { const error = new Error("Permission denied"); error.name = "NotAllowedError"; throw error; }
  };
  app.toggleMic();
  assert.match(app.elements.spokenTextDisplay.textContent, /\(not-allowed\)/);
  context.webkitSpeechRecognition = WebKitSpeechRecognitionMock;
  console.log(`PASS: iPhone ${browser.split(" ")[0]} API failure matrix`);
}

const diagnostics = [];
context.KidAppLogger = { log(category, action, details) { diagnostics.push({ action, details }); } };
service.startListening();
recognizers.at(-1).onerror({ error: "service-not-allowed", message: "Speech recognition service is not available" });
assert.strictEqual(diagnostics.find(entry => entry.action === "Speech recognition error").details.message,
  "Speech recognition service is not available", "browser error details must not be overwritten");

const controls = {};
context.document = { getElementById(id) {
  return controls[id] ||= { textContent: "", disabled: false, addEventListener(type, callback) { this[type] = callback; } };
} };
context.addEventListener = () => {};
vm.runInContext(fs.readFileSync("js/speech_check.js", "utf8"), context);
controls["check-tamil"].click();
const tamilCheck = recognizers.at(-1);
assert.strictEqual(tamilCheck.lang, "ta-IN");
assert.strictEqual(tamilCheck.started, true, "check starts in click handler");
tamilCheck.onerror({ error: "service-not-allowed", message: "Speech recognition service is not available" });
assert.match(controls["check-results"].textContent, /browser message: Speech recognition service is not available/);
assert.strictEqual(controls["check-english"].disabled, false);
controls["check-english"].click();
const englishCheck = recognizers.at(-1);
assert.strictEqual(englishCheck.lang, "en-US");
tamilCheck.onend();
assert.strictEqual(controls["check-tamil"].disabled, true, "old check cannot end a new check");
englishCheck.onresult({ resultIndex: 0, results: [{ 0: { transcript: "hello" }, isFinal: true }] });
englishCheck.onend();
assert.match(controls["check-results"].textContent, /en-US: final: hello/);
assert.deepStrictEqual(evaluations, ["வணக்கம்"], "diagnostic speech is never scored");
assert.strictEqual(service.currentLanguage, "ta-IN", "diagnostic language never changes practice language");
controls["check-tamil"].click();
const cancelledCheck = recognizers.at(-1);
controls["stop-check"].click();
assert.strictEqual(cancelledCheck.aborted, true);
assert.strictEqual(controls["stop-check"].disabled, true);
console.log("PASS: original browser message preserved; independent Tamil/English checks and cancellation");
