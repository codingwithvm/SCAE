import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const developmentStudentClasses = [
  ...regs("2026101", "2026108").map((r) => ({
    registrationNumber: r,
    className: "1º Ano A",
    classYear: 2026,
  })),
  ...regs("2026201", "2026208").map((r) => ({
    registrationNumber: r,
    className: "2º Ano A",
    classYear: 2026,
  })),
  ...regs("2026301", "2026308").map((r) => ({
    registrationNumber: r,
    className: "3º Ano A",
    classYear: 2026,
  })),
  ...regs("2026401", "2026408").map((r) => ({
    registrationNumber: r,
    className: "4º Ano A",
    classYear: 2026,
  })),
  ...regs("2026501", "2026509").map((r) => ({
    registrationNumber: r,
    className: "5º Ano A",
    classYear: 2026,
  })),
  ...regs("2026601", "2026608").map((r) => ({
    registrationNumber: r,
    className: "6º Ano A",
    classYear: 2026,
  })),
  ...regs("2026701", "2026708").map((r) => ({
    registrationNumber: r,
    className: "7º Ano A",
    classYear: 2026,
  })),
  ...regs("2026801", "2026808").map((r) => ({
    registrationNumber: r,
    className: "8º Ano A",
    classYear: 2026,
  })),
  ...regs("2026901", "2026908").map((r) => ({
    registrationNumber: r,
    className: "9º Ano A",
    classYear: 2026,
  })),
];

function regs(from, to) {
  const result = [];
  for (let i = Number(from); i <= Number(to); i++) {
    result.push(String(i));
  }
  return result;
}

seedDevelopmentStudentClasses();

async function seedDevelopmentStudentClasses() {
  await databaseClient.connect();

  for (const entry of developmentStudentClasses) {
    await insertDevelopmentStudentClass(entry);
  }

  await databaseClient.end();

  console.log(
    `> ${developmentStudentClasses.length} student-class links processed`,
  );
}

async function insertDevelopmentStudentClass(developmentStudentClass) {
  try {
    const insertStudentClassQuery = {
      text: `
        INSERT INTO scae_student_classes ("studentId", "classId", "enrolledAt")
        SELECT u.id, c.id, NOW()
        FROM scae_users u
        INNER JOIN scae_classes c
          ON c.name = $1 AND c.year = $2
        WHERE u."registrationNumber" = $3
          AND NOT EXISTS (
            SELECT 1 FROM scae_student_classes sc
            WHERE sc."studentId" = u.id AND sc."classId" = c.id
          )
        LIMIT 1;
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
