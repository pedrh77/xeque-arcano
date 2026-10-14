---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Superfície: partida

Modo: Operate. Jogadores locais ou contra IA precisam ler turno, perigo, movimentos e poderes sem procurar.

## Direction contract

THESIS: O tabuleiro é um mapa tático astral vivo. A superfície recusa o painel genérico coberto por cartões; contexto fica nas bordas e decisão ocupa o centro.

OWN-WORLD: Navy profundo domina o campo. Ciano indica ação, violeta indica poder selecionado, dourado marca raridade e momentos decisivos. Painéis usam planos opacos, linhas finas e cantos contidos. Tipografia combina display lapidado com sans humanista legível.

STORY: Jogador reconhece imediatamente turno e estado, escolhe peça ou poder, lê destinos legais, confirma ação e acompanha consequência no histórico. Erros explicam bloqueio e recuperação.

FIRST VIEWPORT: Barra superior compacta; estado da partida e histórico à esquerda; tabuleiro grande no centro; mão de habilidades à direita. No celular, tabuleiro vem primeiro e habilidades formam faixa horizontal. Ação primária fica junto à prévia do poder.

FORM: Sétima direção fundamentada, “Cartografia de Eclipse”, seed `911b5f70`. Movimento normal usa marcas discretas. Seleção de poder traça uma constelação luminosa entre origem e destinos, única assinatura de movimento.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
