import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const developmentStudentClasses = [
  {
    registrationNumber: "2026001",
    className: "1º Ano A",
    classYear: 2026,
  },
  {
    registrationNumber: "2026002",
    className: "5º Ano A",
    classYear: 2026,
  },
];

seedDevelopmentStudentClasses();

async function seedDevelopmentStudentClasses() {
  await databaseClient.connect();

  for (const developmentStudentClass of developmentStudentClasses) {
    await insertDevelopmentStudentClass(developmentStudentClass);
  }

  await databaseClient.end();

  for (const developmentStudentClass of developmentStudentClasses) {
    console.log(
      `> student matrícula "${developmentStudentClass.registrationNumber}" -> class "${developmentStudentClass.className}" (${developmentStudentClass.classYear})`,
    );
  }
}

async function insertDevelopmentStudentClass(developmentStudentClass) {
  try {
    const insertStudentClassQuery = {
      text: `
        INSERT INTO scae_student_classes ("studentId", "classId", "enrolledAt")
        SELECT user_reference.id, class_reference.id, NOW()
        FROM scae_users user_reference
        INNER JOIN scae_classes class_reference
          ON class_reference.name = $1 AND class_reference.year = $2
        WHERE user_reference."registrationNumber" = $3
        ON CONFLICT DO NOTHING;
      `,
      values: [
        developmentStudentClass.className,
        developmentStudentClass.classYear,
        developmentStudentClass.registrationNumber,
      ],
    };

    await databaseClient.query(insertStudentClassQuery);
  } catch (insertError) {
    console.error(
      `> Failed to insert student-class link ${developmentStudentClass.registrationNumber}: ${insertError.message}`,
    );
  }
}
