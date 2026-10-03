/* All 108 chapters of Arathuppaal + Porutpaal. Source: tk120404/thirukkural (Apache-2.0). */
(function () {
  const DATA_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json";
  const DETAIL_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/detail.json";
  let kurals = [], chapters = [], chapterIndex = 0, verseIndex = 0, ready = false;
  let isListening = false, hasEvaluated = false, lastSpokenTranscript = "";

  const clean = text => text ? text.replace(/[.,;\n]/g, " ").replace(/\s+/g, " ").trim() : "";
  const ui = () => ({
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
    manualSubmit: document.getElementById("kural-manual-submit")
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

  function render() {
    if (!ready || !currentVerse()) return;
    const controls = ui(), verse = currentVerse(), chapter = currentChapter();
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

  const Practice = {
    open: () => load(),
    render,
    speak() {
      const verse = currentVerse();
      if (verse && window.KidSpeechService) {
        KidSpeechService.speakTamil(`${verse.Line1} ${verse.Line2}`);
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
  });
}());
