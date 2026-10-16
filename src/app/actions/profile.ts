"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { profileSchema, type FormState } from "@/lib/validation";

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  await db.user.update({ where: { id: user.id }, data: { ...parsed.data, bio: parsed.data.bio || null } });
  revalidatePath("/", "layout");
  return { ok: true };
}
