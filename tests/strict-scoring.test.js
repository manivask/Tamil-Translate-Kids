const assert = require('node:assert/strict');
const matcher = require('../js/matcher');
const target = {tamilPrimary: 'பாடம் படி'};
for (const level of ['easy', 'medium', 'hard']) {
  assert.equal(matcher.evaluate(target, 'பாடம் படி', level).percentage, 100);
  assert.equal(matcher.evaluate(target, '  பாடம்   படி! ', level).isPass, true);
  for (const spoken of ['பாடம் பட', 'பாடம்', 'படி பாடம்', 'பாடம் படி படி', 'மரம் நடு', '']) {
    const result = matcher.evaluate(target, spoken, level);
    assert.equal(result.isPass, false, `${level}: ${spoken}`);
    assert.ok(result.percentage < 50);
    assert.equal(result.stars, 0);
  }
}
assert.ok(matcher.evaluate(target, 'பாடம்', 'easy').percentage > matcher.evaluate(target, 'பாடம்', 'medium').percentage);
assert.ok(matcher.evaluate(target, 'பாடம்', 'medium').percentage > matcher.evaluate(target, 'பாடம்', 'hard').percentage);
assert.equal(matcher.evaluate({tamilPrimary:'பாடம் படி படி'}, 'பாடம் படி').isPass, false);
assert.equal(matcher.evaluate({tamilPrimary:'', variations:[]}, 'படி').isPass, false);
console.log('PASS: exact Tamil words, incomplete words, omissions, order, repetition, empty speech and student levels');
