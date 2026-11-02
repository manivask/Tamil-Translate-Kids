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
  })]
]);

const context = {
  console,
  URLSearchParams,
  window: { location: { hash: "" } },
  document: { getElementById: () => null, addEventListener() {} },
  fetch: async () => ({
    json: async () => ({
      students: [{ firstName: "Mira", lastName: "Shah", grade: 4 }]
    })
  }),
  localStorage: {
    getItem: key => stored.get(key) || null
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
  assert.equal(app.students.find(student => student.id === "TBTA-CUSTOM-1").school, "Online", "saved school assignment is applied");
  assert.deepEqual(Array.from(app.getStudentClubs(app.students.find(student => student.id === "TBTA-CUSTOM-1"))), ["reading"], "saved group assignment is keyed by student ID");

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

  for (const file of ["clubs-management.html", "students-qr.html"]) {
    const html = fs.readFileSync(path.join(appDirectory, file), "utf8");
    const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
      .map(match => match[1])
      .filter(script => script.trim());
    assert.ok(inlineScripts.length, `${file} contains inline scripts`);
    for (const script of inlineScripts) {
      assert.doesNotThrow(() => new vm.Script(script), `${file} inline script parses`);
    }
  }

  console.log("PASS: local student assignments, cross-device QR login, and student-page scripts");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
