import "server-only";

export type GScaeLevel = "gs-strong" | "gs-mid" | "gs-weak";

export interface GScaeStage {
  name: string;
  level: GScaeLevel;
  description: string;
  tip?: string;
}

export interface CompatibilityEntry {
  profile: string;
  color: string;
  note: string;
}

export const LUDIC_EMOJI: Record<string, string> = {
  Analítico: "🦉",
  Especialista: "🦉",
  Estrategista: "🦅",
  Avaliador: "🦅",
  Criativo: "🐬",
  Mentor: "🐬",
  Prático: "🐜",
  Facilitador: "🐜",
  Equilibrado: "⭐",
};

export const LUDIC_TAG: Record<string, string> = {
  Analítico: "Você pensa fundo e quer entender o porquê de tudo!",
  Especialista: "Você pensa fundo e quer entender o porquê de tudo!",
  Estrategista: "Você aprende melhor quando o desafio é real e concreto!",
  Avaliador: "Você aprende melhor quando o desafio é real e concreto!",
  Criativo: "Você aprende sentindo, conectando com as pessoas e criando!",
  Mentor: "Você aprende sentindo, conectando com as pessoas e criando!",
  Prático: "Você aprende fazendo, experimentando e colocando a mão na massa!",
  Facilitador:
    "Você aprende fazendo, experimentando e colocando a mão na massa!",
  Equilibrado: "Você se adapta bem a diferentes formas de aprender!",
};

export const GSCAE_STUDENT_LUDIC: Record<string, GScaeStage[]> = {
  Especialista: [
    {
      name: "Percebe",
      level: "gs-weak",
      description: "Conectar com o conteúdo",
      tip: "Aqui precisa de mais apoio 💪",
    },
    {
      name: "Entende",
      level: "gs-strong",
      description: "Compreender a teoria",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Aplica",
      level: "gs-mid",
      description: "Praticar na vida real",
      tip: "Aqui você vai bem! 👍",
    },
    {
      name: "Resolve",
      level: "gs-strong",
      description: "Resolver desafios",
      tip: "Aqui você brilha! 🌟",
    },
  ],
  Analítico: [
    {
      name: "Percebe",
      level: "gs-weak",
      description: "Conectar com o conteúdo",
      tip: "Aqui precisa de mais apoio 💪",
    },
    {
      name: "Entende",
      level: "gs-strong",
      description: "Compreender a teoria",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Aplica",
      level: "gs-mid",
      description: "Praticar na vida real",
      tip: "Aqui você vai bem! 👍",
    },
    {
      name: "Resolve",
      level: "gs-strong",
      description: "Resolver desafios",
      tip: "Aqui você brilha! 🌟",
    },
  ],
  Avaliador: [
    {
      name: "Percebe",
      level: "gs-mid",
      description: "Conectar com o conteúdo",
      tip: "Aqui você vai bem! 👍",
    },
    {
      name: "Entende",
      level: "gs-strong",
      description: "Compreender a teoria",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Aplica",
      level: "gs-strong",
      description: "Praticar na vida real",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Resolve",
      level: "gs-strong",
      description: "Resolver desafios",
      tip: "Aqui você brilha! 🌟",
    },
  ],
  Estrategista: [
    {
      name: "Percebe",
      level: "gs-mid",
      description: "Conectar com o conteúdo",
      tip: "Aqui você vai bem! 👍",
    },
    {
      name: "Entende",
      level: "gs-strong",
      description: "Compreender a teoria",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Aplica",
      level: "gs-strong",
      description: "Praticar na vida real",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Resolve",
      level: "gs-strong",
      description: "Resolver desafios",
      tip: "Aqui você brilha! 🌟",
    },
  ],
  Mentor: [
    {
      name: "Percebe",
      level: "gs-strong",
      description: "Conectar com o conteúdo",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Entende",
      level: "gs-mid",
      description: "Compreender a teoria",
      tip: "Aqui você vai bem! 👍",
    },
    {
      name: "Aplica",
      level: "gs-weak",
      description: "Praticar na vida real",
      tip: "Aqui precisa de mais apoio 💪",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description: "Resolver desafios",
      tip: "Aqui você vai bem! 👍",
    },
  ],
  Criativo: [
    {
      name: "Percebe",
      level: "gs-strong",
      description: "Conectar com o conteúdo",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Entende",
      level: "gs-mid",
      description: "Compreender a teoria",
      tip: "Aqui você vai bem! 👍",
    },
    {
      name: "Aplica",
      level: "gs-weak",
      description: "Praticar na vida real",
      tip: "Aqui precisa de mais apoio 💪",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description: "Resolver desafios",
      tip: "Aqui você vai bem! 👍",
    },
  ],
  Prático: [
    {
      name: "Percebe",
      level: "gs-strong",
      description: "Conectar com o conteúdo",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Entende",
      level: "gs-weak",
      description: "Compreender a teoria",
      tip: "Aqui precisa de mais apoio 💪",
    },
    {
      name: "Aplica",
      level: "gs-strong",
      description: "Praticar na vida real",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description: "Resolver desafios",
      tip: "Aqui você vai bem! 👍",
    },
  ],
  Facilitador: [
    {
      name: "Percebe",
      level: "gs-strong",
      description: "Conectar com o conteúdo",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Entende",
      level: "gs-weak",
      description: "Compreender a teoria",
      tip: "Aqui precisa de mais apoio 💪",
    },
    {
      name: "Aplica",
      level: "gs-strong",
      description: "Praticar na vida real",
      tip: "Aqui você brilha! 🌟",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description: "Resolver desafios",
      tip: "Aqui você vai bem! 👍",
    },
  ],
  Equilibrado: [
    {
      name: "Percebe",
      level: "gs-mid",
      description: "Conectar com o conteúdo",
      tip: "Aqui você vai bem! 👍",
    },
    {
      name: "Entende",
      level: "gs-mid",
      description: "Compreender a teoria",
      tip: "Aqui você vai bem! 👍",
    },
    {
      name: "Aplica",
      level: "gs-mid",
      description: "Praticar na vida real",
      tip: "Aqui você vai bem! 👍",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description: "Resolver desafios",
      tip: "Aqui você vai bem! 👍",
    },
  ],
};

export const GSCAE_STUDENT_FULL: Record<string, GScaeStage[]> = {
  Especialista: [
    {
      name: "Percebe",
      level: "gs-weak",
      description:
        "Desafio: criar conexão emocional e vivencial com o conteúdo antes de avançar",
    },
    {
      name: "Entende",
      level: "gs-strong",
      description:
        "Seu ponto mais forte — absorve teoria com facilidade, profundidade e rigor",
    },
    {
      name: "Aplica",
      level: "gs-mid",
      description:
        "Bom desempenho quando há estrutura clara, objetivos definidos e feedback preciso",
    },
    {
      name: "Resolve",
      level: "gs-strong",
      description:
        "Natural para você: análise crítica, síntese e avaliação rigorosa dos resultados",
    },
  ],
  Avaliador: [
    {
      name: "Percebe",
      level: "gs-mid",
      description:
        "Aprende conectando teoria e prática — contextualize bem antes de avançar",
    },
    {
      name: "Entende",
      level: "gs-strong",
      description:
        "Forte em compreender estruturas complexas e raciocínio sistemático",
    },
    {
      name: "Aplica",
      level: "gs-strong",
      description:
        "Muito forte: você aprende fazendo — projetos e desafios são seu ambiente ideal",
    },
    {
      name: "Resolve",
      level: "gs-strong",
      description:
        "Alta capacidade de avaliar, sistematizar e aprimorar continuamente os resultados",
    },
  ],
  Mentor: [
    {
      name: "Percebe",
      level: "gs-strong",
      description:
        "Seu ponto mais forte — precisa sentir conexão e significado para aprender de verdade",
    },
    {
      name: "Entende",
      level: "gs-mid",
      description:
        "Aprende bem quando o conteúdo é contextualizado, humanizado e relevante",
    },
    {
      name: "Aplica",
      level: "gs-weak",
      description:
        "Prefere observar antes de agir — seja gentil consigo ao enfrentar desafios práticos",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description:
        "Boa capacidade reflexiva — use seu senso relacional para construir sínteses ricas",
    },
  ],
  Facilitador: [
    {
      name: "Percebe",
      level: "gs-strong",
      description:
        "Você aprende tocando, fazendo e experimentando — engajamento imediato é sua marca",
    },
    {
      name: "Entende",
      level: "gs-weak",
      description:
        "Desafio: consolidar a teoria antes de partir para a próxima prática",
    },
    {
      name: "Aplica",
      level: "gs-strong",
      description:
        "Seu ambiente natural — atividades práticas, criativas e colaborativas",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description:
        "Inclua momentos de reflexão para fechar o ciclo — síntese fortalece o aprendizado",
    },
  ],
  Equilibrado: [
    {
      name: "Percebe",
      level: "gs-mid",
      description:
        "Adapta-se bem a diferentes contextos e formas de engajamento",
    },
    {
      name: "Entende",
      level: "gs-mid",
      description: "Bom equilíbrio entre teoria e contextualização prática",
    },
    {
      name: "Aplica",
      level: "gs-mid",
      description:
        "Desempenho equilibrado em atividades práticas e colaborativas",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description:
        "Boa capacidade geral de síntese, metacognição e autoavaliação",
    },
  ],
};

export const GSCAE_TEACHER: Record<string, GScaeStage[]> = {
  Mentor: [
    {
      name: "Percebe",
      level: "gs-strong",
      description:
        "Cria vínculos emocionais genuínos e ambientes acolhedores — seu terreno natural no ciclo",
    },
    {
      name: "Entende",
      level: "gs-mid",
      description:
        "Contextualiza o conteúdo via experiências — aprofunde mais a dimensão teórica",
    },
    {
      name: "Aplica",
      level: "gs-weak",
      description:
        "Ponto de crescimento: estruturar atividades mais desafiadoras com objetivos claros",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description:
        "A relação de confiança sustenta a avaliação — inclua critérios explícitos de síntese",
    },
  ],
  Facilitador: [
    {
      name: "Percebe",
      level: "gs-strong",
      description:
        "Engaja os alunos com vivências concretas e imediatas desde o início da aula",
    },
    {
      name: "Entende",
      level: "gs-weak",
      description:
        "Atenção: pode avançar para a prática antes de consolidar a compreensão conceitual",
    },
    {
      name: "Aplica",
      level: "gs-strong",
      description:
        "Seu ponto mais forte — atividades práticas, colaborativas e dinâmicas",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description:
        "Inclua momentos de síntese explícita para fechar bem o ciclo de aprendizagem",
    },
  ],
  Especialista: [
    {
      name: "Percebe",
      level: "gs-weak",
      description:
        "Ponto de crescimento: criar ganchos emocionais e contextos vivenciais de entrada",
    },
    {
      name: "Entende",
      level: "gs-strong",
      description:
        "Seu ponto mais forte — explicações profundas, rigorosas e bem estruturadas",
    },
    {
      name: "Aplica",
      level: "gs-mid",
      description:
        "Conduz bem práticas estruturadas — amplie a autonomia e o protagonismo do aluno",
    },
    {
      name: "Resolve",
      level: "gs-strong",
      description:
        "Alta capacidade de promover análise crítica, síntese e avaliação rigorosa",
    },
  ],
  Avaliador: [
    {
      name: "Percebe",
      level: "gs-mid",
      description:
        "Conecta experiência e conceito — invista mais no componente emocional e relacional",
    },
    {
      name: "Entende",
      level: "gs-strong",
      description:
        "Excelente em teorizar, estruturar e articular o conhecimento de forma sistemática",
    },
    {
      name: "Aplica",
      level: "gs-strong",
      description:
        "Combina teoria e prática com fluidez — muito forte na execução orientada",
    },
    {
      name: "Resolve",
      level: "gs-strong",
      description:
        "Natural: promove avaliação contínua, sistemática e orientada a resultados mensuráveis",
    },
  ],
  Equilibrado: [
    {
      name: "Percebe",
      level: "gs-mid",
      description:
        "Adapta-se bem a diferentes contextos emocionais e vivenciais dos alunos",
    },
    {
      name: "Entende",
      level: "gs-mid",
      description:
        "Equilibrado na condução de conteúdo conceitual e estruturado",
    },
    {
      name: "Aplica",
      level: "gs-mid",
      description:
        "Equilibrado na condução de atividades práticas e colaborativas",
    },
    {
      name: "Resolve",
      level: "gs-mid",
      description:
        "Equilibrado na promoção de síntese, avaliação e metacognição",
    },
  ],
};

export const TEACHER_STUDENT_COMPATIBILITY: Record<
  string,
  CompatibilityEntry[]
> = {
  Mentor: [
    {
      profile: "Mentor",
      color: "#D97706",
      note: "Alta afinidade natural — cuidado para não reforçar apenas a zona de conforto. Inclua desafios claros.",
    },
    {
      profile: "Facilitador",
      color: "#059669",
      note: "Ótima energia em sala — canalize para aprendizagens concretas com objetivos bem definidos.",
    },
    {
      profile: "Especialista",
      color: "#7C3AED",
      note: "Aprecia seu acolhimento, mas precisa de mais estrutura teórica e rigor conceitual.",
    },
    {
      profile: "Avaliador",
      color: "#0047AB",
      note: "Pode se frustrar com o ritmo relacional — inclua desafios práticos e avaliações sistemáticas.",
    },
  ],
  Facilitador: [
    {
      profile: "Facilitador",
      color: "#059669",
      note: "Alta energia e engajamento — estruture bem os momentos de síntese e consolidação do conteúdo.",
    },
    {
      profile: "Mentor",
      color: "#D97706",
      note: "Afinidade nos valores — inclua objetivos claros e avaliação sistemática para dar consistência.",
    },
    {
      profile: "Avaliador",
      color: "#0047AB",
      note: "Grande sinergia nas atividades práticas — juntos chegam longe em projetos e desafios.",
    },
    {
      profile: "Especialista",
      color: "#7C3AED",
      note: "Tensão produtiva — ofereça tempo de reflexão individual e ancoragem teórica sólida.",
    },
  ],
  Especialista: [
    {
      profile: "Especialista",
      color: "#7C3AED",
      note: "Sintonia natural em profundidade — crie também espaço para experimentação e descoberta.",
    },
    {
      profile: "Avaliador",
      color: "#0047AB",
      note: "Combinação poderosa — ele traz a dimensão prática que você aprofunda teoricamente.",
    },
    {
      profile: "Facilitador",
      color: "#059669",
      note: "Tensão construtiva — valorize a energia prática e ofereça ancoragem conceitual sólida.",
    },
    {
      profile: "Mentor",
      color: "#D97706",
      note: "Desafio: ele aprende pelo vínculo — invista em contextualização afetiva antes da teoria.",
    },
  ],
  Avaliador: [
    {
      profile: "Avaliador",
      color: "#0047AB",
      note: "Alta sintonia em tarefas — diversifique para evitar ambientes excessivamente competitivos.",
    },
    {
      profile: "Especialista",
      color: "#7C3AED",
      note: "Excelente parceria intelectual — aprecia o rigor analítico e a profundidade.",
    },
    {
      profile: "Facilitador",
      color: "#059669",
      note: "Energia complementar — ele traz dinamismo, você traz estrutura e sistematização.",
    },
    {
      profile: "Mentor",
      color: "#D97706",
      note: "Pode parecer frio para ele — invista em conexão humana genuína antes da tarefa.",
    },
  ],
  Equilibrado: [
    {
      profile: "Especialista",
      color: "#7C3AED",
      note: "Aprecia estrutura e teoria — ofereça aprofundamento conceitual e rigor acadêmico.",
    },
    {
      profile: "Avaliador",
      color: "#0047AB",
      note: "Alta receptividade a desafios práticos e abordagens sistemáticas.",
    },
    {
      profile: "Mentor",
      color: "#D97706",
      note: "Responde bem ao acolhimento e à contextualização afetiva e relacional.",
    },
    {
      profile: "Facilitador",
      color: "#059669",
      note: "Engaja bem com dinamismo, criatividade e atividades colaborativas.",
    },
  ],
};

export const TIER_COLORS: Record<string, string> = {
  CONFIRMED: "#059669",
  PREDOMINANT: "#0047AB",
  IN_MAPPING: "#D97706",
};

export const TIER_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmado",
  PREDOMINANT: "Predominante",
  IN_MAPPING: "Em Mapeamento",
};

export const AXIS_LABELS = {
  student: {
    x: "Processamento (Reflexão↔Experimentação)",
    y: "Percepção (Vivência↔Conceituação)",
  },
  teacher: {
    x: "Processamento (Tradição↔Inovação)",
    y: "Percepção (Vivência↔Conceituação)",
  },
};
