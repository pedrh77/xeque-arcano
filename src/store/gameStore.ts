import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chooseAiAction } from "../game/ai/ai";
import { ABILITIES, drawAbilities } from "../game/abilities/registry";
import { executeSpecialAction, gameStatus, legalMoves, resolveClassicMove, SQUARES, transformPawn, validSpecialTargets } from "../game/engine/engine";
import type { AbilityId, AbilityState, BoardPiece, HistoryEntry, MatchConfig, ModifierId, ModifierState, PersistentEffect, Screen, SpecialAction } from "../game/models/types";

export const POWER_START_FEN = "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1";

export const MODIFIERS: Record<ModifierId, { name: string; glyph: string; image: string; type: "q" | "r" | "b" | "n"; description: string }> = {
  queen: { name: "Coroa da Rainha", glyph: "♕", image: "/assets/modifiers/queen.png", type: "q", description: "Transforma um peão em rainha." },
  knight: { name: "Salto do Cavalo", glyph: "♘", image: "/assets/modifiers/knight.png", type: "n", description: "Transforma um peão em cavalo." },
  rook: { name: "Muralha da Torre", glyph: "♖", image: "/assets/modifiers/rook.png", type: "r", description: "Transforma um peão em torre." },
  bishop: { name: "Olhar do Bispo", glyph: "♗", image: "/assets/modifiers/bishop.png", type: "b", description: "Transforma um peão em bispo." },
  wild: { name: "Coringa Arcano", glyph: "✦", image: "/assets/modifiers/wild.png", type: "q", description: "Transforma um peão em rainha instável." },
};

const DEFAULT_MODIFIERS: ModifierId[] = ["queen", "knight", "rook"];
const DEFAULT_CONFIG: MatchConfig = { mode: "powers", opponent: "computer", difficulty: "medium", playerColor: "w", startingAbilities: 5, selectedModifiers: DEFAULT_MODIFIERS };
interface ResultState { title: string; detail: string }
interface Stats { games: number; wins: number; abilitiesUsed: number }

interface GameState {
  screen: Screen; config: MatchConfig; fen: string; started: boolean;
  selectedSquare?: Square; selectedAbility?: AbilityId; selectedModifier?: ModifierId; pendingAction?: SpecialAction;
  lastMove?: { from: Square; to: Square }; hands: Record<Color, AbilityState[]>; modifiers: Record<Color, ModifierState[]>;
  effects: PersistentEffect[]; history: HistoryEntry[]; captured: BoardPiece[]; notice?: string; result?: ResultState;
  flipped: boolean; reducedMotion: boolean; coordinates: boolean; aiThinking: boolean; stats: Stats;
  setScreen: (screen: Screen) => void; updateConfig: (config: Partial<MatchConfig>) => void; toggleConfigModifier: (id: ModifierId) => void;
  startGame: () => void; resumeGame: () => void; restart: () => void; resign: () => void;
  selectAbility: (id?: AbilityId) => void; selectModifier: (id?: ModifierId) => void; selectSquare: (square: Square) => void;
  confirmAbility: () => void; cancelSelection: () => void; runAi: () => void; toggleFlip: () => void;
  setReducedMotion: (value: boolean) => void; setCoordinates: (value: boolean) => void;
}

const makeHand = () => drawAbilities(5).map((id) => ({ id, usesLeft: 1, status: "available" as const }));
const modifierHand = (ids: ModifierId[]) => ids.map((id) => ({ id, used: false }));
const randomModifiers = () => (Object.keys(MODIFIERS) as ModifierId[]).sort(() => Math.random() - .5).slice(0, 3);
const consumePower = (hands: Record<Color, AbilityState[]>, color: Color, id: AbilityId) => ({ ...hands, [color]: hands[color].map((card) => card.id === id ? { ...card, usesLeft: 0, status: "exhausted" as const } : card) });
const addHistory = (history: HistoryEntry[], color: Color, notation: string, ability?: AbilityId): HistoryEntry[] => [...history, { id: `${Date.now()}-${history.length}`, ply: history.length + 1, color, notation, ability }];

export const useGameStore = create<GameState>()(persist((set, get) => ({
  screen: "menu", config: DEFAULT_CONFIG, fen: POWER_START_FEN, started: false,
  hands: { w: [], b: [] }, modifiers: { w: [], b: [] }, effects: [], history: [], captured: [],
  flipped: false, reducedMotion: false, coordinates: true, aiThinking: false, stats: { games: 0, wins: 0, abilitiesUsed: 0 },

  setScreen: (screen) => set({ screen }),
  updateConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
  toggleConfigModifier: (id) => set((state) => {
    const current = state.config.selectedModifiers ?? DEFAULT_MODIFIERS;
    const selectedModifiers = current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current;
    return { config: { ...state.config, selectedModifiers } };
  }),
  startGame: () => set((state) => ({
    screen: "game", fen: POWER_START_FEN, started: true, selectedSquare: undefined, selectedAbility: undefined, selectedModifier: undefined,
    pendingAction: undefined, lastMove: undefined, hands: { w: makeHand(), b: makeHand() },
    modifiers: { w: modifierHand(state.config.selectedModifiers ?? DEFAULT_MODIFIERS), b: modifierHand(randomModifiers()) },
    effects: [], history: [], captured: [], result: undefined, aiThinking: false,
    notice: "Mova, use um poder ou evolua um peão.", flipped: state.config.playerColor === "b",
    stats: { ...state.stats, games: state.stats.games + 1 },
  })),
  resumeGame: () => set({ screen: "game" }),
  restart: () => get().startGame(),
  resign: () => set({ screen: "result", started: false, result: { title: "Derrota", detail: "Seu rei abandonou a arena." } }),
  selectAbility: (id) => set({ selectedAbility: id, selectedModifier: undefined, selectedSquare: undefined, pendingAction: undefined, notice: id ? "Selecione uma peça para usar o poder." : undefined }),
  selectModifier: (id) => set({ selectedModifier: id, selectedAbility: undefined, selectedSquare: undefined, pendingAction: undefined, notice: id ? `Escolha um peão para receber ${MODIFIERS[id].name}.` : undefined }),

  selectSquare: (square) => set((state) => {
    if (state.aiThinking || state.result) return {};
    const chess = new Chess(state.fen); const turn = chess.turn(); const piece = chess.get(square);
    if (state.selectedModifier) {
      const card = state.modifiers[turn].find((item) => item.id === state.selectedModifier && !item.used);
      if (!card) return { notice: "Esta evolução já foi usada." };
      const result = transformPawn(state.fen, square, MODIFIERS[state.selectedModifier].type);
      if (!result.ok || !result.fen) return { notice: result.error };
      const modifier = state.selectedModifier;
      return { fen: result.fen, modifiers: { ...state.modifiers, [turn]: state.modifiers[turn].map((item) => item.id === modifier ? { ...item, used: true } : item) }, history: addHistory(state.history, turn, `${MODIFIERS[modifier].glyph} ${MODIFIERS[modifier].name} · ${square}`), selectedModifier: undefined, selectedSquare: undefined, notice: `${MODIFIERS[modifier].name} ativada.` };
    }
    if (!state.selectedSquare) {
      if (!piece || piece.color !== turn) return { notice: "Selecione uma peça do jogador atual." };
      if (state.selectedAbility && ABILITIES[state.selectedAbility].targetType === "piece") return { selectedSquare: square, pendingAction: { abilityId: state.selectedAbility, from: square }, notice: "Confirme para ativar." };
      return { selectedSquare: square, notice: state.selectedAbility ? "Escolha um destino luminoso." : "Escolha uma casa válida." };
    }
    if (piece?.color === turn && square !== state.selectedSquare) return { selectedSquare: square, pendingAction: undefined };
    if (square === state.selectedSquare) return { selectedSquare: undefined, pendingAction: undefined, notice: undefined };
    if (state.selectedAbility) {
      const valid = validSpecialTargets(state.fen, state.selectedAbility, state.selectedSquare, state.effects);
      if (!valid.includes(square)) return { notice: "Destino inválido para este poder." };
      return { pendingAction: { abilityId: state.selectedAbility, from: state.selectedSquare, to: square }, notice: "Confirme a jogada especial." };
    }
    const result = resolveClassicMove(state.fen, state.selectedSquare, square, "q", state.effects);
    if (!result.ok || !result.fen) return { notice: result.error ?? "Movimento inválido." };
    const status = gameStatus(result.fen);
    return { fen: result.fen, effects: result.effects ?? state.effects, history: addHistory(state.history, turn, result.notation!), captured: result.captured ? [...state.captured, result.captured] : state.captured, lastMove: { from: state.selectedSquare, to: square }, selectedSquare: undefined, notice: undefined, ...(status.over ? { screen: "result" as Screen, started: false, result: { title: status.title!, detail: status.detail! } } : {}) };
  }),

  confirmAbility: () => set((state) => {
    if (!state.pendingAction || !state.selectedAbility) return { notice: "Escolha peça e destino antes de confirmar." };
    const turn = new Chess(state.fen).turn(); const result = executeSpecialAction(state.fen, state.pendingAction, state.effects);
    if (!result.ok || !result.fen) return { notice: result.error, pendingAction: undefined };
    const id = state.selectedAbility; const status = gameStatus(result.fen);
    return { fen: result.fen, effects: result.effects ?? state.effects, hands: consumePower(state.hands, turn, id), history: addHistory(state.history, turn, result.notation!, id), captured: result.captured ? [...state.captured, result.captured] : state.captured, lastMove: state.pendingAction.to ? { from: state.pendingAction.from, to: state.pendingAction.to } : state.lastMove, selectedSquare: undefined, selectedAbility: undefined, pendingAction: undefined, notice: `${ABILITIES[id].name} executado.`, stats: { ...state.stats, abilitiesUsed: state.stats.abilitiesUsed + 1 }, ...(status.over ? { screen: "result" as Screen, started: false, result: { title: status.title!, detail: status.detail! } } : {}) };
  }),
  cancelSelection: () => set({ selectedSquare: undefined, selectedAbility: undefined, selectedModifier: undefined, pendingAction: undefined, notice: undefined }),

  runAi: () => {
    const state = get(); const chess = new Chess(state.fen);
    if (state.config.opponent !== "computer" || chess.turn() === state.config.playerColor || state.screen !== "game" || state.aiThinking) return;
    set({ aiThinking: true, notice: "O rival calcula…" });
    window.setTimeout(() => {
      const current = get(); const before = new Chess(current.fen); const color = before.turn();
      const unused = current.modifiers[color].filter((item) => !item.used); const pawns = SQUARES.filter((sq) => before.get(sq)?.color === color && before.get(sq)?.type === "p");
      if (unused.length && pawns.length && Math.random() < .28) {
        const card = unused[Math.floor(Math.random() * unused.length)]; const square = pawns[Math.floor(Math.random() * pawns.length)]; const evolved = transformPawn(current.fen, square, MODIFIERS[card.id].type);
        if (evolved.ok && evolved.fen) { set((latest) => ({ fen: evolved.fen!, modifiers: { ...latest.modifiers, [color]: latest.modifiers[color].map((item) => item.id === card.id ? { ...item, used: true } : item) }, history: addHistory(latest.history, color, `${MODIFIERS[card.id].glyph} Evolução · ${square}`), aiThinking: false, notice: "O rival evoluiu um peão." })); return; }
      }
      const choice = chooseAiAction(current.fen, current.config.difficulty, current.hands[color], current.effects);
      if (!choice) { set({ aiThinking: false }); return; }
      const result = choice.special ? executeSpecialAction(current.fen, choice.special, current.effects) : resolveClassicMove(current.fen, choice.move!.from, choice.move!.to, "q", current.effects);
      if (!result.ok || !result.fen) { set({ aiThinking: false, notice: "O rival perdeu a vez." }); return; }
      const ability = choice.special?.abilityId; const status = gameStatus(result.fen);
      set((latest) => ({ fen: result.fen!, effects: result.effects ?? latest.effects, hands: ability ? consumePower(latest.hands, color, ability) : latest.hands, history: addHistory(latest.history, color, result.notation!, ability), captured: result.captured ? [...latest.captured, result.captured] : latest.captured, lastMove: { from: choice.special?.from ?? choice.move!.from, to: choice.special?.to ?? choice.move!.to }, aiThinking: false, notice: ability ? `${ABILITIES[ability].name} usado pelo rival.` : "Sua vez.", ...(status.over ? { screen: "result" as Screen, started: false, result: { title: status.title!, detail: status.detail! } } : {}) }));
    }, state.reducedMotion ? 100 : 560);
  },
  toggleFlip: () => set((state) => ({ flipped: !state.flipped })), setReducedMotion: (reducedMotion) => set({ reducedMotion }), setCoordinates: (coordinates) => set({ coordinates }),
}), { name: "pawnstorm-save", version: 2, partialize: (state) => ({ config: state.config, fen: state.fen, started: state.started, hands: state.hands, modifiers: state.modifiers, effects: state.effects, history: state.history, captured: state.captured, lastMove: state.lastMove, flipped: state.flipped, reducedMotion: state.reducedMotion, coordinates: state.coordinates, stats: state.stats }) }));

export function useLegalTargets(): Square[] {
  const selectedSquare = useGameStore((state) => state.selectedSquare); const selectedAbility = useGameStore((state) => state.selectedAbility); const fen = useGameStore((state) => state.fen); const effects = useGameStore((state) => state.effects);
  return useMemo(() => selectedSquare ? (selectedAbility ? validSpecialTargets(fen, selectedAbility, selectedSquare, effects) : legalMoves(fen, selectedSquare).map((move) => move.to)) : [], [effects, fen, selectedAbility, selectedSquare]);
}

export const pieceValue: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
