# Security and multi-user readiness

## Current status

This repository is a learning-app prototype, **not yet safe for production use with real student records or a shared network**.

The following issues must be resolved before inviting the planned group of approximately 10 members:

- Student roster and club-enrollment JSON files are tracked in this public repository. Anyone who can access the repository can download them. A client-side login screen does not protect static files.
- Teacher/admin authentication is currently implemented in browser JavaScript, including fixed credentials and permissive login logic. QR badges are identifiers, not proof of identity. Browser-side checks can be bypassed.
- The Python API has no server-side authentication or role-based authorization. Its progress endpoint returns all saved progress, and reading-material endpoints can be changed by any client that can reach the server.
- GitHub Pages uses per-browser local storage, while the local Python server writes to SQLite. This does not yet provide reliable shared progress across devices.
- Voice samples and diagnostic logs may be saved in browser local storage. Do not collect or retain identifiable children's voice recordings unless the school has approved the purpose, consent, retention, and access controls.

## Changes in this branch

- The Python server binds to `127.0.0.1` by default instead of all network interfaces.
- It refuses non-loopback binding unless the explicit development-only `TBTA_ALLOW_INSECURE_LAN=1` override is set.
- Request bodies are size-limited and JSON/content-type checked.
- Progress and reading-material payloads are validated before writing.
- Reading-material JSON writes are atomic; SQLite has a busy timeout and useful indexes.
- Basic browser security headers are sent, and directory listings are disabled.

These are hardening measures, **not a replacement for authentication**. Do not set `TBTA_ALLOW_INSECURE_LAN=1` on a production server. Before multi-user deployment, implement server-side accounts/sessions, role and record-level authorization, private student data delivery, HTTPS/reverse proxy configuration, backups, and an approved voice-data policy.

## Recommended next milestone

1. Move the real roster and enrollment data out of the public Git repository and serve them only to authorized sessions.
2. Replace the client-side teacher/admin checks and static staff QR codes with server-verified accounts.
3. Enforce roles on every API request, including progress reads and reading-material create/update/delete.
4. Establish one shared source of truth for progress and enrollment; define backup and restore procedures.
5. Test the complete login, voice, progress, and teacher-material workflows on phones before deployment.

Until those milestones are complete, keep the production site and this development branch separate and use synthetic student data for testing.
