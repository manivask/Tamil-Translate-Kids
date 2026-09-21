/**
 * Tamil-Translate-Kids - Main Interactive Application Logic
 * Coordinates 3-Screen Flow (Grade -> Topics -> Practice), UI, Voice Recognition,
 * Multi-variant Matching, Sound FX, and Progress Tracking.
 */

const App = {
  // State
  currentScreen: "grade", // 'grade' | 'topic' | 'practice'
  currentGrade: 1,
  currentCategory: "all",
  currentMode: "medium", // 'easy' (50%), 'medium' (70%), 'hard' (85%)
  currentIndex: 0,
  activeSentences: [],
  totalStarsEarned: 0,
  isAnswerRevealed: false,
  isListening: false,
  completedIds: new Set(),

  // Topic Metadata
  topicsMeta: [
    { key: "all", labelEn: "All Topics", labelTa: "எல்லா தலைப்புகளும்", icon: "✨", isAll: true },
    { key: "daily", labelEn: "Daily Habits", labelTa: "அன்றாட பழக்கங்கள்", icon: "🌅" },
    { key: "school", labelEn: "School & Learn", labelTa: "பள்ளி & கல்வி", icon: "🏫" },
    { key: "play", labelEn: "Play & Friends", labelTa: "விளையாட்டு & தோழர்கள்", icon: "🧸" },
    { key: "nature", labelEn: "Animals & Nature", labelTa: "விலங்குகள் & இயற்கை", icon: "🐶" },
    { key: "feelings", labelEn: "Food & Feelings", labelTa: "உணவு & உணர்வுகள்", icon: "🍕" },
    { key: "actions", labelEn: "Colors & Actions", labelTa: "வண்ணங்கள் & செயல்கள்", icon: "🎨" }
  ],

  // DOM Elements
  elements: {},

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.initConfetti();
    KidSpeechService.init();

    // Start on Grade Selection Screen (Page 1)
    this.showScreen("grade");
  },

  cacheDOM() {
    this.elements = {
      // Screens
      screenGrade: document.getElementById("screen-grade"),
      screenTopic: document.getElementById("screen-topic"),
      screenPractice: document.getElementById("screen-practice"),

      // Navigation & Branding
      brandHomeBtn: document.getElementById("brand-home-btn"),
      backToGradeBtn: document.getElementById("back-to-grade-btn"),
      backToTopicsBtn: document.getElementById("back-to-topics-btn"),
      topicScreenGradeBadge: document.getElementById("topic-screen-grade-badge"),
      practiceGradeBadge: document.getElementById("practice-grade-badge"),
      topicsGrid: document.getElementById("topics-grid"),

      // Grade Selection Cards (Page 1)
      gradeCards: document.querySelectorAll(".grade-card"),

      // Mode Selector (Page 3)
      modePills: document.querySelectorAll(".mode-pill"),

      // Flashcard UI (Page 3)
      cardIndexLabel: document.getElementById("card-index-label"),
      cardCatBadge: document.getElementById("card-cat-badge"),
      englishText: document.getElementById("english-text"),
      listenEnBtn: document.getElementById("listen-en-btn"),
      micBtn: document.getElementById("mic-btn"),
      micPromptText: document.getElementById("mic-prompt-text"),
      listeningHint: document.getElementById("listening-hint"),
      spokenTextDisplay: document.getElementById("spoken-text-display"),
      validationZone: document.getElementById("validation-zone"),
      matchNumber: document.getElementById("match-number"),
      matchUnit: document.getElementById("match-unit"),
      progressBarFill: document.getElementById("progress-bar-fill"),
      feedbackMsg: document.getElementById("feedback-msg"),
      starIcons: document.querySelectorAll(".validation-zone .star"),
      totalStarsCount: document.getElementById("total-stars-count"),
      revealAnswerBtn: document.getElementById("reveal-answer-btn"),
      tamilAnswerContent: document.getElementById("tamil-answer-content"),
      tamilTextPrimary: document.getElementById("tamil-text-primary"),
      translitText: document.getElementById("translit-text"),
      listenTamilBtn: document.getElementById("listen-tamil-btn"),
      prevBtn: document.getElementById("prev-btn"),
      nextBtn: document.getElementById("next-btn"),
      toggleManualBtn: document.getElementById("toggle-manual-btn"),
      manualInputBox: document.getElementById("manual-input-box"),
      manualTextInput: document.getElementById("manual-text-input"),
      manualSubmitBtn: document.getElementById("manual-submit-btn"),
      confettiCanvas: document.getElementById("confetti-canvas")
    };
  },

  bindEvents() {
    // 1. Home / Brand button (Returns to Page 1 from anywhere)
    this.elements.brandHomeBtn.addEventListener("click", () => {
      KidAudioFX.playClick();
      this.showScreen("grade");
    });

    // 2. Grade Cards on Page 1
    this.elements.gradeCards.forEach(card => {
      card.addEventListener("click", () => {
        const grade = parseInt(card.getAttribute("data-grade"), 10);
        KidAudioFX.playClick();
        this.selectGrade(grade);
      });
    });

    // 3. Back buttons
    this.elements.backToGradeBtn.addEventListener("click", () => {
      KidAudioFX.playClick();
      this.showScreen("grade");
    });

    this.elements.backToTopicsBtn.addEventListener("click", () => {
      KidAudioFX.playClick();
      this.showScreen("topic");
    });

    // 4. Difficulty mode switcher (Page 3)
    this.elements.modePills.forEach(pill => {
      pill.addEventListener("click", () => {
        const mode = pill.getAttribute("data-mode");
        KidAudioFX.playClick();
        this.setMode(mode);
      });
    });

    // 5. Listen to English audio
    this.elements.listenEnBtn.addEventListener("click", () => {
      KidAudioFX.playClick();
      const current = this.getCurrentSentence();
      if (current) {
        KidSpeechService.speakEnglish(current.english);
      }
    });

    // 6. Mic button
    this.elements.micBtn.addEventListener("click", () => {
      this.toggleMic();
    });

    // 7. Listen to Tamil answer audio
    this.elements.listenTamilBtn.addEventListener("click", () => {
      KidAudioFX.playClick();
      const current = this.getCurrentSentence();
      if (current) {
        KidSpeechService.speakTamil(current.tamilPrimary);
      }
    });

    // 8. Reveal answer toggle
    this.elements.revealAnswerBtn.addEventListener("click", () => {
      KidAudioFX.playClick();
      this.toggleRevealAnswer();
    });

    // 9. Navigation
    this.elements.prevBtn.addEventListener("click", () => {
      KidAudioFX.playClick();
      this.prevCard();
    });

    this.elements.nextBtn.addEventListener("click", () => {
      KidAudioFX.playClick();
      this.nextCard();
    });

    // 10. Manual Tamil input drawer
    this.elements.toggleManualBtn.addEventListener("click", () => {
      KidAudioFX.playClick();
      this.elements.manualInputBox.classList.toggle("show");
    });

    this.elements.manualSubmitBtn.addEventListener("click", () => {
      const text = this.elements.manualTextInput.value.trim();
      if (text) {
        this.processSpokenTranscript(text, true);
        this.elements.manualTextInput.value = "";
      }
    });

    this.elements.manualTextInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.elements.manualSubmitBtn.click();
      }
    });
  },

  // Screen Switcher
  showScreen(screenName) {
    this.currentScreen = screenName;
    this.elements.screenGrade.classList.toggle("active", screenName === "grade");
    this.elements.screenTopic.classList.toggle("active", screenName === "topic");
    this.elements.screenPractice.classList.toggle("active", screenName === "practice");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // Page 1 -> Page 2: Select Grade
  selectGrade(grade) {
    this.currentGrade = grade;
    const gradeLabels = {
      1: "🌟 1st Grade (1-ஆம் வகுப்பு)",
      2: "🚀 2nd Grade (2-ஆம் வகுப்பு)",
      3: "👑 3rd Grade (3-ஆம் வகுப்பு)"
    };
    const label = gradeLabels[grade] || `Grade ${grade}`;
    this.elements.topicScreenGradeBadge.textContent = label;
    this.elements.practiceGradeBadge.textContent = label;

    this.renderTopicsGrid();
    this.showScreen("topic");
  },

  // Render Page 2 Topic Grid with sentence counts
  renderTopicsGrid() {
    if (typeof SENTENCE_DATA === "undefined") return;

    const gradeSentences = SENTENCE_DATA.filter(s => s.grade === this.currentGrade);
    this.elements.topicsGrid.innerHTML = "";

    this.topicsMeta.forEach(topic => {
      const count = topic.key === "all"
        ? gradeSentences.length
        : gradeSentences.filter(s => s.category === topic.key).length;

      // Skip empty categories for this grade
      if (count === 0 && topic.key !== "all") return;

      const card = document.createElement("button");
      card.className = `topic-card ${topic.isAll ? "all-topics-card" : ""}`;
      card.innerHTML = `
        <div class="topic-icon">${topic.icon}</div>
        <div class="topic-info">
          <div class="topic-title-en">${topic.labelEn}</div>
          <div class="topic-title-ta">${topic.labelTa}</div>
        </div>
        <div class="topic-count-tag">${count} Sentences</div>
      `;

      card.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.selectTopic(topic.key);
      });

      this.elements.topicsGrid.appendChild(card);
    });
  },

  // Page 2 -> Page 3: Select Topic
  selectTopic(categoryKey) {
    this.currentCategory = categoryKey;
    this.filterSentences();
    this.showScreen("practice");
  },

  setMode(mode) {
    this.currentMode = mode;
    this.elements.modePills.forEach(pill => {
      pill.classList.toggle("active", pill.getAttribute("data-mode") === mode);
    });
    // Re-evaluate if there is already a spoken transcript
    const currentSpoken = this.elements.spokenTextDisplay.textContent;
    if (currentSpoken && !this.elements.spokenTextDisplay.classList.contains("empty")) {
      this.evaluateTamilInput(currentSpoken);
    }
  },

  filterSentences() {
    if (typeof SENTENCE_DATA === "undefined") return;

    this.activeSentences = SENTENCE_DATA.filter(item => {
      const matchGrade = item.grade === this.currentGrade;
      const matchCategory = this.currentCategory === "all" || item.category === this.currentCategory;
      return matchGrade && matchCategory;
    });

    if (this.activeSentences.length === 0) {
      this.activeSentences = SENTENCE_DATA.filter(item => item.grade === this.currentGrade);
    }

    this.currentIndex = 0;
    this.renderCurrentCard();
  },

  getCurrentSentence() {
    if (!this.activeSentences || this.activeSentences.length === 0) return null;
    return this.activeSentences[this.currentIndex];
  },

  renderCurrentCard() {
    const item = this.getCurrentSentence();
    if (!item) return;

    // Reset card UI states
    this.isAnswerRevealed = false;
    this.elements.tamilAnswerContent.classList.remove("show");
    this.elements.revealAnswerBtn.textContent = "பதில் பார்க்க (Show Answer) 👁️";
    this.elements.validationZone.style.display = "none";
    this.elements.validationZone.classList.remove("fail-mode");
    this.elements.spokenTextDisplay.textContent = "மைக் தொட்டு தமிழில் பேசவும்...";
    this.elements.spokenTextDisplay.classList.add("empty");
    this.elements.progressBarFill.style.width = "0%";

    // Set English and Info
    this.elements.cardIndexLabel.textContent = `${this.currentIndex + 1} / ${this.activeSentences.length}`;
    this.elements.cardCatBadge.innerHTML = `${item.categoryIcon} ${item.categoryLabel}`;
    this.elements.englishText.textContent = item.english;

    // Set Tamil Answer info
    this.elements.tamilTextPrimary.textContent = item.tamilPrimary;
    this.elements.translitText.textContent = `(${item.transliteration})`;

    // Navigation buttons state
    this.elements.prevBtn.disabled = this.currentIndex === 0;
    this.elements.nextBtn.disabled = false;
  },

  toggleRevealAnswer() {
    this.isAnswer  toggleMic() {
    if (this.isListening) {
      KidSpeechService.stopListening();
    } else {
      // Clear previous spoken display
      this.elements.spokenTextDisplay.textContent = "கேட்கிறது... தமிழில் பேசவும் (Listening...)";
      this.elements.spokenTextDisplay.classList.add("empty");

      KidSpeechService.startListening(
        (transcript, isFinal) => this.processSpokenTranscript(transcript, isFinal),
        (listening, status) => this.handleSpeechStateChange(listening, status)
      );
    }
  },

  handleSpeechStateChange(listening, status) {
    this.isListening = listening;
    if (listening) {
      this.elements.micBtn.classList.add("listening");

      if (status === "speech_detected") {
        this.elements.micPromptText.textContent = "🎙️ குரல் கேட்கிறது... (Voice Detected!)";
        this.elements.listeningHint.textContent = "Speaking Tamil...";
      } else {
        this.elements.micPromptText.textContent = "🔴 கேட்கிறது... தமிழில் பேசவும்! (Listening...)";
        this.elements.listeningHint.textContent = "Say the Tamil translation out loud";
      }
    } else {
      this.elements.micBtn.classList.remove("listening");
      this.elements.micPromptText.textContent = "பேச மைக்-ஐ அழுத்தவும் (Tap to Speak Tamil)";
      this.elements.listeningHint.textContent = "Press mic and say translation in Tamil";

      if (status) {
        if (status === "not_supported") {
          alert("Microphone Note:\nSafari or Chrome is recommended for Tamil voice recognition. You can also use the manual typing option below!");
        } else if (status === "not-allowed" || status === "service-not-allowed") {
          alert("📱 iPhone / Safari Microphone Permission:\n\n1. Open iPhone 'Settings'\n2. Scroll down and tap 'Safari' (or 'Chrome')\n3. Tap 'Microphone' and choose 'Allow'\n4. Return and tap the mic button!");
        } else if (status === "audio-capture") {
          this.elements.spokenTextDisplay.textContent = "மைக் கிடைக்கவில்லை. அமைப்புகளில் அனுமதியை சரிபார்க்கவும் (No microphone found or access restricted)";
          this.elements.spokenTextDisplay.classList.add("empty");
        } else if (status === "no-speech") {
          this.elements.spokenTextDisplay.textContent = "சத்தம் கேட்கவில்லை. மீண்டும் மைக் தொட்டு பேசவும் (No speech detected. Please tap mic again)";
          this.elements.spokenTextDisplay.classList.add("empty");
        }
      }
    }
  },

  processSpokenTranscript(transcript, isFinal) {
    if (!transcript) return;
    this.elements.spokenTextDisplay.textContent = transcript;
    this.elements.spokenTextDisplay.classList.remove("empty");

    if (isFinal) {
      this.evaluateTamilInput(transcript);
    }
  },

  evaluateTamilInput(spokenText) {
    const current = this.getCurrentSentence();
    if (!current) return;

    const result = TamilMatcher.evaluate(current, spokenText, this.currentMode);

    // Update Validation UI
    this.elements.validationZone.style.display = "block";
    this.elements.matchNumber.textContent = `${result.percentage}%`;
    this.elements.progressBarFill.style.width = `${result.percentage}%`;
    this.elements.feedbackMsg.textContent = result.feedback;

    // Star Icons update
    this.elements.starIcons.forEach((star, idx) => {
      if (idx < result.stars) {
        star.classList.add("earned");
        star.textContent = "★";
      } else {
        star.classList.remove("earned");
        star.textContent = "☆";
      }
    });

    if (result.isPass) {
      this.elements.validationZone.classList.remove("fail-mode");
      KidAudioFX.playSuccessFanfare();
      KidAudioFX.playStarDing(result.stars);
      this.triggerConfetti();

      // Track stars once per sentence
      if (!this.completedIds.has(current.id)) {
        this.completedIds.add(current.id);
        this.totalStarsEarned += result.stars;
        this.elements.totalStarsCount.textContent = this.totalStarsEarned;
      }
    } else {
      this.elements.validationZone.classList.add("fail-mode");
      KidAudioFX.playTryAgain();
    }
  },

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentCard();
    }
  },

  nextCard() {
    if (this.currentIndex < this.activeSentences.length - 1) {
      this.currentIndex++;
      this.renderCurrentCard();
    } else {
      // Loop back to first question in topic
      this.currentIndex = 0;
      this.renderCurrentCard();
    }
  },

  // Confetti Particle Engine
  initConfetti() {
    this.confettiCanvas = this.elements.confettiCanvas;
    if (!this.confettiCanvas) return;
    this.ctx = this.confettiCanvas.getContext("2d");
    this.confettiParticles = [];

    const resize = () => {
      this.confettiCanvas.width = window.innerWidth;
      this.confettiCanvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();
  },

  triggerConfetti() {
    if (!this.ctx) return;
    const colors = ["#FF5E7E", "#6C5CE7", "#FFD166", "#06D6A0", "#118AB2", "#FF9F1C"];
    const particleCount = 65;

    for (let i = 0; i < particleCount; i++) {
      this.confettiParticles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -12 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.012
      });
    }

    if (!this.confettiRunning) {
      this.confettiRunning = true;
      this.renderConfetti();
    }
  },

  renderConfetti() {
    if (!this.confettiCanvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const p = this.confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.confettiParticles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    if (this.confettiParticles.length > 0) {
      requestAnimationFrame(() => this.renderConfetti());
    } else {
      this.confettiRunning = false;
    }
  }
};

// Bootstrap application on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
