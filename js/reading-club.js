/**
 * Tamil-Translate-Kids - Reading Club (வாசிப்பு மன்றம்) Engine
 * Multi-level graded reading practice (2-word, 3-word, 4-word sentences)
 * Live Speech-to-Text, Voice synthesis, Adaptive Quick Check, & Progress tracking.
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
  let currentGrade = 1;
  let currentLevel = "all"; // 'all' | '2-words' | '3-words' | '4-words'
  let currentIndex = 0;
  let filteredSentences = [];
  let isListening = false;
  let lastSpokenTranscript = "";
  let hasEvaluated = false;

  // Quick Check State
  let quizQuestions = [];
  let quizCurrentIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;

  const ui = () => ({
    gradeSelect: document.getElementById("rc-grade-select"),
    levelSelect: document.getElementById("rc-level-select"),
    sentenceSelect: document.getElementById("rc-sentence-select"),
    levelPills: document.querySelectorAll(".rc-level-pill"),

    // Studio Tabs & Views
    tabReadBtn: document.getElementById("rc-tab-read-btn"),
    tabQuizBtn: document.getElementById("rc-tab-quiz-btn"),
    readView: document.getElementById("rc-read-view"),
    quizView: document.getElementById("rc-quiz-view"),

    // Flashcard UI
    numberBadge: document.getElementById("rc-sentence-number"),
    tagBadge: document.getElementById("rc-level-tag"),
    textTa: document.getElementById("rc-sentence-ta"),
    meaningEn: document.getElementById("rc-meaning-en"),
    translitText: document.getElementById("rc-translit"),
    listenBtn: document.getElementById("listen-rc-btn"),
    micBtn: document.getElementById("rc-mic-btn"),
    spokenBox: document.getElementById("rc-spoken"),
    resultBox: document.getElementById("rc-result"),
    prevBtn: document.getElementById("prev-rc-btn"),
    nextBtn: document.getElementById("next-rc-btn"),
    manualInput: document.getElementById("rc-manual-input"),
    manualSubmit: document.getElementById("rc-manual-submit"),

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
      const matchGrade = (s.grade === currentGrade);
      const matchLevel = (currentLevel === "all" || s.level === currentLevel);
      return matchGrade && matchLevel;
    });

    if (!filteredSentences.length) {
      filteredSentences = allSentences.filter(s => s.grade === currentGrade);
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

    controls.sentenceSelect.innerHTML = filteredSentences.map((s, idx) => `
      <option value="${idx}">தொடர் ${idx + 1}: ${s.sentenceTa}</option>
    `).join("");
    controls.sentenceSelect.value = String(currentIndex);
  }

  function renderCurrentSentence() {
    const controls = ui();
    const item = filteredSentences[currentIndex];
    if (!item) return;

    trackStudied(item);

    const levelNames = {
      "2-words": "இரு சொல் தொடர் (2 Words)",
      "3-words": "முச்சொல் தொடர் (3 Words)",
      "4-words": "நான்கு சொல் தொடர் (4 Words)"
    };

    if (controls.numberBadge) controls.numberBadge.textContent = `Nilai ${item.grade} · தொடர் ${currentIndex + 1} / ${filteredSentences.length}`;
    if (controls.tagBadge) controls.tagBadge.textContent = levelNames[item.level] || item.level;
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
      renderCurrentSentence();
    }
  }

  function evaluateTranscript(transcript) {
    const item = filteredSentences[currentIndex];
    const controls = ui();
    if (!item) return;

    const target = item.sentenceTa.trim();
    const cleanSpoken = (transcript || "").trim();

    let score = 0;
    if (window.KidSpeechMatcher) {
      const matchRes = KidSpeechMatcher.score(cleanSpoken, [target]);
      score = matchRes.score || 0;
    } else {
      score = cleanSpoken === target ? 100 : (cleanSpoken.includes(target) ? 80 : 50);
    }

    const passed = score >= 65;
    const stars = score >= 85 ? 3 : (score >= 65 ? 2 : 1);

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
    if (controls.quizBadge) controls.quizBadge.textContent = q.badge || "வாசிப்பு வினாடி வினா";
    if (controls.quizQuestion) controls.quizQuestion.textContent = q.question;
    if (controls.quizFeedback) {
      controls.quizFeedback.style.display = "none";
      controls.quizFeedback.className = "quiz-feedback-box";
      controls.quizFeedback.innerHTML = "";
    }
    if (controls.quizNextBtn) {
      controls.quizNextBtn.disabled = true;
      controls.quizNextBtn.textContent = (quizCurrentIndex === total - 1) ? "வினாடி வினா நிறைவு 🎉" : "அடுத்த கேள்வி ▶";
    }

    if (controls.quizOptions) {
      controls.quizOptions.innerHTML = q.options.map((opt, idx) => `
        <button class="quiz-option-btn" data-index="${idx}">
          <span>🔹</span><span>${opt}</span>
        </button>
      `).join("");

      controls.quizOptions.querySelectorAll(".quiz-option-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          if (quizAnswered) return;
          const selectedIdx = Number(btn.getAttribute("data-index"));
          answerQuizQuestion(selectedIdx);
        });
      });
    }
  }

  function answerQuizQuestion(selectedIdx) {
    if (quizAnswered) return;
    quizAnswered = true;
    const controls = ui();
    const q = quizQuestions[quizCurrentIndex];
    const isCorrect = (selectedIdx === q.answerIndex);

    const optionBtns = controls.quizOptions.querySelectorAll(".quiz-option-btn");
    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answerIndex) {
        btn.classList.add("correct");
      } else if (idx === selectedIdx && !isCorrect) {
        btn.classList.add("wrong");
      }
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
    open(mode = "read") {
      if (window.App && App.currentGrade) {
        currentGrade = App.currentGrade;
      }
      const controls = ui();
      if (controls.gradeSelect) controls.gradeSelect.value = String(currentGrade);
      updateFiltered();
      switchMode(mode);
    },
    switchMode,
    speak() {
      const item = filteredSentences[currentIndex];
      if (item && window.KidSpeechService) {
        KidSpeechService.speakTamil(item.sentenceTa);
      }
    },
    speakQuizQuestion() {
      const q = quizQuestions[quizCurrentIndex];
      if (q && window.KidSpeechService) {
        KidSpeechService.speakTamil(q.question);
      }
    },
    listen() {
      const item = filteredSentences[currentIndex];
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
          onError: (err) => {
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
      if (currentIndex < filteredSentences.length - 1) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      renderCurrentSentence();
    },
    prev() {
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = filteredSentences.length - 1;
      }
      renderCurrentSentence();
    },
    init() {
      const controls = ui();
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
    window.ReadingClubPractice = ReadingClub;
    document.addEventListener("DOMContentLoaded", () => ReadingClub.init());
  }
})();
