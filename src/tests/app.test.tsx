import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App";
import { useGameStore } from "../store/gameStore";

describe("navegação e modos de jogo", () => {
  beforeEach(() => {
    useGameStore.setState((state) => ({
      screen: "menu",
      started: false,
      config: { ...state.config, opponent: "computer", difficulty: "medium", selectedModifiers: ["queen", "knight", "rook"] },
    }));
  });

  it("abre a academia e apresenta tutoriais e práticas", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /aprender xadrez/i }));
    await waitFor(() => expect(screen.getByRole("heading", { name: /aprenda xadrez.*jogando/i })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /praticar vs máquina/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /jogar com amigo/i })).toBeInTheDocument();
    expect(screen.getByText("O objetivo da partida")).toBeInTheDocument();
  });

  it("permite escolher partida local na preparação", () => {
    useGameStore.setState({ screen: "setup" });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /vs jogador/i }));
    expect(useGameStore.getState().config.opponent).toBe("local");
    expect(screen.getByText(/passe o dispositivo a cada turno/i)).toBeInTheDocument();
  });
});
