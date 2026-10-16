import { describe, expect, it } from "vitest";
import { applyHit, clientIp, RULES, tooManyAttemptsMessage } from "@/lib/rate-limit";
import { contentSecurityPolicy, securityHeaders } from "@/lib/security-headers";

const at = (iso: string) => new Date(iso);
const rule = { limit: 3, windowSec: 60 };

describe("applyHit", () => {
  it("libera até o limite e bloqueia a partir daí", () => {
    const now = at("2026-10-16T10:00:00Z");
    let bucket = null;
    const allowed: boolean[] = [];
    for (let i = 0; i < 5; i++) {
      const r = applyHit(bucket, now, rule);
      bucket = r.bucket;
      allowed.push(r.allowed);
    }
    expect(allowed).toEqual([true, true, true, false, false]);
  });

  it("informa quanto falta para liberar", () => {
    const bucket = { count: 3, resetAt: at("2026-10-16T10:01:00Z") };
    const r = applyHit(bucket, at("2026-10-16T10:00:15Z"), rule);
    expect(r.allowed).toBe(false);
    expect(r.retryAfterSec).toBe(45);
  });

  it("zera a contagem quando a janela vence", () => {
    const bucket = { count: 99, resetAt: at("2026-10-16T10:01:00Z") };
    const r = applyHit(bucket, at("2026-10-16T10:01:00Z"), rule);
    expect(r).toEqual({ allowed: true, retryAfterSec: 0, bucket: { count: 1, resetAt: at("2026-10-16T10:02:00Z") } });
  });

  it("login trava a conta depois de 5 senhas erradas", () => {
    const now = at("2026-10-16T10:00:00Z");
    let bucket = null;
    let last = applyHit(bucket, now, RULES.loginEmail);
    for (let i = 0; i < 5; i++) {
      bucket = last.bucket;
      last = applyHit(bucket, now, RULES.loginEmail);
    }
    expect(last.allowed).toBe(false);
    expect(tooManyAttemptsMessage(last.retryAfterSec)).toBe("Muitas tentativas. Tente de novo em 15 minutos.");
  });
});

describe("clientIp", () => {
  const h = (values: Record<string, string>) => ({ get: (k: string) => values[k] ?? null });

  it("usa o primeiro IP do x-forwarded-for", () => {
    expect(clientIp(h({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
  });
  it("cai para x-real-ip e depois para unknown", () => {
    expect(clientIp(h({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientIp(h({}))).toBe("unknown");
  });
});

describe("cabeçalhos de segurança", () => {
  it("impede o site de ser embutido em outras páginas", () => {
    const csp = contentSecurityPolicy(false);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(securityHeaders(false)).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
  });

  it("só libera eval no desenvolvimento", () => {
    expect(contentSecurityPolicy(true)).toContain("'unsafe-eval'");
    expect(contentSecurityPolicy(false)).not.toContain("'unsafe-eval'");
  });

  it("exige HTTPS só em produção", () => {
    const hsts = (dev: boolean) => securityHeaders(dev).some((x) => x.key === "Strict-Transport-Security");
    expect(hsts(false)).toBe(true);
    expect(hsts(true)).toBe(false);
  });
});
