import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudyTimer } from "@/components/pomo/study-timer";
import { OnlineNow } from "@/components/pomo/online-now";
import { PageHeader } from "@/components/pomo/widgets";

export const metadata = { title: "Estudar" };

export default async function StudyPage() {
  const user = await requireUser();
  const subjects = await db.subject.findMany({
    where: { userId: user.id, archived: false },
    select: { id: true, name: true, emoji: true, color: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:py-10 xl:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <PageHeader eyebrow="modo foco" title="Hora de estudar" />
        <section className="sticker p-5 sm:p-8">
          <StudyTimer subjects={subjects} />
        </section>
      </div>
      <aside className="xl:pt-[5.5rem]">
        <OnlineNow title="Estudando com você" />
      </aside>
    </div>
  );
}
