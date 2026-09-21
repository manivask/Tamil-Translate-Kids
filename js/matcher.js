/**
 * Tamil-Translate-Kids - Smart Matching & Similarity Engine
 * Calculates percentage match against multiple acceptable Tamil translations,
 * accounting for word order variations, colloquial vs formal forms, and difficulty modes.
 */

const TamilMatcher = {
  // Normalize Tamil text: clean punctuation, extra spaces, common spoken contractions
  normalize(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'!’]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  // Tokenize into words
  tokenize(text) {
    const norm = this.normalize(text);
    return norm ? norm.split(" ").filter(w => w.length > 0) : [];
  },

  // Character Levenshtein distance
  levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  },

  // Character similarity (0.0 to 1.0)
  charSimilarity(str1, str2) {
    const s1 = this.normalize(str1);
    const s2 = this.normalize(str2);
    if (!s1 && !s2) return 1.0;
    if (!s1 || !s2) return 0.0;
    if (s1 === s2) return 1.0;
    const maxLen = Math.max(s1.length, s2.length);
    const dist = this.levenshtein(s1, s2);
    return Math.max(0, 1.0 - dist / maxLen);
  },

  // Word-level stem / prefix similarity
  wordSimilarity(w1, w2) {
    if (w1 === w2) return 1.0;
    if (!w1 || !w2) return 0.0;
    
    // For short words (e.g. 2-3 characters), require exact or very high similarity
    if (w1.length <= 4 || w2.length <= 4) {
      if (w1.length === w2.length && w1 !== w2) {
        return this.levenshtein(w1, w2) <= 1 ? 0.4 : 0.0;
      }
    }

    if (w1.startsWith(w2) || w2.startsWith(w1)) {
      const minLen = Math.min(w1.length, w2.length);
      const maxLen = Math.max(w1.length, w2.length);
      return Math.min(1.0, minLen / maxLen + 0.25);
    }

    return this.charSimilarity(w1, w2);
  },

  // Token-set bag-of-words similarity (Word order invariant)
  tokenSimilarity(targetText, spokenText) {
    const targetWords = this.tokenize(targetText);
    const spokenWords = this.tokenize(spokenText);

    if (targetWords.length === 0 && spokenWords.length === 0) return 1.0;
    if (targetWords.length === 0 || spokenWords.length === 0) return 0.0;

    let matchedScore = 0;
    const usedSpokenIndices = new Set();

    for (const tw of targetWords) {
      let bestWordScore = 0;
      let bestSpokenIdx = -1;

      for (let j = 0; j < spokenWords.length; j++) {
        if (usedSpokenIndices.has(j)) continue;
        const sim = this.wordSimilarity(tw, spokenWords[j]);
        if (sim > bestWordScore) {
          bestWordScore = sim;
          bestSpokenIdx = j;
        }
      }

      if (bestWordScore >= 0.65 && bestSpokenIdx !== -1) {
        matchedScore += bestWordScore;
        usedSpokenIndices.add(bestSpokenIdx);
      }
    }

    const precision = matchedScore / Math.max(1, spokenWords.length);
    const recall = matchedScore / targetWords.length;

    if (precision + recall === 0) return 0;
    return (2 * precision * recall) / (precision + recall);
  },

  // Keyword check
  keywordMatch(keywords, spokenText) {
    if (!keywords || keywords.length === 0) return 1.0;
    const spokenNorm = this.normalize(spokenText);
    const spokenTokens = this.tokenize(spokenText);
    let hitCount = 0;

    for (const kw of keywords) {
      const kwNorm = this.normalize(kw);
      if (spokenTokens.includes(kwNorm) || spokenNorm.includes(kwNorm)) {
        hitCount += 1.0;
      } else {
        const found = spokenTokens.some(st => this.wordSimilarity(kwNorm, st) >= 0.75);
        if (found) hitCount += 0.8;
      }
    }
    return hitCount / keywords.length;
  },

  // Evaluate single reference variation against spoken text
  evaluateAgainstSingle(targetVariant, spokenText, keywords) {
    const exactChar = this.charSimilarity(targetVariant, spokenText);
    const tokenScore = this.tokenSimilarity(targetVariant, spokenText);
    const kwScore = this.keywordMatch(keywords, spokenText);

    // Weighted combination:
    // Token overlap (45%) + Keywords (35%) + Char similarity (20%)
    const rawScore = tokenScore * 0.45 + kwScore * 0.35 + exactChar * 0.20;
    return Math.min(1.0, Math.max(0.0, rawScore));
  },

  /**
   * Main Match Evaluation
   * @param {Object} sentenceObj Sentence entry from SENTENCE_DATA
   * @param {string} spokenText Tamil text transcribed from kid's voice
   * @param {string} mode 'easy' | 'medium' | 'hard'
   * @returns {Object} Full match evaluation result
   */
  evaluate(sentenceObj, spokenText, mode = "medium") {
    if (!spokenText || spokenText.trim().length === 0) {
      return {
        percentage: 0,
        isPass: false,
        stars: 0,
        feedback: "எதுவும் கேட்கவில்லை. மீண்டும் பேசுங்கள்! (Didn't catch that. Please speak again!)",
        badge: "try_again",
        bestMatched: sentenceObj.tamilPrimary,
        rawScore: 0
      };
    }

    // List all candidate translations to check (both Tamil script & Tanglish transliteration)
    const candidates = [
      sentenceObj.tamilPrimary,
      ...(sentenceObj.variations || [])
    ];

    if (sentenceObj.transliteration) {
      candidates.push(sentenceObj.transliteration);
    }

    let maxScore = 0;
    let bestMatched = sentenceObj.tamilPrimary;

    for (const variant of candidates) {
      const score = this.evaluateAgainstSingle(variant, spokenText, sentenceObj.keywords);
      if (score > maxScore) {
        maxScore = score;
        bestMatched = variant;
      }
    }

    // Apply difficulty scaling
    let adjustedPercentage = 0;
    let threshold = 70;

    if (mode === "easy") {
      threshold = 50;
      // Friendly curve for beginners
      adjustedPercentage = Math.round(Math.min(100, Math.pow(maxScore, 0.75) * 100));
    } else if (mode === "hard") {
      threshold = 85;
      // Strict linear to slight penalty
      adjustedPercentage = Math.round(Math.min(100, Math.pow(maxScore, 1.15) * 100));
    } else {
      // Medium mode (default)
      threshold = 70;
      adjustedPercentage = Math.round(Math.min(100, Math.pow(maxScore, 0.90) * 100));
    }

    // Direct match safety boost
    const normSpoken = this.normalize(spokenText);
    for (const variant of candidates) {
      if (this.normalize(variant) === normSpoken) {
        adjustedPercentage = 100;
        break;
      }
    }

    const isPass = adjustedPercentage >= threshold;

    // Stars rating (0 to 3)
    let stars = 0;
    let feedback = "";
    let badge = "";

    if (adjustedPercentage >= 90) {
      stars = 3;
      feedback = "🌟 அற்புதமாக கூறினீர்கள்! (Outstanding pronunciation & accuracy!)";
      badge = "excellent";
    } else if (adjustedPercentage >= threshold) {
      stars = adjustedPercentage >= 80 ? 3 : 2;
      feedback = "🎉 மிக நன்று! அருமையான முயற்சி! (Great job! Well done!)";
      badge = "great";
    } else if (adjustedPercentage >= threshold - 15) {
      stars = 1;
      feedback = "👍 நல்ல முயற்சி! கொஞ்சம் மாற்றி சொல்லுங்கள்! (Good attempt! Try once more!)";
      badge = "good_try";
    } else {
      stars = 0;
      feedback = "💪 இன்னும் ஒரு முறை சொல்லுங்கள்! (Keep trying! You can do it!)";
      badge = "keep_trying";
    }

    return {
      percentage: adjustedPercentage,
      threshold,
      isPass,
      stars,
      feedback,
      badge,
      bestMatched,
      rawScore: maxScore
    };
  }
};

if (typeof window !== "undefined") {
  window.TamilMatcher = TamilMatcher;
}
if (typeof global !== "undefined") {
  global.TamilMatcher = TamilMatcher;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = TamilMatcher;
}
