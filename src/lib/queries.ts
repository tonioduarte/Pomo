import { db } from "@/lib/db";
import { buildLeaderboard } from "@/lib/leaderboard";
import { dayKey, elapsedSec, isFresh, PRESENCE_GRACE_SEC, streakDays } from "@/lib/time";

const publicUser = { id: true, username: true, name: true, emoji: true, color: true } as const;
const subjectFields = { id: true, name: true, emoji: true, color: true } as const;

/** Você + todo mundo que divide pelo menos uma sala com você. */
export async function circleUserIds(userId: string): Promise<string[]> {
  const rows = await db.roomMember.findMany({
    where: { room: { members: { some: { userId } } } },
    select: { userId: true },
    distinct: ["userId"],
  });
  return [...new Set([userId, ...rows.map((r) => r.userId)])];
}

export async function canSeeSession(viewerId: string, sessionId: string) {
  const s = await db.studySession.findUnique({ where: { id: sessionId }, select: { userId: true } });
  if (!s) return false;
  return (await circleUserIds(viewerId)).includes(s.userId);
}

export type PresenceEntry = {
  user: { id: string; username: string; name: string; emoji: string; color: string };
  subject: { id: string; name: string; emoji: string; color: string } | null;
  status: "RUNNING" | "PAUSED";
  elapsedSec: number;
};

/** Quem do seu círculo está com cronômetro aberto agora. */
export async function getPresence(userIds: string[]): Promise<PresenceEntry[]> {
  const now = new Date();
  const open = await db.studySession.findMany({
    where: {
      userId: { in: userIds },
      status: { in: ["RUNNING", "PAUSED"] },
      lastPingAt: { gte: new Date(now.getTime() - PRESENCE_GRACE_SEC * 1000) },
    },
    include: { user: { select: publicUser }, subject: { select: subjectFields } },
    orderBy: { startedAt: "asc" },
  });
  return open
    .filter((s) => isFresh(s.lastPingAt, now))
    .map((s) => ({
      user: s.user,
      subject: s.subject,
      status: s.status as "RUNNING" | "PAUSED",
      elapsedSec: elapsedSec(s, now),
    }));
}

export async function getOpenSession(userId: string) {
  return db.studySession.findFirst({
    where: { userId, status: { in: ["RUNNING", "PAUSED"] } },
    include: { subject: { select: subjectFields } },
    orderBy: { startedAt: "desc" },
  });
}

export const feedInclude = {
  user: { select: publicUser },
  subject: { select: subjectFields },
  reactions: { select: { emoji: true, userId: true } },
  _count: { select: { comments: true } },
} as const;

export async function getFeed(userIds: string[], opts: { since?: Date; until?: Date; take?: number } = {}) {
  return db.studySession.findMany({
    where: {
      userId: { in: userIds },
      status: "FINISHED",
      endedAt: { gte: opts.since, lte: opts.until },
    },
    include: feedInclude,
    orderBy: { endedAt: "desc" },
    take: opts.take ?? 20,
  });
}

export type FeedSession = Awaited<ReturnType<typeof getFeed>>[number];

export async function getUserStats(userId: string) {
  const now = new Date();
  const since = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sessions = await db.studySession.findMany({
    where: { userId, status: "FINISHED", endedAt: { gte: since } },
    select: { endedAt: true, durationSec: true, subject: { select: subjectFields } },
  });
  const today = dayKey(now);
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  let todaySec = 0;
  let weekSec = 0;
  const bySubject = new Map<string, { subject: PresenceEntry["subject"]; sec: number }>();
  // Últimos 7 dias, do mais antigo pro mais novo, para o gráfico de barras
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    return { key: dayKey(d), date: d, sec: 0 };
  });

  for (const s of sessions) {
    const end = s.endedAt!;
    const key = dayKey(end);
    if (key === today) todaySec += s.durationSec;
    if (end.getTime() >= weekAgo) weekSec += s.durationSec;
    const day = last7.find((d) => d.key === key);
    if (day) day.sec += s.durationSec;
    const k = s.subject?.id ?? "none";
    const entry = bySubject.get(k) ?? { subject: s.subject, sec: 0 };
    entry.sec += s.durationSec;
    bySubject.set(k, entry);
  }
  const total = await db.studySession.aggregate({
    where: { userId, status: "FINISHED" },
    _sum: { durationSec: true },
    _count: true,
  });

  return {
    todaySec,
    weekSec,
    totalSec: total._sum.durationSec ?? 0,
    sessionCount: total._count,
    streak: streakDays(sessions.map((s) => s.endedAt!), now),
    last7,
    bySubject: [...bySubject.values()].sort((a, b) => b.sec - a.sec),
  };
}

export async function getRoom(roomId: string, viewerId: string) {
  const room = await db.room.findFirst({
    where: { id: roomId, members: { some: { userId: viewerId } } },
    include: {
      owner: { select: publicUser },
      members: { include: { user: { select: publicUser } }, orderBy: { joinedAt: "asc" } },
    },
  });
  if (!room) return null;

  const now = new Date();
  const memberIds = room.members.map((m) => m.userId);
  const windowEnd = now < room.endsAt ? now : room.endsAt;

  const finished = await db.studySession.findMany({
    where: {
      userId: { in: memberIds },
      status: "FINISHED",
      startedAt: { lte: room.endsAt },
      endedAt: { gte: room.startsAt },
    },
    select: { userId: true, startedAt: true, endedAt: true, durationSec: true },
  });
  // Cronômetros abertos também contam "ao vivo" no placar
  const open = await db.studySession.findMany({
    where: { userId: { in: memberIds }, status: { in: ["RUNNING", "PAUSED"] } },
  });
  const sessions = [
    ...finished.map((s) => ({ ...s, endedAt: s.endedAt! })),
    ...open.map((s) => ({ userId: s.userId, startedAt: s.startedAt, endedAt: windowEnd, durationSec: elapsedSec(s, now) })),
  ];

  const board = buildLeaderboard(memberIds, sessions, room.startsAt, room.endsAt);
  const usersById = new Map(room.members.map((m) => [m.userId, m.user]));
  return {
    room,
    leaderboard: board.map((row) => ({ ...row, user: usersById.get(row.userId)! })),
    memberIds,
  };
}

export async function getMyRooms(userId: string) {
  const rooms = await db.room.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: { select: publicUser } }, take: 6 },
      _count: { select: { members: true } },
    },
    orderBy: { endsAt: "asc" },
  });
  const now = new Date();
  // Ao vivo primeiro, depois as próximas, depois as encerradas
  const order = (r: (typeof rooms)[number]) => (now > r.endsAt ? 2 : now < r.startsAt ? 1 : 0);
  return rooms.sort((a, b) => order(a) - order(b));
}
