import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const developmentMunicipalities = [
  { name: "São Paulo", state: "SP", ibgeCode: "3550308" },
  { name: "Rio de Janeiro", state: "RJ", ibgeCode: "3304557" },
  { name: "Belo Horizonte", state: "MG", ibgeCode: "3106200" },
  { name: "Salvador", state: "BA", ibgeCode: "2927408" },
  { name: "Fortaleza", state: "CE", ibgeCode: "2304400" },
];

seedDevelopmentMunicipalities();

async function seedDevelopmentMunicipalities() {
  await databaseClient.connect();

  for (const developmentMunicipality of developmentMunicipalities) {
    await insertDevelopmentMunicipality(developmentMunicipality);
  }

  await databaseClient.end();

  for (const developmentMunicipality of developmentMunicipalities) {
    console.log(
      `> ${developmentMunicipality.state} — "${developmentMunicipality.name}" (IBGE: ${developmentMunicipality.ibgeCode})`,
    );
  }
}

async function insertDevelopmentMunicipality(developmentMunicipality) {
  try {
    const insertMunicipalityQuery = {
      text: `
        INSERT INTO scae_municipalities (id, name, state, "ibge_code", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `,
      values: [
        developmentMunicipality.name,
        developmentMunicipality.state,
        developmentMunicipality.ibgeCode,
      ],
    };

    await databaseClient.query(insertMunicipalityQuery);
  } catch (insertError) {
    console.error(
      `> Failed to insert municipality ${developmentMunicipality.name}: ${insertError.message}`,
    );
  }
}
