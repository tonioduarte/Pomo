"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Home, LogOut, Settings, Timer, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/time";
import { color } from "@/lib/palette";
import { logout } from "@/app/actions/auth";
import { Logo, UserAvatar } from "./brand";
import { useStudy } from "./study-provider";

type ShellUser = { username: string; name: string; emoji: string; color: string };

const nav = (username: string) => [
  { href: "/home", label: "Início", icon: Home, tint: "orchid" },
  { href: "/study", label: "Estudar", icon: Timer, tint: "forest" },
  { href: "/rooms", label: "Salas", icon: Trophy, tint: "sun" },
  { href: "/subjects", label: "Matérias", icon: BookOpen, tint: "sky" },
  { href: `/u/${username}`, label: "Perfil", icon: User, tint: "lavender" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const items = nav(user.username);

  return (
    <div className="dot-grid min-h-dvh">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r-2 border-border bg-card px-4 py-6 lg:flex">
        <Logo href="/home" className="px-3" />
        <nav className="mt-10 flex flex-col gap-1.5">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const c = color(item.tint);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-4 py-3 font-extrabold transition-colors",
                  active ? "text-white" : "text-ink/70 hover:bg-accent hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: c.bg, boxShadow: `0 4px 0 ${c.shadow}` }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <item.icon className="relative size-5" style={{ color: active ? c.ink : c.bg }} />
                <span className="relative" style={{ color: active ? c.ink : undefined }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1.5 border-t-2 border-border pt-4">
          <Link href="/settings" className="flex items-center gap-3 rounded-2xl px-4 py-2.5 font-bold text-ink/70 hover:bg-accent">
            <Settings className="size-5" /> Configurações
          </Link>
          <form action={logout}>
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 font-bold text-ink/70 hover:bg-accent">
              <LogOut className="size-5" /> Sair
            </button>
          </form>
          <Link href={`/u/${user.username}`} className="mt-2 flex items-center gap-3 rounded-2xl bg-lilac p-3">
            <UserAvatar user={user} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold">{user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">@{user.username}</span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Topo (mobile) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-border bg-card/90 px-4 py-2.5 backdrop-blur lg:hidden">
        <Logo href="/home" className="scale-90 origin-left" />
        <Link href="/settings" aria-label="Configurações">
          <UserAvatar user={user} size="sm" />
        </Link>
      </header>

      <main className="pb-32 lg:pb-12 lg:pl-64">{children}</main>

      <MiniTimer />

      {/* Barra inferior (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-card px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
        <ul className="grid grid-cols-5 items-end">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const c = color(item.tint);
            const center = item.href === "/study";
            return (
              <li key={item.href} className="flex justify-center">
                <Link href={item.href} className="flex flex-col items-center gap-0.5 text-[11px] font-extrabold">
                  <motion.span
                    whileTap={{ scale: 0.85 }}
                    className={cn("flex items-center justify-center rounded-2xl transition-all", center ? "-mt-7 size-14" : "size-10")}
                    style={{
                      background: active || center ? c.bg : "transparent",
                      boxShadow: active || center ? `0 4px 0 ${c.shadow}` : undefined,
                      color: active || center ? c.ink : c.bg,
                    }}
                  >
                    <item.icon className={center ? "size-7" : "size-5"} />
                  </motion.span>
                  <span className={active ? "text-ink" : "text-ink/50"}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Pílula flutuante com o cronômetro, visível fora da página de estudo. */
function MiniTimer() {
  const { mine, mySeconds } = useStudy();
  const pathname = usePathname();
  const show = !!mine && pathname !== "/study";
  const c = color(mine?.subject?.color ?? "forest");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed right-4 bottom-24 z-40 lg:right-8 lg:bottom-8"
        >
          <Link
            href="/study"
            className="flex items-center gap-3 rounded-full py-2 pr-5 pl-2 font-extrabold"
            style={{ background: c.bg, color: c.ink, boxShadow: `0 5px 0 ${c.shadow}` }}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-white/25 text-lg">
              {mine.subject?.emoji ?? "⏱️"}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] opacity-80">{mine.status === "RUNNING" ? "estudando" : "em pausa"}</span>
              <span className="font-mono text-lg tabular-nums">{formatClock(mySeconds)}</span>
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
