"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { color } from "@/lib/palette";
import { REACTIONS } from "@/lib/palette";
import { formatDuration } from "@/lib/time";
import { toggleReaction } from "@/app/actions/social";
import type { FeedSession } from "@/lib/queries";
import { SubjectChip, UserAvatar } from "./brand";

export function FeedCard({ session, viewerId, index = 0 }: { session: FeedSession; viewerId: string; index?: number }) {
  const c = color(session.subject?.color ?? "lavender");
  const [, startTransition] = useTransition();
  const [reactions, toggleOptimistic] = useOptimistic(session.reactions, (state, emoji: string) => {
    const mine = state.some((r) => r.emoji === emoji && r.userId === viewerId);
    return mine
      ? state.filter((r) => !(r.emoji === emoji && r.userId === viewerId))
      : [...state, { emoji, userId: viewerId }];
  });

  const react = (emoji: string) =>
    startTransition(async () => {
      toggleOptimistic(emoji);
      await toggleReaction(session.id, emoji);
    });

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, rotate: index % 2 ? 0.6 : -0.6 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: Math.min(index, 6) * 0.04 }}
      className="sticker overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4 pb-0">
        <Link href={`/u/${session.user.username}`}>
          <UserAvatar user={session.user} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/u/${session.user.username}`} className="font-extrabold hover:underline">
            {session.user.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(session.endedAt ?? session.createdAt, { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        <SubjectChip subject={session.subject} />
      </div>

      <Link href={`/s/${session.id}`} className="block p-4">
        <div
          className="flex items-center gap-4 rounded-2xl p-4"
          style={{ background: c.soft }}
        >
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
            style={{ background: c.bg, boxShadow: `0 4px 0 ${c.shadow}` }}
          >
            {session.subject?.emoji ?? "⏱️"}
          </span>
          <div className="min-w-0">
            <p className="font-display text-3xl font-black leading-none" style={{ color: c.shadow }}>
              {formatDuration(session.durationSec)}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-ink/70">
              {session.title ?? `de ${session.subject?.name ?? "estudo livre"}`}
            </p>
          </div>
        </div>
        {session.note && <p className="mt-3 line-clamp-4 whitespace-pre-line text-[15px] leading-relaxed">{session.note}</p>}
      </Link>

      <div className="flex flex-wrap items-center gap-1.5 border-t-2 border-border px-4 py-3">
        {REACTIONS.map((emoji) => {
          const count = reactions.filter((r) => r.emoji === emoji).length;
          const mine = reactions.some((r) => r.emoji === emoji && r.userId === viewerId);
          return (
            <motion.button
              key={emoji}
              whileTap={{ scale: 1.35, rotate: -8 }}
              onClick={() => react(emoji)}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded-full border-2 px-2.5 text-sm font-extrabold transition-colors",
                mine ? "border-orchid bg-petal/30 text-orchid" : "border-transparent bg-lilac text-ink/60 hover:bg-accent",
              )}
              aria-pressed={mine}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="tabular-nums">{count}</span>}
            </motion.button>
          );
        })}
        <Link
          href={`/s/${session.id}#comentarios`}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full bg-lilac px-3 text-sm font-extrabold text-ink/60 hover:bg-accent"
        >
          <MessageCircle className="size-4" />
          {session._count.comments}
        </Link>
      </div>
    </motion.article>
  );
}
