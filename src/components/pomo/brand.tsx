import Link from "next/link";
import { cn } from "@/lib/utils";
import { color, colorVars } from "@/lib/palette";

/** Tomatinho rosa com folha verde — o "pomo" de pomodoro. */
export function PomoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("size-9", className)} aria-hidden>
      <ellipse cx="24" cy="44" rx="14" ry="2.5" fill="#3A2230" opacity="0.12" />
      <path
        d="M24 13c11 0 18 7 18 16 0 8.5-7.5 14-18 14S6 37.5 6 29c0-9 7-16 18-16Z"
        fill="#D56989"
      />
      <path d="M13 24c1.5-4 5-6.5 9-7" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.55" fill="none" />
      <path
        d="M24 15c-2-3-6-4.5-10-3.5 2.5 3 6 4.5 10 3.5Zm0 0c2-3 6-4.5 10-3.5-2.5 3-6 4.5-10 3.5Z"
        fill="#C2DC80"
        stroke="#94B052"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M24 15V6.5c0-1 .6-2 1.8-2.3" stroke="#217A6E" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2", className)}>
      <PomoMark className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
      <span className="font-display text-3xl font-black tracking-tight text-ink [font-variation-settings:'SOFT'_100,'WONK'_1]">
        pomo
      </span>
    </Link>
  );
}

type ShapeKind = "triangle" | "diamond" | "circle" | "square";

/** As quatro formas do Kahoot, usadas como enfeite e marcadores. */
export function Shape({ kind, className, fill = "currentColor" }: { kind: ShapeKind; className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      {kind === "triangle" && <path d="M20 5 36 34H4Z" fill={fill} strokeLinejoin="round" />}
      {kind === "diamond" && <path d="M20 3 37 20 20 37 3 20Z" fill={fill} />}
      {kind === "circle" && <circle cx="20" cy="20" r="16" fill={fill} />}
      {kind === "square" && <rect x="6" y="6" width="28" height="28" rx="5" fill={fill} />}
    </svg>
  );
}

export const SHAPES: ShapeKind[] = ["triangle", "diamond", "circle", "square"];

type AvatarUser = { name: string; emoji: string; color: string };

export function UserAvatar({
  user,
  size = "md",
  online,
  className,
}: {
  user: AvatarUser;
  size?: "sm" | "md" | "lg" | "xl";
  online?: "RUNNING" | "PAUSED" | null;
  className?: string;
}) {
  const dims = { sm: "size-8 text-base", md: "size-11 text-xl", lg: "size-14 text-2xl", xl: "size-24 text-5xl" }[size];
  return (
    <span
      title={user.name}
      style={colorVars(user.color)}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--c-soft)] ring-2 ring-[var(--c)] ring-offset-2 ring-offset-card select-none",
        dims,
        className,
      )}
    >
      <span aria-hidden>{user.emoji}</span>
      {online && (
        <span
          className={cn(
            "live-dot absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-card",
            online === "RUNNING" ? "bg-[#3BB273]" : "bg-sun",
          )}
          aria-label={online === "RUNNING" ? "estudando agora" : "em pausa"}
        />
      )}
    </span>
  );
}

export function SubjectChip({
  subject,
  className,
}: {
  subject: { name: string; emoji: string; color: string } | null;
  className?: string;
}) {
  const c = color(subject?.color ?? "lavender");
  return (
    <span
      className={cn("inline-flex max-w-full items-center gap-1 truncate rounded-full px-2.5 py-0.5 text-xs font-extrabold", className)}
      style={{ background: c.soft, color: c.shadow }}
    >
      <span aria-hidden>{subject?.emoji ?? "✨"}</span>
      <span className="truncate">{subject?.name ?? "Livre"}</span>
    </span>
  );
}
