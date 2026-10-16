/**
 * Dados de demonstração. Todos os usuários usam a senha "pomo1234".
 * Rode com: npm run db:seed
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

const PEOPLE = [
  { username: "ana", name: "Ana Souza", emoji: "🌷", color: "orchid", bio: "Eng. Civil · 3º período" },
  { username: "lua", name: "Lua Martins", emoji: "🌙", color: "lavender", bio: "Cálculo é vida (mentira)" },
  { username: "theo", name: "Theo Lima", emoji: "🦊", color: "tangerine", bio: null },
  { username: "bia", name: "Bia Rocha", emoji: "🐝", color: "sun", bio: "Pesquisa + café" },
  { username: "davi", name: "Davi Alves", emoji: "🐸", color: "forest", bio: null },
];

const SUBJECTS = [
  { name: "Cálculo 1", emoji: "🧮", color: "orchid" },
  { name: "Vetorial", emoji: "📐", color: "forest" },
  { name: "Pesquisa", emoji: "🔬", color: "sun" },
];

const NOTES = [
  "Terminei a lista 3 de integrais! Substituição trigonométrica ainda me assombra 👻",
  "Revisão de produto vetorial. Regra da mão direita salvou",
  "Li dois artigos pro TCC e fichei tudo ✍️",
  null,
  "Pomodoro em dia, cabeça fritando 🍳",
  null,
];

async function main() {
  await db.room.deleteMany({ where: { inviteCode: "POMO26" } });
  await db.user.deleteMany({ where: { username: { in: PEOPLE.map((p) => p.username) } } });

  const passwordHash = await bcrypt.hash("pomo1234", 10);
  const now = Date.now();

  const users = [];
  for (const p of PEOPLE) {
    users.push(
      await db.user.create({
        data: { ...p, email: `${p.username}@pomo.test`, passwordHash, subjects: { create: SUBJECTS } },
        include: { subjects: true },
      }),
    );
  }

  await db.room.create({
    data: {
      name: "Maratona de Provas",
      description: "Quem estudar mais até as P2 escolhe o rolê de comemoração 🎉",
      emoji: "🏆",
      color: "orchid",
      inviteCode: "POMO26",
      startsAt: new Date(now - 10 * DAY),
      endsAt: new Date(now + 20 * DAY),
      ownerId: users[0].id,
      members: { create: users.map((u) => ({ userId: u.id })) },
    },
  });

  let n = 0;
  for (const [ui, u] of users.entries()) {
    for (let d = 9; d >= 0; d--) {
      if ((d + ui) % 3 === 2) continue; // alguns dias sem estudo
      const subject = u.subjects[(d + ui) % u.subjects.length];
      const durationSec = (25 + ((d * 17 + ui * 23) % 95)) * 60;
      const startedAt = new Date(now - d * DAY - (3 + ui) * 60 * 60 * 1000);
      const endedAt = new Date(startedAt.getTime() + durationSec * 1000 + 5 * 60 * 1000);
      const s = await db.studySession.create({
        data: {
          userId: u.id,
          subjectId: subject.id,
          status: "FINISHED",
          startedAt,
          endedAt,
          lastPingAt: endedAt,
          segmentStartedAt: null,
          accumulatedSec: durationSec,
          durationSec,
          note: NOTES[n++ % NOTES.length],
        },
      });
      if (n % 2 === 0) {
        const friend = users[(ui + 1) % users.length];
        await db.reaction.create({ data: { studySessionId: s.id, userId: friend.id, emoji: "🔥" } });
        await db.comment.create({ data: { studySessionId: s.id, userId: friend.id, body: "Bora!! 💪" } });
      }
    }
  }

  // Lua e Theo estão "online" agora
  for (const [i, u] of [users[1], users[2]].entries()) {
    const startedAt = new Date(now - (20 + i * 15) * 60 * 1000);
    await db.studySession.create({
      data: {
        userId: u.id,
        subjectId: u.subjects[i].id,
        status: i === 0 ? "RUNNING" : "PAUSED",
        startedAt,
        segmentStartedAt: i === 0 ? startedAt : null,
        accumulatedSec: i === 0 ? 0 : 30 * 60,
        lastPingAt: new Date(now),
      },
    });
  }

  console.log(`Seed ok: ${users.length} usuários, sala POMO26. Login: ana@pomo.test / pomo1234`);
}

main().finally(() => db.$disconnect());
