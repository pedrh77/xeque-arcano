import { Chess, type PieceSymbol } from "chess.js";
import { motion } from "motion/react";
import { Shield, Swords } from "lucide-react";
import { SQUARES } from "../../game/engine/engine";
import { useGameStore, useLegalTargets } from "../../store/gameStore";
import { ChessPiece } from "./ChessPiece";

const NAMES: Record<PieceSymbol, string> = { k: "rei", q: "dama", r: "torre", b: "bispo", n: "cavalo", p: "peão" };

export function ChessBoard() {
  const fen = useGameStore((state) => state.fen);
  const flipped = useGameStore((state) => state.flipped);
  const coordinates = useGameStore((state) => state.coordinates);
  const selected = useGameStore((state) => state.selectedSquare);
  const selectedAbility = useGameStore((state) => state.selectedAbility);
  const lastMove = useGameStore((state) => state.lastMove);
  const effects = useGameStore((state) => state.effects);
  const pending = useGameStore((state) => state.pendingAction);
  const reducedMotion = useGameStore((state) => state.reducedMotion);
  const selectSquare = useGameStore((state) => state.selectSquare);
  const targets = useLegalTargets();
  const chess = new Chess(fen);
  const checkSquare = chess.isCheck() ? SQUARES.find((square) => chess.get(square)?.type === "k" && chess.get(square)?.color === chess.turn()) : undefined;
  const displaySquares = flipped ? [...SQUARES].reverse() : SQUARES;

  return (
    <div className={`board-frame ${selectedAbility ? "ability-targeting" : ""}`}>
      <div className="board" role="grid" aria-label="Tabuleiro de xadrez">
        {displaySquares.map((square) => {
          const [file, rank] = [square.charCodeAt(0) - 97, Number(square[1]) - 1];
          const isLight = (file + rank) % 2 === 1;
          const piece = chess.get(square);
          const effect = effects.find((item) => item.square === square);
          const isTarget = targets.includes(square);
          const isCapture = isTarget && Boolean(piece);
          const classes = [
            "square",
            isLight ? "light" : "dark",
            selected === square ? "selected" : "",
            lastMove?.from === square || lastMove?.to === square ? "last-move" : "",
            checkSquare === square ? "in-check" : "",
            pending?.to === square ? "pending" : "",
          ].filter(Boolean).join(" ");
          return (
            <button
              type="button"
              role="gridcell"
              className={classes}
              key={square}
              onClick={() => selectSquare(square)}
              aria-label={`${square}${piece ? `, ${NAMES[piece.type]} ${piece.color === "w" ? "branco" : "preto"}` : ", vazia"}${isTarget ? ", destino válido" : ""}`}
            >
              {coordinates && ((flipped ? file === 7 : file === 0)) && <span className="coord rank">{square[1]}</span>}
              {coordinates && ((flipped ? rank === 7 : rank === 0)) && <span className="coord file">{square[0]}</span>}
              {piece && (
                <motion.span
                  key={`${piece.color}-${piece.type}-${square}`}
                  className="piece"
                  aria-hidden="true"
                  initial={!reducedMotion && lastMove?.to === square ? { opacity: 0, scale: .55, filter: "blur(4px)" } : false}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ type: "spring", duration: .3, bounce: 0 }}
                >
                  <ChessPiece type={piece.type} color={piece.color} />
                </motion.span>
              )}
              {isTarget && <span className={isCapture ? "capture-ring" : "move-dot"} aria-hidden="true" />}
              {effect && <span className={`effect-mark ${effect.type}`} title={effect.type === "shield" ? "Escudo Divino" : "Contra-ataque"}>{effect.type === "shield" ? <Shield size={16} /> : <Swords size={16} />}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
