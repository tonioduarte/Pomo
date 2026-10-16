"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { formatClock } from "@/lib/time";
import { UserAvatar, SubjectChip } from "./brand";
import { useStudy } from "./study-provider";

/** Lista de quem está estudando agora. `only` limita a um grupo (ex.: membros de uma sala). */
export function OnlineNow({ only, title = "Estudando agora" }: { only?: string[]; title?: string }) {
  const { online, secondsFor } = useStudy();
  const list = only ? online.filter((o) => only.includes(o.user.id)) : online;
  const studying = list.filter((o) => o.status === "RUNNING").length;

  return (
    <section className="sticker p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3F5EA] px-2.5 py-1 text-xs font-extrabold text-[#25834F]">
          <span className="live-dot size-2 rounded-full bg-[#3BB273]" />
          {studying} ao vivo
        </span>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl bg-lilac px-4 py-6 text-center text-sm text-muted-foreground">
          Ninguém estudando agora. Que tal ser o primeiro? 🍅
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {list.map((o) => (
              <motion.li
                key={o.user.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
              >
                <Link
                  href={`/u/${o.user.username}`}
                  className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-accent"
                >
                  <UserAvatar user={o.user} size="md" online={o.status} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{o.user.name}</span>
                    <SubjectChip subject={o.subject} />
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-sm font-bold tabular-nums">{formatClock(secondsFor(o))}</span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {o.status === "RUNNING" ? "focado" : "pausa ☕"}
                    </span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
