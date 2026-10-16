"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, X } from "lucide-react";
import { addComment, deleteComment } from "@/app/actions/social";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "./brand";

type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  user: { id: string; username: string; name: string; emoji: string; color: string };
};

export function Comments({ sessionId, comments, viewerId }: { sessionId: string; comments: CommentItem[]; viewerId: string }) {
  const [state, action, pending] = useActionState(addComment, undefined);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <section id="comentarios" className="sticker p-5">
      <h2 className="mb-4 font-display text-xl font-bold">Comentários ({comments.length})</h2>
      <ul className="mb-4 flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.li
              key={c.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3"
            >
              <Link href={`/u/${c.user.username}`}>
                <UserAvatar user={c.user} size="sm" />
              </Link>
              <div className="group min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-lilac px-4 py-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-extrabold">{c.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(c.createdAt, { addSuffix: true, locale: ptBR })}
                  </span>
                  {c.user.id === viewerId && (
                    <button
                      onClick={() => startTransition(() => deleteComment(c.id))}
                      className="ml-auto opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      aria-label="Apagar comentário"
                    >
                      <X className="size-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <p className="text-[15px] whitespace-pre-line">{c.body}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <form ref={formRef} action={action} className="flex items-end gap-2">
        <input type="hidden" name="sessionId" value={sessionId} />
        <Textarea
          name="body"
          placeholder="Manda um incentivo… 💪"
          rows={1}
          maxLength={500}
          className="min-h-11 resize-none rounded-2xl"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          required
        />
        <Button type="submit" size="icon" disabled={pending} aria-label="Enviar">
          <Send />
        </Button>
      </form>
      {(state?.error || state?.fieldErrors?.body) && (
        <p className="mt-2 text-sm font-bold text-destructive">{state.error ?? state.fieldErrors?.body?.[0]}</p>
      )}
    </section>
  );
}
