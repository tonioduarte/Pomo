import { requireUser } from "@/lib/auth";
import { circleUserIds, getOpenSession, getPresence } from "@/lib/queries";
import { elapsedSec } from "@/lib/time";
import { AppShell } from "@/components/pomo/app-shell";
import { StudyProvider } from "@/components/pomo/study-provider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [online, mine] = await Promise.all([circleUserIds(user.id).then(getPresence), getOpenSession(user.id)]);
  const now = new Date();

  return (
    <StudyProvider
      initial={{
        online,
        mine: mine && {
          id: mine.id,
          status: mine.status as "RUNNING" | "PAUSED",
          subject: mine.subject,
          elapsedSec: elapsedSec(mine, now),
        },
      }}
    >
      <AppShell user={user}>{children}</AppShell>
    </StudyProvider>
  );
}
