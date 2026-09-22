/**
 * Tamil-Translate-Kids - Main Interactive Application Logic
 * Coordinates 3-Screen Wizard Flow (Grade -> Topics -> Practice), Voice Recognition,
 * Multi-variant Tamil Matching, Sound FX, Confetti, and Activity Logs.
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
  lastSpokenTranscript: "",
  hasEvaluatedCurrentSpeech: false,
  manualFallbackMessage: "",
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

    if (window.KidAppLogger) {
      KidAppLogger.log("INIT", "App initialized", KidAppLogger.getDeviceInfo());
    }

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
      confettiCanvas: document.getElementById("confetti-canvas"),

      // Diagnostics Toolbar
      viewLogsBtn: document.getElementById("view-logs-btn"),
      downloadLogsBtn: document.getElementById("download-logs-btn")
    };
  },

  bindEvents() {
    // 1. Home / Brand button (Returns to Page 1 from anywhere)
    if (this.elements.brandHomeBtn) {
      this.elements.brandHomeBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        if (window.KidAppLogger) KidAppLogger.log("NAV", "Home logo clicked");
        this.showScreen("grade");
      });
    }

    // 2. Grade Cards on Page 1
    if (this.elements.gradeCards) {
      this.elements.gradeCards.forEach(card => {
        card.addEventListener("click", () => {
          const grade = parseInt(card.getAttribute("data-grade"), 10);
          KidAudioFX.playClick();
          this.selectGrade(grade);
        });
      });
    }

    // 3. Back buttons
    if (this.elements.backToGradeBtn) {
      this.elements.backToGradeBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.showScreen("grade");
      });
    }

    if (this.elements.backToTopicsBtn) {
      this.elements.backToTopicsBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.showScreen("topic");
      });
    }

    // 4. Difficulty mode switcher (Page 3)
    if (this.elements.modePills) {
      this.elements.modePills.forEach(pill => {
        pill.addEventListener("click", () => {
          const mode = pill.getAttribute("data-mode");
          KidAudioFX.playClick();
          this.setMode(mode);
        });
      });
    }

    // 5. Listen to English audio
    if (this.elements.listenEnBtn) {
      this.elements.listenEnBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        const current = this.getCurrentSentence();
        if (current) {
          if (window.KidAppLogger) KidAppLogger.log("TTS", "Listen English", { text: current.english });
          KidSpeechService.speakEnglish(current.english);
        }
      });
    }

    // 6. Mic button
    if (this.elements.micBtn) {
      this.elements.micBtn.addEventListener("click", () => {
        this.toggleMic();
      });
    }

    // 7. Listen to Tamil answer audio
    if (this.elements.listenTamilBtn) {
      this.elements.listenTamilBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        const current = this.getCurrentSentence();
        if (current) {
          if (window.KidAppLogger) KidAppLogger.log("TTS", "Listen Tamil", { text: current.tamilPrimary });
          KidSpeechService.speakTamil(current.tamilPrimary);
        }
      });
    }

    // 8. Reveal answer toggle
    if (this.elements.revealAnswerBtn) {
      this.elements.revealAnswerBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.toggleRevealAnswer();
      });
    }

    // 9. Navigation
    if (this.elements.prevBtn) {
      this.elements.prevBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.prevCard();
      });
    }

    if (this.elements.nextBtn) {
      this.elements.nextBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.nextCard();
      });
    }

    // 10. Manual Tamil input drawer
    if (this.elements.toggleManualBtn) {
      this.elements.toggleManualBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.elements.manualInputBox.classList.toggle("show");
      });
    }

    if (this.elements.manualSubmitBtn) {
      this.elements.manualSubmitBtn.addEventListener("click", () => {
        const text = this.elements.manualTextInput.value.trim();
        if (text) {
          if (window.KidAppLogger) KidAppLogger.log("MATCH", "Manual input submit", { text });
          if (this.elements.spokenTextDisplay) {
            this.elements.spokenTextDisplay.textContent = text;
            this.elements.spokenTextDisplay.classList.remove("empty");
          }
          this.evaluateTamilInput(text);
          this.elements.manualTextInput.value = "";
        }
      });
    }

    if (this.elements.manualTextInput) {
      this.elements.manualTextInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.elements.manualSubmitBtn.click();
        }
      });
    }

    // 11. Diagnostics Logs
    if (this.elements.viewLogsBtn) {
      this.elements.viewLogsBtn.addEventListener("click", () => {
        if (window.KidAppLogger) {
          const logs = KidAppLogger.getLogs();
          alert(`📊 Activity Logs (${logs.length} entries):\n\n` + logs.slice(0, 5).map(l => `[${l.timestamp.slice(11,19)}] [${l.category}] ${l.action}`).join("\n"));
        }
      });
    }

    if (this.elements.downloadLogsBtn) {
      this.elements.downloadLogsBtn.addEventListener("click", () => {
        if (window.KidAppLogger) KidAppLogger.downloadLogs();
      });
    }
  },

  // Screen Switcher
  showScreen(screenName) {
    this.currentScreen = screenName;
    if (this.elements.screenGrade) this.elements.screenGrade.classList.toggle("active", screenName === "grade");
    if (this.elements.screenTopic) this.elements.screenTopic.classList.toggle("active", screenName === "topic");
    if (this.elements.screenPractice) this.elements.screenPractice.classList.toggle("active", screenName === "practice");

    if (window.KidAppLogger) KidAppLogger.log("NAV", `Show screen: ${screenName}`);
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
    if (this.elements.topicScreenGradeBadge) this.elements.topicScreenGradeBadge.textContent = label;
    if (this.elements.practiceGradeBadge) this.elements.practiceGradeBadge.textContent = label;

    if (window.KidAppLogger) KidAppLogger.log("NAV", `Selected Grade ${grade}`);

    this.renderTopicsGrid();
    this.showScreen("topic");
  },

  // Render Page 2 Topic Grid with sentence counts
  renderTopicsGrid() {
    if (typeof SENTENCE_DATA === "undefined" || !this.elements.topicsGrid) return;

    const gradeSentences = SENTENCE_DATA.filter(s => s.grade === this.currentGrade);
    this.elements.topicsGrid.innerHTML = "";

    this.topicsMeta.forEach(topic => {
      const count = topic.key === "all"
        ? gradeSentences.length
        : gradeSentences.filter(s => s.category === topic.key).length;

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
    if (window.KidAppLogger) KidAppLogger.log("NAV", `Selected Topic: ${categoryKey}`);
    this.filterSentences();
    this.showScreen("practice");
  },

  setMode(mode) {
    this.currentMode = mode;
    if (this.elements.modePills) {
      this.elements.modePills.forEach(pill => {
        pill.classList.toggle("active", pill.getAttribute("data-mode") === mode);
      });
    }

    if (window.KidAppLogger) KidAppLogger.log("MATCH", `Mode changed: ${mode}`);

    const currentSpoken = this.elements.spokenTextDisplay ? this.elements.spokenTextDisplay.textContent : "";
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

    // Reset voice & speech states
    KidSpeechService.stopSpeaking();
    KidSpeechService.stopListening();
    this.handleSpeechStateChange(false);
    this.lastSpokenTranscript = "";
    this.hasEvaluatedCurrentSpeech = false;
    this.manualFallbackMessage = "";

    // Reset card UI states
    this.isAnswerRevealed = false;
    if (this.elements.tamilAnswerContent) this.elements.tamilAnswerContent.classList.remove("show");
    if (this.elements.revealAnswerBtn) this.elements.revealAnswerBtn.textContent = "பதில் பார்க்க (Show Answer) 👁️";
    if (this.elements.validationZone) {
      this.elements.validationZone.style.display = "none";
      this.elements.validationZone.classList.remove("fail-mode");
    }
    if (this.elements.spokenTextDisplay) {
      this.elements.spokenTextDisplay.textContent = "மைக் தொட்டு தமிழில் பேசவும்...";
      this.elements.spokenTextDisplay.classList.add("empty");
    }
    if (this.elements.progressBarFill) this.elements.progressBarFill.style.width = "0%";

    // Set English and Info
    if (this.elements.cardIndexLabel) {
      this.elements.cardIndexLabel.textContent = `${this.currentIndex + 1} / ${this.activeSentences.length}`;
    }
    if (this.elements.cardCatBadge) {
      this.elements.cardCatBadge.innerHTML = `${item.categoryIcon} ${item.categoryLabel}`;
    }
    if (this.elements.englishText) {
      this.elements.englishText.textContent = item.english;
    }

    // Set Tamil Answer info
    if (this.elements.tamilTextPrimary) this.elements.tamilTextPrimary.textContent = item.tamilPrimary;
    if (this.elements.translitText) this.elements.translitText.textContent = `(${item.transliteration})`;

    // Navigation buttons state
    if (this.elements.prevBtn) this.elements.prevBtn.disabled = this.currentIndex === 0;
    if (this.elements.nextBtn) this.elements.nextBtn.disabled = false;
  },

  toggleRevealAnswer() {
    this.isAnswerRevealed = !this.isAnswerRevealed;
    if (this.isAnswerRevealed) {
      if (this.elements.tamilAnswerContent) this.elements.tamilAnswerContent.classList.add("show");
      if (this.elements.revealAnswerBtn) this.elements.revealAnswerBtn.textContent = "மறைக்க (Hide Answer) 🙈";
      if (window.KidAppLogger) KidAppLogger.log("NAV", "Answer revealed");
    } else {
      if (this.elements.tamilAnswerContent) this.elements.tamilAnswerContent.classList.remove("show");
      if (this.elements.revealAnswerBtn) this.elements.revealAnswerBtn.textContent = "பதில் பார்க்க (Show Answer) 👁️";
    }
  },

  toggleMic() {
    if (this.isListening || KidSpeechService.isListening) {
      if (window.KidAppLogger) KidAppLogger.log("VOICE", "Mic stopped by user");
      KidSpeechService.stopListening();
      this.handleSpeechStateChange(false);

      // If manual stop occurred after speech was heard, evaluate it
      if (this.lastSpokenTranscript && !this.hasEvaluatedCurrentSpeech) {
        this.hasEvaluatedCurrentSpeech = true;
        this.evaluateTamilInput(this.lastSpokenTranscript);
      }
    } else {
      this.lastSpokenTranscript = "";
      this.hasEvaluatedCurrentSpeech = false;
      this.manualFallbackMessage = "";

      if (this.elements.spokenTextDisplay) {
        this.elements.spokenTextDisplay.textContent = "கேட்கிறது... தமிழில் பேசவும் (Listening...)";
        this.elements.spokenTextDisplay.classList.add("empty");
      }

      if (window.KidAppLogger) KidAppLogger.log("VOICE", "Mic started listening");

      KidSpeechService.startListening({
        onStart: () => {
          this.handleSpeechStateChange(true);
        },
        onResult: ({ final, interim }) => {
          const liveText = (interim || final || "").trim();
          if (liveText) {
            this.lastSpokenTranscript = liveText;
            if (this.elements.spokenTextDisplay) {
              this.elements.spokenTextDisplay.textContent = liveText;
              this.elements.spokenTextDisplay.classList.remove("empty");
            }
          }

          if (final) {
            this.hasEvaluatedCurrentSpeech = true;
            KidSpeechService.stopListening();
            this.handleSpeechStateChange(false);
            if (window.KidAppLogger) KidAppLogger.log("VOICE", "Final transcript captured", { transcript: final });
            this.evaluateTamilInput(final);
          }
        },
        onError: (err) => {
          console.warn("Speech recognition note:", err);
          this.handleSpeechStateChange(false);
          if (this.elements.spokenTextDisplay) {
            this.elements.spokenTextDisplay.textContent = "குரல் சேவை கிடைக்கவில்லை. கீழே தமிழில் தட்டச்சு செய்யவும்.";
            this.elements.spokenTextDisplay.classList.add("empty");
          }
          if (window.KidAppLogger) KidAppLogger.log("VOICE", `Speech error: ${err}`);
          if (err === "not-allowed") {
            this.showManualInputFallback("Microphone access is off. You can type the Tamil answer below, or enable microphone access in iPhone Settings and try again.");
          } else if (err === "insecure-context") {
            alert("Microphone access requires the secure HTTPS version of this website. Please open the published GitHub Pages link, not a local file.");
          } else if (err === "microphone-api-unavailable" || err === "microphone-unavailable") {
            this.showManualInputFallback("This browser cannot access the microphone right now. You can type the Tamil answer below and continue learning.");
          } else if (err === "speech-api-unavailable") {
            this.showManualInputFallback("Speech-to-text is not available in this browser. Type the Tamil answer below, or use the iPhone keyboard microphone with Tamil Dictation enabled.");
          } else if (err === "network" || err === "service-not-allowed" || err === "recognition-start-failed") {
            this.showManualInputFallback("Speech recognition could not start. You can type the Tamil answer below and continue, then try the microphone again later.");
          }
        },
        onEnd: () => {
          this.handleSpeechStateChange(false);
          // On Apple/iOS Safari, onend frequently fires before final is flagged. Evaluate any heard speech:
          if (this.lastSpokenTranscript && !this.hasEvaluatedCurrentSpeech) {
            this.hasEvaluatedCurrentSpeech = true;
            if (window.KidAppLogger) KidAppLogger.log("VOICE", "Evaluation on speech end", { transcript: this.lastSpokenTranscript });
            this.evaluateTamilInput(this.lastSpokenTranscript);
          }
        }
      });
    }
  },

  showManualInputFallback(message) {
    this.manualFallbackMessage = message;
    if (this.elements.manualInputBox) this.elements.manualInputBox.classList.add("show");
    if (this.elements.manualTextInput) {
      this.elements.manualTextInput.placeholder = "தமிழில் தட்டச்சு செய்யவும் (Type Tamil)...";
      this.elements.manualTextInput.focus({ preventScroll: true });
    }
    if (window.KidAppLogger) KidAppLogger.log("VOICE", "Manual input fallback shown", { message });
    if (this.elements.listeningHint) this.elements.listeningHint.textContent = message;
  },

  handleSpeechStateChange(listening) {
    this.isListening = listening;
    if (listening) {
      if (this.elements.micBtn) this.elements.micBtn.classList.add("listening");
      if (this.elements.micPromptText) this.elements.micPromptText.textContent = "🔴 கேட்கிறது... தமிழில் பேசவும்! (Listening...)";
      if (this.elements.listeningHint) this.elements.listeningHint.textContent = "Say the Tamil translation out loud";
    } else {
      if (this.elements.micBtn) this.elements.micBtn.classList.remove("listening");
      if (this.elements.micPromptText) this.elements.micPromptText.textContent = "பேச மைக்-ஐ அழுத்தவும் (Tap to Speak Tamil)";
      if (this.elements.listeningHint) {
        this.elements.listeningHint.textContent = this.manualFallbackMessage || "Press mic and say translation in Tamil";
      }
    }
  },

  evaluateTamilInput(spokenText) {
    const current = this.getCurrentSentence();
    if (!current) return;

    const result = TamilMatcher.evaluate(current, spokenText, this.currentMode);

    if (window.KidAppLogger) {
      KidAppLogger.log("MATCH", "Evaluation result", {
        english: current.english,
        spoken: spokenText,
        score: result.percentage,
        isPass: result.isPass,
        stars: result.stars
      });
    }

    // Update Validation UI
    if (this.elements.validationZone) {
      this.elements.validationZone.style.display = "block";
      if (this.elements.matchNumber) this.elements.matchNumber.textContent = `${result.percentage}%`;
      if (this.elements.progressBarFill) this.elements.progressBarFill.style.width = `${result.percentage}%`;
      if (this.elements.feedbackMsg) this.elements.feedbackMsg.textContent = result.feedback;

      // Star Icons update
      if (this.elements.starIcons) {
        this.elements.starIcons.forEach((star, idx) => {
          if (idx < result.stars) {
            star.classList.add("earned");
            star.textContent = "★";
          } else {
            star.classList.remove("earned");
            star.textContent = "☆";
          }
        });
      }

      if (result.isPass) {
        this.elements.validationZone.classList.remove("fail-mode");
        KidAudioFX.playSuccessFanfare();
        KidAudioFX.playStarDing(result.stars);
        this.triggerConfetti();

        // Track stars once per sentence
        if (!this.completedIds.has(current.id)) {
          this.completedIds.add(current.id);
          this.totalStarsEarned += result.stars;
          if (this.elements.totalStarsCount) this.elements.totalStarsCount.textContent = this.totalStarsEarned;
        }
      } else {
        this.elements.validationZone.classList.add("fail-mode");
        KidAudioFX.playTryAgain();
      }
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
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    App.init();
  });
}

if (typeof window !== "undefined") {
  window.App = App;
}
if (typeof global !== "undefined") {
  global.App = App;
}
