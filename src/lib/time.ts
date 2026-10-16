/** Sem ping por mais que isso → a pessoa não está mais "online estudando". */
export const PRESENCE_GRACE_SEC = 180;
/** Uma sessão nunca conta mais que isso (evita cronômetro esquecido ligado). */
export const MAX_SESSION_SEC = 12 * 60 * 60;
export const TIMEZONE = "America/Sao_Paulo";

export type TimerState = {
  status: "RUNNING" | "PAUSED" | "FINISHED";
  accumulatedSec: number;
  segmentStartedAt: Date | null;
  lastPingAt: Date;
};

/**
 * Segundos estudados até `now`. Um trecho em execução só conta até o último
 * ping + tolerância, assim fechar a aba não fica somando tempo para sempre.
 */
export function elapsedSec(s: TimerState, now: Date): number {
  let total = s.accumulatedSec;
  if (s.status === "RUNNING" && s.segmentStartedAt) {
    const cap = s.lastPingAt.getTime() + PRESENCE_GRACE_SEC * 1000;
    const end = Math.min(now.getTime(), cap);
    total += Math.max(0, Math.floor((end - s.segmentStartedAt.getTime()) / 1000));
  }
  return Math.min(total, MAX_SESSION_SEC);
}

export function isFresh(lastPingAt: Date, now: Date): boolean {
  return now.getTime() - lastPingAt.getTime() < PRESENCE_GRACE_SEC * 1000;
}

/** 3725 → "1h 02min"; 59 → "59s" */
export function formatDuration(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}min`;
  if (m > 0) return `${m}min`;
  return `${sec}s`;
}

/** 3725 → "01:02:05" */
export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Chave do dia (YYYY-MM-DD) no fuso informado. */
export function dayKey(date: Date, timeZone = TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** Dias seguidos com estudo, terminando hoje (ou ontem, se hoje ainda não estudou). */
export function streakDays(sessionDates: Date[], now: Date, timeZone = TIMEZONE): number {
  const days = new Set(sessionDates.map((d) => dayKey(d, timeZone)));
  const oneDay = 24 * 60 * 60 * 1000;
  let cursor = now.getTime();
  if (!days.has(dayKey(new Date(cursor), timeZone))) cursor -= oneDay;
  let streak = 0;
  while (days.has(dayKey(new Date(cursor), timeZone))) {
    streak++;
    cursor -= oneDay;
  }
  return streak;
}
