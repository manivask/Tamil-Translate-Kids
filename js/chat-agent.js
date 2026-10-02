/* Tamil-first conversational companion. Browser speech remains local. */
(function () {
  let childName = localStorage.getItem("tamil_kids_chat_name") || "";
  let started = false;
  const responseFor = input => {
    const text = input.toLowerCase();
    if (!childName) { childName = input.trim().split(/\s+/)[0]; localStorage.setItem("tamil_kids_chat_name", childName); return `உங்களைச் சந்தித்ததில் மகிழ்ச்சி, ${childName}! இன்று நீங்கள் என்ன கற்றுக்கொள்ள விரும்புகிறீர்கள்?`; }
    if (/வணக்கம்|ஹலோ|hello/.test(text)) return `வணக்கம் ${childName}! இன்று உங்கள் நாள் எப்படி இருக்கிறது?`;
    if (/பெயர்/.test(text)) return "என் பெயர் அரும்பு நண்பன். தமிழ் பேசவும் கற்கவும் உங்களுக்கு உதவ நான் இருக்கிறேன்!";
    if (/கதை/.test(text)) return "ஒரு சிறிய கதை: ஒரு குருவி தினமும் சிறிது சிறிதாகக் கூடு கட்டியது. தொடர்ந்து முயன்றதால் அழகான கூடு உருவானது. இதில் என்ன பாடம் இருக்கிறது?";
    if (/திருக்குறள்|குறள்/.test(text)) return "திருக்குறள் வாசிக்க விரும்புகிறீர்களா? முகப்பில் உள்ள திருக்குறள் பயிற்சி அட்டையைத் திறந்து, ஒரு குறளை வாசித்துப் பாருங்கள்.";
    if (/நன்றி/.test(text)) return "மிக்க மகிழ்ச்சி! நீங்கள் மிகவும் நன்றாகத் தமிழ் பேசுகிறீர்கள்.";
    if (/பை|bye/.test(text)) return `பிறகு பேசலாம், ${childName}! இன்று ஒரு புதிய தமிழ்ச் சொல்லைக் கற்றுக்கொள்ள மறக்காதீர்கள்.`;
    if (/எப்படி|என்ன|ஏன்|எப்போது/.test(text)) return "அருமையான கேள்வி! நீங்கள் நினைப்பது என்ன என்று முதலில் சொல்லுங்கள்; அதைச் சேர்ந்து ஆராயலாம்.";
    return `${childName}, நான் கவனமாகக் கேட்கிறேன். இதைப் பற்றி இன்னும் ஒரு வாக்கியத்தில் சொல்ல முடியுமா?`;
  };
  async function internetAnswer(question) {
    // Wikipedia provides a public, CORS-enabled factual lookup. The result is
    // explicitly marked as a source rather than being presented as invented AI.
    const query = question.replace(/[?!.]/g, "").trim();
    if (query.length < 3) return null;
    try {
      const searchUrl = `https://ta.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`;
      const search = await fetch(searchUrl).then(r => r.json());
      const first = search?.query?.search?.[0];
      if (!first?.title) return null;
      const summaryUrl = `https://ta.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(first.title)}`;
      const summary = await fetch(summaryUrl).then(r => r.ok ? r.json() : null);
      const extract = summary?.extract?.replace(/\s+/g, " ").trim();
      if (!extract) return null;
      return `விக்கிப்பீடியா தகவல்: ${extract.length > 520 ? `${extract.slice(0, 517)}…` : extract}`;
    } catch (_) { return null; }
  }
  document.addEventListener("DOMContentLoaded", () => {
    const panel = document.getElementById("chat-panel"), messages = document.getElementById("chat-messages"), status = document.getElementById("chat-status"), input = document.getElementById("chat-input");
    const say = (text, who = "bot") => { const el = document.createElement("div"); el.className = `chat-bubble ${who}`; el.textContent = text; messages.appendChild(el); messages.scrollTop = messages.scrollHeight; if (who === "bot") KidSpeechService.speakTamil(text); };
    const open = () => { panel.classList.add("open"); panel.setAttribute("aria-hidden", "false"); if (!started) { started = true; say(childName ? `வணக்கம் ${childName}! மீண்டும் பேசுவதில் மகிழ்ச்சி. இன்று எப்படி இருக்கிறீர்கள்?` : "வணக்கம் குட்டீஸ்! நான் அரும்பு நண்பன். உங்கள் பெயர் என்ன?"); } };
    const send = async value => {
      const text = value.trim(); if (!text) return;
      say(text, "child"); input.value = "";
      if (!childName) { setTimeout(() => say(responseFor(text)), 250); return; }
      status.textContent = "🌐 தமிழில் தகவல் தேடுகிறேன்…";
      const online = await internetAnswer(text);
      status.textContent = "🎙️ பேசத் தயாராக இருக்கிறேன்";
      say(online || responseFor(text));
    };
    document.getElementById("chat-fab").addEventListener("click", open);
    document.getElementById("close-chat-btn").addEventListener("click", () => { panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); KidSpeechService.stopSpeaking(); });
    document.getElementById("chat-send-btn").addEventListener("click", () => send(input.value));
    input.addEventListener("keydown", e => { if (e.key === "Enter") send(input.value); });
    document.getElementById("chat-mic-btn").addEventListener("click", () => { status.textContent = "🎙️ கேட்கிறேன்…"; KidSpeechService.setInputLanguage("ta-IN", { persist: false }); KidSpeechService.startListening({ onStart: () => status.textContent = "🎙️ பேசுங்கள்…", onResult: v => { if (v.final) send(v.final); }, onEnd: () => status.textContent = "🎙️ பேசத் தயாராக இருக்கிறேன்", onError: error => status.textContent = `குரல் சேவை கிடைக்கவில்லை (${error})` }); });
  });
}());
