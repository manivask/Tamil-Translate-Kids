"""Local development server and simple SQLite learning-progress API."""
import json
import sqlite3
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DB = ROOT / "data" / "learning_progress.db"


def initialize_database():
    DB.parent.mkdir(exist_ok=True)
    with sqlite3.connect(DB) as connection:
        connection.execute("""CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
            grade INTEGER NOT NULL, sentence_id TEXT NOT NULL, category TEXT,
            score INTEGER NOT NULL, stars INTEGER NOT NULL, passed INTEGER NOT NULL, recorded_at TEXT NOT NULL)""")


class Handler(SimpleHTTPRequestHandler):
    def _json(self, status, data):
        payload = json.dumps(data).encode("utf-8")
        self.send_response(status); self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload))); self.end_headers(); self.wfile.write(payload)

    def do_GET(self):
        if self.path == "/api/progress":
            with sqlite3.connect(DB) as connection:
                rows = connection.execute("SELECT first_name, last_name, grade, sentence_id, category, score, stars, passed, recorded_at FROM progress ORDER BY id").fetchall()
            return self._json(HTTPStatus.OK, [{"student": {"firstName": row[0], "lastName": row[1], "grade": row[2]}, "sentenceId": row[3], "category": row[4], "score": row[5], "stars": row[6], "passed": bool(row[7]), "recordedAt": row[8]} for row in rows])
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/session": return self._json(HTTPStatus.OK, {"ok": True})
        if self.path != "/api/progress": return self._json(HTTPStatus.NOT_FOUND, {"error": "Not found"})
        try:
            length = int(self.headers.get("Content-Length", "0")); data = json.loads(self.rfile.read(length))
            student = data["student"]
            values = (student["firstName"], student["lastName"], int(student["grade"]), data["sentenceId"], data.get("category", ""), int(data["score"]), int(data["stars"]), int(bool(data["passed"])), data.get("recordedAt") or datetime.now(timezone.utc).isoformat())
            with sqlite3.connect(DB) as connection: connection.execute("INSERT INTO progress (first_name,last_name,grade,sentence_id,category,score,stars,passed,recorded_at) VALUES (?,?,?,?,?,?,?,?,?)", values)
            return self._json(HTTPStatus.CREATED, {"ok": True})
        except (KeyError, TypeError, ValueError, json.JSONDecodeError): return self._json(HTTPStatus.BAD_REQUEST, {"error": "Invalid progress record"})


if __name__ == "__main__":
    initialize_database(); print("Tamil Kids Voice: http://localhost:8080")
    ThreadingHTTPServer(("", 8080), Handler).serve_forever()
