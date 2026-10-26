"""Local development server for the Tamil learning app.

Security note:
- This is a development backend, not a production multi-user service.
- It binds to loopback by default.
- Do not expose it to a LAN or the internet until server-side authentication,
  role-based authorization, private roster delivery, and HTTPS are implemented.
"""
import json
import os
import ipaddress
import sqlite3
import tempfile
import urllib.parse
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DB = ROOT / "data" / "learning_progress.db"
MATERIALS_FILE = ROOT / "data" / "reading_club" / "teacher_uploaded_materials.json"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8080
MAX_BODY_BYTES = 1_048_576
VALID_GRADES = set(range(1, 9))


def initialize_database():
    DB.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB, timeout=10) as connection:
        connection.execute("PRAGMA journal_mode=WAL")
        connection.execute("""CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 8),
            sentence_id TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT '',
            score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
            stars INTEGER NOT NULL CHECK (stars BETWEEN 0 AND 3),
            passed INTEGER NOT NULL CHECK (passed IN (0, 1)),
            recorded_at TEXT NOT NULL
        )""")
        connection.execute("CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(first_name, last_name, grade)")
        connection.execute("CREATE INDEX IF NOT EXISTS idx_progress_recorded_at ON progress(recorded_at)")
    MATERIALS_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not MATERIALS_FILE.exists():
        write_materials([])


def read_materials():
    if not MATERIALS_FILE.exists():
        return []
    try:
        data = json.loads(MATERIALS_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (OSError, json.JSONDecodeError):
        return []


def write_materials(materials):
    MATERIALS_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(materials, ensure_ascii=False, indent=2)
    # Replace atomically so a concurrent read cannot see a partially written file.
    fd, temp_name = tempfile.mkstemp(prefix=".materials-", suffix=".tmp", dir=MATERIALS_FILE.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            stream.write(payload)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp_name, MATERIALS_FILE)
    finally:
        try:
            os.unlink(temp_name)
        except FileNotFoundError:
            pass


def valid_text(value, *, max_length=200, allow_empty=False):
    return (
        isinstance(value, str)
        and (allow_empty or bool(value.strip()))
        and len(value.strip()) <= max_length
        and not any(ord(ch) < 32 and ch not in "\\t\\n\\r" for ch in value)
    )


def validate_progress(data):
    if not isinstance(data, dict) or not isinstance(data.get("student"), dict):
        return None
    student = data["student"]
    first_name = student.get("firstName")
    last_name = student.get("lastName")
    sentence_id = data.get("sentenceId")
    category = data.get("category", "")
    try:
        grade = int(student.get("grade"))
        score = int(data.get("score"))
        stars = int(data.get("stars"))
    except (TypeError, ValueError, OverflowError):
        return None
    passed = data.get("passed")
    if not valid_text(first_name, max_length=100) or not valid_text(last_name, max_length=100):
        return None
    if grade not in VALID_GRADES or not valid_text(sentence_id, max_length=160):
        return None
    if not valid_text(category, max_length=120, allow_empty=True):
        return None
    if not 0 <= score <= 100 or not 0 <= stars <= 3 or not isinstance(passed, bool):
        return None
    recorded_at = data.get("recordedAt")
    if recorded_at is None:
        recorded_at = datetime.now(timezone.utc).isoformat()
    if not valid_text(recorded_at, max_length=80):
        return None
    return (
        first_name.strip(), last_name.strip(), grade, sentence_id.strip(),
        category.strip(), score, stars, int(passed), recorded_at
    )


def validate_material(material):
    if not isinstance(material, dict):
        return False
    if not valid_text(material.get("id"), max_length=120):
        return False
    if not valid_text(material.get("title", material.get("fileName", "")), max_length=200):
        return False
    try:
        grade = int(material.get("grade", 1))
    except (TypeError, ValueError, OverflowError):
        return False
    sentences = material.get("sentences")
    if grade not in VALID_GRADES or not isinstance(sentences, list) or not sentences or len(sentences) > 500:
        return False
    for sentence in sentences:
        if not isinstance(sentence, dict):
            return False
        tamil = sentence.get("tamil", sentence.get("sentenceTa", ""))
        english = sentence.get("english", sentence.get("meaningEn", ""))
        if not valid_text(tamil, max_length=2000) or not valid_text(english, max_length=2000, allow_empty=True):
            return False
    return True


class Handler(SimpleHTTPRequestHandler):
    server_version = "TamilLearningDevServer"
    sys_version = ""

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()")
        super().end_headers()

    def list_directory(self, path):
        self.send_error(HTTPStatus.FORBIDDEN, "Directory listing is disabled")
        return None

    def _json(self, status, data):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _read_json_body(self):
        content_type = self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
        if content_type != "application/json":
            raise ValueError("Content-Type must be application/json")
        raw_length = self.headers.get("Content-Length", "")
        try:
            length = int(raw_length)
        except (TypeError, ValueError):
            raise ValueError("Invalid Content-Length")
        if length < 1 or length > MAX_BODY_BYTES:
            raise OverflowError("Request body size is invalid")
        raw = self.rfile.read(length)
        if len(raw) != length:
            raise ValueError("Incomplete request body")
        try:
            return json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise ValueError("Invalid JSON")

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/progress":
            with sqlite3.connect(DB, timeout=10) as connection:
                rows = connection.execute(
                    "SELECT first_name, last_name, grade, sentence_id, category, score, stars, passed, recorded_at FROM progress ORDER BY id"
                ).fetchall()
            return self._json(HTTPStatus.OK, [
                {
                    "student": {"firstName": row[0], "lastName": row[1], "grade": row[2]},
                    "sentenceId": row[3], "category": row[4], "score": row[5],
                    "stars": row[6], "passed": bool(row[7]), "recordedAt": row[8],
                } for row in rows
            ])
        if parsed.path == "/api/reading-materials":
            return self._json(HTTPStatus.OK, read_materials())
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path not in {"/api/session", "/api/progress", "/api/reading-materials"}:
            return self._json(HTTPStatus.NOT_FOUND, {"error": "Not found"})
        try:
            data = self._read_json_body()
        except OverflowError:
            return self._json(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, {"error": "Request body too large or empty"})
        except ValueError:
            return self._json(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON request"})

        # Session endpoint is currently a compatibility stub, not authentication.
        if parsed.path == "/api/session":
            return self._json(HTTPStatus.NOT_IMPLEMENTED, {"error": "Server-side authentication is not configured"})

        if parsed.path == "/api/progress":
            values = validate_progress(data)
            if values is None:
                return self._json(HTTPStatus.BAD_REQUEST, {"error": "Invalid progress record"})
            with sqlite3.connect(DB, timeout=10) as connection:
                connection.execute(
                    "INSERT INTO progress (first_name,last_name,grade,sentence_id,category,score,stars,passed,recorded_at) VALUES (?,?,?,?,?,?,?,?,?)",
                    values,
                )
            return self._json(HTTPStatus.CREATED, {"ok": True})

        if isinstance(data, list):
            if not data or len(data) > 100 or not all(validate_material(item) for item in data):
                return self._json(HTTPStatus.BAD_REQUEST, {"error": "Invalid reading materials"})
            materials = read_materials()
            existing_ids = {item.get("id") for item in materials if isinstance(item, dict)}
            if any(item["id"] in existing_ids for item in data):
                return self._json(HTTPStatus.CONFLICT, {"error": "A material with that ID already exists"})
            materials.extend(data)
        elif isinstance(data, dict) and data.get("action") == "delete":
            material_id = data.get("id")
            if not valid_text(material_id, max_length=120):
                return self._json(HTTPStatus.BAD_REQUEST, {"error": "Invalid material ID"})
            materials = [item for item in read_materials() if item.get("id") != material_id]
        elif validate_material(data):
            materials = read_materials()
            if any(item.get("id") == data["id"] for item in materials):
                return self._json(HTTPStatus.CONFLICT, {"error": "A material with that ID already exists"})
            materials.append(data)
        else:
            return self._json(HTTPStatus.BAD_REQUEST, {"error": "Invalid reading material"})
        write_materials(materials)
        return self._json(HTTPStatus.OK, {"ok": True, "count": len(materials)})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/api/reading-materials":
            return self._json(HTTPStatus.NOT_FOUND, {"error": "Not found"})
        query = urllib.parse.parse_qs(parsed.query)
        material_id = query.get("id", [""])[0]
        if not valid_text(material_id, max_length=120):
            return self._json(HTTPStatus.BAD_REQUEST, {"error": "A valid material ID is required"})
        materials = read_materials()
        filtered = [item for item in materials if item.get("id") != material_id]
        write_materials(filtered)
        return self._json(HTTPStatus.OK, {"ok": True, "deleted": len(materials) - len(filtered)})


def configured_host():
    host = os.environ.get("TBTA_HOST", DEFAULT_HOST).strip() or DEFAULT_HOST
    try:
        address = ipaddress.ip_address(host)
        is_loopback = address.is_loopback
    except ValueError:
        is_loopback = host.lower() == "localhost"
    if not is_loopback and os.environ.get("TBTA_ALLOW_INSECURE_LAN") != "1":
        raise SystemExit(
            "Refusing to bind to a network interface without explicit opt-in. "
            "Use TBTA_HOST=127.0.0.1 for local development. "
            "Do not enable LAN access until authentication and authorization are implemented."
        )
    return host


if __name__ == "__main__":
    initialize_database()
    host = configured_host()
    port = int(os.environ.get("TBTA_PORT", str(DEFAULT_PORT)))
    print(f"Tamil Web Learning - Kids development server: http://{host}:{port}")
    if host != "127.0.0.1" and host != "localhost":
        print("WARNING: LAN binding is enabled but this development API has no authentication.")
        print("Do not use with real student data or expose it to the internet.")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
