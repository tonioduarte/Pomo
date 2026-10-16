"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PresenceEntry } from "@/lib/queries";
import { formatClock } from "@/lib/time";

export type MySession = {
  id: string;
  status: "RUNNING" | "PAUSED";
  subject: PresenceEntry["subject"];
  elapsedSec: number;
} | null;

export type PresenceSnapshot = { mine: MySession; online: PresenceEntry[] };

type Ctx = PresenceSnapshot & {
  /** Segundos do seu cronômetro, atualizando a cada segundo. */
  mySeconds: number;
  /** Segundos ao vivo de outra pessoa online. */
  secondsFor: (entry: PresenceEntry) => number;
  refresh: () => Promise<void>;
  setMine: (mine: MySession) => void;
};

const StudyContext = createContext<Ctx | null>(null);

const POLL_MS = 15_000;
const PING_MS = 30_000;

export function StudyProvider({ initial, children }: { initial: PresenceSnapshot; children: React.ReactNode }) {
  const [snap, setSnap] = useState(initial);
  const [fetchedAt, setFetchedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch("/api/presence", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSnap({ mine: data.mine, online: data.online });
        setFetchedAt(Date.now());
      }
    } finally {
      inFlight.current = false;
    }
  }, []);

  // Relógio local
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Quem está online
  useEffect(() => {
    const t = setInterval(refresh, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  // Sinal de vida enquanto o cronômetro está aberto
  const hasSession = !!snap.mine;
  useEffect(() => {
    if (!hasSession) return;
    const ping = () => fetch("/api/study/ping", { method: "POST" }).catch(() => {});
    ping();
    const t = setInterval(ping, PING_MS);
    return () => clearInterval(t);
  }, [hasSession]);

  const drift = Math.max(0, (now - fetchedAt) / 1000);
  const mySeconds = snap.mine ? snap.mine.elapsedSec + (snap.mine.status === "RUNNING" ? drift : 0) : 0;

  // Mostra o cronômetro na aba do navegador
  useEffect(() => {
    if (snap.mine?.status !== "RUNNING") return;
    const original = document.title;
    document.title = `${formatClock(mySeconds)} · ${snap.mine.subject?.name ?? "Estudando"}`;
    return () => {
      document.title = original;
    };
  }, [mySeconds, snap.mine]);

  const value = useMemo<Ctx>(
    () => ({
      ...snap,
      mySeconds,
      secondsFor: (e) => e.elapsedSec + (e.status === "RUNNING" ? drift : 0),
      refresh,
      setMine: (mine) => {
        setSnap((s) => ({ ...s, mine }));
        setFetchedAt(Date.now());
      },
    }),
    [snap, mySeconds, drift, refresh],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy precisa estar dentro de <StudyProvider>");
  return ctx;
}
