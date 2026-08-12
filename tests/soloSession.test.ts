import assert from "node:assert/strict";
import test from "node:test";
import { stations } from "../src/data/stations";
import type { CompetencyPrompt } from "../src/types";
import {
  getSoloTimerSeconds,
  isSoloStationLocked,
  soloAutoTimerSeconds,
  summarizeSoloRun,
  summarizeSoloStation
} from "../src/utils/soloSession";

test("solo station scoring keeps partial credit weighted at one half", () => {
  const station = stations.find((item) => item.id === "code-blue");
  assert.ok(station);
  assert.ok(station.prompts.length >= 2);

  const result = summarizeSoloStation(station, {
    [station.prompts[0].id]: "correct",
    [station.prompts[1].id]: "partial"
  });

  assert.equal(result.completed, 2);
  assert.equal(result.correct, 1);
  assert.equal(result.partial, 1);
  assert.equal(result.incorrect, 0);
  assert.equal(result.score, 75);
});

test("solo run summary combines station scores by graded prompt", () => {
  const codeBlue = stations.find((item) => item.id === "code-blue");
  const hemodynamics = stations.find((item) => item.id === "hemodynamics");
  assert.ok(codeBlue && hemodynamics);

  const first = summarizeSoloStation(codeBlue, {
    [codeBlue.prompts[0].id]: "correct",
    [codeBlue.prompts[1].id]: "partial"
  });
  const second = summarizeSoloStation(hemodynamics, {
    [hemodynamics.prompts[0].id]: "incorrect",
    [hemodynamics.prompts[1].id]: "correct"
  });
  const results = { [codeBlue.id]: first, [hemodynamics.id]: second };
  const summary = summarizeSoloRun(results);

  assert.equal(summary.completedStations, 2);
  assert.equal(summary.totalCorrect, 2);
  assert.equal(summary.totalPartial, 1);
  assert.equal(summary.totalIncorrect, 1);
  assert.equal(summary.totalCompletedPrompts, 4);
  assert.equal(summary.overallScore, 63);
  assert.equal(isSoloStationLocked(results, codeBlue.id), true);
  assert.equal(isSoloStationLocked(results, "stroke"), false);
});

test("solo timer rule matches the previous 15 second behavior and skips Stroke activities", () => {
  const verbal = { type: "verbal-response" } as CompetencyPrompt;
  const activity = { type: "activity" } as CompetencyPrompt;

  assert.equal(getSoloTimerSeconds("code-blue", verbal), soloAutoTimerSeconds);
  assert.equal(getSoloTimerSeconds("stroke", activity), undefined);
  assert.equal(getSoloTimerSeconds("stroke", verbal), soloAutoTimerSeconds);
});
