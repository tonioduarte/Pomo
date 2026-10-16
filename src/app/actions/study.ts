"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { elapsedSec, MAX_SESSION_SEC, PRESENCE_GRACE_SEC } from "@/lib/time";
import { finishSchema } from "@/lib/validation";

async function openSession(userId: string) {
  return db.studySession.findFirst({
    where: { userId, status: { in: ["RUNNING", "PAUSED"] } },
    orderBy: { startedAt: "desc" },
  });
}

export async function startStudy(subjectId: string | null) {
  const user = await requireUser();
  const existing = await openSession(user.id);
  if (existing) return { id: existing.id };

  if (subjectId) {
    const owns = await db.subject.findFirst({ where: { id: subjectId, userId: user.id } });
    if (!owns) subjectId = null;
  }
  const now = new Date();
  const session = await db.studySession.create({
    data: { userId: user.id, subjectId, startedAt: now, segmentStartedAt: now, lastPingAt: now },
  });
  revalidatePath("/", "layout");
  return { id: session.id };
}

export async function pauseStudy() {
  const user = await requireUser();
  const s = await openSession(user.id);
  if (!s || s.status !== "RUNNING") return;
  const now = new Date();
  await db.studySession.update({
    where: { id: s.id },
    data: { status: "PAUSED", accumulatedSec: elapsedSec(s, now), segmentStartedAt: null, lastPingAt: now },
  });
  revalidatePath("/", "layout");
}

export async function resumeStudy() {
  const user = await requireUser();
  const s = await openSession(user.id);
  if (!s || s.status !== "PAUSED") return;
  const now = new Date();
  await db.studySession.update({
    where: { id: s.id },
    data: { status: "RUNNING", segmentStartedAt: now, lastPingAt: now },
  });
  revalidatePath("/", "layout");
}

export async function changeStudySubject(subjectId: string | null) {
  const user = await requireUser();
  const s = await openSession(user.id);
  if (!s) return;
  if (subjectId && !(await db.subject.findFirst({ where: { id: subjectId, userId: user.id } }))) return;
  await db.studySession.update({ where: { id: s.id }, data: { subjectId } });
  revalidatePath("/", "layout");
}

/** Encerra o cronômetro e publica o check-in no feed. */
export async function finishStudy(input: { title?: string; note?: string }) {
  const user = await requireUser();
  const s = await openSession(user.id);
  if (!s) return { error: "Nenhum cronômetro ativo" };
  const parsed = finishSchema.safeParse(input);
  if (!parsed.success) return { error: "Texto muito longo" };

  const now = new Date();
  const durationSec = Math.min(elapsedSec(s, now), MAX_SESSION_SEC);
  if (durationSec < 60) {
    await db.studySession.delete({ where: { id: s.id } });
    revalidatePath("/", "layout");
    return { discarded: true as const };
  }
  // Se a aba ficou fechada, a sessão termina no último sinal de vida.
  const lastAlive = new Date(s.lastPingAt.getTime() + PRESENCE_GRACE_SEC * 1000);
  const endedAt = s.status === "RUNNING" && lastAlive < now ? lastAlive : now;

  await db.studySession.update({
    where: { id: s.id },
    data: {
      status: "FINISHED",
      accumulatedSec: durationSec,
      durationSec,
      segmentStartedAt: null,
      endedAt,
      title: parsed.data.title || null,
      note: parsed.data.note || null,
    },
  });
  revalidatePath("/", "layout");
  return { id: s.id, durationSec };
}

export async function discardStudy() {
  const user = await requireUser();
  const s = await openSession(user.id);
  if (s) await db.studySession.delete({ where: { id: s.id } });
  revalidatePath("/", "layout");
}
