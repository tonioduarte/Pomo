"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { hitRateLimit, RULES, tooManyAttemptsMessage } from "@/lib/rate-limit";
import { roomSchema, type FormState } from "@/lib/validation";

function inviteCode() {
  // Sem 0/O/1/I para ficar fácil de ditar
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(6), (b) => alphabet[b % alphabet.length]).join("");
}

export async function createRoom(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = roomSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const room = await db.room.create({
    data: {
      ...parsed.data,
      description: parsed.data.description || null,
      inviteCode: inviteCode(),
      ownerId: user.id,
      members: { create: { userId: user.id } },
    },
  });
  redirect(`/rooms/${room.id}`);
}

export async function joinRoom(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const limit = await hitRateLimit(`join:user:${user.id}`, RULES.joinRoomUser);
  if (!limit.allowed) return { error: tooManyAttemptsMessage(limit.retryAfterSec) };

  const code = formData.get("code")?.toString().trim().toUpperCase() ?? "";
  const room = await db.room.findUnique({ where: { inviteCode: code } });
  if (!room) return { error: "Não achamos nenhuma sala com esse código" };

  await db.roomMember.upsert({
    where: { roomId_userId: { roomId: room.id, userId: user.id } },
    create: { roomId: room.id, userId: user.id },
    update: {},
  });
  redirect(`/rooms/${room.id}`);
}

export async function leaveRoom(roomId: string) {
  const user = await requireUser();
  await db.roomMember.deleteMany({ where: { roomId, userId: user.id } });
  revalidatePath("/rooms");
  redirect("/rooms");
}
