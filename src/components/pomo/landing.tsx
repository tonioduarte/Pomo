"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { color } from "@/lib/palette";
import { formatClock } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { Logo, Shape, SHAPES, UserAvatar } from "./brand";
import { FloatingShapes } from "./widgets";

const DEMO = [
  { name: "Lua", emoji: "🌙", color: "lavender", subject: "Cálculo 1", base: 5400, speed: 3 },
  { name: "Theo", emoji: "🦊", color: "tangerine", subject: "Vetorial", base: 5100, speed: 5 },
  { name: "Bia", emoji: "🌷", color: "orchid", subject: "Pesquisa", base: 4700, speed: 7 },
  { name: "Davi", emoji: "🐸", color: "forest", subject: "Física 2", base: 4300, speed: 4 },
];

/** Placar de mentirinha que vai se reordenando, estilo resultado do Kahoot. */
function HeroDemo() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const rows = DEMO.map((d) => ({ ...d, sec: d.base + d.speed * t * 6 })).sort((a, b) => b.sec - a.sec);
  const max = rows[0].sec;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 4 }}
      animate={{ opacity: 1, y: 0, rotate: 2 }}
      transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
      whileHover={{ rotate: 0, scale: 1.02 }}
      className="relative w-full max-w-md rounded-[2rem] border-2 border-border bg-card p-5 shadow-[0_10px_0_var(--border)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-wide text-muted-foreground uppercase">Sala</p>
          <p className="font-display text-2xl font-black">Maratona de Provas 🏆</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3F5EA] px-2.5 py-1 text-xs font-extrabold text-[#25834F]">
          <span className="live-dot size-2 rounded-full bg-[#3BB273]" /> ao vivo
        </span>
      </div>
      <ol className="flex flex-col gap-2">
        {rows.map((r, i) => {
          const c = color(r.color);
          return (
            <motion.li
              key={r.name}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="relative overflow-hidden rounded-2xl border-2 border-border p-2.5"
            >
              <motion.div
                className="absolute inset-y-0 left-0"
                style={{ background: c.soft }}
                animate={{ width: `${(r.sec / max) * 100}%` }}
              />
              <div className="relative flex items-center gap-3">
                <span
                  className="flex size-8 items-center justify-center rounded-lg font-display font-black"
                  style={{ background: c.bg, color: c.ink, boxShadow: `0 3px 0 ${c.shadow}` }}
                >
                  {i + 1}
                </span>
                <UserAvatar user={r} size="sm" online={i % 3 === 0 ? "RUNNING" : null} />
                <span className="flex-1">
                  <span className="block text-sm font-extrabold">{r.name}</span>
                  <span className="text-[11px] font-bold text-muted-foreground">{r.subject}</span>
                </span>
                <span className="font-mono text-sm font-bold tabular-nums">{formatClock(r.sec)}</span>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </motion.div>
  );
}

const STEPS = [
  { title: "Crie suas matérias", text: "Cálculo 1, Vetorial, Pesquisa… do seu jeito, com cor e emoji.", tint: "orchid" },
  { title: "Dê play no cronômetro", text: "Cada minuto de foco soma. Pausou? A gente pausa junto.", tint: "forest" },
  { title: "Desafie a galera", text: "Monte uma sala de 1 semana, 1 mês ou o tempo que quiser.", tint: "sun" },
  { title: "Leve a coroa", text: "Quem estudar mais até o fim ganha. Simples e viciante.", tint: "sky" },
] as const;

const SUBJECTS = ["Cálculo 1", "Vetorial", "Pesquisa", "Física 2", "Anatomia", "Direito Civil", "Álgebra Linear", "Redação", "Química Orgânica", "Programação"];

export function Landing() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 220]);

  return (
    <div className="overflow-x-clip bg-lilac">
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/login" />} nativeButton={false}>
            Entrar
          </Button>
          <Button render={<Link href="/signup" />} nativeButton={false}>
            Criar conta
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative">
        <FloatingShapes count={14} className="opacity-70" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-8 pb-20 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:pt-16">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-script text-5xl text-orchid sm:text-6xl"
            >
              o gymrats dos estudos
            </motion.p>
            <h1 className="font-display text-[clamp(3.2rem,9vw,7.5rem)] leading-[0.88] font-black tracking-tight text-ink [font-variation-settings:'SOFT'_100,'WONK'_1]">
              {["Estude", "junto,", "ganhe"].map((w, i) => (
                <motion.span
                  key={w}
                  className="mr-[0.2em] inline-block"
                  initial={{ opacity: 0, y: 60, rotate: -6 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 + i * 0.12 }}
                >
                  {w}
                </motion.span>
              ))}
              <motion.span
                className="relative inline-block italic text-orchid"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 12, delay: 0.55 }}
              >
                junto.
                <svg viewBox="0 0 200 20" className="absolute -bottom-2 left-0 w-full" aria-hidden>
                  <motion.path
                    d="M3 14 C 50 2, 120 22, 197 6"
                    fill="none"
                    stroke="#C2DC80"
                    strokeWidth="7"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  />
                </svg>
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 max-w-lg text-lg font-semibold text-ink/70"
            >
              Cronometre seu estudo, poste check-ins, veja quem está estudando agora e dispute salas com os amigos.
              Quem somar mais horas leva a coroa. 👑
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button size="lg" className="h-14 px-8 text-lg" render={<Link href="/signup" />} nativeButton={false}>
                Começar grátis <ArrowRight />
              </Button>
              <Button size="lg" variant="white" className="h-14 px-8 text-lg" render={<Link href="/login" />} nativeButton={false}>
                Já tenho conta
              </Button>
            </motion.div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* Faixa de matérias */}
      <section className="relative -rotate-2 border-y-4 border-ink bg-orchid py-4">
        <div className="flex w-max marquee">
          {[...SUBJECTS, ...SUBJECTS].map((s, i) => (
            <span key={i} className="flex items-center gap-6 px-6 font-display text-3xl font-black whitespace-nowrap text-white italic">
              {s}
              <Shape kind={SHAPES[i % 4]} className="size-6" fill={["#C2DC80", "#F4C24E", "#fff", "#6FA8DC"][i % 4]} />
            </span>
          ))}
        </div>
      </section>

      {/* Como funciona — blocos de resposta do Kahoot */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
        <p className="text-center font-script text-4xl text-orchid">como funciona</p>
        <h2 className="mb-12 text-center font-display text-5xl font-black">Quatro passos, zero desculpa</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {STEPS.map((s, i) => {
            const c = color(s.tint);
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 200, damping: 18, delay: i * 0.08 }}
                className="flex items-start gap-5 rounded-3xl p-6 sm:p-8"
                style={{ background: c.bg, color: c.ink, boxShadow: `0 8px 0 ${c.shadow}` }}
              >
                <Shape kind={SHAPES[i]} className="size-14 shrink-0" fill={c.ink} />
                <div>
                  <h3 className="font-display text-3xl font-black">{s.title}</h3>
                  <p className="mt-1 text-lg font-semibold opacity-85">{s.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA em papel creme */}
      <section className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-8">
        <motion.div style={{ rotate }} className="absolute -top-10 right-6 hidden size-28 sm:block" aria-hidden>
          <Shape kind="diamond" className="size-full" fill="#C2DC80" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
          whileInView={{ opacity: 1, scale: 1, rotate: -1 }}
          viewport={{ once: true }}
          className="paper relative rounded-[2rem] border-2 border-[#E9DFA6] px-6 py-14 text-center shadow-[0_8px_0_#E9DFA6]"
        >
          <p className="font-script text-5xl text-orchid">sua sala te espera</p>
          <h2 className="mt-2 font-display text-5xl font-black text-[#6B3E22] sm:text-6xl">
            Bora pro <span className="italic">foco</span>?
          </h2>
          <Button size="lg" className="mt-8 h-14 px-10 text-lg" render={<Link href="/signup" />} nativeButton={false}>
            Criar minha conta 🍅
          </Button>
        </motion.div>
      </section>

      <footer className="border-t-2 border-border py-8 text-center text-sm font-bold text-muted-foreground">
        feito com 🍅 e muito café · Pomo
      </footer>
    </div>
  );
}
