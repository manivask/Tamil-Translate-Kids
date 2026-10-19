// scripts/update_stage2_assign3.js
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('data/reading_club/pdf_lessons.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const sections = [
  { id: "sec-1", title: "பிரிவு 1: உயிர்மெய் எழுத்துகள் (ஆ, இ, ஈ வரிசை)", shortTitle: "பிரிவு 1: உயிர்மெய்", icon: "🔤" },
  { id: "sec-2", title: "பிரிவு 2: சொற்கள் வாசித்துப் பழகுக (20 சொற்கள்)", shortTitle: "பிரிவு 2: சொற்கள்", icon: "📖" },
  { id: "sec-3", title: "பிரிவு 3: வாக்கிய வாசித்துப் பழகுக (12 வாக்கியங்கள்)", shortTitle: "பிரிவு 3: வாக்கியங்கள்", icon: "💬" },
  { id: "sec-4", title: "பிரிவு 4: சிறுகதைகள் & வினாக்கள் (ராணி, கமல், கனி)", shortTitle: "பிரிவு 4: கதைகள்", icon: "📚" },
  { id: "sec-5", title: "பிரிவு 5: புணர்ச்சிச் சொல் பிரித்துப் படிக்க (10 சொற்கள்)", shortTitle: "பிரிவு 5: புணர்ச்சி", icon: "🧩" },
  { id: "sec-6", title: "பிரிவு 6: ர, ற மற்றும் ல, ள, ழ இலக்கண வேறுபாடுகள்", shortTitle: "பிரிவு 6: இலக்கணம்", icon: "⚖️" },
  { id: "sec-7", title: "பிரிவு 7: நாநெகிழ் பயிற்சி & மயங்கொலிச் சொற்கள்", shortTitle: "பிரிவு 7: நாநெகிழ்", icon: "🗣️" }
];

const items = [];

// ==================== SECTION 1 ====================
items.push({
  id: "s2-as3-s1-q1",
  sectionId: "sec-1",
  sectionTitle: "பிரிவு 1: உயிர்மெய் எழுத்துகள் (ஆ, இ, ஈ வரிசை)",
  type: "reading",
  category: "பிரிவு 1: ஆ வரிசை உயிர்மெய் எழுத்துகள்",
  questionTa: "கா  ஙா  சா  ஞா  டா  ணா  தா  நா  பா  மா  யா  ரா  லா  வா  ழா  ளா  றா  னா",
  meaningEn: "Uyirmei Letters: 'Aa' vowel sound series (கா to னா)",
  translit: "Kaa, Ngaa, Chaa, Nyaa, Taa, Nnaa, Thaa, Naa, Paa, Maa, Yaa, Raa, Laa, Vaa, Zhaa, Llaa, Rraa, Nnaa",
  options: ["கா ஙா சா ஞா தா நா பா மா", "கி ஙி சி ஞி தி நி பி மி", "கீ ஙீ சீ ஞீ தீ நீ பீ மீ", "க ங ச ஞ த ந ப ம"],
  correctAnswer: "கா ஙா சா ஞா தா நா பா மா",
  explanation: "ஆ வரிசை: க் + ஆ = கா, த் + ஆ = தா, ப் + ஆ = பா."
});

items.push({
  id: "s2-as3-s1-q2",
  sectionId: "sec-1",
  sectionTitle: "பிரிவு 1: உயிர்மெய் எழுத்துகள் (ஆ, இ, ஈ வரிசை)",
  type: "reading",
  category: "பிரிவு 1: இ வரிசை உயிர்மெய் எழுத்துகள்",
  questionTa: "கி  ஙி  சி  ஞி  டி  ணி  தி  நி  பி  மி  யி  ரி  லி  வி  ழி  ளி  றி  னி",
  meaningEn: "Uyirmei Letters: 'I' vowel sound series (கி to னி)",
  translit: "Ki, Ngi, Chi, Nyi, Ti, Nni, Thi, Ni, Pi, Mi, Yi, Ri, Li, Vi, Zhi, Lli, Rri, Nni",
  options: ["கி ஙி சி ஞி தி நி பி மி", "கீ ஙீ சீ ஞீ தீ நீ பீ மீ", "கா ஙா சா ஞா தா நா பா மா", "கு ஙு சு ஞு து நு பு மு"],
  correctAnswer: "கி ஙி சி ஞி தி நி பி மி",
  explanation: "இ வரிசை: க் + இ = கி, த் + இ = தி, ப் + இ = பி."
});

items.push({
  id: "s2-as3-s1-q3",
  sectionId: "sec-1",
  sectionTitle: "பிரிவு 1: உயிர்மெய் எழுத்துகள் (ஆ, இ, ஈ வரிசை)",
  type: "reading",
  category: "பிரிவு 1: ஈ வரிசை உயிர்மெய் எழுத்துகள்",
  questionTa: "கீ  ஙீ  சீ  ஞீ  டீ  ணீ  தீ  நீ  பீ  மீ  யீ  ரீ  லீ  வீ  ழீ  ளீ  றீ  னீ",
  meaningEn: "Uyirmei Letters: 'Ee' vowel sound series (கீ to னீ)",
  translit: "Kee, Ngee, Chee, Nyee, Tee, Nnee, Thee, Nee, Pee, Mee, Yee, Ree, Lee, Vee, Zhee, Llee, Rree, Nnee",
  options: ["கீ ஙீ சீ ஞீ தீ நீ பீ மீ", "கி ஙி சி ஞி தி நி பி மி", "கா ஙா சா ஞா தா நா பா மா", "கை ஙை சை ஞை தை நை பை மை"],
  correctAnswer: "கீ ஙீ சீ ஞீ தீ நீ பீ மீ",
  explanation: "ஈ வரிசை: க் + ஈ = கீ, த் + ஈ = தீ, ப் + ஈ = பீ."
});

// ==================== SECTION 2 ====================
const sec2Words = [
  { ta: "இலவசப் பயணம்", en: "Free travel / Journey", tr: "Ilavasap payanam" },
  { ta: "ஆரம்பக் கல்வி", en: "Primary education", tr: "Aarambak kalvi" },
  { ta: "ஆற்றல்", en: "Potential / Energy", tr: "Aatral" },
  { ta: "மணல்", en: "Sand", tr: "Manal" },
  { ta: "மலர்", en: "Flower", tr: "Malar" },
  { ta: "மண்", en: "Soil / Earth", tr: "Mann" },
  { ta: "வர்த்தகம்", en: "Commerce / Trade", tr: "Varthagam" },
  { ta: "பயம்", en: "Fear", tr: "Bayam" },
  { ta: "பந்தயம்", en: "Race / Contest", tr: "Panthayam" },
  { ta: "பட்டம்", en: "Kite", tr: "Pattam" },
  { ta: "வந்தனம்", en: "Salutation / Greetings", tr: "Vandhanam" },
  { ta: "பந்தம்", en: "Bond / Torch", tr: "Pantham" },
  { ta: "அண்ணன்", en: "Elder brother", tr: "Annan" },
  { ta: "அர்த்தம்", en: "Meaning", tr: "Artham" },
  { ta: "படம்", en: "Picture", tr: "Padam" },
  { ta: "உலகம்", en: "World", tr: "Ulagam" },
  { ta: "என்ன பழம்", en: "What fruit", tr: "Enna pazham" },
  { ta: "எங்கள் உள்ளம்", en: "Our heart / mind", tr: "Engal ullam" },
  { ta: "மக்கள்", en: "People", tr: "Makkal" },
  { ta: "கண்", en: "Eye", tr: "Kann" }
];

sec2Words.forEach((w, idx) => {
  const distractors = sec2Words.filter(x => x.ta !== w.ta).slice(0, 3).map(x => x.ta);
  const opts = [w.ta, ...distractors].sort();
  items.push({
    id: `s2-as3-s2-q${idx + 1}`,
    sectionId: "sec-2",
    sectionTitle: "பிரிவு 2: சொற்கள் வாசித்துப் பழகுக",
    type: "reading",
    category: `பிரிவு 2: சொல் வாசிப்பு ${idx + 1}`,
    questionTa: w.ta,
    meaningEn: w.en,
    translit: w.tr,
    options: opts,
    correctAnswer: w.ta,
    explanation: `${w.ta} = ${w.en}`
  });
});

// ==================== SECTION 3 ====================
const sec3Sentences = [
  { ta: "அந்த இடம் எங்கள் நகரம்.", en: "That place is our city.", tr: "Antha idam engal nagaram." },
  { ta: "அந்த இல்லம் எங்கள் இல்லம்.", en: "That house is our house.", tr: "Antha illam engal illam." },
  { ta: "அவர் எங்கள் அரசர்.", en: "He is our king.", tr: "Avar engal arasar." },
  { ta: "இவர் என் நண்பர்.", en: "He is my friend.", tr: "Ivar en nanbar." },
  { ta: "இவள் என் மகள்.", en: "She is my daughter.", tr: "Ival en magal." },
  { ta: "இவன் என் மகன்.", en: "He is my son.", tr: "Ivan en magan." },
  { ta: "இவர் எங்கள் அண்ணன்.", en: "He is our elder brother.", tr: "Ivar engal annan." },
  { ta: "என் அண்ணன் நல்லவன்.", en: "My elder brother is a good person.", tr: "En annan nallavan." },
  { ta: "என் நண்பன் நல்லவன்.", en: "My friend is a good person.", tr: "En nanban nallavan." },
  { ta: "இந்த மரம் உயரம்.", en: "This tree is tall.", tr: "Intha maram uyaram." },
  { ta: "இந்தப் பழம் உன் பழம்.", en: "This fruit is your fruit.", tr: "Intha pazham un pazham." },
  { ta: "இந்தப் படம் என் படம்.", en: "This picture is my picture.", tr: "Intha padam en padam." }
];

sec3Sentences.forEach((s, idx) => {
  const distractors = sec3Sentences.filter(x => x.ta !== s.ta).slice(0, 3).map(x => x.ta);
  const opts = [s.ta, ...distractors].sort();
  items.push({
    id: `s2-as3-s3-q${idx + 1}`,
    sectionId: "sec-3",
    sectionTitle: "பிரிவு 3: வாக்கிய வாசித்துப் பழகுக",
    type: "reading",
    category: `பிரிவு 3: வாக்கியம் ${idx + 1}`,
    questionTa: s.ta,
    meaningEn: s.en,
    translit: s.tr,
    options: opts,
    correctAnswer: s.ta,
    explanation: `${s.ta} = ${s.en}`
  });
});

// ==================== SECTION 4 ====================
// Story 1: Rani
items.push({
  id: "s2-as3-s4-q1",
  sectionId: "sec-4",
  sectionTitle: "பிரிவு 4: சிறுகதைகள் & வினாக்கள்",
  type: "comprehension",
  category: "பிரிவு 4: சிறுகதை 1 - ராணி",
  storyTitle: "சிறுகதை 1: ராணி",
  storyPassage: "ராணி நல்ல மாணவி. அவள் பாடம் படித்தாள். அப்பா அவள் பாடம் வாசிக்கக் கண்டார். அப்பா மகிழ்ந்தார். ராணி மகிழ்ச்சியாகச் சிரித்தாள்.",
  questionTa: "ராணி என்ன படித்தாள்?",
  meaningEn: "What did Rani read?",
  translit: "Rani enna padithaal?",
  options: ["பாடம் படித்தாள் (Lesson)", "கதை எழுதினாள் (Story)", "பாட்டு பாடினாள் (Song)", "படம் வரைந்தாள் (Drawing)"],
  correctAnswer: "பாடம் படித்தாள் (Lesson)",
  explanation: "கதையில்: ‘அவள் பாடம் படித்தாள்.’"
});

// Story 2: Kamal
items.push({
  id: "s2-as3-s4-q2",
  sectionId: "sec-4",
  sectionTitle: "பிரிவு 4: சிறுகதைகள் & வினாக்கள்",
  type: "comprehension",
  category: "பிரிவு 4: சிறுகதை 2 - கமல்",
  storyTitle: "சிறுகதை 2: கமல்",
  storyPassage: "கமல் நடந்தான். அவன் ஆலமரம் கண்டான். பறவைகள் மரத்தில் அமர்ந்தன. கமல் பறவைகள் பறக்கக் கண்டான். அவன் மகிழ்ந்தான்.",
  questionTa: "கமல் எதைக் கண்டான்?",
  meaningEn: "What did Kamal see?",
  translit: "Kamal ethai kandaan?",
  options: ["ஆலமரம் கண்டான் (Banyan tree)", "மாமரம் கண்டான் (Mango tree)", "குளம் கண்டான் (Pond)", "வீடு கண்டான் (House)"],
  correctAnswer: "ஆலமரம் கண்டான் (Banyan tree)",
  explanation: "கதையில்: ‘அவன் ஆலமரம் கண்டான்.’"
});

// Story 3: Kani
items.push({
  id: "s2-as3-s4-q3",
  sectionId: "sec-4",
  sectionTitle: "பிரிவு 4: சிறுகதைகள் & வினாக்கள்",
  type: "comprehension",
  category: "பிரிவு 4: சிறுகதை 3 - கனி",
  storyTitle: "சிறுகதை 3: கனி",
  storyPassage: "அம்மா கனி தந்தாள். வாணி கனி உண்டாள். அவள் அண்ணன் வந்தான். வாணி அண்ணனிடம் கனி அளித்தாள். அவன் “நன்றி” என்றான்.",
  questionTa: "அம்மா என்ன கொடுத்தாள்?",
  meaningEn: "What did Mom give?",
  translit: "Amma enna koduthaal?",
  options: ["கனி தந்தாள் (Fruit)", "மலர் தந்தாள் (Flower)", "பால் தந்தாள் (Milk)", "புத்தகம் தந்தாள் (Book)"],
  correctAnswer: "கனி தந்தாள் (Fruit)",
  explanation: "கதையில்: ‘அம்மா கனி தந்தாள்.’"
});

items.push({
  id: "s2-as3-s4-q4",
  sectionId: "sec-4",
  sectionTitle: "பிரிவு 4: சிறுகதைகள் & வினாக்கள்",
  type: "comprehension",
  category: "பிரிவு 4: சிறுகதை 3 - கனி",
  storyTitle: "சிறுகதை 3: கனி",
  storyPassage: "அம்மா கனி தந்தாள். வாணி கனி உண்டாள். அவள் அண்ணன் வந்தான். வாணி அண்ணனிடம் கனி அளித்தாள். அவன் “நன்றி” என்றான்.",
  questionTa: "வாணியின் அண்ணன் என்ன கூறினான்?",
  meaningEn: "What did Vani's brother say?",
  translit: "Vaaniyin annan enna koorinaan?",
  options: ["“நன்றி” என்றான் (Thank you)", "வணக்கம் என்றான் (Greetings)", "போதும் என்றான் (Enough)", "வேண்டாம் என்றான் (No)"],
  correctAnswer: "“நன்றி” என்றான் (Thank you)",
  explanation: "கதையில்: ‘அவன் “நன்றி” என்றான்.’"
});

// ==================== SECTION 5 ====================
const sec5Compounds = [
  { word: "இடப்பக்கம்", split: "இடம் + பக்கம்", en: "Left side", alt: ["இட + பக்கம்", "இடப் + பக்கம்", "இடம் + அக்கம்"] },
  { word: "வலப்பக்கம்", split: "வலம் + பக்கம்", en: "Right side", alt: ["வல + பக்கம்", "வலப் + பக்கம்", "வலம் + அக்கம்"] },
  { word: "பக்கபலம்", split: "பக்கம் + பலம்", en: "Support / Strength", alt: ["பக்க + பலம்", "பக்கம் + கலம்", "பக்கப் + பலம்"] },
  { word: "தங்கப்பல்", split: "தங்கம் + பல்", en: "Gold tooth", alt: ["தங்க + பல்", "தங்கப் + பல்", "தங்கம் + சொல்"] },
  { word: "தங்கவளையல்", split: "தங்கம் + வளையல்", en: "Gold bangle", alt: ["தங்க + வளையல்", "தங்கப் + வளையல்", "தங்கம் + தையல்"] },
  { word: "மரப்பந்தல்", split: "மரம் + பந்தல்", en: "Wooden shed / canopy", alt: ["மர + பந்தல்", "மரப் + பந்தல்", "மரம் + கந்தல்"] },
  { word: "மணப்பந்தல்", split: "மணம் + பந்தல்", en: "Wedding canopy", alt: ["மண + பந்தல்", "மணப் + பந்தல்", "மணம் + தளம்"] },
  { word: "மணமகன்", split: "மணம் + மகன்", en: "Bridegroom", alt: ["மண + மகன்", "மணப் + மகன்", "மணம் + நகன்"] },
  { word: "மணமகள்", split: "மணம் + மகள்", en: "Bride", alt: ["மண + மகள்", "மணப் + மகள்", "மணம் + பகல்"] },
  { word: "மக்கள் நலம்", split: "மக்கள் + நலம்", en: "Public welfare", alt: ["மக்க + நலம்", "மக்கள் + பலம்", "மக்கப் + நலம்"] }
];

sec5Compounds.forEach((c, idx) => {
  const opts = [c.split, ...c.alt].sort();
  items.push({
    id: `s2-as3-s5-q${idx + 1}`,
    sectionId: "sec-5",
    sectionTitle: "பிரிவு 5: புணர்ச்சிச் சொல் பிரித்துப் படிக்க",
    type: "reading",
    category: `பிரிவு 5: புணர்ச்சிச் சொல் ${idx + 1}`,
    questionTa: `${c.word} = ${c.split}`,
    meaningEn: `${c.word} (${c.en}) → பிரித்து எழுதுக: ${c.split}`,
    translit: `${c.word} = ${c.split}`,
    options: opts,
    correctAnswer: c.split,
    explanation: `${c.word} என்பதை '${c.split}' எனப் பிரிக்க வேண்டும்.`
  });
});

// ==================== SECTION 6 ====================
items.push({
  id: "s2-as3-s6-q1",
  sectionId: "sec-6",
  sectionTitle: "பிரிவு 6: ர, ற மற்றும் ல, ள, ழ இலக்கண வேறுபாடுகள்",
  type: "reading",
  category: "பிரிவு 6: 'ர' (ரகரம் - இடையினம்)",
  questionTa: "'ர' (ரகரம்): இடையின மெய்யெழுத்து. இது சொல்லின் முதலெழுத்தாக வராது, ஆனால் சொல்லின் ஈற்றெழுத்தாக வரும் (எ.கா: பார், நீர்).",
  meaningEn: "'ra' is an Idaiyinam consonant. Never starts a word, but can end words (e.g. பார், நீர்).",
  translit: "'ra' (ragaram): Idaiyinam meiyyezhuthu. Sol muthalil varaathu, eetril varum (Paar, Neer).",
  options: ["இடையின மெய்யெழுத்து (சொல் ஈற்றில் வரும்)", "வல்லின மெய்யெழுத்து (சொல் முதலிலும் வரும்)", "மெல்லின மெய்யெழுத்து", "உயிர் எழுத்து"],
  correctAnswer: "இடையின மெய்யெழுத்து (சொல் ஈற்றில் வரும்)",
  explanation: "'ர' இடையின மெய்யெழுத்து ஆகும். எ.கா: பார், நீர்."
});

items.push({
  id: "s2-as3-s6-q2",
  sectionId: "sec-6",
  sectionTitle: "பிரிவு 6: ர, ற மற்றும் ல, ள, ழ இலக்கண வேறுபாடுகள்",
  type: "reading",
  category: "பிரிவு 6: 'ற' (றகரம் - வல்லினம்)",
  questionTa: "'ற' (றகரம்): வல்லின மெய்யெழுத்து. இது சொல்லின் முதலெழுத்தாகவும் வராது, ஈற்றெழுத்தாகவும் வராது. னகரமெய்க்குப் பின் வரும் (எ.கா: மன்றம்).",
  meaningEn: "'Rra' is a Vallinam consonant. Never starts or ends words; follows 'n' (e.g. மன்றம்).",
  translit: "'Rra' (rragaram): Vallinam meiyyezhuthu. Sol muthalilum eetrilum varaathu (Manram).",
  options: ["வல்லின மெய்யெழுத்து (னகரமெய்க்குப் பின் வரும்)", "இடையின மெய்யெழுத்து", "மெல்லின மெய்யெழுத்து", "முதலெழுத்தாக வரும்"],
  correctAnswer: "வல்லின மெய்யெழுத்து (னகரமெய்க்குப் பின் வரும்)",
  explanation: "'ற' வல்லின மெய்யெழுத்து. சொல்லின் முதலிலும் ஈற்றிலும் வராது. எ.கா: மன்றம், தென்றல்."
});

items.push({
  id: "s2-as3-s6-q3",
  sectionId: "sec-6",
  sectionTitle: "பிரிவு 6: ர, ற மற்றும் ல, ள, ழ இலக்கண வேறுபாடுகள்",
  type: "reading",
  category: "பிரிவு 6: 'ல' (மேல்நோக்கு லகரம்)",
  questionTa: "'ல' (மேல்நோக்கு லகரம் / ஒற்றை லகரம்): நாவின் நுனி மேல்வாய் பல்லின் அடியைத் தொடுவதால் பிறக்கிறது (எ.கா: மல்லி, வேலை).",
  meaningEn: "'la' is produced when the tongue tip touches the base of the upper front teeth (e.g. மல்லி, வேலை).",
  translit: "'la' (Melnokku lagaram): Naavin nuni melvaai pallin adiyai thoduvathaal pirakkirathu (Malli, Velai).",
  options: ["நாவின் நுனி மேல்வாய் பல்லின் அடியைத் தொடுவதால் பிறக்கிறது", "நாவின் நுனி மேல்வாயின் நடுப்பகுதியைத் தடவுவதால் பிறக்கிறது", "நாக்கு மேல்நோக்கி வளைந்து காற்றில் பிறக்கிறது", "இதழ்கள் குவிவதால் பிறக்கிறது"],
  correctAnswer: "நாவின் நுனி மேல்வாய் பல்லின் அடியைத் தொடுவதால் பிறக்கிறது",
  explanation: "'ல' உச்சரிக்கும் போது நாக்கு மேல்வரிசைப் பல்லின் அடியைத் தொடும்."
});

items.push({
  id: "s2-as3-s6-q4",
  sectionId: "sec-6",
  sectionTitle: "பிரிவு 6: ர, ற மற்றும் ல, ள, ழ இலக்கண வேறுபாடுகள்",
  type: "reading",
  category: "பிரிவு 6: 'ள' (கீழ்நோக்கு ளகரம் / பொது ளகரம்)",
  questionTa: "'ள' (கீழ்நோக்கு ளகரம் / பொது ளகரம்): நாவின் நுனி மேல்வாயின் நடுப்பகுதியைத் தடவுவதால் (வருடுவதால்) பிறக்கிறது (எ.கா: குளம், வேளை).",
  meaningEn: "'lla' is produced when the tongue tip rubs against the middle palate (e.g. குளம், வேளை).",
  translit: "'lla' (Keezhnokku lagaram): Naavin nuni melvaayin naduppagudhiyai varuduvathaal pirakkirathu.",
  options: ["நாவின் நுனி மேல்வாயின் நடுப்பகுதியைத் தடவுவதால் பிறக்கிறது", "பல்லின் அடியைத் தொடுவதால் பிறக்கிறது", "நாக்கு மேல்நோக்கி வளைந்து காற்றில் பிறக்கிறது", "தொண்டையிலிருந்து பிறக்கிறது"],
  correctAnswer: "நாவின் நுனி மேல்வாயின் நடுப்பகுதியைத் தடவுவதால் பிறக்கிறது",
  explanation: "'ள' உச்சரிக்கும் போது நாவின் நுனி மேல்வாயின் நடுப்பகுதியை வருட வேண்டும்."
});

items.push({
  id: "s2-as3-s6-q5",
  sectionId: "sec-6",
  sectionTitle: "பிரிவு 6: ர, ற மற்றும் ல, ள, ழ இலக்கண வேறுபாடுகள்",
  type: "reading",
  category: "பிரிவு 6: 'ழ' (சிறப்பு ழகரம்)",
  questionTa: "'ழ' (சிறப்பு ழகரம்): நாவின் நுனி மேல்நோக்கி வளைந்து, மேல்வாய் அண்ணத்தைத் தொடாமல் காற்று இடைவெளியில் பிறக்கிறது. இது தமிழின் சிறப்பு எழுத்து! (எ.கா: தமிழ், பழம்)",
  meaningEn: "'zha' is the unique Tamil retroflex consonant, produced by curling the tongue tip upwards without touching the palate (e.g. தமிழ், பழம்).",
  translit: "'zha' (Sirappu zhagaram): Naavin nuni melnokki valainthu thodamal kaatril pirakkirathu (Thamizh, Pazham).",
  options: ["நாக்கு அண்ணத்தைத் தொடாமல் காற்று இடைவெளியில் பிறக்கிறது", "பல்லின் அடியைத் தொடுகிறது", "மேல்வாயின் நடுப்பகுதியைத் தொடுகிறது", "இதழ்களை மூடிப் பிறக்கிறது"],
  correctAnswer: "நாக்கு அண்ணத்தைத் தொடாமல் காற்று இடைவெளியில் பிறக்கிறது",
  explanation: "'ழ' தமிழ்மொழிக்கே உரிய தனிச்சிறப்பு எழுத்து ஆகும்!"
});

// ==================== SECTION 7 ====================
// Tongue Twister
items.push({
  id: "s2-as3-s7-q1",
  sectionId: "sec-7",
  sectionTitle: "பிரிவு 7: நாநெகிழ் பயிற்சி & மயங்கொலிச் சொற்கள்",
  type: "reading",
  category: "பிரிவு 7: நாநெகிழ் பயிற்சி (Tongue Twister)",
  questionTa: "வாழைப்பழத் தோல் வழுக்கி வீழ்ந்தான், எழுந்தான், அழுதான்.",
  meaningEn: "He slipped on a banana peel, fell down, got up, and cried. (Tamil Tongue Twister)",
  translit: "Vaazhaippazhath thol vazhukki veezhnthaan, ezhunthaan, azhuthaan.",
  options: [
    "வாழைப்பழத் தோல் வழுக்கி வீழ்ந்தான், எழுந்தான், அழுதான்.",
    "வாழைப்பழத் தோல் தழுவி நின்றான், சிரித்தான்.",
    "ஆலமரத் தோல் வழுக்கி வீழ்ந்தான், எழுந்தான்.",
    "மாம்பழத் தோல் வழுக்கி விழுந்தான், எழுந்தான்."
  ],
  correctAnswer: "வாழைப்பழத் தோல் வழுக்கி வீழ்ந்தான், எழுந்தான், அழுதான்.",
  explanation: "ழ கர உச்சரிப்புக்கான புகழ்மிக்க நாநெகிழ் பயிற்சி வாக்கியம்!"
});

// Minimal Pairs
const sec7Pairs = [
  { pair: "அரம் — அறம்", ta: "அரம் (Filing tool) — அறம் (Virtue / Righteousness)", en: "Aram (Tool) vs Aram (Virtue)", ans: "அரம் = அரம் / கருவி, அறம் = நற்செயல்", alt: ["அரம் = மரம், அறம் = பழம்", "அரம் = பயம், அறம் = கோபம்", "அரம் = ஆசை, அறம் = பாசம்"] },
  { pair: "மரம் — மறம்", ta: "மரம் (Tree) — மறம் (Valor / Bravery)", en: "Maram (Tree) vs Maram (Valor)", ans: "மரம் = தாவர மரம், மறம் = வீரம்", alt: ["மரம் = கல், மறம் = மண்", "மரம் = கடல், மறம் = ஆறு", "மரம் = காற்று, மறம் = நிலம்"] },
  { pair: "அர — அற", ta: "அர (Grind / Sharpen) — அற (Cut / Severely)", en: "Ara (Grind) vs Arra (Cut)", ans: "அர = அரைத்தல், அற = அறுத்தல் / முற்றிலும்", alt: ["அர = ஓடுதல், அற = நடத்தல்", "அர = தூங்குதல், அற = விழித்தல்", "அர = பாடுதல், அற = ஆடுதல்"] },
  { pair: "இர — இற", ta: "இர (Beg / Seek aid) — இற (Die / Pass away)", en: "Ira (Beg) vs Irra (Die)", ans: "இர = இரந்து கேட்பது, இற = இறந்து போதல்", alt: ["இர = பிறத்தல், இற = வாழ்தல்", "இர = ஓடுதல், இற = நிற்பது", "இர = சிரித்தல், இற = அழுதல்"] },
  { pair: "ஈரம் — ஈறம்", ta: "ஈரம் (Wet / Moisture) — ஈறம் (Gums of teeth)", en: "Eeram (Wet) vs Eeram (Gums)", ans: "ஈரம் = குளிர்ச்சி / நீர்மை, ஈறம் = பல் ஈறு", alt: ["ஈரம் = தீ, ஈறம் = காற்று", "ஈரம் = வெளிச்சம், ஈறம் = இருள்", "ஈரம் = இனிப்பு, ஈறம் = கசப்பு"] },
  { pair: "கர — கற", ta: "கர (To hide) — கற (Milk from cow)", en: "Kara (To hide) vs Karra (Milk)", ans: "கர = மறைத்தல், கற = பால் கறத்தல்", alt: ["கர = திறத்தல், கற = மூடுதல்", "கர = ஏறுதல், கற = இறங்குதல்", "கர = கொடுத்தல், கற = வாங்குதல்"] },
  { pair: "பலம் — பழம்", ta: "பலம் (Power / Strength) — பழம் (Fruit)", en: "Balam (Power) vs Pazham (Fruit)", ans: "பலம் = வலிமை, பழம் = கனி", alt: ["பலம் = காய், பழம் = இலை", "பலம் = காற்று, பழம் = நீர்", "பலம் = குளம், பழம் = ஏரி"] },
  { pair: "அலம் — அளம்", ta: "அலம் (Plough) — அளம் (Salt pan)", en: "Alam (Plough) vs Allam (Salt pan)", ans: "அலம் = கலப்பை, அளம் = உப்பளம்", alt: ["அலம் = சக்கரம், அளம் = கயிறு", "அலம் = வீடு, அளம் = காடு", "அலம் = மலர், அளம் = பழம்"] },
  { pair: "கலம் — களம்", ta: "கலம் (Vessel / Ship) — களம் (Field / Arena)", en: "Kalam (Ship/Vessel) vs Kallam (Field)", ans: "கலம் = பாத்திரம் / கப்பல், களம் = போர்க்களம் / மைதானம்", alt: ["கலம் = காடு, களம் = மலை", "கலம் = இரவு, களம் = பகல்", "கலம் = கல், களம் = மணல்"] },
  { pair: "வலம் — வளம்", ta: "வலம் (Right side) — வளம் (Prosperity)", en: "Valam (Right) vs Vallam (Prosperity)", ans: "வலம் = வலப்பக்கம், வளம் = செல்வம் / செழிப்பு", alt: ["வலம் = இடப்பக்கம், வளம் = வறுமை", "வலம் = மேல், வளம் = கீழ்", "வலம் = உள்ளே, வளம் = வெளியே"] },
  { pair: "தலம் — தளம்", ta: "தலம் (Place / Holy spot) — தளம் (Floor / Platform)", en: "Thalam (Place) vs Thallam (Floor)", ans: "தலம் = புண்ணிய இடம், தளம் = மாடித்தளம் / மேடை", alt: ["தலம் = மேகம், தளம் = மழை", "தலம் = நிலவு, தளம் = சூரியன்", "தலம் = விதை, தளம் = செடி"] },
  { pair: "கழம் — தழம்", ta: "கழம் (Ancient weight) — தழம் (Scar / Mark)", en: "Kazham (Ancient weight) vs Thazham (Scar)", ans: "கழம் = பண்டைய எடை அளவு, தழம் = தழும்பு / அடையாளம்", alt: ["கழம் = மரம், தழம் = செடி", "கழம் = கண், தழம் = காது", "கழம் = ஆடை, தழம் = நகை"] }
];

sec7Pairs.forEach((p, idx) => {
  const opts = [p.ans, ...p.alt].sort();
  items.push({
    id: `s2-as3-s7-q${idx + 2}`,
    sectionId: "sec-7",
    sectionTitle: "பிரிவு 7: நாநெகிழ் பயிற்சி & மயங்கொலிச் சொற்கள்",
    type: "reading",
    category: `பிரிவு 7: மயங்கொலி ${p.pair}`,
    questionTa: p.ta,
    meaningEn: p.en,
    translit: p.pair,
    options: opts,
    correctAnswer: p.ans,
    explanation: `${p.pair} வேறுபாடு: ${p.ans}`
  });
});

console.log("Total generated items for Stage 2 Assignment 3:", items.length);

const targetModule = data.find(m => m.id === "pdf-stage2-assign3");
if (targetModule) {
  targetModule.title = "Stage 2 - ஒப்படைப்பு 3 (Stage 2-Assignment 3.pdf)";
  targetModule.subtitle = "7 முழுப் பிரிவுகள்: உயிர்மெய் எழுத்துகள், சொற்கள், வாக்கியங்கள், கதைகள், புணர்ச்சி, இலக்கணம், நாநெகிழ் பயிற்சி";
  targetModule.badge = "📙 ஒப்படைப்பு 3 · 7 பிரிவுகள்";
  targetModule.sections = sections;
  targetModule.items = items;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log("Successfully updated data/reading_club/pdf_lessons.json!");
} else {
  console.error("Module pdf-stage2-assign3 not found!");
}
