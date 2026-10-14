import type { Square } from "chess.js";

export interface TutorialStep {
  title: string;
  body: string;
  fen: string;
  highlights: Square[];
  move?: { from: Square; to: Square };
  tip: string;
}

export interface TutorialLesson {
  id: string;
  title: string;
  summary: string;
  duration: string;
  steps: TutorialStep[];
}

export const TUTORIALS: TutorialLesson[] = [
  {
    id: "objetivo",
    title: "O objetivo da partida",
    summary: "Entenda turnos, captura e como vencer protegendo o seu rei.",
    duration: "3 min",
    steps: [
      { title: "Dois exércitos, um tabuleiro", body: "As brancas jogam primeiro. Depois, cada lado move uma peça por turno.", fen: "4k3/8/8/8/8/8/4P3/4K3 w - - 0 1", highlights: ["e1", "e2", "e8"], tip: "No Pawn Storm, usar um poder ou uma evolução também encerra o turno." },
      { title: "Proteja o rei", body: "Quando uma peça ameaça capturar o rei, ele está em xeque. A próxima jogada precisa eliminar essa ameaça.", fen: "4k3/8/8/8/4r3/8/8/4K3 w - - 0 1", highlights: ["e1", "e4"], move: { from: "e4", to: "e1" }, tip: "Um rei nunca pode terminar o turno sob ataque." },
      { title: "Xeque-mate vence", body: "Se o rei está em xeque e nenhuma resposta legal existe, a partida termina em xeque-mate.", fen: "7k/6Q1/6K1/8/8/8/8/8 b - - 0 1", highlights: ["h8", "g7", "g6"], tip: "Controle as casas de fuga antes de atacar o rei." },
    ],
  },
  {
    id: "peao",
    title: "Peões e promoção",
    summary: "Avance, capture na diagonal e transforme um peão que chega ao fim.",
    duration: "4 min",
    steps: [
      { title: "Avance para pressionar", body: "O peão anda uma casa para frente. Em sua primeira jogada, pode avançar duas se o caminho estiver livre.", fen: "4k3/8/8/8/8/8/4P3/4K3 w - - 0 1", highlights: ["e2", "e3", "e4"], move: { from: "e2", to: "e4" }, tip: "Peões brancos avançam em direção à oitava fileira; pretos, à primeira." },
      { title: "Capture na diagonal", body: "O peão não captura como se move: ele toma uma peça inimiga uma casa à frente na diagonal.", fen: "4k3/8/8/8/8/3p4/4P3/4K3 w - - 0 1", highlights: ["e2", "d3"], move: { from: "e2", to: "d3" }, tip: "A diferença entre mover e capturar torna cada cadeia de peões importante." },
      { title: "Chegue ao outro lado", body: "Ao alcançar a última fileira, o peão vira rainha, torre, bispo ou cavalo.", fen: "7k/P7/8/8/8/8/8/7K w - - 0 1", highlights: ["a7", "a8"], move: { from: "a7", to: "a8" }, tip: "A rainha é comum, mas um cavalo pode criar um xeque inesperado." },
    ],
  },
  {
    id: "linhas",
    title: "Torre, bispo e rainha",
    summary: "Domine linhas retas, diagonais e o alcance da peça mais poderosa.",
    duration: "4 min",
    steps: [
      { title: "A torre domina retas", body: "Torres percorrem quantas casas livres quiserem na horizontal ou vertical.", fen: "4k3/8/8/8/3R4/8/8/4K3 w - - 0 1", highlights: ["d4", "d8", "a4", "h4"], move: { from: "d4", to: "d8" }, tip: "Torres ficam mais fortes em colunas abertas." },
      { title: "O bispo corta diagonais", body: "Bispos percorrem diagonais e permanecem sempre na cor em que começaram.", fen: "4k3/8/8/8/3B4/8/8/4K3 w - - 0 1", highlights: ["d4", "a1", "a7", "h8", "g1"], move: { from: "d4", to: "h8" }, tip: "O par de bispos cobre casas claras e escuras." },
      { title: "A rainha combina os dois", body: "A rainha move como torre e bispo. Grande alcance exige cuidado: ela é valiosa demais para ataques sem apoio.", fen: "4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1", highlights: ["d4", "d8", "h4", "h8", "a1"], tip: "Desenvolva as peças menores antes de expor a rainha." },
    ],
  },
  {
    id: "cavalo",
    title: "O salto do cavalo",
    summary: "Aprenda o movimento em L e por que ele ignora bloqueios.",
    duration: "3 min",
    steps: [
      { title: "Duas casas e uma curva", body: "O cavalo anda duas casas numa direção e uma para o lado, formando um L.", fen: "4k3/8/8/8/3N4/8/8/4K3 w - - 0 1", highlights: ["d4", "b3", "b5", "c2", "c6", "e2", "e6", "f3", "f5"], move: { from: "d4", to: "f5" }, tip: "O cavalo é a única peça clássica que salta sobre outras." },
      { title: "Ataque de onde ninguém espera", body: "O salto não segue linhas, então é difícil bloqueá-lo. Procure garfos contra duas peças importantes.", fen: "4k3/8/3q1r2/8/4N3/8/8/4K3 w - - 0 1", highlights: ["e4", "d6", "f6"], tip: "Um cavalo central costuma controlar oito casas." },
    ],
  },
  {
    id: "rei",
    title: "Rei, xeque e defesa",
    summary: "Reconheça ameaças, casas seguras e as três respostas a um xeque.",
    duration: "5 min",
    steps: [
      { title: "O rei move uma casa", body: "O rei anda uma casa em qualquer direção, mas nunca pode entrar numa casa atacada.", fen: "7k/8/8/8/8/8/4K3/8 w - - 0 1", highlights: ["e2", "d1", "e1", "f1", "d2", "f2", "d3", "e3", "f3"], tip: "Perto do fim, o rei também vira uma peça ativa." },
      { title: "Responda ao xeque", body: "Você pode mover o rei, capturar a peça atacante ou bloquear a linha do ataque.", fen: "4k3/8/8/8/4r3/8/3B4/4K3 w - - 0 1", highlights: ["e1", "e4", "e2"], move: { from: "d2", to: "e3" }, tip: "O tabuleiro só aceita respostas que realmente deixem o rei seguro." },
    ],
  },
  {
    id: "poderes",
    title: "Poderes do Pawn Storm",
    summary: "Combine as regras clássicas com cartas, evoluções e efeitos persistentes.",
    duration: "4 min",
    steps: [
      { title: "Uma carta, uma virada", body: "Selecione um poder, escolha a peça e o destino indicados e confirme. A carta é gasta e o turno termina.", fen: "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1", highlights: ["e2", "e4"], move: { from: "e2", to: "e4" }, tip: "Leia o alvo: alguns poderes pedem apenas uma peça; outros também pedem destino." },
      { title: "Evolua na hora certa", body: "Cada evolução transforma imediatamente um peão em uma peça maior. Isso também consome o turno.", fen: "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1", highlights: ["c2", "e2", "g2"], tip: "Uma torre abre pressão; um cavalo cria saltos; a rainha entrega alcance." },
      { title: "Poder não vence sozinho", body: "Escudos, fendas e teletransportes ampliam opções, mas toda ação ainda precisa manter seu rei seguro.", fen: "4k3/8/8/8/3R4/8/4P3/4K3 w - - 0 1", highlights: ["e1", "e2", "d4"], tip: "O melhor poder é aquele que resolve uma ameaça e cria outra para o rival." },
    ],
  },
];
