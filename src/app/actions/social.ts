"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canSeeSession } from "@/lib/queries";
import { commentSchema, type FormState } from "@/lib/validation";
import { REACTIONS } from "@/lib/palette";

export async function addComment(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const sessionId = formData.get("sessionId")?.toString() ?? "";
  const parsed = commentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  if (!(await canSeeSession(user.id, sessionId))) return { error: "Sessão não encontrada" };

  await db.comment.create({ data: { studySessionId: sessionId, userId: user.id, body: parsed.data.body } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteComment(commentId: string) {
  const user = await requireUser();
  await db.comment.deleteMany({ where: { id: commentId, userId: user.id } });
  revalidatePath("/", "layout");
}

export async function toggleReaction(sessionId: string, emoji: string) {
  const user = await requireUser();
  if (!REACTIONS.includes(emoji) || !(await canSeeSession(user.id, sessionId))) return;
  const key = { studySessionId_userId_emoji: { studySessionId: sessionId, userId: user.id, emoji } };
  const existing = await db.reaction.findUnique({ where: key });
  if (existing) await db.reaction.delete({ where: key });
  else await db.reaction.create({ data: { studySessionId: sessionId, userId: user.id, emoji } });
  revalidatePath("/", "layout");
}
