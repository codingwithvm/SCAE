import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const developmentClasses = [
  { schoolInepCode: "35000001", name: "1º Ano A", grade: 1, year: 2026 },
  { schoolInepCode: "35000001", name: "2º Ano A", grade: 2, year: 2026 },
  { schoolInepCode: "35000001", name: "3º Ano A", grade: 3, year: 2026 },
  { schoolInepCode: "35000001", name: "4º Ano A", grade: 4, year: 2026 },
  { schoolInepCode: "35000001", name: "5º Ano A", grade: 5, year: 2026 },
  { schoolInepCode: "35000001", name: "6º Ano A", grade: 6, year: 2026 },
  { schoolInepCode: "35000001", name: "7º Ano A", grade: 7, year: 2026 },
  { schoolInepCode: "35000001", name: "8º Ano A", grade: 8, year: 2026 },
  { schoolInepCode: "35000001", name: "9º Ano A", grade: 9, year: 2026 },
  { schoolInepCode: "35000002", name: "3º Ano B", grade: 3, year: 2026 },
  { schoolInepCode: "33000001", name: "7º Ano A", grade: 7, year: 2026 },
  { schoolInepCode: "31000001", name: "9º Ano A", grade: 9, year: 2026 },
];

seedDevelopmentClasses();

async function seedDevelopmentClasses() {
  await databaseClient.connect();

  for (const developmentClass of developmentClasses) {
    await insertDevelopmentClass(developmentClass);
  }

  await databaseClient.end();

  for (const developmentClass of developmentClasses) {
    console.log(
      `> ${developmentClass.name} (grade ${developmentClass.grade}, ${developmentClass.year}) — escola INEP: ${developmentClass.schoolInepCode}`,
    );
  }
}

async function insertDevelopmentClass(developmentClass) {
  try {
    const insertClassQuery = {
      text: `
        INSERT INTO scae_classes (id, "schoolId", name, grade, year, "createdAt", "updatedAt")
        SELECT gen_random_uuid(), s.id, $1, $2, $3, NOW(), NOW()
        FROM scae_schools s
        WHERE s."inep_code" = $4
          AND NOT EXISTS (
            SELECT 1 FROM scae_classes c
            WHERE c."schoolId" = s.id AND c.name = $1 AND c.year = $3
          );
      `,
      values: [
        developmentClass.name,
        developmentClass.grade,
        developmentClass.year,
        developmentClass.schoolInepCode,
      ],
    };

    await databaseClient.query(insertClassQuery);
  } catch (insertError) {
    console.error(
      `> Failed to insert class ${developmentClass.name}: ${insertError.message}`,
    );
  }
}
