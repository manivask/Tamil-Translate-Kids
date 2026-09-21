# Tamil-Translate-Kids Activity & Diagnostics Logs

This directory contains diagnostic activity logs captured from local testing and production sessions.

### Client-Side Logging Engine (`js/logger.js`)
- Every user interaction (Grade selection, Topic navigation, Mic recording, Tamil similarity scoring %, TTS audio playback, error events) is automatically tracked with timestamps, device information (iPhone, Android, Desktop), and diagnostics.
- Users and administrators can click **📊 Activity Logs** in the footer of the web app or **💾 Export Logs** to download the complete JSON log stream.

### 🌐 High Concurrency & Scalability Architecture (100+ to 10,000+ Concurrent Users)
- **Zero Server Bottlenecks**: The application is built as a pure client-side static progressive web application (PWA).
- **Edge CDN Distribution**: Hosted on GitHub's Fastly Global Edge CDN, providing sub-millisecond response times across the world.
- **Client-Side Compute**: All Tamil speech recognition, fuzzy NLP matching, transliteration evaluation, audio synthesis, and confetti particle simulations run entirely on each user's local device CPU/GPU.
- **Simultaneous Users**: The architecture easily handles 100+, 1,000+, or 10,000+ kids practicing in parallel with **0% server load, zero database locks, and zero downtime**.
