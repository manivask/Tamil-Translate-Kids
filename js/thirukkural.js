/* A small, age-appropriate Thirukkural reading studio. */
(function () {
  const KURALS = [
    { n: 1, text: "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.", meaning: "எழுத்துகளுக்கு 'அ' முதன்மையானது போல, உலகிற்கு இறைவன் முதன்மையானவர்." },
    { n: 391, text: "கற்க கசடறக் கற்பவை கற்றபின்\nநிற்க அதற்குத் தக.", meaning: "கற்க வேண்டியவற்றைத் தெளிவாகக் கற்று, கற்றதற்கேற்ப நடக்க வேண்டும்." },
    { n: 100, text: "இனிய உளவாக இன்னாத கூறல்\nகனியிருப்பக் காய்கவர்ந் தற்று.", meaning: "இனிய சொற்கள் இருக்கும்போது கடுஞ்சொல் பேசுவது, பழம் இருக்கக் காயைப் பறிப்பது போன்றது." },
    { n: 129, text: "தீயினாற் சுட்டபுண் உள்ளாறும் ஆறாதே\nநாவினாற் சுட்ட வடு.", meaning: "நெருப்பால் ஏற்பட்ட புண் ஆறும்; ஆனால் கடுஞ்சொல்லால் ஏற்பட்ட காயம் ஆறாது." }
  ];
  let index = 0;
  const clean = text => text.replace(/\n/g, " ").replace(/[.,;]/g, "").trim();
  function score(target, heard) {
    const kuralTarget = { tamilPrimary: clean(target), variations: [clean(target)], keywords: clean(target).split(/\s+/), english: "திருக்குறள்" };
    return TamilMatcher.evaluate(kuralTarget, heard, "medium");
  }
  const Practice = {
    render() {
      const item = KURALS[index];
      document.getElementById("kural-number").textContent = `குறள் ${item.n}`;
      document.getElementById("kural-text").textContent = item.text;
      document.getElementById("kural-meaning").textContent = item.meaning;
      document.getElementById("kural-result").innerHTML = "மைக்ரோஃபோனை அழுத்தி குறளை வாசியுங்கள்.";
    },
    speak() { KidSpeechService.speakTamil(clean(KURALS[index].text)); },
    listen() {
      const result = document.getElementById("kural-result");
      result.textContent = "🎙️ கேட்கிறேன்… குறளை மெதுவாக வாசியுங்கள்.";
      KidSpeechService.setInputLanguage("ta-IN", { persist: false });
      KidSpeechService.startListening({
        onResult: value => { if (value.final) {
          const match = score(KURALS[index].text, value.final);
          const stars = "★".repeat(match.stars) + "☆".repeat(3 - match.stars);
          result.innerHTML = `<strong>நீங்கள் சொன்னது:</strong> “${value.final}”<br><span class="kural-score">${match.percentage}% பொருத்தம் &nbsp; ${stars}</span><br>${match.feedback}`;
          if (match.isPass) { KidAudioFX.playSuccessFanfare(); KidAudioFX.playStarDing(match.stars); if (window.App) App.triggerConfetti(); }
          else KidAudioFX.playTryAgain();
        } },
        onError: error => { result.textContent = `குரல் சேவை கிடைக்கவில்லை (${error}). உங்கள் உலாவியில் Tamil microphone அனுமதியைச் சரிபார்க்கவும்.`; }
      });
    },
    next(direction) { index = (index + direction + KURALS.length) % KURALS.length; this.render(); }
  };
  window.ThirukkuralPractice = Practice;
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("listen-kural-btn").addEventListener("click", () => Practice.speak());
    document.getElementById("kural-mic-btn").addEventListener("click", () => Practice.listen());
    document.getElementById("prev-kural-btn").addEventListener("click", () => Practice.next(-1));
    document.getElementById("next-kural-btn").addEventListener("click", () => Practice.next(1));
    Practice.render();
  });
}());
