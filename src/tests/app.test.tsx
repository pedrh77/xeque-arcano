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

  it("mostra três espaços e permite remontar o trio", () => {
    useGameStore.setState({ screen: "setup" });
    render(<App />);

    expect(screen.getByRole("region", { name: /evoluções escolhidas/i })).toHaveTextContent("3/3");
    fireEvent.click(screen.getByRole("button", { name: /remover coroa da rainha/i }));
    expect(useGameStore.getState().config.selectedModifiers).toEqual(["knight", "rook"]);
    expect(screen.getByRole("button", { name: /sortear 5 poderes e jogar/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /olhar do bispo/i }));
    expect(useGameStore.getState().config.selectedModifiers).toEqual(["knight", "rook", "bishop"]);
    expect(screen.getByRole("button", { name: /sortear 5 poderes e jogar/i })).toBeEnabled();
  });
});
