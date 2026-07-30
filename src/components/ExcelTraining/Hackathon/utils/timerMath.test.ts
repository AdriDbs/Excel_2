import { computeAdjustedTimer } from "./timerMath";

const TOTAL = 120 * 60; // 120 minutes en secondes

describe("computeAdjustedTimer", () => {
  test("ajoute 5 minutes au temps restant", () => {
    const now = 1_000_000_000;
    const startTime = now - 30 * 60 * 1000; // 30 min écoulées -> 90 min restantes
    const result = computeAdjustedTimer(startTime, TOTAL, { type: "add", seconds: 5 * 60 }, now);

    expect(result.newTimeLeftSeconds).toBe(95 * 60);
    expect(result.newStartTime).toBe(startTime + 5 * 60 * 1000);
  });

  test("retire 15 minutes au temps restant (nombre négatif)", () => {
    const now = 1_000_000_000;
    const startTime = now - 30 * 60 * 1000; // 90 min restantes
    const result = computeAdjustedTimer(startTime, TOTAL, { type: "add", seconds: -15 * 60 }, now);

    expect(result.newTimeLeftSeconds).toBe(75 * 60);
  });

  test("ne descend jamais sous 0 même si on retire plus que le temps restant", () => {
    const now = 1_000_000_000;
    const startTime = now - 115 * 60 * 1000; // 5 min restantes
    const result = computeAdjustedTimer(startTime, TOTAL, { type: "add", seconds: -30 * 60 }, now);

    expect(result.newTimeLeftSeconds).toBe(0);
  });

  test("définit le temps restant exact à 45 minutes", () => {
    const now = 1_000_000_000;
    const startTime = now - 10 * 60 * 1000; // peu importe le startTime actuel
    const result = computeAdjustedTimer(startTime, TOTAL, { type: "set", seconds: 45 * 60 }, now);

    expect(result.newTimeLeftSeconds).toBe(45 * 60);
  });

  test("définit le temps restant exact à 0", () => {
    const now = 1_000_000_000;
    const startTime = now;
    const result = computeAdjustedTimer(startTime, TOTAL, { type: "set", seconds: 0 }, now);

    expect(result.newTimeLeftSeconds).toBe(0);
  });
});
