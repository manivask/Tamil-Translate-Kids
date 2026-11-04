"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const appDirectory = path.join(__dirname, "..");

const stored = new Map([
  ["tbta_custom_students", JSON.stringify([
    { id: "TBTA-CUSTOM-1", firstName: "Mira", lastName: "Rao", grade: 4, school: "FHS" }
  ])],
  ["tbta_student_club_enrollments", JSON.stringify({
    "TBTA-CUSTOM-1": {
      id: "TBTA-CUSTOM-1",
      firstName: "Mira",
      lastName: "Rao",
      grade: 4,
      school: "Online",
      clubs: ["reading"]
    }
  })],
  ["tbta_removed_students", JSON.stringify(["Mira_Shah_G4"])]
]);

const context = {
  console,
  URLSearchParams,
  window: { location: { hash: "" } },
  document: { getElementById: () => null, addEventListener() {} },
  fetch: async () => ({
    json: async () => ({
      students: [
        { firstName: "Mira", lastName: "Shah", grade: 4 },
        { firstName: "Nila", lastName: "Rao", grade: 2 }
      ]
    })
  }),
  localStorage: {
    getItem: key => stored.get(key) || null,
    setItem: (key, value) => stored.set(key, value)
  },
  KidAudioFX: { playSuccessFanfare() {} },
  setTimeout() { return 1; }
};
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(appDirectory, "js", "app.js"), "utf8"), context, { filename: "js/app.js" });

const app = vm.runInContext("App", context);

(async () => {
  await app.loadStudents();
  assert.equal(app.students.length, 2, "locally created students are included with the supplied roster");
  assert.equal(app.students.some(student => student.firstName === "Mira" && student.lastName === "Shah"), false, "locally removed roster students are hidden");
  assert.equal(app.students.find(student => student.id === "TBTA-CUSTOM-1").school, "Online", "saved school assignment is applied");
  assert.deepEqual(Array.from(app.getStudentClubs(app.students.find(student => student.id === "TBTA-CUSTOM-1"))), ["reading"], "saved group assignment is keyed by student ID");
  assert.equal(app.getProgressStudentId({ firstName: "Rithanya", lastName: "Elumalai", grade: 1 }), "G1_RITHANYA_ELUMALAI", "roster students get a stable progress ID");
  assert.equal(app.getProgressStudentId({ id: "TBTA-CUSTOM-1", firstName: "Mira", lastName: "Rao", grade: 4 }), "TBTA-CUSTOM-1", "assigned student IDs are preserved");
  assert.equal(app.getProgressEndpoint(), "/api/progress", "local server endpoint remains the default");

  const requests = [];
  context.window.TAMIL_KIDS_PROGRESS_API_URL = "https://progress.example.workers.dev/";
  context.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 201, json: async () => ({ ok: true }) };
  };
  app.currentStudent = { firstName: "Rithanya", lastName: "Elumalai", grade: 1 };
  app.elements = {};
  app.updateStudentDashboard = () => {};
  await app.saveProgress({
    sentenceId: "rc-week5-1",
    category: "reading-club",
    score: 100,
    stars: 3,
    passed: true
  });
  assert.equal(requests[0].url, "https://progress.example.workers.dev/api/progress", "configured Worker endpoint is used");
  const savedProgress = JSON.parse(requests[0].options.body);
  assert.equal(savedProgress.studentId, "G1_RITHANYA_ELUMALAI");
  assert.equal(savedProgress.student.firstName, "Rithanya");
  assert.ok(savedProgress.recordId, "saved records have a retry-safe ID");

  app.elements = { qrScanStatus: { textContent: "" } };
  app.stopQrScanner = () => {};
  app.triggerConfetti = () => {};
  app.saveSession = () => {};
  app.selectGrade = () => {};
  const remoteStudentQr = JSON.stringify({
    type: "TBTA_STUDENT",
    id: "TBTA-REMOTE-1",
    firstName: "Mira",
    lastName: "Rao",
    grade: 4,
    school: "CHS",
    clubs: ["aathichudi"]
  });

  assert.equal(app.handleScannedQr(remoteStudentQr), true, "QR supports students created on another device");
  assert.equal(app.currentStudent.id, "TBTA-REMOTE-1", "QR login keeps the student ID");
  assert.equal(app.currentStudent.school, "CHS", "QR login carries the student's school");
  assert.deepEqual(Array.from(app.getStudentClubs(app.currentStudent)), ["aathichudi"], "QR login carries the assigned group");

  stored.set("tbta_removed_students", JSON.stringify(["TBTA-REMOVED-1"]));
  assert.equal(app.handleScannedQr(JSON.stringify({
    type: "TBTA_STUDENT",
    id: "TBTA-REMOVED-1",
    firstName: "Removed",
    lastName: "Student",
    grade: 4
  })), false, "a removed student's previous QR is rejected");
  assert.match(app.elements.qrScanStatus.textContent, /removed/i, "removed QR gives a clear status");

  for (const file of ["clubs-management.html", "students-qr.html"]) {
    const html = fs.readFileSync(path.join(appDirectory, file), "utf8");
    const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
      .map(match => match[1])
      .filter(script => script.trim());
    assert.ok(inlineScripts.length, `${file} contains inline scripts`);
    for (const script of inlineScripts) {
      assert.doesNotThrow(() => new vm.Script(script), `${file} inline script parses`);
    }
    if (file === "clubs-management.html") {
      assert.match(html, /function normalizeName\(value\)/, "student names are normalized before duplicate checks");
      assert.match(html, /already exists .*Student was not added/, "duplicate names display a warning");
      assert.match(html, /data-remove-key=/, "admin can remove students");
    }
    if (file === "students-qr.html") {
      for (const club of ["reading", "thirukkural", "aathichudi", "school"]) {
        assert.match(html, new RegExp(`<input type="checkbox" value="${club}"`), `${club} has a QR filter`);
      }
      assert.match(html, /id="download-qr-batch-btn"/, "filtered QR batches can be downloaded");
      assert.match(html, /class="badge-card-download-btn"/, "individual full student badges can be downloaded");
      assert.match(html, /function createZip\(files\)/, "batch download is packaged as a ZIP");
      assert.match(html, /function getFullBadgePngBlob\(student, card\)/, "downloads render the complete student badge");
    }
  }

  console.log("PASS: local student assignments, cross-device QR login, and student-page scripts");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
