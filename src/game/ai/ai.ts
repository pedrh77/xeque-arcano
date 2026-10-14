import { Chess, type Square } from "chess.js";
import type { AbilityId, AbilityState, Difficulty, PersistentEffect, SpecialAction } from "../models/types";
import { executeSpecialAction, SQUARES } from "../engine/engine";
import { ABILITIES } from "../abilities/registry";

const VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20_000 } as const;

function evaluate(fen: string, aiColor: "w" | "b"): number {
  const chess = new Chess(fen);
  if (chess.isCheckmate()) return chess.turn() === aiColor ? -100_000 : 100_000;
  return chess.board().flat().reduce((sum, piece) => sum + (piece ? VALUE[piece.type] * (piece.color === aiColor ? 1 : -1) : 0), 0);
}

export function chooseAiAction(fen: string, difficulty: Difficulty, abilities: AbilityState[], effects: PersistentEffect[]): { move?: { from: Square; to: Square; promotion: "q" }; special?: SpecialAction } | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  const candidates = moves.map((move) => {
    const next = new Chess(fen);
    next.move({ from: move.from, to: move.to, promotion: "q" });
    return { move: { from: move.from, to: move.to, promotion: "q" as const }, score: evaluate(next.fen(), chess.turn()) };
  });

  const available = abilities.filter((ability) => ability.usesLeft > 0);
  const powerChance = difficulty === "easy" ? 0.42 : difficulty === "medium" ? 0.62 : 0.82;
  if (available.length && (!moves.length || Math.random() < powerChance)) {
    const ordered = difficulty === "hard" ? available : [...available].sort(() => Math.random() - 0.5);
    for (const ability of ordered) {
      const ownSquares = SQUARES.filter((square) => chess.get(square)?.color === chess.turn()).sort(() => Math.random() - 0.5);
      for (const from of ownSquares) {
        if (ABILITIES[ability.id].targetType === "piece") {
          const result = executeSpecialAction(fen, { abilityId: ability.id, from }, effects);
          if (result.ok) return { special: { abilityId: ability.id, from } };
          continue;
        }
        const targets = SQUARES.map((to) => ({ to, result: executeSpecialAction(fen, { abilityId: ability.id as AbilityId, from, to }, effects) })).filter((item) => item.result.ok);
        if (targets.length) {
          targets.sort((a, b) => (b.result.captured ? VALUE[b.result.captured.type] : 0) - (a.result.captured ? VALUE[a.result.captured.type] : 0));
          return { special: { abilityId: ability.id as AbilityId, from, to: targets[0].to } };
        }
      }
    }
  }

  if (!candidates.length) return null;
  if (difficulty === "easy") return candidates[Math.floor(Math.random() * candidates.length)];
  candidates.sort((a, b) => b.score - a.score);
  const pool = difficulty === "medium" ? candidates.slice(0, Math.min(4, candidates.length)) : candidates.slice(0, Math.min(2, candidates.length));
  return pool[Math.floor(Math.random() * pool.length)];
}
