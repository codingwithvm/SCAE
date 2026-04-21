import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const developmentSchools = [
  {
    municipalityIbgeCode: "3550308",
    name: "EM Prof. Ana Maria",
    inepCode: "35000001",
  },
  {
    municipalityIbgeCode: "3550308",
    name: "EM Monteiro Lobato",
    inepCode: "35000002",
  },
  {
    municipalityIbgeCode: "3304557",
    name: "EM Machado de Assis",
    inepCode: "33000001",
  },
  {
    municipalityIbgeCode: "3106200",
    name: "EM Tancredo Neves",
    inepCode: "31000001",
  },
  {
    municipalityIbgeCode: "2927408",
    name: "EM Castro Alves",
    inepCode: "29000001",
  },
];

seedDevelopmentSchools();

async function seedDevelopmentSchools() {
  await databaseClient.connect();

  for (const developmentSchool of developmentSchools) {
    await insertDevelopmentSchool(developmentSchool);
  }

  await databaseClient.end();

  for (const developmentSchool of developmentSchools) {
    console.log(
      `> INEP ${developmentSchool.inepCode} — "${developmentSchool.name}" (município IBGE: ${developmentSchool.municipalityIbgeCode})`,
    );
  }
}

async function insertDevelopmentSchool(developmentSchool) {
  try {
    const insertSchoolQuery = {
      text: `
        INSERT INTO scae_schools (id, "municipalityId", name, "inep_code", "createdAt", "updatedAt")
        SELECT gen_random_uuid(), m.id, $1, $2, NOW(), NOW()
        FROM scae_municipalities m
        WHERE m."ibge_code" = $3
        ON CONFLICT DO NOTHING;
      `,
      values: [
        developmentSchool.name,
        developmentSchool.inepCode,
        developmentSchool.municipalityIbgeCode,
      ],
    };

    await databaseClient.query(insertSchoolQuery);
  } catch (insertError) {
    console.error(
      `> Failed to insert school ${developmentSchool.name}: ${insertError.message}`,
    );
  }
}
