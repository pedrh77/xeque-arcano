import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { GAME_BALANCE } from "../../config/balance";
import type { ActionResult, AbilityId, BoardPiece, PersistentEffect, SpecialAction } from "../models/types";

const FILES = "abcdefgh";
export const SQUARES = Array.from({ length: 64 }, (_, index) => `${FILES[index % 8]}${8 - Math.floor(index / 8)}` as Square);
const KNIGHT_STEPS = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
const DIAGONALS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

function coords(square: Square): [number, number] {
  return [FILES.indexOf(square[0]), Number(square[1]) - 1];
}

function squareAt(file: number, rank: number): Square | null {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return `${FILES[file]}${rank + 1}` as Square;
}

export function getPieces(fen: string): BoardPiece[] {
  const chess = new Chess(fen);
  return SQUARES.flatMap((square) => {
    const piece = chess.get(square);
    return piece ? [{ square, type: piece.type, color: piece.color }] : [];
  });
}

function boardMap(fen: string): Map<Square, { type: PieceSymbol; color: Color }> {
  const chess = new Chess(fen);
  return new Map(SQUARES.flatMap((square) => {
    const piece = chess.get(square);
    return piece ? [[square, { type: piece.type, color: piece.color }] as const] : [];
  }));
}

function placement(board: Map<Square, { type: PieceSymbol; color: Color }>): string {
  const rows: string[] = [];
  for (let rank = 7; rank >= 0; rank -= 1) {
    let row = "";
    let empty = 0;
    for (let file = 0; file < 8; file += 1) {
      const piece = board.get(squareAt(file, rank)!);
      if (!piece) {
        empty += 1;
        continue;
      }
      if (empty) row += String(empty);
      empty = 0;
      const symbol = piece.color === "w" ? piece.type.toUpperCase() : piece.type;
      row += symbol;
    }
    if (empty) row += String(empty);
    rows.push(row);
  }
  return rows.join("/");
}

function nextFen(board: Map<Square, { type: PieceSymbol; color: Color }>, sourceFen: string, turn: Color, removeCastling = false): string {
  const parts = sourceFen.split(" ");
  const originalTurn = parts[1] as Color;
  const fullmove = Number(parts[5] || "1") + (originalTurn === "b" && turn === "w" ? 1 : 0);
  return `${placement(board)} ${turn} ${removeCastling ? "-" : parts[2]} - ${Number(parts[4] || "0") + 1} ${fullmove}`;
}

function kingSafe(board: Map<Square, { type: PieceSymbol; color: Color }>, sourceFen: string, actor: Color, removeCastling = false): boolean {
  try {
    return !new Chess(nextFen(board, sourceFen, actor, removeCastling)).isCheck();
  } catch {
    return false;
  }
}

function enemy(color: Color): Color {
  return color === "w" ? "b" : "w";
}

function reactiveSpecialCapture(
  board: Map<Square, { type: PieceSymbol; color: Color }>,
  fen: string,
  actor: Color,
  from: Square,
  to: Square,
  effects: PersistentEffect[],
): ActionResult | undefined {
  const reactive = effects.find((effect) => effect.square === to && effect.color !== actor);
  if (!reactive) return undefined;
  const remaining = effects.filter((effect) => effect.id !== reactive.id);
  if (reactive.type === "shield") {
    return { ok: true, fen: nextFen(board, fen, enemy(actor)), notation: `Poder bloqueado · Escudo Cristalino`, effects: remaining };
  }
  board.delete(from);
  if (!kingSafe(board, fen, actor)) return undefined;
  return {
    ok: true,
    fen: nextFen(board, fen, enemy(actor)),
    notation: `Poder refletido · Contra-golpe`,
    effects: remaining,
    captured: { square: from, ...boardMap(fen).get(from)! },
  };
}

function delta(from: Square, to: Square): [number, number] {
  const [fx, fy] = coords(from);
  const [tx, ty] = coords(to);
  return [tx - fx, ty - fy];
}

function clearPath(board: Map<Square, unknown>, from: Square, to: Square): boolean {
  const [fx, fy] = coords(from);
  const [tx, ty] = coords(to);
  const sx = Math.sign(tx - fx);
  const sy = Math.sign(ty - fy);
  let x = fx + sx;
  let y = fy + sy;
  while (x !== tx || y !== ty) {
    if (board.has(squareAt(x, y)!)) return false;
    x += sx;
    y += sy;
  }
  return true;
}

function findIntermediate(board: Map<Square, unknown>, from: Square, to: Square, steps: number[][]): Square | undefined {
  const [fx, fy] = coords(from);
  const [tx, ty] = coords(to);
  for (const [dx, dy] of steps) {
    const mid = squareAt(fx + dx, fy + dy);
    if (!mid || board.has(mid)) continue;
    if (steps.some(([sx, sy]) => fx + dx + sx === tx && fy + dy + sy === ty)) return mid;
  }
}

export function legalMoves(fen: string, square?: Square) {
  const chess = new Chess(fen);
  return chess.moves(square ? { square, verbose: true } : { verbose: true });
}

export function transformPawn(fen: string, square: Square, type: "q" | "r" | "b" | "n"): ActionResult {
  const chess = new Chess(fen);
  const actor = chess.turn();
  const piece = chess.get(square);
  if (!piece || piece.color !== actor || piece.type !== "p") {
    return { ok: false, error: "Escolha um dos seus peões para evoluir." };
  }
  chess.remove(square);
  chess.put({ type, color: actor }, square);
  const parts = chess.fen().split(" ");
  parts[1] = enemy(actor);
  parts[2] = "-";
  parts[3] = "-";
  parts[4] = "0";
  parts[5] = String(Number(fen.split(" ")[5] || "1") + (actor === "b" ? 1 : 0));
  return { ok: true, fen: parts.join(" "), notation: `Evolução em ${square}` };
}

export function resolveClassicMove(fen: string, from: Square, to: Square, promotion: "q" | "r" | "b" | "n" = "q", effects: PersistentEffect[] = []): ActionResult {
  const chess = new Chess(fen);
  const actor = chess.turn();
  let move;
  try {
    move = chess.move({ from, to, promotion });
  } catch {
    return { ok: false, error: "Movimento ilegal." };
  }
  if (!move) return { ok: false, error: "Movimento ilegal." };

  const reactive = move.captured ? effects.find((effect) => effect.square === to && effect.color !== actor) : undefined;
  if (reactive?.type === "shield") {
    const board = boardMap(fen);
    if (!kingSafe(board, fen, actor)) return { ok: false, error: "O escudo manteria seu rei em xeque." };
    return {
      ok: true,
      fen: nextFen(board, fen, enemy(actor)),
      notation: `${move.san} · Escudo Divino`,
      effects: effects.filter((effect) => effect.id !== reactive.id),
    };
  }

  if (reactive?.type === "counter") {
    const board = boardMap(fen);
    board.delete(from);
    if (kingSafe(board, fen, actor)) {
      return {
        ok: true,
        fen: nextFen(board, fen, enemy(actor)),
        notation: `${move.san} · Contra-ataque`,
        effects: effects.filter((effect) => effect.id !== reactive.id),
        captured: { square: from, type: move.piece, color: actor },
      };
    }
  }

  return {
    ok: true,
    fen: chess.fen(),
    notation: move.san,
    effects,
    captured: move.captured ? { square: to, type: move.captured, color: enemy(actor) } : undefined,
  };
}

export function executeSpecialAction(fen: string, action: SpecialAction, effects: PersistentEffect[] = []): ActionResult {
  const chess = new Chess(fen);
  const actor = chess.turn();
  const board = boardMap(fen);
  const piece = board.get(action.from);
  if (!piece || piece.color !== actor) return { ok: false, error: "Selecione uma peça aliada." };

  if (action.abilityId === "divineShield" || action.abilityId === "counterAttack") {
    const type = action.abilityId === "divineShield" ? "shield" : "counter";
    const withoutOld = effects.filter((effect) => effect.square !== action.from);
    return {
      ok: true,
      fen: nextFen(board, fen, enemy(actor)),
      notation: `${action.abilityId === "divineShield" ? "Escudo Cristalino" : "Contra-golpe"} em ${action.from}`,
      effects: [...withoutOld, { id: `${type}-${Date.now()}`, type, square: action.from, color: actor }],
    };
  }

  if (action.abilityId === "sacrificeWard") {
    if (piece.type !== "p") return { ok: false, error: "O pacto exige um peão aliado." };
    const kingSquare = SQUARES.find((square) => board.get(square)?.color === actor && board.get(square)?.type === "k");
    if (!kingSquare) return { ok: false, error: "Rei aliado não encontrado." };
    board.delete(action.from);
    if (!kingSafe(board, fen, actor)) return { ok: false, error: "O sacrifício deixaria seu rei ameaçado." };
    const withoutOld = effects.filter((effect) => effect.square !== kingSquare);
    return {
      ok: true,
      fen: nextFen(board, fen, enemy(actor)),
      notation: `Pacto de Proteção · ${action.from} → ${kingSquare}`,
      effects: [...withoutOld, { id: `shield-${Date.now()}`, type: "shield", square: kingSquare, color: actor }],
    };
  }

  if (!action.to) return { ok: false, error: "Escolha uma casa de destino." };
  const target = board.get(action.to);
  if (target?.color === actor) {
    if (!(["invertedKnight", "kingStep"] as AbilityId[]).includes(action.abilityId)) return { ok: false, error: "O destino contém uma peça aliada." };
  }
  if (target?.type === "k" && action.abilityId !== "kingStep") return { ok: false, error: "O rei nunca pode ser capturado." };

  const [dx, dy] = delta(action.from, action.to);
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  let valid = false;
  let removeCastling = piece.type === "k";

  if (action.abilityId === "arcaneStrike") {
    if (!target || target.color === actor || target.type === "k" || Math.max(ax, ay) > 2 || Math.max(ax, ay) === 0) {
      return { ok: false, error: "Escolha um inimigo a até duas casas." };
    }
    const reactive = reactiveSpecialCapture(board, fen, actor, action.from, action.to, effects);
    if (reactive) return reactive;
    board.delete(action.to);
    if (!kingSafe(board, fen, actor)) return { ok: false, error: "Este golpe deixaria seu rei ameaçado." };
    return {
      ok: true,
      fen: nextFen(board, fen, enemy(actor)),
      notation: `Golpe Arcano · ${action.from} × ${action.to}`,
      effects,
      captured: { square: action.to, ...target },
    };
  }

  if (action.abilityId === "pawnEcho") {
    if (piece.type !== "p" || target || Math.max(ax, ay) !== 1) return { ok: false, error: "Escolha uma casa vazia adjacente a um peão." };
    board.set(action.to, piece);
    if (!kingSafe(board, fen, actor)) return { ok: false, error: "O eco não protegeria seu rei." };
    return { ok: true, fen: nextFen(board, fen, enemy(actor)), notation: `Eco do Peão · ${action.from} + ${action.to}`, effects };
  }

  if (action.abilityId === "shockwave") {
    if (!target || target.color === actor || target.type === "k" || Math.max(ax, ay) !== 1) return { ok: false, error: "Escolha um inimigo adjacente." };
    const [tx, ty] = coords(action.to);
    const pushedTo = squareAt(tx + Math.sign(dx), ty + Math.sign(dy));
    if (!pushedTo || board.has(pushedTo)) return { ok: false, error: "Não há espaço livre atrás do alvo." };
    board.delete(action.to);
    board.set(pushedTo, target);
    if (!kingSafe(board, fen, actor)) return { ok: false, error: "O empurrão deixaria seu rei ameaçado." };
    return { ok: true, fen: nextFen(board, fen, enemy(actor)), notation: `Onda de Impacto · ${action.to} → ${pushedTo}`, effects };
  }

  switch (action.abilityId) {
    case "ghostStep":
      valid = (dx === 0 || dy === 0) && (dx !== 0 || dy !== 0);
      break;
    case "charge":
      valid = (dx === 0 || dy === 0) && Math.max(ax, ay) <= GAME_BALANCE.chargeMaxDistance && clearPath(board, action.from, action.to);
      break;
    case "freeMovement":
      valid = Math.max(ax, ay) === 1;
      break;
    case "teleport":
      valid = !target && Math.max(ax, ay) <= GAME_BALANCE.teleportMaxDistance && Math.max(ax, ay) > 0;
      break;
    case "royalGuard": {
      const kingSquare = SQUARES.find((square) => board.get(square)?.color === actor && board.get(square)?.type === "k");
      valid = Boolean(!target && kingSquare && Math.max(...delta(kingSquare, action.to).map(Math.abs)) === 1 && piece.type !== "k");
      break;
    }
    case "phaseDiagonal":
      valid = ax === ay && ax > 0;
      break;
    case "invertedKnight":
      valid = Boolean(target && target.color === actor && ((ax === 1 && ay === 2) || (ax === 2 && ay === 1)));
      break;
    case "kingStep":
      valid = Boolean(target && target.color === actor && target.type === "k");
      removeCastling = true;
      break;
    case "doubleJump": {
      const via = action.via ?? findIntermediate(board, action.from, action.to, KNIGHT_STEPS);
      valid = Boolean(via);
      action.via = via;
      break;
    }
    case "diagonalDance": {
      const via = action.via ?? findIntermediate(board, action.from, action.to, DIAGONALS);
      valid = Boolean(via);
      action.via = via;
      break;
    }
  }
  if (!valid) return { ok: false, error: "Destino inválido para esta habilidade." };

  if (target && target.color !== actor) {
    const reactive = reactiveSpecialCapture(board, fen, actor, action.from, action.to, effects);
    if (reactive) return reactive;
  }

  if (action.abilityId === "invertedKnight" || action.abilityId === "kingStep") {
    board.set(action.from, target!);
    board.set(action.to, piece);
  } else {
    board.delete(action.from);
    board.set(action.to, piece);
  }
  if (!kingSafe(board, fen, actor, removeCastling)) return { ok: false, error: "Esta ação deixaria seu rei ameaçado." };

  return {
    ok: true,
    fen: nextFen(board, fen, enemy(actor), removeCastling),
    notation: `${action.abilityId}: ${action.from}–${action.via ? `${action.via}–` : ""}${action.to}`,
    effects,
    captured: target && target.color !== actor ? { square: action.to, ...target } : undefined,
  };
}

export function validSpecialTargets(fen: string, abilityId: AbilityId, from: Square, effects: PersistentEffect[] = []): Square[] {
  if (abilityId === "divineShield" || abilityId === "counterAttack" || abilityId === "sacrificeWard") return [];
  return SQUARES.filter((to) => executeSpecialAction(fen, { abilityId, from, to }, effects).ok);
}

export function gameStatus(fen: string): { over: boolean; title?: string; detail?: string } {
  const chess = new Chess(fen);
  if (chess.isCheckmate()) return { over: true, title: chess.turn() === "w" ? "Vitória das pretas" : "Vitória das brancas", detail: "Xeque-mate" };
  if (chess.isStalemate()) return { over: true, title: "Empate", detail: "Rei afogado" };
  if (chess.isThreefoldRepetition()) return { over: true, title: "Empate", detail: "Repetição tripla" };
  if (chess.isInsufficientMaterial()) return { over: true, title: "Empate", detail: "Material insuficiente" };
  if (chess.isDrawByFiftyMoves()) return { over: true, title: "Empate", detail: "Regra dos 50 movimentos" };
  return { over: false };
}
