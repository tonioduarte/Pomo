import Link from "next/link";
import { notFound } from "next/navigation";
import { Settings } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { circleUserIds, getFeed, getUserStats } from "@/lib/queries";
import { color } from "@/lib/palette";
import { formatDuration } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/pomo/brand";
import { FeedCard } from "@/components/pomo/feed-card";
import { EmptyState, StatTile, WeekBars } from "@/components/pomo/widgets";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  return { title: `@${(await params).username}` };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const viewer = await requireUser();
  const profile = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, username: true, name: true, emoji: true, color: true, bio: true, createdAt: true },
  });
  if (!profile) notFound();

  const isMe = profile.id === viewer.id;
  const inCircle = isMe || (await circleUserIds(viewer.id)).includes(profile.id);
  const c = color(profile.color);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
      <section className="sticker relative mb-6 overflow-hidden">
        <div className="h-28 sm:h-36" style={{ background: `linear-gradient(120deg, ${c.bg}, ${c.soft})` }} />
        <div className="flex flex-wrap items-end gap-4 px-6 pb-6">
          <UserAvatar user={profile} size="xl" className="-mt-14 ring-4" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-black sm:text-4xl">{profile.name}</h1>
            <p className="font-bold text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-2 max-w-lg">{profile.bio}</p>}
          </div>
          {isMe && (
            <Button variant="outline" render={<Link href="/settings" />} nativeButton={false}>
              <Settings /> Editar perfil
            </Button>
          )}
        </div>
      </section>

      {inCircle ? (
        <ProfileDetails userId={profile.id} viewerId={viewer.id} />
      ) : (
        <EmptyState emoji="🔒" title="Perfil privado">
          Entre numa sala com {profile.name.split(" ")[0]} para ver estatísticas e check-ins.
        </EmptyState>
      )}
    </div>
  );
}

/** Estatísticas e check-ins: só aparecem para quem divide uma sala com a pessoa. */
async function ProfileDetails({ userId, viewerId }: { userId: string; viewerId: string }) {
  const [stats, feed] = await Promise.all([getUserStats(userId), getFeed([userId], { take: 10 })]);
  const maxSubject = Math.max(1, stats.bySubject[0]?.sec ?? 1);

  return (
    <>
      <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile index={0} label="Total" value={formatDuration(stats.totalSec)} tint="orchid" shape="triangle" />
        <StatTile index={1} label="Sessões" value={String(stats.sessionCount)} tint="forest" shape="diamond" />
        <StatTile index={2} label="Sequência" value={`${stats.streak} 🔥`} tint="sun" shape="circle" />
        <StatTile index={3} label="7 dias" value={formatDuration(stats.weekSec)} tint="sky" shape="square" />
      </section>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <section className="sticker p-5">
          <h2 className="mb-4 font-display text-xl font-bold">Últimos 7 dias</h2>
          <WeekBars days={stats.last7} />
        </section>
        <section className="sticker p-5">
          <h2 className="mb-4 font-display text-xl font-bold">Por matéria (90 dias)</h2>
          {stats.bySubject.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem sessões ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.bySubject.slice(0, 6).map((s) => {
                const sc = color(s.subject?.color ?? "lavender");
                return (
                  <li key={s.subject?.id ?? "none"}>
                    <div className="mb-1 flex justify-between text-sm font-extrabold">
                      <span>
                        {s.subject?.emoji ?? "✨"} {s.subject?.name ?? "Livre"}
                      </span>
                      <span className="text-muted-foreground">{formatDuration(s.sec)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${(s.sec / maxSubject) * 100}%`, background: sc.bg }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">Check-ins</h2>
        {feed.length === 0 ? (
          <EmptyState emoji="🌱" title="Nenhum check-in ainda" />
        ) : (
          feed.map((s, i) => <FeedCard key={s.id} session={s} viewerId={viewerId} index={i} />)
        )}
      </section>
    </>
  );
}
