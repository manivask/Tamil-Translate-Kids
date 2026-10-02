/* All 108 chapters of Arathuppaal + Porutpaal. Source: tk120404/thirukkural (Apache-2.0). */
(function () {
  const DATA_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json";
  const DETAIL_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/detail.json";
  let kurals = [], chapters = [], chapterIndex = 0, verseIndex = 0, ready = false;
  const clean = text => text.replace(/[.,;\n]/g, " ").replace(/\s+/g, " ").trim();
  const ui = () => ({ paal: document.getElementById("kural-paal-select"), chapter: document.getElementById("kural-chapter-select"), text: document.getElementById("kural-text"), number: document.getElementById("kural-number"), meaning: document.getElementById("kural-meaning"), result: document.getElementById("kural-result") });
  const currentChapter = () => chapters[chapterIndex];
  const currentVerse = () => kurals[verseIndex];
  function flatten(details) {
    const list = [];
    details[0].section.detail.filter(section => section.number < 3).forEach(section => section.chapterGroup.detail.forEach(group => group.chapters.detail.forEach(chapter => list.push({ ...chapter, paal: section.number, paalName: section.name, iyal: group.name }))));
    return list;
  }
  async function load() {
    if (ready) return true;
    ui().result.textContent = "திருக்குறள் தொகுப்பை ஏற்றுகிறது…";
    try {
      const [data, detail] = await Promise.all([fetch(DATA_URL).then(response => response.json()), fetch(DETAIL_URL).then(response => response.json())]);
      kurals = data.kural; chapters = flatten(detail); ready = true; populate(); render(); return true;
    } catch (_) { ui().result.textContent = "குறள் தொகுப்பை ஏற்ற முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்."; return false; }
  }
  function populate() {
    const controls = ui(), selected = Number(controls.paal.value), matches = chapters.filter(chapter => chapter.paal === selected);
    chapterIndex = chapters.indexOf(matches[0]); verseIndex = matches[0].start - 1;
    controls.chapter.innerHTML = matches.map(chapter => `<option value="${chapters.indexOf(chapter)}">${chapter.number}. ${chapter.name} (${chapter.start}–${chapter.end})</option>`).join("");
    controls.chapter.value = chapterIndex;
  }
  function render() {
    if (!ready || !currentVerse()) return;
    const controls = ui(), verse = currentVerse(), chapter = currentChapter();
    controls.number.textContent = `குறள் ${verse.Number} · அதிகாரம் ${chapter.number}: ${chapter.name}`;
    controls.text.textContent = `${verse.Line1}\n${verse.Line2}`;
    controls.meaning.textContent = verse.mv || verse.sp || "";
    controls.result.textContent = "மைக்ரோஃபோனை அழுத்தி குறளை வாசியுங்கள்.";
    controls.chapter.value = chapterIndex;
  }
  const Practice = {
    open: () => load(), render,
    speak() { const verse = currentVerse(); if (verse) KidSpeechService.speakTamil(`${verse.Line1} ${verse.Line2}`); },
    listen() {
      const verse = currentVerse(), controls = ui(); if (!verse) return;
      controls.result.textContent = "🎙️ கேட்கிறேன்… குறளை மெதுவாக வாசியுங்கள்."; KidSpeechService.setInputLanguage("ta-IN", { persist: false });
      KidSpeechService.startListening({ onResult: value => { if (!value.final) return; const target = `${verse.Line1} ${verse.Line2}`; const match = TamilMatcher.evaluate({ tamilPrimary: clean(target), variations: [clean(target)], keywords: clean(target).split(" "), english: "திருக்குறள்" }, value.final, "medium"); const stars = "★".repeat(match.stars) + "☆".repeat(3 - match.stars); controls.result.innerHTML = `<strong>நீங்கள் சொன்னது:</strong> “${value.final}”<br><span class="kural-score">${match.percentage}% பொருத்தம் &nbsp; ${stars}</span><br>${match.feedback}`; if (match.isPass) { KidAudioFX.playSuccessFanfare(); KidAudioFX.playStarDing(match.stars); if (window.App) { App.triggerConfetti(); App.saveProgress({ sentenceId: `kural-${verse.Number}`, category: "thirukkural", score: match.percentage, stars: match.stars, passed: true }); } } else KidAudioFX.playTryAgain(); }, onError: error => { controls.result.textContent = `குரல் சேவை கிடைக்கவில்லை (${error}). Tamil microphone அனுமதியைச் சரிபார்க்கவும்.`; } });
    },
    next(direction) { const chapter = currentChapter(); verseIndex += direction; if (verseIndex > chapter.end - 1) verseIndex = chapter.start - 1; if (verseIndex < chapter.start - 1) verseIndex = chapter.end - 1; render(); },
    choosePaal() { populate(); render(); },
    chooseChapter(index) { chapterIndex = Number(index); verseIndex = currentChapter().start - 1; render(); }
  };
  window.ThirukkuralPractice = Practice;
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("listen-kural-btn").addEventListener("click", () => Practice.speak());
    document.getElementById("kural-mic-btn").addEventListener("click", () => Practice.listen());
    document.getElementById("prev-kural-btn").addEventListener("click", () => Practice.next(-1));
    document.getElementById("next-kural-btn").addEventListener("click", () => Practice.next(1));
    document.getElementById("kural-paal-select").addEventListener("change", () => Practice.choosePaal());
    document.getElementById("kural-chapter-select").addEventListener("change", event => Practice.chooseChapter(event.target.value));
  });
}());
