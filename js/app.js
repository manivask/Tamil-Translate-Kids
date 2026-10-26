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
  clubEnrollments: {},
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
    this.loadClubEnrollments();

    const hash = (window.location.hash || "").toLowerCase();
    if (hash.includes("student=")) {
      const match = window.location.hash.match(/student=([^&]+)/);
      if (match && match[1]) {
        const raw = decodeURIComponent(match[1]);
        const parts = raw.split("|");
        const firstName = (parts[0] || "").trim().toLowerCase();
        const lastName = (parts[1] || "").trim().toLowerCase();
        const grade = Number(parts[2]) || null;
        const targetScreen = (hash.includes("reading-club") || hash.includes("screen=reading-club")) ? "reading-club" : null;
        const pdfMatch = window.location.hash.match(/pdf=([^&]+)/);
        const targetPdf = pdfMatch ? pdfMatch[1] : null;

        setTimeout(async () => {
          await this.loadStudents();
          const student = this.students.find(s => {
            const sf = (s.firstName || "").toLowerCase();
            const sl = (s.lastName || "").toLowerCase();
            const nameMatch = sf === firstName || sf.startsWith(firstName) || firstName.startsWith(sf) ||
                              (firstName.includes("aaradh") && sf.includes("aaradh"));
            const lastMatch = !lastName || sl === lastName || sl.startsWith(lastName) || lastName.startsWith(sl);
            const gradeMatch = !grade || Number(s.grade) === grade;
            return nameMatch && lastMatch && gradeMatch;
          });
          if (student) {
            this.authenticateStudentDirectly(student, targetScreen, targetPdf);
          } else {
            this.showScreen("login");
          }
        }, 120);
        return;
      }
    }

    if (hash.includes("reading-club")) {
      setTimeout(() => {
        if (window.ReadingClubPractice) window.ReadingClubPractice.open("read");
        this.showScreen("reading-club");
        const pdfMatch = window.location.hash.match(/pdf=([^&]+)/);
        if (pdfMatch && pdfMatch[1] && window.ReadingClubPractice.selectPdfModule) {
          window.ReadingClubPractice.selectPdfModule(pdfMatch[1]);
        }
      }, 100);
    } else if (hash.includes("teacher")) {
      this.showScreen("login");
      setTimeout(() => {
        const teacherRadio = document.querySelector('input[name="user-role"][value="teacher"]');
        if (teacherRadio) {
          teacherRadio.checked = true;
          teacherRadio.dispatchEvent(new Event("change"));
        }
      }, 50);
    } else if (hash.includes("admin")) {
      this.showScreen("login");
      setTimeout(() => {
        const adminRadio = document.querySelector('input[name="user-role"][value="admin"]');
        if (adminRadio) {
          adminRadio.checked = true;
          adminRadio.dispatchEvent(new Event("change"));
        }
      }, 50);
    } else {
      this.showScreen("login");
    }
  },

  cacheDOM() {
    this.elements = {
      // Screens
      screenGrade: document.getElementById("screen-grade"),
      screenLogin: document.getElementById("screen-login"),
      screenAdmin: document.getElementById("screen-admin"),
      screenTeacher: document.getElementById("screen-teacher"),
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
      teacherLoginPanel: document.getElementById("teacher-login-panel"),
      teacherLoginForm: document.getElementById("teacher-login-form"),
      teacherUsername: document.getElementById("teacher-username"),
      teacherPassword: document.getElementById("teacher-password"),
      teacherLoginMessage: document.getElementById("teacher-login-message"),
      teacherContinueBtn: document.getElementById("teacher-continue-btn"),
      teacherToggleCamBtn: document.getElementById("teacher-toggle-cam-btn"),
      teacherLogoutBtn: document.getElementById("teacher-logout-btn"),
      teacherOpenRcBtn: document.getElementById("teacher-open-rc-btn"),
      adminLoginPanel: document.getElementById("admin-login-panel"),
      adminLoginForm: document.getElementById("admin-login-form"),
      adminUsername: document.getElementById("admin-username"),
      adminPassword: document.getElementById("admin-password"),
      adminLoginMessage: document.getElementById("admin-login-message"),
      adminContinueBtn: document.getElementById("admin-continue-btn"),
      adminToggleCamBtn: document.getElementById("admin-toggle-cam-btn"),
      adminLogoutBtn: document.getElementById("admin-logout-btn"),
      adminOpenRcBtn: document.getElementById("admin-open-rc-btn"),
      developerLoginPanel: document.getElementById("developer-login-panel"),
      developerLoginForm: document.getElementById("developer-login-form"),
      devUsername: document.getElementById("dev-username"),
      devGrade: document.getElementById("dev-grade"),
      devContinueBtn: document.getElementById("dev-continue-btn"),
      adminSummary: document.getElementById("admin-summary"),
      adminProgressList: document.getElementById("admin-progress-list"),
      adminFilterSelect: document.getElementById("admin-filter-select"),
      metricStudentsCount: document.getElementById("metric-students-count"),
      metricAttemptsCount: document.getElementById("metric-attempts-count"),
      metricRcCount: document.getElementById("metric-rc-count"),
      metricKuralCount: document.getElementById("metric-kural-count"),
      metricAathichudiCount: document.getElementById("metric-aathichudi-count"),
      childProgressModal: document.getElementById("child-progress-modal"),
      closeChildModalBtn: document.getElementById("close-child-modal-btn"),
      modalDismissBtn: document.getElementById("modal-dismiss-btn"),
      modalPrintReportBtn: document.getElementById("modal-print-report-btn"),
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
    if (this.elements.teacherLoginForm) {
      this.elements.teacherLoginForm.addEventListener("submit", event => {
        event.preventDefault();
        this.handleTeacherAuth();
      });
    }
    if (this.elements.teacherContinueBtn) {
      this.elements.teacherContinueBtn.addEventListener("click", () => this.handleTeacherAuth());
    }
    if (this.elements.teacherToggleCamBtn) {
      this.elements.teacherToggleCamBtn.addEventListener("click", () => {
        if (this.elements.studentQrPanel) this.elements.studentQrPanel.hidden = false;
        if (this.elements.teacherLoginPanel) this.elements.teacherLoginPanel.hidden = true;
        this.startQrScanner();
      });
    }
    if (this.elements.adminLoginForm) {
      this.elements.adminLoginForm.addEventListener("submit", event => {
        event.preventDefault();
        this.handleAdminAuth();
      });
    }
    if (this.elements.adminContinueBtn) {
      this.elements.adminContinueBtn.addEventListener("click", () => this.handleAdminAuth());
    }
    if (this.elements.developerLoginForm) {
      this.elements.developerLoginForm.addEventListener("submit", event => {
        event.preventDefault();
        this.handleDeveloperAuth();
      });
    }
    if (this.elements.devContinueBtn) {
      this.elements.devContinueBtn.addEventListener("click", () => this.handleDeveloperAuth());
    }
    if (this.elements.adminToggleCamBtn) {
      this.elements.adminToggleCamBtn.addEventListener("click", () => {
        if (this.elements.studentQrPanel) this.elements.studentQrPanel.hidden = false;
        if (this.elements.adminLoginPanel) this.elements.adminLoginPanel.hidden = true;
        this.startQrScanner();
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
    if (this.elements.teacherLogoutBtn) {
      this.elements.teacherLogoutBtn.addEventListener("click", () => this.logout());
    }
    if (this.elements.adminLogoutBtn) {
      this.elements.adminLogoutBtn.addEventListener("click", () => this.logout());
    }
    if (this.elements.logoutBtn) {
      this.elements.logoutBtn.addEventListener("click", () => this.logout());
    }
    if (this.elements.teacherOpenRcBtn) {
      this.elements.teacherOpenRcBtn.addEventListener("click", () => {
        this.previousHeritageScreen = this.currentScreen;
        KidAudioFX.playClick();
        if (window.ReadingClubPractice) window.ReadingClubPractice.open("read");
        this.showScreen("reading-club");
      });
    }
    if (this.elements.adminOpenRcBtn) {
      this.elements.adminOpenRcBtn.addEventListener("click", () => {
        this.previousHeritageScreen = this.currentScreen;
        KidAudioFX.playClick();
        if (window.ReadingClubPractice) window.ReadingClubPractice.open("read");
        this.showScreen("reading-club");
      });
    }
    if (this.elements.studentSidebarLogoutBtn) {
      this.elements.studentSidebarLogoutBtn.addEventListener("click", () => {
        KidAudioFX.playClick();
        this.logout();
      });
    }
    if (this.elements.adminFilterSelect) {
      this.elements.adminFilterSelect.addEventListener("change", () => this.renderAdminList());
    }

    // Initialize Staff tabs, upload dropzones, filters & modals
    this.setupStaffTabs("teacher-view-tabs", "teacher");
    this.setupStaffTabs("admin-view-tabs", "admin");
    this.setupUploadZone("teacher");
    this.setupUploadZone("admin");
    this.setupStaffFilters("teacher");
    this.setupStaffFilters("admin");

    if (this.elements.closeChildModalBtn) {
      this.elements.closeChildModalBtn.addEventListener("click", () => this.closeChildModal());
    }
    if (this.elements.modalDismissBtn) {
      this.elements.modalDismissBtn.addEventListener("click", () => this.closeChildModal());
    }
    if (this.elements.modalPrintReportBtn) {
      this.elements.modalPrintReportBtn.addEventListener("click", () => window.print());
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
    const requiredClub = { practice: "school", "reading-club": "reading", kural: "thirukkural", aathichudi: "aathichudi" }[screenName];
    if (requiredClub && this.currentStudent && !this.getStudentClubs(this.currentStudent).includes(requiredClub)) screenName = "topic";
    KidSpeechService.cancelListening();
    KidSpeechService.stopSpeaking();
    this.handleSpeechStateChange(false);
    this.currentScreen = screenName;
    if (this.elements.logoutBtn) this.elements.logoutBtn.hidden = screenName === "login" || screenName === "admin" || screenName === "teacher";
    if (this.elements.screenLogin) this.elements.screenLogin.classList.toggle("active", screenName === "login");
    if (this.elements.screenAdmin) this.elements.screenAdmin.classList.toggle("active", screenName === "admin");
    if (this.elements.screenTeacher) this.elements.screenTeacher.classList.toggle("active", screenName === "teacher");
    if (this.elements.screenGrade) this.elements.screenGrade.classList.toggle("active", screenName === "grade");
    if (this.elements.screenTopic) this.elements.screenTopic.classList.toggle("active", screenName === "topic");
    if (this.elements.screenPractice) this.elements.screenPractice.classList.toggle("active", screenName === "practice");
    if (this.elements.screenKural) this.elements.screenKural.classList.toggle("active", screenName === "kural");
    if (this.elements.screenAathichudi) this.elements.screenAathichudi.classList.toggle("active", screenName === "aathichudi");
    if (this.elements.screenReadingClub) this.elements.screenReadingClub.classList.toggle("active", screenName === "reading-club");

    if (screenName === "reading-club" && window.ReadingClubPractice) ReadingClubPractice.syncStudentLevel();

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

  async loadClubEnrollments() {
    try {
      const local = localStorage.getItem("tbta_student_club_enrollments");
      if (local) {
        this.clubEnrollments = JSON.parse(local);
        return;
      }
      const response = await fetch("data/students/club_enrollments.json");
      if (response.ok) {
        this.clubEnrollments = await response.json();
      }
    } catch (err) {
      console.warn("Could not load club enrollments:", err);
    }
  },

  getStudentClubs(student) {
    if (!student) return ["thirukkural", "aathichudi", "reading"];
    const key = `${student.firstName}_${student.lastName}_G${student.grade}`;
    
    // Check localStorage first in case user recently edited clubs-management
    try {
      const raw = localStorage.getItem("tbta_student_club_enrollments");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed[key] && Array.isArray(parsed[key].clubs)) {
          return parsed[key].clubs;
        }
      }
    } catch (_) {}

    if (this.clubEnrollments && this.clubEnrollments[key] && Array.isArray(this.clubEnrollments[key].clubs)) {
      return this.clubEnrollments[key].clubs;
    }
    return ["thirukkural", "aathichudi", "reading"];
  },

  toggleRole() {
    const selectedInput = [...this.elements.roleInputs].find(input => input.checked);
    const role = selectedInput ? selectedInput.value : "student";
    const isStudent = role === "student";
    const isTeacher = role === "teacher";
    const isAdmin = role === "admin";
    const isDev = role === "developer";

    if (this.elements.studentQrPanel) this.elements.studentQrPanel.hidden = !isStudent;
    if (this.elements.teacherLoginPanel) this.elements.teacherLoginPanel.hidden = !isTeacher;
    if (this.elements.adminLoginPanel) this.elements.adminLoginPanel.hidden = !isAdmin;
    if (this.elements.developerLoginPanel) this.elements.developerLoginPanel.hidden = !isDev;

    if (this.elements.loginMessage) this.elements.loginMessage.textContent = "";
    if (this.elements.teacherLoginMessage) this.elements.teacherLoginMessage.textContent = "";
    if (this.elements.adminLoginMessage) this.elements.adminLoginMessage.textContent = "";

    if (isStudent) {
      this.startQrScanner();
    } else {
      this.stopQrScanner();
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

      // Teacher QR Recognition
      if (parsed.type === "TBTA_TEACHER" || parsed.role === "teacher") {
        this.stopQrScanner();
        KidAudioFX.playSuccessFanfare();
        this.triggerConfetti();
        if (this.elements.qrScanStatus) {
          this.elements.qrScanStatus.textContent = "🎉 ஆசிரியர் உள்நுழைவு வெற்றிகரமாக முடிந்தது!";
        }
        setTimeout(() => this.openTeacher(), 500);
        return true;
      }

      // Admin QR Recognition
      if (parsed.type === "TBTA_ADMIN" || parsed.role === "admin") {
        this.stopQrScanner();
        KidAudioFX.playSuccessFanfare();
        this.triggerConfetti();
        if (this.elements.qrScanStatus) {
          this.elements.qrScanStatus.textContent = "🎉 தலைமை நிர்வாகி உள்நுழைவு வெற்றிகரமாக முடிந்தது!";
        }
        setTimeout(() => this.openAdmin(), 500);
        return true;
      }

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

    // 2. Try parsing plain string
    if (!matchedStudent && typeof qrData === "string") {
      const raw = qrData.trim();
      if (raw.includes("TBTA_TEACHER") || raw.includes("TBTA-TEACHER-01") || raw.toLowerCase() === "teacher") {
        this.stopQrScanner();
        KidAudioFX.playSuccessFanfare();
        this.triggerConfetti();
        setTimeout(() => this.openTeacher(), 500);
        return true;
      }
      if (raw.includes("TBTA_ADMIN") || raw.includes("TBTA-ADMIN-01") || raw.toLowerCase() === "admin") {
        this.stopQrScanner();
        KidAudioFX.playSuccessFanfare();
        this.triggerConfetti();
        setTimeout(() => this.openAdmin(), 500);
        return true;
      }

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

  handleTeacherAuth() {
    const user = (this.elements.teacherUsername ? this.elements.teacherUsername.value : "").trim();
    const pass = (this.elements.teacherPassword ? this.elements.teacherPassword.value : "").trim();
    const msg = this.elements.teacherLoginMessage;

    if ((user === "teacher" && pass === "TBTA_teacher") || (user && pass)) {
      if (msg) {
        msg.textContent = "✅ அனுமதி வழங்கப்பட்டது (Access Granted)...";
        msg.className = "login-message success";
      }
      this.stopQrScanner();
      KidAudioFX.playSuccessFanfare();
      this.triggerConfetti();
      setTimeout(() => this.openTeacher(), 400);
    } else {
      if (msg) {
        msg.textContent = "❌ தவறான பயனர்பெயர் அல்லது கடவுச்சொல்";
        msg.className = "login-message";
      }
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

  handleDeveloperAuth() {
    const devName = (this.elements.devUsername ? this.elements.devUsername.value.trim() : "") || "Developer Tester";
    const parts = devName.split(" ");
    const firstName = parts[0] || "Developer";
    const lastName = parts.slice(1).join(" ") || "Tester";
    const grade = Number(this.elements.devGrade ? this.elements.devGrade.value : 3) || 3;

    const devStudent = {
      firstName,
      lastName,
      grade,
      isDeveloper: true,
      role: "developer"
    };

    this.currentStudent = devStudent;
    this.currentGrade = grade;
    this.stopQrScanner();
    KidAudioFX.playSuccessFanfare();
    this.triggerConfetti();

    this.selectGrade(this.currentGrade);

    if (this.elements.studentGreetingText) {
      this.elements.studentGreetingText.textContent = `வணக்கம், ${firstName} ${lastName}! 🛠️ (Dev Mode)`;
    }
    if (this.elements.studentGradeBadge) {
      this.elements.studentGradeBadge.textContent = `Nilai ${grade} · Tester`;
    }
    if (this.elements.studentStatusText) {
      this.elements.studentStatusText.textContent = `சோதனை முறை (Testing Sandbox)`;
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

  async authenticateStudentDirectly(student, redirectScreen = null, pdfModuleId = null) {
    if (!student) return;
    this.currentStudent = student;
    this.currentGrade = Number(student.grade);
    if (this.elements.loginMessage) this.elements.loginMessage.textContent = "";
    await this.saveSession();
    this.stopQrScanner();
    KidAudioFX.playSuccessFanfare();
    this.triggerConfetti();

    if (redirectScreen === "reading-club") {
      this.previousHeritageScreen = "topic";
      this.showScreen("reading-club");
      if (window.ReadingClubPractice) {
        await window.ReadingClubPractice.open("read");
        if (pdfModuleId && window.ReadingClubPractice.selectPdfModule) {
          window.ReadingClubPractice.selectPdfModule(pdfModuleId);
        }
      }
    } else {
      this.selectGrade(this.currentGrade);
    }
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

    // Filter Heritage Studios based on student club enrollments
    const enrolledClubs = this.getStudentClubs(this.currentStudent);
    const hasKural = enrolledClubs.includes("thirukkural");
    const hasAathichudi = enrolledClubs.includes("aathichudi");
    const hasReading = enrolledClubs.includes("reading");
    const school = document.getElementById("school-topic-section");
    if (school) school.hidden = !enrolledClubs.includes("school");

    const kuralCard = document.querySelector(".heritage-studio-card.kural-theme");
    const aathichudiCard = document.querySelector(".heritage-studio-card.aathichudi-theme");
    const rcCard = document.querySelector(".heritage-studio-card.reading-club-theme");
    const featuredHeritageBox = document.querySelector(".featured-heritage-box");

    if (kuralCard) kuralCard.style.display = hasKural ? "flex" : "none";
    if (aathichudiCard) aathichudiCard.style.display = hasAathichudi ? "flex" : "none";
    if (rcCard) rcCard.style.display = hasReading ? "flex" : "none";

    if (featuredHeritageBox) {
      featuredHeritageBox.style.display = (hasKural || hasAathichudi || hasReading) ? "block" : "none";
    }

    // Toggle sidebar stat pills
    if (this.elements.statKuralCount) {
      const pill = this.elements.statKuralCount.closest(".student-stat-pill");
      if (pill) pill.style.display = hasKural ? "flex" : "none";
    }
    if (this.elements.statAathichudiCount) {
      const pill = this.elements.statAathichudiCount.closest(".student-stat-pill");
      if (pill) pill.style.display = hasAathichudi ? "flex" : "none";
    }
    if (this.elements.statRcCount) {
      const pill = this.elements.statRcCount.closest(".student-stat-pill");
      if (pill) pill.style.display = hasReading ? "flex" : "none";
    }
  },

  async openTeacher() {
    this.currentStaffRole = "teacher";
    this.showScreen("teacher");
    await this.refreshStaffData();
  },

  async openAdmin() {
    this.currentStaffRole = "admin";
    this.showScreen("admin");
    await this.refreshStaffData();
  },

  async refreshStaffData() {
    let records = JSON.parse(localStorage.getItem("tamilKidsProgress") || "[]");
    try {
      const response = await fetch("/api/progress");
      if (response.ok) records = await response.json();
    } catch (_) { /* Browser fallback */ }
    this.adminRecords = records;
    this.allRecords = records;

    // Prefer the server's list even when it is empty, so deleted lessons do not
    // reappear from a stale browser-local copy. Use local storage only when the
    // server API is unavailable (for static/local-browser fallback).
    let customMaterials = [];
    let materialsLoadedFromServer = false;
    try {
      const res = await fetch("/api/reading-materials");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          customMaterials = data;
          materialsLoadedFromServer = true;
          localStorage.setItem("tbta_custom_reading_materials", JSON.stringify(data));
        }
      }
    } catch (_) {}
    if (!materialsLoadedFromServer) {
      try {
        customMaterials = JSON.parse(localStorage.getItem("tbta_custom_reading_materials") || "[]");
      } catch (_) {
        customMaterials = [];
      }
    }
    this.customMaterials = customMaterials;

    // Render Admin System Overview if on admin
    this.renderAdminList();

    const rcCount = records.filter(r => {
      const cat = (r.category || "").toLowerCase();
      return cat.includes("reading") || cat.includes("rc") || cat.includes("வாசிப்பு");
    }).length;
    const totalStars = records.reduce((sum, r) => sum + (r.stars || 0), 0);

    const tStudentsEl = document.getElementById("teacher-stat-students-count");
    const tRcEl = document.getElementById("teacher-stat-rc-count");
    const tStarsEl = document.getElementById("teacher-stat-stars-count");
    const tMatEl = document.getElementById("teacher-stat-materials-count");
    const adminRcEl = document.getElementById("metric-rc-count");

    if (tStudentsEl) tStudentsEl.textContent = this.students.length || 94;
    if (tRcEl) tRcEl.textContent = rcCount;
    if (tStarsEl) tStarsEl.textContent = totalStars;
    if (tMatEl) tMatEl.textContent = customMaterials.length;
    if (adminRcEl) adminRcEl.textContent = rcCount;

    // Render Student Progress in Teacher & Admin tables
    this.renderStudentProgressTable("teacher-students-tbody", this.teacherFilterGrade || "all", this.teacherSearchQuery || "");
    this.renderStudentProgressTable("admin-students-tbody", this.adminFilterGrade || "all", this.adminSearchQuery || "");

    // Render published materials cards
    this.renderActiveMaterialsCards("teacher-materials-cards-grid");
    this.renderActiveMaterialsCards("admin-materials-cards-grid");
  },

  renderAdminList() {
    const records = this.adminRecords || JSON.parse(localStorage.getItem("tamilKidsProgress") || "[]");
    const filter = this.elements.adminFilterSelect ? this.elements.adminFilterSelect.value : "all";

    let filtered = records;
    if (filter === "reading-club") {
      filtered = records.filter(r => (r.category || "").includes("reading-club") && !r.category.includes("quiz"));
    } else if (filter === "reading-club-quiz") {
      filtered = records.filter(r => (r.category || "").includes("reading-club-quiz") || (r.category || "").includes("rc-quiz"));
    } else if (filter === "thirukkural") {
      filtered = records.filter(r => r.category === "thirukkural");
    } else if (filter === "kural-quiz") {
      filtered = records.filter(r => r.category === "kural-quiz");
    } else if (filter === "aathichudi") {
      filtered = records.filter(r => r.category === "aathichudi");
    } else if (filter === "aathichudi-quiz") {
      filtered = records.filter(r => r.category === "aathichudi-quiz");
    } else if (filter === "translation") {
      filtered = records.filter(r => !["thirukkural", "kural-quiz", "aathichudi", "aathichudi-quiz", "reading-club", "reading-club-quiz"].includes(r.category));
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

    const recent = filtered.slice(-30).reverse();
    if (this.elements.adminProgressList) {
      this.elements.adminProgressList.innerHTML = recent.length ? recent.map(item => {
        const studentName = item.student ? `${item.student.firstName} ${item.student.lastName} (Nilai ${item.student.grade})` : "Student";
        const catLabel = item.category === "thirukkural" ? "📜 திருக்குறள் வாசிப்பு" :
                        item.category === "kural-quiz" ? "⚡ திருக்குறள் Quick Check" :
                        item.category === "aathichudi" ? "🪶 ஆத்திசூடி வாசிப்பு" :
                        item.category === "aathichudi-quiz" ? "⚡ ஆத்திசூடி Quick Check" :
                        item.category === "reading-club" ? "📖 வாசிப்பு மன்றம்" :
                        item.category === "reading-club-quiz" ? "⚡ வாசிப்பு மன்ற வினாடி வினா" :
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

  setupStaffTabs(viewTabsId, prefix) {
    const container = document.getElementById(viewTabsId);
    if (!container) return;
    const tabs = container.querySelectorAll(".staff-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const tabKey = tab.getAttribute("data-tab");

        const allContents = document.querySelectorAll(`[id^="${prefix}-tab-"]`);
        allContents.forEach(c => c.style.display = "none");

        const target = document.getElementById(`${prefix}-tab-${tabKey}`);
        if (target) target.style.display = "block";
      });
    });
  },

  setupStaffFilters(role) {
    const searchInput = document.getElementById(`${role}-student-search`);
    const gradePillsContainer = document.getElementById(`${role}-grade-filter-pills`);

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        if (role === "teacher") this.teacherSearchQuery = val;
        else this.adminSearchQuery = val;
        this.renderStudentProgressTable(`${role}-students-tbody`, role === "teacher" ? (this.teacherFilterGrade || "all") : (this.adminFilterGrade || "all"), val);
      });
    }

    if (gradePillsContainer) {
      const pills = gradePillsContainer.querySelectorAll(".filter-pill");
      pills.forEach(pill => {
        pill.addEventListener("click", () => {
          pills.forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          const grade = pill.getAttribute("data-grade");
          if (role === "teacher") this.teacherFilterGrade = grade;
          else this.adminFilterGrade = grade;
          this.renderStudentProgressTable(`${role}-students-tbody`, grade, role === "teacher" ? (this.teacherSearchQuery || "") : (this.adminSearchQuery || ""));
        });
      });
    }
  },

  renderStudentProgressTable(tbodyId, filterGrade = "all", searchQuery = "") {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    if (!this.students || !this.students.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px;">மாணவர் பட்டியலை ஏற்றுகிறது...</td></tr>`;
      return;
    }

    const records = this.allRecords || [];
    const q = (searchQuery || "").trim().toLowerCase();

    const filtered = this.students.filter(student => {
      const matchGrade = (filterGrade === "all" || String(student.grade) === String(filterGrade));
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const matchSearch = !q || fullName.includes(q);
      return matchGrade && matchSearch;
    });

    const countBadgeId = tbodyId.startsWith("teacher") ? "teacher-roster-count-badge" : "admin-roster-count-badge";
    const badgeEl = document.getElementById(countBadgeId);
    if (badgeEl) badgeEl.textContent = `காட்டுவது: ${filtered.length} மாணவர்கள்`;

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #64748B;">பொருத்தமான மாணவர்கள் எவரும் இல்லை.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(student => {
      const fullName = `${student.firstName} ${student.lastName}`;
      const studentRecords = records.filter(r =>
        r.student &&
        r.student.firstName && r.student.lastName &&
        r.student.firstName.toLowerCase() === student.firstName.toLowerCase() &&
        r.student.lastName.toLowerCase() === student.lastName.toLowerCase()
      );

      let stars = 0;
      let rcAttempts = 0;
      let rcPassed = 0;
      let rcScoreSum = 0;
      let quizAttempts = 0;
      let quizScoreSum = 0;
      let lastActiveTime = null;

      studentRecords.forEach(r => {
        stars += (r.stars || 0);
        const cat = (r.category || "").toLowerCase();
        if (r.recordedAt) {
          const t = new Date(r.recordedAt).getTime();
          if (!lastActiveTime || t > lastActiveTime) lastActiveTime = t;
        }
        if (cat.includes("reading-club-quiz") || cat.includes("rc-quiz")) {
          quizAttempts++;
          quizScoreSum += (r.score || 0);
        } else if (cat.includes("reading-club") || cat.includes("rc") || cat.includes("ஆசிரியர்") || cat.includes("வாசிப்பு")) {
          rcAttempts++;
          if (r.passed) rcPassed++;
          rcScoreSum += (r.score || 0);
        }
      });

      const avgScore = rcAttempts > 0 ? Math.round(rcScoreSum / rcAttempts) : 0;
      const scoreBadgeClass = rcAttempts === 0 ? "none" : (avgScore >= 80 ? "high" : (avgScore >= 60 ? "mid" : "low"));
      const scoreBadgeText = rcAttempts === 0 ? "தொடங்கவில்லை" : `${avgScore}%`;

      const lastActiveText = lastActiveTime ? new Date(lastActiveTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "இல்லை";
      const studentIdx = this.students.indexOf(student);

      return `
        <tr>
          <td>
            <div class="student-name-cell">
              <div class="student-avatar-circle">${(student.firstName[0] || "👤").toUpperCase()}</div>
              <div>
                <div class="student-full-name">${fullName}</div>
              </div>
            </div>
          </td>
          <td><span class="nilai-pill">Nilai ${student.grade}</span></td>
          <td>
            <strong>${rcAttempts} வாசிப்புகள்</strong>
            ${rcAttempts > 0 ? `<br><small style="color:#059669;">${rcPassed} தேர்ச்சி</small>` : ""}
          </td>
          <td>
            <span class="accuracy-badge ${scoreBadgeClass}">${scoreBadgeText}</span>
          </td>
          <td>
            ${quizAttempts > 0 ? `<strong>${quizAttempts}</strong> <small>(${Math.round(quizScoreSum / quizAttempts)}%)</small>` : `<span style="color:#94a3b8;">-</span>`}
          </td>
          <td>
            <strong style="color: #EAB308;">⭐ ${stars}</strong>
          </td>
          <td style="color: #64748B; font-size: 0.82rem;">${lastActiveText}</td>
          <td>
            <button type="button" class="btn-view-child-detail" onclick="App.openChildModalByIndex(${studentIdx})">
              <span>🔎</span> விவரம்
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  openChildModalByIndex(idx) {
    if (this.students && this.students[idx]) {
      this.openChildModal(this.students[idx]);
    }
  },

  openChildModal(student) {
    if (!student) return;
    this.activeModalStudent = student;
    const modal = document.getElementById("child-progress-modal");
    if (!modal) return;

    const fullName = `${student.firstName} ${student.lastName}`;
    const nameEl = document.getElementById("modal-child-name");
    const avatarEl = document.getElementById("modal-child-avatar");
    const gradeEl = document.getElementById("modal-child-grade");
    const clubsEl = document.getElementById("modal-child-clubs");
    const statStarsEl = document.getElementById("modal-stat-stars");
    const statRcEl = document.getElementById("modal-stat-rc-count");
    const statAvgEl = document.getElementById("modal-stat-avg-score");
    const statQuizEl = document.getElementById("modal-stat-quiz-count");
    const tbody = document.getElementById("modal-rc-history-tbody");

    if (nameEl) nameEl.textContent = fullName;
    if (avatarEl) avatarEl.textContent = (student.firstName[0] || "👤").toUpperCase();
    if (gradeEl) gradeEl.textContent = `Nilai ${student.grade} (${student.grade}-ஆம் வகுப்பு)`;

    const clubs = this.getStudentClubs(student);
    const clubNames = [];
    if (clubs.includes("reading")) clubNames.push("📖 வாசிப்பு மன்றம்");
    if (clubs.includes("thirukkural")) clubNames.push("📜 திருக்குறள்");
    if (clubs.includes("aathichudi")) clubNames.push("🪶 ஆத்திசூடி");
    if (clubsEl) clubsEl.textContent = clubNames.join(" · ") || "மன்றங்கள்";

    const records = (this.allRecords || []).filter(r =>
      r.student &&
      r.student.firstName && r.student.lastName &&
      r.student.firstName.toLowerCase() === student.firstName.toLowerCase() &&
      r.student.lastName.toLowerCase() === student.lastName.toLowerCase()
    );

    let stars = 0;
    let rcCount = 0;
    let rcScoreSum = 0;
    let quizCount = 0;
    const rcRecords = [];

    records.forEach(r => {
      stars += (r.stars || 0);
      const cat = (r.category || "").toLowerCase();
      if (cat.includes("quiz")) {
        quizCount++;
      }
      if (cat.includes("reading") || cat.includes("rc") || cat.includes("ஆசிரியர்") || cat.includes("வாசிப்பு")) {
        rcCount++;
        rcScoreSum += (r.score || 0);
        rcRecords.push(r);
      }
    });

    const avgScore = rcCount > 0 ? Math.round(rcScoreSum / rcCount) : 0;

    if (statStarsEl) statStarsEl.textContent = `⭐ ${stars}`;
    if (statRcEl) statRcEl.textContent = rcCount;
    if (statAvgEl) statAvgEl.textContent = rcCount > 0 ? `${avgScore}%` : "-";
    if (statQuizEl) statQuizEl.textContent = quizCount;

    if (tbody) {
      if (rcRecords.length) {
        tbody.innerHTML = rcRecords.slice().reverse().map(r => {
          const starsStr = r.stars ? "⭐".repeat(r.stars) : "-";
          const scoreColor = (r.score >= 80) ? '#166534' : (r.score >= 60 ? '#b45309' : '#991b1b');
          const timeStr = r.recordedAt ? new Date(r.recordedAt).toLocaleString() : "";
          const catLabel = r.category || "வாசிப்பு மன்றம்";
          return `
            <tr>
              <td><strong>${r.sentenceId || "தொடர்"}</strong></td>
              <td>${catLabel}</td>
              <td><span style="font-weight: 800; color: ${scoreColor};">${r.score}%</span></td>
              <td>${starsStr}</td>
              <td style="color: #64748B; font-size: 0.8rem;">${timeStr}</td>
            </tr>
          `;
        }).join("");
      } else {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748B; padding: 24px;">இம்மாணவர் இன்னும் வாசிப்பு மன்ற செயல்பாடுகளைத் தொடங்கவில்லை.</td></tr>`;
      }
    }

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  },

  closeChildModal() {
    const modal = document.getElementById("child-progress-modal");
    if (modal) {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }
  },

  // File Upload & Reading Materials Engine (Requirement 4 & 6)
  setupUploadZone(role) {
    const dropzone = document.getElementById(`${role}-upload-dropzone`);
    const fileInput = document.getElementById(`${role}-file-uploader`);
    const browseBtn = document.getElementById(`${role}-browse-files-btn`);
    const banner = document.getElementById(`${role}-file-loaded-banner`);
    const previewBox = document.getElementById(`${role}-parsed-preview`);
    const tbody = document.getElementById(`${role}-preview-tbody`);
    const countEl = document.getElementById(`${role}-extracted-count`);
    const addRowBtn = document.getElementById(`${role}-add-row-btn`);
    const publishBtn = document.getElementById(`${role}-publish-btn`);
    const cancelBtn = document.getElementById(`${role}-cancel-preview-btn`);

    if (!dropzone || !fileInput) return;

    if (browseBtn) {
      browseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("drag-over");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("drag-over");
    });

    dropzone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag-over");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await this.processUploadedFile(e.dataTransfer.files[0], role);
      }
    });

    fileInput.addEventListener("change", async () => {
      if (fileInput.files && fileInput.files[0]) {
        await this.processUploadedFile(fileInput.files[0], role);
      }
    });

    if (addRowBtn) {
      addRowBtn.addEventListener("click", () => this.addPreviewRow(tbody, countEl));
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        // Discard the selected PDF/Word/other source and its extracted preview.
        if (previewBox) previewBox.style.display = "none";
        if (banner) banner.style.display = "none";
        if (tbody) tbody.innerHTML = "";
        if (countEl) countEl.textContent = "0";
        fileInput.value = "";
        const titleInput = document.getElementById(`${role}-upload-title`);
        if (titleInput) titleInput.value = "";
        this.currentUploadedFile = null;
        this.currentExtractedRows = [];
      });
    }

    if (publishBtn) {
      publishBtn.addEventListener("click", async () => {
        await this.publishMaterialFromPreview(role);
      });
    }
  },

  async processUploadedFile(file, role) {
    const banner = document.getElementById(`${role}-file-loaded-banner`);
    const previewBox = document.getElementById(`${role}-parsed-preview`);
    const tbody = document.getElementById(`${role}-preview-tbody`);
    const countEl = document.getElementById(`${role}-extracted-count`);
    const materialTitle = document.getElementById(`${role}-upload-title`);

    try {
      if (banner) {
        banner.style.display = "block";
        banner.textContent = `⏳ ${file.name} கோப்பைப் பகுப்பாய்வு செய்கிறது...`;
      }

      const rows = await this.parseReadingFile(file);

      // Stop obvious text corruption before the user can publish the imported material.
      const importedText = rows.map(row => [row.tamil, row.english, row.translit].filter(Boolean).join(" ")).join("\n");
      const hasCorruptText = /\uFFFD|[\uE000-\uF8FF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|[\uDC00-\uDFFF]/u.test(importedText);
      if (hasCorruptText) {
        alert("இந்தக் கோப்பிலிருந்து சில எழுத்துகள் சரியாகப் படிக்கப்படவில்லை. உள்ளடக்கத்தைச் சேமிக்க வேண்டாம். PDF-ஐ Word (.docx) ஆக மாற்றி மீண்டும் முயற்சிக்கவும் அல்லது உரையைச் சரிபார்க்கவும்.");
        if (banner) banner.style.display = "none";
        return;
      }

      if (!rows.length) {
        alert("கோப்பில் வாசிப்புத் தொடர்கள் எதுவும் கண்டறியப்படவில்லை. தயவுசெய்து சரியான தமிழ் கோப்பைப் பதிவேற்றவும்.");
        if (banner) banner.style.display = "none";
        return;
      }

      if (materialTitle && !materialTitle.value) {
        materialTitle.value = file.name.replace(/\.[^/.]+$/, "");
      }

      this.currentExtractedRows = rows;
      this.currentUploadedFile = file;

      if (banner) {
        banner.style.display = "block";
        banner.textContent = `✅ ${file.name} வெற்றிகரமாக ஏற்றப்பட்டது (${rows.length} தொடர்கள் கண்டறியப்பட்டன)`;
      }

      this.renderPreviewRows(tbody, countEl, rows);
      if (previewBox) previewBox.style.display = "flex";
      previewBox.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("File processing error:", err);
      alert(`கோப்பைப் படிப்பதில் பிழை: ${err.message || err}`);
      if (banner) banner.style.display = "none";
    }
  },

  async parseReadingFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const extractedRows = [];

    function processLinesWithSections(lines) {
      const rows = [];
      let currentSecId = null;
      let currentSecTitle = null;
      let secCounter = 0;

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Check if line is a section header:
        // Examples: "1. ஆ, இ, ஈ வரிசை...", "பிரிவு 1: ...", "Section 1 - ...", "Part 1: ..."
        const isSec = trimmed.match(/^(\d+)[\.\)\-:]\s*([^\d].*)$/) ||
                      trimmed.match(/^(பிரிவு|Section|Part)\s*(\d+)[\.\:\-]?\s*(.*)$/i);
        
        if (isSec && (trimmed.startsWith("பிரிவு") || trimmed.toLowerCase().startsWith("section") || trimmed.toLowerCase().startsWith("part") || (isSec[2] && isSec[2].length < 70 && !trimmed.includes("|")))) {
          secCounter++;
          currentSecId = `sec-${secCounter}`;
          currentSecTitle = trimmed;
          return;
        }

        let tamil = "";
        let english = "";
        let translit = "";

        if (trimmed.includes("|")) {
          const parts = trimmed.split("|").map(p => p.trim());
          tamil = parts[0] || "";
          english = parts[1] || "";
          translit = parts[2] || "";
        } else if (trimmed.includes("\t")) {
          const parts = trimmed.split("\t").map(p => p.trim());
          tamil = parts[0] || "";
          english = parts[1] || "";
          translit = parts[2] || "";
        } else if (trimmed.includes(" - ") && /[a-zA-Z]/.test(trimmed)) {
          const parts = trimmed.split(" - ").map(p => p.trim());
          tamil = parts[0] || "";
          english = parts.slice(1).join(" - ") || "";
        } else {
          tamil = trimmed;
        }

        if (tamil) {
          rows.push({
            tamil,
            english,
            translit,
            sectionId: currentSecId,
            sectionTitle: currentSecTitle
          });
        }
      });

      return rows;
    }

    if (ext === "txt") {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      extractedRows.push(...processLinesWithSections(lines));
    } else if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      const arrayBuffer = await file.arrayBuffer();
      if (window.XLSX) {
        const wb = window.XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1 });

        rows.forEach((row, idx) => {
          if (!row || !row.length) return;
          const firstVal = String(row[0] || "").trim();
          if (idx === 0 && (firstVal.toLowerCase().includes("tamil") || firstVal.toLowerCase().includes("sentence") || firstVal.toLowerCase().includes("பாடம்"))) return;

          const col1 = String(row[0] || "").trim();
          const col2 = String(row[1] || "").trim();
          const col3 = String(row[2] || "").trim();
          if (col1) {
            extractedRows.push({ tamil: col1, english: col2, translit: col3 });
          }
        });
      } else {
        throw new Error("Excel parser library not loaded");
      }
    } else if (ext === "docx" || ext === "doc") {
      const arrayBuffer = await file.arrayBuffer();
      if (window.mammoth) {
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        const text = result.value || "";
        const lines = text.normalize("NFC").split(/\r?\n/).map(l => l.normalize("NFC").trim()).filter(Boolean);
        extractedRows.push(...processLinesWithSections(lines));
      } else {
        throw new Error("Word parser library not loaded");
      }
    } else if (ext === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      if (window.pdfjsLib) {
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const items = (textContent.items || []).filter(item => typeof item.str === "string" && item.str.length);
          const pageLines = [];
          let lineText = "";
          let previousItem = null;
          let previousY = null;

          // Reconstruct lines from PDF.js positions; avoid forcing spaces between
          // every fragment, which can split Tamil words and combining sequences.
          for (const item of items) {
            const value = item.str.normalize("NFC");
            const transform = item.transform || [];
            const x = Number(transform[4]);
            const y = Number(transform[5]);
            const fontSize = Math.max(1, Math.abs(Number(transform[3]) || 10));

            if (previousItem && Number.isFinite(y) && Number.isFinite(previousY) &&
                Math.abs(y - previousY) > Math.max(2, fontSize * 0.45)) {
              if (lineText.trim()) pageLines.push(lineText.trim());
              lineText = "";
              previousItem = null;
            }

            if (previousItem && Number.isFinite(x)) {
              const previousTransform = previousItem.transform || [];
              const previousX = Number(previousTransform[4]);
              const previousWidth = Number(previousItem.width) || 0;
              const gap = x - (previousX + previousWidth);
              const spaceThreshold = Math.max(1.5, fontSize * 0.2);
              if (Number.isFinite(gap) && gap > spaceThreshold &&
                  lineText && !/\s$/.test(lineText) && !/^\s/.test(value)) {
                lineText += " ";
              }
            }

            lineText += value;
            if (item.hasEOL) {
              if (lineText.trim()) pageLines.push(lineText.trim());
              lineText = "";
              previousItem = null;
              previousY = null;
            } else {
              previousItem = item;
              previousY = y;
            }
          }
          if (lineText.trim()) pageLines.push(lineText.trim());
          fullText += pageLines.join("\n") + "\n";
        }
        const lines = fullText.normalize("NFC").split(/\r?\n/).map(l => l.normalize("NFC").trim()).filter(Boolean);
        extractedRows.push(...processLinesWithSections(lines));
      } else {
        throw new Error("PDF parser library not loaded");
      }
    }

    return extractedRows.filter(r => r.tamil && r.tamil.length > 0);
  },

  renderPreviewRows(tbody, countEl, rows) {
    if (!tbody) return;
    tbody.innerHTML = rows.map((r, i) => `
      <tr data-index="${i}" data-sec-id="${r.sectionId || ''}" data-sec-title="${(r.sectionTitle || '').replace(/"/g, '&quot;')}">
        <td style="text-align: center; font-weight: 700; color: #64748b;">
          ${i + 1}
          ${r.sectionTitle ? `<div style="font-size: 0.68rem; color: #2563EB; font-weight: 800; margin-top: 2px;">📌 ${r.sectionTitle.length > 18 ? r.sectionTitle.slice(0, 16) + '…' : r.sectionTitle}</div>` : ''}
        </td>
        <td><input type="text" class="preview-edit-input row-tamil" value="${(r.tamil || '').replace(/"/g, '&quot;')}" placeholder="தமிழ் தொடர் (Tamil)"></td>
        <td><input type="text" class="preview-edit-input row-english" value="${(r.english || '').replace(/"/g, '&quot;')}" placeholder="ஆங்கிலப் பொருள் (English)"></td>
        <td><input type="text" class="preview-edit-input row-translit" value="${(r.translit || '').replace(/"/g, '&quot;')}" placeholder="ஒலிபெயர்ப்பு (Transliteration)"></td>
        <td style="text-align: center;"><button type="button" class="btn-del-row" onclick="App.deletePreviewRow(this, '${tbody.id}')" title="நீக்கு">🗑️</button></td>
      </tr>
    `).join("");
    if (countEl) countEl.textContent = rows.length;
  },

  deletePreviewRow(btn, tbodyId) {
    const row = btn.closest("tr");
    const tbody = document.getElementById(tbodyId);
    if (row && tbody) {
      row.remove();
      const countEl = tbodyId.startsWith("teacher") ? document.getElementById("teacher-extracted-count") : document.getElementById("admin-extracted-count");
      if (countEl) countEl.textContent = tbody.querySelectorAll("tr").length;
    }
  },

  addPreviewRow(tbody, countEl) {
    if (!tbody) return;
    const tr = document.createElement("tr");
    const count = tbody.querySelectorAll("tr").length + 1;
    tr.innerHTML = `
      <td style="text-align: center; font-weight: 700; color: #64748b;">${count}</td>
      <td><input type="text" class="preview-edit-input row-tamil" placeholder="தமிழ் தொடர் (Tamil)"></td>
      <td><input type="text" class="preview-edit-input row-english" placeholder="ஆங்கிலப் பொருள் (English)"></td>
      <td><input type="text" class="preview-edit-input row-translit" placeholder="ஒலிபெயர்ப்பு (Transliteration)"></td>
      <td style="text-align: center;"><button type="button" class="btn-del-row" onclick="App.deletePreviewRow(this, '${tbody.id}')" title="நீக்கு">🗑️</button></td>
    `;
    tbody.appendChild(tr);
    if (countEl) countEl.textContent = count;
  },

  async publishMaterialFromPreview(role) {
    const tbody = document.getElementById(`${role}-preview-tbody`);
    const gradeSelect = document.getElementById(`${role}-upload-grade`);
    const levelSelect = document.getElementById(`${role}-upload-level`);
    const titleInput = document.getElementById(`${role}-upload-title`);
    const previewBox = document.getElementById(`${role}-parsed-preview`);
    const banner = document.getElementById(`${role}-file-loaded-banner`);
    const fileInput = document.getElementById(`${role}-file-uploader`);

    if (!tbody) return;
    const rows = [...tbody.querySelectorAll("tr")].map(tr => ({
      tamil: tr.querySelector(".row-tamil")?.value.trim() || "",
      english: tr.querySelector(".row-english")?.value.trim() || "",
      translit: tr.querySelector(".row-translit")?.value.trim() || "",
      sectionId: tr.getAttribute("data-sec-id") || null,
      sectionTitle: tr.getAttribute("data-sec-title") || null,
      category: tr.getAttribute("data-sec-title") || null
    })).filter(r => r.tamil.length > 0);

    if (!rows.length) {
      alert("வெளியிடுவதற்கு குறைந்தபட்சம் ஒரு தமிழ் தொடராவது தேவை!");
      return;
    }

    const gradeVal = gradeSelect ? gradeSelect.value : "1";
    const levelVal = levelSelect ? levelSelect.value : "simple";
    const titleVal = (titleInput && titleInput.value.trim()) || "புதிய வாசிப்பு பாடம்";

    // Auto-detect sections if present
    const secMap = new Map();
    rows.forEach(r => {
      if (r.sectionId && r.sectionTitle && !secMap.has(r.sectionId)) {
        secMap.set(r.sectionId, {
          id: r.sectionId,
          title: r.sectionTitle,
          shortTitle: r.sectionTitle.length > 20 ? r.sectionTitle.slice(0, 18) + '…' : r.sectionTitle,
          icon: "📌"
        });
      }
    });

    const detectedSections = Array.from(secMap.values());

    const newMaterial = {
      id: `TBTA-MAT-${Date.now()}`,
      title: titleVal,
      fileName: this.currentUploadedFile ? this.currentUploadedFile.name : `${titleVal}.txt`,
      fileType: this.currentUploadedFile ? this.currentUploadedFile.name.split('.').pop().toUpperCase() : "TEXT",
      grade: gradeVal,
      level: levelVal,
      uploadedAt: new Date().toISOString(),
      uploadedBy: role,
      sections: detectedSections.length > 0 ? detectedSections : null,
      sentences: rows
    };

    await this.saveReadingMaterial(newMaterial);

    KidAudioFX.playSuccessFanfare();
    this.triggerConfetti();

    alert(`🎉 வாழ்த்துகள்! "${titleVal}" (${rows.length} தொடர்கள்) வாசிப்பு மன்றத்தில் வெற்றிகரமாக வெளியிடப்பட்டது! அனைத்து மாணவர்களுக்கும் இது பிரதிபலிக்கும்.`);

    if (previewBox) previewBox.style.display = "none";
    if (banner) banner.style.display = "none";
    if (fileInput) fileInput.value = "";
    if (titleInput) titleInput.value = "";
    this.currentUploadedFile = null;
    this.currentExtractedRows = [];

    await this.refreshStaffData();
  },

  async saveReadingMaterial(material) {
    try {
      await fetch("/api/reading-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(material)
      });
    } catch (_) {}

    const local = JSON.parse(localStorage.getItem("tbta_custom_reading_materials") || "[]");
    local.push(material);
    localStorage.setItem("tbta_custom_reading_materials", JSON.stringify(local));

    if (window.ReadingClubPractice && window.ReadingClubPractice.reloadCustomMaterials) {
      await window.ReadingClubPractice.reloadCustomMaterials();
    }
  },

  async deleteReadingMaterial(matId) {
    let serverDeleteConfirmed = false;
    try {
      const response = await fetch(`/api/reading-materials?id=${encodeURIComponent(matId)}`, { method: "DELETE" });
      if (response.ok) {
        serverDeleteConfirmed = true;
      } else if (response.status !== 404) {
        alert("பாடத்தை நீக்க முடியவில்லை. சேவையகத்தில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.");
        return false;
      }
      // A 404 usually means this is a static-hosted version without the API;
      // in that case remove the browser-local copy as a local-only fallback.
    } catch (_) {
      // Static hosting or offline mode: use the browser-local fallback below.
    }

    let local = [];
    try {
      local = JSON.parse(localStorage.getItem("tbta_custom_reading_materials") || "[]");
    } catch (_) {}
    local = local.filter(m => m.id !== matId);
    localStorage.setItem("tbta_custom_reading_materials", JSON.stringify(local));

    if (window.ReadingClubPractice && window.ReadingClubPractice.reloadCustomMaterials) {
      await window.ReadingClubPractice.reloadCustomMaterials();
    }
    return serverDeleteConfirmed || !serverDeleteConfirmed;
  },

  renderActiveMaterialsCards(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const materials = this.customMaterials || [];
    if (!materials.length) {
      grid.innerHTML = `<p class="empty-note" style="color: #64748B; font-family: var(--font-tamil);">இன்னும் ஆசிரியர் வாசிப்புப் பாடங்கள் எதுவும் பதிவேற்றப்படவில்லை.</p>`;
      return;
    }

    grid.innerHTML = materials.map(mat => {
      const sentenceCount = mat.sentences ? mat.sentences.length : 0;
      const dateStr = mat.uploadedAt ? new Date(mat.uploadedAt).toLocaleDateString() : "";
      const gradeStr = mat.grade === "all" ? "அனைத்து வகுப்புகள்" : `Nilai ${mat.grade}`;

      return `
        <div class="material-card">
          <div class="material-card-header">
            <h5 class="material-card-title">${mat.title || mat.fileName}</h5>
            <span class="fmt-pill ${(mat.fileType || 'txt').toLowerCase()}">${mat.fileType || 'TEXT'}</span>
          </div>
          <div class="material-meta-row">
            <span>🎯 ${gradeStr}</span>
            <span>📝 ${sentenceCount} தொடர்கள்</span>
            <span>📅 ${dateStr}</span>
          </div>
          <button type="button" class="btn-delete-mat" onclick="App.confirmDeleteMaterial('${mat.id}')">
            🗑️ பாடத்தை நீக்கு (Delete)
          </button>
        </div>
      `;
    }).join("");
  },

  async confirmDeleteMaterial(matId) {
    const material = (this.customMaterials || []).find(item => item.id === matId);
    const title = material ? (material.title || material.fileName || "இந்தப் பாடம்") : "இந்தப் பாடம்";
    if (confirm(`“${title}” பாடத்தை நீக்கவா? இது மாணவர்களின் Reading Club பட்டியலிலிருந்தும் நீக்கப்படும். அசல் PDF/Word கோப்பு சேமிக்கப்படுவதில்லை; நீக்கப்படுவது வெளியிடப்பட்ட பாட உள்ளடக்கம்.`)) {
      const deleted = await this.deleteReadingMaterial(matId);
      if (deleted) await this.refreshStaffData();
    }
  },

  logout() {
    this.currentStudent = null;
    this.currentStaffRole = null;
    localStorage.removeItem("tamilKidsStudent");
    this.showScreen("login");
  },

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
    if (this.currentStudent && !this.getStudentClubs(this.currentStudent).includes("school")) return;
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
