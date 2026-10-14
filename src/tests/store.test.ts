import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POWER_START_FEN, useGameStore } from "../store/gameStore";

describe("fluxo transacional da loja", () => {
  afterEach(() => vi.useRealTimers());

  beforeEach(() => {
    vi.restoreAllMocks();
    useGameStore.setState({
      config: { mode: "powers", opponent: "local", difficulty: "medium", playerColor: "w", startingAbilities: 3 },
      screen: "menu",
      started: false,
      reducedMotion: true,
    });
    useGameStore.getState().startGame();
  });

  it("confirma exatamente a ação preparada", () => {
    const hands = useGameStore.getState().hands;
    useGameStore.setState({ hands: { ...hands, w: [{ id: "charge", usesLeft: 1, status: "available" }] } });
    useGameStore.getState().selectAbility("charge");
    useGameStore.getState().selectSquare("e2");
    useGameStore.getState().selectSquare("e4");
    expect(useGameStore.getState().pendingAction).toEqual({ abilityId: "charge", from: "e2", to: "e4" });
    useGameStore.getState().confirmAbility();
    expect(useGameStore.getState().history[0].notation).toContain("e2–e4");
    expect(useGameStore.getState().hands.w[0].usesLeft).toBe(0);
  });

  it("não consome habilidade quando ação não foi confirmada", () => {
    const hands = useGameStore.getState().hands;
    useGameStore.setState({ hands: { ...hands, w: [{ id: "teleport", usesLeft: 1, status: "available" }] } });
    useGameStore.getState().selectAbility("teleport");
    useGameStore.getState().selectSquare("e2");
    useGameStore.getState().cancelSelection();
    expect(useGameStore.getState().hands.w[0].usesLeft).toBe(1);
    expect(useGameStore.getState().history).toHaveLength(0);
  });

  it("IA conclui poder sem destino e libera o turno", () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    useGameStore.setState((state) => ({
      config: { ...state.config, opponent: "computer", playerColor: "w" },
      screen: "game",
      started: true,
      fen: POWER_START_FEN.replace(" w ", " b "),
      aiThinking: false,
      result: undefined,
      hands: { ...state.hands, b: [{ id: "divineShield", usesLeft: 1, status: "available" }] },
      modifiers: { ...state.modifiers, b: state.modifiers.b.map((card) => ({ ...card, used: true })) },
    }));

    useGameStore.getState().runAi();
    vi.runAllTimers();

    const state = useGameStore.getState();
    expect(state.aiThinking).toBe(false);
    expect(state.hands.b[0].usesLeft).toBe(0);
    expect(state.effects.some((effect) => effect.type === "shield" && effect.color === "b")).toBe(true);
    expect(state.notice).toContain("Escudo Cristalino usado pelo rival");
  });

  it("IA encerra a partida quando não existe ação possível", () => {
    vi.useFakeTimers();
    useGameStore.setState((state) => ({
      config: { ...state.config, opponent: "computer", playerColor: "b" },
      screen: "game",
      started: true,
      fen: "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3",
      aiThinking: false,
      result: undefined,
      hands: { ...state.hands, w: [] },
    }));

    useGameStore.getState().runAi();
    vi.runAllTimers();

    const state = useGameStore.getState();
    expect(state.aiThinking).toBe(false);
    expect(state.screen).toBe("result");
    expect(state.result).toEqual({ title: "Vitória das pretas", detail: "Xeque-mate" });
  });
});
