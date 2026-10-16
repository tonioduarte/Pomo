import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo, PomoMark } from "@/components/pomo/brand";
import { FloatingShapes } from "@/components/pomo/widgets";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/home");

  return (
    <div className="dot-grid flex min-h-dvh items-center justify-center p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-card shadow-[0_8px_0_var(--border)] ring-2 ring-border md:grid-cols-[1.05fr_1fr]">
        {/* Painel ilustrado — inspirado no card "Welcome" das referências */}
        <div className="relative hidden min-h-[560px] overflow-hidden bg-gradient-to-b from-[#FCE8ED] via-petal to-orchid md:block">
          <FloatingShapes count={12} />
          <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 500 220" preserveAspectRatio="none" aria-hidden>
            <path d="M0 120 C 90 60, 160 150, 260 100 S 420 40, 500 90 V220 H0Z" fill="#C2DC80" />
            <path d="M0 170 C 120 120, 220 200, 330 150 S 460 130, 500 150 V220 H0Z" fill="#217A6E" />
          </svg>
          <div className="relative flex h-full flex-col items-center justify-center p-10 text-center">
            <PomoMark className="size-24 drop-shadow-[0_6px_0_rgba(169,77,107,0.35)]" />
            <p className="mt-4 font-display text-xl font-black tracking-[0.5em] text-white uppercase">bem-vindo</p>
            <p className="font-script text-5xl text-ink/80">estude junto</p>
          </div>
          {/* Borda ondulada que "morde" o painel do formulário */}
          <svg className="absolute inset-y-0 -right-px h-full w-16 text-card" viewBox="0 0 60 600" preserveAspectRatio="none" aria-hidden>
            <path d="M60 0 H30 C 0 120, 55 220, 25 320 S 10 520, 40 600 H60Z" fill="currentColor" />
          </svg>
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
          <Logo className="mb-8 md:hidden" />
          {children}
        </div>
      </div>
    </div>
  );
}
