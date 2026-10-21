/**
 * Tamil-Translate-Kids - Reading Club (வாசிப்பு மன்றம்) Engine
 * Multi-level graded reading practice (2-word, 3-word, 4-word sentences)
 * Live Speech-to-Text, Voice synthesis, Adaptive Quick Check, & Progress tracking.
 * PDF Study Packages (Stage 2 Simple, Intermediate, Complex, Assign 3, Activity, Teacher Uploads)
 * 1-by-1 Question Walkthrough with Stories, Comprehension Choices, and Speech Scoring.
 */

(function () {
  "use strict";

  const DEFAULT_SENTENCES = [
    // Nilai 1
    { grade: 1, level: "2-words", id: "RC-G1-001", sentenceTa: "பாடம் படி", meaningEn: "Read the lesson", translit: "Paadam padi" },
    { grade: 1, level: "2-words", id: "RC-G1-002", sentenceTa: "நன்றி சொல்", meaningEn: "Say thank you", translit: "Nandri sol" },
    { grade: 1, level: "2-words", id: "RC-G1-003", sentenceTa: "மரம் நடு", meaningEn: "Plant a tree", translit: "Maram nadu" },
    { grade: 1, level: "2-words", id: "RC-G1-004", sentenceTa: "நீர் குடி", meaningEn: "Drink water", translit: "Neer kudi" },
    { grade: 1, level: "2-words", id: "RC-G1-005", sentenceTa: "பூ பறி", meaningEn: "Pick a flower", translit: "Poo pari" },
    { grade: 1, level: "2-words", id: "RC-G1-006", sentenceTa: "பந்து உருட்டு", meaningEn: "Roll the ball", translit: "Panthu uruttu" },
    { grade: 1, level: "3-words", id: "RC-G1-009", sentenceTa: "காலையில் சீக்கிரம் எழு", meaningEn: "Wake up early in the morning", translit: "Kaalaiyil seekkiram ezhu" },
    { grade: 1, level: "3-words", id: "RC-G1-010", sentenceTa: "தினமும் பள்ளி செல்", meaningEn: "Go to school daily", translit: "Dhinamum palli sel" },
    { grade: 1, level: "3-words", id: "RC-G1-011", sentenceTa: "நல்ல பழக்கம் கற்போம்", meaningEn: "Let us learn good habits", translit: "Nalla pazhakkam karpom" },
    { grade: 1, level: "3-words", id: "RC-G1-012", sentenceTa: "பழங்கள் அதிகம் உண்", meaningEn: "Eat more fruits", translit: "Pazhangal adhigam un" },
    { grade: 1, level: "4-words", id: "RC-G1-015", sentenceTa: "அன்னை தந்தையை தினமும் வணங்கு", meaningEn: "Respect parents every day", translit: "Annai thandhaiyai dhinamum vanangu" },
    { grade: 1, level: "4-words", id: "RC-G1-016", sentenceTa: "பிறருக்கு எப்போதும் உதவி செய்", meaningEn: "Always help other people", translit: "Pirarukku eppodhum udhavi sei" },
    { grade: 1, level: "4-words", id: "RC-G1-017", sentenceTa: "இயற்கை அழகை ரசித்து மகிழ்வோம்", meaningEn: "Let us enjoy nature's beauty", translit: "Iyarkai azhagai rasithu magizhvom" },

    // Nilai 2
    { grade: 2, level: "2-words", id: "RC-G2-001", sentenceTa: "நூல் படி", meaningEn: "Read good books", translit: "Nool padi" },
    { grade: 2, level: "2-words", id: "RC-G2-002", sentenceTa: "உண்மை பேசு", meaningEn: "Speak the truth", translit: "Unmai paesu" },
    { grade: 2, level: "2-words", id: "RC-G2-003", sentenceTa: "உடற்பயிற்சி செய்", meaningEn: "Do physical exercise", translit: "Udar payirchi sei" },
    { grade: 2, level: "2-words", id: "RC-G2-004", sentenceTa: "அன்பாய் இரு", meaningEn: "Be kind and loving", translit: "Anbaai iru" },
    { grade: 2, level: "3-words", id: "RC-G2-007", sentenceTa: "ஆசிரியர் சொல் கேள்", meaningEn: "Listen to your teacher", translit: "Aasiriyar sol kael" },
    { grade: 2, level: "3-words", id: "RC-G2-008", sentenceTa: "நண்பர்களோடு சேர்ந்து விளையாடு", meaningEn: "Play together with friends", translit: "Nanbargalodu saerndhu vilaiyaadu" },
    { grade: 2, level: "3-words", id: "RC-G2-009", sentenceTa: "பறவைகளுக்கு உணவு கொடு", meaningEn: "Feed the birds", translit: "Paravaigalukku unavu kodu" },
    { grade: 2, level: "4-words", id: "RC-G2-011", sentenceTa: "நாம் அனைவரும் ஒற்றுமையாய் வாழ்வோம்", meaningEn: "Let us all live unitedly", translit: "Naam anaivarum otrumaiyaai vaazhvom" },
    { grade: 2, level: "4-words", id: "RC-G2-012", sentenceTa: "தாய்மொழியை இனிமையாய் பேச வேண்டும்", meaningEn: "Speak mother tongue sweetly", translit: "Thaaimozhiyai inimaiyaai paesa vaendum" },

    // Nilai 3
    { grade: 3, level: "2-words", id: "RC-G3-001", sentenceTa: "கற்பவை கற்றுணர்", meaningEn: "Understand what you learn", translit: "Karpavai katrunar" },
    { grade: 3, level: "2-words", id: "RC-G3-002", sentenceTa: "அறிவை பெருக்கு", meaningEn: "Grow your knowledge", translit: "Arivai perukku" },
    { grade: 3, level: "3-words", id: "RC-G3-004", sentenceTa: "நாள்தோறும் புதிதாக கற்போம்", meaningEn: "Learn something new daily", translit: "Naaldhorum pudhidhaaga karpom" },
    { grade: 3, level: "4-words", id: "RC-G3-006", sentenceTa: "நல்ல நண்பர்களோடு நல்ல வழியில் நடப்போம்", meaningEn: "Walk in good path with good friends", translit: "Nalla nanbargalodu nalla vazhiyil nadappom" },

    // Nilai 4
    { grade: 4, level: "2-words", id: "RC-G4-001", sentenceTa: "இலக்கை அடை", meaningEn: "Reach your goal", translit: "Ilakkai adai" },
    { grade: 4, level: "3-words", id: "RC-G4-002", sentenceTa: "விடாமுயற்சி வெற்றி தரும்", meaningEn: "Perseverance brings success", translit: "Vidaamuyarchi vetri tharum" },
    { grade: 4, level: "4-words", id: "RC-G4-003", sentenceTa: "தமிழர் பண்பாட்டை நாம் என்றும் காப்போம்", meaningEn: "We will protect Tamil culture forever", translit: "Thamizhar panbaattai naam endrum kaappom" },

    // Nilai 5
    { grade: 5, level: "2-words", id: "RC-G5-001", sentenceTa: "அறநெறி போற்று", meaningEn: "Uphold righteous moral values", translit: "Araneri potru" },
    { grade: 5, level: "3-words", id: "RC-G5-002", sentenceTa: "சிந்தனையை உயர்வாய் வைப்போம்", meaningEn: "Keep your thoughts lofty and noble", translit: "Sindhanaiyai uyarvaai vaippom" },
    { grade: 5, level: "4-words", id: "RC-G5-003", sentenceTa: "அறிவியல் மனப்பான்மையோடு உலகை ஆராய்ந்து அறிவோம்", meaningEn: "Explore the world with a scientific mindset", translit: "Ariviyal manappaanmaiyodu ulagai aaraaindhu arivom" },

    // Nilai 6
    { grade: 6, level: "2-words", id: "RC-G6-001", sentenceTa: "பொறுமை காப்போம்", meaningEn: "Practice patient endurance", translit: "Porumai kaappom" },
    { grade: 6, level: "3-words", id: "RC-G6-002", sentenceTa: "உழைப்பே உயர்வு தரும்", meaningEn: "Hard work yields true greatness", translit: "Uzhaippae uyarvu tharum" },
    { grade: 6, level: "4-words", id: "RC-G6-003", sentenceTa: "வையத்துள் வாழ்வாங்கு வாழும் வழியை அறிவோம்", meaningEn: "Know the noble way to live gloriously in the world", translit: "Vaiyathul vaazhvaangu vaazhum vazhiyai arivom" },

    // Nilai 7
    { grade: 7, level: "2-words", id: "RC-G7-001", sentenceTa: "சான்றோரை போற்று", meaningEn: "Honour the wise and virtuous", translit: "Saandrorai potru" },
    { grade: 7, level: "3-words", id: "RC-G7-002", sentenceTa: "நாட்டை நேசித்து வாழ்வோம்", meaningEn: "Live with love for the nation", translit: "Naattai naesithu vaazhvom" },
    { grade: 7, level: "4-words", id: "RC-G7-003", sentenceTa: "எல்லா உயிர்களிடத்தும் அன்பு செலுத்துவது பெருமை", meaningEn: "Showing love to all living beings is noble", translit: "Ella uyirgalidathum anbu seluthuvadhu perumai" },

    // Nilai 8
    { grade: 8, level: "2-words", id: "RC-G8-001", sentenceTa: "இனிமை பேசிடு", meaningEn: "Speak with courteous sweetness", translit: "Inimai paesidu" },
    { grade: 8, level: "3-words", id: "RC-G8-002", sentenceTa: "உலகிற்கு வழிகாட்டியாய் திகழ்வோம்", meaningEn: "Shine as a guiding beacon to the world", translit: "Ulagirku vazhikaattiyaai thigazhvom" },
    { grade: 8, level: "4-words", id: "RC-G8-003", sentenceTa: "எண்ணிய எண்ணியாங்கு எய்துவர் எண்ணியார் திண்ணியர் ஆகப் பெறின்", meaningEn: "Those with resolute minds achieve whatever they envision", translit: "Enniya enniyaangu eydhuvar enniyaar thinniyar aagap perin" }
  ];

  let allSentences = [...DEFAULT_SENTENCES];
  let baseSentences = [...DEFAULT_SENTENCES];
  let currentGrade = 1;
  let currentLevel = "all";
  let currentIndex = 0;
  let filteredSentences = [];
  let isListening = false;
  let lastSpokenTranscript = "";
  let hasEvaluated = false;
  let dataLoaded = false;

  // PDF Modules State
  let pdfModules = [];
  let currentPdfModuleId = "all-graded";
  let currentPdfModule = null;
  let currentSectionFilter = "all";
  let pdfCurrentIndex = 0;
  let pdfItems = [];
  let pdfCompletedStats = { count: 0, stars: 0, scoreSum: 0 };
  let pdfAnsweredCurrent = false;
  const passedPdfItems = new Set();

  // Quick Check State
  let quizQuestions = [];
  let quizCurrentIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;

  const ui = () => ({
    // PDF Selector UI at the Top
    pdfSelect: document.getElementById("rc-pdf-select"),
    pdfPillsBar: document.getElementById("rc-pdf-pills-bar"),
    pdfSectionsWrap: document.getElementById("rc-pdf-sections-wrap"),
    pdfSectionsBar: document.getElementById("rc-pdf-sections-bar"),
    sectionsCountLbl: document.getElementById("rc-sections-count-lbl"),
    pdfViewLink: document.getElementById("rc-view-pdf-link"),
    unitProgressWrap: document.getElementById("rc-unit-progress-bar-wrap"),
    unitPdfTitle: document.getElementById("rc-unit-pdf-title"),
    unitStepCount: document.getElementById("rc-unit-step-count"),
    unitScoreBadge: document.getElementById("rc-unit-score-badge"),
    unitProgressBar: document.getElementById("rc-unit-progress-bar"),

    // Studio Tabs & Navigation
    gradeSelect: document.getElementById("rc-grade-select"),
    levelSelect: document.getElementById("rc-level-select"),
    sentenceSelect: document.getElementById("rc-sentence-select"),
    defaultBrowser: document.getElementById("rc-default-browser"),
    studioModeTabs: document.getElementById("rc-studio-mode-tabs"),
    tabReadBtn: document.getElementById("rc-tab-read-btn"),
    tabQuizBtn: document.getElementById("rc-tab-quiz-btn"),
    readView: document.getElementById("rc-read-view"),
    quizView: document.getElementById("rc-quiz-view"),

    // Main Card & Question Flow
    mainCard: document.getElementById("rc-main-card"),
    numberBadge: document.getElementById("rc-sentence-number"),
    tagBadge: document.getElementById("rc-level-tag"),

    // Story Context Box
    storyBox: document.getElementById("rc-story-context-box"),
    storyBadge: document.getElementById("rc-story-badge"),
    storyTitle: document.getElementById("rc-story-title"),
    storyText: document.getElementById("rc-story-text"),
    storyAudioBtn: document.getElementById("rc-story-audio-btn"),

    // Question / Target
    questionHeader: document.getElementById("rc-question-header"),
    questionBadge: document.getElementById("rc-question-badge"),
    textTa: document.getElementById("rc-sentence-ta"),
    meaningEn: document.getElementById("rc-meaning-en"),
    translitText: document.getElementById("rc-translit"),

    // Comprehension Options Grid
    optionsContainer: document.getElementById("rc-options-container"),
    optionsGrid: document.getElementById("rc-options-grid"),
    optionFeedback: document.getElementById("rc-option-feedback"),

    // Actions & Speech
    listenBtn: document.getElementById("listen-rc-btn"),
    micBtn: document.getElementById("rc-mic-btn"),
    spokenBox: document.getElementById("rc-spoken"),
    resultBox: document.getElementById("rc-result"),
    prevBtn: document.getElementById("prev-rc-btn"),
    nextBtn: document.getElementById("next-rc-btn"),
    manualInput: document.getElementById("rc-manual-input"),
    manualSubmit: document.getElementById("rc-manual-submit"),

    // PDF Completion Card
    completedCard: document.getElementById("rc-pdf-completed-card"),
    completedPdfName: document.getElementById("rc-completed-pdf-name"),
    completedCount: document.getElementById("rc-completed-count"),
    completedStars: document.getElementById("rc-completed-stars"),
    completedScore: document.getElementById("rc-completed-score"),
    repeatPdfBtn: document.getElementById("rc-repeat-pdf-btn"),
    nextPdfBtn: document.getElementById("rc-next-pdf-btn"),

    // Quick Check UI
    quizCard: document.getElementById("rc-quiz-card"),
    quizStepLabel: document.getElementById("rc-quiz-step-label"),
    quizScoreBadge: document.getElementById("rc-quiz-score-badge"),
    quizBar: document.getElementById("rc-quiz-bar"),
    quizBadge: document.getElementById("rc-quiz-badge"),
    quizQuestion: document.getElementById("rc-quiz-question"),
    quizAudioBtn: document.getElementById("rc-quiz-audio-btn"),
    quizOptions: document.getElementById("rc-quiz-options"),
    quizFeedback: document.getElementById("rc-quiz-feedback"),
    quizNextBtn: document.getElementById("rc-quiz-next-btn")
  });

  async function loadPdfLessons() {
    let loaded = [];
    try {
      const res = await fetch("data/reading_club/pdf_lessons.json");
      if (res.ok) {
        loaded = await res.json();
      }
    } catch (_) {}

    // Check teacher uploaded materials from server or localStorage
    let teacherMaterials = [];
    try {
      const r = await fetch("/api/reading-materials");
      if (r.ok) teacherMaterials = await r.json();
    } catch (_) {}

    if (!teacherMaterials || !teacherMaterials.length) {
      try {
        teacherMaterials = JSON.parse(localStorage.getItem("tbta_custom_reading_materials") || "[]");
      } catch (_) {}
    }

    if (Array.isArray(teacherMaterials)) {
      teacherMaterials.forEach(mat => {
        const sentences = mat.sentences || [];
        if (sentences.length > 0) {
          loaded.push({
            id: `teacher-${mat.id || Date.now()}`,
            title: `👩‍🏫 ${mat.title || mat.fileName || "ஆசிரியர் பாடம்"}`,
            subtitle: `ஆசிரியர் பதிவேற்றிய பாடம் (${sentences.length} தொடர்கள்)`,
            badge: "👩‍🏫 ஆசிரியர் பாடம்",
            badgeClass: "badge-teacher",
            grade: Number(mat.grade || 1),
            sections: mat.sections || null,
            pdfFile: mat.fileName && mat.fileName.endsWith(".pdf") ? `data/Reading Club/${mat.fileName}` : null,
            items: sentences.map((s, idx) => ({
              id: s.id || `t-item-${idx + 1}`,
              sectionId: s.sectionId || null,
              sectionTitle: s.sectionTitle || null,
              type: s.type || "reading",
              category: s.category || mat.title || "ஆசிரியர் தொடர்",
              questionTa: (s.tamil || s.sentenceTa || "").trim(),
              meaningEn: (s.english || s.meaningEn || "").trim(),
              translit: (s.translit || "").trim(),
              options: s.options || [],
              correctAnswer: (s.correctAnswer || s.tamil || s.sentenceTa || "").trim(),
              explanation: s.explanation || s.english || ""
            }))
          });
        }
      });
    }

    pdfModules = loaded;
    if (!pdfModules.some(mod => mod.id === currentPdfModuleId) && pdfModules.length) currentPdfModuleId = pdfModules[0].id;
    populatePdfSelector();
    selectPdfModule(currentPdfModuleId);
  }

  function populatePdfSelector() {
    const controls = ui();
    if (!controls.pdfSelect) return;

    let optionsHtml = "";
    let pillsHtml = `<button type="button" class="rc-pdf-pill ${currentPdfModuleId === 'all-graded' ? 'active' : ''}" data-pdf="all-graded">🌟 அனைத்து பாடங்கள்</button>`;

    pdfModules.forEach(mod => {
      const isSelected = mod.id === currentPdfModuleId;
      optionsHtml += `<option value="${mod.id}" ${isSelected ? 'selected' : ''}>${mod.title}</option>`;
      const shortTitle = mod.title.split("(")[0].trim();
      pillsHtml += `<button type="button" class="rc-pdf-pill ${isSelected ? 'active' : ''}" data-pdf="${mod.id}">${shortTitle}</button>`;
    });

    controls.pdfSelect.innerHTML = optionsHtml;
    controls.pdfSelect.value = currentPdfModuleId;

    if (controls.pdfPillsBar) {
      controls.pdfPillsBar.innerHTML = pillsHtml;
    }
  }

  function selectPdfModule(moduleId) {
    currentPdfModuleId = moduleId;
    currentSectionFilter = "all";
    const controls = ui();

    if (controls.pdfSelect) controls.pdfSelect.value = moduleId;
    if (controls.pdfPillsBar) {
      const pills = controls.pdfPillsBar.querySelectorAll(".rc-pdf-pill");
      pills.forEach(p => {
        p.classList.toggle("active", p.getAttribute("data-pdf") === moduleId);
      });
    }

    if (moduleId === "all-graded") {
      currentPdfModule = null;
      pdfItems = [];
      if (controls.pdfSectionsWrap) controls.pdfSectionsWrap.style.display = "none";
      if (controls.unitProgressWrap) controls.unitProgressWrap.style.display = "none";
      if (controls.pdfViewLink) controls.pdfViewLink.style.display = "none";
      if (controls.defaultBrowser) controls.defaultBrowser.style.display = "grid";
      if (controls.storyBox) controls.storyBox.style.display = "none";
      if (controls.questionHeader) controls.questionHeader.style.display = "none";
      if (controls.optionsContainer) controls.optionsContainer.style.display = "none";
      if (controls.completedCard) controls.completedCard.style.display = "none";
      if (controls.mainCard) controls.mainCard.style.display = "block";
      updateFiltered();
      return;
    }

    const mod = pdfModules.find(m => m.id === moduleId);
    if (!mod) return;

    currentPdfModule = mod;
    passedPdfItems.clear();
    pdfItems = mod.items || [];
    pdfCurrentIndex = 0;
    pdfCompletedStats = { count: 0, stars: 0, scoreSum: 0 };
    pdfAnsweredCurrent = false;

    if (controls.defaultBrowser) controls.defaultBrowser.style.display = "none";
    if (controls.unitProgressWrap) controls.unitProgressWrap.style.display = "flex";
    if (controls.completedCard) controls.completedCard.style.display = "none";
    if (controls.mainCard) controls.mainCard.style.display = "block";

    // Multi-Section Navigation Bar population
    if (controls.pdfSectionsWrap && controls.pdfSectionsBar) {
      if (mod.sections && mod.sections.length > 0) {
        controls.pdfSectionsWrap.style.display = "flex";
        if (controls.sectionsCountLbl) {
          controls.sectionsCountLbl.textContent = `${mod.sections.length} பிரிவுகள் (${mod.items.length} வினாக்கள்)`;
        }
        let secHtml = `<button type="button" class="rc-section-pill active" data-sec="all">🌟 அனைத்துப் பிரிவுகளும் (${mod.items.length})</button>`;
        mod.sections.forEach(sec => {
          const count = mod.items.filter(it => it.sectionId === sec.id).length;
          secHtml += `<button type="button" class="rc-section-pill" data-sec="${sec.id}">${sec.icon || '📌'} ${sec.shortTitle || sec.title} (${count})</button>`;
        });
        controls.pdfSectionsBar.innerHTML = secHtml;
      } else {
        controls.pdfSectionsWrap.style.display = "none";
      }
    }

    if (controls.pdfViewLink) {
      if (mod.pdfFile) {
        controls.pdfViewLink.href = encodeURI(mod.pdfFile);
        controls.pdfViewLink.style.display = "inline-flex";
      } else {
        controls.pdfViewLink.style.display = "none";
      }
    }

    renderCurrentPdfQuestion();
  }

  function selectSectionFilter(sectionId) {
    if (!currentPdfModule) return;
    currentSectionFilter = sectionId;
    const controls = ui();

    if (controls.pdfSectionsBar) {
      const pills = controls.pdfSectionsBar.querySelectorAll(".rc-section-pill");
      pills.forEach(p => {
        p.classList.toggle("active", p.getAttribute("data-sec") === sectionId);
      });
    }

    if (sectionId === "all") {
      pdfItems = currentPdfModule.items || [];
    } else {
      pdfItems = (currentPdfModule.items || []).filter(item => item.sectionId === sectionId);
    }

    pdfCurrentIndex = 0;
    renderCurrentPdfQuestion();
  }

  function renderCurrentPdfQuestion() {
    const controls = ui();
    if (!currentPdfModule || !pdfItems.length) return;

    if (pdfCurrentIndex >= pdfItems.length) {
      showPdfCompletion();
      return;
    }

    const item = pdfItems[pdfCurrentIndex];
    pdfAnsweredCurrent = passedPdfItems.has(`${getStudentKey()}:${currentPdfModuleId}:${item.id}`);
    getStudentDifficulty();
    const total = pdfItems.length;
    const progressPercent = Math.round(((pdfCurrentIndex + 1) / total) * 100);

    if (controls.unitPdfTitle) controls.unitPdfTitle.textContent = currentPdfModule.title.split("(")[0].trim();
    if (controls.unitStepCount) controls.unitStepCount.textContent = `வினா ${pdfCurrentIndex + 1} / ${total}`;
    if (controls.unitProgressBar) controls.unitProgressBar.style.width = `${progressPercent}%`;
    if (controls.unitScoreBadge) controls.unitScoreBadge.textContent = `⭐ ${pdfCompletedStats.stars} நட்சத்திரங்கள்`;

    if (controls.numberBadge) {
      const secInfo = item.sectionTitle ? `${item.sectionTitle}` : (currentPdfModule.badge || 'PDF பாடம்');
      controls.numberBadge.textContent = `${secInfo} · வினா ${pdfCurrentIndex + 1} / ${total}`;
    }
    if (controls.tagBadge) {
      controls.tagBadge.textContent = item.category || "வாசிப்பு";
    }

    // Story Context Box
    if (controls.storyBox) {
      if (item.storyPassage) {
        controls.storyBox.style.display = "block";
        if (controls.storyTitle) controls.storyTitle.textContent = item.storyTitle || "கதைப் பகுதி";
        if (controls.storyText) controls.storyText.textContent = item.storyPassage;
      } else {
        controls.storyBox.style.display = "none";
      }
    }

    // Question Header
    if (controls.questionHeader) {
      controls.questionHeader.style.display = "block";
      if (controls.questionBadge) {
        if (item.type === "comprehension") {
          controls.questionBadge.textContent = `❓ புரிதல் வினா ${pdfCurrentIndex + 1}`;
        } else if (item.type === "true-false") {
          controls.questionBadge.textContent = `✅ சரி / தவறு வினா ${pdfCurrentIndex + 1}`;
        } else {
          controls.questionBadge.textContent = `📖 வாசிப்புத் தொடர் ${pdfCurrentIndex + 1}`;
        }
      }
    }

    // Target Tamil text
    if (controls.textTa) controls.textTa.textContent = item.questionTa;
    if (controls.meaningEn) controls.meaningEn.textContent = item.meaningEn || "";
    if (controls.translitText) controls.translitText.textContent = item.translit || "";

    // Reset spoken & result boxes (Speech-Only Voice Reading)
    if (controls.spokenBox) {
      controls.spokenBox.textContent = "மைக்ரோஃபோனை அழுத்தி சத்தமாக வாசியுங்கள் (Press mic & read aloud)...";
      controls.spokenBox.classList.add("empty");
    }
    if (controls.resultBox) {
      controls.resultBox.textContent = "🎙️ மேலே உள்ள தமிழ்ச் சொற்களை சத்தமாக வாசித்து முழு மதிப்பெண் பெறுங்கள்!";
      controls.resultBox.className = "rc-result";
    }

    // Reading Club is Speech-Only: multiple-choice options completely disabled
    if (controls.optionsContainer) {
      controls.optionsContainer.style.display = "none";
    }

    // Navigation Buttons
    if (controls.prevBtn) {
      controls.prevBtn.textContent = "◀ முந்தைய வினா";
      controls.prevBtn.disabled = (pdfCurrentIndex === 0);
    }
    if (controls.nextBtn) {
      controls.nextBtn.textContent = (pdfCurrentIndex === total - 1) ? "🏆 பாடத்தை முடி (Finish) ➔" : "அடுத்த வினா ▶";
    }
  }

  function handleOptionClick(btn, selectedOpt) {
    if (!currentPdfModule || !pdfItems[pdfCurrentIndex]) return;
    const item = pdfItems[pdfCurrentIndex];
    const controls = ui();

    const cleanSelected = (selectedOpt || "").trim().toLowerCase();
    const cleanCorrect = (item.correctAnswer || "").trim().toLowerCase();

    const isMatch = !!cleanCorrect && cleanSelected === cleanCorrect;

    const allBtns = controls.optionsGrid ? controls.optionsGrid.querySelectorAll(".rc-option-btn") : [];
    allBtns.forEach(b => b.classList.remove("correct", "wrong"));

    if (isMatch) {
      btn.classList.add("correct");
      if (!pdfAnsweredCurrent) {
        pdfAnsweredCurrent = true;
        passedPdfItems.add(`${getStudentKey()}:${currentPdfModuleId}:${item.id}`);
        pdfCompletedStats.stars += 3;
        pdfCompletedStats.scoreSum += 100;
        pdfCompletedStats.count++;
      }
      if (controls.unitScoreBadge) controls.unitScoreBadge.textContent = `⭐ ${pdfCompletedStats.stars} நட்சத்திரங்கள்`;

      if (window.KidAudioFX) {
        KidAudioFX.playSuccessFanfare();
        KidAudioFX.playStarDing(3);
      }
      if (window.App) App.triggerConfetti();

      if (controls.optionFeedback) {
        controls.optionFeedback.style.display = "block";
        controls.optionFeedback.className = "rc-option-feedback success";
        controls.optionFeedback.innerHTML = `🎉 <strong>மிகச் சரி!</strong> ${item.explanation || ''}`;
      }

      if (controls.resultBox) {
        controls.resultBox.className = "rc-result success";
        controls.resultBox.innerHTML = `🎉 <strong>மிக நன்று!</strong> விடை சரியானது. அடுத்த வினாவிற்குச் செல்லவும்.`;
      }

      if (window.App) {
        App.saveProgress({
          sentenceId: `${currentPdfModule.id}-${item.id}`,
          category: `reading-club-pdf:${currentPdfModule.title}`,
          score: 100,
          stars: 3,
          passed: true
        });
      }
    } else {
      btn.classList.add("wrong");
      if (window.KidAudioFX) KidAudioFX.playTryAgain();

      if (controls.optionFeedback) {
        controls.optionFeedback.style.display = "block";
        controls.optionFeedback.className = "rc-option-feedback error";
        controls.optionFeedback.innerHTML = `❌ <strong>மன்னிக்கவும். மீண்டும் முயற்சிக்கவும்!</strong>`;
      }

      if (controls.resultBox) {
        controls.resultBox.className = "rc-result retry";
        controls.resultBox.innerHTML = `👍 <strong>நல்ல முயற்சி!</strong> சரியான விடையைத் தேர்ந்தெடுக்கவும் அல்லது குரலில் கூறவும்.`;
      }
    }
  }

  function completeCurrentPdfQuestion() {
    if (!currentPdfModule || !pdfItems[pdfCurrentIndex]) return;

    if (!pdfAnsweredCurrent) {
      const controls = ui();
      if (controls.resultBox) controls.resultBox.textContent = "Read every word correctly or select the correct answer before continuing.";
      return;
    }

    if (pdfCurrentIndex < pdfItems.length - 1) {
      pdfCurrentIndex++;
      renderCurrentPdfQuestion();
    } else {
      showPdfCompletion();
    }
  }

  function prevPdfQuestion() {
    if (pdfCurrentIndex > 0) {
      pdfCurrentIndex--;
      renderCurrentPdfQuestion();
    }
  }

  function showPdfCompletion() {
    const controls = ui();
    if (!currentPdfModule) return;

    if (controls.mainCard) controls.mainCard.style.display = "none";
    if (controls.completedCard) controls.completedCard.style.display = "block";

    if (controls.completedPdfName) {
      controls.completedPdfName.textContent = `நீங்கள் ${currentPdfModule.title} பாடத்தின் அனைத்து வினாக்களையும் வெற்றிகரமாக முடித்துவிட்டீர்கள்!`;
    }
    if (controls.completedCount) {
      controls.completedCount.textContent = `${pdfItems.length} / ${pdfItems.length}`;
    }
    if (controls.completedStars) {
      controls.completedStars.textContent = `⭐ ${pdfCompletedStats.stars}`;
    }
    if (controls.completedScore) {
      const avg = pdfCompletedStats.count > 0 ? Math.round(pdfCompletedStats.scoreSum / pdfCompletedStats.count) : 100;
      controls.completedScore.textContent = `${avg}%`;
    }

    if (window.KidAudioFX) {
      KidAudioFX.playSuccessFanfare();
      KidAudioFX.playStarDing(3);
    }
    if (window.App) App.triggerConfetti();
  }

  async function loadCustomMaterials() {
    let customMaterials = [];
    try {
      const res = await fetch("/api/reading-materials");
      if (res.ok) customMaterials = await res.json();
    } catch (_) {}

    if (!customMaterials || !customMaterials.length) {
      try {
        customMaterials = JSON.parse(localStorage.getItem("tbta_custom_reading_materials") || "[]");
      } catch (_) {}
    }

    let customSentences = [];
    if (Array.isArray(customMaterials)) {
      customMaterials.forEach(mat => {
        const sentences = mat.sentences || [];
        sentences.forEach((s, sIdx) => {
          if (s.tamil || s.sentenceTa) {
            customSentences.push({
              id: s.id || `${mat.id || 'mat'}-${sIdx + 1}`,
              grade: Number(s.grade || mat.grade || 1),
              level: s.level || mat.level || "simple",
              category: mat.title || mat.fileName || "ஆசிரியர் பாடம்",
              sentenceTa: (s.tamil || s.sentenceTa || "").trim(),
              meaningEn: (s.english || s.meaningEn || "").trim(),
              translit: (s.translit || "").trim(),
              isTeacherUploaded: true,
              materialTitle: mat.title || mat.fileName || "Teacher Upload"
            });
          }
        });
      });
    }

    allSentences = [...baseSentences, ...customSentences];
    return customSentences;
  }

  async function loadData() {
    if (!dataLoaded) {
      try {
        const res = await fetch("data/reading_club/reading_club_data.json");
        if (res.ok) {
          const json = await res.json();
          if (json.sentences && json.sentences.length) {
            baseSentences = json.sentences.map(item => ({
              id: item.id,
              grade: Number(item.grade),
              level: item.level,
              category: item.category || "",
              sentenceTa: item.tamil || item.sentenceTa,
              meaningEn: item.english || item.meaningEn,
              translit: item.translit || ""
            }));
            dataLoaded = true;
          }
        }
      } catch (_) {
        // Fallback remains with DEFAULT_SENTENCES
      }
    }
    await loadCustomMaterials();
    await loadPdfLessons();
  }

  function getStudentKey() {
    if (window.App && App.currentStudent) {
      return `${App.currentStudent.firstName}_${App.currentStudent.lastName}_G${App.currentStudent.grade}`;
    }
    return "guest_student";
  }

  function trackStudied(sentence) {
    if (!sentence) return;
    const key = `studied_rc_${getStudentKey()}`;
    let studied = [];
    try { studied = JSON.parse(localStorage.getItem(key) || "[]"); } catch (_) {}
    if (!studied.includes(sentence.id)) {
      studied.push(sentence.id);
      localStorage.setItem(key, JSON.stringify(studied));
    }
  }

  function getStudiedIds() {
    const key = `studied_rc_${getStudentKey()}`;
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (_) { return []; }
  }

  function updateFiltered() {
    filteredSentences = allSentences.filter(s => {
      const matchGrade = (currentGrade === "all" || s.grade === currentGrade);
      let matchLevel = true;
      if (currentLevel !== "all") {
        matchLevel = (s.level === currentLevel || (s.category && s.category.toLowerCase().includes(currentLevel.toLowerCase())));
      }
      return matchGrade && matchLevel;
    });

    if (!filteredSentences.length) {
      filteredSentences = allSentences.filter(s => {
        if (currentLevel !== "all") {
          return s.level === currentLevel;
        }
        return s.grade === currentGrade;
      });
    }
    if (!filteredSentences.length) {
      filteredSentences = allSentences;
    }

    if (currentIndex >= filteredSentences.length) currentIndex = 0;
    populateSentenceSelect();
    renderCurrentSentence();
  }

  function populateSentenceSelect() {
    const controls = ui();
    if (!controls.sentenceSelect) return;

    controls.sentenceSelect.innerHTML = filteredSentences.map((s, idx) => {
      const prefix = s.isTeacherUploaded ? "🏷️ [ஆசிரியர்] " : "";
      const text = s.sentenceTa.length > 28 ? s.sentenceTa.slice(0, 26) + "…" : s.sentenceTa;
      return `<option value="${idx}">${prefix}தொடர் ${idx + 1}: ${text}</option>`;
    }).join("");
    controls.sentenceSelect.value = String(currentIndex);
  }

  function renderCurrentSentence() {
    const controls = ui();
    const item = filteredSentences[currentIndex];
    if (!item) return;

    trackStudied(item);

    const levelNames = {
      "simple": "🌟 எளிய நிலை (Simple)",
      "intermediate": "🚀 நடுத்தர நிலை (Intermediate)",
      "complex": "🏆 உயர் நிலை (Complex)",
      "2-words": "இரு சொல் தொடர் (2 Words)",
      "3-words": "முச்சொல் தொடர் (3 Words)",
      "4-words": "நான்கு சொல் தொடர் (4 Words)"
    };

    const catInfo = item.isTeacherUploaded ? ` · 🏷️ ஆசிரியர் பதிவேற்றம்: ${item.category}` : (item.category ? ` · ${item.category}` : "");
    if (controls.numberBadge) {
      controls.numberBadge.textContent = `Nilai ${item.grade} · தொடர் ${currentIndex + 1} / ${filteredSentences.length}${catInfo}`;
    }
    if (controls.tagBadge) {
      if (item.isTeacherUploaded) {
        controls.tagBadge.textContent = `🏷️ ஆசிரியர் பாடம் · ${levelNames[item.level] || item.level}`;
      } else {
        controls.tagBadge.textContent = levelNames[item.level] || item.level;
      }
    }
    if (controls.textTa) controls.textTa.textContent = item.sentenceTa;
    if (controls.meaningEn) controls.meaningEn.textContent = item.meaningEn || "";
    if (controls.translitText) controls.translitText.textContent = item.translit || "";

    if (controls.spokenBox) {
      controls.spokenBox.textContent = "மைக்ரோஃபோனை அழுத்தி வாசியுங்கள்...";
      controls.spokenBox.classList.add("empty");
    }
    if (controls.resultBox) {
      controls.resultBox.textContent = "மைக்ரோஃபோனை அழுத்தி வாசியுங்கள்.";
      controls.resultBox.className = "rc-result";
    }

    if (controls.sentenceSelect) controls.sentenceSelect.value = String(currentIndex);
    if (controls.nextBtn) controls.nextBtn.textContent = "அடுத்த தொடர் ▶";
    if (controls.prevBtn) controls.prevBtn.textContent = "◀ முந்தைய தொடர்";
  }

  function switchMode(mode = "read") {
    const controls = ui();
    if (controls.tabReadBtn) controls.tabReadBtn.classList.toggle("active", mode === "read");
    if (controls.tabQuizBtn) controls.tabQuizBtn.classList.toggle("active", mode === "quiz");

    if (controls.readView) controls.readView.style.display = (mode === "read") ? "block" : "none";
    if (controls.quizView) controls.quizView.style.display = (mode === "quiz") ? "block" : "none";

    if (mode === "quiz") {
      startQuiz();
    } else {
      if (currentPdfModuleId !== "all-graded") {
        renderCurrentPdfQuestion();
      } else {
        renderCurrentSentence();
      }
    }
  }

  // Helper to extract speech reading variations for all PDF & sentence items
  function buildSpeechCandidates(rawQuestion, rawAnswer) {
    const set = new Set();
    const add = (txt) => {
      if (!txt) return;
      const str = String(txt).trim();
      if (str) set.add(str);
      // Tamil text only (strip English annotations in parens, e.g. "அரம் (Filing tool) — அறம் (Virtue)")
      const tamilOnly = str
        .replace(/[A-Za-z]/g, " ")
        .replace(/[=+\-_()—–,.:;!?"'’‘\/]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (tamilOnly) set.add(tamilOnly);
    };

    add(rawQuestion);
    add(rawAnswer);

    return Array.from(set);
  }

  function getStudentDifficulty() {
    const select = document.getElementById("rc-difficulty-select");
    const key = `rc_difficulty_${getStudentKey()}`;
    const saved = localStorage.getItem(key) || "medium";
    if (select && select.dataset.student !== key) {
      select.dataset.student = key;
      select.value = ["easy", "medium", "hard"].includes(saved) ? saved : "medium";
      select.onchange = () => {
        localStorage.setItem(key, select.value);
        selectPdfModule(currentPdfModuleId);
      };
    }
    return select ? select.value : saved;
  }

  function evaluateTranscript(transcript) {
    const controls = ui();
    const cleanSpoken = (transcript || "").trim();
    if (!cleanSpoken) return;

    const matcher = window.TamilMatcher || window.KidSpeechMatcher;

    if (currentPdfModuleId !== "all-graded" && pdfItems && pdfItems[pdfCurrentIndex]) {
      const item = pdfItems[pdfCurrentIndex];
      const target = (item.type === "reading" ? item.questionTa : item.correctAnswer || item.questionTa).trim();
      const candidates = buildSpeechCandidates(target, "");

      let rawPercent = 0;
      if (matcher && typeof matcher.evaluate === "function") {
        const evalRes = matcher.evaluate({
          tamilPrimary: candidates[0] || target,
          variations: candidates.slice(1)
        }, cleanSpoken, getStudentDifficulty());
        rawPercent = evalRes.percentage || 0;
      } else {
        const normSpoken = cleanSpoken.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'!’—=+]/g, " ").replace(/\s+/g, " ").trim();
        for (const c of candidates) {
          const normC = c.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'!’—=+]/g, " ").replace(/\s+/g, " ").trim();
          if (!normC) continue;
          if (normSpoken === normC) { rawPercent = 100; break; }
        }
      }

      // Kid-friendly speech scoring: speaking the Tamil text yields 100% and 3 stars!
      let score = rawPercent;
      let stars = 0;
      let passed = false;

      if (rawPercent === 100) {
        score = 100; stars = 3; passed = true;
      }

      if (controls.resultBox) {
        if (passed) {
          if (!pdfAnsweredCurrent) {
            pdfAnsweredCurrent = true;
        passedPdfItems.add(`${getStudentKey()}:${currentPdfModuleId}:${item.id}`);
            pdfCompletedStats.stars += stars;
            pdfCompletedStats.scoreSum += score;
            pdfCompletedStats.count++;
          }
          if (controls.unitScoreBadge) controls.unitScoreBadge.textContent = `⭐ ${pdfCompletedStats.stars} நட்சத்திரங்கள்`;

          controls.resultBox.className = "rc-result success";
          controls.resultBox.innerHTML = `
            <div class="result-feedback-card">
              🎉 <strong>மிக நன்று! அருமையாக வாசித்தீர்கள்!</strong><br>
              <span class="rc-score">மதிப்பெண்: ${score}% (${"★".repeat(stars)})</span>
            </div>
          `;
          if (window.KidAudioFX) {
            KidAudioFX.playSuccessFanfare();
            KidAudioFX.playStarDing(stars);
          }
          if (window.App) App.triggerConfetti();
        } else {
          controls.resultBox.className = "rc-result retry";
          controls.resultBox.innerHTML = `
            <div class="result-feedback-card">
              👍 <strong>நல்ல முயற்சி!</strong> மீண்டும் ஒருமுறை தெளிவாக வாசியுங்கள்.<br>
              <span class="rc-score" style="color: #b45309; background: #fef3c7;">மதிப்பெண்: ${score}%</span>
            </div>
          `;
          if (window.KidAudioFX) KidAudioFX.playTryAgain();
        }
      }

      if (window.App) {
        App.saveProgress({
          sentenceId: `${currentPdfModule.id}-${item.id}`,
          category: `reading-club-pdf:${currentPdfModule.title}`,
          score,
          stars: passed ? stars : 0,
          passed
        });
      }
      return;
    }

    // Default sentence reading evaluation (Speech-Only)
    const item = filteredSentences[currentIndex];
    if (!item) return;

    const target = item.sentenceTa.trim();
    const candidates = buildSpeechCandidates(item.sentenceTa, "");

    let rawPercent = 0;
    if (matcher && typeof matcher.evaluate === "function") {
      const evalRes = matcher.evaluate({
        tamilPrimary: candidates[0] || target,
        variations: candidates.slice(1)
      }, cleanSpoken, getStudentDifficulty());
      rawPercent = evalRes.percentage || 0;
    } else {
      const normSpoken = cleanSpoken.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'!’—=+]/g, " ").replace(/\s+/g, " ").trim();
      for (const c of candidates) {
        const normC = c.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'!’—=+]/g, " ").replace(/\s+/g, " ").trim();
        if (!normC) continue;
        if (normSpoken === normC) { rawPercent = 100; break; }
      }
    }

    let score = rawPercent;
    let stars = 0;
    let passed = false;

    if (rawPercent === 100) {
        score = 100; stars = 3; passed = true;
      }

    if (controls.resultBox) {
      if (passed) {
        controls.resultBox.className = "rc-result success";
        controls.resultBox.innerHTML = `
          <div class="result-feedback-card">
            🎉 <strong>மிக நன்று! அருமையாக வாசித்தீர்கள்!</strong><br>
            <span class="rc-score">மதிப்பெண்: ${score}% (${"★".repeat(stars)})</span>
          </div>
        `;
        if (window.KidAudioFX) {
          KidAudioFX.playSuccessFanfare();
          KidAudioFX.playStarDing(stars);
        }
        if (window.App) App.triggerConfetti();
      } else {
        controls.resultBox.className = "rc-result retry";
        controls.resultBox.innerHTML = `
          <div class="result-feedback-card">
            👍 <strong>நல்ல முயற்சி!</strong> மீண்டும் ஒருமுறை தெளிவாக வாசியுங்கள்.<br>
            <span class="rc-score" style="color: #b45309; background: #fef3c7;">மதிப்பெண்: ${score}%</span>
          </div>
        `;
        if (window.KidAudioFX) KidAudioFX.playTryAgain();
      }
    }

    if (window.App) {
      App.saveProgress({
        sentenceId: item.id,
        category: "reading-club",
        score,
        stars: passed ? stars : 0,
        passed
      });
    }
  }

  // --- Dynamic Quick Check Engine based on Studied Sentences ---
  function generateQuizQuestions() {
    const studiedIds = getStudiedIds();
    const gradePool = allSentences.filter(s => s.grade === currentGrade);

    let candidates = gradePool.filter(s => studiedIds.includes(s.id));
    if (candidates.length < 5) {
      const unstudied = gradePool.filter(s => !studiedIds.includes(s.id));
      candidates = [...candidates, ...unstudied];
    }
    if (candidates.length < 5) {
      candidates = allSentences;
    }

    const pool = [...candidates].sort(() => Math.random() - 0.5);
    const questions = [];

    for (let i = 0; i < Math.min(5, pool.length); i++) {
      const s = pool[i];
      const words = s.sentenceTa.split(" ");
      const qType = i % 2;

      if (qType === 0 && words.length >= 2) {
        const targetWord = words[words.length - 1];
        const promptLine = words.slice(0, words.length - 1).join(" ") + " _______";

        const otherWords = allSentences
          .map(other => other.sentenceTa.split(" ").pop())
          .filter(w => w && w !== targetWord);
        const uniqueDistractors = [...new Set(otherWords)].sort(() => Math.random() - 0.5).slice(0, 3);
        const allOptions = [targetWord, ...uniqueDistractors].sort(() => Math.random() - 0.5);
        const ansIdx = allOptions.indexOf(targetWord);

        questions.push({
          id: `rcq-${s.id}-blank`,
          badge: "விடுபட்ட சொல்லை நிரப்புக",
          question: promptLine,
          options: allOptions,
          answerIndex: ansIdx,
          explanation: `முழு தொடர்: “${s.sentenceTa}” (${s.meaningEn})`
        });
      } else {
        const targetMeaning = s.meaningEn;
        const distractorMeanings = allSentences
          .filter(other => other.id !== s.id)
          .map(other => other.meaningEn)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const allOptions = [targetMeaning, ...distractorMeanings].sort(() => Math.random() - 0.5);
        const ansIdx = allOptions.indexOf(targetMeaning);

        questions.push({
          id: `rcq-${s.id}-meaning`,
          badge: "பொருள் அறிக (Meaning)",
          question: `‘${s.sentenceTa}’ என்பதன் ஆங்கிலப் பொருள் என்ன?`,
          options: allOptions,
          answerIndex: ansIdx,
          explanation: `“${s.sentenceTa}” = ${s.meaningEn}`
        });
      }
    }
    return questions;
  }

  function startQuiz() {
    quizQuestions = generateQuizQuestions();
    quizCurrentIndex = 0;
    quizScore = 0;
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const controls = ui();
    if (!quizQuestions || !quizQuestions.length) return;

    quizAnswered = false;
    const q = quizQuestions[quizCurrentIndex];
    const total = quizQuestions.length;
    const progressPercent = Math.round(((quizCurrentIndex + 1) / total) * 100);

    if (controls.quizStepLabel) controls.quizStepLabel.textContent = `கேள்வி ${quizCurrentIndex + 1} / ${total}`;
    if (controls.quizScoreBadge) controls.quizScoreBadge.textContent = `⭐ ${quizScore} புள்ளிகள்`;
    if (controls.quizBar) controls.quizBar.style.width = `${progressPercent}%`;
    if (controls.quizBadge) controls.quizBadge.textContent = q.badge;
    if (controls.quizQuestion) controls.quizQuestion.textContent = q.question;
    if (controls.quizFeedback) controls.quizFeedback.style.display = "none";
    if (controls.quizNextBtn) controls.quizNextBtn.disabled = true;

    if (controls.quizOptions) {
      controls.quizOptions.innerHTML = q.options.map((opt, idx) => `
        <button class="quiz-option-btn" data-idx="${idx}" onclick="ReadingClubPractice.handleQuizOption(${idx})">
          <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
          <span class="option-text">${opt}</span>
        </button>
      `).join("");
    }
  }

  function handleQuizOption(idx) {
    if (quizAnswered) return;
    quizAnswered = true;

    const q = quizQuestions[quizCurrentIndex];
    const controls = ui();
    const isCorrect = (idx === q.answerIndex);

    const buttons = controls.quizOptions ? controls.quizOptions.querySelectorAll(".quiz-option-btn") : [];
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.answerIndex) btn.classList.add("correct");
      if (i === idx && !isCorrect) btn.classList.add("wrong");
    });

    if (isCorrect) {
      quizScore += 20;
      if (controls.quizScoreBadge) controls.quizScoreBadge.textContent = `⭐ ${quizScore} புள்ளிகள்`;
      if (window.KidAudioFX) {
        KidAudioFX.playSuccessFanfare();
        KidAudioFX.playStarDing(3);
      }
      if (window.App) App.triggerConfetti();

      if (controls.quizFeedback) {
        controls.quizFeedback.style.display = "block";
        controls.quizFeedback.className = "quiz-feedback-box correct";
        controls.quizFeedback.innerHTML = `<strong>🎉 மிகச் சரியான விடை!</strong><br>${q.explanation}`;
      }
    } else {
      if (window.KidAudioFX) KidAudioFX.playTryAgain();
      if (controls.quizFeedback) {
        controls.quizFeedback.style.display = "block";
        controls.quizFeedback.className = "quiz-feedback-box wrong";
        controls.quizFeedback.innerHTML = `<strong>தவறான விடை. சரியான விடை:</strong> “${q.options[q.answerIndex]}”<br>${q.explanation}`;
      }
    }

    if (window.App) {
      App.saveProgress({
        sentenceId: `rc-quiz-${q.id}`,
        category: "reading-club-quiz",
        score: isCorrect ? 100 : 0,
        stars: isCorrect ? 3 : 0,
        passed: isCorrect
      });
    }

    if (controls.quizNextBtn) controls.quizNextBtn.disabled = false;
  }

  function nextQuizQuestion() {
    if (quizCurrentIndex < quizQuestions.length - 1) {
      quizCurrentIndex++;
      renderQuizQuestion();
    } else {
      showQuizSummary();
    }
  }

  function showQuizSummary() {
    const controls = ui();
    const stars = quizScore >= 80 ? 3 : (quizScore >= 60 ? 2 : 1);

    if (controls.quizQuestion) {
      controls.quizQuestion.innerHTML = `🌟 வாசிப்பு மன்ற வினாடி வினா நிறைவு! மதிப்பெண்: <strong>${quizScore} / 100</strong> (${"★".repeat(stars)}${"☆".repeat(3 - stars)})`;
    }
    if (controls.quizOptions) {
      controls.quizOptions.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 20px; background: #f8fafc; border-radius: 16px;">
          <h3 style="font-family: var(--font-kid); font-size: 1.5rem; color: #1e1b4b; margin-bottom: 8px;">அருமை! வாசிப்புப் பயிற்சியில் சிறந்து விளங்குகிறீர்கள்! 🏆</h3>
          <p style="font-family: var(--font-tamil); color: #475569; margin-bottom: 16px;">இன்றைய வினாடி வினா சாதனைகள் உங்கள் கணக்கில் பதிவு செய்யப்பட்டுள்ளன.</p>
          <button class="studio-btn primary" id="restart-rc-quiz-btn" style="max-width: 260px; margin: 0 auto; background: linear-gradient(135deg, #4f46e5, #7c3aed);">🔄 மீண்டும் பயிற்சி செய்க (Restart)</button>
        </div>
      `;
      const restartBtn = document.getElementById("restart-rc-quiz-btn");
      if (restartBtn) restartBtn.addEventListener("click", () => startQuiz());
    }
    if (controls.quizFeedback) controls.quizFeedback.style.display = "none";
    if (controls.quizNextBtn) controls.quizNextBtn.disabled = true;

    if (window.KidAudioFX) {
      KidAudioFX.playSuccessFanfare();
      KidAudioFX.playStarDing(stars);
    }
    if (window.App) App.triggerConfetti();
  }

  const ReadingClub = {
    async open(mode = "read") {
      await loadData();
      if (window.App && App.currentGrade) {
        currentGrade = App.currentGrade;
      }
      const controls = ui();
      if (controls.gradeSelect) controls.gradeSelect.value = String(currentGrade);
      switchMode(mode);
    },
    switchMode,
    selectPdfModule,
    handleOptionClick,
    handleQuizOption,
    speak() {
      if (currentPdfModuleId !== "all-graded" && pdfItems && pdfItems[pdfCurrentIndex]) {
        const item = pdfItems[pdfCurrentIndex];
        if (item && window.KidSpeechService) {
          KidSpeechService.speakTamil(item.questionTa);
        }
        return;
      }
      const item = filteredSentences[currentIndex];
      if (item && window.KidSpeechService) {
        KidSpeechService.speakTamil(item.sentenceTa);
      }
    },
    speakStory() {
      if (currentPdfModuleId !== "all-graded" && pdfItems && pdfItems[pdfCurrentIndex]) {
        const item = pdfItems[pdfCurrentIndex];
        if (item && item.storyPassage && window.KidSpeechService) {
          KidSpeechService.speakTamil(item.storyPassage);
        }
      }
    },
    speakQuizQuestion() {
      const q = quizQuestions[quizCurrentIndex];
      if (q && window.KidSpeechService) {
        KidSpeechService.speakTamil(q.question);
      }
    },
    listen() {
      const item = (currentPdfModuleId !== "all-graded") ? pdfItems[pdfCurrentIndex] : filteredSentences[currentIndex];
      const controls = ui();
      if (!item) return;

      if (isListening || (window.KidSpeechService && (KidSpeechService.isListening || KidSpeechService.isStarting))) {
        if (window.KidSpeechService) KidSpeechService.cancelListening();
        isListening = false;
        if (controls.micBtn) controls.micBtn.classList.remove("listening");
        if (lastSpokenTranscript && !hasEvaluated) {
          hasEvaluated = true;
          evaluateTranscript(lastSpokenTranscript);
        }
        return;
      }

      lastSpokenTranscript = "";
      hasEvaluated = false;
      isListening = true;
      if (controls.micBtn) controls.micBtn.classList.add("listening");

      if (controls.spokenBox) {
        controls.spokenBox.textContent = "கேட்கிறது... தமிழில் வாசியுங்கள் (Listening...)";
        controls.spokenBox.classList.remove("empty");
      }
      if (controls.resultBox) {
        controls.resultBox.innerHTML = `<span class="listening-pulse">🔴</span> <strong>கேட்கிறேன்…</strong> தெளிவாக வாசியுங்கள்.`;
      }

      if (window.KidSpeechService) {
        KidSpeechService.setInputLanguage("ta-IN", { persist: false });
        KidSpeechService.startListening({
          onStart: () => {
            isListening = true;
            if (controls.micBtn) controls.micBtn.classList.add("listening");
          },
          onResult: ({ final, interim }) => {
            const liveText = (interim || final || "").trim();
            if (liveText) {
              lastSpokenTranscript = liveText;
              if (controls.spokenBox) {
                controls.spokenBox.textContent = liveText;
                controls.spokenBox.classList.remove("empty");
              }
            }
          },
          onError: () => {
            isListening = false;
            if (controls.micBtn) controls.micBtn.classList.remove("listening");
            if (controls.resultBox) {
              controls.resultBox.className = "rc-result";
              controls.resultBox.textContent = "மைக்ரோஃபோன் பிழை. மீண்டும் முயற்சிக்கவும்.";
            }
          },
          onEnd: () => {
            isListening = false;
            if (controls.micBtn) controls.micBtn.classList.remove("listening");
            if (lastSpokenTranscript && !hasEvaluated) {
              hasEvaluated = true;
              evaluateTranscript(lastSpokenTranscript);
            }
          }
        });
      }
    },
    next() {
      if (currentPdfModuleId !== "all-graded") {
        completeCurrentPdfQuestion();
        return;
      }
      if (currentIndex < filteredSentences.length - 1) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      renderCurrentSentence();
    },
    prev() {
      if (currentPdfModuleId !== "all-graded") {
        prevPdfQuestion();
        return;
      }
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = filteredSentences.length - 1;
      }
      renderCurrentSentence();
    },
    async reloadCustomMaterials() {
      await loadCustomMaterials();
      await loadPdfLessons();
      updateFiltered();
      return allSentences;
    },
    selectSection(secId) {
      selectSectionFilter(secId);
    },
    selectPdf(pdfId) {
      selectPdfModule(pdfId);
    },
    syncStudentLevel() { getStudentDifficulty(); },
    getAllSentences() {
      return allSentences;
    },
    init() {
      loadData();
      const controls = ui();

      // PDF selection events
      if (controls.pdfSelect) {
        controls.pdfSelect.addEventListener("change", (e) => {
          selectPdfModule(e.target.value);
        });
      }

      if (controls.pdfPillsBar) {
        controls.pdfPillsBar.addEventListener("click", (e) => {
          const btn = e.target.closest(".rc-pdf-pill");
          if (btn) {
            const moduleId = btn.getAttribute("data-pdf");
            selectPdfModule(moduleId);
          }
        });
      }

      if (controls.pdfSectionsBar) {
        controls.pdfSectionsBar.addEventListener("click", (e) => {
          const btn = e.target.closest(".rc-section-pill");
          if (btn) {
            const secId = btn.getAttribute("data-sec");
            selectSectionFilter(secId);
          }
        });
      }

      if (controls.storyAudioBtn) {
        controls.storyAudioBtn.addEventListener("click", () => this.speakStory());
      }

      if (controls.repeatPdfBtn) {
        controls.repeatPdfBtn.addEventListener("click", () => {
          pdfCurrentIndex = 0;
          pdfCompletedStats = { count: 0, stars: 0, scoreSum: 0 };
          if (controls.completedCard) controls.completedCard.style.display = "none";
          if (controls.mainCard) controls.mainCard.style.display = "block";
          renderCurrentPdfQuestion();
        });
      }

      if (controls.nextPdfBtn) {
        controls.nextPdfBtn.addEventListener("click", () => {
          const curIdx = pdfModules.findIndex(m => m.id === currentPdfModuleId);
          const nextMod = (curIdx >= 0 && curIdx < pdfModules.length - 1) ? pdfModules[curIdx + 1] : pdfModules[0];
          if (nextMod) {
            selectPdfModule(nextMod.id);
          } else {
            selectPdfModule("all-graded");
          }
        });
      }

      if (controls.tabReadBtn) controls.tabReadBtn.addEventListener("click", () => switchMode("read"));
      if (controls.tabQuizBtn) controls.tabQuizBtn.addEventListener("click", () => switchMode("quiz"));

      if (controls.gradeSelect) {
        controls.gradeSelect.addEventListener("change", (e) => {
          currentGrade = Number(e.target.value);
          currentIndex = 0;
          updateFiltered();
        });
      }

      if (controls.levelSelect) {
        controls.levelSelect.addEventListener("change", (e) => {
          currentLevel = e.target.value;
          currentIndex = 0;
          updateFiltered();
        });
      }

      if (controls.sentenceSelect) {
        controls.sentenceSelect.addEventListener("change", (e) => {
          currentIndex = Number(e.target.value);
          renderCurrentSentence();
        });
      }

      if (controls.listenBtn) controls.listenBtn.addEventListener("click", () => this.speak());
      if (controls.micBtn) controls.micBtn.addEventListener("click", () => this.listen());
      if (controls.prevBtn) controls.prevBtn.addEventListener("click", () => this.prev());
      if (controls.nextBtn) controls.nextBtn.addEventListener("click", () => this.next());

      if (controls.manualSubmit && controls.manualInput) {
        controls.manualSubmit.addEventListener("click", () => {
          const text = controls.manualInput.value.trim();
          if (text) {
            if (controls.spokenBox) {
              controls.spokenBox.textContent = text;
              controls.spokenBox.classList.remove("empty");
            }
            evaluateTranscript(text);
            controls.manualInput.value = "";
          }
        });
      }

      if (controls.quizAudioBtn) controls.quizAudioBtn.addEventListener("click", () => this.speakQuizQuestion());
      if (controls.quizNextBtn) controls.quizNextBtn.addEventListener("click", () => nextQuizQuestion());
    }
  };

  if (typeof window !== "undefined") {
    if (!window.KidSpeechMatcher && window.TamilMatcher) {
      window.KidSpeechMatcher = window.TamilMatcher;
    }
    window.ReadingClubPractice = ReadingClub;
    document.addEventListener("DOMContentLoaded", () => ReadingClub.init());
  }
})();

