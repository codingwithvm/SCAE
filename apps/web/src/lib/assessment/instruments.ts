import "server-only";

import type { Block, MEESSection, ExtraPair } from "./types";

export const MCEES_1A4: Block[] = [
  {
    b: 1,
    title: "Como Aprendo Melhor",
    items: [
      {
        d: "CA",
        t: "Aprendo melhor quando entendo as regras e o porquê das coisas",
      },
      {
        d: "EC",
        t: "Aprendo melhor quando posso tocar, criar e experimentar de verdade",
      },
      {
        d: "EA",
        t: "Aprendo melhor quando posso tentar fazer as coisas por conta própria",
      },
      {
        d: "OR",
        t: "Aprendo melhor quando posso observar bastante antes de tentar fazer",
      },
    ],
  },
  {
    b: 2,
    title: "O Que Mais Gosto nas Aulas",
    items: [
      {
        d: "CA",
        t: "Quando a professora explica tudo certinho, passo a passo, com regras e exemplos",
      },
      {
        d: "EC",
        t: "Quando posso usar as mãos, desenhar ou montar alguma coisa",
      },
      {
        d: "EA",
        t: "Quando posso fazer projetos e resolver desafios práticos",
      },
      {
        d: "OR",
        t: "Quando tenho tempo para pensar com calma antes de responder",
      },
    ],
  },
  {
    b: 3,
    title: "Quando Não Entendo Alguma Coisa",
    items: [
      {
        d: "CA",
        t: "Peço para alguém explicar de novo, passo a passo, com bastante clareza",
      },
      {
        d: "EC",
        t: "Prefiro ver um exemplo real ou tentar usar objetos para entender",
      },
      {
        d: "EA",
        t: "Prefiro tentar de um jeito diferente até conseguir resolver",
      },
      {
        d: "OR",
        t: "Fico observando como os outros fazem antes de tentar por conta própria",
      },
    ],
  },
  {
    b: 4,
    title: "Como Me Sinto na Escola",
    items: [
      {
        d: "CA",
        t: "Me sinto bem quando entendo a lógica e o porquê de tudo o que aprendo",
      },
      {
        d: "EC",
        t: "Me sinto bem quando as aulas têm atividades práticas e divertidas",
      },
      {
        d: "EA",
        t: "Me sinto bem quando posso participar e colocar minhas ideias em prática",
      },
      {
        d: "OR",
        t: "Me sinto bem quando tenho espaço para pensar e refletir com calma",
      },
    ],
  },
];

export const MCEES_5A9: Block[] = [
  {
    b: 1,
    title: "Minha Forma de Aprender",
    items: [
      {
        d: "CA",
        t: "Prefiro aprender por meio de explicações teóricas, conceitos e raciocínio lógico",
      },
      {
        d: "EC",
        t: "Prefiro aprender com experiências práticas e situações do cotidiano real",
      },
      {
        d: "EA",
        t: "Prefiro aprender experimentando e tentando resolver os problemas por conta própria",
      },
      {
        d: "OR",
        t: "Prefiro aprender observando, lendo e refletindo antes de agir",
      },
    ],
  },
  {
    b: 2,
    title: "Em Trabalhos em Grupo",
    items: [
      {
        d: "CA",
        t: "Gosto de analisar os dados e criar explicações lógicas para o grupo",
      },
      {
        d: "EC",
        t: "Gosto de trazer exemplos da vida real para enriquecer o trabalho do grupo",
      },
      {
        d: "EA",
        t: "Gosto de propor soluções e liderar a execução das ideias do grupo",
      },
      {
        d: "OR",
        t: "Gosto de ouvir todas as ideias e refletir com cuidado antes de contribuir",
      },
    ],
  },
  {
    b: 3,
    title: "Diante de um Problema Novo",
    items: [
      {
        d: "CA",
        t: "Busco entender os princípios e montar uma estratégia lógica para resolver",
      },
      {
        d: "EC",
        t: "Confio na minha intuição e nas experiências que já vivi para encontrar a solução",
      },
      {
        d: "EA",
        t: "Parto logo para a ação, testando diferentes soluções possíveis",
      },
      {
        d: "OR",
        t: "Observo o problema de vários ângulos e reflito antes de decidir o que fazer",
      },
    ],
  },
  {
    b: 4,
    title: "O Que Me Motiva a Estudar",
    items: [
      {
        d: "CA",
        t: "Quando compreendo profundamente os fundamentos e a lógica de um assunto",
      },
      {
        d: "EC",
        t: "Quando vejo a aplicação prática e o significado real do que estou aprendendo",
      },
      {
        d: "EA",
        t: "Quando posso criar, inovar e resolver desafios concretos com o que aprendi",
      },
      {
        d: "OR",
        t: "Quando tenho tempo para pensar, reler e aprofundar meu entendimento",
      },
    ],
  },
];

export const MCEES_PROF: Block[] = [
  {
    b: 1,
    title: "Como Prefiro Aprender",
    items: [
      {
        d: "CA",
        t: "Prefiro aprender por meio de leituras, estudos teóricos e análise conceitual aprofundada",
      },
      {
        d: "EC",
        t: "Prefiro aprender por meio de experiências concretas, vivências e exemplos práticos",
      },
      {
        d: "EA",
        t: "Prefiro aprender experimentando, aplicando e testando na prática profissional",
      },
      {
        d: "OR",
        t: "Prefiro aprender observando, refletindo e elaborando internamente antes de agir",
      },
    ],
  },
  {
    b: 2,
    title: "Em Formações e Capacitações",
    items: [
      {
        d: "CA",
        t: "Valorizo o rigor teórico e a fundamentação aprofundada dos conteúdos apresentados",
      },
      {
        d: "EC",
        t: "Valorizo as dinâmicas, relatos de experiência e situações reais trazidas pelos participantes",
      },
      {
        d: "EA",
        t: "Valorizo as atividades práticas onde posso experimentar e aplicar imediatamente o que aprendo",
      },
      {
        d: "OR",
        t: "Valorizo o tempo estruturado para reflexão, análise e aprofundamento das ideias",
      },
    ],
  },
  {
    b: 3,
    title: "Diante de um Desafio Profissional Novo",
    items: [
      {
        d: "CA",
        t: "Busco embasamento teórico e analiso diferentes perspectivas antes de tomar uma decisão",
      },
      {
        d: "EC",
        t: "Confio na minha experiência e intuição prática para encontrar as melhores soluções",
      },
      {
        d: "EA",
        t: "Parto para a ação rapidamente, ajustando minha abordagem conforme os resultados aparecem",
      },
      {
        d: "OR",
        t: "Observo, escuto colegas e reflito profundamente antes de definir minha estratégia",
      },
    ],
  },
  {
    b: 4,
    title: "O Que Me Estimula Profissionalmente",
    items: [
      {
        d: "CA",
        t: "Aprofundar teorias, desenvolver compreensão conceitual avançada e criar modelos de análise",
      },
      {
        d: "EC",
        t: "Vivenciar situações reais e construir conhecimento coletivo por meio da experiência compartilhada",
      },
      {
        d: "EA",
        t: "Implementar inovações, criar soluções práticas originais e ver resultados concretos",
      },
      {
        d: "OR",
        t: "Refletir criticamente, analisar processos complexos e elaborar novas perspectivas interpretativas",
      },
    ],
  },
];

export const MEES_PROF: MEESSection[] = [
  {
    s: 1,
    title: "Planejamento e Abordagem Pedagógica",
    pairs: [
      {
        n: 1,
        A: {
          d: "CA",
          t: "Baseio meu planejamento em fundamentação teórica sólida e rigor conceitual",
        },
        B: {
          d: "EC",
          t: "Baseio meu planejamento em situações concretas e experiências significativas",
        },
      },
      {
        n: 2,
        A: {
          d: "EA",
          t: "Costumo propor atividades práticas e desafios desde o início da aula",
        },
        B: {
          d: "OR",
          t: "Costumo dar tempo para que os alunos observem e reflitam antes de agir",
        },
      },
      {
        n: 3,
        A: {
          d: "CA",
          t: "Valorizo o rigor conceitual e a precisão do conhecimento ensinado",
        },
        B: {
          d: "OR",
          t: "Valorizo o processo reflexivo e o questionamento aprofundado dos alunos",
        },
      },
      {
        n: 4,
        A: {
          d: "EC",
          t: "Gosto de partir de exemplos concretos da vida real para introduzir conteúdos",
        },
        B: {
          d: "EA",
          t: "Gosto de propor desafios práticos como ponto de partida para a aprendizagem",
        },
      },
      {
        n: 5,
        A: {
          d: "CA",
          t: "Na minha aula, a teoria organiza e fundamenta todo o processo de aprendizagem",
        },
        B: {
          d: "EA",
          t: "Na minha aula, a experimentação e a ação são centrais no processo pedagógico",
        },
      },
      {
        n: 6,
        A: {
          d: "EC",
          t: "Prefiro conectar o conteúdo às vivências e ao cotidiano dos alunos",
        },
        B: {
          d: "OR",
          t: "Prefiro criar momentos estruturados de pausa para análise e reflexão coletiva",
        },
      },
      {
        n: 7,
        A: {
          d: "OR",
          t: "Inicio as aulas com perguntas que estimulam a observação e a reflexão crítica",
        },
        B: {
          d: "EC",
          t: "Inicio as aulas com atividades que ativam as experiências prévias dos alunos",
        },
      },
      {
        n: 8,
        A: {
          d: "EA",
          t: "Acredito que o aluno aprende mais fazendo, testando e aprendendo com os erros",
        },
        B: {
          d: "CA",
          t: "Acredito que uma base conceitual sólida facilita toda a aprendizagem posterior",
        },
      },
    ],
  },
  {
    s: 2,
    title: "Gestão da Aula e Dinâmica com os Alunos",
    pairs: [
      {
        n: 9,
        A: {
          d: "CA",
          t: "Priorizo explicações claras, organizadas e fundamentadas do conteúdo",
        },
        B: {
          d: "EC",
          t: "Priorizo atividades que conectem o conteúdo à realidade vivida pelos alunos",
        },
      },
      {
        n: 10,
        A: {
          d: "EA",
          t: "Incentivo os alunos a tomarem iniciativa e proporem suas próprias soluções",
        },
        B: {
          d: "OR",
          t: "Incentivo os alunos a observarem, analisarem e refletirem antes de agir",
        },
      },
      {
        n: 11,
        A: {
          d: "EC",
          t: "Uso exemplos concretos e histórias reais para engajar e motivar a turma",
        },
        B: {
          d: "CA",
          t: "Uso esquemas, mapas conceituais e explicações lógicas para organizar o conteúdo",
        },
      },
      {
        n: 12,
        A: {
          d: "OR",
          t: "Crio momentos estruturados de discussão e análise aprofundada na aula",
        },
        B: {
          d: "EA",
          t: "Crio oportunidades para os alunos testarem e descobrirem na prática",
        },
      },
      {
        n: 13,
        A: {
          d: "EA",
          t: "Encorajo os alunos a tentarem mesmo sem dominar completamente a teoria",
        },
        B: {
          d: "EC",
          t: "Encorajo os alunos a explorarem o conteúdo por meio de situações vivenciadas",
        },
      },
      {
        n: 14,
        A: {
          d: "CA",
          t: "Deixo claros os objetivos, critérios e a estrutura lógica da aula",
        },
        B: {
          d: "OR",
          t: "Abro espaço para dúvidas, debate e reelaboração coletiva das ideias",
        },
      },
      {
        n: 15,
        A: {
          d: "OR",
          t: "Valorizo as perguntas e hipóteses que os alunos constroem pela observação",
        },
        B: {
          d: "CA",
          t: "Valorizo a precisão, o rigor e a organização clara do pensamento dos alunos",
        },
      },
      {
        n: 16,
        A: {
          d: "EC",
          t: "Promovo conexões entre o conteúdo e situações familiares ao contexto dos alunos",
        },
        B: {
          d: "EA",
          t: "Promovo desafios e problemas que exigem ação criativa e resolução prática",
        },
      },
    ],
  },
  {
    s: 3,
    title: "Apoio aos Alunos e Diferenciação",
    pairs: [
      {
        n: 17,
        A: {
          d: "CA",
          t: "Quando um aluno tem dificuldade, explico o conceito de forma mais clara e detalhada",
        },
        B: {
          d: "EC",
          t: "Quando um aluno tem dificuldade, trago um exemplo concreto ou atividade prática",
        },
      },
      {
        n: 18,
        A: {
          d: "OR",
          t: "Ofereço ao aluno tempo e espaço para refletir e reorganizar o que sabe",
        },
        B: {
          d: "EA",
          t: "Incentivo o aluno a tentar novamente usando uma estratégia diferente",
        },
      },
      {
        n: 19,
        A: {
          d: "EC",
          t: "Busco conectar o conteúdo à experiência de vida do aluno para torná-lo significativo",
        },
        B: {
          d: "OR",
          t: "Ajudo o aluno a observar seu próprio processo e identificar onde está a dificuldade",
        },
      },
      {
        n: 20,
        A: {
          d: "EA",
          t: "Proponho tarefas práticas e projetos para o aluno avançar por meio da ação",
        },
        B: {
          d: "CA",
          t: "Proponho leituras e exercícios conceituais para aprofundar a compreensão teórica",
        },
      },
      {
        n: 21,
        A: {
          d: "CA",
          t: "Ajudo o aluno a organizar, sistematizar e consolidar o que aprendeu",
        },
        B: {
          d: "EA",
          t: "Desafio o aluno com novas situações-problema para que avance pelo fazer",
        },
      },
      {
        n: 22,
        A: {
          d: "EC",
          t: "Valorizo o que o aluno já sabe e vivenciou, construindo a partir disso",
        },
        B: {
          d: "CA",
          t: "Valorizo o rigor do conhecimento e ajudo o aluno a atingir a precisão conceitual",
        },
      },
      {
        n: 23,
        A: {
          d: "OR",
          t: "Encorajo o aluno a questionar, comparar e elaborar suas próprias conclusões",
        },
        B: {
          d: "EC",
          t: "Encorajo o aluno a explorar e descobrir por si mesmo por meio de experiências concretas",
        },
      },
      {
        n: 24,
        A: {
          d: "EA",
          t: "Prefiro que o aluno aprenda testando hipóteses e agindo sobre o problema",
        },
        B: {
          d: "OR",
          t: "Prefiro que o aluno aprenda refletindo criticamente sobre os processos vivenciados",
        },
      },
    ],
  },
  {
    s: 4,
    title: "Avaliação e Percepção da Aprendizagem",
    pairs: [
      {
        n: 25,
        A: {
          d: "CA",
          t: "Avalio principalmente a capacidade do aluno de compreender e aplicar conceitos com rigor",
        },
        B: {
          d: "EC",
          t: "Avalio principalmente a capacidade do aluno de relacionar o conteúdo à realidade concreta",
        },
      },
      {
        n: 26,
        A: {
          d: "OR",
          t: "Valorizo avaliações que evidenciam o processo reflexivo e analítico do aluno",
        },
        B: {
          d: "EA",
          t: "Valorizo avaliações que demonstram o que o aluno consegue realizar na prática",
        },
      },
      {
        n: 27,
        A: {
          d: "EC",
          t: "Considero que aprender é transformar experiências concretas em significado pessoal",
        },
        B: {
          d: "CA",
          t: "Considero que aprender é desenvolver uma compreensão clara e organizada dos conceitos",
        },
      },
      {
        n: 28,
        A: {
          d: "EA",
          t: "Prefiro avaliar por meio de projetos, produções e atividades práticas concretas",
        },
        B: {
          d: "OR",
          t: "Prefiro avaliar por portfólios reflexivos, ensaios críticos e análises aprofundadas",
        },
      },
      {
        n: 29,
        A: {
          d: "CA",
          t: "A aprendizagem ocorre quando o aluno domina a teoria e a aplica com precisão e rigor",
        },
        B: {
          d: "OR",
          t: "A aprendizagem ocorre quando o aluno desenvolve pensamento crítico e autonomia intelectual",
        },
      },
      {
        n: 30,
        A: {
          d: "EC",
          t: "Valorizo quando o aluno conecta o aprendizado à sua vida e às suas experiências reais",
        },
        B: {
          d: "EA",
          t: "Valorizo quando o aluno inova, cria soluções e aplica o conhecimento de forma original",
        },
      },
      {
        n: 31,
        A: {
          d: "OR",
          t: "Uma boa aula é aquela em que os alunos saem com novas perguntas e reflexões",
        },
        B: {
          d: "EC",
          t: "Uma boa aula é aquela em que os alunos vivenciaram algo significativo e concreto",
        },
      },
      {
        n: 32,
        A: {
          d: "EA",
          t: "O sucesso do meu ensino se revela nos resultados práticos e concretos que os alunos alcançam",
        },
        B: {
          d: "CA",
          t: "O sucesso do meu ensino se revela na sólida compreensão conceitual que os alunos desenvolveram",
        },
      },
    ],
  },
];

export const EXTRA_X: ExtraPair[] = [
  {
    A: { d: "OR", t: "Prefiro pensar bastante e observar antes de agir" },
    B: { d: "EA", t: "Prefiro partir logo para a ação e aprender fazendo" },
  },
  {
    A: { d: "OR", t: "Gosto de refletir com calma antes de tentar algo novo" },
    B: {
      d: "EA",
      t: "Gosto de tentar coisas novas imediatamente, sem esperar",
    },
  },
  {
    A: { d: "OR", t: "Quando tenho dúvida, analiso bastante antes de decidir" },
    B: {
      d: "EA",
      t: "Quando tenho dúvida, prefiro testar diferentes caminhos na prática",
    },
  },
];

export const EXTRA_Y: ExtraPair[] = [
  {
    A: {
      d: "CA",
      t: "Prefiro entender os princípios e a teoria por trás das coisas",
    },
    B: {
      d: "EC",
      t: "Prefiro aprender através de experiências concretas e situações reais",
    },
  },
  {
    A: {
      d: "CA",
      t: "Aprendo melhor quando a explicação é lógica, clara e bem fundamentada",
    },
    B: {
      d: "EC",
      t: "Aprendo melhor quando posso tocar, ver ou vivenciar concretamente",
    },
  },
  {
    A: { d: "CA", t: "Valorizo mais entender o porquê e a lógica das coisas" },
    B: {
      d: "EC",
      t: "Valorizo mais conectar o conteúdo a experiências e situações da vida real",
    },
  },
];

export const EXTRA_X_1A4: ExtraPair[] = [
  {
    A: {
      d: "OR",
      t: "Antes de fazer qualquer coisa, gosto de ficar olhando bastante para entender como funciona",
    },
    B: {
      d: "EA",
      t: "Prefiro logo começar a fazer e descobrir como é enquanto faço",
    },
  },
  {
    A: {
      d: "OR",
      t: "Quando não sei como fazer algo, espero ver como os outros fazem primeiro",
    },
    B: {
      d: "EA",
      t: "Quando não sei como fazer algo, prefiro tentar do meu jeito e ver o que acontece",
    },
  },
  {
    A: {
      d: "OR",
      t: "Gosto de pensar bastante com calma antes de responder ou começar",
    },
    B: {
      d: "EA",
      t: "Gosto de responder logo e ir ajustando conforme vou tentando",
    },
  },
];

export const EXTRA_Y_1A4: ExtraPair[] = [
  {
    A: {
      d: "CA",
      t: "Fico mais feliz quando a professora explica tudo direitinho, passo a passo, antes de eu começar",
    },
    B: {
      d: "EC",
      t: "Fico mais feliz quando posso tocar, brincar e fazer de verdade para aprender",
    },
  },
  {
    A: {
      d: "CA",
      t: "Prefiro quando alguém me ensina a regra certinha antes de eu tentar fazer",
    },
    B: {
      d: "EC",
      t: "Prefiro aprender descobrindo as coisas eu mesmo(a), mexendo e experimentando",
    },
  },
  {
    A: {
      d: "CA",
      t: "Me sinto melhor quando entendo bem como funciona antes de começar a atividade",
    },
    B: {
      d: "EC",
      t: "Me sinto melhor quando posso fazer as coisas na vida real, com as próprias mãos",
    },
  },
];
