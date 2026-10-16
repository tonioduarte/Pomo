import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { circleUserIds, getOpenSession, getPresence } from "@/lib/queries";
import { elapsedSec } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const now = new Date();
  const [online, mine] = await Promise.all([
    circleUserIds(user.id).then(getPresence),
    getOpenSession(user.id),
  ]);

  return NextResponse.json({
    serverNow: now.toISOString(),
    online,
    mine: mine && {
      id: mine.id,
      status: mine.status,
      subject: mine.subject,
      elapsedSec: elapsedSec(mine, now),
    },
  });
}
