import { describe, expect, it } from "vitest";
import { dayKey, elapsedSec, formatClock, formatDuration, PRESENCE_GRACE_SEC, streakDays } from "@/lib/time";

const at = (iso: string) => new Date(iso);

describe("elapsedSec", () => {
  it("soma o trecho em execução ao acumulado", () => {
    const s = { status: "RUNNING" as const, accumulatedSec: 100, segmentStartedAt: at("2026-10-16T10:00:00Z"), lastPingAt: at("2026-10-16T10:09:50Z") };
    expect(elapsedSec(s, at("2026-10-16T10:10:00Z"))).toBe(700);
  });

  it("não conta tempo depois que os pings param", () => {
    const s = { status: "RUNNING" as const, accumulatedSec: 0, segmentStartedAt: at("2026-10-16T10:00:00Z"), lastPingAt: at("2026-10-16T10:05:00Z") };
    expect(elapsedSec(s, at("2026-10-16T15:00:00Z"))).toBe(5 * 60 + PRESENCE_GRACE_SEC);
  });

  it("pausado devolve só o acumulado", () => {
    const s = { status: "PAUSED" as const, accumulatedSec: 1234, segmentStartedAt: null, lastPingAt: at("2026-10-16T10:00:00Z") };
    expect(elapsedSec(s, at("2026-10-16T12:00:00Z"))).toBe(1234);
  });
});

describe("formatação", () => {
  it("formatDuration", () => {
    expect(formatDuration(42)).toBe("42s");
    expect(formatDuration(25 * 60)).toBe("25min");
    expect(formatDuration(3725)).toBe("1h 02min");
  });
  it("formatClock", () => {
    expect(formatClock(3725)).toBe("01:02:05");
  });
});

describe("streakDays", () => {
  it("usa o fuso de São Paulo para separar os dias", () => {
    // 01:30 UTC do dia 16 ainda é dia 15 em São Paulo
    expect(dayKey(at("2026-10-16T01:30:00Z"))).toBe("2026-10-15");
  });

  it("conta dias seguidos até hoje", () => {
    const now = at("2026-10-16T15:00:00Z");
    const dates = ["2026-10-16T12:00:00Z", "2026-10-15T12:00:00Z", "2026-10-14T12:00:00Z", "2026-10-12T12:00:00Z"].map(at);
    expect(streakDays(dates, now)).toBe(3);
  });

  it("não quebra a sequência se hoje ainda não estudou", () => {
    const now = at("2026-10-16T15:00:00Z");
    expect(streakDays([at("2026-10-15T12:00:00Z"), at("2026-10-14T12:00:00Z")], now)).toBe(2);
    expect(streakDays([at("2026-10-13T12:00:00Z")], now)).toBe(0);
  });
});
