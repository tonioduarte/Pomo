import { notFound } from "next/navigation";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFeed, getRoom } from "@/lib/queries";
import { roomPhase } from "@/lib/leaderboard";
import { color } from "@/lib/palette";
import { formatDuration } from "@/lib/time";
import { leaveRoom } from "@/app/actions/rooms";
import { Button } from "@/components/ui/button";
import { FeedCard } from "@/components/pomo/feed-card";
import { OnlineNow } from "@/components/pomo/online-now";
import { AutoRefresh, Countdown, InviteCode, LeaderboardList, Podium } from "@/components/pomo/room-live";
import { EmptyState, FloatingShapes } from "@/components/pomo/widgets";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const room = await db.room.findUnique({ where: { id: (await params).id }, select: { name: true } });
  return { title: room?.name ?? "Sala" };
}

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const data = await getRoom(id, user.id);
  if (!data) notFound();

  const { room, leaderboard, memberIds } = data;
  const now = new Date();
  const phase = roomPhase(room.startsAt, room.endsAt, now);
  const c = color(room.color);
  const feed = await getFeed(memberIds, { since: room.startsAt, until: room.endsAt, take: 30 });
  const winner = phase === "ended" && leaderboard[0]?.totalSec ? leaderboard[0] : null;
  const leave = leaveRoom.bind(null, room.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <AutoRefresh />
      <section
        className="relative mb-6 overflow-hidden rounded-[2rem] px-6 py-8 sm:px-10"
        style={{ background: c.bg, color: c.ink, boxShadow: `0 7px 0 ${c.shadow}` }}
      >
        <FloatingShapes count={7} className="opacity-35" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-5xl">{room.emoji}</span>
            <h1 className="mt-2 font-display text-4xl font-black leading-none sm:text-5xl [font-variation-settings:'SOFT'_100,'WONK'_1]">
              {room.name}
            </h1>
            {room.description && <p className="mt-2 font-semibold opacity-85">{room.description}</p>}
            <p className="mt-3 text-sm font-bold opacity-80">
              {room.startsAt.toLocaleDateString("pt-BR", { dateStyle: "medium" })} →{" "}
              {room.endsAt.toLocaleDateString("pt-BR", { dateStyle: "medium" })} · criada por {room.owner.name}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            {phase === "live" && <Countdown to={room.endsAt.toISOString()} label="Termina em" />}
            {phase === "upcoming" && <Countdown to={room.startsAt.toISOString()} label="Começa em" />}
            <InviteCode code={room.inviteCode} />
          </div>
        </div>
      </section>

      {winner && (
        <section className="paper mb-6 rounded-3xl border-2 border-[#E9DFA6] p-6 text-center shadow-[0_4px_0_#E9DFA6]">
          <p className="font-script text-4xl text-orchid">e o grande vencedor é…</p>
          <p className="font-display text-4xl font-black text-[#6B3E22]">
            {winner.user.emoji} {winner.user.name}
          </p>
          <p className="mt-1 font-bold text-[#6B3E22]/70">com {formatDuration(winner.totalSec)} de estudo 👑</p>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="sticker p-5 sm:p-6">
            <h2 className="font-display text-2xl font-bold">Placar {phase === "live" && <span className="text-base text-orchid">· ao vivo</span>}</h2>
            <Podium rows={leaderboard.slice(0, 3)} ended={phase === "ended"} />
            <div className="mt-6">
              <LeaderboardList rows={leaderboard} viewerId={user.id} />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-bold">Check-ins da sala</h2>
            {feed.length === 0 ? (
              <EmptyState emoji="⏱️" title="Ninguém fez check-in ainda">
                Comece um cronômetro — o tempo conta automaticamente para esta sala.
              </EmptyState>
            ) : (
              feed.map((s, i) => <FeedCard key={s.id} session={s} viewerId={user.id} index={i} />)
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <OnlineNow only={memberIds} title="Online na sala" />
          <form action={leave}>
            <Button variant="ghost" className="w-full text-muted-foreground">
              <LogOut /> Sair da sala
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
