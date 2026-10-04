/**
 * Tamil-Translate-Kids - Aathichudi Reading & Speech Studio
 * Complete 109 Verses of Avvaiyar's Aathichudi by letter sections (வருக்கம்)
 * Features live speech-to-text typing effect, audio pronunciation, matching, and stars!
 */
(function () {
  const SECTIONS = [
    { id: "all", name: "அனைத்து பாடல்கள் (All 109)", start: 1, end: 109 },
    { id: "uyir", name: "1. உயிர் வருக்கம் (அ - ஔ, ஃ · 1-13)", start: 1, end: 13 },
    { id: "uyirmei", name: "2. உயிர்மெய் வருக்கம் (14-31)", start: 14, end: 31 },
    { id: "kagara", name: "3. ககர வருக்கம் (க - கௌ · 32-43)", start: 32, end: 43 },
    { id: "sagara", name: "4. சகர வருக்கம் (ச - சோ · 44-54)", start: 44, end: 54 },
    { id: "tagara", name: "5. தகர வருக்கம் (த - தோ · 55-65)", start: 55, end: 65 },
    { id: "nagara", name: "6. நகர வருக்கம் (ந - நோ · 66-76)", start: 66, end: 76 },
    { id: "bagara", name: "7. பகர வருக்கம் (ப - போ · 77-87)", start: 77, end: 87 },
    { id: "magara", name: "8. மகர வருக்கம் (ம - மோ · 88-98)", start: 88, end: 98 },
    { id: "vagara", name: "9. வகர வருக்கம் (வ - வௌ · 99-109)", start: 99, end: 109 }
  ];

  const VERSES = [
    // 1. உயிர் வருக்கம் (1-13)
    { id: 1, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "அ", line: "அறம் செய விரும்பு", meaningTa: "தர்மம் மற்றும் நற்செயல்களை மனதார விரும்பிச் செய்ய வேண்டும்.", meaningEn: "Always desire to do charitable and righteous deeds." },
    { id: 2, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "ஆ", line: "ஆறுவது சினம்", meaningTa: "கோபத்தைத் தணித்துக் கொள்ள வேண்டும்; கோபத்தை வளர்க்கக் கூடாது.", meaningEn: "Anger should be cooled down and controlled." },
    { id: 3, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "இ", line: "இயல்வது கரவேல்", meaningTa: "உன்னால் முடிந்த உதவியைப் பிறருக்கு மறைக்காமல் செய்.", meaningEn: "Help others to the best of your ability without concealing." },
    { id: 4, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "ஈ", line: "ஈவது விலக்கேல்", meaningTa: "ஒருவர் மற்றவருக்குத் தானம் கொடுப்பதைத் தடுக்காதே.", meaningEn: "Do not prevent anyone from giving charity to others." },
    { id: 5, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "உ", line: "உடையது விளம்பேல்", meaningTa: "உனக்குள்ள பொருள் மற்றும் செல்வத்தைப் பற்றித் தற்பெருமையாகப் பேசாதே.", meaningEn: "Do not boast about your wealth or possessions." },
    { id: 6, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "ஊ", line: "ஊக்கமது கைவிடேல்", meaningTa: "எப்போதும் உற்சாகத்தையும் விடாமுயற்சியையும் கைவிடாதே.", meaningEn: "Never give up your enthusiasm and perseverance." },
    { id: 7, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "எ", line: "எண் எழுத்து இகழேல்", meaningTa: "கணிதத்தையும் மொழியறிவையும் வீண் என்று புறக்கணிக்காமல் படி.", meaningEn: "Do not disregard arithmetic and literature / learning." },
    { id: 8, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "ஏ", line: "ஏற்பது இகழ்ச்சி", meaningTa: "பிறரிடம் சென்று கையேந்தி யாசிப்பது மிகவும் இழிவானது.", meaningEn: "Begging from others is dishonorable and shameful." },
    { id: 9, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "ஐ", line: "ஐயமிட்டு உண்", meaningTa: "பசித்திருக்கும் ஏழைகளுக்கு உணவு கொடுத்த பிறகே நீ உண்ண வேண்டும்.", meaningEn: "Feed the needy before you eat your meal." },
    { id: 10, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "ஒ", line: "ஒப்புரவு ஒழுகு", meaningTa: "உலக நடையறிந்து நல்வழியில் அனைவரோடும் பொருந்தி வாழ்.", meaningEn: "Live in harmony with the ways of the good world." },
    { id: 11, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "ஓ", line: "ஓதுவது ஒழியேல்", meaningTa: "நல்ல நூல்களை நாள்தோறும் கற்பதை நிறுத்தாதே.", meaningEn: "Never stop studying and acquiring good knowledge." },
    { id: 12, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "ஔ", line: "ஔவியம் பேசேல்", meaningTa: "யாரிடமும் பொறாமை கொண்டு பேசாதே.", meaningEn: "Do not speak out of jealousy or envy." },
    { id: 13, section: "uyir", sectionName: "உயிர் வருக்கம்", letter: "ஃ", line: "அஃகம் சுருக்கேல்", meaningTa: "அதிக லாபத்திற்காகத் தானியங்களை அல்லது பொருட்களைக் குறைத்து விற்காதே.", meaningEn: "Do not cheat by reducing the measure of grains or goods." },

    // 2. உயிர்மெய் வருக்கம் (14-31)
    { id: 14, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "க", line: "கண்டு ஒன்று சொல்லேல்", meaningTa: "கண்ணால் கண்ட உண்மைக்கு மாறாகப் பொய் சாட்சி சொல்லாதே.", meaningEn: "Do not lie against what you have personally witnessed." },
    { id: 15, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "ங", line: "ஙப் போல் வளை", meaningTa: "பெரியவர்களுக்குப் பணிவாக இரு; சுற்றத்தாரைத் தழுவி வாழ்.", meaningEn: "Be humble like the letter 'Nga' and embrace your kin." },
    { id: 16, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "ச", line: "சனி நீராடு", meaningTa: "நாள்தோறும் குளிர்ந்த நீரில் தவறாமல் குளித்து உடலைப் பேணு.", meaningEn: "Bathe regularly in cool water to stay fresh and healthy." },
    { id: 17, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "ஞ", line: "ஞயம்பட உரை", meaningTa: "கேட்பவருக்கு இன்பம் தரும் வகையில் இனிமையாகவும் நயமாகவும் பேசு.", meaningEn: "Speak pleasantly, courteously, and sweetly to all." },
    { id: 18, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "இ", line: "இடம்பட வீடு எடேல்", meaningTa: "உன் தேவைக்கு அதிகமாக ஆடம்பரமாக வீடு கட்டாதே.", meaningEn: "Do not build a house excessively large beyond your needs." },
    { id: 19, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "இ", line: "இணக்கம் அறிந்து இணங்கு", meaningTa: "ஒருவரின் நற்குணங்களை நன்கு அறிந்து கொண்டு அவருடன் நட்பு கொள்.", meaningEn: "Know a person's character well before befriending them." },
    { id: 20, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "த", line: "தந்தை தாய்ப் பேண்", meaningTa: "உன் தாய் தந்தையரை வாழ்நாள் முழுவதும் அன்போடு பாதுகாத்து ஆதரி.", meaningEn: "Cherish, respect, and care for your mother and father." },
    { id: 21, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "ந", line: "நன்றி மறவேல்", meaningTa: "பிறர் உனக்குச் செய்த நன்மையை ஒருபோதும் மறவாதே.", meaningEn: "Never forget the timely help and kindness done by others." },
    { id: 22, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "ப", line: "பருவத்தே பயிர் செய்", meaningTa: "எந்த ஒரு செயலையும் அதற்குரிய தகுந்த காலத்திலேயே செய்.", meaningEn: "Do every activity at its proper and opportune time." },
    { id: 23, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "ம", line: "மண் பறித்து உண்ணேல்", meaningTa: "பிறர் நிலத்தையோ உடைமையையோ அபகரித்து வாழாதே.", meaningEn: "Do not snatch others' land or wealth to make a living." },
    { id: 24, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "இ", line: "இயல்பு அலாதன செய்யேல்", meaningTa: "நல்லொழுக்கத்துக்கு மாறான தவறான செயல்களைச் செய்யாதே.", meaningEn: "Do not engage in indecent or immoral actions." },
    { id: 25, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "அ", line: "அரவம் ஆடேல்", meaningTa: "பாம்புகளைப் பிடித்து விளையாடுவது போன்ற ஆபத்தான செயல்களைச் செய்யாதே.", meaningEn: "Do not play with dangerous snakes or life threats." },
    { id: 26, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "இ", line: "இலவம் பஞ்சில் துயில்", meaningTa: "மென்மையான இலவம் பஞ்சினால் ஆன படுக்கையில் உறங்கு.", meaningEn: "Sleep comfortably on a healthy, soft cotton mattress." },
    { id: 27, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "வ", line: "வஞ்சகம் பேசேல்", meaningTa: "கபடமான, வஞ்சகமான பொய் வார்த்தைகளைப் பேசாதே.", meaningEn: "Do not utter deceitful or malicious words." },
    { id: 28, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "அ", line: "அழகு அலாதன செய்யேல்", meaningTa: "இழிவான, அருவருக்கத்தக்க செயல்களைச் செய்யாதே.", meaningEn: "Do not indulge in disgraceful, unbecoming deeds." },
    { id: 29, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "இ", line: "இளமையில் கல்", meaningTa: "இளமைப் பருவத்திலேயே கல்வி மற்றும் நல்லறிவைத் தவறாமல் கற்றுக்கொள்.", meaningEn: "Acquire knowledge, skills, and morals in your youth." },
    { id: 30, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "அ", line: "அறனை மறவேல்", meaningTa: "இறைவனையும் நல்வழியையும் மனதால் எப்போதும் மறக்காதே.", meaningEn: "Never forget righteousness and the Divine in your life." },
    { id: 31, section: "uyirmei", sectionName: "உயிர்மெய் வருக்கம்", letter: "அ", line: "அனந்தம் ஆடேல்", meaningTa: "அளவுக்கு அதிகமாகத் தூங்காதே; ஆபத்தான கடலில் விளையாடாதே.", meaningEn: "Do not oversleep or indulge in reckless ocean deeps." },

    // 3. ககர வருக்கம் (32-43)
    { id: 32, section: "kagara", sectionName: "ககர வருக்கம்", letter: "க", line: "கடிவது மற", meaningTa: "பிறரைக் கோபமாகக் கடிந்து பேசுவதை மறந்து விடு.", meaningEn: "Avoid scolding, rebuking, or speaking harshly to others." },
    { id: 33, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கா", line: "காப்பது விரதம்", meaningTa: "தொடங்கிய நற்செயலையும் பிற உயிர்களையும் காப்பதே தவமாகும்.", meaningEn: "Protecting living beings and keeping promises is true virtue." },
    { id: 34, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கி", line: "கிழமைப் பட வாழ்", meaningTa: "பிறருக்கு உதவி செய்து அன்போடு உரிமையுடன் வாழ்.", meaningEn: "Live benevolently by being helpful and affectionate to all." },
    { id: 35, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கீ", line: "கீழ்மை அகற்று", meaningTa: "இழிவான குணங்களையும் கெட்ட பழக்கங்களையும் அகற்றிவிடு.", meaningEn: "Eradicate mean, lowly thoughts and bad habits." },
    { id: 36, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கு", line: "குணமது கைவிடேல்", meaningTa: "நன்மை தரக்கூடிய நற்குணங்களை எப்போதும் கைவிடாதே.", meaningEn: "Never abandon your good character and moral qualities." },
    { id: 37, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கூ", line: "கூடிப் பிரியேல்", meaningTa: "நல்லவரோடு கொண்ட நட்பை அற்ப காரணத்திற்காகப் பிரியாதே.", meaningEn: "Do not break ties with true and genuine friends." },
    { id: 38, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கெ", line: "கெடுப்பது ஒழி", meaningTa: "பிறருக்குத் தீங்கு விளைவிக்கும் எண்ணத்தையும் செயலையும் ஒழித்துவிடு.", meaningEn: "Give up harming or causing misfortune to anyone." },
    { id: 39, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கே", line: "கேள்வி முயல்", meaningTa: "அறிஞர்கள் கூறும் நல்லறிவு நூல்களின் கருத்துகளைக் கேட்க முயற்சி செய்.", meaningEn: "Constantly strive to listen to the words of the wise." },
    { id: 40, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கை", line: "கைவினை கரவேல்", meaningTa: "உனக்குத் தெரிந்த கைத்தொழிலை மறைக்காமல் செய்து பயன் பெறு.", meaningEn: "Do not conceal your crafts; practice your trade diligently." },
    { id: 41, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கொ", line: "கொள்ளை விரும்பேல்", meaningTa: "பிறர் பொருளைத் திருடுவதையோ அபகரிப்பதையோ விரும்பாதே.", meaningEn: "Never desire to steal, rob, or loot what belongs to others." },
    { id: 42, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கோ", line: "கோதாட்டு ஒழி", meaningTa: "குற்றமும் தீமையும் தரும் தவறான விளையாட்டுகளை விட்டுவிடு.", meaningEn: "Abstain from harmful, dangerous, or sinful games." },
    { id: 43, section: "kagara", sectionName: "ககர வருக்கம்", letter: "கௌ", line: "கௌவை அகற்று", meaningTa: "வாழ்க்கையில் ஏற்படும் துன்பங்களையும் பழிச்சொல்லையும் நீக்கு.", meaningEn: "Dispel worries, distress, and scandalous speech." },

    // 4. சகர வருக்கம் (44-54)
    { id: 44, section: "sagara", sectionName: "சகர வருக்கம்", letter: "ச", line: "சக்கர நெறி நில்", meaningTa: "நாட்டுச் சட்டம் மற்றும் தர்மத்தின் நெறிப்படி வாழ்.", meaningEn: "Follow the rule of law and righteous governance." },
    { id: 45, section: "sagara", sectionName: "சகர வருக்கம்", letter: "சா", line: "சான்றோர் இனத்து இரு", meaningTa: "அறிவொழுக்கங்களில் சிறந்த பெரியோர்களுடன் சேர்ந்து இரு.", meaningEn: "Associate and keep company with wise, noble elders." },
    { id: 46, section: "sagara", sectionName: "சகர வருக்கம்", letter: "சி", line: "சித்திரம் பேசேல்", meaningTa: "பொய்யான செய்திகளை உண்மை போலப் புனைந்து பேசாதே.", meaningEn: "Do not fabricate fancy lies as though they were truth." },
    { id: 47, section: "sagara", sectionName: "சகர வருக்கம்", letter: "சீ", line: "சீர்மை மறவேல்", meaningTa: "புகழுக்குக் காரணமான நல்ல ஒழுக்கத்தை மறந்து விடாதே.", meaningEn: "Do not forget dignity, honor, and righteous conduct." },
    { id: 48, section: "sagara", sectionName: "சகர வருக்கம்", letter: "சு", line: "சுளிக்கச் சொல்லேல்", meaningTa: "கேட்பவருக்குக் கோபமும் முகச்சுளிப்பும் உண்டாகும்படி பேசாதே.", meaningEn: "Do not utter words that irritate or upset the listener." },
    { id: 49, section: "sagara", sectionName: "சகர வருக்கம்", letter: "சூ", line: "சூது விரும்பேல்", meaningTa: "சூதாட்டத்தை ஒருபோதும் விரும்பாதே; அது அழிவைத் தரும்.", meaningEn: "Never indulge in or desire the vice of gambling." },
    { id: 50, section: "sagara", sectionName: "சகர வருக்கம்", letter: "செ", line: "செய்வன திருந்தச் செய்", meaningTa: "செய்யும் ஒவ்வொரு செயலையும் பிழையின்றிச் சிறப்பாகச் செய்.", meaningEn: "Whatever task you undertake, do it thoroughly and neatly." },
    { id: 51, section: "sagara", sectionName: "சகர வருக்கம்", letter: "சே", line: "சேரிடம் அறிந்து சேர்", meaningTa: "நல்ல குணம் உடையவர்களை நன்கு அறிந்து அவர்களோடு பழகு.", meaningEn: "Choose good companionship and proper places wisely." },
    { id: 52, section: "sagara", sectionName: "சகர வருக்கம்", letter: "சை", line: "சை எனத் திரியேல்", meaningTa: "உலகம் 'சீ' என்று இகழும் வண்ணம் ஊர் சுற்றாதே.", meaningEn: "Do not wander aimlessly earning the disgust of society." },
    { id: 53, section: "sagara", sectionName: "சகர வருக்கம்", letter: "சொ", line: "சொல் சோர்வு படேல்", meaningTa: "பிறரிடம் பேசும் போது வாக்குத் தவறாமல் உறுதியாகப் பேசு.", meaningEn: "Do not falter, weaken, or go back on your promises." },
    { id: 54, section: "sagara", sectionName: "சகர வருக்கம்", letter: "சோ", line: "சோம்பித் திரியேல்", meaningTa: "எந்த முயற்சியும் செய்யாமல் சோம்பேறியாகத் திரியாதே.", meaningEn: "Do not roam around idly without purposeful effort." },

    // 5. தகர வருக்கம் (55-65)
    { id: 55, section: "tagara", sectionName: "தகர வருக்கம்", letter: "த", line: "தக்கோன் எனத் திரி", meaningTa: "பெரியோர்கள் உன்னை நல்லவன் என்று புகழும்படி வாழ்.", meaningEn: "Conduct yourself so that everyone considers you worthy and noble." },
    { id: 56, section: "tagara", sectionName: "தகர வருக்கம்", letter: "தா", line: "தானமது விரும்பு", meaningTa: "இல்லாதவர்க்குத் தானம் செய்வதை மனதார விரும்பு.", meaningEn: "Cherish the spirit of giving alms and charity to the needy." },
    { id: 57, section: "tagara", sectionName: "தகர வருக்கம்", letter: "தி", line: "திருமாலுக்கு அடிமை செய்", meaningTa: "இறைவனுக்கு உண்மையான பக்தியோடு தொண்டு செய்.", meaningEn: "Render sincere devotion and service to the Divine." },
    { id: 58, section: "tagara", sectionName: "தகர வருக்கம்", letter: "தீ", line: "தீவினை அகற்று", meaningTa: "பாவமும் துன்பமும் தரும் தீய செயல்களைச் செய்யாதே.", meaningEn: "Cast away all wicked and harmful deeds." },
    { id: 59, section: "tagara", sectionName: "தகர வருக்கம்", letter: "து", line: "துன்பத்திற்கு இடங்கொடேல்", meaningTa: "முயற்சியில் வரும் துன்பத்தைக் கண்டு மனம் தளராதே.", meaningEn: "Do not surrender to distress or give in to sadness." },
    { id: 60, section: "tagara", sectionName: "தகர வருக்கம்", letter: "தூ", line: "தூக்கி வினை செய்", meaningTa: "செயலின் நன்மை தீமைகளை நன்கு சிந்தித்து ஆராய்ந்து தொடங்கு.", meaningEn: "Weigh pros and cons carefully before acting on any matter." },
    { id: 61, section: "tagara", sectionName: "தகர வருக்கம்", letter: "தெ", line: "தெய்வம் இகழேல்", meaningTa: "இறைவனையும் வழிபாட்டையும் பழிக்காதே.", meaningEn: "Do not blaspheme or show disrespect to God." },
    { id: 62, section: "tagara", sectionName: "தகர வருக்கம்", letter: "தே", line: "தேசத்தோடு ஒத்து வாழ்", meaningTa: "உன் நாட்டின் மக்களோடு ஒற்றுமையாகவும் அமைதியாகவும் வாழ்.", meaningEn: "Live in unity, peace, and harmony with your countrymen." },
    { id: 63, section: "tagara", sectionName: "தகர வருக்கம்", letter: "தை", line: "தையல் சொல் கேளேல்", meaningTa: "ஆராய்ந்து பார்க்காமல் பெண்களின் பிழையான சொல்லைக் கேட்காதே.", meaningEn: "Do not act blindly on rash, unexamined advice." },
    { id: 64, section: "tagara", sectionName: "தகர வருக்கம்", letter: "தொ", line: "தொன்மை மறவேல்", meaningTa: "நமது பழமையான பாரம்பரியத்தையும் நற்பண்புகளையும் மறவாதே.", meaningEn: "Do not forget ancient culture, roots, and good traditions." },
    { id: 65, section: "tagara", sectionName: "தகர வருக்கம்", letter: "தோ", line: "தோற்பன தொடரேல்", meaningTa: "தோல்வி தரும் தவறான செயல்களைத் தொடர்ந்து செய்யாதே.", meaningEn: "Do not persistently pursue futile or losing ventures." },

    // 6. நகர வருக்கம் (66-76)
    { id: 66, section: "nagara", sectionName: "நகர வருக்கம்", letter: "ந", line: "நன்மை கடைப்பிடி", meaningTa: "நற்செயல்களை எத்தனை இடையூறு வந்தாலும் உறுதியாகச் செய்.", meaningEn: "Firmly hold on to doing good under all circumstances." },
    { id: 67, section: "nagara", sectionName: "நகர வருக்கம்", letter: "நா", line: "நாடு ஒப்பன செய்", meaningTa: "நாட்டில் உள்ள சான்றோர்கள் ஏற்கும் நல்ல காரியங்களைச் செய்.", meaningEn: "Perform deeds that are accepted and valued by society." },
    { id: 68, section: "nagara", sectionName: "நகர வருக்கம்", letter: "நி", line: "நிலையில் பிரியேல்", meaningTa: "உன்னுடைய நல்வொழுக்க நிலையிலிருந்து என்றும் தாழ்ந்து விடாதே.", meaningEn: "Never deviate from your steady principles and character." },
    { id: 69, section: "nagara", sectionName: "நகர வருக்கம்", letter: "நீ", line: "நீர் விளையாடேல்", meaningTa: "ஆபத்தான வெள்ள நீரிலோ பெருங்கடலிலோ இறங்கி விளையாடாதே.", meaningEn: "Do not play carelessly in dangerous swift waters." },
    { id: 70, section: "nagara", sectionName: "நகர வருக்கம்", letter: "நு", line: "நுண்மை நுகரேல்", meaningTa: "உடலுக்கு நோயைத் தரும் நொறுக்குத் தீனிகளை அதிகமாக உண்ணாதே.", meaningEn: "Avoid overeating harmful snacks that ruin health." },
    { id: 71, section: "nagara", sectionName: "நகர வருக்கம்", letter: "நூ", line: "நூல் பல கல்", meaningTa: "அறிவை வளர்க்கும் பல நல்ல நூல்களை விரும்பிப் படி.", meaningEn: "Read and master many illuminating, wholesome books." },
    { id: 72, section: "nagara", sectionName: "நகர வருக்கம்", letter: "நெ", line: "நெற்பயிர் விளை", meaningTa: "உழவுத் தொழில் செய்து தானியங்களை விளைவித்து உலகைக் காப்பாய்.", meaningEn: "Cultivate paddy and sustain the world with grain." },
    { id: 73, section: "nagara", sectionName: "நகர வருக்கம்", letter: "நே", line: "நேர்பட ஒழுகு", meaningTa: "ஒழுக்கம் தவறாமல் எப்போதும் நேர்மையான வழியில் நட.", meaningEn: "Always walk on the straight and honest moral path." },
    { id: 74, section: "nagara", sectionName: "நகர வருக்கம்", letter: "நை", line: "நைவினை நணுகேல்", meaningTa: "பிறர் உள்ளம் வருந்தும் கொடிய செயல்களைச் செய்யாதே.", meaningEn: "Do not perform hurtful deeds that cause distress to others." },
    { id: 75, section: "nagara", sectionName: "நகர வருக்கம்", letter: "நொ", line: "நொய்ய உரையேல்", meaningTa: "பயனில்லாத அற்பமான வீண் பேச்சுகளைப் பேசாதே.", meaningEn: "Do not indulge in trivial, useless, or frivolous chatter." },
    { id: 76, section: "nagara", sectionName: "நகர வருக்கம்", letter: "நோ", line: "நோய்க்கு இடங்கொடேல்", meaningTa: "சீரான உணவு, உறக்கத்தைக் கடைப்பிடித்து நோய்க்கு இடம் தராதே.", meaningEn: "Live healthily and give no room for illness to enter." },

    // 7. பகர வருக்கம் (77-87)
    { id: 77, section: "bagara", sectionName: "பகர வருக்கம்", letter: "ப", line: "பழிப்பன பகரேல்", meaningTa: "பெரியோர்களால் பழிக்கப்படும் இழிவான பொய் வார்த்தைகளைப் பேசாதே.", meaningEn: "Do not speak reprehensible or shameful words." },
    { id: 78, section: "bagara", sectionName: "பகர வருக்கம்", letter: "பா", line: "பாம்பொடு பழகேல்", meaningTa: "பாம்பு போன்ற கொடிய விஷக் குணம் உடையவர்களோடு பழகாதே.", meaningEn: "Do not keep company with treacherous, poisonous people." },
    { id: 79, section: "bagara", sectionName: "பகர வருக்கம்", letter: "பி", line: "பிழைபடச் சொல்லேல்", meaningTa: "குற்றமும் பிழையும் உண்டாகும்படி பேசாதே.", meaningEn: "Do not speak with errors, flaws, or malicious falsehood." },
    { id: 80, section: "bagara", sectionName: "பகர வருக்கம்", letter: "பீ", line: "பீடு பெற நில்", meaningTa: "புகழும் பெருமையும் தரக்கூடிய நல்வழியில் உறுதியாக நில்.", meaningEn: "Stand steadfast in honor, integrity, and greatness." },
    { id: 81, section: "bagara", sectionName: "பகர வருக்கம்", letter: "பு", line: "புகழ்ந்தாரைப் போற்றி வாழ்", meaningTa: "உன்னை நம்பி வாழ்த்தியவரைக் காத்து ஆதரித்து வாழ்.", meaningEn: "Support, protect, and cherish those who look up to you." },
    { id: 82, section: "bagara", sectionName: "பகர வருக்கம்", letter: "பூ", line: "பூமி திருத்தி உண்", meaningTa: "நிலத்தை உழுது பயிர் செய்து உழைத்து வாழ்.", meaningEn: "Cultivate the soil, farm well, and enjoy honest earnings." },
    { id: 83, section: "bagara", sectionName: "பகர வருக்கம்", letter: "பெ", line: "பெரியாரைத் துணைக் கொள்", meaningTa: "அறிவிலும் ஒழுக்கத்திலும் சிறந்த பெரியோர்களின் துணையைப் பெறு.", meaningEn: "Seek and keep the valuable guidance of wise elders." },
    { id: 84, section: "bagara", sectionName: "பகர வருக்கம்", letter: "பே", line: "பேதைமை அகற்று", meaningTa: "அறியாமையையும் மூடநம்பிக்கையையும் போக்கிக் கொள்.", meaningEn: "Cast off foolishness, superstition, and ignorance." },
    { id: 85, section: "bagara", sectionName: "பகர வருக்கம்", letter: "பை", line: "பையலோடு இணங்கேல்", meaningTa: "அறிவில்லாத மூடர்களோடு கூடித் திரியாதே.", meaningEn: "Do not keep company with foolish or wicked characters." },
    { id: 86, section: "bagara", sectionName: "பகர வருக்கம்", letter: "பொ", line: "பொருள் தனைப் போற்றி வாழ்", meaningTa: "செல்வத்தை வீண் விரயம் செய்யாமல் பாதுகாத்து வாழ்.", meaningEn: "Carefully preserve and responsibly manage your resources." },
    { id: 87, section: "bagara", sectionName: "பகர வருக்கம்", letter: "போ", line: "போர்த்தொழில் புரியேல்", meaningTa: "தேவையில்லாமல் யாரிடமும் சண்டையிடுவதை வழக்கமாகக் கொள்ளாதே.", meaningEn: "Do not engage in petty quarrels, fighting, and strife." },

    // 8. மகர வருக்கம் (88-98)
    { id: 88, section: "magara", sectionName: "மகர வருக்கம்", letter: "ம", line: "மனம் தடுமாறேல்", meaningTa: "எந்தக் கஷ்டத்திலும் உன் மன உறுதியை இழந்து தடுமாறாதே.", meaningEn: "Never let your mind waver or falter in times of adversity." },
    { id: 89, section: "magara", sectionName: "மகர வருக்கம்", letter: "மா", line: "மாற்றானுக்கு இடங்கொடேல்", meaningTa: "பகைவன் உன்னைத் துன்புறுத்த இடம் கொடுக்காதே.", meaningEn: "Give no advantage or loophole to your adversaries." },
    { id: 90, section: "magara", sectionName: "மகர வருக்கம்", letter: "மி", line: "மிகைபடச் சொல்லேல்", meaningTa: "சாதாரண விஷயங்களை மிகைப்படுத்திப் பொய்யாகக் கூறாதே.", meaningEn: "Do not exaggerate matters or boast out of proportion." },
    { id: 91, section: "magara", sectionName: "மகர வருக்கம்", letter: "மீ", line: "மீதூண் விரும்பேல்", meaningTa: "அளவுக்கு அதிகமாக அளவுக்கு மீறி உண்ண ஆசைப்படாதே.", meaningEn: "Do not desire to overeat beyond your hunger." },
    { id: 92, section: "magara", sectionName: "மகர வருக்கம்", letter: "மு", line: "முனை முகத்து நில்லேல்", meaningTa: "தேவையில்லாமல் சண்டை நடக்கும் இடத்தில் முன்னால் நிற்காதே.", meaningEn: "Do not stand on the battlefront of unnecessary quarrels." },
    { id: 93, section: "magara", sectionName: "மகர வருக்கம்", letter: "மூ", line: "மூர்க்கரோடு இணங்கேல்", meaningTa: "முரட்டு சுபாவமும் வன்முறை எண்ணமும் உள்ளவர்களோடு சேராதே.", meaningEn: "Do not associate with obstinate and violent persons." },
    { id: 94, section: "magara", sectionName: "மகர வருக்கம்", letter: "மெ", line: "மெல்லி நல்லாள் தோள்சேர்", meaningTa: "நற்குணமுடைய உத்தம மனைவியுடன் அன்போடு கூடி வாழ்.", meaningEn: "Love, honor, and live affectionately with your spouse." },
    { id: 95, section: "magara", sectionName: "மகர வருக்கம்", letter: "மே", line: "மேன்மக்கள் சொல் கேள்", meaningTa: "நல்லொழுக்கமுடைய உயர்ந்த பெரியோர்களின் அறிவுரையைக் கேட்டு நட.", meaningEn: "Heed and follow the noble guidance of great minds." },
    { id: 96, section: "magara", sectionName: "மகர வருக்கம்", letter: "மை", line: "மை விழியார் மனை அகல்", meaningTa: "ஒழுக்கமற்ற தீய சேர்க்கைகளை விட்டு விலகி நில்.", meaningEn: "Stay away from sinful places and immoral company." },
    { id: 97, section: "magara", sectionName: "மகர வருக்கம்", letter: "மொ", line: "மொழிவது அற மொழி", meaningTa: "சொல்லும் கருத்தைத் தெளிவாகவும் உண்மையாகவும் அறத்தோடும் சொல்.", meaningEn: "Speak clearly, completely, truthfully, and with virtue." },
    { id: 98, section: "magara", sectionName: "மகர வருக்கம்", letter: "மோ", line: "மோகத்தை முனி", meaningTa: "நிலையற்ற பொருட்களின் மேலுள்ள தீய ஆசையை வெறுத்து ஒதுக்கு.", meaningEn: "Denounce and conquer harmful attachments and lust." },

    // 9. வகர வருக்கம் (99-109)
    { id: 99, section: "vagara", sectionName: "வகர வருக்கம்", letter: "வ", line: "வல்லமை பேசேல்", meaningTa: "உனது சொந்த வலிமையைப் பற்றித் தற்பெருமையாகப் பேசாதே.", meaningEn: "Do not brag or boast excessively about your own strength." },
    { id: 100, section: "vagara", sectionName: "வகர வருக்கம்", letter: "வா", line: "வாது முற்கூறேல்", meaningTa: "வீணாக முந்திக்கொண்டு வாக்குவாதம் செய்யாதே.", meaningEn: "Do not rush forward to pick stubborn, vain arguments." },
    { id: 101, section: "vagara", sectionName: "வகர வருக்கம்", letter: "வி", line: "வித்தை விரும்பு", meaningTa: "கலைகளையும் கல்வியையும் அறிவையும் ஆர்வத்தோடு விரும்பு.", meaningEn: "Desire to learn, explore, and master arts and sciences." },
    { id: 102, section: "vagara", sectionName: "வகர வருக்கம்", letter: "வீ", line: "வீடு பெற நில்", meaningTa: "உயர்ந்த நற்கதி மற்றும் முக்தி அடையும் நல்வழியில் நில்.", meaningEn: "Live your life in devotion to attain spiritual liberation." },
    { id: 103, section: "vagara", sectionName: "வகர வருக்கம்", letter: "உ", line: "உத்தமனாய் இரு", meaningTa: "உயர்ந்த நற்பண்புகளும் நேர்மையும் கொண்ட உத்தமனாக வாழ்.", meaningEn: "Always be a noble person of impeccable integrity." },
    { id: 104, section: "vagara", sectionName: "வகர வருக்கம்", letter: "ஊ", line: "ஊருடன் கூடி வாழ்", meaningTa: "ஊர் மக்களோடு இணக்கமாக ஒத்துழைத்து ஒற்றுமையாக வாழ்.", meaningEn: "Live cooperatively and harmoniously with your community." },
    { id: 105, section: "vagara", sectionName: "வகர வருக்கம்", letter: "வெ", line: "வெட்டெனப் பேசேல்", meaningTa: "பிறர் மனம் நோகும்படி வெடுக்கென்று கடினமாகப் பேசாதே.", meaningEn: "Do not speak bluntly, harshly, or wound others' hearts." },
    { id: 106, section: "vagara", sectionName: "வகர வருக்கம்", letter: "வே", line: "வேண்டி வினை செயேல்", meaningTa: "வேண்டுமென்றே எவருக்கும் கெடுதலான செயல்களைச் செய்யாதே.", meaningEn: "Never intentionally perform any wicked deed." },
    { id: 107, section: "vagara", sectionName: "வகர வருக்கம்", letter: "வை", line: "வைகறைத் துயில் எழு", meaningTa: "விடியற்காலையிலேயே தூக்கத்திலிருந்து எழுந்திரு.", meaningEn: "Wake up early in the morning before dawn." },
    { id: 108, section: "vagara", sectionName: "வகர வருக்கம்", letter: "ஒ", line: "ஒன்னாரைத் தேறேல்", meaningTa: "துரோகம் செய்யும் பகைவர்களை ஒருபோதும் நம்பாதே.", meaningEn: "Never trust deceitful enemies or malicious rivals." },
    { id: 109, section: "vagara", sectionName: "வகர வருக்கம்", letter: "ஓ", line: "ஓரஞ் சொல்லேல்", meaningTa: "ஒருதலைப்பட்சமாகப் பேசாமல் நடுநிலையாகப் பேசு.", meaningEn: "Do not show unfair bias; always be impartial and just." }
  ];

  let currentSectionId = "all";
  let filteredVerses = [...VERSES];
  let currentVerseIndex = 0; // index in filteredVerses
  let isListening = false;
  let hasEvaluated = false;
  let lastSpokenTranscript = "";
  let currentMode = "read"; // 'read' | 'quiz'

  // Quick Check Quiz state
  let quizQuestions = [];
  let quizCurrentIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;

  const clean = (text) => text ? text.replace(/[.,;\n]/g, " ").replace(/\s+/g, " ").trim() : "";

  const ui = () => ({
    // Mode Switcher Tabs
    tabReadBtn: document.getElementById("aathichudi-tab-read-btn"),
    tabQuizBtn: document.getElementById("aathichudi-tab-quiz-btn"),
    readView: document.getElementById("aathichudi-read-view"),
    quizView: document.getElementById("aathichudi-quiz-view"),

    // Read View
    sectionSelect: document.getElementById("aathichudi-section-select"),
    verseSelect: document.getElementById("aathichudi-verse-select"),
    number: document.getElementById("aathichudi-number"),
    text: document.getElementById("aathichudi-text"),
    meaningTa: document.getElementById("aathichudi-meaning-ta"),
    meaningEn: document.getElementById("aathichudi-meaning-en"),
    spoken: document.getElementById("aathichudi-spoken"),
    result: document.getElementById("aathichudi-result"),
    micBtn: document.getElementById("aathichudi-mic-btn"),
    listenBtn: document.getElementById("listen-aathichudi-btn"),
    prevBtn: document.getElementById("prev-aathichudi-btn"),
    nextBtn: document.getElementById("next-aathichudi-btn"),
    manualBox: document.getElementById("aathichudi-manual-box"),
    manualInput: document.getElementById("aathichudi-manual-input"),
    manualSubmit: document.getElementById("aathichudi-manual-submit"),

    // Quiz View
    quizStepLabel: document.getElementById("aathichudi-quiz-step-label"),
    quizScoreBadge: document.getElementById("aathichudi-quiz-score-badge"),
    quizBar: document.getElementById("aathichudi-quiz-bar"),
    quizBadge: document.getElementById("aathichudi-quiz-badge"),
    quizQuestion: document.getElementById("aathichudi-quiz-question"),
    quizAudioBtn: document.getElementById("aathichudi-quiz-audio-btn"),
    quizOptions: document.getElementById("aathichudi-quiz-options"),
    quizFeedback: document.getElementById("aathichudi-quiz-feedback"),
    quizNextBtn: document.getElementById("aathichudi-quiz-next-btn")
  });

  const getCurrentVerse = () => filteredVerses[currentVerseIndex] || VERSES[0];

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

  function populateSections() {
    const controls = ui();
    if (controls.sectionSelect) {
      controls.sectionSelect.innerHTML = SECTIONS.map(
        sec => `<option value="${sec.id}">${sec.name}</option>`
      ).join("");
      controls.sectionSelect.value = currentSectionId;
    }
  }

  function populateVerses() {
    const controls = ui();
    if (!controls.verseSelect) return;
    if (currentSectionId === "all") {
      filteredVerses = [...VERSES];
    } else {
      const sec = SECTIONS.find(s => s.id === currentSectionId);
      if (sec) {
        filteredVerses = VERSES.filter(v => v.id >= sec.start && v.id <= sec.end);
      } else {
        filteredVerses = [...VERSES];
      }
    }
    if (currentVerseIndex >= filteredVerses.length) {
      currentVerseIndex = 0;
    }
    controls.verseSelect.innerHTML = filteredVerses.map((verse, idx) =>
      `<option value="${idx}">பாடல் ${verse.id}. [${verse.letter}] ${verse.line}</option>`
    ).join("");
    controls.verseSelect.value = currentVerseIndex;
  }

  function getStudentKey() {
    if (window.App && App.currentStudent) {
      return `${App.currentStudent.firstName}_${App.currentStudent.lastName}_G${App.currentStudent.grade}`;
    }
    return "guest_student";
  }

  function trackStudied(verse) {
    if (!verse) return;
    const key = `studied_aathichudi_${getStudentKey()}`;
    let studied = [];
    try { studied = JSON.parse(localStorage.getItem(key) || "[]"); } catch (_) {}
    if (!studied.includes(verse.id)) {
      studied.push(verse.id);
      localStorage.setItem(key, JSON.stringify(studied));
    }
  }

  function getStudiedIds() {
    const key = `studied_aathichudi_${getStudentKey()}`;
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (_) { return []; }
  }

  function render() {
    const verse = getCurrentVerse();
    const controls = ui();
    if (!verse || !controls.number) return;

    trackStudied(verse);

    controls.number.textContent = `பாடல் ${verse.id} · ${verse.sectionName} · எழுத்து [ ${verse.letter} ]`;
    controls.text.textContent = verse.line;
    if (controls.meaningTa) controls.meaningTa.textContent = `💡 ${verse.meaningTa}`;
    if (controls.meaningEn) controls.meaningEn.textContent = `📖 ${verse.meaningEn}`;

    if (!isListening) {
      if (controls.spoken) {
        controls.spoken.textContent = "மைக்ரோஃபோனை அழுத்தி ஆத்திசூடியை வாசியுங்கள்...";
        controls.spoken.classList.add("empty");
      }
      if (controls.result) {
        controls.result.innerHTML = `<strong>பயிற்சிக்குத் தயார்!</strong> 🎙️ மைக் பொத்தானை அழுத்திப் பேசவும்.`;
      }
      if (controls.micBtn) controls.micBtn.classList.remove("listening");
    }

    if (controls.verseSelect) controls.verseSelect.value = currentVerseIndex;
    if (controls.manualInput) controls.manualInput.value = "";
  }

  function evaluateTranscript(transcript) {
    const verse = getCurrentVerse();
    const controls = ui();
    if (!verse || !transcript) return;

    trackStudied(verse);

    const target = clean(verse.line);
    const spoken = clean(transcript);

    const match = TamilMatcher.evaluate(
      {
        tamilPrimary: target,
        variations: [target],
        keywords: target.split(" "),
        english: "ஆத்திசூடி"
      },
      spoken,
      "medium"
    );

    const stars = "★".repeat(match.stars) + "☆".repeat(3 - match.stars);
    controls.result.innerHTML = `
      <div class="result-feedback-card">
        <div><strong>நீங்கள் சொன்னது:</strong> “${transcript}”</div>
        <div class="kural-score">${match.percentage}% பொருத்தம் &nbsp; ${stars}</div>
        <div class="result-msg">${match.feedback}</div>
      </div>
    `;

    if (match.isPass) {
      if (window.KidAudioFX) {
        KidAudioFX.playSuccessFanfare();
        KidAudioFX.playStarDing(match.stars);
      }
      if (window.App) {
        App.triggerConfetti();
        App.saveProgress({
          sentenceId: `aathichudi-${verse.id}`,
          category: "aathichudi",
          score: match.percentage,
          stars: match.stars,
          passed: true
        });
      }
    } else {
      if (window.KidAudioFX) KidAudioFX.playTryAgain();
    }
  }

  // --- Dynamic Aathichudi Quick Check Engine (Prioritizes Studied Verses) ---
  function generateQuizQuestions() {
    const studiedIds = getStudiedIds();
    let candidates = VERSES.filter(v => studiedIds.includes(v.id));

    // If student studied fewer than 5, supplement with the current section's verses
    if (candidates.length < 5) {
      let sectionPool = filteredVerses.length ? filteredVerses : VERSES;
      const unstudied = sectionPool.filter(v => !studiedIds.includes(v.id));
      candidates = [...candidates, ...unstudied];
    }
    if (candidates.length < 5) {
      candidates = VERSES;
    }

    const questions = [];
    const pool = [...candidates].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(5, pool.length); i++) {
      const v = pool[i];
      const words = v.line.split(" ");
      const qType = i % 3;

      if (qType === 0 && words.length >= 2) {
        const targetWord = words[words.length - 1];
        const promptLine = words.slice(0, words.length - 1).join(" ") + " _______";
        
        const distractors = VERSES
          .filter(other => other.id !== v.id)
          .map(other => {
            const w = other.line.split(" ");
            return w[w.length - 1];
          })
          .filter(w => w && w !== targetWord);

        const uniqueDistractors = [...new Set(distractors)].sort(() => Math.random() - 0.5).slice(0, 3);
        const allOptions = [targetWord, ...uniqueDistractors].sort(() => Math.random() - 0.5);
        const ansIdx = allOptions.indexOf(targetWord);

        questions.push({
          id: `acq-${v.id}-blank`,
          badge: "விடுபட்ட சொல்லை நிரப்புக",
          question: promptLine,
          options: allOptions,
          answerIndex: ansIdx,
          explanation: `முழு பாடல்: “${v.line}” - ${v.meaningTa}`
        });
      } else if (qType === 1) {
        const targetMeaning = v.meaningTa;
        const distractorMeanings = VERSES
          .filter(other => other.id !== v.id)
          .map(other => other.meaningTa)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const allOptions = [targetMeaning, ...distractorMeanings].sort(() => Math.random() - 0.5);
        const ansIdx = allOptions.indexOf(targetMeaning);

        questions.push({
          id: `acq-${v.id}-meaning`,
          badge: "நல்வழிப் பொருள் அறிக",
          question: `‘${v.line}’ என்பதன் பொருள் என்ன?`,
          options: allOptions,
          answerIndex: ansIdx,
          explanation: `“${v.line}” - ${v.meaningTa} (${v.sectionName})`
        });
      } else {
        const correctSection = v.sectionName;
        const otherSections = SECTIONS
          .filter(s => s.name !== correctSection && s.id !== "all")
          .map(s => s.name)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const allOptions = [correctSection, ...otherSections].sort(() => Math.random() - 0.5);
        const ansIdx = allOptions.indexOf(correctSection);

        questions.push({
          id: `acq-${v.id}-sec`,
          badge: "வருக்கத்தைக் கண்டறிக",
          question: `‘${v.line}’ [${v.letter}] எந்த வருக்கப் பாடல்?`,
          options: allOptions,
          answerIndex: ansIdx,
          explanation: `பாடல் எண் ${v.id}: ${v.line} - இது ${v.sectionName} பிரிவில் வருகிறது.`
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
    if (controls.quizBadge) controls.quizBadge.textContent = q.badge || "ஆத்திசூடி வினாடி வினா";
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
        sentenceId: `aathichudi-quiz-${q.id}`,
        category: "aathichudi-quiz",
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
      controls.quizQuestion.innerHTML = `🌟 ஆத்திசூடி வினாடி வினா நிறைவு! மதிப்பெண்: <strong>${quizScore} / 100</strong> (${"★".repeat(stars)}${"☆".repeat(3 - stars)})`;
    }
    if (controls.quizOptions) {
      controls.quizOptions.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 20px; background: #f8fafc; border-radius: 16px;">
          <h3 style="font-family: var(--font-kid); font-size: 1.5rem; color: #064e3b; margin-bottom: 8px;">அருமை! ஔவையாரின் நல்வழிகளை உணர்ந்துள்ளீர்கள்! 🏆</h3>
          <p style="font-family: var(--font-tamil); color: #475569; margin-bottom: 16px;">இன்றைய ஆத்திசூடி வினாடி வினா முயற்சி உங்கள் கணக்கில் சேமிக்கப்பட்டுள்ளது.</p>
          <button class="studio-btn primary" id="restart-aathichudi-quiz-btn" style="max-width: 260px; margin: 0 auto; background: linear-gradient(135deg, #059669, #0d9488);">🔄 மீண்டும் பயிற்சி செய்க (Restart)</button>
        </div>
      `;
      const restartBtn = document.getElementById("restart-aathichudi-quiz-btn");
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

  const Aathichudi = {
    open(mode = "read") {
      populateSections();
      populateVerses();
      switchMode(mode);
    },
    switchMode,
    speak() {
      const verse = getCurrentVerse();
      if (verse && window.KidSpeechService) {
        KidSpeechService.speakTamil(verse.line);
      }
    },
    speakQuizQuestion() {
      const q = quizQuestions[quizCurrentIndex];
      if (q && window.KidSpeechService) {
        KidSpeechService.speakTamil(q.question);
      }
    },
    listen() {
      const verse = getCurrentVerse();
      const controls = ui();
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
        controls.spoken.textContent = "கேட்கிறது... ஆத்திசூடியைப் பேசவும் (Listening...)";
        controls.spoken.classList.remove("empty");
      }
      if (controls.result) {
        controls.result.innerHTML = `<span class="listening-pulse">🔴</span> <strong>கேட்கிறேன்…</strong> தெளிவாக வாசியுங்கள்.`;
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
              controls.result.innerHTML = `⚠️ குரல் சேவை கிடைக்கவில்லை (${error}). தமிழ் microphone அனுமதியைச் சரிபார்க்கவும்.`;
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
      currentVerseIndex += direction;
      if (currentVerseIndex >= filteredVerses.length) currentVerseIndex = 0;
      if (currentVerseIndex < 0) currentVerseIndex = filteredVerses.length - 1;
      render();
    },

    chooseSection(sectionId) {
      if (isListening && window.KidSpeechService) KidSpeechService.cancelListening();
      isListening = false;
      currentSectionId = sectionId;
      currentVerseIndex = 0;
      populateVerses();
      render();
    },

    chooseVerse(index) {
      if (isListening && window.KidSpeechService) KidSpeechService.cancelListening();
      isListening = false;
      currentVerseIndex = Number(index);
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

  window.AathichudiPractice = Aathichudi;

  document.addEventListener("DOMContentLoaded", () => {
    populateSections();
    populateVerses();

    const controls = ui();
    if (controls.tabReadBtn) controls.tabReadBtn.addEventListener("click", () => switchMode("read"));
    if (controls.tabQuizBtn) controls.tabQuizBtn.addEventListener("click", () => switchMode("quiz"));

    if (controls.listenBtn) controls.listenBtn.addEventListener("click", () => Aathichudi.speak());
    if (controls.micBtn) controls.micBtn.addEventListener("click", () => Aathichudi.listen());
    if (controls.prevBtn) controls.prevBtn.addEventListener("click", () => Aathichudi.next(-1));
    if (controls.nextBtn) controls.nextBtn.addEventListener("click", () => Aathichudi.next(1));
    if (controls.sectionSelect) controls.sectionSelect.addEventListener("change", (e) => Aathichudi.chooseSection(e.target.value));
    if (controls.verseSelect) controls.verseSelect.addEventListener("change", (e) => Aathichudi.chooseVerse(e.target.value));
    if (controls.manualSubmit) controls.manualSubmit.addEventListener("click", () => Aathichudi.submitManual());
    if (controls.manualInput) {
      controls.manualInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          Aathichudi.submitManual();
        }
      });
    }

    if (controls.quizAudioBtn) controls.quizAudioBtn.addEventListener("click", () => Aathichudi.speakQuizQuestion());
    if (controls.quizNextBtn) controls.quizNextBtn.addEventListener("click", () => nextQuizQuestion());
  });
}());
