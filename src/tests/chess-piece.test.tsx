import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Color, PieceSymbol } from "chess.js";
import { ChessPiece } from "../components/board/ChessPiece";

describe("peças vetoriais", () => {
  it("renderiza o conjunto completo sem depender de glifos do sistema", () => {
    const types: PieceSymbol[] = ["k", "q", "r", "b", "n", "p"];
    const colors: Color[] = ["w", "b"];
    const { container } = render(<>{colors.flatMap((color) => types.map((type) => <ChessPiece key={`${color}-${type}`} color={color} type={type} />))}</>);

    expect(container.querySelectorAll("svg.chess-piece-svg")).toHaveLength(12);
    expect(container.querySelectorAll("[data-piece='k']")).toHaveLength(2);
    expect(container.textContent).not.toMatch(/[♔♕♖♗♘♙♚♛♜♝♞♟]/);
  });
});
