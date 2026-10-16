import { LoginForm } from "@/components/pomo/auth-forms";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <>
      <p className="font-script text-4xl text-orchid">Olá de novo!</p>
      <h1 className="mb-8 font-display text-4xl font-black">Que bom te ver :)</h1>
      <LoginForm />
    </>
  );
}
