"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { motion } from "motion/react";
import { Check, Pause, Play, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { color } from "@/lib/palette";
import { formatClock, formatDuration } from "@/lib/time";
import { discardStudy, finishStudy, pauseStudy, resumeStudy, startStudy } from "@/app/actions/study";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shape, SHAPES, SubjectChip } from "./brand";
import { useStudy } from "./study-provider";
import { Confetti } from "./widgets";

type Subject = { id: string; name: string; emoji: string; color: string };

const POMODORO_SEC = 25 * 60;

export function StudyTimer({ subjects }: { subjects: Subject[] }) {
  const { mine, mySeconds, refresh } = useStudy();
  const [picked, setPicked] = useState<string | null>(subjects[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const [finishing, setFinishing] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const router = useRouter();

  // Comemora cada pomodoro completo
  const pomodoros = Math.floor(mySeconds / POMODORO_SEC);
  const lastPomodoros = useRef(pomodoros);
  useEffect(() => {
    if (pomodoros > lastPomodoros.current && mine?.status === "RUNNING") {
      toast.success(`Pomodoro #${pomodoros} completo! 🍅`, { description: "Respira, alonga e volta com tudo." });
      setConfetti(Date.now());
    }
    lastPomodoros.current = pomodoros;
  }, [pomodoros, mine?.status]);

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      await refresh();
      router.refresh();
    });

  if (!mine) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="font-display text-2xl font-bold">O que vamos estudar?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[...subjects, null].map((s, i) => {
            const c = color(s?.color ?? "lavender");
            const selected = picked === (s?.id ?? null);
            return (
              <motion.button
                key={s?.id ?? "livre"}
                type="button"
                onClick={() => setPicked(s?.id ?? null)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, scale: selected ? 1.02 : 1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.04 }}
                className="relative flex items-center gap-4 rounded-2xl p-4 text-left font-extrabold"
                style={{
                  background: c.bg,
                  color: c.ink,
                  boxShadow: selected ? `0 0 0 4px #fff, 0 0 0 7px ${c.bg}, 0 6px 0 7px ${c.shadow}` : `0 6px 0 ${c.shadow}`,
                }}
                aria-pressed={selected}
              >
                <Shape kind={SHAPES[i % 4]} className="size-8 shrink-0" fill={c.ink} />
                <span className="text-2xl">{s?.emoji ?? "✨"}</span>
                <span className="min-w-0 flex-1 truncate text-lg">{s?.name ?? "Estudo livre"}</span>
                {selected && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-white/30 p-1">
                    <Check className="size-5" />
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">
          Faltando matéria?{" "}
          <Link href="/subjects" className="font-extrabold text-orchid underline">
            Crie as suas
          </Link>
          .
        </p>
        <Button
          size="lg"
          className="h-16 self-center rounded-full px-12 text-xl"
          disabled={pending}
          onClick={() => run(() => startStudy(picked))}
        >
          <Play className="size-6 fill-current" /> Começar
        </Button>
      </div>
    );
  }

  const c = color(mine.subject?.color ?? "forest");
  const progress = (mySeconds % POMODORO_SEC) / POMODORO_SEC;
  const running = mine.status === "RUNNING";
  const R = 46;
  const circumference = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center gap-8">
      <Confetti fire={confetti} />
      <SubjectChip subject={mine.subject} className="px-4 py-1.5 text-base" />

      <motion.div
        className="relative aspect-square w-full max-w-[22rem]"
        animate={running ? { scale: [1, 1.015, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: running ? Infinity : 0 }}
      >
        <div className="absolute inset-4 rounded-full" style={{ background: c.soft }} />
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border)" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={c.bg}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl">{mine.subject?.emoji ?? "⏱️"}</span>
          <span className="mt-2 font-mono text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">
            {formatClock(mySeconds)}
          </span>
          <span className="mt-2 text-sm font-extrabold text-muted-foreground">
            {running ? `🍅 × ${pomodoros} · próximo em ${formatDuration(POMODORO_SEC - (mySeconds % POMODORO_SEC))}` : "pausado ☕"}
          </span>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {running ? (
          <Button size="lg" variant="sun" disabled={pending} onClick={() => run(pauseStudy)}>
            <Pause className="fill-current" /> Pausar
          </Button>
        ) : (
          <Button size="lg" variant="leaf" disabled={pending} onClick={() => run(resumeStudy)}>
            <Play className="fill-current" /> Continuar
          </Button>
        )}
        <Button size="lg" disabled={pending} onClick={() => setFinishing(true)}>
          <Square className="fill-current" /> Finalizar
        </Button>
        <Button
          size="lg"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (confirm("Descartar essa sessão? O tempo não vai contar.")) run(discardStudy);
          }}
        >
          <Trash2 /> Descartar
        </Button>
      </div>

      <FinishDialog
        open={finishing}
        onOpenChange={setFinishing}
        seconds={mySeconds}
        onDone={async (id) => {
          setConfetti(Date.now());
          await refresh();
          setTimeout(() => router.push(id ? `/s/${id}` : "/home"), 900);
        }}
      />
    </div>
  );
}

function FinishDialog({
  open,
  onOpenChange,
  seconds,
  onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  seconds: number;
  onDone: (id?: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const submit = () =>
    startTransition(async () => {
      const res = await finishStudy({ title, note });
      if ("error" in res) return void toast.error(res.error);
      onOpenChange(false);
      if ("discarded" in res) {
        toast("Sessão com menos de 1 minuto foi descartada.");
        return onDone();
      }
      toast.success(`Check-in publicado: ${formatDuration(res.durationSec)} 🎉`);
      onDone(res.id);
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Mandou bem! 🎉</DialogTitle>
          <DialogDescription>
            Você estudou <b>{formatDuration(seconds)}</b>. Conta pra galera como foi — isso vira seu check-in no feed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Título (ex.: Lista 3 de integrais)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            className="h-11 rounded-xl"
          />
          <Textarea
            placeholder="O que você estudou? Alguma dica, dúvida ou desabafo?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={4}
            className="rounded-xl"
          />
        </div>
        <Button size="lg" onClick={submit} disabled={pending} className="w-full">
          <Check /> Publicar check-in
        </Button>
      </DialogContent>
    </Dialog>
  );
}
