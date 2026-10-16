import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { elapsedSec, isFresh } from "@/lib/time";

/** Sinal de vida do cronômetro: mantém você "online estudando". */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const s = await db.studySession.findFirst({
    where: { userId: user.id, status: { in: ["RUNNING", "PAUSED"] } },
  });
  if (!s) return NextResponse.json({ active: false });

  const now = new Date();
  if (s.status === "RUNNING" && !isFresh(s.lastPingAt, now)) {
    // Voltou depois de muito tempo sem sinal: fecha o trecho antigo no último
    // ping e começa um novo agora, sem contar o tempo em que esteve fora.
    await db.studySession.update({
      where: { id: s.id },
      data: { accumulatedSec: elapsedSec(s, now), segmentStartedAt: now, lastPingAt: now },
    });
  } else {
    await db.studySession.update({ where: { id: s.id }, data: { lastPingAt: now } });
  }
  return NextResponse.json({ active: true });
}
