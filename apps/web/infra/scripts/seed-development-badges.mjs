import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const badges = [
  {
    id: "scae_conhece",
    name: "Explorador",
    description: "Atingiu o nível CONHECE em uma habilidade",
    category: "scae_level",
    icon: "Star",
    color: "bg-red-100 text-red-700",
    criteria: JSON.stringify({ scaeLevel: "CONHECE" }),
  },
  {
    id: "scae_entende",
    name: "Investigador",
    description: "Atingiu o nível ENTENDE em uma habilidade",
    category: "scae_level",
    icon: "Search",
    color: "bg-yellow-100 text-yellow-700",
    criteria: JSON.stringify({ scaeLevel: "ENTENDE" }),
  },
  {
    id: "scae_aplica",
    name: "Criador",
    description: "Atingiu o nível APLICA em uma habilidade",
    category: "scae_level",
    icon: "Zap",
    color: "bg-blue-100 text-blue-700",
    criteria: JSON.stringify({ scaeLevel: "APLICA" }),
  },
  {
    id: "scae_resolve",
    name: "Mestre",
    description: "Atingiu o nível RESOLVE em uma habilidade",
    category: "scae_level",
    icon: "Trophy",
    color: "bg-green-100 text-green-700",
    criteria: JSON.stringify({ scaeLevel: "RESOLVE" }),
  },
  {
    id: "primeira_ativ",
    name: "Primeira Atividade",
    description: "Completou a primeira atividade G-SCAE",
    category: "milestone",
    icon: "PlayCircle",
    color: "bg-purple-100 text-purple-700",
    criteria: JSON.stringify({ completions: 1 }),
  },
  {
    id: "dez_ativ",
    name: "10 Atividades",
    description: "Completou 10 atividades G-SCAE",
    category: "milestone",
    icon: "Award",
    color: "bg-purple-100 text-purple-700",
    criteria: JSON.stringify({ completions: 10 }),
  },
  {
    id: "cinquenta_ativ",
    name: "50 Atividades",
    description: "Completou 50 atividades G-SCAE",
    category: "milestone",
    icon: "Medal",
    color: "bg-indigo-100 text-indigo-700",
    criteria: JSON.stringify({ completions: 50 }),
  },
  {
    id: "nota_perfeita",
    name: "Nota Perfeita",
    description: "Obteve pontuação máxima em uma atividade",
    category: "milestone",
    icon: "Sparkles",
    color: "bg-amber-100 text-amber-700",
    criteria: JSON.stringify({ totalScore: 1.0 }),
  },
  {
    id: "acima_media",
    name: "Acima da Média",
    description: "Obteve mais de 80% na primeira tentativa",
    category: "milestone",
    icon: "TrendingUp",
    color: "bg-teal-100 text-teal-700",
    criteria: JSON.stringify({ firstAttemptScore: 0.8 }),
  },
  {
    id: "disc_ma",
    name: "Matemático",
    description: "Completou 5 habilidades de Matemática",
    category: "milestone",
    icon: "Calculator",
    color: "bg-orange-100 text-orange-700",
    criteria: JSON.stringify({ discipline: "MA", completions: 5 }),
  },
  {
    id: "disc_lp",
    name: "Leitor",
    description: "Completou 5 habilidades de Língua Portuguesa",
    category: "milestone",
    icon: "BookOpen",
    color: "bg-rose-100 text-rose-700",
    criteria: JSON.stringify({ discipline: "LP", completions: 5 }),
  },
  {
    id: "disc_ci",
    name: "Cientista",
    description: "Completou 5 habilidades de Ciências",
    category: "milestone",
    icon: "FlaskConical",
    color: "bg-cyan-100 text-cyan-700",
    criteria: JSON.stringify({ discipline: "CI", completions: 5 }),
  },
  {
    id: "disc_in",
    name: "Programador",
    description: "Completou 5 habilidades de Computação",
    category: "milestone",
    icon: "Code",
    color: "bg-slate-100 text-slate-700",
    criteria: JSON.stringify({ discipline: "IN", completions: 5 }),
  },
];

const studentBadgesDemo = [
  {
    badgeId: "primeira_ativ",
    context: null,
    hoursAgo: 72,
  },
  {
    badgeId: "scae_conhece",
    context: JSON.stringify({
      habilidadeCode: "MA01",
      scaeLevel: "CONHECE",
    }),
    hoursAgo: 48,
  },
  {
    badgeId: "acima_media",
    context: JSON.stringify({ habilidadeCode: "MA01" }),
    hoursAgo: 24,
  },
];

async function seedBadges() {
  await databaseClient.connect();

  await databaseClient.query("DELETE FROM scae_student_badges");
  await databaseClient.query("DELETE FROM scae_badges");

  for (const badge of badges) {
    await databaseClient.query(
      `INSERT INTO scae_badges (id, name, description, category, icon, color, criteria)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        badge.id,
        badge.name,
        badge.description,
        badge.category,
        badge.icon,
        badge.color,
        badge.criteria,
      ],
    );
  }

  console.log(`> ${badges.length} badges seeded`);

  const studentResult = await databaseClient.query(
    `SELECT id FROM scae_users WHERE "registrationNumber" = '2026101' LIMIT 1`,
  );

  const studentId = studentResult.rows[0]?.id;

  if (studentId) {
    for (const sb of studentBadgesDemo) {
      const earnedAt = new Date(Date.now() - sb.hoursAgo * 60 * 60 * 1000);
      await databaseClient.query(
        `INSERT INTO scae_student_badges (id, "userId", "badgeId", context, "earnedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
        [studentId, sb.badgeId, sb.context, earnedAt],
      );
    }
    console.log(
      `> ${studentBadgesDemo.length} student badges seeded for student 2026101`,
    );
  }

  await databaseClient.end();
}

seedBadges().catch((error) => {
  console.error("Badge seed failed:", error);
  process.exit(1);
});
