import { Chess, type Square } from "chess.js";
import { describe, expect, it } from "vitest";
import { executeSpecialAction, resolveClassicMove, validSpecialTargets } from "../game/engine/engine";
import type { AbilityId, PersistentEffect } from "../game/models/types";

describe("motor clássico", () => {
  it("executa uma jogada legal e alterna o turno", () => {
    const result = resolveClassicMove(new Chess().fen(), "e2", "e4");
    expect(result.ok).toBe(true);
    expect(new Chess(result.fen!).turn()).toBe("b");
  });

  it("rejeita uma jogada ilegal", () => {
    expect(resolveClassicMove(new Chess().fen(), "e2", "e5").ok).toBe(false);
  });

  it("mantém roque, en passant e promoção sob responsabilidade do chess.js", () => {
    const castle = new Chess("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    expect(castle.moves({ square: "e1" }).some((move) => move === "O-O")).toBe(true);
    const passant = new Chess();
    passant.move("e4"); passant.move("a6"); passant.move("e5"); passant.move("d5");
    expect(passant.moves({ square: "e5" }).some((move) => move.includes("exd6"))).toBe(true);
    const promotion = new Chess("7k/P7/8/8/8/8/8/7K w - - 0 1");
    expect(promotion.moves({ square: "a7" }).some((move) => move.includes("=Q"))).toBe(true);
  });

  it("detecta xeque-mate e empate", () => {
    const mate = new Chess();
    mate.move("f3"); mate.move("e5"); mate.move("g4"); mate.move("Qh4#");
    expect(mate.isCheckmate()).toBe(true);
    const stalemate = new Chess("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
    expect(stalemate.isStalemate()).toBe(true);
  });
});

describe("habilidades", () => {
  const open = "4k3/8/8/8/3R4/8/8/4K3 w - - 0 1";
  const cases: Array<[AbilityId, Square, Square, string]> = [
    ["ghostStep", "d4", "d8", "Passo Fantasma"],
    ["charge", "d4", "d7", "Investida"],
    ["freeMovement", "d4", "e5", "Movimento Livre"],
    ["teleport", "d4", "f6", "Teletransporte"],
    ["doubleJump", "d4", "h4", "Salto Duplo"],
    ["diagonalDance", "d4", "f4", "Dança Diagonal"],
  ];

  it.each(cases)("executa %s em destino legal", (abilityId, from, to) => {
    const result = executeSpecialAction(open, { abilityId, from, to });
    expect(result.ok).toBe(true);
    expect(new Chess(result.fen!).get(to)?.type).toBe("r");
  });

  it("troca peças aliadas com Cavalo Invertido", () => {
    const fen = "4k3/8/8/5N2/3R4/8/8/4K3 w - - 0 1";
    const result = executeSpecialAction(fen, { abilityId: "invertedKnight", from: "d4", to: "f5" });
    expect(result.ok).toBe(true);
    expect(new Chess(result.fen!).get("d4")?.type).toBe("n");
  });

  it("troca com o rei e remove roque", () => {
    const fen = "4k3/8/8/8/8/8/4R3/4K3 w K - 0 1";
    const result = executeSpecialAction(fen, { abilityId: "kingStep", from: "e2", to: "e1" });
    expect(result.ok).toBe(true);
    expect(result.fen!.split(" ")[2]).toBe("-");
  });

  it("aplica e consome Escudo Divino", () => {
    const fen = "4k3/8/8/8/8/8/4R3/4K3 w - - 0 1";
    const shield = executeSpecialAction(fen, { abilityId: "divineShield", from: "e2" });
    expect(shield.effects?.[0].type).toBe("shield");
    const attackFen = shield.fen!.replace(" b ", " b ");
    const board = new Chess(attackFen);
    // Adiciona uma torre preta com FEN controlado para testar reação.
    const reactionFen = `4k3/8/8/8/8/4r3/4R3/4K3 b - - 0 1`;
    const effects: PersistentEffect[] = [{ id: "shield-1", type: "shield", square: "e2", color: "w" }];
    const result = resolveClassicMove(reactionFen, "e3", "e2", "q", effects);
    expect(result.ok).toBe(true);
    expect(new Chess(result.fen!).get("e2")?.color).toBe("w");
    expect(result.effects).toHaveLength(0);
    expect(board).toBeDefined();
  });

  it("Contra-ataque remove atacante e evita recursão", () => {
    const fen = "k7/8/8/8/8/8/3rR3/4K3 b - - 0 1";
    const effects: PersistentEffect[] = [{ id: "counter-1", type: "counter", square: "e2", color: "w" }];
    const result = resolveClassicMove(fen, "d2", "e2", "q", effects);
    expect(result.ok).toBe(true);
    expect(new Chess(result.fen!).get("d2")).toBeUndefined();
    expect(new Chess(result.fen!).get("e2")?.color).toBe("w");
    expect(result.effects).toHaveLength(0);
  });

  it("não oferece destinos que deixam o rei em xeque", () => {
    const fen = "4r1k1/8/8/8/8/8/4R3/4K3 w - - 0 1";
    const targets = validSpecialTargets(fen, "teleport", "e2");
    expect(targets).not.toContain("d2");
  });

  it("Golpe Arcano captura sem mover o atacante", () => {
    const fen = "4k3/8/8/4p3/3R4/8/8/4K3 w - - 0 1";
    const result = executeSpecialAction(fen, { abilityId: "arcaneStrike", from: "d4", to: "e5" });
    const board = new Chess(result.fen!);
    expect(result.ok).toBe(true);
    expect(board.get("d4")?.type).toBe("r");
    expect(board.get("e5")).toBeUndefined();
  });

  it("Eco do Peão cria uma cópia adjacente", () => {
    const fen = "4k3/8/8/8/3P4/8/8/4K3 w - - 0 1";
    const result = executeSpecialAction(fen, { abilityId: "pawnEcho", from: "d4", to: "e5" });
    const board = new Chess(result.fen!);
    expect(result.ok).toBe(true);
    expect(board.get("d4")?.type).toBe("p");
    expect(board.get("e5")?.type).toBe("p");
  });

  it("Guarda Real reposiciona uma peça junto ao rei", () => {
    const fen = "4k3/8/8/8/3P4/8/8/4K3 w - - 0 1";
    const result = executeSpecialAction(fen, { abilityId: "royalGuard", from: "d4", to: "d2" });
    expect(result.ok).toBe(true);
    expect(new Chess(result.fen!).get("d2")?.type).toBe("p");
  });

  it("Onda de Impacto empurra um inimigo para a casa livre seguinte", () => {
    const fen = "4k3/8/8/8/3Rp3/8/8/4K3 w - - 0 1";
    const result = executeSpecialAction(fen, { abilityId: "shockwave", from: "d4", to: "e4" });
    const board = new Chess(result.fen!);
    expect(result.ok).toBe(true);
    expect(board.get("e4")).toBeUndefined();
    expect(board.get("f4")?.color).toBe("b");
  });

  it("Pacto de Proteção sacrifica um peão e blinda o rei", () => {
    const fen = "4k3/8/8/8/8/8/4P3/4K3 w - - 0 1";
    const result = executeSpecialAction(fen, { abilityId: "sacrificeWard", from: "e2" });
    expect(result.ok).toBe(true);
    expect(new Chess(result.fen!).get("e2")).toBeUndefined();
    expect(result.effects?.[0]).toMatchObject({ type: "shield", square: "e1", color: "w" });
  });

  it("Corte Espectral atravessa bloqueadores na diagonal", () => {
    const fen = "7k/8/5P2/4p3/3R4/8/8/4K3 w - - 0 1";
    const result = executeSpecialAction(fen, { abilityId: "phaseDiagonal", from: "d4", to: "g7" });
    expect(result.ok).toBe(true);
    expect(new Chess(result.fen!).get("g7")?.type).toBe("r");
  });

  it("Escudo Cristalino também bloqueia capturas especiais", () => {
    const fen = "4k3/8/8/4p3/3R4/8/8/4K3 w - - 0 1";
    const effects: PersistentEffect[] = [{ id: "shield-2", type: "shield", square: "e5", color: "b" }];
    const result = executeSpecialAction(fen, { abilityId: "arcaneStrike", from: "d4", to: "e5" }, effects);
    expect(result.ok).toBe(true);
    expect(new Chess(result.fen!).get("e5")?.type).toBe("p");
    expect(result.effects).toHaveLength(0);
  });
});
