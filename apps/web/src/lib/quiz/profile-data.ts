import { type ProfileName } from "./profile";

export interface ProfileData {
  name: ProfileName;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  tips: [string, string, string];
}

export const PROFILE_DATA: Record<ProfileName, ProfileData> = {
  Criativo: {
    name: "Criativo",
    color: "#F6AD55",
    badgeBg: "#FFF5EB",
    badgeText: "#C05621",
    description:
      "Você gosta de inventar, imaginar e fazer as coisas do seu jeito. Você aprende melhor quando pode criar e explorar ideias novas.",
    tips: [
      "Tente desenhar ou criar histórias sobre o que você está aprendendo.",
      "Experimente resolver problemas de maneiras diferentes.",
      "Use sua imaginação para inventar novas formas de estudar.",
    ],
  },
  Analítico: {
    name: "Analítico",
    color: "#63B3ED",
    badgeBg: "#EBF8FF",
    badgeText: "#2B6CB0",
    description:
      "Você gosta de entender o porquê das coisas e analisar os detalhes. Você aprende melhor quando tem explicações claras e lógicas.",
    tips: [
      "Organize suas anotações em listas e esquemas para facilitar a revisão.",
      "Procure entender a lógica por trás de cada conceito antes de avançar.",
      "Use gráficos e tabelas para visualizar as informações de forma estruturada.",
    ],
  },
  Estrategista: {
    name: "Estrategista",
    color: "#68D391",
    badgeBg: "#F0FFF4",
    badgeText: "#276749",
    description:
      "Você gosta de planejar, organizar e pensar antes de agir. Você aprende melhor quando tem um plano claro e objetivos definidos.",
    tips: [
      "Crie um cronograma de estudos e siga ele com disciplina.",
      "Defina metas claras antes de começar cada sessão de estudo.",
      "Revise o que aprendeu ao final de cada dia para consolidar o conhecimento.",
    ],
  },
  Prático: {
    name: "Prático",
    color: "#FC8181",
    badgeBg: "#FFF5F5",
    badgeText: "#C53030",
    description:
      "Você gosta de colocar a mão na massa e aprender fazendo. Você aprende melhor quando pode experimentar e ver resultados concretos.",
    tips: [
      "Pratique exercícios e resolva problemas reais para fixar o conteúdo.",
      "Busque exemplos práticos e situações do dia a dia para conectar com o que estuda.",
      "Experimente antes de ler as instruções — o erro faz parte do aprendizado.",
    ],
  },
};
