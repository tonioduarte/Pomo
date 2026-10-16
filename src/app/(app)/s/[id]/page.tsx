import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canSeeSession, feedInclude } from "@/lib/queries";
import { FeedCard } from "@/components/pomo/feed-card";
import { Comments } from "@/components/pomo/comments";

export const metadata = { title: "Check-in" };

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (!(await canSeeSession(user.id, id))) notFound();

  const session = await db.studySession.findUnique({
    where: { id, status: "FINISHED" },
    include: {
      ...feedInclude,
      comments: {
        include: { user: { select: { id: true, username: true, name: true, emoji: true, color: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!session) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
      <FeedCard session={session} viewerId={user.id} />
      <Comments sessionId={session.id} comments={session.comments} viewerId={user.id} />
    </div>
  );
}
