"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "./pickers";

function Field({
  name,
  label,
  type = "text",
  placeholder,
  errors,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  errors?: string[];
  autoComplete?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="font-extrabold">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 rounded-2xl border-2 bg-white text-base"
        required
      />
      <FieldError errors={errors} />
    </div>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field name="email" label="Email" type="email" placeholder="voce@email.com" autoComplete="email" errors={state?.fieldErrors?.email} />
      <Field name="password" label="Senha" type="password" placeholder="••••••••" autoComplete="current-password" errors={state?.fieldErrors?.password} />
      {state?.error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">{state.error}</p>}
      <Button size="lg" type="submit" disabled={pending} className="mt-2">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/signup" className="font-extrabold text-orchid underline">
          Criar agora
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Nome" placeholder="Ana Souza" autoComplete="name" errors={state?.fieldErrors?.name} />
        <Field name="username" label="@ usuário" placeholder="ana.estuda" autoComplete="username" errors={state?.fieldErrors?.username} />
      </div>
      <Field name="email" label="Email" type="email" placeholder="voce@email.com" autoComplete="email" errors={state?.fieldErrors?.email} />
      <Field name="password" label="Senha" type="password" placeholder="mínimo 8 caracteres" autoComplete="new-password" errors={state?.fieldErrors?.password} />
      {state?.error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">{state.error}</p>}
      <Button size="lg" type="submit" disabled={pending} className="mt-2">
        {pending ? "Criando…" : "Criar conta 🍅"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-extrabold text-orchid underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
