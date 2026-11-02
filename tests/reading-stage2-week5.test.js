"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const lessonPath = path.join("data", "reading_club", "reading_stage2_week5.json");
const lesson = JSON.parse(fs.readFileSync(lessonPath, "utf8"))[0];
const expectedSectionCounts = [1, 20, 10, 10, 3, 18, 5];

test("Stage 2 Week 5 lesson contains all seven worksheet sections", () => {
  assert.equal(lesson.id, "pdf-stage2-week5");
  assert.equal(lesson.sections.length, expectedSectionCounts.length);
  assert.equal(lesson.items.length, expectedSectionCounts.reduce((sum, count) => sum + count, 0));
  assert.equal(
    fs.existsSync(path.join("data", "Reading Club", "Reading-Stage2-Week5_Upd.pdf")),
    true,
    "the source PDF is bundled with the reading app"
  );
});

test("every section has its complete set of uniquely identified reading prompts", () => {
  const sectionIds = new Set(lesson.sections.map(section => section.id));
  const itemIds = new Set(lesson.items.map(item => item.id));

  assert.equal(sectionIds.size, lesson.sections.length, "section IDs are unique");
  assert.equal(itemIds.size, lesson.items.length, "reading prompt IDs are unique");

  lesson.sections.forEach((section, index) => {
    const items = lesson.items.filter(item => item.sectionId === section.id);
    assert.equal(items.length, expectedSectionCounts[index], section.title);
    assert.ok(items.every(item => item.questionTa && item.correctAnswer), section.title);
  });
  assert.ok(
    lesson.items.filter(item => item.sectionId === "sec-4").every(item => item.correctAnswer.includes("+")),
    "compound-word prompts accept the PDF's split reading"
  );
  assert.ok(lesson.items.every(item => sectionIds.has(item.sectionId)), "no prompts are outside a section");
});
