import type { Color, PieceSymbol, Square } from "chess.js";

export type GameMode = "classic" | "powers";
export type Opponent = "local" | "computer";
export type Difficulty = "easy" | "medium" | "hard";
export type Screen = "menu" | "learn" | "setup" | "game" | "collection" | "settings" | "result";
export type ModifierId = "queen" | "knight" | "rook" | "bishop" | "wild";
export type AbilityCategory = "Movimento" | "Posicionamento" | "Ataque" | "Defesa" | "Defesa / Ataque";
export type AbilityRarity = "Comum" | "Rara" | "Épica" | "Lendária";
export type AbilityTargetType = "piece-destination" | "piece";
export type AbilityId = "doubleJump" | "ghostStep" | "invertedKnight" | "charge" | "freeMovement" | "teleport" | "diagonalDance" | "kingStep" | "divineShield" | "counterAttack" | "arcaneStrike" | "pawnEcho" | "royalGuard" | "shockwave" | "sacrificeWard" | "phaseDiagonal" | "mirrorSwap" | "gravityPull" | "aegisLink" | "riftLeap";

export interface AbilityDefinition {
  id: AbilityId;
  name: string;
  description: string;
  details: string;
  category: AbilityCategory;
  rarity: AbilityRarity;
  image: string;
  targetType: AbilityTargetType;
  maxUses: number;
}

export interface AbilityState {
  id: AbilityId;
  usesLeft: number;
  status: "available" | "selected" | "targeting" | "exhausted" | "blocked";
}

export interface PersistentEffect {
  id: string;
  type: "shield" | "counter";
  square: Square;
  color: Color;
}

export interface BoardPiece {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

export interface HistoryEntry {
  id: string;
  ply: number;
  color: Color;
  notation: string;
  ability?: AbilityId;
}

export interface MatchConfig {
  mode: GameMode;
  opponent: Opponent;
  difficulty: Difficulty;
  playerColor: Color;
  startingAbilities: number;
  selectedModifiers?: ModifierId[];
}

export interface ModifierState {
  id: ModifierId;
  used: boolean;
}

export interface SpecialAction {
  abilityId: AbilityId;
  from: Square;
  to?: Square;
  via?: Square;
}

export interface ActionResult {
  ok: boolean;
  fen?: string;
  notation?: string;
  effects?: PersistentEffect[];
  error?: string;
  captured?: BoardPiece;
}
