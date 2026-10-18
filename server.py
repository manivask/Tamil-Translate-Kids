"""Local development server and SQLite learning-progress + Reading materials API."""
import json
import sqlite3
import urllib.parse
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DB = ROOT / "data" / "learning_progress.db"
MATERIALS_FILE = ROOT / "data" / "reading_club" / "teacher_uploaded_materials.json"


def initialize_database():
    DB.parent.mkdir(exist_ok=True)
    with sqlite3.connect(DB) as connection:
        connection.execute("""CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
            grade INTEGER NOT NULL, sentence_id TEXT NOT NULL, category TEXT,
            score INTEGER NOT NULL, stars INTEGER NOT NULL, passed INTEGER NOT NULL, recorded_at TEXT NOT NULL)""")
    MATERIALS_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not MATERIALS_FILE.exists():
        MATERIALS_FILE.write_text("[]", encoding="utf-8")


def read_materials():
    if not MATERIALS_FILE.exists():
        return []
    try:
        return json.loads(MATERIALS_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def write_materials(materials):
    MATERIALS_FILE.parent.mkdir(parents=True, exist_ok=True)
    MATERIALS_FILE.write_text(json.dumps(materials, ensure_ascii=False, indent=2), encoding="utf-8")


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _json(self, status, data):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/progress":
            with sqlite3.connect(DB) as connection:
                rows = connection.execute(
                    "SELECT first_name, last_name, grade, sentence_id, category, score, stars, passed, recorded_at FROM progress ORDER BY id"
                ).fetchall()
            return self._json(
                HTTPStatus.OK,
                [
                    {
                        "student": {"firstName": row[0], "lastName": row[1], "grade": row[2]},
                        "sentenceId": row[3],
                        "category": row[4],
                        "score": row[5],
                        "stars": row[6],
                        "passed": bool(row[7]),
                        "recordedAt": row[8],
                    }
                    for row in rows
                ],
            )
        if parsed.path == "/api/reading-materials":
            return self._json(HTTPStatus.OK, read_materials())
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/session":
            return self._json(HTTPStatus.OK, {"ok": True})
        if parsed.path == "/api/progress":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                data = json.loads(self.rfile.read(length))
                student = data["student"]
                values = (
                    student["firstName"],
                    student["lastName"],
                    int(student["grade"]),
                    data["sentenceId"],
                    data.get("category", ""),
                    int(data["score"]),
                    int(data["stars"]),
                    int(bool(data["passed"])),
                    data.get("recordedAt") or datetime.now(timezone.utc).isoformat(),
                )
                with sqlite3.connect(DB) as connection:
                    connection.execute(
                        "INSERT INTO progress (first_name,last_name,grade,sentence_id,category,score,stars,passed,recorded_at) VALUES (?,?,?,?,?,?,?,?,?)",
                        values,
                    )
                return self._json(HTTPStatus.CREATED, {"ok": True})
            except (KeyError, TypeError, ValueError, json.JSONDecodeError):
                return self._json(HTTPStatus.BAD_REQUEST, {"error": "Invalid progress record"})

        if parsed.path == "/api/reading-materials":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                data = json.loads(self.rfile.read(length).decode("utf-8"))
                materials = read_materials()
                if isinstance(data, list):
                    materials.extend(data)
                elif isinstance(data, dict):
                    # Check if updating or deleting
                    action = data.get("action")
                    if action == "delete":
                        mat_id = data.get("id")
                        materials = [m for m in materials if m.get("id") != mat_id]
                    else:
                        materials.append(data)
                write_materials(materials)
                return self._json(HTTPStatus.OK, {"ok": True, "count": len(materials)})
            except Exception as e:
                return self._json(HTTPStatus.BAD_REQUEST, {"error": str(e)})

        return self._json(HTTPStatus.NOT_FOUND, {"error": "Not found"})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/reading-materials":
            query = urllib.parse.parse_qs(parsed.query)
            mat_id = query.get("id", [""])[0]
            if not mat_id:
                try:
                    length = int(self.headers.get("Content-Length", "0"))
                    if length > 0:
                        body = json.loads(self.rfile.read(length).decode("utf-8"))
                        mat_id = body.get("id", "")
                except Exception:
                    pass
            materials = [m for m in read_materials() if m.get("id") != mat_id]
            write_materials(materials)
            return self._json(HTTPStatus.OK, {"ok": True, "deletedId": mat_id})
        return self._json(HTTPStatus.NOT_FOUND, {"error": "Not found"})


if __name__ == "__main__":
    initialize_database()
    print("Tamil Web Learning - Kids: http://localhost:8080")
    ThreadingHTTPServer(("", 8080), Handler).serve_forever()
