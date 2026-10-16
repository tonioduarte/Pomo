"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { AVATAR_EMOJIS } from "@/lib/palette";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "./brand";
import { ColorPicker, EmojiPicker, FieldError } from "./pickers";

export function ProfileForm({ user }: { user: { name: string; bio: string | null; emoji: string; color: string } }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [name, setName] = useState(user.name);
  const [emoji, setEmoji] = useState(user.emoji);
  const [tint, setTint] = useState(user.color);

  useEffect(() => {
    if (state?.ok) toast.success("Perfil salvo ✨");
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <UserAvatar user={{ name, emoji, color: tint }} size="xl" />
        <p className="text-sm text-muted-foreground">Seu avatar aparece no placar, no feed e na lista de quem está online.</p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
        <FieldError errors={state?.fieldErrors?.name} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={user.bio ?? ""} maxLength={160} placeholder="Eng. Civil · 3º período · viciada em café" className="rounded-xl" />
      </div>
      <div className="grid gap-1.5">
        <Label>Avatar</Label>
        <EmojiPicker name="emoji" options={AVATAR_EMOJIS} value={emoji} onChange={setEmoji} />
      </div>
      <div className="grid gap-1.5">
        <Label>Sua cor</Label>
        <ColorPicker name="color" value={tint} onChange={setTint} />
      </div>
      <Button size="lg" type="submit" disabled={pending} className="self-start">
        Salvar perfil
      </Button>
    </form>
  );
}
