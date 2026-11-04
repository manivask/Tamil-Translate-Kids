"use strict";

const assert = require("node:assert/strict");
const { Buffer } = require("node:buffer");

const files = new Map();
const roster = {
  students: [
    { firstName: "Rithanya", lastName: "Elumalai", grade: 1 },
    { firstName: "Mila", lastName: "Magesh", grade: 1 }
  ]
};

function toContents(path, text, sha) {
  return { name: path.split("/").pop(), type: "file", sha, content: Buffer.from(text).toString("base64") };
}

files.set("data/students/roster.json", {
  text: JSON.stringify(roster),
  sha: "roster-sha"
});

global.fetch = async (input, options = {}) => {
  const url = new URL(input);
  const path = decodeURIComponent(url.pathname.split("/contents/")[1] || "");
  if (options.method === "PUT") {
    const body = JSON.parse(options.body);
    const current = files.get(path);
    if (current && body.sha !== current.sha) return new Response("", { status: 409 });
    const sha = `sha-${(current ? Number(current.sha.split("-").pop()) + 1 : 1)}`;
    files.set(path, { text: Buffer.from(body.content, "base64").toString("utf8"), sha });
    return new Response("{}", { status: 201 });
  }
  if (files.has(path)) {
    const file = files.get(path);
    return Response.json(toContents(path, file.text, file.sha));
  }
  if (path === "data/progress") {
    const entries = Array.from(files.entries())
      .filter(([name]) => name.startsWith("data/progress/") && name.endsWith(".json"))
      .map(([name, file]) => toContents(name, file.text, file.sha));
    return Response.json(entries);
  }
  return new Response("", { status: 404 });
};

(async () => {
  const { default: worker } = await import("../worker/src/index.mjs");
  const env = {
    GITHUB_TOKEN: "test-token",
    GITHUB_OWNER: "manivask",
    GITHUB_REPO: "Tamil-Translate-Kids",
    GITHUB_BRANCH: "main",
    GITHUB_PROGRESS_PATH: "data/progress",
    ALLOWED_ORIGINS: "https://manivask.github.io"
  };
  const origin = "https://manivask.github.io";
  const request = (method, body, path = "/api/progress") => new Request(`https://worker.test${path}`, {
    method,
    headers: { Origin: origin, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const options = await worker.fetch(request("OPTIONS"), env);
  assert.equal(options.status, 204);
  assert.equal(options.headers.get("Access-Control-Allow-Origin"), origin);

  const baseRecord = {
    studentId: "G1_RITHANYA_ELUMALAI",
    recordId: "attempt-1",
    sentenceId: "rc-week5-1",
    category: "reading-club",
    score: 100,
    stars: 3,
    passed: true,
    recordedAt: "2026-11-04T20:00:00.000Z",
    student: { firstName: "Forged", lastName: "Name", grade: 8 }
  };
  const saved = await worker.fetch(request("POST", baseRecord), env);
  assert.equal(saved.status, 201);
  assert.equal((await saved.json()).ok, true);

  const duplicate = await worker.fetch(request("POST", baseRecord), env);
  assert.equal((await duplicate.json()).duplicate, true);

  const listed = await worker.fetch(request("GET"), env);
  const results = await listed.json();
  assert.equal(results.length, 1);
  assert.equal(results[0].student.firstName, "Rithanya", "student identity comes from the registered roster");
  assert.equal(results[0].student.grade, 1);

  const unknown = await worker.fetch(request("POST", { ...baseRecord, studentId: "NOT_REGISTERED" }), env);
  assert.equal(unknown.status, 403);
  const malformed = await worker.fetch(request("POST", { ...baseRecord, score: 101 }), env);
  assert.equal(malformed.status, 400);
  const wrongOrigin = await worker.fetch(new Request("https://worker.test/api/progress", {
    method: "GET",
    headers: { Origin: "https://example.com" }
  }), env);
  assert.equal(wrongOrigin.status, 403);

  console.log("PASS: public GitHub-backed progress API validation, persistence, deduplication and CORS");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
