"use client";

import { useActionState, useState } from "react";
import { Plus, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROOM_EMOJIS } from "@/lib/palette";
import { createRoom, joinRoom } from "@/app/actions/rooms";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker, EmojiPicker, FieldError } from "./pickers";

const DURATIONS = [
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "1 mês", days: 30 },
  { label: "Personalizado", days: 0 },
];

/** "2026-10-16T14:30" no horário local, para inputs datetime-local. */
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CreateRoomDialog() {
  const [state, action, pending] = useActionState(createRoom, undefined);
  const [emoji, setEmoji] = useState(ROOM_EMOJIS[0]);
  const [tint, setTint] = useState("orchid");
  const [days, setDays] = useState(30);
  const [start] = useState(() => new Date());
  const [customEnd, setCustomEnd] = useState(() => toLocalInput(new Date(Date.now() + 30 * 864e5)));
  const end = days ? new Date(start.getTime() + days * 864e5) : new Date(customEnd);

  return (
    <Dialog>
      <DialogTrigger render={<Button size="lg" />}>
        <Plus /> Criar sala
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Nova sala de competição</DialogTitle>
          <DialogDescription>Quem estudar mais tempo até o fim do desafio leva a coroa. 👑</DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="room-name">Nome</Label>
            <Input id="room-name" name="name" placeholder="Ex.: Maratona de Cálculo" className="h-11 rounded-xl" required />
            <FieldError errors={state?.fieldErrors?.name} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="room-desc">Descrição (opcional)</Label>
            <Textarea id="room-desc" name="description" placeholder="Regras, prêmio, recado…" className="rounded-xl" rows={2} />
          </div>
          <div className="grid gap-1.5">
            <Label>Ícone</Label>
            <EmojiPicker name="emoji" options={ROOM_EMOJIS} value={emoji} onChange={setEmoji} />
          </div>
          <div className="grid gap-1.5">
            <Label>Cor</Label>
            <ColorPicker name="color" value={tint} onChange={setTint} />
          </div>
          <div className="grid gap-1.5">
            <Label>Duração</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DURATIONS.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setDays(d.days)}
                  className={cn(
                    "rounded-xl border-2 px-2 py-2 text-sm font-extrabold transition-colors",
                    days === d.days ? "border-orchid bg-petal/30 text-orchid" : "border-border hover:bg-accent",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {days === 0 && (
              <Input
                type="datetime-local"
                value={customEnd}
                min={toLocalInput(new Date(Date.now() + 36e5))}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            )}
            <p className="text-xs font-bold text-muted-foreground">
              Começa agora e termina em{" "}
              {isNaN(end.getTime()) ? "—" : end.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <input type="hidden" name="startsAt" value={start.toISOString()} />
            <input type="hidden" name="endsAt" value={isNaN(end.getTime()) ? "" : end.toISOString()} />
            <FieldError errors={state?.fieldErrors?.endsAt} />
          </div>
          {state?.error && <p className="text-sm font-bold text-destructive">{state.error}</p>}
          <Button size="lg" type="submit" disabled={pending}>
            Criar sala {emoji}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function JoinRoomForm() {
  const [state, action, pending] = useActionState(joinRoom, undefined);
  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          name="code"
          placeholder="CÓDIGO"
          maxLength={6}
          autoComplete="off"
          className="h-12 rounded-xl text-center font-mono text-lg font-bold tracking-[0.3em] uppercase"
          required
        />
        <Button type="submit" size="lg" variant="forest" disabled={pending}>
          <Ticket /> Entrar
        </Button>
      </div>
      {state?.error && <p className="text-sm font-bold text-destructive">{state.error}</p>}
    </form>
  );
}
