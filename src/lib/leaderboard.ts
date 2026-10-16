export type LeaderboardSession = {
  userId: string;
  startedAt: Date;
  endedAt: Date;
  durationSec: number;
};

export type LeaderboardRow = {
  userId: string;
  totalSec: number;
  sessions: number;
  rank: number;
};

/**
 * Quanto de uma sessão cai dentro da janela da sala. Se a sessão atravessa o
 * início/fim, conta proporcionalmente (pausas ficam distribuídas igualmente).
 */
export function secondsInWindow(s: LeaderboardSession, start: Date, end: Date): number {
  const wallMs = s.endedAt.getTime() - s.startedAt.getTime();
  const overlapMs =
    Math.min(s.endedAt.getTime(), end.getTime()) - Math.max(s.startedAt.getTime(), start.getTime());
  if (overlapMs <= 0) return 0;
  if (wallMs <= 0) return s.durationSec;
  return Math.round(s.durationSec * Math.min(1, overlapMs / wallMs));
}

/** Ranking por tempo total; empates dividem a mesma posição (1, 1, 3...). */
export function buildLeaderboard(
  memberIds: string[],
  sessions: LeaderboardSession[],
  start: Date,
  end: Date,
): LeaderboardRow[] {
  const totals = new Map<string, { totalSec: number; sessions: number }>(
    memberIds.map((id) => [id, { totalSec: 0, sessions: 0 }]),
  );
  for (const s of sessions) {
    const row = totals.get(s.userId);
    if (!row) continue;
    const sec = secondsInWindow(s, start, end);
    if (sec > 0) {
      row.totalSec += sec;
      row.sessions++;
    }
  }
  const sorted = [...totals.entries()]
    .map(([userId, v]) => ({ userId, ...v }))
    .sort((a, b) => b.totalSec - a.totalSec || a.userId.localeCompare(b.userId));

  return sorted.map((row, i) => {
    const firstWithSameTotal = sorted.findIndex((r) => r.totalSec === row.totalSec);
    return { ...row, rank: (firstWithSameTotal === -1 ? i : firstWithSameTotal) + 1 };
  });
}

export type RoomPhase = "upcoming" | "live" | "ended";

export function roomPhase(startsAt: Date, endsAt: Date, now: Date): RoomPhase {
  if (now < startsAt) return "upcoming";
  if (now > endsAt) return "ended";
  return "live";
}
