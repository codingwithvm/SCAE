import {
  type MceesMcProfileName,
  type MeesProfileName,
} from "./teacher-profile";

export interface TeacherProfileData {
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const TEACHER_MCEES_PROFILE_DATA: Record<
  MceesMcProfileName,
  TeacherProfileData
> = {
  Criativo: {
    color: "#F6AD55",
    badgeBg: "#FFF5EB",
    badgeText: "#C05621",
    description:
      "Você tende a aprender de forma criativa, buscando soluções inovadoras e explorando possibilidades diversas.",
  },
  Analítico: {
    color: "#63B3ED",
    badgeBg: "#EBF8FF",
    badgeText: "#2B6CB0",
    description:
      "Você aprende de forma analítica, preferindo entender a lógica e a estrutura antes de avançar.",
  },
  Estrategista: {
    color: "#68D391",
    badgeBg: "#F0FFF4",
    badgeText: "#276749",
    description:
      "Você aprende como estrategista, planejando com antecedência e seguindo etapas bem definidas.",
  },
  Prático: {
    color: "#FC8181",
    badgeBg: "#FFF5F5",
    badgeText: "#C53030",
    description:
      "Você aprende de forma prática, preferindo experimentar e ver resultados concretos.",
  },
};

export const TEACHER_MEES_PROFILE_DATA: Record<
  MeesProfileName,
  TeacherProfileData
> = {
  Facilitador: {
    color: "#F6AD55",
    badgeBg: "#FFF5EB",
    badgeText: "#C05621",
    description:
      "Seu estilo de ensino é facilitador: você cria ambientes colaborativos e estimula a autonomia dos alunos.",
  },
  Avaliador: {
    color: "#63B3ED",
    badgeBg: "#EBF8FF",
    badgeText: "#2B6CB0",
    description:
      "Seu estilo de ensino é avaliador: você valoriza a mensuração criteriosa e o feedback estruturado.",
  },
  Especialista: {
    color: "#68D391",
    badgeBg: "#F0FFF4",
    badgeText: "#276749",
    description:
      "Seu estilo de ensino é especialista: você domina o conteúdo com profundidade e transmite com clareza e precisão.",
  },
  Mentor: {
    color: "#FC8181",
    badgeBg: "#FFF5F5",
    badgeText: "#C53030",
    description:
      "Seu estilo de ensino é mentor: você guia os alunos de forma personalizada, valorizando o percurso individual de cada um.",
  },
};

export const TEACHER_PROFILE_RELATIONS: Partial<
  Record<MceesMcProfileName, Partial<Record<MeesProfileName, string>>>
> = {
  Criativo: {
    Facilitador:
      "Professores com perfil criativo na aprendizagem e facilitador no ensino tendem a criar ambientes dinâmicos e exploratórios. Você busca inovação no seu próprio aprendizado e transfere essa abertura para a sala de aula, incentivando os alunos a explorar soluções de forma autônoma e colaborativa.",
    Avaliador:
      "Você combina criatividade na aprendizagem com rigor na avaliação. Isso pode gerar tensão produtiva: você explora ideias novas, mas exige clareza nos resultados — um equilíbrio valioso para turmas diversas.",
    Especialista:
      "Sua curiosidade criativa como aprendiz contrasta com o domínio técnico que você projeta no ensino. Você aprende explorando, mas ensina com precisão — uma combinação que pode enriquecer muito a prática pedagógica.",
    Mentor:
      "Você aprende de forma criativa e ensina de forma personalizada. Essa combinação favorece relações de confiança com os alunos, onde você os inspira a encontrar seus próprios caminhos.",
  },
  Analítico: {
    Facilitador:
      "Você aprende de forma analítica, mas ensina facilitando. Isso significa que você estrutura bem seu próprio conhecimento e depois cria espaços abertos para que os alunos construam o deles.",
    Avaliador:
      "Tanto no aprendizado quanto no ensino, você valoriza a lógica e a mensuração. Sua prática é consistente e fundamentada — você sabe o que quer alcançar e mede com clareza se está chegando lá.",
    Especialista:
      "Você aprende e ensina com profundidade analítica. Essa consistência torna você uma referência confiável, especialmente em conteúdos complexos que exigem rigor e precisão.",
    Mentor:
      "Você combina análise rigorosa na aprendizagem com sensibilidade no acompanhamento individual. Isso permite que você entenda onde cada aluno está e oriente com clareza e cuidado.",
  },
  Estrategista: {
    Facilitador:
      "Você planeja com estratégia e ensina facilitando. Sua organização garante que o espaço colaborativo que você cria tenha propósito e direção — estrutura sem engessar.",
    Avaliador:
      "Planejamento e avaliação formam a base da sua prática. Você define objetivos claros, executa com disciplina e mede os resultados com critério — uma abordagem sólida e confiável.",
    Especialista:
      "Você aprende e ensina com planejamento e domínio. Sua prática é metódica e aprofundada — os alunos sabem o que esperar e recebem um ensino estruturado e consistente.",
    Mentor:
      "Você planeja com antecedência e orienta individualmente. Isso lhe permite acompanhar o progresso de cada aluno com precisão, ajustando o suporte de acordo com as necessidades.",
  },
  Prático: {
    Facilitador:
      "Você aprende fazendo e ensina facilitando. Sua prática é orientada à ação — você cria oportunidades para que os alunos aprendam por meio da experiência, assim como você mesmo aprende.",
    Avaliador:
      "Você aprende na prática e avalia com rigor. Essa combinação valoriza tanto o processo quanto o resultado: você sabe que aprender exige tentativa, mas também que o progresso precisa ser mensurado.",
    Especialista:
      "Você aprende experimentando e ensina com domínio técnico. Sua experiência prática enriquece o conteúdo que você transmite — você não apenas explica, demonstra.",
    Mentor:
      "Você aprende fazendo e acompanha os alunos de forma personalizada. Sua orientação é baseada na prática vivida — você guia a partir do que sabe que funciona.",
  },
};
