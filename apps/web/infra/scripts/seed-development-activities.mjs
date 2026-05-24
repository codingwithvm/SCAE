import pg from "pg";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);
const genSimulador = require(
  path.resolve(__dirname, "../../src/lib/gscae/gen_simulador_v4.cjs"),
);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const ACTIVITIES = [
  {
    habilidadeCode: "EF05MA01",
    habilidadeDesc:
      "Ler, escrever e ordenar números naturais até a ordem das centenas de milhar com compreensão das principais características do sistema de numeração decimal.",
    discipline: "MA",
    grade: "5",
    title: "Números Naturais e Sistema Decimal",
    level1: {
      stage: "CONHECE",
      fase1_percebe:
        "<p>Observe os números ao seu redor: placas de carros, preços, distâncias. Todos usam o sistema decimal!</p><p>Você sabia que nosso sistema de numeração usa apenas 10 algarismos (0 a 9) para representar qualquer quantidade?</p>",
      fase2_investiga:
        "<p>Vamos investigar como os números são organizados:</p><ul><li>O número 45.230 tem quantas ordens?</li><li>Qual é o valor do algarismo 4 nesse número?</li><li>Como lemos esse número por extenso?</li></ul>",
      fase3_registra:
        "Escreva com suas palavras: o que você entende sobre o valor posicional dos algarismos em um número?",
      fase4_consolida:
        "<p>No sistema decimal, cada posição tem um valor 10 vezes maior que a anterior. O algarismo 4 em 45.230 vale 40.000 porque está na casa das dezenas de milhar.</p>",
      questions_bank: [
        {
          id: "EF05MA01_C01",
          text: "Qual é o valor do algarismo 7 no número 37.452?",
          options: ["7", "70", "700", "7.000"],
          correct: "D",
        },
        {
          id: "EF05MA01_C02",
          text: "Como se lê o número 58.301?",
          options: [
            "Cinco mil oitocentos e trinta e um",
            "Cinquenta e oito mil trezentos e um",
            "Quinhentos e oitenta e três mil e um",
            "Cinco milhões oitocentos e trinta e um",
          ],
          correct: "B",
        },
        {
          id: "EF05MA01_C03",
          text: "Qual número é maior: 45.678 ou 45.687?",
          options: [
            "45.678",
            "45.687",
            "São iguais",
            "Não é possível comparar",
          ],
          correct: "B",
        },
        {
          id: "EF05MA01_C04",
          text: "Quantas ordens tem o número 100.000?",
          options: ["4", "5", "6", "7"],
          correct: "C",
        },
      ],
    },
    level2: {
      stage: "ENTENDE",
      fase1_percebe:
        "<p>Agora que você já conhece o sistema decimal, vamos entender melhor como decompomos números grandes.</p>",
      fase2_investiga:
        "<p>Decomponha o número 82.456:</p><ul><li>80.000 + 2.000 + 400 + 50 + 6</li><li>Que relação cada parcela tem com a posição do algarismo?</li></ul>",
      fase3_registra:
        "Explique por que a decomposição de um número nos ajuda a entender seu valor.",
      fase4_consolida:
        "<p>A decomposição mostra o valor real de cada algarismo baseado na sua posição. Isso é fundamental para operações matemáticas.</p>",
      questions_bank: [
        {
          id: "EF05MA01_E01",
          text: "Qual é a decomposição correta de 63.205?",
          options: [
            "6.000 + 3.000 + 200 + 5",
            "60.000 + 3.000 + 200 + 5",
            "60.000 + 3.000 + 200 + 50",
            "63.000 + 205",
          ],
          correct: "B",
        },
        {
          id: "EF05MA01_E02",
          text: "No número 91.470, o algarismo 1 representa:",
          options: ["1 unidade", "1 dezena", "1 centena", "1 milhar"],
          correct: "D",
        },
        {
          id: "EF05MA01_E03",
          text: "Ordene do menor para o maior: 34.500, 34.050, 35.400",
          options: [
            "34.050, 34.500, 35.400",
            "34.500, 34.050, 35.400",
            "35.400, 34.500, 34.050",
            "34.050, 35.400, 34.500",
          ],
          correct: "A",
        },
        {
          id: "EF05MA01_E04",
          text: "Qual número tem o algarismo 8 na ordem das centenas?",
          options: ["8.342", "3.842", "3.482", "3.248"],
          correct: "B",
        },
      ],
    },
    level3: {
      stage: "APLICA",
      fase1_percebe:
        "<p>Chegou a hora de aplicar tudo que aprendeu sobre o sistema decimal em situações do dia a dia!</p>",
      fase2_investiga:
        "<p>Uma escola tem 1.245 alunos no turno da manhã e 1.389 no turno da tarde. Qual turno tem mais alunos? Qual a diferença?</p>",
      fase3_registra:
        "Crie um problema do cotidiano que envolva comparação e ordenação de números naturais.",
      fase4_consolida:
        "<p>Saber ler, comparar e ordenar números é essencial para interpretar informações no dia a dia: preços, distâncias, populações.</p>",
      questions_bank: [
        {
          id: "EF05MA01_A01",
          text: "Uma cidade tem 87.432 habitantes e outra tem 87.423. Qual tem mais habitantes?",
          options: [
            "A primeira",
            "A segunda",
            "As duas têm o mesmo número",
            "Faltam dados",
          ],
          correct: "A",
        },
        {
          id: "EF05MA01_A02",
          text: "João tem R$ 15.750 e Maria tem R$ 15.570. Quanto João tem a mais que Maria?",
          options: ["R$ 80", "R$ 180", "R$ 280", "R$ 1.800"],
          correct: "B",
        },
        {
          id: "EF05MA01_A03",
          text: "Coloque em ordem crescente: 99.001, 90.910, 99.100, 90.019",
          options: [
            "90.019, 90.910, 99.001, 99.100",
            "90.910, 90.019, 99.100, 99.001",
            "99.100, 99.001, 90.910, 90.019",
            "90.019, 90.910, 99.100, 99.001",
          ],
          correct: "A",
        },
        {
          id: "EF05MA01_A04",
          text: "Um estádio tem capacidade para 45.000 pessoas. Se 38.756 ingressos foram vendidos, quantos lugares ainda estão disponíveis?",
          options: ["6.244", "6.344", "7.244", "7.344"],
          correct: "A",
        },
      ],
    },
  },
  {
    habilidadeCode: "EF05LP01",
    habilidadeDesc:
      "Grafar palavras utilizando regras de correspondência fonema-grafema regulares, contextuais e morfológicas e palavras de uso frequente com correspondências irregulares.",
    discipline: "LP",
    grade: "5",
    title: "Ortografia e Correspondência Fonema-Grafema",
    level1: {
      stage: "CONHECE",
      fase1_percebe:
        "<p>Você já reparou que algumas palavras são escritas de um jeito diferente do que falamos? Por exemplo, dizemos 'mininu' mas escrevemos 'menino'.</p>",
      fase2_investiga:
        "<p>Observe estas palavras e identifique a regra:</p><ul><li>casa, cedo, cinto → quando o C tem som de S?</li><li>gato, gelo, girafa → quando o G tem som de J?</li></ul>",
      fase3_registra:
        "Escreva o que você descobriu sobre as regras do C e do G na língua portuguesa.",
      fase4_consolida:
        "<p>O C tem som de S antes de E e I. O G tem som de J antes de E e I. Essas são regras contextuais da nossa ortografia.</p>",
      questions_bank: [
        {
          id: "EF05LP01_C01",
          text: "Qual palavra está escrita corretamente?",
          options: ["Escessão", "Exceção", "Excessão", "Esseção"],
          correct: "B",
        },
        {
          id: "EF05LP01_C02",
          text: "Complete: O _____ato pulou o muro.",
          options: ["jato", "gato", "jatu", "gatu"],
          correct: "B",
        },
        {
          id: "EF05LP01_C03",
          text: "Qual palavra usa Ç corretamente?",
          options: ["Coraçãu", "Coração", "Corassão", "Corasão"],
          correct: "B",
        },
        {
          id: "EF05LP01_C04",
          text: "Na palavra 'cidade', o C tem som de:",
          options: ["K", "S", "CH", "X"],
          correct: "B",
        },
      ],
    },
    level2: {
      stage: "ENTENDE",
      fase1_percebe:
        "<p>Vamos aprofundar nosso conhecimento sobre como os sons se transformam em letras na escrita.</p>",
      fase2_investiga:
        "<p>Investigue: por que escrevemos 'humilde' com H se não pronunciamos? E por que 'hora' tem H mas 'ora' não?</p>",
      fase3_registra:
        "Explique a diferença entre palavras com correspondência regular e irregular.",
      fase4_consolida:
        "<p>Palavras com correspondência regular seguem regras fixas. Palavras irregulares precisam ser memorizadas, como as que usam H no início.</p>",
      questions_bank: [
        {
          id: "EF05LP01_E01",
          text: "Qual par de palavras usa corretamente S e Z?",
          options: ["caza / mesa", "casa / meza", "casa / mesa", "caza / meza"],
          correct: "C",
        },
        {
          id: "EF05LP01_E02",
          text: "Qual palavra está grafada corretamente?",
          options: ["Analisar", "Analizar", "Analiçar", "Analissar"],
          correct: "A",
        },
        {
          id: "EF05LP01_E03",
          text: "O H é usado no início de qual palavra?",
          options: ["Ontem", "Oje", "Hora", "Ombro"],
          correct: "C",
        },
        {
          id: "EF05LP01_E04",
          text: "Complete: A ___ente chegou cedo.",
          options: ["g", "j", "g (gente)", "j (jente)"],
          correct: "C",
        },
      ],
    },
    level3: {
      stage: "APLICA",
      fase1_percebe:
        "<p>Agora vamos aplicar as regras ortográficas em textos e situações reais de escrita.</p>",
      fase2_investiga:
        "<p>Leia o trecho e identifique os erros: 'O meninu foi a escola sedo e esquesseu o caderno.'</p>",
      fase3_registra:
        "Reescreva o trecho corrigido e explique cada correção que fez.",
      fase4_consolida:
        "<p>A prática constante da escrita, aliada ao conhecimento das regras, é o melhor caminho para dominar a ortografia.</p>",
      questions_bank: [
        {
          id: "EF05LP01_A01",
          text: "Identifique a frase sem erros ortográficos:",
          options: [
            "O menino esqueceu o caderno na escola.",
            "O meninu esquesseu o caderno na escola.",
            "O menino esqueseu o caderno na escolla.",
            "O meninu esqueceu o caderno na escolla.",
          ],
          correct: "A",
        },
        {
          id: "EF05LP01_A02",
          text: "Qual palavra completa corretamente: 'A _____ância foi grande.'?",
          options: ["distancia", "distansia", "distância", "distânsia"],
          correct: "C",
        },
        {
          id: "EF05LP01_A03",
          text: "Na frase 'Ele fez uma viagem excelente', quantas palavras têm correspondência irregular?",
          options: ["1", "2", "3", "Nenhuma"],
          correct: "B",
        },
        {
          id: "EF05LP01_A04",
          text: "Qual alternativa contém apenas palavras grafadas corretamente?",
          options: [
            "exceção, analisar, hora",
            "excessão, analizar, hora",
            "exceção, analizar, ora",
            "excessão, analisar, ora",
          ],
          correct: "A",
        },
      ],
    },
  },
  {
    habilidadeCode: "EF05CI01",
    habilidadeDesc:
      "Explorar fenômenos da vida cotidiana que evidenciem propriedades físicas dos materiais.",
    discipline: "CI",
    grade: "5",
    title: "Propriedades Físicas dos Materiais",
    level1: {
      stage: "CONHECE",
      fase1_percebe:
        "<p>Olhe ao seu redor: mesas de madeira, janelas de vidro, cadernos de papel. Por que usamos materiais diferentes para cada objeto?</p>",
      fase2_investiga:
        "<p>Investigue as propriedades dos materiais:</p><ul><li>Por que a panela é de metal e não de papel?</li><li>Por que o guarda-chuva usa tecido impermeável?</li></ul>",
      fase3_registra:
        "Descreva três objetos da sua casa e explique por que são feitos dos materiais que são.",
      fase4_consolida:
        "<p>Cada material tem propriedades específicas: dureza, flexibilidade, condutividade, impermeabilidade. Escolhemos materiais com base nessas propriedades.</p>",
      questions_bank: [
        {
          id: "EF05CI01_C01",
          text: "Por que panelas são feitas de metal?",
          options: [
            "Porque é mais bonito",
            "Porque conduz bem o calor",
            "Porque é mais leve",
            "Porque é mais barato",
          ],
          correct: "B",
        },
        {
          id: "EF05CI01_C02",
          text: "Qual propriedade torna o vidro útil para janelas?",
          options: [
            "Flexibilidade",
            "Condutividade",
            "Transparência",
            "Elasticidade",
          ],
          correct: "C",
        },
        {
          id: "EF05CI01_C03",
          text: "O que é impermeabilidade?",
          options: [
            "Deixar a luz passar",
            "Não deixar a água passar",
            "Conduzir eletricidade",
            "Ser flexível",
          ],
          correct: "B",
        },
        {
          id: "EF05CI01_C04",
          text: "Qual material é mais adequado para fazer uma régua?",
          options: ["Algodão", "Plástico rígido", "Papel", "Borracha"],
          correct: "B",
        },
      ],
    },
    level2: {
      stage: "ENTENDE",
      fase1_percebe:
        "<p>Agora que conhecemos as propriedades, vamos entender como testá-las e compará-las.</p>",
      fase2_investiga:
        "<p>Como você testaria se um material é mais resistente que outro? Que experimento poderia fazer?</p>",
      fase3_registra:
        "Descreva um experimento simples para testar a resistência de dois materiais diferentes.",
      fase4_consolida:
        "<p>Podemos comparar materiais testando suas propriedades: dureza (riscar), flexibilidade (dobrar), impermeabilidade (molhar), condutividade (aquecer).</p>",
      questions_bank: [
        {
          id: "EF05CI01_E01",
          text: "Para testar a dureza de dois materiais, você deve:",
          options: [
            "Pesá-los",
            "Tentar riscar um com o outro",
            "Aquecê-los",
            "Molhá-los",
          ],
          correct: "B",
        },
        {
          id: "EF05CI01_E02",
          text: "Um material que volta à forma original após ser dobrado é:",
          options: ["Rígido", "Frágil", "Elástico", "Opaco"],
          correct: "C",
        },
        {
          id: "EF05CI01_E03",
          text: "Qual propriedade diferencia o metal do plástico para fios elétricos?",
          options: ["Cor", "Condutividade elétrica", "Peso", "Flexibilidade"],
          correct: "B",
        },
        {
          id: "EF05CI01_E04",
          text: "Por que isolamos fios elétricos com plástico?",
          options: [
            "É mais bonito",
            "É mais barato",
            "Não conduz eletricidade",
            "É mais leve",
          ],
          correct: "C",
        },
      ],
    },
    level3: {
      stage: "APLICA",
      fase1_percebe:
        "<p>Vamos aplicar o que aprendemos para resolver problemas reais envolvendo escolha de materiais.</p>",
      fase2_investiga:
        "<p>Uma escola precisa construir um playground. Quais materiais seriam mais adequados para cada parte e por quê?</p>",
      fase3_registra:
        "Projete um objeto útil para a escola, escolhendo os materiais adequados e justificando cada escolha.",
      fase4_consolida:
        "<p>Engenheiros e designers escolhem materiais com base nas propriedades necessárias para cada aplicação. Esse conhecimento é usado diariamente.</p>",
      questions_bank: [
        {
          id: "EF05CI01_A01",
          text: "Para construir um escorregador de playground, o melhor material seria:",
          options: [
            "Madeira sem tratamento",
            "Metal liso e resistente",
            "Papelão grosso",
            "Tecido",
          ],
          correct: "B",
        },
        {
          id: "EF05CI01_A02",
          text: "Um copo para bebidas quentes deve ser feito de material que:",
          options: [
            "Conduza bem o calor",
            "Seja bom isolante térmico",
            "Seja transparente",
            "Seja flexível",
          ],
          correct: "B",
        },
        {
          id: "EF05CI01_A03",
          text: "Para proteger um celular de quedas, a capinha ideal deve ser:",
          options: [
            "Dura e rígida",
            "Flexível e absorvente de impacto",
            "Transparente e leve",
            "Pesada e grossa",
          ],
          correct: "B",
        },
        {
          id: "EF05CI01_A04",
          text: "Na construção de telhados, usa-se telha de cerâmica porque ela é:",
          options: [
            "Transparente e leve",
            "Impermeável e resistente ao calor",
            "Flexível e elástica",
            "Condutora de eletricidade",
          ],
          correct: "B",
        },
      ],
    },
  },
];

async function main() {
  const client = await pool.connect();

  try {
    for (const activityConfig of ACTIVITIES) {
      const existing = await client.query(
        'SELECT id FROM scae_activities WHERE "habilidadeCode" = $1 LIMIT 1',
        [activityConfig.habilidadeCode],
      );

      if (existing.rows.length > 0) {
        console.log(
          `  Activity ${activityConfig.habilidadeCode} already exists, skipping`,
        );
        continue;
      }

      let htmlContent;
      try {
        htmlContent = genSimulador.generateHTML(activityConfig);
      } catch (err) {
        console.error(
          `  Failed to generate HTML for ${activityConfig.habilidadeCode}:`,
          err.message,
        );
        continue;
      }

      await client.query(
        `INSERT INTO scae_activities (
          id, "habilidadeCode", "habilidadeDesc", discipline, grade, title,
          "htmlContent", "activityVersion", "isActive", "level1Content",
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5,
          $6, 'v4', true, $7,
          NOW(), NOW()
        )`,
        [
          activityConfig.habilidadeCode,
          activityConfig.habilidadeDesc,
          activityConfig.discipline,
          activityConfig.grade,
          activityConfig.title,
          htmlContent,
          JSON.stringify(activityConfig),
        ],
      );

      console.log(
        `  Activity ${activityConfig.habilidadeCode} - "${activityConfig.title}" seeded`,
      );
    }

    const countResult = await client.query(
      "SELECT COUNT(*) FROM scae_activities",
    );
    console.log(`> ${countResult.rows[0].count} activities total`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
