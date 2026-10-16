import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewSubjectButton, SubjectGrid } from "@/components/pomo/subject-form";
import { EmptyState, PageHeader } from "@/components/pomo/widgets";

export const metadata = { title: "Matérias" };

export default async function SubjectsPage() {
  const user = await requireUser();
  const [subjects, totals] = await Promise.all([
    db.subject.findMany({
      where: { userId: user.id, archived: false },
      select: { id: true, name: true, emoji: true, color: true },
      orderBy: { createdAt: "asc" },
    }),
    db.studySession.groupBy({
      by: ["subjectId"],
      where: { userId: user.id, status: "FINISHED" },
      _sum: { durationSec: true },
    }),
  ]);
  const totalBySubject = new Map(totals.map((t) => [t.subjectId, t._sum.durationSec ?? 0]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <PageHeader eyebrow="do seu jeito" title="Suas matérias">
        <NewSubjectButton />
      </PageHeader>
      {subjects.length === 0 ? (
        <EmptyState emoji="📚" title="Nenhuma matéria">
          Crie matérias como Cálculo 1, Vetorial ou Pesquisa para separar seu tempo.
        </EmptyState>
      ) : (
        <SubjectGrid subjects={subjects.map((s) => ({ ...s, totalSec: totalBySubject.get(s.id) ?? 0 }))} />
      )}
    </div>
  );
}
