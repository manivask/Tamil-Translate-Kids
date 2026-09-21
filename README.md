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
   - **Voice Input**: Web Speech Recognition API (`ta-IN`) with pulsating kid-friendly microphone animations.
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
│   ├── speech.js         # Speech Recognition (ta-IN) & Tamil TTS playback
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
3. Under **Build and deployment > Source**, select **Deploy from a branch** and choose `main` branch `/ (root)` or `apps/Tamil-Translate-Kids`.
4. Your live app URL will be available immediately!
