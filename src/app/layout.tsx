import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito, Pinyon_Script } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});
const pinyon = Pinyon_Script({ variable: "--font-pinyon", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: { default: "Pomo — estude junto", template: "%s · Pomo" },
  description: "Cronometre seus estudos, crie salas de competição com amigos e veja quem está estudando agora.",
};

export const viewport: Viewport = {
  themeColor: "#D56989",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${fraunces.variable} ${pinyon.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
