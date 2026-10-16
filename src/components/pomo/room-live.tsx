"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, Crown } from "lucide-react";
import { toast } from "sonner";
import { color } from "@/lib/palette";
import { formatDuration } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./brand";
import { useStudy } from "./study-provider";
import { Confetti } from "./widgets";

type Row = {
  userId: string;
  totalSec: number;
  sessions: number;
  rank: number;
  user: { id: string; username: string; name: string; emoji: string; color: string };
};

/** Atualiza os dados do servidor periodicamente (placar ao vivo). */
export function AutoRefresh({ everyMs = 30_000 }: { everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), everyMs);
    return () => clearInterval(t);
  }, [router, everyMs]);
  return null;
}

export function Countdown({ to, label }: { to: string; label: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(to).getTime() - now);
  const parts = [
    { v: Math.floor(diff / 864e5), l: "dias" },
    { v: Math.floor((diff % 864e5) / 36e5), l: "horas" },
    { v: Math.floor((diff % 36e5) / 6e4), l: "min" },
    { v: Math.floor((diff % 6e4) / 1e3), l: "seg" },
  ];
  return (
    <div>
      <p className="mb-1.5 text-xs font-extrabold tracking-wide uppercase opacity-80">{label}</p>
      <div className="flex gap-2">
        {parts.map((p) => (
          <div key={p.l} className="min-w-14 rounded-xl bg-white/25 px-2 py-1.5 text-center">
            <motion.span
              key={p.v}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="block font-mono text-xl font-bold tabular-nums"
            >
              {String(p.v).padStart(2, "0")}
            </motion.span>
            <span className="text-[10px] font-extrabold uppercase opacity-80">{p.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="white"
      size="lg"
      onClick={async () => {
        const text = `Bora competir no Pomo! Entra na minha sala com o código ${code} 🍅`;
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success("Convite copiado!");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast(`Código: ${code}`);
        }
      }}
    >
      {copied ? <Check /> : <Copy />}
      <span className="font-mono tracking-[0.2em]">{code}</span>
    </Button>
  );
}

const PODIUM = [
  { place: 2, height: "h-24 sm:h-28", tint: "sky" },
  { place: 1, height: "h-36 sm:h-40", tint: "sun" },
  { place: 3, height: "h-16 sm:h-20", tint: "tangerine" },
] as const;

/** Pódio estilo Kahoot com o top 3 subindo animado. */
export function Podium({ rows, ended }: { rows: Row[]; ended: boolean }) {
  const [fire, setFire] = useState(0);
  useEffect(() => {
    if (ended && rows[0]?.totalSec) setFire(Date.now());
  }, [ended, rows]);

  return (
    <div className="flex items-end justify-center gap-2 pt-10 sm:gap-4">
      {ended && <Confetti fire={fire} />}
      {PODIUM.map((slot, i) => {
        const row = rows[slot.place - 1];
        const c = color(slot.tint);
        return (
          <div key={slot.place} className="flex w-1/3 max-w-40 flex-col items-center">
            {row ? (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.5 + (2 - i) * 0.25 }}
                className="mb-2 flex flex-col items-center text-center"
              >
                {slot.place === 1 && (
                  <motion.span
                    animate={{ rotate: [-8, 8, -8], y: [0, -3, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                    className="-mb-1"
                  >
                    <Crown className="size-8 fill-sun text-[#C9962A]" />
                  </motion.span>
                )}
                <Link href={`/u/${row.user.username}`}>
                  <UserAvatar user={row.user} size={slot.place === 1 ? "lg" : "md"} />
                </Link>
                <span className="mt-1 max-w-full truncate text-sm font-extrabold">{row.user.name.split(" ")[0]}</span>
                <span className="text-xs font-bold text-muted-foreground">{formatDuration(row.totalSec)}</span>
              </motion.div>
            ) : (
              <span className="mb-2 text-3xl opacity-30">?</span>
            )}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 16, delay: (2 - i) * 0.15 }}
              className={`${slot.height} flex w-full origin-bottom items-start justify-center rounded-t-2xl pt-2`}
              style={{ background: c.bg, boxShadow: `inset 0 -8px 0 ${c.shadow}` }}
            >
              <span className="font-display text-4xl font-black" style={{ color: c.ink }}>
                {slot.place}
              </span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

export function LeaderboardList({ rows, viewerId }: { rows: Row[]; viewerId: string }) {
  const { online } = useStudy();
  const max = Math.max(1, rows[0]?.totalSec ?? 1);
  const tints = ["sun", "sky", "tangerine", "orchid", "forest", "leaf", "lavender", "petal"] as const;

  return (
    <ol className="flex flex-col gap-2">
      {rows.map((row, i) => {
        const live = online.find((o) => o.user.id === row.userId);
        const c = color(tints[Math.min(row.rank - 1, tints.length - 1)]);
        return (
          <motion.li
            key={row.userId}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-2xl border-2 p-3 ${row.userId === viewerId ? "border-orchid bg-petal/15" : "border-border bg-card"}`}
          >
            <motion.div
              className="absolute inset-y-0 left-0 opacity-25"
              style={{ background: c.bg }}
              initial={{ width: 0 }}
              animate={{ width: `${(row.totalSec / max) * 100}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 + i * 0.05 }}
            />
            <Link href={`/u/${row.user.username}`} className="relative flex items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-xl font-display text-lg font-black"
                style={{ background: c.bg, color: c.ink, boxShadow: `0 3px 0 ${c.shadow}` }}
              >
                {row.rank}
              </span>
              <UserAvatar user={row.user} size="sm" online={live?.status} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-extrabold">
                  {row.user.name} {row.userId === viewerId && <span className="text-orchid">(você)</span>}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {row.sessions} {row.sessions === 1 ? "sessão" : "sessões"}
                  {live && (live.status === "RUNNING" ? " · 🟢 estudando agora" : " · ☕ em pausa")}
                </span>
              </span>
              <span className="font-display text-lg font-black tabular-nums">{formatDuration(row.totalSec)}</span>
            </Link>
          </motion.li>
        );
      })}
    </ol>
  );
}
