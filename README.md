# 🦜 Tamil Translate for Kids (தமிழ் குரல் மொழிபெயர்ப்பு)

An interactive, voice-driven Tamil learning web application tailored for young kids aged **7, 8, and 9 (Grades 1, 2, and 3)**. Kids read simple English statements (maximum 5 words) on flashcards, speak the Tamil translation into the microphone, and receive instant percentage match validation, sound effects, star ratings, and celebratory rewards!

---

## 🌟 Key Features

1. **Kid-Friendly Statements (Max 5 Words)**
   - Over **36 curated statements** categorized by **Grade 1, Grade 2, and Grade 3**.
   - Categories include:
     - 🌅 *Daily Routines & Habits (அன்றாட பழக்கங்கள்)*
     - 🏫 *School & Learning (பள்ளி & கல்வி)*
     - 🧸 *Playtime & Friends (விளையாட்டு & நண்பர்கள்)*
     - 🐶 *Animals & Nature (விலங்குகள் & இயற்கை)*
     - 🍕 *Food & Feelings (உணவு & உணர்வுகள்)*
     - 🎨 *Colors & Actions (வண்ணங்கள் & செயல்கள்)*

2. **Smart Multi-Variant Tamil Match Engine**
   - In Tamil, the same English statement can be expressed in multiple correct sentence structures and word orders (e.g., *"அம்மா காலை வணக்கம்"* vs *"காலை வணக்கம் அம்மா"*, or *"சாப்பிட்டேன்"* vs *"சாப்பிட்டு விட்டேன்"*).
   - The engine validates against multiple colloquial & formal variants, word order variations, and keyword stems, calculating a fair percentage match (0% – 100%).

3. **Customizable Difficulty Modes**
   - 🟢 **Easy (50% Pass Threshold)**: Lenient curve for young beginners.
   - 🟡 **Medium (70% Pass Threshold)**: Standard balanced threshold.
   - 🔴 **Hard (85% Pass Threshold)**: High-accuracy mode for grammar masters.

4. **Speech-to-Text & Audio Feedback**
   - **Voice Input**: Choose Tamil (`ta-IN`), English (`en-US`), or Device language from the home screen. The selection is saved on that device for cross-browser testing.
   - **Listen Tamil Audio**: Tap to hear authentic Tamil speech pronunciation (`ta-IN` TTS) with transliteration guidance.
   - **Listen English Audio**: Tap to hear the English sentence.

5. **Gamification & Encouragement**
   - 🌟 Animated Star Rating (1 to 3 stars per sentence).
   - 🎊 Confetti shower and fanfare audio on achieving >= 70% match.
   - 💬 Encouraging Tamil feedback messages (*"அற்புதமாக கூறினீர்கள்!"*, *"மிக நன்று!"*).

6. **Mobile-First & GitHub Pages Ready**
   - Zero-dependency static app (Vanilla HTML, CSS, JavaScript, Web Audio API).
   - Fully optimized for mobile screens (iOS Safari, Android Chrome) and desktops.

---

## 📂 Project Structure

```
Tamil-Translate-Kids/
├── index.html            # Main web application entrypoint
├── sample_sentences      # Master text repository of sentences & Tamil variations
├── css/
│   └── style.css         # Kid-friendly design system & responsive styling
├── js/
│   ├── sentences.js      # Structured dataset of Grade 1-3 sentences & variations
│   ├── matcher.js        # Multi-variant Tamil matching & similarity engine
│   ├── speech.js         # Selectable Speech Recognition input & Tamil TTS playback
│   ├── audio.js          # Web Audio API celebratory synthesizer sound FX
│   └── app.js            # Main application UI controller & state management
└── README.md             # Documentation
```

---

## 🚀 How to Run Locally

Microphone access only works from a secure context: the deployed **HTTPS** site or
`localhost` during development. Do not open `index.html` directly as a `file://`
URL.

1. Run a lightweight local server:
   ```bash
   npx serve .
   ```
   or
   ```bash
   python -m http.server 8080
   ```
2. On an iPhone, open the deployed GitHub Pages HTTPS URL in your browser. When
   the app asks for microphone access, choose **Allow**. If access was
   previously denied, enable that browser under **Settings > Privacy & Security
   > Microphone**, reload the page, and try again.
3. The app keeps **Type manually** available as a fallback; for Tamil dictation,
   enable Tamil in **Settings > General > Keyboard > Dictation**.

---

## 🌐 Deploying to GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Add Tamil Translate for Kids interactive app"
   git push origin main
   ```
2. In GitHub, go to **Settings > Pages**.
3. With this app at the repository root, under **Build and deployment > Source**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
4. Wait for the Pages deployment to finish. Open the HTTPS URL shown in **Settings > Pages**.

## iPhone Validation

Run the speech lifecycle regression check with Node.js:

```bash
node tests/ios-speech-lifecycle.test.js
```

On the deployed HTTPS site, repeat these checks in both iPhone Chrome and Safari:

- Select each grade and move between sentences.
- Tap the microphone, allow access, speak a Tamil answer, and check the transcript and score.
- Stop and restart the microphone, then try another sentence.
- Play both English and Tamil pronunciation audio.
- Check manual Tamil input and answer scoring when speech is unavailable or permission is denied.
- Rotate the phone and check that controls remain visible and usable.

The automated test mocks WebKit recognition; it does not verify real microphone permissions, recognition service availability, or installed Tamil voices. Those require testing on the device.

### Safari speech errors

Microphone permission and speech service availability are separate. WebKit
[documents that Safari recognition requires Siri to be enabled](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/).
The app now displays the recognition error code with specific recovery advice.
After a failure, **Activity Logs** shows recent events and their details;
**Export Logs** downloads the diagnostic report. Record the error code and iOS
version when reporting a device failure.

Recognition starts synchronously on a microphone tap. Pending sessions can be
cancelled, navigation discards old results, and a 20-second timeout releases a
stalled session. These protections do not bypass an unavailable Safari speech
service or add server-based transcription. Tamil keyboard dictation/manual
input remains available when browser recognition fails.

Chrome on iPhone is not a guaranteed workaround for Safari speech failures.
WebKit has documented that an embedding browser can expose
`webkitSpeechRecognition` while rejecting the service with `service-not-allowed`:
https://bugs.webkit.org/show_bug.cgi?id=239816 . This is a documented failure
mode, not proof of the cause on a particular iPhone. The regression suite covers
Safari and Chrome iPhone user agents with an unavailable API, service rejection,
permission denial, unsupported language, capture failure, network failure, and
silence. These simulated cases do not establish real-device compatibility.

For `service-not-allowed` with Siri already working, open **Check speech service**
(`speech-check.html`). Test Tamil and English separately and share the output.
This page has no game/audio-playback dependencies and displays the original
browser error message. It does not save audio or change practice scores.
English success with Tamil failure suggests a language-specific issue; failure
in both languages needs further service/permission investigation.

WebKit's `SpeechRecognitionPermissionManager.cpp` uses `service-not-allowed`
for both service permission denial and locale-specific service unavailability:
https://github.com/WebKit/WebKit/blob/main/Source/WebKit/UIProcess/SpeechRecognitionPermissionManager.cpp
Siri working therefore does not establish that Tamil browser recognition works.
