import { db } from "@/lib/db";

export type RateRule = { limit: number; windowSec: number };
export type Bucket = { count: number; resetAt: Date };

export const RULES = {
  /** Por email: protege uma conta específica contra chute de senha. */
  loginEmail: { limit: 5, windowSec: 15 * 60 },
  /** Por IP: protege contra quem testa muitas contas de uma vez. */
  loginIp: { limit: 20, windowSec: 15 * 60 },
  signupIp: { limit: 5, windowSec: 60 * 60 },
  /** Códigos de sala têm ~1 bilhão de combinações; isso torna o chute inviável. */
  joinRoomUser: { limit: 10, windowSec: 15 * 60 },
} satisfies Record<string, RateRule>;

/** Conta mais uma tentativa numa janela fixa. Função pura para facilitar os testes. */
export function applyHit(bucket: Bucket | null, now: Date, rule: RateRule) {
  const expired = !bucket || bucket.resetAt <= now;
  const next: Bucket = expired
    ? { count: 1, resetAt: new Date(now.getTime() + rule.windowSec * 1000) }
    : { count: bucket.count + 1, resetAt: bucket.resetAt };
  const allowed = next.count <= rule.limit;
  const retryAfterSec = allowed ? 0 : Math.ceil((next.resetAt.getTime() - now.getTime()) / 1000);
  return { bucket: next, allowed, retryAfterSec };
}

/** Registra a tentativa e diz se ela está liberada. */
export async function hitRateLimit(key: string, rule: RateRule) {
  const now = new Date();
  const current = await db.rateLimit.findUnique({ where: { key } });
  const result = applyHit(current, now, rule);
  await db.rateLimit.upsert({
    where: { key },
    create: { key, ...result.bucket },
    update: result.bucket,
  });
  return result;
}

export async function clearRateLimit(key: string) {
  await db.rateLimit.deleteMany({ where: { key } });
}

export function tooManyAttemptsMessage(retryAfterSec: number) {
  const min = Math.max(1, Math.ceil(retryAfterSec / 60));
  return `Muitas tentativas. Tente de novo em ${min} ${min === 1 ? "minuto" : "minutos"}.`;
}

/**
 * IP de quem fez a requisição. Em produção, confie só no cabeçalho definido
 * pelo seu proxy/hospedagem (ex.: Vercel define x-forwarded-for corretamente).
 */
export function clientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
