import { z } from "zod";
import { COLOR_NAMES } from "@/lib/palette";

const colorName = z.enum(COLOR_NAMES as [string, ...string[]]);

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(40),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Mínimo 3 caracteres")
    .max(20)
    .regex(/^[a-z0-9_.]+$/, "Use só letras, números, _ ou ."),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(1, "Digite sua senha"),
});

export const subjectSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome à matéria").max(40),
  emoji: z.string().min(1).max(8),
  color: colorName,
});

export const roomSchema = z
  .object({
    name: z.string().trim().min(2, "Nome muito curto").max(50),
    description: z.string().trim().max(200).optional(),
    emoji: z.string().min(1).max(8),
    color: colorName,
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine((r) => r.endsAt > r.startsAt, { message: "O fim precisa ser depois do início", path: ["endsAt"] });

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(40),
  bio: z.string().trim().max(160).optional(),
  emoji: z.string().min(1).max(8),
  color: colorName,
});

export const finishSchema = z.object({
  title: z.string().trim().max(80).optional(),
  note: z.string().trim().max(1000).optional(),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Escreva algo").max(500),
});

export type FormState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string[] | undefined> } | undefined;
