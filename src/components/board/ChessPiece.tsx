import type { Color, PieceSymbol } from "chess.js";

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  className?: string;
}

function PieceShape({ type }: { type: PieceSymbol }) {
  switch (type) {
    case "p":
      return <>
        <circle cx="50" cy="25" r="14" />
        <path d="M39 42h22l5 29H34z" />
        <path d="M29 72h42l6 12H23z" />
        <path className="piece-detail" d="M37 48h26M31 72h38" />
      </>;
    case "r":
      return <>
        <path d="M24 17h13v10h9V17h9v10h9V17h13v25H24z" />
        <path d="M31 42h38l-4 31H35z" />
        <path d="M27 72h46l6 12H21z" />
        <path className="piece-detail" d="M28 42h44M34 71h32" />
      </>;
    case "b":
      return <>
        <path d="M50 13c13 10 21 20 21 32 0 11-7 18-15 23H44c-9-5-15-12-15-23 0-12 8-22 21-32z" />
        <path d="M33 65h34l5 10H28z" />
        <path d="M25 75h50l6 10H19z" />
        <path className="piece-cut" d="M58 27 42 48" />
        <path className="piece-detail" d="M33 65h34M28 75h44" />
      </>;
    case "n":
      return <>
        <path d="M29 69c3-11 8-19 17-27l-8-5 8-20 8 10c17 3 24 17 20 34l-8 12H36z" />
        <path d="M33 69h37l7 15H23z" />
        <circle className="piece-eye" cx="59" cy="39" r="3.2" />
        <path className="piece-detail" d="M40 54c8-1 15 1 20 6M32 70h40" />
      </>;
    case "q":
      return <>
        <circle cx="22" cy="23" r="5" />
        <circle cx="50" cy="14" r="5" />
        <circle cx="78" cy="23" r="5" />
        <path d="m22 27 13 16 15-23 15 23 13-16-8 37H30z" />
        <path d="M29 62h42l4 12H25z" />
        <path d="M22 74h56l5 11H17z" />
        <path className="piece-detail" d="M30 62h40M25 74h50" />
      </>;
    case "k":
      return <>
        <path d="M46 10h8v10h10v8H54v10h-8V28H36v-8h10z" />
        <path d="M32 36h36l7 16-12 13H37L25 52z" />
        <path d="M35 64h30l7 11H28z" />
        <path d="M24 75h52l6 10H18z" />
        <path className="piece-detail" d="M28 51h44M35 64h30M28 75h44" />
      </>;
  }
}

export function ChessPiece({ type, color, className = "" }: ChessPieceProps) {
  return <svg
    className={`chess-piece-svg piece-${color} ${className}`.trim()}
    viewBox="0 0 100 100"
    aria-hidden="true"
    focusable="false"
    data-piece={type}
    data-color={color}
  >
    <g className="piece-body"><PieceShape type={type} /></g>
  </svg>;
}
