# Pawn Storm

Jogo tático de 8 peões + 1 rei. Escolha três cartas de evolução, receba cinco poderes aleatórios e derrube o rei rival.

## Executar

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite. Para validar produção:

```bash
npm test
npm run build
npm run preview
```

## Habilidades

O registro visual e textual fica em `src/game/abilities/registry.ts`. Validação e execução passam por `src/game/engine/engine.ts`; a UI não altera o tabuleiro diretamente. Balanceamento fica em `src/config/balance.ts`.

Para criar uma habilidade:

1. Adicione o ID aos tipos em `src/game/models/types.ts`.
2. Registre nome, alvo, raridade e descrição em `src/game/abilities/registry.ts`.
3. Implemente a regra transacional em `executeSpecialAction`.
4. Adicione casos de alvo em `validSpecialTargets` quando necessário.
5. Crie testes de ação válida, ação inválida e segurança do rei.

## Imagens

Copie as artes para `public/assets/abilities/` usando os nomes registrados em `src/config/assets.ts`. Enquanto um arquivo estiver ausente, a carta mostra um placeholder sem repetir erros no console. As imagens usam proporção estável e `object-fit: cover`.

## Decisões de regras especiais

- Salto Duplo escolhe um intermediário vazio válido; captura apenas no destino.
- Dança Diagonal usa dois passos diagonais unitários; o intermediário precisa estar vazio.
- Escudo consome o ataque e encerra o turno do atacante sem deslocá-lo.
- Contra-ataque remove o atacante somente quando o estado final mantém o rei atacante legal; caso contrário, a captura normal resolve.
- Passo do Rei remove direitos de roque.
- Poderes defensivos consomem a ação do turno.

Essas decisões ficam isoladas no motor e podem virar opções de balanceamento.

## Estrutura

```text
src/
  components/       tabuleiro e cartas
  config/           assets e balanceamento
  game/             IA, motor, habilidades e tipos
  store/            estado, persistência e fluxo de partida
  tests/            testes Vitest
  App.tsx            telas e composição
  styles.css         sistema visual responsivo
```

## Limites conhecidos

- IA difícil usa avaliação material e seleção limitada, não busca profunda com transposições.
- Promoção automática escolhe dama na interface.
- Áudio está preparado na configuração, mas ainda não inclui arquivos sonoros.
- Estatística local registra partidas e poderes; não mantém ranking por adversário.
