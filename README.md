# 🍅 Pomo — o GymRats dos estudos

Cronometre seu estudo, poste check-ins, veja quem está estudando agora e dispute salas com os amigos.
Quem somar mais tempo até o fim da sala leva a coroa. 👑

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 + shadcn/ui (Base UI) · Motion · PostgreSQL + Prisma · Vitest

## Rodando localmente

```bash
npm install
npm run db:dev        # sobe um Postgres local (Prisma Dev) e mostra a URL
cp .env.example .env  # cole as URLs de `npx prisma dev ls` (veja os comentários no arquivo)
npm run db:migrate
npm run db:seed       # opcional: 5 usuários demo + sala com código POMO26
npm run dev
```

Login demo: `ana@pomo.test` / `pomo1234`. Prefere Docker? `docker compose up -d` e use a URL do `docker-compose.yml`.

## Como funciona

| Conceito | Onde |
| --- | --- |
| Cronômetro (start/pausa/fim) com tempo calculado no servidor | `src/app/actions/study.ts`, `src/lib/time.ts` |
| "Online estudando": ping a cada 30s, some após 3 min sem sinal | `src/app/api/study/ping`, `src/app/api/presence`, `src/components/pomo/study-provider.tsx` |
| Salas com período personalizável, placar ao vivo e vencedor | `src/app/actions/rooms.ts`, `src/lib/leaderboard.ts`, `src/app/(app)/rooms` |
| Matérias personalizadas (nome, emoji, cor) | `src/app/(app)/subjects` |
| Check-ins com comentários e reações | `src/components/pomo/feed-card.tsx`, `src/app/(app)/s/[id]` |
| Identidade visual (paleta, botões "Kahoot", formas) | `src/app/globals.css`, `src/lib/palette.ts`, `src/components/pomo/brand.tsx` |

## Segurança

- Senhas com bcrypt; o banco guarda só o hash do token de sessão (cookie `httpOnly`, `sameSite`, `secure` em produção)
- Limite de tentativas no login (5 por email e 20 por IP a cada 15 min), no cadastro e nos códigos de sala (`src/lib/rate-limit.ts`)
- Mensagens que não revelam se um email tem conta; o login leva o mesmo tempo com ou sem conta
- Estatísticas e check-ins só são visíveis para quem divide uma sala com a pessoa; email nunca aparece para outros usuários
- Cabeçalhos de segurança (CSP, anti-iframe, HSTS em produção) em `src/lib/security-headers.ts`

## Scripts

- `npm test` — testes unitários (Vitest)
- `npm run db:studio` — Prisma Studio para ver o banco
