import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const developmentTeacherClasses = [
  {
    teacherEmail: "professor@scae.dev",
    className: "1º Ano A",
    classYear: 2026,
  },
  {
    teacherEmail: "professor@scae.dev",
    className: "2º Ano A",
    classYear: 2026,
  },
  {
    teacherEmail: "professor@scae.dev",
    className: "3º Ano A",
    classYear: 2026,
  },
  {
    teacherEmail: "professor@scae.dev",
    className: "4º Ano A",
    classYear: 2026,
  },
  {
    teacherEmail: "professor2@scae.dev",
    className: "5º Ano A",
    classYear: 2026,
  },
  {
    teacherEmail: "professor2@scae.dev",
    className: "6º Ano A",
    classYear: 2026,
  },
  {
    teacherEmail: "professor2@scae.dev",
    className: "7º Ano A",
    classYear: 2026,
  },
  {
    teacherEmail: "professor2@scae.dev",
    className: "8º Ano A",
    classYear: 2026,
  },
  {
    teacherEmail: "professor2@scae.dev",
    className: "9º Ano A",
    classYear: 2026,
  },
];

seedDevelopmentTeacherClasses();

async function seedDevelopmentTeacherClasses() {
  await databaseClient.connect();

  for (const entry of developmentTeacherClasses) {
    await insertDevelopmentTeacherClass(entry);
  }

  await databaseClient.end();

  for (const entry of developmentTeacherClasses) {
    console.log(
      `> teacher "${entry.teacherEmail}" -> class "${entry.className}" (${entry.classYear})`,
    );
  }
}

async function insertDevelopmentTeacherClass(developmentTeacherClass) {
  try {
    const insertTeacherClassQuery = {
      text: `
        INSERT INTO scae_teacher_classes ("teacherId", "classId")
        SELECT u.id, c.id
        FROM scae_users u
        INNER JOIN scae_classes c
          ON c.name = $1 AND c.year = $2
        WHERE u.email = $3
          AND NOT EXISTS (
            SELECT 1 FROM scae_teacher_classes tc
            WHERE tc."teacherId" = u.id AND tc."classId" = c.id
          )
        LIMIT 1;
      `,
      values: [
        developmentTeacherClass.className,
        developmentTeacherClass.classYear,
        developmentTeacherClass.teacherEmail,
      ],
    };

    await databaseClient.query(insertTeacherClassQuery);
  } catch (insertError) {
    console.error(
      `> Failed to insert teacher-class link ${developmentTeacherClass.teacherEmail}: ${insertError.message}`,
    );
  }
}
