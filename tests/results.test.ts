import assert from "node:assert/strict";
import test from "node:test";
import type { CompetencyPrompt, ResultRecord } from "../src/types";
import { buildStationBreakdown, resultsToCsv } from "../src/utils/results";

test("resultsToCsv escapes quotes and preserves scoring fields", () => {
  const result: ResultRecord = {
    id: "result-1",
    mode: "host-competency",
    roomCode: "ABCD",
    createdAt: "2026-08-12T04:00:00.000Z",
    endedAt: "2026-08-12T04:10:00.000Z",
    score: 75,
    answered: 2,
    correct: 1,
    partial: 1,
    incorrect: 0,
    accuracy: 75,
    participantStats: [],
    missedPromptIds: ['prompt-"quoted"'],
    flaggedPromptIds: [],
    stationBreakdown: {},
    scoreHistory: []
  };

  const csv = resultsToCsv([result]);

  assert.match(csv, /"75"/);
  assert.match(csv, /prompt-""quoted""/);
  assert.equal(csv.split("\n").length, 2);
});

test("buildStationBreakdown groups correct and missed attempts by station", () => {
  const codeBlue = { id: "p1", stationId: "code-blue" } as CompetencyPrompt;
  const stroke = { id: "p2", stationId: "stroke" } as CompetencyPrompt;

  const breakdown = buildStationBreakdown([
    { prompt: codeBlue, correct: true },
    { prompt: codeBlue, correct: false },
    { prompt: stroke, correct: true }
  ]);

  assert.deepEqual(breakdown["code-blue"], {
    answered: 2,
    correct: 1,
    partial: 0,
    incorrect: 1,
    flagged: 0
  });
  assert.deepEqual(breakdown.stroke, {
    answered: 1,
    correct: 1,
    partial: 0,
    incorrect: 0,
    flagged: 0
  });
});
