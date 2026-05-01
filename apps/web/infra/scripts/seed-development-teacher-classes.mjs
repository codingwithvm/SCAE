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
    className: "5º Ano A",
    classYear: 2026,
  },
];

seedDevelopmentTeacherClasses();

async function seedDevelopmentTeacherClasses() {
  await databaseClient.connect();

  for (const developmentTeacherClass of developmentTeacherClasses) {
    await insertDevelopmentTeacherClass(developmentTeacherClass);
  }

  await databaseClient.end();

  for (const developmentTeacherClass of developmentTeacherClasses) {
    console.log(
      `> teacher "${developmentTeacherClass.teacherEmail}" -> class "${developmentTeacherClass.className}" (${developmentTeacherClass.classYear})`,
    );
  }
}

async function insertDevelopmentTeacherClass(developmentTeacherClass) {
  try {
    const insertTeacherClassQuery = {
      text: `
        INSERT INTO scae_teacher_classes ("teacherId", "classId")
        SELECT user_reference.id, class_reference.id
        FROM scae_users user_reference
        INNER JOIN scae_classes class_reference
          ON class_reference.name = $1 AND class_reference.year = $2
        WHERE user_reference.email = $3
        ON CONFLICT DO NOTHING;
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
