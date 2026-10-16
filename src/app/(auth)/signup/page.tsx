import { SignupForm } from "@/components/pomo/auth-forms";

export const metadata = { title: "Criar conta" };

export default function SignupPage() {
  return (
    <>
      <p className="font-script text-4xl text-orchid">Olá!</p>
      <h1 className="mb-8 font-display text-4xl font-black">Bora começar a estudar?</h1>
      <SignupForm />
    </>
  );
}
