"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createAuthSession, destroyAuthSession } from "@/lib/auth";
import { clearRateLimit, clientIp, hitRateLimit, RULES, tooManyAttemptsMessage } from "@/lib/rate-limit";
import { loginSchema, signupSchema, type FormState } from "@/lib/validation";
import { AVATAR_EMOJIS, COLOR_NAMES } from "@/lib/palette";

const STARTER_SUBJECTS = [
  { name: "Cálculo 1", emoji: "🧮", color: "orchid" },
  { name: "Vetorial", emoji: "📐", color: "forest" },
  { name: "Pesquisa", emoji: "🔬", color: "sun" },
];

// Hash usado quando o email não existe, para o login levar o mesmo tempo
// nos dois casos e não revelar quais emails têm conta.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hash("pomo-dummy-password", 10));

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const limit = await hitRateLimit(`signup:ip:${clientIp(await headers())}`, RULES.signupIp);
  if (!limit.allowed) return { error: tooManyAttemptsMessage(limit.retryAfterSec) };

  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const { name, username, email, password } = parsed.data;

  const taken = await db.user.findFirst({ where: { OR: [{ email }, { username }] }, select: { id: true } });
  // Mensagem única para email e @, para não confirmar se um email está cadastrado.
  if (taken) return { error: "Esse email ou @ não está disponível. Se você já tem conta, é só entrar." };

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
  const { email, password } = parsed.data;

  const emailKey = `login:email:${email}`;
  const [byEmail, byIp] = await Promise.all([
    hitRateLimit(emailKey, RULES.loginEmail),
    hitRateLimit(`login:ip:${clientIp(await headers())}`, RULES.loginIp),
  ]);
  if (!byEmail.allowed || !byIp.allowed) {
    return { error: tooManyAttemptsMessage(Math.max(byEmail.retryAfterSec, byIp.retryAfterSec)) };
  }

  const user = await db.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) return { error: "Email ou senha incorretos" };

  await clearRateLimit(emailKey);
  await createAuthSession(user.id);
  redirect("/home");
}

export async function logout() {
  await destroyAuthSession();
  redirect("/");
}
