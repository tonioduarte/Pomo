import Link from "next/link";
import { Play, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { circleUserIds, getFeed, getMyRooms, getUserStats } from "@/lib/queries";
import { formatDuration } from "@/lib/time";
import { color } from "@/lib/palette";
import { roomPhase } from "@/lib/leaderboard";
import { Button } from "@/components/ui/button";
import { FeedCard } from "@/components/pomo/feed-card";
import { OnlineNow } from "@/components/pomo/online-now";
import { EmptyState, FloatingShapes, StatTile, WeekBars } from "@/components/pomo/widgets";
import { UserAvatar } from "@/components/pomo/brand";

export const metadata = { title: "Início" };

function greeting() {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }));
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function HomePage() {
  const user = await requireUser();
  const circle = await circleUserIds(user.id);
  const [stats, feed, rooms] = await Promise.all([getUserStats(user.id), getFeed(circle), getMyRooms(user.id)]);
  const now = new Date();

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:py-10 xl:grid-cols-[1fr_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        {/* Banner */}
        <section className="relative overflow-hidden rounded-[2rem] bg-petal px-6 py-8 shadow-[0_6px_0_#C77A8D] sm:px-10 sm:py-10">
          <FloatingShapes count={8} className="opacity-60" />
          <div className="relative max-w-xl">
            <p className="font-script text-4xl text-white drop-shadow-sm">{greeting()},</p>
            <h1 className="font-display text-4xl font-black leading-[0.95] text-ink sm:text-6xl [font-variation-settings:'SOFT'_100,'WONK'_1]">
              {user.name.split(" ")[0]}! <span className="italic">Bora</span> estudar?
            </h1>
            <p className="mt-3 max-w-md font-semibold text-ink/75">
              {stats.todaySec > 0
                ? `Você já estudou ${formatDuration(stats.todaySec)} hoje. Continua que tá lindo!`
                : "Seu cronômetro de hoje ainda está zerado. Um pomodoro já faz diferença."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" variant="white" render={<Link href="/study" />} nativeButton={false}>
                <Play className="fill-current" /> Começar a estudar
              </Button>
              <Button size="lg" variant="forest" render={<Link href="/rooms" />} nativeButton={false}>
                <Plus /> Nova sala
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatTile index={0} label="Hoje" value={formatDuration(stats.todaySec)} tint="orchid" shape="triangle" />
          <StatTile index={1} label="7 dias" value={formatDuration(stats.weekSec)} tint="forest" shape="diamond" />
          <StatTile index={2} label="Sequência" value={`${stats.streak} 🔥`} tint="sun" shape="circle" />
          <StatTile index={3} label="Total" value={formatDuration(stats.totalSec)} tint="sky" shape="square" />
        </section>

        <section className="sticker p-5 sm:p-6">
          <h2 className="mb-4 font-display text-xl font-bold">Sua semana</h2>
          <WeekBars days={stats.last7} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-bold">Check-ins da galera</h2>
          {feed.length === 0 ? (
            <EmptyState emoji="📭" title="Nada por aqui ainda">
              Termine uma sessão de estudo ou entre numa sala para ver os check-ins dos amigos.
            </EmptyState>
          ) : (
            feed.map((s, i) => <FeedCard key={s.id} session={s} viewerId={user.id} index={i} />)
          )}
        </section>
      </div>

      <aside className="flex flex-col gap-6 xl:sticky xl:top-6 xl:self-start">
        <OnlineNow />
        <section className="sticker p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Suas salas</h2>
            <Link href="/rooms" className="text-sm font-extrabold text-orchid hover:underline">
              ver todas
            </Link>
          </div>
          {rooms.length === 0 ? (
            <p className="rounded-2xl bg-lilac px-4 py-6 text-center text-sm text-muted-foreground">
              Crie uma sala ou entre com um código de convite. 🏆
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {rooms.slice(0, 4).map((r) => {
                const c = color(r.color);
                const phase = roomPhase(r.startsAt, r.endsAt, now);
                return (
                  <li key={r.id}>
                    <Link href={`/rooms/${r.id}`} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-accent">
                      <span
                        className="flex size-11 items-center justify-center rounded-xl text-xl"
                        style={{ background: c.bg, boxShadow: `0 3px 0 ${c.shadow}` }}
                      >
                        {r.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-extrabold">{r.name}</span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {phase === "live" ? "🟢 rolando" : phase === "upcoming" ? "⏳ em breve" : "🏁 encerrada"} ·{" "}
                          {r._count.members} pessoas
                        </span>
                      </span>
                      <span className="flex -space-x-2">
                        {r.members.slice(0, 3).map((m) => (
                          <UserAvatar key={m.userId} user={m.user} size="sm" className="ring-offset-0" />
                        ))}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}
