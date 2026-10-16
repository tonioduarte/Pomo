import { describe, expect, it } from "vitest";
import { buildLeaderboard, roomPhase, secondsInWindow } from "@/lib/leaderboard";

const at = (iso: string) => new Date(iso);
const start = at("2026-10-01T00:00:00Z");
const end = at("2026-10-31T00:00:00Z");

describe("secondsInWindow", () => {
  it("conta a sessão inteira quando está dentro da janela", () => {
    const s = { userId: "a", startedAt: at("2026-10-10T10:00:00Z"), endedAt: at("2026-10-10T11:00:00Z"), durationSec: 3000 };
    expect(secondsInWindow(s, start, end)).toBe(3000);
  });

  it("conta proporcionalmente quando atravessa o início", () => {
    const s = { userId: "a", startedAt: at("2026-09-30T23:00:00Z"), endedAt: at("2026-10-01T01:00:00Z"), durationSec: 7200 };
    expect(secondsInWindow(s, start, end)).toBe(3600);
  });

  it("ignora sessões fora da janela", () => {
    const s = { userId: "a", startedAt: at("2026-11-02T10:00:00Z"), endedAt: at("2026-11-02T11:00:00Z"), durationSec: 3600 };
    expect(secondsInWindow(s, start, end)).toBe(0);
  });
});

describe("buildLeaderboard", () => {
  const session = (userId: string, durationSec: number) => ({
    userId,
    startedAt: at("2026-10-10T10:00:00Z"),
    endedAt: at("2026-10-10T12:00:00Z"),
    durationSec,
  });

  it("ordena por tempo e inclui membros zerados", () => {
    const board = buildLeaderboard(["ana", "bia", "caio"], [session("bia", 600), session("ana", 300), session("bia", 100)], start, end);
    expect(board.map((r) => [r.userId, r.totalSec, r.sessions, r.rank])).toEqual([
      ["bia", 700, 2, 1],
      ["ana", 300, 1, 2],
      ["caio", 0, 0, 3],
    ]);
  });

  it("empates dividem a posição", () => {
    const board = buildLeaderboard(["a", "b", "c"], [session("a", 500), session("b", 500), session("c", 100)], start, end);
    expect(board.map((r) => r.rank)).toEqual([1, 1, 3]);
  });

  it("ignora sessões de quem não é membro", () => {
    const board = buildLeaderboard(["a"], [session("intruso", 9999)], start, end);
    expect(board).toEqual([{ userId: "a", totalSec: 0, sessions: 0, rank: 1 }]);
  });
});

describe("roomPhase", () => {
  it("identifica a fase da sala", () => {
    expect(roomPhase(start, end, at("2026-09-20T00:00:00Z"))).toBe("upcoming");
    expect(roomPhase(start, end, at("2026-10-15T00:00:00Z"))).toBe("live");
    expect(roomPhase(start, end, at("2026-11-01T00:00:00Z"))).toBe("ended");
  });
});
