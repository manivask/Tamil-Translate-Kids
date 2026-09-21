# 🎙️ Input Voice Data Repository (`input_voice_data/`)

This directory is dedicated to collecting and organizing spoken voice samples from kids of various age groups (Ages 7, 8, and 9) across various devices (iOS / iPhone, Android, Windows, Mac).

---

## 🎯 Purpose
1. **Kid Voice Tone Analysis**: Collect authentic spoken Tamil pronunciation samples from young children.
2. **Speech Recognition Training & Tuning**: Build an acoustic and phonetic dataset of children's Tamil accents, pitch variations, and regional dialects to optimize accuracy.
3. **Offline Voice Dataset Backup**: Store audio waveforms (`.webm` / `.mp4` / `.wav`) paired with sentence metadata (sentence ID, target Tamil phrase, transcribed text, percentage match score).

---

## 📂 Sample Data Structure

Each recorded voice session contains:
```json
{
  "voiceId": "voice_g1_01_1726880000000",
  "timestamp": "2026-09-20T23:35:00.000Z",
  "grade": 1,
  "category": "daily",
  "sentenceId": "g1_01",
  "english": "Good morning, Amma.",
  "targetTamil": "காலை வணக்கம், அம்மா.",
  "spokenTranscript": "காலை வணக்கம் அம்மா",
  "matchPercentage": 100,
  "starsEarned": 3,
  "deviceInfo": {
    "device": "iOS / iPhone",
    "browser": "Safari",
    "audioMimeType": "audio/mp4"
  },
  "audioBase64": "data:audio/mp4;base64,..."
}
```

---

## 💾 Exporting Recorded Voices
Users and administrators can click **🎧 Voice Recordings / 💾 Export Voice Data** inside the application to download the collected voice recordings and audio dataset for analysis.
