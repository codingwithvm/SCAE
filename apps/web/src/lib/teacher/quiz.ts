export type TeacherAnswerValue = 1 | 2;

export interface TeacherQuestion {
  id: number;
  statement: string;
  optionA: string;
  optionB: string;
}

export const TEACHER_MCEES_QUESTIONS: TeacherQuestion[] = [
  {
    id: 1,
    statement: "Quando planeio uma aula sobre um conteúdo novo, prefiro...",
    optionA:
      "Criar uma atividade original, explorando possibilidades diversas.",
    optionB:
      "Pesquisar referências e organizar o conteúdo de forma estruturada.",
  },
  {
    id: 2,
    statement: "Para apresentar um conceito complexo aos alunos, costumo...",
    optionA: "Usar exemplos concretos e situações do cotidiano.",
    optionB: "Explicar a teoria com clareza antes de partir para exemplos.",
  },
  {
    id: 3,
    statement: "Ao perceber que um aluno não compreendeu o conteúdo, eu...",
    optionA:
      "Experimento abordagens diferentes até encontrar a que funciona para ele.",
    optionB: "Revejo minha explicação de forma mais detalhada e sistemática.",
  },
  {
    id: 4,
    statement: "Na organização do meu planejamento semestral, prefiro...",
    optionA: "Ter flexibilidade para adaptar o roteiro conforme o andamento.",
    optionB: "Seguir um cronograma detalhado estabelecido com antecedência.",
  },
  {
    id: 5,
    statement: "Quando avalio meus alunos, prefiro...",
    optionA: "Propor projetos criativos onde eles demonstrem o que aprenderam.",
    optionB:
      "Aplicar instrumentos estruturados que mensurem o domínio do conteúdo.",
  },
  {
    id: 6,
    statement: "Para manter o engajamento da turma, costumo...",
    optionA: "Variar constantemente as dinâmicas e recursos utilizados.",
    optionB: "Manter uma rotina clara que dê segurança aos alunos.",
  },
  {
    id: 7,
    statement: "Quando me atualizo profissionalmente, prefiro...",
    optionA:
      "Participar de eventos e trocar experiências com outros educadores.",
    optionB:
      "Estudar textos acadêmicos e pesquisas da área de forma aprofundada.",
  },
  {
    id: 8,
    statement: "Frente a um conteúdo que domino menos, costumo...",
    optionA:
      "Propor atividades investigativas onde aprendo junto com os alunos.",
    optionB:
      "Estudar o tema antes de apresentá-lo, garantindo segurança na explicação.",
  },

  // Section 2 — Questions 9–16
  {
    id: 9,
    statement: "Na organização do espaço da sala de aula, prefiro...",
    optionA: "Arranjos flexíveis que facilitem a colaboração entre alunos.",
    optionB: "Uma disposição organizada que favoreça a atenção e o foco.",
  },
  {
    id: 10,
    statement: "Ao introduzir um tema novo, costumo começar com...",
    optionA: "Uma provocação ou situação-problema que desperte a curiosidade.",
    optionB: "Uma apresentação clara dos objetivos e da estrutura da aula.",
  },
  {
    id: 11,
    statement: "Quando trabalho em equipe com outros professores, prefiro...",
    optionA: "Propor ideias inovadoras e explorar novas abordagens juntos.",
    optionB: "Definir papéis claros e seguir um plano de ação bem estruturado.",
  },
  {
    id: 12,
    statement: "Para estimular o pensamento crítico dos alunos, costumo...",
    optionA: "Propor debates abertos e questionar as respostas óbvias.",
    optionB:
      "Apresentar diferentes perspectivas de forma organizada e comparativa.",
  },
  {
    id: 13,
    statement: "Ao dar feedback aos alunos, prefiro...",
    optionA: "Conversas individuais abertas, explorando o raciocínio deles.",
    optionB:
      "Devolutivas estruturadas com critérios claros e orientações específicas.",
  },
  {
    id: 14,
    statement: "No uso de tecnologia em sala, costumo...",
    optionA: "Explorar ferramentas novas que possam enriquecer a experiência.",
    optionB: "Utilizar recursos já testados que funcionam de forma previsível.",
  },
  {
    id: 15,
    statement: "Quando a turma foge do planejado, costumo...",
    optionA: "Aproveitar o desvio como oportunidade de aprendizagem.",
    optionB: "Redirecionar gentilmente para o plano original.",
  },
  {
    id: 16,
    statement: "Para desenvolver a autonomia dos alunos, prefiro...",
    optionA: "Propor desafios abertos em que eles escolham seus caminhos.",
    optionB: "Oferecer roteiros graduais que os guiem ao longo do processo.",
  },

  // Section 3 — Questions 17–24
  {
    id: 17,
    statement: "Quando planejo atividades práticas, costumo...",
    optionA: "Deixar espaço para que os alunos experimentem livremente.",
    optionB: "Definir etapas claras para que todos saibam o que fazer.",
  },
  {
    id: 18,
    statement: "Na relação com os alunos, prefiro ser visto como...",
    optionA: "Um parceiro que explora junto e aprende com eles.",
    optionB: "Uma referência que orienta com clareza e segurança.",
  },
  {
    id: 19,
    statement: "Para lidar com diferenças de ritmo na turma, costumo...",
    optionA:
      "Propor atividades em múltiplos níveis para que cada um avance no seu tempo.",
    optionB: "Organizar intervenções sistemáticas para nivelar a turma.",
  },
  {
    id: 20,
    statement: "Quando erro no encaminhamento de uma aula, prefiro...",
    optionA: "Adaptar na hora e transformar o erro em aprendizagem.",
    optionB: "Reconhecer o erro e replanejar com mais cuidado para a próxima.",
  },
  {
    id: 21,
    statement: "Para apresentar resultados do trabalho dos alunos, prefiro...",
    optionA: "Mostras criativas como exposições, saraus ou feiras.",
    optionB: "Apresentações formais com critérios bem definidos.",
  },
  {
    id: 22,
    statement: "Quando trabalho projetos interdisciplinares, costumo...",
    optionA: "Integrar áreas de forma orgânica, conforme as conexões surgem.",
    optionB:
      "Planejar as conexões antecipadamente com objetivos claros em cada área.",
  },
  {
    id: 23,
    statement: "Ao selecionar materiais didáticos, prefiro...",
    optionA:
      "Combinar recursos variados e não convencionais para enriquecer as aulas.",
    optionB: "Adotar materiais consolidados e alinhados ao currículo.",
  },
  {
    id: 24,
    statement: "Na gestão do tempo em sala de aula, costumo...",
    optionA:
      "Ser flexível e deixar atividades fluírem além do previsto quando necessário.",
    optionB: "Controlar o tempo com precisão para cumprir o planejado.",
  },

  // Section 4 — Questions 25–32
  {
    id: 25,
    statement: "Para motivar alunos com dificuldades, prefiro...",
    optionA: "Criar desafios personalizados que despertem o interesse deles.",
    optionB: "Oferecer suporte estruturado com passos claros e alcançáveis.",
  },
  {
    id: 26,
    statement: "Quando proponho trabalhos em grupo, costumo...",
    optionA:
      "Deixar os grupos se organizarem livremente e definirem seus papéis.",
    optionB: "Atribuir papéis definidos para garantir participação de todos.",
  },
  {
    id: 27,
    statement: "No planejamento do currículo, prefiro...",
    optionA:
      "Organizar os conteúdos a partir das questões e interesses dos alunos.",
    optionB:
      "Seguir a sequência lógica do currículo com objetivos progressivos.",
  },
  {
    id: 28,
    statement:
      "Para avaliar a evolução dos alunos ao longo do bimestre, prefiro...",
    optionA: "Acompanhar de forma contínua e qualitativa o processo deles.",
    optionB: "Aplicar avaliações periódicas com critérios mensuráveis.",
  },
  {
    id: 29,
    statement: "Quando um aluno apresenta uma solução inesperada, costumo...",
    optionA: "Explorar a ideia com entusiasmo, mesmo que não fosse o esperado.",
    optionB:
      "Analisar se a solução atende aos critérios estabelecidos antes de validá-la.",
  },
  {
    id: 30,
    statement:
      "Para desenvolver habilidades socioemocionais nos alunos, prefiro...",
    optionA:
      "Trabalhar de forma integrada e contextualizada ao longo das aulas.",
    optionB: "Incluir atividades específicas planejadas para esse fim.",
  },
  {
    id: 31,
    statement: "Na comunicação com as famílias, costumo...",
    optionA:
      "Dialogar abertamente sobre o desenvolvimento integral dos alunos.",
    optionB:
      "Apresentar relatórios objetivos com informações sobre desempenho e frequência.",
  },
  {
    id: 32,
    statement: "Ao refletir sobre minha prática docente, prefiro...",
    optionA: "Registrar percepções livremente e explorar novas possibilidades.",
    optionB:
      "Comparar resultados com os objetivos definidos e ajustar sistematicamente.",
  },
];

export const TEACHER_MCEES_TOTAL = TEACHER_MCEES_QUESTIONS.length; // 32

export const TEACHER_MEES_QUESTIONS: TeacherQuestion[] = [
  {
    id: 1,
    statement: "Ao iniciar uma aula, prefiro...",
    optionA: "Apresentar um problema aberto e deixar os alunos explorarem.",
    optionB: "Explicar claramente os objetivos e o roteiro da aula.",
  },
  {
    id: 2,
    statement: "Quando um aluno erra, costumo...",
    optionA: "Usar o erro como ponto de partida para uma nova descoberta.",
    optionB: "Corrigir com precisão e mostrar o caminho correto.",
  },
  {
    id: 3,
    statement: "Para organizar o conhecimento dos alunos, prefiro...",
    optionA:
      "Facilitar discussões em que eles constroem o entendimento juntos.",
    optionB: "Estruturar resumos e esquemas que consolidem o conteúdo.",
  },
  {
    id: 4,
    statement: "Na condução de atividades em grupo, prefiro...",
    optionA: "Circular pela sala, apoiando cada grupo conforme a necessidade.",
    optionB: "Monitorar o progresso com critérios claros para todos os grupos.",
  },
  {
    id: 5,
    statement: "Quando preparo uma avaliação, costumo...",
    optionA: "Propor situações abertas que valorizem o processo de raciocínio.",
    optionB: "Elaborar questões objetivas com critérios de correção definidos.",
  },
  {
    id: 6,
    statement: "Na relação com os alunos, valorizo mais...",
    optionA: "A confiança e o diálogo aberto sobre dificuldades.",
    optionB: "O respeito às regras e o cumprimento dos combinados.",
  },
  {
    id: 7,
    statement: "Para explicar um conceito difícil, costumo...",
    optionA:
      "Criar analogias e metáforas criativas para facilitar a compreensão.",
    optionB: "Detalhar passo a passo com exemplos precisos e progressivos.",
  },
  {
    id: 8,
    statement: "Ao perceber que a turma não engajou, prefiro...",
    optionA: "Mudar a dinâmica imediatamente e propor algo mais interativo.",
    optionB:
      "Identificar a causa e ajustar o planejamento para a próxima aula.",
  },
  {
    id: 9,
    statement: "No encerramento de uma aula, costumo...",
    optionA: "Promover uma roda de conversa sobre o que foi aprendido.",
    optionB:
      "Revisar os pontos principais e verificar se os objetivos foram atingidos.",
  },
  {
    id: 10,
    statement: "Quando um aluno tem dificuldade persistente, prefiro...",
    optionA: "Acompanhá-lo individualmente, explorando suas dúvidas com ele.",
    optionB:
      "Oferecer material de apoio estruturado para reforço fora da aula.",
  },
  {
    id: 11,
    statement: "Para estimular a participação da turma, costumo...",
    optionA: "Fazer perguntas abertas que gerem debate e reflexão.",
    optionB:
      "Chamar alunos específicos com perguntas direcionadas ao conteúdo.",
  },
  {
    id: 12,
    statement: "Quando planejo uma sequência didática, prefiro...",
    optionA: "Deixar espaço para que o ritmo da turma guie o andamento.",
    optionB: "Definir antecipadamente cada etapa com objetivos claros.",
  },
  {
    id: 13,
    statement: "Para desenvolver a autonomia dos alunos, costumo...",
    optionA: "Propor situações em que eles precisam tomar decisões sozinhos.",
    optionB:
      "Ensinar estratégias de estudo e organização para uso independente.",
  },
  {
    id: 14,
    statement: "Ao dar uma devolutiva de avaliação, prefiro...",
    optionA: "Conversar individualmente sobre o desenvolvimento de cada aluno.",
    optionB: "Entregar um relatório com análise detalhada do desempenho.",
  },
  {
    id: 15,
    statement: "Na gestão do comportamento em sala, costumo...",
    optionA:
      "Resolver conflitos com diálogo, entendendo o contexto de cada caso.",
    optionB: "Aplicar combinados pré-estabelecidos de forma consistente.",
  },
  {
    id: 16,
    statement: "Para avaliar minha própria prática, prefiro...",
    optionA:
      "Refletir sobre como os alunos responderam emocionalmente às aulas.",
    optionB: "Analisar os resultados de aprendizagem em relação aos objetivos.",
  },
];

export const TEACHER_MEES_TOTAL = TEACHER_MEES_QUESTIONS.length;
