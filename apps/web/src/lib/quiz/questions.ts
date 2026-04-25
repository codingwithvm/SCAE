export interface QuizQuestion {
  id: number;
  statement: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    statement:
      "Eu gosto de aprender coisas novas assistindo vídeos ou observando imagens.",
  },
  {
    id: 2,
    statement:
      "Eu prefiro ouvir uma explicação a ler um texto sobre o mesmo assunto.",
  },
  {
    id: 3,
    statement:
      "Eu gosto de colocar a mão na massa e aprender fazendo na prática.",
  },
  {
    id: 4,
    statement:
      "Eu me lembro melhor das coisas quando anoto ou desenho enquanto estudo.",
  },
  {
    id: 5,
    statement:
      "Eu gosto de estudar em grupo e trocar ideias com outras pessoas.",
  },
  {
    id: 6,
    statement: "Eu prefiro estudar sozinho, no meu ritmo, sem interrupções.",
  },
  {
    id: 7,
    statement:
      "Eu gosto de entender o porquê das coisas antes de tentar fazer.",
  },
  {
    id: 8,
    statement:
      "Eu fico empolgado quando consigo resolver um problema difícil por conta própria.",
  },
  {
    id: 9,
    statement:
      "Eu gosto de criar coisas novas, inventar e experimentar ideias diferentes.",
  },
  {
    id: 10,
    statement:
      "Eu me concentro melhor quando há silêncio e um ambiente organizado.",
  },
  {
    id: 11,
    statement:
      "Eu prefiro seguir um passo a passo claro do que tentar descobrir sozinho.",
  },
  {
    id: 12,
    statement:
      "Eu gosto de explicar o que aprendi para outra pessoa — isso me ajuda a fixar.",
  },
  {
    id: 13,
    statement:
      "Eu me envolvo mais quando a atividade tem um desafio ou competição.",
  },
  {
    id: 14,
    statement: "Eu gosto de usar música, ritmo ou movimento enquanto estudo.",
  },
  {
    id: 15,
    statement:
      "Eu prefiro ver exemplos reais e concretos a estudar teoria pura.",
  },
  {
    id: 16,
    statement:
      "Eu gosto de planejar meu estudo antes de começar, organizando tudo com antecedência.",
  },
];

export const SCALE_OPTIONS = [
  { value: 1, label: "Nunca" },
  { value: 2, label: "Raramente" },
  { value: 3, label: "Às vezes" },
  { value: 4, label: "Frequentemente" },
  { value: 5, label: "Sempre" },
] as const;

export type ScaleValue = (typeof SCALE_OPTIONS)[number]["value"];
