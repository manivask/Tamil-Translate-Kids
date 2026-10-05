/**
 * Tamil-Translate-Kids - Main Interactive Application Logic
 * Coordinates 3-Screen Wizard Flow (Grade -> Topics -> Practice), Voice Recognition,
 * Multi-variant Tamil Matching, Sound FX, Confetti, and Activity Logs.
 */

const App = {
  // State
  currentScreen: "login", // 'login' | 'topic' | 'practice' | 'kural' | 'admin'
  currentStudent: null,
  students: [],
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
    this.syncVoiceModeControl();

    if (window.KidAppLogger) {
      KidAppLogger.log("INIT", "App initialized", KidAppLogger.getDeviceInfo());
    }

    this.loadStudents();
    this.showScreen("login");
  },

  cacheDOM() {
    this.elements = {
      // Screens
      screenGrade: document.getElementById("screen-grade"),
      screenLogin: document.getElementById("screen-login"),
      screenAdmin: document.getElementById("screen-admin"),
      screenTopic: document.getElementById("screen-topic"),
      screenPractice: document.getElementById("screen-practice"),
      screenKural: document.getElementById("screen-kural"),
      screenAathichudi: document.getElementById("screen-aathichudi"),
      screenReadingClub: document.getElementById("screen-reading-club"),

      // Navigation & Branding
      brandHomeBtn: document.getElementById("brand-home-btn"),
      backToGradeBtn: document.getElementById("back-to-grade-btn"),
      backToTopicsBtn: document.getElementById("back-to-topics-btn"),
      topicScreenGradeBadge: document.getElementById("topic-screen-grade-badge"),
      practiceGradeBadge: document.getElementById("practice-grade-badge"),
      topicsGrid: document.getElementById("topics-grid"),

      // Grade Selection Cards (Page 1)
      gradeCards: document.querySelectorAll(".grade-card"),
      voiceModeInputs: document.querySelectorAll('input[name="voice-mode"]'),
      deviceLanguageLabel: document.getElementById("device-language-label"),

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

      studentLoginForm: document.getElementById("student-login-form"),
      studentGrade: document.getElementById("student-grade"),
      studentName: document.getElementById("student-name"),
      loginMessage: document.getElementById("login-message"),
      roleInputs: document.querySelectorAll('input[name="user-role"]'),
      studentQrPanel: document.getElementById("student-qr-panel"),
      qrVideo: document.getElementById("qr-video"),
      qrCanvas: document.getElementById("qr-canvas"),
      qrScanStatus: document.getElementById("qr-scan-status"),
      qrStatusBox: document.getElementById("qr-status-box"),
      qrFlipCameraBtn: document.getElementById("qr-flip-camera-btn"),
      qrRestartCamBtn: document.getElementById("qr-restart-cam-btn"),
      toggleManualStudentLogin: document.getElementById("toggle-manual-student-login"),
      adminLoginPanel: document.getElementById("admin-login-panel"),
      adminLoginForm: document.getElementById("admin-login-form"),
      adminUsername: document.getElementById("admin-username"),
      adminPassword: document.getElementById("admin-password"),
      adminLoginMessage: document.getElementById("admin-login-message"),
      adminContinueBtn: document.getElementById("admin-continue-btn"),
      adminLogoutBtn: document.getElementById("admin-logout-btn"),
      adminSummary: document.getElementById("admin-summary"),
      adminProgressList: document.getElementById("admin-progress-list"),
      adminFilterSelect: document.getElementById("admin-filter-select"),
      metricStudentsCount: document.getElementById("metric-students-count"),
      metricAttemptsCount: document.getElementById("metric-attempts-count"),
      metricKuralCount: document.getElementById("metric-kural-count"),
      metricAathichudiCount: document.getElementById("metric-aathichudi-count"),
      logoutBtn: document.getElementById("logout-btn"),

      // Student Dashboard & Sidebar Elements
      studentGreetingText: document.getElementById("student-greeting-text"),
      studentStatusText: document.getElementById("student-status-text"),
      studentGradeBadge: document.getElementById("student-grade-badge"),
      studentSidebarLogoutBtn: document.getElementById("student-sidebar-logout-btn"),
      statStarsCount: document.getElementById("stat-stars-count"),
      statKuralCount: document.getElementById("stat-kural-count"),
      statAathichudiCount: document.getElementById("stat-aathichudi-count"),
      statRcCount: document.getElementById("stat-rc-count"),
      statQuizCount: document.getElementById("stat-quiz-count"),
      openKuralTopicBtn: document.getElementById("open-kural-topic-btn"),
      openKuralQuizBtn: document.getElementById("open-kural-quiz-btn"),
      openAathichudiTopicBtn: document.getElementById("open-aathichudi-topic-btn"),
      openAathichudiQuizBtn: document.getElementById("open-aathichudi-quiz-btn"),
      openRcTopicBtn: document.getElementById("open-rc-topic-btn"),
      openRcQuizBtn: document.getElementById("open-rc-quiz-btn"),

      // Diagnostics Toolbar
      viewLogsBtn: document.getElementById("view-logs-btn"),
      downloadLogsBtn: document.getElementById("download-logs-btn")
    };
  },

  bindEvents() {
    this.elements.roleInputs.forEach(input => input.addEventListener("change", () => this.toggleRole()));
    if (this.elements.studentGrade) {
      this.elements.studentGrade.addEventListener("change", () => this.populateStudentNames());
    }
    if (this.elements.studentLoginForm) {
      this.elements.studentLoginForm.addEventListener("submit", event => { event.preventDefault(); this.loginStudent(); });
    }
    if (this.elements.adminLoginForm) {
      this.elements.adminLoginForm.addEventListener("submit", event => {
        event.preventDefault();
        this.handleAdminAuth();
      });
    }
    if (this.elements.toggleManualStudentLogin) {
      this.elements.toggleManualStudentLogin.addEventListener("click", () => {
        const form = this.elements.studentLoginForm;
        if (form) {
          const isHidden = (form.style.display === "none" || form.hidden);
          form.style.display = isHidden ? "block" : "none";
          this.elements.toggleManualStudentLogin.textContent = isHidden ?
            "📷 கேமரா QR ஸ்கேனருக்குத் திரும்பு (Back to QR Scanner)" :
            "⌨️ QR அட்டை இல்லையா? கைமுறையாகத் தேர்வு செய்க";
        }
      });
    }
    if (this.elements.qrFlipCameraBtn) {
      this.elements.qrFlipCameraBtn.addEventListener("click", () => this.flipQrCamera());
    }
    if (this.elements.qrRestartCamBtn) {
      this.elements.qrRestartCamBtn.addEventListener("click", () => {
        this.stopQrScanner();
        this.startQrScanner();
      });
    }
    if (this.elements.adminContinueBtn) {
      this.elements.adminContinueBtn.addEventListener("click", () => this.handleAdminAuth());
    }
    this.elements.adminLogoutBtn.addEventListener("click", () => this.logout());
    this.elements.logoutBtn.addEventListener("click", () => this.logout());
    if (this.elements.studentSidebarLogoutBtn) {
      this.elements.studentSidebarLogoutBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.logout();
      });
    }
    if (this.elements.adminFilterSelect) {
      this.elements.adminFilterSelect.addEventListener("change", () => this.renderAdminList());
    }

    // 1. Home / Brand button (Returns to student dashboard or login)
    if (this.elements.brandHomeBtn) {
      this.elements.brandHomeBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        if (window.KidAppLogger) KidAppLogger.log("NAV", "Home logo clicked");
        this.showScreen(this.currentStudent ? "topic" : "login");
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

    if (this.elements.voiceModeInputs) {
      this.elements.voiceModeInputs.forEach(input => {
        input.addEventListener("change", () => {
          if (!input.checked) return;
          KidSpeechService.setInputLanguage(input.value);
          this.syncVoiceModeControl();
          KidAudioFX.playClick();
        });
      });
    }

    // 3. Back buttons
    if (this.elements.backToGradeBtn) {
      this.elements.backToGradeBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.showScreen("login");
      });
    }

    if (this.elements.backToTopicsBtn) {
      this.elements.backToTopicsBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.showScreen("topic");
      });
    }

    // Thirukkural Studio Launchers
    const openKuralAction = (mode = "read") => {
      this.previousHeritageScreen = this.currentScreen;
      KidAudioFX.playClick();
      if (window.ThirukkuralPractice) window.ThirukkuralPractice.open(mode);
      this.showScreen("kural");
    };

    if (this.elements.openKuralTopicBtn) {
      this.elements.openKuralTopicBtn.addEventListener("click", () => openKuralAction("read"));
    }
    if (this.elements.openKuralQuizBtn) {
      this.elements.openKuralQuizBtn.addEventListener("click", () => openKuralAction("quiz"));
    }

    const backFromKural = document.getElementById("back-from-kural-btn");
    if (backFromKural) backFromKural.addEventListener("click", () => {
      KidAudioFX.playClick();
      this.showScreen(this.previousHeritageScreen || (this.currentStudent ? "topic" : "login"));
    });

    // Aathichudi Studio Launchers
    const openAathichudiAction = (mode = "read") => {
      this.previousHeritageScreen = this.currentScreen;
      KidAudioFX.playClick();
      if (window.AathichudiPractice) window.AathichudiPractice.open(mode);
      this.showScreen("aathichudi");
    };

    if (this.elements.openAathichudiTopicBtn) {
      this.elements.openAathichudiTopicBtn.addEventListener("click", () => openAathichudiAction("read"));
    }
    if (this.elements.openAathichudiQuizBtn) {
      this.elements.openAathichudiQuizBtn.addEventListener("click", () => openAathichudiAction("quiz"));
    }

    const backFromAathichudi = document.getElementById("back-from-aathichudi-btn");
    if (backFromAathichudi) backFromAathichudi.addEventListener("click", () => {
      KidAudioFX.playClick();
      this.showScreen(this.previousHeritageScreen || (this.currentStudent ? "topic" : "login"));
    });

    // Reading Club Studio Launchers
    const openRcAction = (mode = "read") => {
      this.previousHeritageScreen = this.currentScreen;
      KidAudioFX.playClick();
      if (window.ReadingClubPractice) window.ReadingClubPractice.open(mode);
      this.showScreen("reading-club");
    };

    if (this.elements.openRcTopicBtn) {
      this.elements.openRcTopicBtn.addEventListener("click", () => openRcAction("read"));
    }
    if (this.elements.openRcQuizBtn) {
      this.elements.openRcQuizBtn.addEventListener("click", () => openRcAction("quiz"));
    }

    const backFromRc = document.getElementById("back-from-rc-btn");
    if (backFromRc) backFromRc.addEventListener("click", () => {
      KidAudioFX.playClick();
      this.showScreen(this.previousHeritageScreen || (this.currentStudent ? "topic" : "login"));
    });

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
        this.handleSpeechStateChange(false);
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
        this.handleSpeechStateChange(false);
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
          alert(`📊 Activity Logs (${logs.length} entries):\n\n` + logs.slice(0, 12).map(l => `[${l.timestamp.slice(11,19)}] [${l.category}] ${l.action}\n${JSON.stringify(l.details)}`).join("\n\n"));
        }
      });
    }

    if (this.elements.downloadLogsBtn) {
      this.elements.downloadLogsBtn.addEventListener("click", () => {
        if (window.KidAppLogger) KidAppLogger.downloadLogs();
      });
    }
  },

  syncVoiceModeControl() {
    if (this.elements.voiceModeInputs) {
      this.elements.voiceModeInputs.forEach(input => {
        input.checked = input.value === KidSpeechService.languageMode;
      });
    }
    if (this.elements.deviceLanguageLabel) {
      this.elements.deviceLanguageLabel.textContent = KidSpeechService.getDeviceLanguage();
    }
  },

  // Screen Switcher
  showScreen(screenName) {
    KidSpeechService.cancelListening();
    KidSpeechService.stopSpeaking();
    this.handleSpeechStateChange(false);
    this.currentScreen = screenName;
    if (this.elements.logoutBtn) this.elements.logoutBtn.hidden = screenName === "login" || screenName === "admin";
    if (this.elements.screenLogin) this.elements.screenLogin.classList.toggle("active", screenName === "login");
    if (this.elements.screenAdmin) this.elements.screenAdmin.classList.toggle("active", screenName === "admin");
    if (this.elements.screenGrade) this.elements.screenGrade.classList.toggle("active", screenName === "grade");
    if (this.elements.screenTopic) this.elements.screenTopic.classList.toggle("active", screenName === "topic");
    if (this.elements.screenPractice) this.elements.screenPractice.classList.toggle("active", screenName === "practice");
    if (this.elements.screenKural) this.elements.screenKural.classList.toggle("active", screenName === "kural");
    if (this.elements.screenAathichudi) this.elements.screenAathichudi.classList.toggle("active", screenName === "aathichudi");
    if (this.elements.screenReadingClub) this.elements.screenReadingClub.classList.toggle("active", screenName === "reading-club");

    if (screenName === "login") {
      this.startQrScanner();
    } else {
      this.stopQrScanner();
    }

    if (screenName === "topic") {
      this.updateStudentDashboard();
    }

    if (window.KidAppLogger) KidAppLogger.log("NAV", `Show screen: ${screenName}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  async loadStudents() {
    try {
      const response = await fetch("data/students/roster.json");
      const data = await response.json();
      this.students = data.students || [];
      if (this.elements.studentGrade && this.elements.studentGrade.value) {
        this.populateStudentNames();
      }
    } catch (err) {
      console.error("Could not load student roster:", err);
      if (this.elements.loginMessage) {
        this.elements.loginMessage.textContent = "Student list could not be loaded. Please refresh the page.";
      }
    }
  },

  toggleRole() {
    const isAdmin = [...this.elements.roleInputs].find(input => input.checked).value === "admin";
    if (this.elements.studentQrPanel) this.elements.studentQrPanel.hidden = isAdmin;
    if (this.elements.adminLoginPanel) this.elements.adminLoginPanel.hidden = !isAdmin;
    if (this.elements.loginMessage) this.elements.loginMessage.textContent = "";
    if (this.elements.adminLoginMessage) this.elements.adminLoginMessage.textContent = "";

    if (isAdmin) {
      this.stopQrScanner();
    } else {
      this.startQrScanner();
    }
  },

  // --- Live Camera QR Code Scanner Engine ---
  qrStream: null,
  qrScanning: false,
  qrFacingMode: "environment",
  qrAnimationId: null,

  async startQrScanner() {
    if (this.currentScreen !== "login" || this.qrScanning) return;
    const isStudent = [...this.elements.roleInputs].some(i => i.checked && i.value === "student");
    if (!isStudent) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (this.elements.qrScanStatus) {
        this.elements.qrScanStatus.textContent = "⚠️ கேமரா அணுகல் இல்லை. கீழே கைமுறையாகத் தேர்வு செய்க.";
      }
      return;
    }

    try {
      this.qrScanning = true;
      if (this.elements.qrScanStatus) {
        this.elements.qrScanStatus.textContent = "📷 கேமரா தயாராகிறது...";
      }

      const constraints = {
        video: {
          facingMode: this.qrFacingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      this.qrStream = stream;
      if (this.elements.qrVideo) {
        this.elements.qrVideo.srcObject = stream;
        this.elements.qrVideo.setAttribute("playsinline", "true");
        await this.elements.qrVideo.play().catch(() => {});
      }

      if (this.elements.qrScanStatus) {
        this.elements.qrScanStatus.textContent = "📸 உங்கள் QR அடையாள அட்டையைக் கேமராவில் காட்டவும்...";
      }

      this.scanQrFrame();
    } catch (err) {
      console.warn("QR Camera start notice:", err);
      this.qrScanning = false;
      if (this.elements.qrScanStatus) {
        this.elements.qrScanStatus.textContent = "⚠️ கேமரா அனுமதி தேவை. கீழே கைமுறையாகத் தேர்வு செய்யவும்.";
      }
    }
  },

  stopQrScanner() {
    this.qrScanning = false;
    if (this.qrAnimationId) {
      cancelAnimationFrame(this.qrAnimationId);
      this.qrAnimationId = null;
    }
    if (this.qrStream) {
      this.qrStream.getTracks().forEach(track => track.stop());
      this.qrStream = null;
    }
    if (this.elements.qrVideo) {
      this.elements.qrVideo.srcObject = null;
    }
  },

  flipQrCamera() {
    this.qrFacingMode = (this.qrFacingMode === "environment") ? "user" : "environment";
    this.stopQrScanner();
    this.startQrScanner();
  },

  scanQrFrame() {
    if (!this.qrScanning) return;
    const video = this.elements.qrVideo;
    const canvas = this.elements.qrCanvas;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (typeof window.jsQR === "function") {
          const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          });

          if (code && code.data) {
            const success = this.handleScannedQr(code.data);
            if (success) return;
          }
        }
      }
    }

    this.qrAnimationId = requestAnimationFrame(() => this.scanQrFrame());
  },

  handleScannedQr(qrData) {
    if (!qrData) return false;
    let matchedStudent = null;

    // 1. Try parsing JSON format
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.firstName && parsed.grade) {
        matchedStudent = this.students.find(s =>
          s.firstName.toLowerCase() === parsed.firstName.toLowerCase() &&
          Number(s.grade) === Number(parsed.grade)
        );
      } else if (parsed.name && parsed.grade) {
        const parts = parsed.name.trim().split(" ");
        const first = parts[0];
        matchedStudent = this.students.find(s =>
          s.firstName.toLowerCase() === first.toLowerCase() &&
          Number(s.grade) === Number(parsed.grade)
        );
      }
    } catch (_) {}

    // 2. Try parsing delimited string: TBTA|grade|firstName|lastName or grade|firstName|lastName
    if (!matchedStudent && typeof qrData === "string") {
      const tokens = qrData.split(/[:|]/);
      if (tokens.length >= 3) {
        const gradeCandidate = Number(tokens[1]) || Number(tokens[0]);
        const nameCandidate = (tokens[2] || tokens[1] || "").toLowerCase();
        matchedStudent = this.students.find(s =>
          Number(s.grade) === gradeCandidate &&
          s.firstName.toLowerCase() === nameCandidate
        );
      }
    }

    if (matchedStudent) {
      this.stopQrScanner();
      KidAudioFX.playSuccessFanfare();
      this.triggerConfetti();

      if (this.elements.qrScanStatus) {
        this.elements.qrScanStatus.textContent = `🎉 வணக்கம் ${matchedStudent.firstName} ${matchedStudent.lastName}!`;
      }

      this.currentStudent = matchedStudent;
      this.currentGrade = Number(matchedStudent.grade);
      this.saveSession();

      setTimeout(() => {
        this.selectGrade(this.currentGrade);
      }, 600);
      return true;
    } else {
      if (this.elements.qrScanStatus) {
        this.elements.qrScanStatus.textContent = "⚠️ அறியப்படாத QR குறியீடு (Unrecognized QR). மீண்டும் காட்டவும்...";
      }
      return false;
    }
  },

  handleAdminAuth() {
    const user = (this.elements.adminUsername ? this.elements.adminUsername.value : "").trim();
    const pass = (this.elements.adminPassword ? this.elements.adminPassword.value : "").trim();
    const msg = this.elements.adminLoginMessage;

    if (user === "admin" && pass === "TBTA_admin") {
      if (msg) {
        msg.textContent = "✅ அனுமதி வழங்கப்பட்டது (Access Granted)...";
        msg.className = "login-message success";
      }
      this.stopQrScanner();
      this.openAdmin();
    } else {
      if (msg) {
        msg.textContent = "❌ தவறான பயனர்பெயர் அல்லது கடவுச்சொல் (Invalid admin credentials)";
        msg.className = "login-message";
      }
    }
  },

  populateStudentNames() {
    const gradeVal = this.elements.studentGrade ? this.elements.studentGrade.value : "";
    if (!gradeVal) {
      this.elements.studentName.disabled = true;
      this.elements.studentName.innerHTML = `<option value="">Select your grade first</option>`;
      return;
    }
    const grade = Number(gradeVal);
    if (!this.students || !this.students.length) {
      this.elements.studentName.disabled = true;
      this.elements.studentName.innerHTML = `<option value="">மாணவர் பட்டியல் ஏற்றப்படுகிறது (Loading students)...</option>`;
      return;
    }
    const matches = this.students.filter(student => Number(student.grade) === grade);
    matches.sort((a, b) => (a.firstName || "").localeCompare(b.firstName || ""));

    if (matches.length > 0) {
      this.elements.studentName.disabled = false;
      this.elements.studentName.innerHTML = `<option value="">உங்கள் பெயரைத் தேர்ந்தெடுக்கவும் (Select your name)</option>` +
        matches.map(student => `<option value="${student.firstName}|${student.lastName}|${student.grade}">${student.firstName} ${student.lastName}</option>`).join("");
    } else {
      this.elements.studentName.disabled = true;
      this.elements.studentName.innerHTML = `<option value="">No students listed for Nilai ${grade}</option>`;
    }
  },

  async loginStudent() {
    const value = this.elements.studentName.value;
    if (!value) { this.elements.loginMessage.textContent = "Choose your grade and name to continue."; return; }
    const [firstName, lastName, grade] = value.split("|");
    this.currentStudent = { firstName, lastName, grade: Number(grade) };
    this.currentGrade = Number(grade);
    this.elements.loginMessage.textContent = "";
    await this.saveSession();
    this.selectGrade(this.currentGrade);
  },

  getTamilGreeting(name) {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return `🌅 இனிய காலை வணக்கம், ${name}!`;
    } else if (hour >= 12 && hour < 17) {
      return `☀️ இனிய மதிய வணக்கம், ${name}!`;
    } else if (hour >= 17 && hour < 21) {
      return `🌆 இனிய மாலை வணக்கம், ${name}!`;
    } else {
      return `🌙 இனிய இரவு வணக்கம், ${name}!`;
    }
  },

  async saveSession() {
    localStorage.setItem("tamilKidsStudent", JSON.stringify(this.currentStudent));
    try { await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(this.currentStudent) }); } catch (_) { /* GitHub Pages uses local browser storage. */ }
  },

  async saveProgress(record) {
    if (!this.currentStudent) return;
    const entry = { ...record, student: this.currentStudent, recordedAt: new Date().toISOString() };
    const key = "tamilKidsProgress";
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    saved.push(entry);
    localStorage.setItem(key, JSON.stringify(saved));
    this.updateStudentDashboard();
    try { await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) }); } catch (_) { /* Local fallback remains available. */ }
  },

  updateStudentDashboard() {
    if (!this.currentStudent) return;
    const name = `${this.currentStudent.firstName} ${this.currentStudent.lastName}`.trim();
    if (this.elements.studentGreetingText) {
      this.elements.studentGreetingText.textContent = this.getTamilGreeting(name);
    }
    if (this.elements.studentStatusText) {
      this.elements.studentStatusText.textContent = `இன்றைய தமிழ் பயிற்சிகளைத் தொடங்குங்கள் 🚀`;
    }
    if (this.elements.studentGradeBadge) {
      this.elements.studentGradeBadge.textContent = `🌟 Nilai ${this.currentStudent.grade} (${this.currentStudent.grade}-ஆம் வகுப்பு)`;
    }

    const key = "tamilKidsProgress";
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    const studentRecords = saved.filter(r =>
      r.student &&
      r.student.firstName === this.currentStudent.firstName &&
      r.student.lastName === this.currentStudent.lastName
    );

    let stars = 0;
    let kuralCount = 0;
    let aathichudiCount = 0;
    let rcCount = 0;
    let quizCount = 0;

    studentRecords.forEach(r => {
      stars += (r.stars || 0);
      const cat = (r.category || "").toLowerCase();
      if (cat.includes("kural-quiz") || cat.includes("aathichudi-quiz") || cat.includes("reading-club-quiz") || cat.includes("rc-quiz")) {
        quizCount++;
      } else if (cat.includes("thirukkural") || cat.includes("kural")) {
        kuralCount++;
      } else if (cat.includes("aathichudi")) {
        aathichudiCount++;
      } else if (cat.includes("reading-club") || cat.includes("rc")) {
        rcCount++;
      }
    });

    if (this.elements.statStarsCount) this.elements.statStarsCount.textContent = stars;
    if (this.elements.statKuralCount) this.elements.statKuralCount.textContent = kuralCount;
    if (this.elements.statAathichudiCount) this.elements.statAathichudiCount.textContent = aathichudiCount;
    if (this.elements.statRcCount) this.elements.statRcCount.textContent = rcCount;
    if (this.elements.statQuizCount) this.elements.statQuizCount.textContent = quizCount;
    if (this.elements.totalStarsCount) this.elements.totalStarsCount.textContent = stars;
  },

  async openAdmin() {
    this.showScreen("admin");
    let records = JSON.parse(localStorage.getItem("tamilKidsProgress") || "[]");
    try {
      const response = await fetch("/api/progress");
      if (response.ok) records = await response.json();
    } catch (_) { /* Browser fallback */ }
    this.adminRecords = records;
    this.renderAdminList();
  },

  renderAdminList() {
    const records = this.adminRecords || JSON.parse(localStorage.getItem("tamilKidsProgress") || "[]");
    const filter = this.elements.adminFilterSelect ? this.elements.adminFilterSelect.value : "all";

    let filtered = records;
    if (filter === "thirukkural") {
      filtered = records.filter(r => r.category === "thirukkural");
    } else if (filter === "kural-quiz") {
      filtered = records.filter(r => r.category === "kural-quiz");
    } else if (filter === "aathichudi") {
      filtered = records.filter(r => r.category === "aathichudi");
    } else if (filter === "aathichudi-quiz") {
      filtered = records.filter(r => r.category === "aathichudi-quiz");
    } else if (filter === "translation") {
      filtered = records.filter(r => !["thirukkural", "kural-quiz", "aathichudi", "aathichudi-quiz"].includes(r.category));
    }

    if (this.elements.adminSummary) {
      this.elements.adminSummary.textContent = `${this.students.length} students registered · ${records.length} total learning attempts tracked`;
    }
    if (this.elements.metricStudentsCount) this.elements.metricStudentsCount.textContent = this.students.length;
    if (this.elements.metricAttemptsCount) this.elements.metricAttemptsCount.textContent = records.length;
    if (this.elements.metricKuralCount) {
      this.elements.metricKuralCount.textContent = records.filter(r => (r.category || "").includes("kural")).length;
    }
    if (this.elements.metricAathichudiCount) {
      this.elements.metricAathichudiCount.textContent = records.filter(r => (r.category || "").includes("aathichudi")).length;
    }

    const recent = filtered.slice(-25).reverse();
    if (this.elements.adminProgressList) {
      this.elements.adminProgressList.innerHTML = recent.length ? recent.map(item => {
        const studentName = item.student ? `${item.student.firstName} ${item.student.lastName} (Nilai ${item.student.grade})` : "Student";
        const catLabel = item.category === "thirukkural" ? "📜 திருக்குறள் வாசிப்பு" :
                        item.category === "kural-quiz" ? "⚡ திருக்குறள் Quick Check" :
                        item.category === "aathichudi" ? "🪶 ஆத்திசூடி வாசிப்பு" :
                        item.category === "aathichudi-quiz" ? "⚡ ஆத்திசூடி Quick Check" :
                        `📖 மொழிபெயர்ப்பு (${item.category || "வகுப்பு"})`;
        const timeStr = item.recordedAt ? new Date(item.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
        const starsStr = item.stars ? "★".repeat(item.stars) : "";
        return `
          <div class="admin-progress-item">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <strong>${studentName}</strong>
              <small style="color: #64748b;">${catLabel} · ${item.sentenceId || ""} · ${timeStr}</small>
            </div>
            <div style="text-align: right;">
              <strong style="color: ${item.score >= 70 ? '#166534' : '#b45309'};">${item.score}%</strong>
              <div style="color: #eab308; font-size: 0.85rem;">${starsStr}</div>
            </div>
          </div>
        `;
      }).join("") : `<div class="admin-progress-item">No records found for this filter.</div>`;
    }
  },

  logout() { this.currentStudent = null; localStorage.removeItem("tamilKidsStudent"); this.showScreen("login"); },

  // Page 1 -> Page 2: Select Grade
  selectGrade(grade) {
    this.currentGrade = grade;
    const gradeLabels = {
      1: "🌟 1st Grade (1-ஆம் வகுப்பு)",
      2: "🚀 2nd Grade (2-ஆம் வகுப்பு)",
      3: "👑 3rd Grade (3-ஆம் வகுப்பு)",
      4: "📚 4th Grade (4-ஆம் வகுப்பு)",
      5: "🔎 5th Grade (5-ஆம் வகுப்பு)",
      6: "🧠 6th Grade (6-ஆம் வகுப்பு)",
      7: "🌱 7th Grade (7-ஆம் வகுப்பு)",
      8: "🏆 8th Grade (8-ஆம் வகுப்பு)"
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
    KidSpeechService.cancelListening();
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
    if (this.isListening || KidSpeechService.isListening || KidSpeechService.isStarting) {
      if (window.KidAppLogger) KidAppLogger.log("VOICE", "Mic stopped by user");
      KidSpeechService.cancelListening();
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

      if (this.elements.micPromptText) this.elements.micPromptText.textContent = "Starting microphone… Tap again to cancel";
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
            KidSpeechService.cancelListening();
            this.handleSpeechStateChange(false);
            if (window.KidAppLogger) KidAppLogger.log("VOICE", "Final transcript captured", { transcript: final });
            this.evaluateTamilInput(final);
          }
        },
        onError: (err) => {
          console.warn("Speech recognition note:", err);
          this.handleSpeechStateChange(false);
          const messages = {
            "not-allowed": "The browser denied speech access. Check this website’s microphone permission. On iPhone, also check that Siri is enabled in Settings, then retry.",
            "service-not-allowed": "The browser’s speech service is unavailable even if microphone access is allowed. On iPhone, check that Siri is enabled in Settings. If using Chrome, try opening the page directly in Safari. If Safari also fails, use Tamil keyboard dictation or type below.",
            "language-not-supported": "The browser’s speech service cannot recognize Tamil on this device. Use Tamil keyboard dictation or type your answer below.",
            "network": "Speech recognition could not connect. Check your internet connection and retry.",
            "audio-capture": "The browser could not capture microphone audio. Close other apps using the microphone and retry.",
            "no-speech": "No words were recognized. Tap the microphone and speak your Tamil answer again.",
            "recognition-timeout": "The browser did not finish speech recognition. Reload the page and retry. You can also use Tamil keyboard dictation below.",
            "speech-api-unavailable": "Speech recognition is unavailable in this browser. Open this page in Safari or enter Tamil below.",
            "insecure-context": "Microphone access requires the HTTPS website. Open the published GitHub Pages link."
          };
          this.showManualInputFallback(`${messages[err] || "Speech recognition could not start. Retry or enter Tamil below."} (${err})`);
          if (this.elements.spokenTextDisplay) {
            this.elements.spokenTextDisplay.textContent = this.manualFallbackMessage;
            this.elements.spokenTextDisplay.classList.add("empty");
          }
          if (window.KidAppLogger) KidAppLogger.log("VOICE", `Speech error: ${err}`);
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
          this.saveProgress({ sentenceId: current.id, category: current.category, score: result.percentage, stars: result.stars, passed: true });
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
