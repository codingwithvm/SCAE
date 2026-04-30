import "server-only";

export interface ProfileData {
  titulo: string;
  cor: string;
  desc: string;
  fortes: string[];
  desafios: string[];
  estrategias?: string[];
  responsaveis?: string[];
  para1a4?: string[];
  para5a9?: string[];
  desenvolvimento?: string[];
  gscae: string;
}

export type InstrumentProfiles = Record<string, ProfileData>;

export type AllProfiles = Record<string, InstrumentProfiles>;

export const PROFILES: AllProfiles = {
  mcees_1a4: {
    Analitico: {
      titulo: "Aprendiz Analítico",
      cor: "#1D4ED8",
      desc: "Você tem uma mente que precisa entender o porquê de tudo! Aprende melhor quando as explicações são claras, organizadas e completas — você não gosta de fazer algo sem saber exatamente como funciona. Sua capacidade de prestar atenção nos detalhes e de guardar informações de forma ordenada é um presente especial. Você pensa com profundidade e, quando entende bem um assunto, dificilmente esquece o que aprendeu.",
      fortes: [
        "Atenção aos detalhes: você percebe coisas que a maioria das pessoas deixa passar. Isso torna seu aprendizado mais sólido e duradouro.",
        "Quando algo faz sentido para você, fica gravado com força. Você consegue explicar o que aprendeu com clareza e completude surpreendentes.",
        "Você faz as melhores perguntas da sala! Cada pergunta que faz mostra que está pensando de verdade — e isso é sinal de uma mente analítica que não aceita respostas superficiais.",
        "Capricho e organização natural: seu caderno, suas atividades e seus trabalhos mostram que você leva o aprendizado a sério — e isso faz toda a diferença ao longo dos anos.",
      ],
      desafios: [
        "Quando a explicação não é clara o suficiente, pode ser difícil avançar. Você prefere entender completamente antes de continuar — isso é uma qualidade, mas às vezes pede paciência.",
        "Atividades que pedem resposta muito rápida, sem tempo para pensar com calma, podem ser estressantes. Seu ritmo é o de quem pensa com qualidade, não com pressa.",
        "Às vezes você fica tão focado(a) em entender tudo perfeitamente que demora para começar. Lembrar que errar também faz parte do aprendizado pode ajudar muito.",
      ],
      estrategias: [
        "Leia as instruções com calma antes de começar qualquer atividade e sublinhe as partes mais importantes — isso ativa exatamente o seu jeito natural de aprender.",
        "Faça resumos e listas escritas com suas próprias palavras. Escrever o que aprendeu consolida o conhecimento de um jeito que só a sua mente organizada vai entender.",
        "Estude em um lugar tranquilo, sem barulho ou interrupção. Você precisa de silêncio para pensar com a profundidade que é natural para você.",
        "Quando não entender algo, peça para explicar de novo sem hesitar. Entender de verdade é mais importante do que parecer rápido.",
      ],
      responsaveis: [
        "Explique as tarefas com clareza e paciência, sempre mostrando o passo a passo. Para este perfil, 'como fazer' é tão importante quanto 'o que fazer'.",
        "Valorize cada pergunta que ele(a) faz — são sinais de um pensamento profundo e curioso que merece ser estimulado, nunca inibido ou apressado.",
        "Respeite o ritmo de processamento. Pressionar por respostas rápidas gera ansiedade e prejudica exatamente o que torna este perfil especial.",
        "Ofereça livros, enciclopédias infantis e materiais bem organizados. O perfil Analítico se alimenta de informação estruturada, rigorosa e confiável.",
        "Celebre o processo de entender, não só o resultado final. 'Que explicação incrível você deu!' vale muito mais do que um simples 'muito bem!'.",
      ],
      gscae:
        "No simulador G-SCAE, você vai encontrar atividades que começam com explicações claras e bem fundamentadas — exatamente o que você precisa para se sentir seguro(a). No estágio Entende, você vai aprofundar os conceitos no seu ritmo. No Aplica, vai usar a lógica para resolver situações reais. E no Resolve, vai mostrar toda a sua capacidade analítica! Os simuladores foram feitos para respeitar e potencializar o seu jeito especial de aprender.",
    },
    Criativo: {
      titulo: "Aprendiz Criativo",
      cor: "#D97706",
      desc: "Você aprende com o coração e com as mãos! Seu aprendizado é mais rico quando pode tocar, ver, sentir e criar coisas de verdade. Você tem uma imaginação especial que conecta o que aprende na escola com o mundo ao seu redor de formas que ninguém mais imagina. Quando se sente inspirado(a), produz coisas surpreendentes. Sua criatividade é um superpoder de aprendizagem que vai acompanhar você para sempre!",
      fortes: [
        "Imaginação fértil: você cria conexões entre coisas que parecem não ter relação. Essa habilidade rara vai ser muito valiosa por toda a vida.",
        "Aprende muito bem com exemplos concretos, materiais manuais, desenhos e modelos. Quando pode tocar e manipular algo, o aprendizado entra de verdade e fica.",
        "Você observa tudo com muita atenção antes de agir — quando finalmente age, a ação é mais certeira e bem pensada do que a de quem age sem pensar.",
        "Facilidade para expressar o que aprendeu de formas diferentes: desenhos, histórias, maquetes, teatros. Seu repertório de expressão é rico e genuíno.",
      ],
      desafios: [
        "Aulas muito longas com muita fala e pouca ação podem fazer a mente voar para outros lugares. Você precisa de estímulos variados para manter o engajamento.",
        "Pressão para agir rápido, sem tempo para observar e criar internamente, pode travar seu processo natural. Você tem um ritmo criativo próprio que precisa ser respeitado.",
        "Conteúdos que parecem não ter conexão com a vida real podem parecer sem sentido. Quando você entende o para quê de algo, o aprendizado flui com muito mais facilidade.",
      ],
      estrategias: [
        "Sempre que aprender algo novo, crie uma história, um desenho ou um exemplo da vida real que explique aquele conceito. Seu cérebro aprende pelo concreto e pelo significado.",
        "Use cores, mapas mentais e diagramas para organizar o que está estudando. O visual faz a informação 'grudar' de um jeito especial no perfil Criativo.",
        "Conecte o conteúdo escolar com coisas que você ama: esportes, música, natureza, jogos. Quando há interesse pessoal genuíno, a aprendizagem explode!",
        "Organize pequenas pausas durante o estudo para que a imaginação processe o que absorveu. Um intervalo criativo pode valer mais do que horas de estudo forçado.",
      ],
      responsaveis: [
        "Enriqueça o ambiente com materiais concretos: massinha, blocos, papéis coloridos, objetos do cotidiano. O perfil Criativo aprende pelo tato e pela experiência sensorial.",
        "Dê tempo para observar, refletir e processar antes de responder. 'O que você acha disso?' vale mais do que cobrar a resposta certa imediatamente.",
        "Conecte os estudos com passeios, museus, natureza e situações cotidianas. Para este perfil, o mundo fora da escola é uma extensão poderosa da sala de aula.",
        "Valorize produções criativas como formas legítimas de demonstrar aprendizado: um desenho detalhado pode revelar mais compreensão do que uma prova escrita.",
        "Experimentos caseiros, projetos manuais e culinária são ferramentas pedagógicas poderosas. Aprender fazendo é a língua nativa do perfil Criativo.",
      ],
      gscae:
        "No simulador G-SCAE, você vai explorar atividades ricas em imagens, situações concretas e criação! No estágio Percebe, você vai observar o mundo com seus olhos únicos. No Entende, vai conectar o que viu com seus próprios significados. No Aplica, vai usar sua criatividade para construir soluções originais. E no Resolve, vai surpreender com uma resposta que só você poderia criar!",
    },
    Estrategista: {
      titulo: "Aprendiz Estrategista",
      cor: "#059669",
      desc: "Você tem um dom especial: aprende as regras e já vai pensando em como usar na prática! Sua mente une o melhor dos dois mundos — entende as explicações com agilidade e logo quer colocar tudo em ação. Você gosta de desafios, não para quando tem um problema pela frente, e tem uma habilidade natural para criar planos e encontrar soluções inteligentes. Combinando conhecimento com ação, você é um(a) aprendiz completo(a) e versátil — o tipo de estudante que transforma o que aprende em resultado concreto.",
      fortes: [
        "Você capta explicações com agilidade e já imagina como usar o que aprendeu — essa ponte entre entender e fazer é um superpoder raro e muito valioso.",
        "Persistência na resolução de problemas: quando um caminho não funciona, você cria outro. Não desiste fácil e aprende muito com cada tentativa, certa ou errada.",
        "Excelente em projetos que misturam teoria e prática: ciências, matemática aplicada, construção de modelos e experimentos são os ambientes onde você se destaca naturalmente.",
        "Em trabalhos em grupo, você consegue contribuir tanto com ideias quanto com execução — isso faz de você um(a) parceiro(a) de equipe muito valioso(a) e um líder natural entre os colegas.",
      ],
      desafios: [
        "Atividades repetitivas e sem novidade podem parecer entediantes. Quando não há um desafio real, a motivação pode cair — e isso é completamente natural para um perfil como o seu.",
        "A vontade de ir logo para a prática pode fazer você pular etapas importantes de planejamento. Desenvolver paciência com os detalhes vai ampliar muito a qualidade dos resultados.",
        "Quando uma tarefa não tem objetivo claro, manter o foco fica mais difícil. Você aprende e produz muito melhor quando sabe exatamente o que está fazendo e por quê está fazendo.",
      ],
      estrategias: [
        "Antes de estudar, defina uma meta para aquela sessão: 'Hoje vou entender X para conseguir resolver Y.' Ter um objetivo claro ativa o seu melhor modo de aprendizagem!",
        "Depois de aprender algo novo, explique para alguém — um familiar, um amigo — usando suas próprias palavras. Ensinar é uma das formas mais poderosas de consolidar o que se sabe.",
        "Prefira estudar criando algo concreto: um projeto, um mapa, uma apresentação, um modelo. Seu aprendizado se solidifica quando você produz algo com o que estudou.",
        "Faça uma revisão rápida do que não ficou claro antes de avançar — isso evita que lacunas se acumulem e mantém sua base de conhecimento sólida e confiável.",
      ],
      responsaveis: [
        "Ofereça desafios com objetivos claros e bem definidos: 'Você consegue descobrir como montar isso?' ou 'Vamos resolver juntos esse problema real?' Esse estímulo é combustível para o perfil Estrategista.",
        "Valorize cada solução original que ele(a) criar, mesmo que o caminho não tenha sido o mais eficiente. Reconhecer o processo criativo fortalece a autoconfiança e o prazer de aprender.",
        "Projetos práticos que combinam pesquisa e criação — montar algo, planejar uma horta, organizar um evento familiar — são ferramentas pedagógicas poderosas para este perfil.",
        "Ajude-o(a) a desenvolver o hábito de revisar e refinar: 'Você fez muito bem! O que poderia ser ainda melhor?' Isso constrói pensamento crítico sem desestimular.",
        "Quando tiver dificuldade, ajude a quebrar o problema em partes menores e criar um pequeno plano de ação — isso ativa exatamente o modo de pensar natural do perfil Estrategista.",
      ],
      gscae:
        "No simulador G-SCAE, você vai encontrar os desafios que mais combinam com você! No estágio Percebe, vai observar situações reais; no Entende, vai capturar os princípios por trás delas; no Aplica, vai criar estratégias concretas para agir; e no Resolve, vai colocar tudo em prática para encontrar a solução mais inteligente. Os simuladores foram feitos para aprendizes que, como você, precisam unir conhecimento e ação para se sentirem verdadeiramente engajados!",
    },
    Pratico: {
      titulo: "Aprendiz Prático",
      cor: "#7C3AED",
      desc: "Você aprende fazendo — e isso é uma habilidade incrível! Sua mente é curiosa e ativa: prefere experimentar, descobrir e testar do que ficar ouvindo explicações longas. Você tem muita energia quando pode colocar as mãos na massa, e não tem medo de tentar coisas novas mesmo sem saber exatamente o que vai acontecer. Cada tentativa, mesmo as que não deram certo, é uma aula poderosa para você. Sua coragem de tentar e sua capacidade de aprender pela experiência direta são qualidades que muitos sonham ter!",
      fortes: [
        "Aprendizagem pela ação: você aprende de verdade quando pode fazer, construir, testar e descobrir. Essa habilidade de aprender experimentando é um talento especial e muito valioso.",
        "Energia e participação contagiante: você anima as aulas com seu entusiasmo e disposição. Sua energia para se envolver nas atividades inspira os colegas ao redor.",
        "Coragem para tentar: você não tem medo de errar. E quem não tem medo de errar aprende muito mais rápido do que quem espera saber tudo antes de começar.",
        "Excelente em atividades práticas, experimentos e construções. Quando a escola traz a realidade concreta para dentro, você brilha de um jeito que poucos conseguem.",
      ],
      desafios: [
        "Aulas longas com muita teoria e pouca ação prática podem ser cansativas. Seu cérebro precisa de movimento e experiência concreta para se engajar com qualidade.",
        "Ler muito sem poder fazer nada ao mesmo tempo pode fazer a atenção dispersar. Intercalar leitura com pequenas ações práticas ajuda muito no aprendizado.",
        "A vontade de avançar rápido pode fazer você pular a etapa de revisar e consolidar o que aprendeu. Voltar para verificar é um hábito que vai fortalecer muito seu desempenho escolar.",
      ],
      estrategias: [
        "Sempre que estudar algo novo, pergunte-se: 'Como isso funciona na vida real? Onde eu já vi isso?' Conectar teoria com prática é o acelerador do seu aprendizado.",
        "Use experimentos, construa modelos, faça maquetes e teste suas ideias fisicamente. Quando você constrói algo, aprende de uma forma que nenhuma leitura sozinha consegue substituir.",
        "Após cada atividade prática, reserve 5 minutos para falar ou escrever o que aprendeu. Esse momento de reflexão transforma experiência em conhecimento sólido e duradouro.",
        "Vídeos que mostram como as coisas funcionam, tutoriais práticos e demonstrações ao vivo são recursos de estudo ideais para o seu perfil.",
      ],
      responsaveis: [
        "Ofereça atividades práticas, experimentos caseiros e projetos manuais como extensão dos estudos. Para este perfil, fazer é aprender — e aprender é fazer.",
        "Valorize a energia e a curiosidade de descobrir fazendo. Frases como 'tenta de novo de um jeito diferente' valem mais do que explicações longas sobre o que deu errado.",
        "Combine momentos de ação com breves conversas sobre o que foi aprendido: 'O que você descobriu? O que aconteceria se fizesse diferente?' Isso transforma experiência em aprendizado reflexivo.",
        "Visitas a museus de ciências, feiras, oficinas e espaços concretos são formatos de aprendizagem ideais para este perfil — use-os sempre que possível.",
        "Respeite a necessidade de movimento e ação — é o jeito natural de processar o mundo. Tentar forçar o aprendizado estático vai na contramão do que este perfil precisa.",
      ],
      gscae:
        "No simulador G-SCAE, você vai adorar as atividades práticas e concretas! No estágio Percebe, vai observar o mundo em ação; no Aplica, vai construir e testar suas ideias; e no Resolve, vai colocar tudo em prática de uma vez. Prepare-se para aprender fazendo como nunca antes — os simuladores foram feitos para aprendizes corajosos como você!",
    },
    Equilibrado: {
      titulo: "Aprendiz Equilibrado",
      cor: "#0F766E",
      desc: "Você tem um superpoder muito especial: consegue aprender bem de jeitos diferentes! Às vezes prefere entender antes de fazer; outras vezes aprende melhor experimentando. Às vezes gosta de pensar com calma; outras vezes prefere agir logo. Essa flexibilidade é uma enorme vantagem — você se adapta a qualquer professor, qualquer método e qualquer situação de aprendizagem com muita naturalidade. Em um mundo que muda rápido, saber aprender de muitas formas é uma das habilidades mais valiosas que existem!",
      fortes: [
        "Flexibilidade cognitiva: você aprende bem em situações diferentes, com professores diferentes e com métodos diferentes. Pouquíssimas pessoas têm essa versatilidade natural.",
        "Adapta-se com facilidade a mudanças no ritmo da aula, no tipo de atividade e na forma de avaliação — isso torna o aprendizado muito menos estressante e mais prazeroso.",
        "Consegue trabalhar bem tanto sozinho(a) quanto em grupo, tanto em atividades teóricas quanto práticas — uma habilidade social e intelectual raramente encontrada em crianças.",
        "Visão ampla que ajuda a entender diferentes perspectivas sobre o mesmo assunto, enriquecendo a qualidade do aprendizado e a profundidade das opiniões.",
      ],
      desafios: [
        "Por se adaptar bem a formas diferentes, pode ser difícil identificar qual estratégia de estudo traz os melhores resultados para você em cada situação específica.",
        "Em momentos de pressão ou cansaço, a flexibilidade pode virar indecisão — e não saber por onde começar pode travar o que normalmente flui com facilidade.",
      ],
      estrategias: [
        "Experimente deliberadamente formas diferentes de estudar para cada disciplina e descubra qual traz mais resultado. Seu perfil permite essa exploração com muito menor custo.",
        "Use sua flexibilidade nos trabalhos em grupo: você consegue se comunicar com colegas que têm perfis completamente diferentes, sendo uma ponte entre estilos opostos.",
        "Varie os recursos: às vezes mapas mentais, às vezes resumos escritos, às vezes vídeos, às vezes experimentos. Sua mente se beneficia muito da diversidade de estímulos.",
        "Observe quais abordagens geram mais aprendizado para você em cada matéria e vá criando seu próprio 'manual' de estratégias personalizadas ao longo do ano.",
      ],
      responsaveis: [
        "Ofereça variedade de atividades e recursos de aprendizagem — este perfil se beneficia muito de diversidade metodológica e de experiências variadas.",
        "Ajude-o(a) a identificar, em cada disciplina, qual estratégia de estudo gera mais resultado. O autoconhecimento sobre como aprende é uma ferramenta poderosa para este perfil.",
        "Valorize a capacidade de adaptação como uma habilidade de altíssimo valor no mundo atual — é uma qualidade que poucos possuem de forma tão natural.",
        "Estimule a exploração de diferentes áreas de conhecimento: este perfil tem capacidade de se aprofundar em múltiplos campos com qualidade e prazer genuíno.",
      ],
      gscae:
        "No simulador G-SCAE, sua versatilidade vai brilhar em todos os estágios! Você vai navegar com naturalidade por Percebe, Entende, Aplica e Resolve usando diferentes abordagens conforme o desafio pede. Sua capacidade de adaptar a estratégia ao contexto é o maior trunfo nos simuladores SCAE!",
    },
  },
  mcees_5a9: {
    Analitico: {
      titulo: "Perfil Analítico",
      cor: "#1D4ED8",
      desc: "Você aprende com máxima eficiência quando as ideias são apresentadas de forma lógica, estruturada e fundamentada. Sua capacidade analítica, atenção aos detalhes e habilidade para identificar padrões e inconsistências são diferenciais intelectuais que poucos desenvolvem tão naturalmente. Você pensa com profundidade antes de agir e retém com consistência o que aprende quando há rigor e fundamentação. Esse perfil é especialmente valorizado em contextos que exigem pensamento crítico, precisão e argumentação.",
      fortes: [
        "Pensamento lógico-analítico altamente desenvolvido: você identifica estruturas e relações entre conceitos que outros não percebem, tornando seu aprendizado mais profundo e duradouro.",
        "Rigor intelectual e atenção aos detalhes: você não aceita respostas superficiais. Sua exigência por compreensão genuína é uma qualidade rara que alimenta um aprendizado de alto nível.",
        "Excelência em Matemática, Física, Gramática e Lógica — disciplinas que exigem precisão e raciocínio estruturado são territórios onde seu perfil naturalmente se destaca.",
        "Capacidade argumentativa sólida: você organiza e expressa suas ideias com clareza e coerência, tornando seus trabalhos escritos e apresentações consistentes e convincentes.",
      ],
      desafios: [
        "Atividades que exigem ação imediata antes de compreensão completa podem gerar resistência — seu processo natural e mais eficaz é entender profundamente antes de executar.",
        "Trabalhos em grupo desestruturados, sem papel ou função claramente definidos, podem ser frustrantes. Você trabalha melhor quando há organização e objetivos compartilhados.",
        "Pode subestimar o valor do conhecimento prático e da aprendizagem pela experiência direta. Integrar a prática ao raciocínio teórico amplia significativamente seus resultados.",
      ],
      estrategias: [
        "Use o método Cornell de anotações em todas as disciplinas: coluna de notas + perguntas + resumo síntese. Ele potencializa exatamente o processamento analítico profundo.",
        "Crie mapas conceituais antes das provas para visualizar as relações entre os conceitos. Seu cérebro processa estruturas relacionais com eficiência especialmente alta.",
        "Em Matemática e Exatas, resolva os exercícios entendendo o raciocínio de cada etapa — não apenas memorizando o procedimento. Esse é o seu modo natural e mais poderoso.",
        "Ferramentas como Notion, Obsidian e mapas mentais digitais potencializam seu estilo analítico. Invista em criar um sistema pessoal de organização do conhecimento.",
      ],
      responsaveis: [
        "Incentive leituras aprofundadas, documentários científicos e materiais de qualidade. Este perfil se nutre de informação estruturada, rigorosa e confiável.",
        "Respeite o tempo que ele(a) precisa para pensar antes de responder — cobrar velocidade prejudica um processo cognitivo que, quando respeitado, gera resultados excepcionais.",
        "Estimule debates intelectuais sobre temas de interesse: política, ciência, filosofia, história. O perfil Analítico cresce em ambientes de troca de ideias de qualidade.",
        "Valorize o raciocínio rigoroso mesmo quando a resposta final não está perfeita. O processo de pensar bem é mais formativo do que acertar por sorte.",
        "Olimpíadas de conhecimento, clubes de debate e projetos de investigação são ambientes onde este perfil floresce e encontra pares intelectuais estimulantes.",
      ],
      gscae:
        "No simulador G-SCAE, seu perfil Analítico terá percursos de aprendizagem que respeitam e potencializam seu modo de pensar. No estágio Entende, você vai mergulhar nos fundamentos conceituais; no Aplica, vai usar o raciocínio estruturado para situações complexas; e no Resolve, vai demonstrar a capacidade analítica que é sua maior força!",
    },
    Criativo: {
      titulo: "Perfil Criativo",
      cor: "#D97706",
      desc: "Você aprende de forma mais rica quando o conteúdo é conectado à realidade e explorado de maneira intuitiva e reflexiva. Sua sensibilidade para nuances, sua capacidade de criar conexões originais entre ideias aparentemente distantes e seu olhar único sobre o mundo tornam seu aprendizado genuinamente criativo e profundo. Você processa o conhecimento de forma integrativa — conectando o que aprende às suas experiências e percepções do cotidiano —, o que resulta em uma compreensão pessoal e duradoura.",
      fortes: [
        "Sensibilidade para perceber conexões não óbvias: você enxerga relações entre ideias que outros não veem, criando sínteses originais e perspectivas únicas sobre qualquer assunto.",
        "Aprendizagem intuitiva baseada em experiências: você absorve conhecimento de forma holística, conectando o conteúdo ao contexto mais amplo da sua experiência de vida.",
        "Excelência em Literatura, Artes, Ciências Humanas e Filosofia — disciplinas onde sua sensibilidade e profundidade reflexiva brilham de forma incomparável.",
        "Pensamento original que enriquece discussões com perspectivas que poucos consideram — uma contribuição de alto valor em qualquer ambiente de aprendizagem.",
      ],
      desafios: [
        "Disciplinas muito abstratas e desconectadas da realidade concreta podem parecer distantes e sem sentido — buscar a dimensão humana ou prática de qualquer conteúdo ajuda muito.",
        "Avaliações que medem apenas memorização, sem espaço para interpretação, podem não refletir o nível real de compreensão que você possui.",
        "Pode ser desafiador sistematizar e formalizar o conhecimento que você absorve intuitivamente. Desenvolver formas mais estruturadas de registro amplifica seus resultados.",
      ],
      estrategias: [
        "Conecte cada conteúdo novo a algo que você já viveu ou sentiu. Esse ponto de ancoragem pessoal transforma informação em aprendizado duradouro para o seu perfil.",
        "Use recursos visuais, artísticos e narrativos no estudo: infográficos, histórias analógicas e metáforas ajudam o cérebro a processar e reter com muito mais eficiência.",
        "Em Ciências, relacione fenômenos com o cotidiano. Em História, busque as histórias humanas por trás dos eventos. Contexto é tudo para o perfil Criativo.",
        "Podcasts, documentários e leituras literárias complementam muito bem o estudo formal e funcionam como fontes de aprendizagem secundárias altamente eficazes.",
      ],
      responsaveis: [
        "Valorize as conexões criativas e as interpretações originais que ele(a) faz — são evidências de compreensão profunda, não de desvio do tema proposto.",
        "Ofereça acesso amplo a arte, cultura e experiências diversas: museus, espetáculos, trilhas, viagens. O repertório experiencial alimenta diretamente o aprendizado deste perfil.",
        "Portfólios, projetos artísticos, vídeos e apresentações criativas são formas legítimas e poderosas de demonstrar aprendizado — incentive e valorize.",
        "Diários, cadernos de esboços e projetos pessoais de expressão são ferramentas de aprendizagem e autoconhecimento poderosas para este perfil.",
        "Quando houver dificuldade com conteúdos formais, ajude a encontrar a dimensão humana ou estética do assunto — isso abre a porta para o aprendizado genuíno.",
      ],
      gscae:
        "No simulador G-SCAE, seu perfil Criativo terá experiências ricas em significado e conexão! No estágio Percebe, vai se conectar pelas emoções e intuições; no Entende, vai construir seu próprio mapa de significados; e no Resolve, vai surpreender com respostas originais que mostram o que realmente significa ser criativo em um contexto de aprendizagem de qualidade.",
    },
    Estrategista: {
      titulo: "Perfil Estrategista",
      cor: "#059669",
      desc: "Você aprende com grande eficiência quando consegue unir compreensão conceitual e aplicação prática em torno de objetivos claros. Você pensa de forma sistemática e orientada a resultados, planeja antes de executar e tem uma habilidade natural para transformar o que aprende em ação eficaz. Sua capacidade de ver o panorama geral enquanto gerencia os detalhes é um diferencial raro que te posiciona bem em contextos que exigem tanto pensamento abstrato quanto execução concreta.",
      fortes: [
        "Excelência em resolução de problemas complexos e multidimensionais: você cria caminhos alternativos e persiste até encontrar a solução mais eficaz.",
        "Capacidade de planejar e executar projetos com eficiência — você transita com naturalidade entre concepção (teoria) e execução (prática), o que é genuinamente raro.",
        "Liderança natural em grupos e situações desafiadoras: as pessoas tendem a confiar em você para coordenar porque você entrega tanto ideia quanto resultado concreto.",
        "Aprendizagem orientada a objetivos: você aprende mais e melhor quando sabe exatamente para que serve o que está estudando e qual impacto prático ele pode ter.",
      ],
      desafios: [
        "Atividades sem objetivo claro ou com resultado indefinido geram frustração. Criar seus próprios objetivos quando a tarefa não os especifica é uma habilidade a desenvolver.",
        "O foco no panorama geral pode levar à negligência de detalhes importantes. Atenção aos detalhes e precisão nos resultados eleva significativamente a qualidade do trabalho.",
        "Impaciência com processos lentos pode levar a avanços prematuros. Aprender a valorizar o processo tanto quanto o resultado é uma das alavancas de crescimento deste perfil.",
      ],
      estrategias: [
        "Adote Aprendizagem Baseada em Projetos (ABP): defina o problema, pesquise, planeje, execute e avalie. Esse ciclo completo ativa exatamente seu modo mais eficaz de aprender.",
        "Crie situações reais de aplicação para os conceitos que estuda. Em Matemática, resolva problemas do cotidiano. Em Ciências, projete experimentos. Em História, analise situações atuais.",
        "Ferramentas como GeoGebra, Scratch e simulações digitais amplificam seu potencial estratégico e tornam o aprendizado mais tangível e significativo.",
        "Ensinar o que sabe para colegas e para a família é a forma mais poderosa de consolidar o aprendizado — e também desenvolve muito sua capacidade de comunicação.",
      ],
      responsaveis: [
        "Ofereça projetos interdisciplinares com metas claras e resultados mensuráveis. O perfil Estrategista floresce quando tem um problema real para resolver.",
        "Estimule a participação em olimpíadas, feiras de ciências e maratonas de programação. Esses ambientes são combustível genuíno para este perfil.",
        "Valorize as soluções criativas mesmo quando o caminho foi diferente do convencional. O processo estratégico é tão formativo quanto o resultado final.",
        "Apresente modelos de profissionais bem-sucedidos que usam o conhecimento estrategicamente: engenheiros, cientistas, empreendedores, designers.",
        "Ajude a desenvolver paciência e atenção aos detalhes nos momentos certos — essa combinação com a visão estratégica cria uma potência de aprendizagem excepcional.",
      ],
      gscae:
        "No simulador G-SCAE, seu perfil Estrategista encontrará os desafios mais completos e motivadores! No Percebe, mapeará o contexto; no Entende, construirá a base teórica; no Aplica, criará estratégias específicas; e no Resolve, liderará a busca pela solução mais inteligente e eficaz!",
    },
    Pratico: {
      titulo: "Perfil Prático",
      cor: "#7C3AED",
      desc: "Você aprende com máxima eficiência quando pode agir, experimentar e descobrir pela prática direta. Sua inteligência está profundamente orientada para a realidade concreta: você processa e retém conhecimento quando pode tocá-lo, testá-lo e aplicá-lo em situações reais. Cada erro é uma fonte de aprendizagem, cada experimento é uma aula, cada projeto é uma oportunidade de crescimento. Você tem resiliência natural e aprende com velocidade impressionante quando está no ambiente certo.",
      fortes: [
        "Aprendizagem rápida por meio da experimentação: você processa informação pelo fazer, não apenas pelo ouvir. Essa habilidade é extremamente valiosa em contextos práticos e profissionais.",
        "Capacidade de aplicar conhecimento em situações reais com naturalidade e criatividade: você não apenas entende a teoria — você sabe o que fazer com ela no mundo concreto.",
        "Excelência em laboratórios, oficinas, experimentos e atividades manuais. Quando a escola traz o mundo real para dentro da sala, você está no seu melhor elemento.",
        "Resiliência e adaptabilidade diante de erros: você aprende com os próprios erros de forma rápida e construtiva — uma das habilidades mais valiosas que existem.",
      ],
      desafios: [
        "Longas exposições teóricas sem aplicação prática imediata são o maior desafio do seu perfil. Manter o foco em conteúdo abstrato exige um esforço adicional real.",
        "Pode ter dificuldade em formalizar por escrito o que aprendeu na prática. Desenvolver essa capacidade de sistematização eleva muito o aproveitamento escolar.",
        "A busca por resultados rápidos pode levar a pular etapas importantes de planejamento. O hábito de verificar e consolidar após a ação é uma alavanca de crescimento.",
      ],
      estrategias: [
        "Para cada conceito teórico, procure imediatamente sua aplicação: 'Onde isso acontece na vida real? Como poderia usar isso?' Esse movimento ativa seu aprendizado.",
        "Use o método de tentativa e erro de forma organizada: tente, observe, ajuste, tente de novo. Mantenha um registro simples de cada ciclo de aprendizagem.",
        "Em Ciências e Matemática, priorize os experimentos, exercícios práticos e simulações — são suas ferramentas mais poderosas de aprendizado.",
        "Gamificação, Kahoot!, desafios cronometrados e atividades com resultados imediatos são recursos de alto impacto para o seu perfil.",
      ],
      responsaveis: [
        "Valorize as experiências práticas como feiras de ciências, visitas técnicas e experimentos. Para este perfil, essas atividades não são extras — são centrais no aprendizado.",
        "Ajude a criar o hábito de refletir brevemente após cada atividade: 'O que você aprendeu? O que faria diferente?' Esse passo transforma experiência em aprendizado consolidado.",
        "Não interprete a dificuldade com conteúdo muito teórico como falta de inteligência — é simplesmente um estilo de aprendizagem diferente que precisa de estratégias específicas.",
        "Robótica, marcenaria, culinária científica e horta são laboratórios de aprendizagem poderosos para este perfil — invista nessas experiências.",
        "Incentive atividades extracurriculares práticas: esportes, artes marciais, teatro, música. O perfil Prático cresce em ambientes de aprendizagem por ação.",
      ],
      gscae:
        "No G-SCAE, seu perfil Prático vai ter a experiência que você merece! No estágio Aplica, vai construir e testar soluções reais; no Resolve, vai colocar tudo em prática de uma vez. Os simuladores reconhecem que o seu maior aprendizado acontece quando você está no centro da ação — fazendo, descobrindo e evoluindo continuamente!",
    },
    Equilibrado: {
      titulo: "Perfil Equilibrado",
      cor: "#0F766E",
      desc: "Você possui uma flexibilidade cognitiva rara e genuinamente valiosa: aprende bem de múltiplas formas e consegue transitar com naturalidade entre teoria e prática, reflexão e ação. Essa versatilidade não significa ausência de preferência — significa que você tem capacidade adaptativa que a maioria dos estudantes não possui. Em um mundo que exige pensamento multidimensional, saber aprender de formas diferentes é uma das habilidades mais estratégicas do século XXI.",
      fortes: [
        "Flexibilidade para adaptar a abordagem conforme o tipo de conteúdo: você escolhe intuitivamente a estratégia mais adequada para cada situação de aprendizagem.",
        "Facilidade com professores e métodos muito diferentes: o que frustra outros estudantes, você navega com facilidade e até aproveita como oportunidade.",
        "Atua bem tanto individualmente quanto em equipes com perfis cognitivos diferentes — consegue 'falar a língua' de pessoas que pensam de formas opostas.",
        "Visão integrada que combina perspectivas teóricas e práticas — você vê o problema de múltiplos ângulos com naturalidade e gera sínteses que outros não conseguem.",
      ],
      desafios: [
        "Por ter flexibilidade, pode ser difícil identificar qual estratégia maximiza seus resultados em cada disciplina — é necessário autoconhecimento intencional e contínuo.",
        "Em condições de pressão, a versatilidade pode se transformar em indecisão. Desenvolver critérios claros para escolher a abordagem em situações exigentes é um diferencial a cultivar.",
      ],
      estrategias: [
        "Explore diferentes métodos de estudo para cada disciplina e registre quais geram mais aprendizado. Criar seu mapa de estratégias personalizadas vai ampliar muito sua eficiência.",
        "Use sua flexibilidade nos trabalhos em grupo: você é o(a) estudante que integra perspectivas diferentes e cria sínteses que ninguém mais consegue ver.",
        "Alterne conscientemente entre abordagens: às vezes comece pela teoria, às vezes pela prática. Cada alternância fortalece conexões neurais diferentes e enriquece o aprendizado.",
        "Reflita regularmente sobre como aprendeu melhor algo: essa metacognição é o multiplicador de eficiência do perfil Equilibrado.",
      ],
      responsaveis: [
        "Ofereça riqueza e variedade de recursos e metodologias: livros, vídeos, experimentos, visitas, jogos, debates. A diversidade é o ambiente ideal para este perfil.",
        "Ajude a identificar as estratégias mais eficazes para cada área do conhecimento. A metacognição é uma ferramenta de alto poder para este perfil.",
        "Valorize a versatilidade como habilidade de altíssimo valor no mundo atual — saber aprender de múltiplas formas é raro, valioso e cada vez mais demandado.",
        "Estimule a exploração de múltiplas áreas de interesse: este perfil tem capacidade de se aprofundar com qualidade em campos muito distintos — uma vantagem enorme para o futuro.",
      ],
      gscae:
        "No G-SCAE, sua versatilidade vai brilhar em todos os estágios! No Percebe, usa a sensibilidade; no Entende, aplica o raciocínio; no Aplica, cria com criatividade; no Resolve, integra tudo com sua visão ampla. Você é o(a) estudante que navega pelos simuladores com a maior amplitude de recursos!",
    },
  },
  mcees_prof: {
    Analitico: {
      titulo: "Aprendiz Analítico — Perfil Profissional",
      cor: "#1D4ED8",
      desc: "Como profissional da educação, você aprende com maior eficiência quando o conteúdo é apresentado de forma estruturada, rigorosa e fundamentada teoricamente. Sua capacidade analítica refinada e atenção às evidências são diferenciais que elevam a qualidade das suas práticas pedagógicas. Você prefere a reflexão aprofundada à ação imediata, e quando domina conceitualmente algo, traduz esse domínio em práticas de ensino excepcionalmente bem fundamentadas e sistemáticas.",
      fortes: [
        "Pensamento lógico-analítico altamente desenvolvido: você identifica estruturas e relações entre conceitos que outros não percebem, tornando seu aprendizado mais profundo e duradouro.",
        "Rigor intelectual e atenção aos detalhes: você não aceita respostas superficiais. Sua exigência por compreensão genuína é uma qualidade rara que alimenta um aprendizado de alto nível.",
        "Excelência em Matemática, Física, Gramática e Lógica — disciplinas que exigem precisão e raciocínio estruturado são territórios onde seu perfil naturalmente se destaca.",
        "Capacidade argumentativa sólida: você organiza e expressa suas ideias com clareza e coerência, tornando seus trabalhos escritos e apresentações consistentes e convincentes.",
      ],
      desafios: [
        "Atividades que exigem ação imediata antes de compreensão completa podem gerar resistência — seu processo natural e mais eficaz é entender profundamente antes de executar.",
        "Trabalhos em grupo desestruturados, sem papel ou função claramente definidos, podem ser frustrantes. Você trabalha melhor quando há organização e objetivos compartilhados.",
        "Pode subestimar o valor do conhecimento prático e da aprendizagem pela experiência direta. Integrar a prática ao raciocínio teórico amplia significativamente seus resultados.",
      ],
      estrategias: [
        "Use o método Cornell de anotações em todas as disciplinas: coluna de notas + perguntas + resumo síntese. Ele potencializa exatamente o processamento analítico profundo.",
        "Crie mapas conceituais antes das provas para visualizar as relações entre os conceitos. Seu cérebro processa estruturas relacionais com eficiência especialmente alta.",
        "Em Matemática e Exatas, resolva os exercícios entendendo o raciocínio de cada etapa — não apenas memorizando o procedimento. Esse é o seu modo natural e mais poderoso.",
        "Ferramentas como Notion, Obsidian e mapas mentais digitais potencializam seu estilo analítico. Invista em criar um sistema pessoal de organização do conhecimento.",
      ],
      responsaveis: [
        "Esta seção não se aplica ao contexto do professor como aprendiz adulto em formação continuada.",
      ],
      gscae:
        "No simulador G-SCAE, seu perfil Analítico terá percursos de aprendizagem que respeitam e potencializam seu modo de pensar. No estágio Entende, você vai mergulhar nos fundamentos conceituais; no Aplica, vai usar o raciocínio estruturado para situações complexas; e no Resolve, vai demonstrar a capacidade analítica que é sua maior força!",
    },
    Criativo: {
      titulo: "Aprendiz Criativo — Perfil Profissional",
      cor: "#D97706",
      desc: "Como profissional da educação, você aprende de forma mais significativa quando o conteúdo é conectado à realidade da sala de aula e explorado de maneira reflexiva. Sua sensibilidade para as nuances do processo pedagógico, sua capacidade de criar conexões originais entre teorias e práticas e seu olhar único sobre o desenvolvimento dos alunos tornam sua prática docente genuinamente criativa e humanizante.",
      fortes: [
        "Sensibilidade para perceber conexões não óbvias: você enxerga relações entre ideias que outros não veem, criando sínteses originais e perspectivas únicas sobre qualquer assunto.",
        "Aprendizagem intuitiva baseada em experiências: você absorve conhecimento de forma holística, conectando o conteúdo ao contexto mais amplo da sua experiência de vida.",
        "Excelência em Literatura, Artes, Ciências Humanas e Filosofia — disciplinas onde sua sensibilidade e profundidade reflexiva brilham de forma incomparável.",
        "Pensamento original que enriquece discussões com perspectivas que poucos consideram — uma contribuição de alto valor em qualquer ambiente de aprendizagem.",
      ],
      desafios: [
        "Disciplinas muito abstratas e desconectadas da realidade concreta podem parecer distantes e sem sentido — buscar a dimensão humana ou prática de qualquer conteúdo ajuda muito.",
        "Avaliações que medem apenas memorização, sem espaço para interpretação, podem não refletir o nível real de compreensão que você possui.",
        "Pode ser desafiador sistematizar e formalizar o conhecimento que você absorve intuitivamente. Desenvolver formas mais estruturadas de registro amplifica seus resultados.",
      ],
      estrategias: [
        "Conecte cada conteúdo novo a algo que você já viveu ou sentiu. Esse ponto de ancoragem pessoal transforma informação em aprendizado duradouro para o seu perfil.",
        "Use recursos visuais, artísticos e narrativos no estudo: infográficos, histórias analógicas e metáforas ajudam o cérebro a processar e reter com muito mais eficiência.",
        "Em Ciências, relacione fenômenos com o cotidiano. Em História, busque as histórias humanas por trás dos eventos. Contexto é tudo para o perfil Criativo.",
        "Podcasts, documentários e leituras literárias complementam muito bem o estudo formal e funcionam como fontes de aprendizagem secundárias altamente eficazes.",
      ],
      responsaveis: [
        "Esta seção não se aplica ao contexto do professor como aprendiz adulto em formação continuada.",
      ],
      gscae:
        "No simulador G-SCAE, seu perfil Criativo terá experiências ricas em significado e conexão! No estágio Percebe, vai se conectar pelas emoções e intuições; no Entende, vai construir seu próprio mapa de significados; e no Resolve, vai surpreender com respostas originais que mostram o que realmente significa ser criativo em um contexto de aprendizagem de qualidade.",
    },
    Estrategista: {
      titulo: "Aprendiz Estrategista — Perfil Profissional",
      cor: "#059669",
      desc: "Como profissional da educação, você aprende com máxima eficiência quando consegue integrar fundamentação teórica e aplicação prática em torno de objetivos claros. Você tem habilidade natural para planejar percursos de desenvolvimento, identificar gaps na sua formação e criar estratégias sistemáticas para avançar. Sua capacidade de transformar aprendizados em mudanças concretas na prática pedagógica é um diferencial que poucos profissionais da educação possuem.",
      fortes: [
        "Excelência em resolução de problemas complexos e multidimensionais: você cria caminhos alternativos e persiste até encontrar a solução mais eficaz.",
        "Capacidade de planejar e executar projetos com eficiência — você transita com naturalidade entre concepção (teoria) e execução (prática), o que é genuinamente raro.",
        "Liderança natural em grupos e situações desafiadoras: as pessoas tendem a confiar em você para coordenar porque você entrega tanto ideia quanto resultado concreto.",
        "Aprendizagem orientada a objetivos: você aprende mais e melhor quando sabe exatamente para que serve o que está estudando e qual impacto prático ele pode ter.",
      ],
      desafios: [
        "Atividades sem objetivo claro ou com resultado indefinido geram frustração. Criar seus próprios objetivos quando a tarefa não os especifica é uma habilidade a desenvolver.",
        "O foco no panorama geral pode levar à negligência de detalhes importantes. Atenção aos detalhes e precisão nos resultados eleva significativamente a qualidade do trabalho.",
        "Impaciência com processos lentos pode levar a avanços prematuros. Aprender a valorizar o processo tanto quanto o resultado é uma das alavancas de crescimento deste perfil.",
      ],
      estrategias: [
        "Adote Aprendizagem Baseada em Projetos (ABP): defina o problema, pesquise, planeje, execute e avalie. Esse ciclo completo ativa exatamente seu modo mais eficaz de aprender.",
        "Crie situações reais de aplicação para os conceitos que estuda. Em Matemática, resolva problemas do cotidiano. Em Ciências, projete experimentos. Em História, analise situações atuais.",
        "Ferramentas como GeoGebra, Scratch e simulações digitais amplificam seu potencial estratégico e tornam o aprendizado mais tangível e significativo.",
        "Ensinar o que sabe para colegas e para a família é a forma mais poderosa de consolidar o aprendizado — e também desenvolve muito sua capacidade de comunicação.",
      ],
      responsaveis: [
        "Esta seção não se aplica ao contexto do professor como aprendiz adulto em formação continuada.",
      ],
      gscae:
        "No simulador G-SCAE, seu perfil Estrategista encontrará os desafios mais completos e motivadores! No Percebe, mapeará o contexto; no Entende, construirá a base teórica; no Aplica, criará estratégias específicas; e no Resolve, liderará a busca pela solução mais inteligente e eficaz!",
    },
    Pratico: {
      titulo: "Aprendiz Prático — Perfil Profissional",
      cor: "#7C3AED",
      desc: "Como profissional da educação, você aprende com maior eficiência quando pode experimentar, aplicar e descobrir diretamente na prática pedagógica. Sua inteligência está profundamente orientada para o resultado concreto em sala de aula: você processa os aprendizados das formações quando pode testá-los e ajustá-los a partir do feedback real dos seus alunos. Cada aula é um laboratório de aprendizagem para você.",
      fortes: [
        "Aprendizagem rápida por meio da experimentação: você processa informação pelo fazer, não apenas pelo ouvir. Essa habilidade é extremamente valiosa em contextos práticos e profissionais.",
        "Capacidade de aplicar conhecimento em situações reais com naturalidade e criatividade: você não apenas entende a teoria — você sabe o que fazer com ela no mundo concreto.",
        "Excelência em laboratórios, oficinas, experimentos e atividades manuais. Quando a escola traz o mundo real para dentro da sala, você está no seu melhor elemento.",
        "Resiliência e adaptabilidade diante de erros: você aprende com os próprios erros de forma rápida e construtiva — uma das habilidades mais valiosas que existem.",
      ],
      desafios: [
        "Longas exposições teóricas sem aplicação prática imediata são o maior desafio do seu perfil. Manter o foco em conteúdo abstrato exige um esforço adicional real.",
        "Pode ter dificuldade em formalizar por escrito o que aprendeu na prática. Desenvolver essa capacidade de sistematização eleva muito o aproveitamento escolar.",
        "A busca por resultados rápidos pode levar a pular etapas importantes de planejamento. O hábito de verificar e consolidar após a ação é uma alavanca de crescimento.",
      ],
      estrategias: [
        "Para cada conceito teórico, procure imediatamente sua aplicação: 'Onde isso acontece na vida real? Como poderia usar isso?' Esse movimento ativa seu aprendizado.",
        "Use o método de tentativa e erro de forma organizada: tente, observe, ajuste, tente de novo. Mantenha um registro simples de cada ciclo de aprendizagem.",
        "Em Ciências e Matemática, priorize os experimentos, exercícios práticos e simulações — são suas ferramentas mais poderosas de aprendizado.",
        "Gamificação, Kahoot!, desafios cronometrados e atividades com resultados imediatos são recursos de alto impacto para o seu perfil.",
      ],
      responsaveis: [
        "Esta seção não se aplica ao contexto do professor como aprendiz adulto em formação continuada.",
      ],
      gscae:
        "No G-SCAE, seu perfil Prático vai ter a experiência que você merece! No estágio Aplica, vai construir e testar soluções reais; no Resolve, vai colocar tudo em prática de uma vez. Os simuladores reconhecem que o seu maior aprendizado acontece quando você está no centro da ação — fazendo, descobrindo e evoluindo continuamente!",
    },
    Equilibrado: {
      titulo: "Aprendiz Equilibrado — Perfil Profissional",
      cor: "#0F766E",
      desc: "Como profissional da educação, você possui flexibilidade de aprendizagem genuinamente valiosa: assimila conteúdo por múltiplos caminhos e se adapta a diferentes formatos de formação. Sua versatilidade pedagógica permite que você compreenda e apoie alunos de todos os perfis SCAE com igual eficácia — uma vantagem pedagógica de alto valor para a gestão de turmas heterogêneas.",
      fortes: [
        "Flexibilidade para adaptar a abordagem conforme o tipo de conteúdo: você escolhe intuitivamente a estratégia mais adequada para cada situação de aprendizagem.",
        "Facilidade com professores e métodos muito diferentes: o que frustra outros estudantes, você navega com facilidade e até aproveita como oportunidade.",
        "Atua bem tanto individualmente quanto em equipes com perfis cognitivos diferentes — consegue 'falar a língua' de pessoas que pensam de formas opostas.",
        "Visão integrada que combina perspectivas teóricas e práticas — você vê o problema de múltiplos ângulos com naturalidade e gera sínteses que outros não conseguem.",
      ],
      desafios: [
        "Por ter flexibilidade, pode ser difícil identificar qual estratégia maximiza seus resultados em cada disciplina — é necessário autoconhecimento intencional e contínuo.",
        "Em condições de pressão, a versatilidade pode se transformar em indecisão. Desenvolver critérios claros para escolher a abordagem em situações exigentes é um diferencial a cultivar.",
      ],
      estrategias: [
        "Explore diferentes métodos de estudo para cada disciplina e registre quais geram mais aprendizado. Criar seu mapa de estratégias personalizadas vai ampliar muito sua eficiência.",
        "Use sua flexibilidade nos trabalhos em grupo: você é o(a) estudante que integra perspectivas diferentes e cria sínteses que ninguém mais consegue ver.",
        "Alterne conscientemente entre abordagens: às vezes comece pela teoria, às vezes pela prática. Cada alternância fortalece conexões neurais diferentes e enriquece o aprendizado.",
        "Reflita regularmente sobre como aprendeu melhor algo: essa metacognição é o multiplicador de eficiência do perfil Equilibrado.",
      ],
      responsaveis: [
        "Esta seção não se aplica ao contexto do professor como aprendiz adulto em formação continuada.",
      ],
      gscae:
        "No G-SCAE, sua versatilidade vai brilhar em todos os estágios! No Percebe, usa a sensibilidade; no Entende, aplica o raciocínio; no Aplica, cria com criatividade; no Resolve, integra tudo com sua visão ampla. Você é o(a) estudante que navega pelos simuladores com a maior amplitude de recursos!",
    },
  },
  mees_prof: {
    Especialista: {
      titulo: "Educador Especialista",
      cor: "#1D4ED8",
      desc: "Seu estilo de ensino é marcado pelo rigor conceitual e pela profundidade reflexiva. Você cria ambientes de aprendizagem onde o conhecimento é tratado com seriedade intelectual e onde os alunos são desafiados a pensar com precisão e fundamentação.",
      fortes: [
        "Domínio profundo do conteúdo que ensina, com capacidade de articulação teórica",
        "Habilidade para criar sequências didáticas lógicas, coerentes e bem fundamentadas",
        "Estímulo ao pensamento crítico, analítico e à autonomia intelectual dos alunos",
        "Excelência no ensino de conteúdos complexos que exigem rigor e precisão",
      ],
      desafios: [
        "Pode subutilizar metodologias ativas e experiências concretas",
        "Alunos de perfil Prático e Criativo podem sentir dificuldade com abordagens muito teóricas",
        "Pode exigir um ritmo de aprofundamento que nem todos os alunos conseguem acompanhar",
      ],
      para1a4: [
        "Use histórias, objetos concretos e analogias do cotidiano para introduzir cada conceito",
        "Intercale explicações com atividades sensoriais e manipuláveis (blocos, figuras, materiais)",
        "Adapte o ritmo para o nível de abstração que crianças de 6-10 anos conseguem processar",
        "Valorize muito as perguntas das crianças — para alunos Analíticos, elas são o motor do aprendizado",
      ],
      para5a9: [
        "Combine a profundidade conceitual com metodologias como debate, ensino por investigação e ABP",
        "Use ferramentas como GeoGebra, simulações e recursos digitais para tornar o abstrato tangível",
        "Crie espaços de discussão intelectual — alunos de perfil Analítico e Estrategista vão florescer",
        "Para alunos Práticos e Criativos, faça a ponte explícita entre teoria e aplicação no mundo real",
      ],
      desenvolvimento: [
        "Invista no estudo de metodologias ativas como Sala de Aula Invertida e Ensino Investigativo",
        "Busque formações sobre diferenciação pedagógica para atender a múltiplos perfis de aprendizagem",
        "Colabore com professores de perfil Facilitador — a complementaridade enriquece a prática pedagógica",
        "Explore como conectar o rigor conceitual a experiências mais concretas e significativas",
      ],
      gscae:
        "No G-SCAE, seu perfil Especialista vai garantir que os alunos tenham uma base conceitual sólida antes de avançar nos simuladores. Você é peça-chave no estágio Entende — onde o conhecimento teórico é aprofundado e preparado para a aplicação prática.",
    },
    Mentor: {
      titulo: "Educador Mentor",
      cor: "#D97706",
      desc: "Seu estilo de ensino é profundamente humano e relacional. Você cria conexões genuínas com os alunos, valoriza suas experiências e favorece um ambiente de aprendizagem acolhedor, reflexivo e significativo, onde cada estudante se sente visto e respeitado.",
      fortes: [
        "Capacidade excepcional de construir relações de confiança com os alunos",
        "Habilidade para conectar o conteúdo às experiências e ao contexto de vida dos estudantes",
        "Criação de ambientes de aprendizagem emocionalmente seguros e acolhedores",
        "Estímulo à reflexão, à autoanálise e ao autoconhecimento dos alunos",
      ],
      desafios: [
        "Pode ter dificuldade em manter o foco no conteúdo curricular quando as relações são muito centrais",
        "Alunos que esperam mais estrutura e objetividade podem se sentir perdidos",
        "Pode evitar avaliações e feedbacks mais diretos por receio de impactar as relações",
      ],
      para1a4: [
        "Crie rituais de acolhimento que valorizem as experiências de cada criança",
        "Use a contação de histórias como fio condutor das aprendizagens curriculares",
        "Para crianças de perfil Analítico e Estrategista, ofereça também estrutura e objetivos claros",
        "Seu ambiente de sala de aula é ideal para desenvolver a inteligência emocional das crianças",
      ],
      para5a9: [
        "Use metodologias como Aprendizagem por Projetos com impacto social para engajar profundamente",
        "Crie espaços de escuta, debate e reflexão sobre a realidade dos alunos",
        "Para alunos de perfil Estrategista e Analítico, adicione mais estrutura e desafios cognitivos",
        "Combine a acolhida relacional com expectativas acadêmicas claras e exigentes",
      ],
      desenvolvimento: [
        "Busque formações sobre avaliação formativa e feedback construtivo",
        "Desenvolva estratégias para garantir o cumprimento dos objetivos curriculares com o mesmo calor humano",
        "Colabore com professores de perfil Especialista — a complementaridade é poderosa",
        "Estude como criar sequências didáticas estruturadas que respeitem as experiências dos alunos",
      ],
      gscae:
        "No G-SCAE, seu perfil Mentor é essencial no estágio Percebe — onde os alunos se conectam com o conteúdo a partir de suas próprias experiências. Sua sensibilidade vai garantir que a aprendizagem no simulador seja significativa e humanamente relevante.",
    },
    Avaliador: {
      titulo: "Educador Avaliador",
      cor: "#059669",
      desc: "Seu estilo de ensino integra rigor conceitual com resultados práticos mensuráveis. Você é exigente, orientado para a excelência e cria ambientes onde os alunos são desafiados a atingir padrões elevados de compreensão e desempenho.",
      fortes: [
        "Capacidade de combinar profundidade teórica com orientação clara para resultados",
        "Excelência na criação de situações de aprendizagem desafiadoras e transformadoras",
        "Habilidade para identificar e potencializar os pontos fortes de cada aluno",
        "Visão sistêmica da aprendizagem: articula objetivos, processos e avaliação com coerência",
      ],
      desafios: [
        "Padrões muito elevados podem gerar ansiedade em alunos com menor autoconfiança",
        "Pode subutilizar metodologias mais lúdicas, especialmente com turmas do 1-4 ano",
        "A ênfase em resultados pode, por vezes, ofuscar o processo de aprendizagem",
      ],
      para1a4: [
        "Use jogos, brincadeiras e materiais concretos para apresentar os conteúdos com leveza",
        "Equilibre a exigência com o acolhimento — crianças pequenas precisam sentir segurança para arriscar",
        "Celebre o processo e os pequenos avanços com a mesma intensidade que os resultados finais",
        "Para crianças de perfil Criativo e Prático, garanta atividades com mais liberdade e experimentação",
      ],
      para5a9: [
        "Implemente metodologias como ABP, ensino por projetos e design thinking",
        "Use avaliações diversificadas (portfólios, projetos, apresentações, provas) que contemplem todos os perfis",
        'Estimule a metacognição — perguntar aos alunos "o que você aprendeu sobre sua forma de aprender?"',
        "Crie desafios diferenciados que permitam que cada perfil cognitivo contribua com seu ponto forte",
      ],
      desenvolvimento: [
        "Aprofunde-se em avaliação formativa e diferenciação pedagógica",
        "Estude metodologias que reduzam a ansiedade de avaliação mantendo a exigência acadêmica",
        "Busque formações sobre gestão emocional do aprendizado e pedagogia da autonomia",
        "Colabore com professores de perfil Mentor para equilibrar exigência e acolhimento",
      ],
      gscae:
        "No G-SCAE, seu perfil Avaliador garante que os alunos avancem pelos estágios com qualidade e precisão. No estágio Resolve — o mais desafiador — sua capacidade de exigir excelência vai conduzir os alunos às soluções mais elaboradas e significativas.",
    },
    Facilitador: {
      titulo: "Educador Facilitador",
      cor: "#7C3AED",
      desc: "Seu estilo de ensino é dinâmico, experiencial e orientado para a ação. Você cria oportunidades para que os alunos aprendam fazendo, testando e descobrindo, e possui habilidade natural para mobilizar grupos e gerar engajamento ativo.",
      fortes: [
        "Habilidade excepcional para criar atividades práticas, dinâmicas e engajadoras",
        "Capacidade de conectar o conteúdo à realidade e ao cotidiano dos alunos de forma criativa",
        "Energia e entusiasmo que mobilizam a participação ativa e o protagonismo estudantil",
        "Excelência com alunos de perfil Prático e Criativo, que florescem com metodologias ativas",
      ],
      desafios: [
        "Pode subutilizar momentos de aprofundamento teórico e consolidação conceitual",
        "Alunos de perfil Analítico podem sentir falta de mais fundamentação e estrutura",
        "A ênfase na ação pode gerar aprendizagens superficiais se não houver reflexão e consolidação",
      ],
      para1a4: [
        "Seu estilo é naturalmente bem adaptado para crianças do ciclo 1-4 — continue!",
        "Adicione momentos de pausa para reflexão após as atividades práticas — isso consolida o aprendizado",
        "Para crianças de perfil Analítico, ofereça explicações mais detalhadas e estrutura clara",
        "Use o movimento, os jogos e as brincadeiras como portais de entrada para os conceitos curriculares",
      ],
      para5a9: [
        "Combine metodologias ativas com momentos de sistematização teórica e registro",
        "Use ferramentas como Kahoot!, Padlet e Mentimeter para dinamizar o engajamento digital",
        "Para alunos de perfil Analítico e Estrategista, ofereça também desafios conceituais mais profundos",
        "Crie ciclos de aprendizagem: Fazer → Refletir → Conceituar → Planejar (alinhado ao SCAE)",
      ],
      desenvolvimento: [
        "Investigue metodologias que integrem ação prática com sistematização conceitual robusta",
        "Estude como criar estruturas que permitam ao aluno refletir sobre o que fez e consolidar o saber",
        "Colabore com professores de perfil Especialista — sua complementaridade é altamente produtiva",
        "Aprofunde-se em Design Thinking e Aprendizagem Baseada em Projetos (ABP) com rigor acadêmico",
      ],
      gscae:
        "No G-SCAE, seu perfil Facilitador é essencial nos estágios Aplica e Resolve — onde os alunos agem, experimentam e criam soluções. Sua habilidade em criar situações de aprendizagem ativa é o motor que move os alunos Práticos e Criativos nos simuladores!",
    },
    Equilibrado: {
      titulo: "Educador Equilibrado",
      cor: "#0F766E",
      desc: "Você apresenta flexibilidade pedagógica significativa: consegue transitar com naturalidade entre diferentes abordagens de ensino, adaptando seu estilo às necessidades da turma, do conteúdo e do contexto. Esta versatilidade é uma vantagem didática de alto valor.",
      fortes: [
        "Capacidade de adaptar a abordagem pedagógica conforme o perfil da turma e o tipo de conteúdo",
        "Facilidade para integrar teoria, prática, reflexão e experimentação no mesmo processo didático",
        "Repertório metodológico amplo que permite atender a diferentes perfis cognitivos",
        "Empatia pedagógica desenvolvida pela capacidade de ver a aprendizagem de múltiplas perspectivas",
      ],
      desafios: [
        "Em situações de incerteza, pode ter dificuldade em identificar a abordagem pedagógica prioritária",
        "A versatilidade pode, às vezes, gerar inconsistência — os alunos beneficiam-se de alguma previsibilidade",
      ],
      para1a4: [
        "Use sua flexibilidade para identificar o que funciona melhor para cada grupo de crianças",
        "Alterne com intencionalidade entre atividades concretas, reflexivas, teóricas e práticas",
        "Crie uma rotina de sala de aula que dê segurança enquanto mantém variedade metodológica",
        "Observe quais abordagens geram mais engajamento nos diferentes perfis de aprendizagem da turma",
      ],
      para5a9: [
        "Use sua versatilidade para criar sequências didáticas que contemplem os quatro perfis SCAE",
        "Implemente avaliações diversificadas que permitam que cada aluno demonstre seu ponto forte",
        "Desenvolva uma consciência intencional sobre quando usar cada abordagem pedagógica",
        "Seja um ponto de referência para colegas sobre como diversificar a prática em sala de aula",
      ],
      desenvolvimento: [
        "Mapeie intencionalmente seu repertório metodológico e identifique lacunas a desenvolver",
        "Busque formações em áreas menos exploradas para ampliar ainda mais sua versatilidade",
        'Use sua posição privilegiada como "tradutor" entre professores de diferentes perfis pedagógicos',
        "Aprofunde-se na observação e na avaliação dos perfis SCAE dos seus alunos para usar sua flexibilidade com mais precisão",
      ],
      gscae:
        "No G-SCAE, sua versatilidade pedagógica permite que você apoie alunos de todos os perfis com igual eficácia. Você é o(a) educador(a) que melhor navega entre todos os estágios Percebe, Entende, Aplica e Resolve — adaptando a mediação ao que cada aluno precisa.",
    },
  },
};
