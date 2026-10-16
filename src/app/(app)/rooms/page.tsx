import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { requireUser } from "@/lib/auth";
import { getMyRooms } from "@/lib/queries";
import { roomPhase } from "@/lib/leaderboard";
import { color } from "@/lib/palette";
import { UserAvatar, Shape, SHAPES } from "@/components/pomo/brand";
import { CreateRoomDialog, JoinRoomForm } from "@/components/pomo/room-forms";
import { EmptyState, PageHeader } from "@/components/pomo/widgets";

export const metadata = { title: "Salas" };

export default async function RoomsPage() {
  const user = await requireUser();
  const rooms = await getMyRooms(user.id);
  const now = new Date();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <PageHeader eyebrow="competições" title="Suas salas">
        <CreateRoomDialog />
      </PageHeader>

      <section className="paper mb-8 rounded-3xl border-2 border-[#E9DFA6] p-5 shadow-[0_4px_0_#E9DFA6] sm:flex sm:items-center sm:gap-6">
        <div className="mb-3 sm:mb-0 sm:flex-1">
          <h2 className="font-display text-xl font-bold text-[#6B3E22]">Recebeu um convite?</h2>
          <p className="text-sm text-[#6B3E22]/70">Digite o código de 6 letras que seu amigo mandou.</p>
        </div>
        <div className="sm:w-96">
          <JoinRoomForm />
        </div>
      </section>

      {rooms.length === 0 ? (
        <EmptyState emoji="🏆" title="Nenhuma sala ainda">
          Crie uma sala, mande o código pros amigos e vejam quem estuda mais.
        </EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r, i) => {
            const c = color(r.color);
            const phase = roomPhase(r.startsAt, r.endsAt, now);
            return (
              <li key={r.id}>
                <Link
                  href={`/rooms/${r.id}`}
                  className="group relative block overflow-hidden rounded-3xl p-5 transition-transform hover:-translate-y-1 hover:rotate-[-0.6deg]"
                  style={{ background: c.bg, color: c.ink, boxShadow: `0 7px 0 ${c.shadow}` }}
                >
                  <Shape
                    kind={SHAPES[i % 4]}
                    className="absolute -right-6 -bottom-6 size-32 opacity-20 transition-transform duration-500 group-hover:rotate-45"
                    fill={c.ink}
                  />
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{r.emoji}</span>
                    <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-extrabold">
                      {phase === "live"
                        ? `termina em ${formatDistanceToNowStrict(r.endsAt, { locale: ptBR })}`
                        : phase === "upcoming"
                          ? "em breve"
                          : "encerrada 🏁"}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-black leading-tight">{r.name}</h3>
                  {r.description && <p className="mt-1 line-clamp-2 text-sm opacity-80">{r.description}</p>}
                  <div className="mt-5 flex items-center gap-2">
                    <span className="flex -space-x-2">
                      {r.members.slice(0, 5).map((m) => (
                        <UserAvatar key={m.userId} user={m.user} size="sm" className="ring-white ring-offset-0" />
                      ))}
                    </span>
                    <span className="text-sm font-extrabold">{r._count.members} na sala</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
