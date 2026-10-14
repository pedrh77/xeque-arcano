import { Chess } from "chess.js";
import { motion } from "motion/react";
import { SQUARES } from "../../game/engine/engine";
import type { TutorialStep } from "../../game/tutorials";
import { ChessPiece } from "../board/ChessPiece";

export function TutorialBoard({ step, reducedMotion }: { step: TutorialStep; reducedMotion: boolean }) {
  const chess = new Chess(step.fen);
  return <div className="lesson-board" role="img" aria-label={`Exemplo no tabuleiro: ${step.title}`}>
    {SQUARES.map((square) => {
      const file = square.charCodeAt(0) - 97;
      const rank = Number(square[1]) - 1;
      const piece = chess.get(square);
      const highlighted = step.highlights.includes(square);
      const from = step.move?.from === square;
      const to = step.move?.to === square;
      return <span key={square} className={`lesson-square ${(file + rank) % 2 === 1 ? "light" : "dark"} ${highlighted ? "highlighted" : ""} ${from ? "path-from" : ""} ${to ? "path-to" : ""}`}>
        {piece && <motion.span key={`${step.title}-${square}-${piece.type}`} className="lesson-piece" initial={reducedMotion ? false : { opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .22 }}><ChessPiece type={piece.type} color={piece.color} /></motion.span>}
        {(from || to) && <small>{square}</small>}
      </span>;
    })}
  </div>;
}
