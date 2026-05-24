import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const notifications = [
  {
    type: "badge_earned",
    title: "Nova conquista desbloqueada!",
    message:
      "Você ganhou o badge Explorador por completar sua primeira atividade.",
    data: JSON.stringify({ badgeSlug: "explorador" }),
    isRead: false,
    hoursAgo: 0.5,
  },
  {
    type: "onboarding_reminder",
    title: "Complete seu perfil SCAE",
    message:
      "Descubra seu perfil de aprendizagem e receba atividades personalizadas.",
    data: null,
    isRead: false,
    hoursAgo: 2,
  },
  {
    type: "activity_feedback",
    title: "Novo feedback do professor",
    message:
      'O professor deixou um comentário na sua atividade de Matemática: "Ótimo progresso!"',
    data: JSON.stringify({ sessionId: "demo-session-1" }),
    isRead: false,
    hoursAgo: 5,
  },
  {
    type: "level_up",
    title: "Parabéns! Você subiu de nível",
    message:
      "Você avançou do nível Iniciante para Intermediário em Língua Portuguesa.",
    data: JSON.stringify({
      discipline: "Língua Portuguesa",
      from: "Iniciante",
      to: "Intermediário",
    }),
    isRead: true,
    hoursAgo: 24,
  },
  {
    type: "weekly_summary",
    title: "Resumo semanal disponível",
    message:
      "Você completou 4 atividades esta semana. Confira seu progresso no dashboard.",
    data: JSON.stringify({ activitiesCompleted: 4 }),
    isRead: true,
    hoursAgo: 48,
  },
  {
    type: "mces_unlocked",
    title: "Questionário MCES liberado!",
    message:
      "Seu professor liberou o questionário MCES. Responda para desbloquear novas funcionalidades.",
    data: null,
    isRead: true,
    hoursAgo: 72,
  },
];

const teacherNotifications = [
  {
    type: "student_completed",
    title: "Atividade concluída",
    message:
      "Ana Beatriz Silva completou a atividade de Matemática — Nível Intermediário.",
    data: JSON.stringify({
      studentName: "Ana Beatriz Silva",
      discipline: "Matemática",
    }),
    isRead: false,
    hoursAgo: 1,
  },
  {
    type: "attention_needed",
    title: "Aluno precisa de atenção",
    message:
      "Lucas Gabriel Santos não completou nenhuma atividade nos últimos 7 dias.",
    data: JSON.stringify({ studentName: "Lucas Gabriel Santos" }),
    isRead: false,
    hoursAgo: 6,
  },
  {
    type: "class_report",
    title: "Relatório da turma disponível",
    message:
      "O relatório semanal da turma 1º Ano A está pronto para visualização.",
    data: JSON.stringify({ className: "1º Ano A" }),
    isRead: true,
    hoursAgo: 30,
  },
];

const adminNotifications = [
  {
    type: "system_alert",
    title: "Novo período de avaliação",
    message:
      "O período de avaliação do 2º bimestre começa em 3 dias. Verifique as liberações.",
    data: null,
    isRead: false,
    hoursAgo: 4,
  },
  {
    type: "import_complete",
    title: "Importação concluída",
    message: "A importação de 72 alunos via Excel foi processada com sucesso.",
    data: JSON.stringify({ imported: 72, errors: 0 }),
    isRead: true,
    hoursAgo: 50,
  },
];

async function seedNotifications() {
  await databaseClient.connect();

  await databaseClient.query("DELETE FROM scae_notifications");

  const studentResult = await databaseClient.query(
    `SELECT id FROM scae_users WHERE "registrationNumber" = '2026101' LIMIT 1`,
  );
  const teacherResult = await databaseClient.query(
    `SELECT id FROM scae_users WHERE email = 'professor@scae.dev' LIMIT 1`,
  );
  const adminResult = await databaseClient.query(
    `SELECT id FROM scae_users WHERE email = 'admin@scae.dev' LIMIT 1`,
  );

  const studentId = studentResult.rows[0]?.id;
  const teacherId = teacherResult.rows[0]?.id;
  const adminId = adminResult.rows[0]?.id;

  let insertedCount = 0;

  if (studentId) {
    for (const n of notifications) {
      await insertNotification(studentId, n);
      insertedCount++;
    }
  }

  if (teacherId) {
    for (const n of teacherNotifications) {
      await insertNotification(teacherId, n);
      insertedCount++;
    }
  }

  if (adminId) {
    for (const n of adminNotifications) {
      await insertNotification(adminId, n);
      insertedCount++;
    }
  }

  console.log(`> ${insertedCount} notifications seeded`);
  if (studentId)
    console.log(`  Student (2026101): ${notifications.length} notifications`);
  if (teacherId)
    console.log(
      `  Teacher (professor@scae.dev): ${teacherNotifications.length} notifications`,
    );
  if (adminId)
    console.log(
      `  Admin (admin@scae.dev): ${adminNotifications.length} notifications`,
    );

  await databaseClient.end();
}

async function insertNotification(userId, notification) {
  const createdAt = new Date(
    Date.now() - notification.hoursAgo * 60 * 60 * 1000,
  );

  await databaseClient.query(
    `INSERT INTO scae_notifications (id, "userId", type, title, message, data, "isRead", "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)`,
    [
      userId,
      notification.type,
      notification.title,
      notification.message,
      notification.data,
      notification.isRead,
      createdAt,
    ],
  );
}

seedNotifications().catch((error) => {
  console.error("Notification seed failed:", error);
  process.exit(1);
});
