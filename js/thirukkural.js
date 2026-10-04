/* All 108 chapters of Arathuppaal + Porutpaal & Interactive Quick Check. Source: tk120404/thirukkural (Apache-2.0). */
(function () {
  const DATA_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json";
  const DETAIL_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/detail.json";
  let kurals = [], chapters = [], chapterIndex = 0, verseIndex = 0, ready = false;
  let isListening = false, hasEvaluated = false, lastSpokenTranscript = "";
  let currentMode = "read"; // 'read' | 'quiz'

  // Curated sample questions pool for instant offline/online quiz responsiveness
  const CURATED_KURAL_QUIZ = [
    {
      id: "kq1",
      badge: "குறளை நிறைவு செய்க",
      question: "அகர முதல எழுத்தெல்லாம் _______ முதலாய உலகு.",
      options: ["ஆதி பகவன்", "வாலறி நற்றாள்", "மலர்மிசை ஏகினான்", "அறவாழி அந்தணன்"],
      answerIndex: 0,
      explanation: "‘அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு’ - எழுத்துகளுக்கு 'அ' முதன்மை போல, உலகிற்கு கடவுள் முதன்மை."
    },
    {
      id: "kq2",
      badge: "பொருள் அறிக",
      question: "‘கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக’ - இதன் நீதி என்ன?",
      options: ["கற்றபடி நல்வழியில் வாழ வேண்டும்", "நூல்களை படிக்காமல் இருக்க வேண்டும்", "பாடங்களை உடனே மறக்க வேண்டும்", "பிறருக்கு பாடம் சொல்லக்கூடாது"],
      answerIndex: 0,
      explanation: "கல்வியைக் குற்றமறக் கற்று, கற்ற நல்ல நெறியில் வாழ்வதே சிறப்பு."
    },
    {
      id: "kq3",
      badge: "அதிகாரம் அறிக",
      question: "‘அன்பிலார் எல்லாம் தமக்குரியர் அன்புடையார் என்பும் உரியர் பிறர்க்கு’ - எந்த அதிகாரம்?",
      options: ["அன்புடைமை", "கடவுள் வாழ்த்து", "கல்வி", "ஒழுக்கமுடைமை"],
      answerIndex: 0,
      explanation: "அன்பு உடையவர் தன் உடல், பொருள், ஆவி அனைத்தையும் பிறருக்குத் தருவர் என்பதை அன்புடைமை அதிகாரம் விளக்குகிறது."
    },
    {
      id: "kq4",
      badge: "அடுத்த அடி என்ன?",
      question: "‘துப்பார்க்குத் துப்பாய துப்பாக்கித் துப்பார்க்குத்’ - இந்த குறளின் இரண்டாம் அடி என்ன?",
      options: ["துப்பாய தூஉம் மழை", "வான்சிறப்பு மழை", "நீர்நின்று பொழியும் மழை", "உலகுக்கு உதவும் மழை"],
      answerIndex: 0,
      explanation: "‘துப்பார்க்குத் துப்பாய துப்பாக்கித் துப்பார்க்குத் துப்பாய தூஉம் மழை’ (வான்சிறப்பு)."
    },
    {
      id: "kq5",
      badge: "சொல் பொருள் அறிக",
      question: "‘மனத்துக்கண் மாசிலன் ஆதல் அனைத்தறன்’ - இதில் 'மாசு' என்பதன் பொருள் என்ன?",
      options: ["குற்றம் / அழுக்கு", "பெருமை", "மகிழ்ச்சி", "புகழ்"],
      answerIndex: 0,
      explanation: "மனதில் குற்றம் இல்லாமல் இருப்பதே சிறந்த அறம் ஆகும்."
    },
    {
      id: "kq6",
      badge: "குறளை நிறைவு செய்க",
      question: "‘ஈன்ற பொழுதின் பெரிதுவக்கும் தன்மகனைச் _______ எனக் கேட்ட தாய்’.",
      options: ["சான்றோன்", "செல்வந்தன்", "அரசன்", "வீரன்"],
      answerIndex: 0,
      explanation: "தன் மகனை நற்பண்புகள் நிறைந்த சான்றோன் எனக் கேட்கும்போது தாய் பெரிதும் மகிழ்வாள்."
    },
    {
      id: "kq7",
      badge: "நீதி விளக்கம்",
      question: "‘இனிய உளவாக இன்னாத கூறல் கனியிருப்பக் _______ கவர்ந்தற்று’.",
      options: ["காய்கவர்ந் தற்று", "பழம்கவர்ந் தற்று", "இலைகவர்ந் தற்று", "மலர்உண்ட தற்று"],
      answerIndex: 0,
      explanation: "இனிய சொல் இருக்கத் தீய சொல் பேசுவது, கனி இருக்கக் காயைத் தின்பது போன்றது."
    }
  ];

  let quizQuestions = [];
  let quizCurrentIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;

  const clean = text => text ? text.replace(/[.,;\n]/g, " ").replace(/\s+/g, " ").trim() : "";
  
  const ui = () => ({
    // Mode Switcher
    tabReadBtn: document.getElementById("kural-tab-read-btn"),
    tabQuizBtn: document.getElementById("kural-tab-quiz-btn"),
    readView: document.getElementById("kural-read-view"),
    quizView: document.getElementById("kural-quiz-view"),

    // Read View
    paal: document.getElementById("kural-paal-select"),
    chapter: document.getElementById("kural-chapter-select"),
    text: document.getElementById("kural-text"),
    number: document.getElementById("kural-number"),
    meaning: document.getElementById("kural-meaning"),
    spoken: document.getElementById("kural-spoken"),
    result: document.getElementById("kural-result"),
    micBtn: document.getElementById("kural-mic-btn"),
    listenBtn: document.getElementById("listen-kural-btn"),
    prevBtn: document.getElementById("prev-kural-btn"),
    nextBtn: document.getElementById("next-kural-btn"),
    manualInput: document.getElementById("kural-manual-input"),
    manualSubmit: document.getElementById("kural-manual-submit"),

    // Quiz View
    quizStepLabel: document.getElementById("kural-quiz-step-label"),
    quizScoreBadge: document.getElementById("kural-quiz-score-badge"),
    quizBar: document.getElementById("kural-quiz-bar"),
    quizBadge: document.getElementById("kural-quiz-badge"),
    quizQuestion: document.getElementById("kural-quiz-question"),
    quizAudioBtn: document.getElementById("kural-quiz-audio-btn"),
    quizOptions: document.getElementById("kural-quiz-options"),
    quizFeedback: document.getElementById("kural-quiz-feedback"),
    quizNextBtn: document.getElementById("kural-quiz-next-btn")
  });

  const currentChapter = () => chapters[chapterIndex];
  const currentVerse = () => kurals[verseIndex];

  function flatten(details) {
    const list = [];
    details[0].section.detail.filter(section => section.number < 3).forEach(section =>
      section.chapterGroup.detail.forEach(group =>
        group.chapters.detail.forEach(chapter =>
          list.push({ ...chapter, paal: section.number, paalName: section.name, iyal: group.name })
        )
      )
    );
    return list;
  }

  async function load() {
    if (ready) return true;
    const controls = ui();
    if (controls.result) controls.result.textContent = "திருக்குறள் தொகுப்பை ஏற்றுகிறது…";
    try {
      const [data, detail] = await Promise.all([
        fetch(DATA_URL).then(response => response.json()),
        fetch(DETAIL_URL).then(response => response.json())
      ]);
      kurals = data.kural;
      chapters = flatten(detail);
      ready = true;
      populate();
      render();
      return true;
    } catch (_) {
      if (controls.result) controls.result.textContent = "குறள் தொகுப்பை ஏற்ற முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்.";
      return false;
    }
  }

  function populate() {
    const controls = ui(), selected = Number(controls.paal.value), matches = chapters.filter(chapter => chapter.paal === selected);
    if (!matches || matches.length === 0) return;
    chapterIndex = chapters.indexOf(matches[0]);
    verseIndex = matches[0].start - 1;
    controls.chapter.innerHTML = matches.map(chapter => `<option value="${chapters.indexOf(chapter)}">${chapter.number}. ${chapter.name} (${chapter.start}–${chapter.end})</option>`).join("");
    controls.chapter.value = chapterIndex;
  }

  function switchMode(mode) {
    currentMode = mode;
    const controls = ui();
    if (controls.tabReadBtn) controls.tabReadBtn.classList.toggle("active", mode === "read");
    if (controls.tabQuizBtn) controls.tabQuizBtn.classList.toggle("active", mode === "quiz");

    if (mode === "read") {
      if (controls.readView) controls.readView.style.display = "block";
      if (controls.quizView) controls.quizView.style.display = "none";
      render();
    } else {
      if (controls.readView) controls.readView.style.display = "none";
      if (controls.quizView) controls.quizView.style.display = "block";
      startQuiz();
    }
  }

  function getStudentKey() {
    if (window.App && App.currentStudent) {
      return `${App.currentStudent.firstName}_${App.currentStudent.lastName}_G${App.currentStudent.grade}`;
    }
    return "guest_student";
  }

  function trackStudied(verse) {
    if (!verse || !verse.Number) return;
    const key = `studied_kural_${getStudentKey()}`;
    let studied = [];
    try { studied = JSON.parse(localStorage.getItem(key) || "[]"); } catch (_) {}
    if (!studied.includes(verse.Number)) {
      studied.push(verse.Number);
      localStorage.setItem(key, JSON.stringify(studied));
    }
  }

  function getStudiedNumbers() {
    const key = `studied_kural_${getStudentKey()}`;
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (_) { return []; }
  }

  function render() {
    if (!ready || !currentVerse()) return;
    const controls = ui(), verse = currentVerse(), chapter = currentChapter();
    trackStudied(verse);
    if (controls.number) controls.number.textContent = `குறள் ${verse.Number} · அதிகாரம் ${chapter.number}: ${chapter.name} (${chapter.paalName})`;
    if (controls.text) controls.text.textContent = `${verse.Line1}\n${verse.Line2}`;
    if (controls.meaning) controls.meaning.textContent = verse.mv || verse.sp || "";
    
    if (!isListening) {
      if (controls.spoken) {
        controls.spoken.textContent = "மைக்ரோஃபோனை அழுத்தி குறளை வாசியுங்கள்...";
        controls.spoken.classList.add("empty");
      }
      if (controls.result) {
        controls.result.innerHTML = `<strong>பயிற்சிக்குத் தயார்!</strong> 🎙️ மைக் பொத்தானை அழுத்திப் பேசவும்.`;
      }
      if (controls.micBtn) controls.micBtn.classList.remove("listening");
    }

    if (controls.chapter) controls.chapter.value = chapterIndex;
    if (controls.manualInput) controls.manualInput.value = "";
  }

  function evaluateTranscript(transcript) {
    const verse = currentVerse(), controls = ui();
    if (!verse || !transcript) return;

    trackStudied(verse);

    const target = `${verse.Line1} ${verse.Line2}`;
    const cleanTarget = clean(target);
    const cleanSpoken = clean(transcript);

    const match = TamilMatcher.evaluate(
      {
        tamilPrimary: cleanTarget,
        variations: [cleanTarget],
        keywords: cleanTarget.split(" "),
        english: "திருக்குறள்"
      },
      cleanSpoken,
      "medium"
    );

    const stars = "★".repeat(match.stars) + "☆".repeat(3 - match.stars);
    if (controls.result) {
      controls.result.innerHTML = `
        <div class="result-feedback-card">
          <div><strong>நீங்கள் சொன்னது:</strong> “${transcript}”</div>
          <div class="kural-score">${match.percentage}% பொருத்தம் &nbsp; ${stars}</div>
          <div class="result-msg">${match.feedback}</div>
        </div>
      `;
    }

    if (match.isPass) {
      if (window.KidAudioFX) {
        KidAudioFX.playSuccessFanfare();
        KidAudioFX.playStarDing(match.stars);
      }
      if (window.App) {
        App.triggerConfetti();
        App.saveProgress({
          sentenceId: `kural-${verse.Number}`,
          category: "thirukkural",
          score: match.percentage,
          stars: match.stars,
          passed: true
        });
      }
    } else {
      if (window.KidAudioFX) KidAudioFX.playTryAgain();
    }
  }

  // --- Thirukkural Quick Check Engine (Prioritizes Studied Kurals) ---
  function startQuiz() {
    const studiedNumbers = getStudiedNumbers();
    let candidates = CURATED_KURAL_QUIZ.filter(q => studiedNumbers.includes(q.kuralNum));
    if (candidates.length < 5) {
      const remaining = CURATED_KURAL_QUIZ.filter(q => !studiedNumbers.includes(q.kuralNum));
      candidates = [...candidates, ...remaining];
    }
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    quizQuestions = shuffled.slice(0, 5);
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
    if (controls.quizBadge) controls.quizBadge.textContent = q.badge || "திருக்குறள் வினாடி வினா";
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

    // Save student quiz answer
    if (window.App) {
      App.saveProgress({
        sentenceId: `kural-quiz-${q.id}`,
        category: "kural-quiz",
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
    const total = quizQuestions.length;
    const stars = quizScore >= 80 ? 3 : (quizScore >= 60 ? 2 : 1);

    if (controls.quizQuestion) {
      controls.quizQuestion.innerHTML = `🌟 வினாடி வினா நிறைவுற்றது! உங்கள் மதிப்பெண்: <strong>${quizScore} / 100</strong> (${"★".repeat(stars)}${"☆".repeat(3 - stars)})`;
    }
    if (controls.quizOptions) {
      controls.quizOptions.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 20px; background: #f8fafc; border-radius: 16px;">
          <h3 style="font-family: var(--font-kid); font-size: 1.5rem; color: #1e1b4b; margin-bottom: 8px;">அற்புதம்! திருக்குறள் அறிவை வளர்த்துள்ளீர்கள்! 🏆</h3>
          <p style="font-family: var(--font-tamil); color: #475569; margin-bottom: 16px;">இன்றைய திருக்குறள் பயிற்சி உங்கள் கணக்கில் வெற்றிகரமாகப் பதிவாகியுள்ளது.</p>
          <button class="studio-btn primary" id="restart-kural-quiz-btn" style="max-width: 260px; margin: 0 auto;">🔄 மீண்டும் பயிற்சி செய்க (Restart)</button>
        </div>
      `;
      const restartBtn = document.getElementById("restart-kural-quiz-btn");
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

  const Practice = {
    open(mode = "read") {
      load().then(() => {
        switchMode(mode);
      });
    },
    switchMode,
    render,
    speak() {
      const verse = currentVerse();
      if (verse && window.KidSpeechService) {
        KidSpeechService.speakTamil(`${verse.Line1} ${verse.Line2}`);
      }
    },
    speakQuizQuestion() {
      const q = quizQuestions[quizCurrentIndex];
      if (q && window.KidSpeechService) {
        KidSpeechService.speakTamil(q.question);
      }
    },
    listen() {
      const verse = currentVerse(), controls = ui();
      if (!verse) return;

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

      if (controls.spoken) {
        controls.spoken.textContent = "கேட்கிறது... குறளைப் பேசவும் (Listening...)";
        controls.spoken.classList.remove("empty");
      }
      if (controls.result) {
        controls.result.innerHTML = `<span class="listening-pulse">🔴</span> <strong>கேட்கிறேன்…</strong> குறளை மெதுவாக வாசியுங்கள்.`;
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
              if (controls.spoken) {
                controls.spoken.textContent = liveText;
                controls.spoken.classList.remove("empty");
              }
            }

            if (final) {
              hasEvaluated = true;
              isListening = false;
              if (controls.micBtn) controls.micBtn.classList.remove("listening");
              if (window.KidSpeechService) KidSpeechService.cancelListening();
              evaluateTranscript(final);
            }
          },
          onError: (error) => {
            isListening = false;
            if (controls.micBtn) controls.micBtn.classList.remove("listening");
            if (controls.result) {
              controls.result.innerHTML = `⚠️ குரல் சேவை கிடைக்கவில்லை (${error}). Tamil microphone அனுமதியைச் சரிபார்க்கவும்.`;
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
    next(direction) {
      if (isListening && window.KidSpeechService) KidSpeechService.cancelListening();
      isListening = false;
      const chapter = currentChapter();
      verseIndex += direction;
      if (verseIndex > chapter.end - 1) verseIndex = chapter.start - 1;
      if (verseIndex < chapter.start - 1) verseIndex = chapter.end - 1;
      render();
    },
    choosePaal() {
      if (isListening && window.KidSpeechService) KidSpeechService.cancelListening();
      isListening = false;
      populate();
      render();
    },
    chooseChapter(index) {
      if (isListening && window.KidSpeechService) KidSpeechService.cancelListening();
      isListening = false;
      chapterIndex = Number(index);
      verseIndex = currentChapter().start - 1;
      render();
    },
    submitManual() {
      const controls = ui();
      if (!controls.manualInput) return;
      const text = controls.manualInput.value.trim();
      if (text) {
        if (controls.spoken) {
          controls.spoken.textContent = text;
          controls.spoken.classList.remove("empty");
        }
        evaluateTranscript(text);
      }
    }
  };

  window.ThirukkuralPractice = Practice;

  document.addEventListener("DOMContentLoaded", () => {
    const controls = ui();
    if (controls.tabReadBtn) controls.tabReadBtn.addEventListener("click", () => switchMode("read"));
    if (controls.tabQuizBtn) controls.tabQuizBtn.addEventListener("click", () => switchMode("quiz"));

    if (controls.listenBtn) controls.listenBtn.addEventListener("click", () => Practice.speak());
    if (controls.micBtn) controls.micBtn.addEventListener("click", () => Practice.listen());
    if (controls.prevBtn) controls.prevBtn.addEventListener("click", () => Practice.next(-1));
    if (controls.nextBtn) controls.nextBtn.addEventListener("click", () => Practice.next(1));
    if (controls.paal) controls.paal.addEventListener("change", () => Practice.choosePaal());
    if (controls.chapter) controls.chapter.addEventListener("change", event => Practice.chooseChapter(event.target.value));
    if (controls.manualSubmit) controls.manualSubmit.addEventListener("click", () => Practice.submitManual());
    if (controls.manualInput) {
      controls.manualInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          Practice.submitManual();
        }
      });
    }

    if (controls.quizAudioBtn) controls.quizAudioBtn.addEventListener("click", () => Practice.speakQuizQuestion());
    if (controls.quizNextBtn) controls.quizNextBtn.addEventListener("click", () => nextQuizQuestion());
  });
}());
