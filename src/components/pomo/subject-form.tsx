"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { motion } from "motion/react";
import { Archive, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { color, SUBJECT_EMOJIS } from "@/lib/palette";
import { formatDuration } from "@/lib/time";
import { archiveSubject, saveSubject } from "@/app/actions/subjects";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shape, SHAPES } from "./brand";
import { ColorPicker, EmojiPicker, FieldError } from "./pickers";

type Subject = { id: string; name: string; emoji: string; color: string; totalSec: number };

function SubjectDialog({ subject, trigger }: { subject?: Subject; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveSubject, undefined);
  const [emoji, setEmoji] = useState(subject?.emoji ?? SUBJECT_EMOJIS[0]);
  const [tint, setTint] = useState(subject?.color ?? "orchid");

  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      toast.success(subject ? "Matéria atualizada" : "Matéria criada! 📚");
    }
  }, [state, subject]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{subject ? "Editar matéria" : "Nova matéria"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          {subject && <input type="hidden" name="id" value={subject.id} />}
          <div className="grid gap-1.5">
            <Label htmlFor="subject-name">Nome</Label>
            <Input
              id="subject-name"
              name="name"
              defaultValue={subject?.name}
              placeholder="Ex.: Cálculo 1, Vetorial, Pesquisa"
              className="h-11 rounded-xl"
              required
            />
            <FieldError errors={state?.fieldErrors?.name} />
          </div>
          <div className="grid gap-1.5">
            <Label>Ícone</Label>
            <EmojiPicker name="emoji" options={SUBJECT_EMOJIS} value={emoji} onChange={setEmoji} />
          </div>
          <div className="grid gap-1.5">
            <Label>Cor</Label>
            <ColorPicker name="color" value={tint} onChange={setTint} />
          </div>
          {state?.error && <p className="text-sm font-bold text-destructive">{state.error}</p>}
          <Button size="lg" type="submit" disabled={pending}>
            Salvar {emoji}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewSubjectButton() {
  return (
    <SubjectDialog
      trigger={
        <Button size="lg">
          <Plus /> Nova matéria
        </Button>
      }
    />
  );
}

export function SubjectGrid({ subjects }: { subjects: Subject[] }) {
  const [, startTransition] = useTransition();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((s, i) => {
        const c = color(s.color);
        return (
          <motion.li
            key={s.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl p-5"
            style={{ background: c.bg, color: c.ink, boxShadow: `0 6px 0 ${c.shadow}` }}
          >
            <Shape kind={SHAPES[i % 4]} className="absolute -top-4 -right-4 size-24 opacity-20" fill={c.ink} />
            <span className="text-4xl">{s.emoji}</span>
            <h3 className="mt-3 truncate font-display text-2xl font-black">{s.name}</h3>
            <p className="text-sm font-bold opacity-85">{formatDuration(s.totalSec)} estudados</p>
            <div className="relative mt-4 flex gap-2">
              <SubjectDialog
                subject={s}
                trigger={
                  <Button size="sm" variant="white">
                    <Pencil /> Editar
                  </Button>
                }
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-current hover:bg-white/20 hover:text-current"
                onClick={() => {
                  if (confirm(`Arquivar "${s.name}"? O histórico continua salvo.`))
                    startTransition(() => archiveSubject(s.id));
                }}
              >
                <Archive /> Arquivar
              </Button>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
