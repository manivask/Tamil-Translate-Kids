const API_ROOT = "https://api.github.com";
const PROGRESS_FILE_LIMIT = 48_000;

function jsonResponse(data, status, origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Vary"] = "Origin";
  }
  return new Response(status === 204 ? null : JSON.stringify(data), { status, headers });
}

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
  return origin && allowed.includes(origin) ? origin : null;
}

function studentId(student) {
  if (student.id) return String(student.id);
  const name = `${student.firstName || ""}_${student.lastName || ""}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `G${Number(student.grade)}_${name}`;
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(value) {
  const binary = atob(value.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)));
}

function githubHeaders(env) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Tamil-Translate-Kids-Progress-Worker"
  };
}

function githubUrl(path, env) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${API_ROOT}/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/${encodedPath}`;
}

async function getGithubFile(path, env) {
  const url = new URL(githubUrl(path, env));
  url.searchParams.set("ref", env.GITHUB_BRANCH || "main");
  const response = await fetch(url, { headers: githubHeaders(env) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub read failed (${response.status})`);
  const result = await response.json();
  return { sha: result.sha, text: decodeBase64(result.content || "") };
}

async function readRegisteredStudents(env) {
  const rosterFile = await getGithubFile("data/students/roster.json", env);
  if (!rosterFile) throw new Error("Student roster was not found");
  const roster = JSON.parse(rosterFile.text);
  if (!Array.isArray(roster.students)) throw new Error("Student roster is invalid");

  const students = new Map();
  for (const student of roster.students) {
    if (!student.firstName || !student.lastName || !Number.isInteger(Number(student.grade))) continue;
    students.set(studentId(student), {
      id: studentId(student),
      firstName: String(student.firstName),
      lastName: String(student.lastName),
      grade: Number(student.grade)
    });
  }
  return students;
}

async function listProgress(env) {
  const path = env.GITHUB_PROGRESS_PATH || "data/progress";
  const url = new URL(githubUrl(path, env));
  url.searchParams.set("ref", env.GITHUB_BRANCH || "main");
  const response = await fetch(url, { headers: githubHeaders(env) });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`GitHub progress listing failed (${response.status})`);
  const files = await response.json();
  if (!Array.isArray(files)) throw new Error("GitHub progress folder is invalid");

  const results = await Promise.all(files
    .filter(file => file.type === "file" && file.name.endsWith(".json"))
    .map(async file => {
      const contents = await getGithubFile(`${path}/${file.name}`, env);
      if (!contents) return [];
      const studentProgress = JSON.parse(contents.text);
      if (!Array.isArray(studentProgress.records)) return [];
      return studentProgress.records.map(record => ({
        ...record,
        studentId: studentProgress.studentId,
        student: studentProgress.student
      }));
    }));
  return results.flat().sort((a, b) => String(a.recordedAt).localeCompare(String(b.recordedAt)));
}

async function saveProgress(record, student, env) {
  const progressPath = env.GITHUB_PROGRESS_PATH || "data/progress";
  const filename = `${encodeURIComponent(student.id)}.json`;
  const path = `${progressPath}/${filename}`;
  const recordId = String(record.recordId);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const currentFile = await getGithubFile(path, env);
    const saved = currentFile ? JSON.parse(currentFile.text) : {
      version: 1,
      studentId: student.id,
      student,
      records: []
    };
    if (!Array.isArray(saved.records)) throw new Error("Student progress file is invalid");
    if (saved.records.some(item => item.recordId === recordId)) return { duplicate: true };

    const next = {
      version: 1,
      studentId: student.id,
      student,
      records: [...saved.records, record]
    };
    const body = {
      message: `Save learning progress for ${student.id}`,
      content: encodeBase64(`${JSON.stringify(next, null, 2)}\n`),
      branch: env.GITHUB_BRANCH || "main"
    };
    if (currentFile) body.sha = currentFile.sha;

    const response = await fetch(githubUrl(path, env), {
      method: "PUT",
      headers: { ...githubHeaders(env), "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (response.ok) return { duplicate: false };
    if (response.status !== 409 && response.status !== 422) {
      throw new Error(`GitHub progress save failed (${response.status})`);
    }
  }
  throw new Error("Progress was updated simultaneously; please retry");
}

function validateRecord(data) {
  return data &&
    typeof data.recordId === "string" && data.recordId.length > 0 && data.recordId.length <= 120 &&
    typeof data.sentenceId === "string" && data.sentenceId.length > 0 && data.sentenceId.length <= 200 &&
    typeof data.category === "string" && data.category.length <= 120 &&
    Number.isInteger(data.score) && data.score >= 0 && data.score <= 100 &&
    Number.isInteger(data.stars) && data.stars >= 0 && data.stars <= 3 &&
    typeof data.passed === "boolean" &&
    typeof data.recordedAt === "string" && Number.isFinite(Date.parse(data.recordedAt));
}

export default {
  async fetch(request, env) {
    const origin = allowedOrigin(request, env);
    if (!origin) return jsonResponse({ error: "Origin is not allowed" }, 403);
    if (request.method === "OPTIONS") return jsonResponse({}, 204, origin);

    const url = new URL(request.url);
    if (url.pathname !== "/api/progress") return jsonResponse({ error: "Not found" }, 404, origin);
    if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
      return jsonResponse({ error: "Progress storage is not configured" }, 503, origin);
    }

    try {
      if (request.method === "GET") {
        return jsonResponse(await listProgress(env), 200, origin);
      }
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405, origin);
      }

      const text = await request.text();
      if (text.length > PROGRESS_FILE_LIMIT) return jsonResponse({ error: "Request is too large" }, 413, origin);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return jsonResponse({ error: "Invalid JSON" }, 400, origin);
      }
      if (!validateRecord(data)) return jsonResponse({ error: "Invalid progress record" }, 400, origin);

      const students = await readRegisteredStudents(env);
      const student = students.get(String(data.studentId || ""));
      if (!student) return jsonResponse({ error: "Student is not registered in the roster" }, 403, origin);

      const record = {
        recordId: data.recordId,
        sentenceId: data.sentenceId,
        category: data.category,
        score: data.score,
        stars: data.stars,
        passed: data.passed,
        recordedAt: data.recordedAt
      };
      const result = await saveProgress(record, student, env);
      return jsonResponse({ ok: true, duplicate: result.duplicate }, 201, origin);
    } catch (error) {
      console.error("Progress API error:", error);
      return jsonResponse({ error: "Progress could not be saved" }, 502, origin);
    }
  }
};
