"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { subjectSchema, type FormState } from "@/lib/validation";

export async function saveSubject(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const id = formData.get("id")?.toString() || undefined;

  const clash = await db.subject.findFirst({
    where: { userId: user.id, name: parsed.data.name, NOT: id ? { id } : undefined },
  });
  if (clash && !clash.archived) return { error: "Você já tem uma matéria com esse nome" };

  if (id) {
    await db.subject.updateMany({ where: { id, userId: user.id }, data: parsed.data });
  } else if (clash) {
    await db.subject.update({ where: { id: clash.id }, data: { ...parsed.data, archived: false } });
  } else {
    await db.subject.create({ data: { ...parsed.data, userId: user.id } });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function archiveSubject(id: string) {
  const user = await requireUser();
  await db.subject.updateMany({ where: { id, userId: user.id }, data: { archived: true } });
  revalidatePath("/", "layout");
}
