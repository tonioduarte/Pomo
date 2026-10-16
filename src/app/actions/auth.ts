"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createAuthSession, destroyAuthSession } from "@/lib/auth";
import { loginSchema, signupSchema, type FormState } from "@/lib/validation";
import { AVATAR_EMOJIS, COLOR_NAMES } from "@/lib/palette";

const STARTER_SUBJECTS = [
  { name: "Cálculo 1", emoji: "🧮", color: "orchid" },
  { name: "Vetorial", emoji: "📐", color: "forest" },
  { name: "Pesquisa", emoji: "🔬", color: "sun" },
];

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const { name, username, email, password } = parsed.data;

  const taken = await db.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (taken) return { error: taken.email === email ? "Esse email já tem conta" : "Esse @ já está em uso" };

  const user = await db.user.create({
    data: {
      name,
      username,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      emoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
      color: COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)],
      subjects: { create: STARTER_SUBJECTS },
    },
  });
  await createAuthSession(user.id);
  redirect("/home");
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return { error: "Email ou senha incorretos" };
  }
  await createAuthSession(user.id);
  redirect("/home");
}

export async function logout() {
  await destroyAuthSession();
  redirect("/");
}
