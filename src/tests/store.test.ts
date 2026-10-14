import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "../store/gameStore";

describe("fluxo transacional da loja", () => {
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
});
