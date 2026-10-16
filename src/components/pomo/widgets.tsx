"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { color, COLORS } from "@/lib/palette";
import { formatDuration } from "@/lib/time";
import { Shape, SHAPES } from "./brand";

export function PageHeader({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)}
    >
      <div>
        {eyebrow && <p className="font-script text-3xl leading-none text-orchid">{eyebrow}</p>}
        <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl [font-variation-settings:'SOFT'_100]">
          {title}
        </h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </motion.header>
  );
}

/** Bloco colorido de estatística, estilo resposta do Kahoot. */
export function StatTile({
  label,
  value,
  tint,
  shape,
  index = 0,
}: {
  label: string;
  value: string;
  tint: keyof typeof COLORS;
  shape: (typeof SHAPES)[number];
  index?: number;
}) {
  const c = color(tint);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, rotate: index % 2 ? 1.5 : -1.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.07 }}
      className="relative overflow-hidden rounded-3xl p-4 sm:p-5"
      style={{ background: c.bg, color: c.ink, boxShadow: `0 6px 0 ${c.shadow}` }}
    >
      <Shape kind={shape} className="absolute -top-3 -right-3 size-16 opacity-25" fill={c.ink} />
      <p className="text-xs font-extrabold tracking-wide uppercase opacity-85">{label}</p>
      <p className="mt-1 font-display text-2xl font-black sm:text-3xl">{value}</p>
    </motion.div>
  );
}

export function WeekBars({ days }: { days: { key: string; date: Date | string; sec: number }[] }) {
  const max = Math.max(3600, ...days.map((d) => d.sec));
  const tints = ["orchid", "forest", "sun", "sky", "tangerine", "leaf", "lavender"] as const;
  return (
    <div className="flex h-40 items-end gap-2 sm:gap-3">
      {days.map((d, i) => {
        const c = color(tints[i % tints.length]);
        const pct = Math.max(4, (d.sec / max) * 100);
        const label = new Date(d.date).toLocaleDateString("pt-BR", { weekday: "short", timeZone: "America/Sao_Paulo" });
        return (
          <div key={d.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[10px] font-extrabold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {d.sec ? formatDuration(d.sec) : "—"}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 16, delay: i * 0.05 }}
              className="w-full rounded-t-xl rounded-b-md"
              style={{ background: d.sec ? c.bg : "var(--muted)", boxShadow: d.sec ? `inset 0 -5px 0 ${c.shadow}` : undefined }}
            />
            <span className="text-[11px] font-extrabold text-ink/60 capitalize">{label.replace(".", "")}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Formas do Kahoot flutuando ao fundo. */
export function FloatingShapes({ className, count = 10 }: { className?: string; count?: number }) {
  const reduce = useReducedMotion();
  const tints = ["orchid", "leaf", "sun", "sky", "petal", "forest", "tangerine", "lavender"] as const;
  const items = Array.from({ length: count }, (_, i) => ({
    kind: SHAPES[i % SHAPES.length],
    fill: color(tints[i % tints.length]).bg,
    left: `${(i * 37 + 7) % 95}%`,
    top: `${(i * 53 + 11) % 90}%`,
    size: 28 + ((i * 17) % 40),
    dur: 6 + (i % 5),
  }));
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {items.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
          animate={reduce ? undefined : { y: [0, -18, 0], rotate: [0, i % 2 ? 25 : -25, 0] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        >
          <Shape kind={s.kind} className="size-full opacity-70" fill={s.fill} />
        </motion.div>
      ))}
    </div>
  );
}

/** Chuva de confete com as formas do Pomo. */
export function Confetti({ fire }: { fire: number }) {
  const [bursts, setBursts] = useState<number[]>([]);
  useEffect(() => {
    if (!fire) return;
    setBursts((b) => [...b, fire]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x !== fire)), 2600);
    return () => clearTimeout(t);
  }, [fire]);

  const tints = Object.values(COLORS).map((c) => c.bg);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {bursts.map((id) =>
        Array.from({ length: 48 }, (_, i) => {
          const x = (Math.sin(id + i * 12.9898) * 43758.5453) % 1;
          const spread = (Math.abs(x) - 0.5) * 900;
          return (
            <motion.div
              key={`${id}-${i}`}
              className="absolute top-1/2 left-1/2 size-3"
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
              animate={{
                x: spread,
                y: [0, -300 - Math.abs(x) * 250, 700],
                rotate: spread * 1.5,
                opacity: [1, 1, 0],
                scale: 1,
              }}
              transition={{ duration: 2.2 + Math.abs(x), ease: [0.2, 0.6, 0.4, 1] }}
            >
              <Shape kind={SHAPES[i % 4]} className="size-full" fill={tints[i % tints.length]} />
            </motion.div>
          );
        }),
      )}
    </div>
  );
}

export function EmptyState({ emoji, title, children }: { emoji: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="sticker flex flex-col items-center px-6 py-10 text-center">
      <motion.span
        className="text-5xl"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
      >
        {emoji}
      </motion.span>
      <h3 className="mt-3 font-display text-2xl font-bold">{title}</h3>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
