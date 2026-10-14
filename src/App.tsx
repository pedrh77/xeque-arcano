import { useEffect } from "react";
import { Chess } from "chess.js";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Bot, ChevronRight, Crown, FlipHorizontal2, RotateCcw, Sparkles, Swords, X } from "lucide-react";
import { ChessBoard } from "./components/board/ChessBoard";
import { AbilityCard } from "./components/abilities/AbilityCard";
import { ABILITIES, ABILITY_LIST } from "./game/abilities/registry";
import type { Difficulty, ModifierId } from "./game/models/types";
import { MODIFIERS, useGameStore } from "./store/gameStore";

function Brand() {
  return <div className="brand"><span className="brand-gem">♙</span><span><strong>PAWN</strong><em>STORM</em></span></div>;
}

function Menu() {
  const setScreen = useGameStore((s) => s.setScreen); const started = useGameStore((s) => s.started); const resume = useGameStore((s) => s.resumeGame);
  return <main className="landing">
    <div className="storm-grid" />
    <header className="topbar"><Brand /><button className="ghost-link" onClick={() => setScreen("collection")}>Poderes</button></header>
    <section className="hero">
      <motion.div className="hero-copy" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}>
        <span className="eyebrow"><Sparkles /> Xadrez reinventado</span>
        <h1>Peões pequenos.<br /><i>Poderes absurdos.</i></h1>
        <p>Você tem um rei, oito peões e zero obrigação de jogar limpo. Evolua sua tropa, quebre as regras e derrube o rei rival.</p>
        <div className="hero-actions"><button className="cta" onClick={() => setScreen("setup")}><Swords /> Montar meu deck <ChevronRight /></button>{started && <button className="secondary" onClick={resume}>Continuar partida</button>}</div>
        <div className="rule-pills"><span><b>8</b> peões</span><span><b>3</b> evoluções</span><span><b>5</b> poderes</span></div>
      </motion.div>
      <motion.div className="hero-cards" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}>
        <article className="splash-card card-a"><img src="/assets/powers/onda-de-impacto.png" alt="Onda de Impacto" /><span>Onda de Impacto</span></article>
        <article className="splash-card card-b"><img src="/assets/powers/pacto-de-protecao.png" alt="Pacto de Proteção" /><span>Pacto de Proteção</span></article>
        <article className="splash-card card-c"><img src="/assets/powers/golpe-arcano.png" alt="Golpe Arcano" /><span>Golpe Arcano</span></article>
      </motion.div>
    </section>
  </main>;
}

function Setup() {
  const config = useGameStore((s) => s.config); const toggle = useGameStore((s) => s.toggleConfigModifier); const update = useGameStore((s) => s.updateConfig); const start = useGameStore((s) => s.startGame); const setScreen = useGameStore((s) => s.setScreen);
  const selected = config.selectedModifiers ?? ["queen", "knight", "rook"];
  return <main className="draft-page">
    <header className="topbar"><button className="round-button" onClick={() => setScreen("menu")} aria-label="Voltar"><ArrowLeft /></button><Brand /><span className="step-label">PREPARAÇÃO</span></header>
    <section className="draft-shell">
      <div className="draft-heading"><span className="eyebrow">Etapa 1 de 1</span><h1>Escolha suas <i>3 evoluções</i></h1><p>Durante a partida, cada carta transforma um dos seus peões. Use cedo para pressionar ou guarde para surpreender.</p></div>
      <div className="modifier-grid">{(Object.entries(MODIFIERS) as [ModifierId, typeof MODIFIERS[ModifierId]][]).map(([id, item]) => {
        const active = selected.includes(id); const disabled = !active && selected.length >= 3;
        return <button key={id} className={`modifier-choice ${active ? "active" : ""}`} disabled={disabled} onClick={() => toggle(id)}>
          <img className="modifier-art" src={item.image} alt="" loading="lazy" decoding="async" /><span className="pick-count">{active ? "✓ escolhida" : "selecionar"}</span><strong>{item.name}</strong><small>{item.description}</small>
        </button>;
      })}</div>
      <div className="draft-footer"><div><span>Dificuldade</span><div className="segment">{(["easy", "medium", "hard"] as Difficulty[]).map((level) => <button key={level} className={config.difficulty === level ? "active" : ""} onClick={() => update({ difficulty: level })}>{level === "easy" ? "Leve" : level === "medium" ? "Tática" : "Brutal"}</button>)}</div></div><button className="cta" disabled={selected.length !== 3} onClick={start}>Sortear 5 poderes e jogar <ChevronRight /></button></div>
    </section>
  </main>;
}

function Game() {
  const fen = useGameStore((s) => s.fen); const config = useGameStore((s) => s.config); const notice = useGameStore((s) => s.notice); const thinking = useGameStore((s) => s.aiThinking); const runAi = useGameStore((s) => s.runAi); const restart = useGameStore((s) => s.restart); const resign = useGameStore((s) => s.resign); const flip = useGameStore((s) => s.toggleFlip);
  const hands = useGameStore((s) => s.hands); const modifiers = useGameStore((s) => s.modifiers); const selectedAbility = useGameStore((s) => s.selectedAbility); const selectedModifier = useGameStore((s) => s.selectedModifier); const pending = useGameStore((s) => s.pendingAction); const selectAbility = useGameStore((s) => s.selectAbility); const selectModifier = useGameStore((s) => s.selectModifier); const confirm = useGameStore((s) => s.confirmAbility); const cancel = useGameStore((s) => s.cancelSelection); const history = useGameStore((s) => s.history);
  const chess = new Chess(fen); const turn = chess.turn(); const mine = turn === config.playerColor;
  useEffect(() => { if (config.opponent === "computer" && !mine) runAi(); }, [fen, config.opponent, mine, runAi]);
  return <main className="arena-page">
    <header className="game-topbar"><Brand /><div className="turn-status"><span className={`turn-orb ${turn}`} /> <b>{thinking ? "RIVAL PENSANDO" : mine ? "SUA VEZ" : "VEZ DO RIVAL"}</b><small>{turn === "w" ? "Brancas" : "Pretas"}</small></div><div className="top-actions"><button onClick={flip} aria-label="Inverter"><FlipHorizontal2 /></button><button onClick={restart} aria-label="Reiniciar"><RotateCcw /></button><button className="resign" onClick={resign}>Desistir</button></div></header>
    <div className="arena-layout">
      <section className="board-zone"><div className="mission"><span>OBJETIVO</span><strong>Capture o rei inimigo</strong><small>{notice ?? "Escolha sua jogada."}</small></div><ChessBoard /><div className="timeline">{history.slice(-4).map((h) => <span key={h.id}><b>{h.color === "w" ? "○" : "●"}</b>{h.notation}</span>)}</div></section>
      <aside className="command-panel">
        <section><div className="panel-heading"><span>EVOLUÇÕES</span><b>{modifiers[turn].filter((m) => !m.used).length}/3</b></div><div className="modifier-hand">{modifiers[turn].map((card) => { const item = MODIFIERS[card.id]; return <button key={card.id} disabled={card.used || !mine} className={`${selectedModifier === card.id ? "active" : ""} ${card.used ? "used" : ""}`} onClick={() => selectModifier(selectedModifier === card.id ? undefined : card.id)}><img src={item.image} alt="" loading="lazy" decoding="async" /><b>{item.name}</b><small>{card.used ? "usada" : "evoluir peão"}</small></button>; })}</div></section>
        <section className="deck-section"><div className="panel-heading"><span>SEU DECK</span><b>5 cartas sorteadas</b></div><div className="power-deck">{hands[turn].map((ability) => <AbilityCard key={ability.id} ability={ability} compact selected={selectedAbility === ability.id} onSelect={mine ? () => selectAbility(selectedAbility === ability.id ? undefined : ability.id) : undefined} />)}</div></section>
        <AnimatePresence>{selectedAbility && <motion.div className="power-confirm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><button onClick={cancel} aria-label="Cancelar"><X /></button><span><small>{ABILITIES[selectedAbility].rarity}</small><strong>{ABILITIES[selectedAbility].name}</strong><p>{pending ? "Alvo pronto. Confirme para gastar a carta." : ABILITIES[selectedAbility].description}</p></span><button className="confirm" disabled={!pending} onClick={confirm}>ATIVAR</button></motion.div>}</AnimatePresence>
        <div className="howto"><Sparkles /><span><b>Como jogar</b><small>Mover uma peça, evoluir ou ativar poder encerra seu turno.</small></span></div>
      </aside>
    </div>
  </main>;
}

function Collection() {
  const setScreen = useGameStore((s) => s.setScreen);
  return <main className="collection-page"><header className="topbar"><button className="round-button" onClick={() => setScreen("menu")}><ArrowLeft /></button><Brand /><span /></header><section className="collection-shell"><span className="eyebrow">Arsenal completo</span><h1>{ABILITY_LIST.length} formas de <i>quebrar o jogo</i></h1><div className="gallery">{ABILITY_LIST.map((ability) => <article key={ability.id}><img src={ability.image} alt="" /><span>{ability.rarity}</span><h2>{ability.name}</h2><p>{ability.description}</p></article>)}</div></section></main>;
}

function Result() {
  const result = useGameStore((s) => s.result); const restart = useGameStore((s) => s.restart); const setScreen = useGameStore((s) => s.setScreen);
  return <main className="result-page"><span className="result-piece"><Crown /></span><span className="eyebrow">Fim da tempestade</span><h1>{result?.title ?? "Partida encerrada"}</h1><p>{result?.detail}</p><div className="hero-actions"><button className="cta" onClick={restart}><RotateCcw /> Jogar de novo</button><button className="secondary" onClick={() => setScreen("menu")}>Menu</button></div></main>;
}

export default function App() {
  const screen = useGameStore((s) => s.screen); const page = screen === "menu" ? <Menu /> : screen === "setup" ? <Setup /> : screen === "game" ? <Game /> : screen === "collection" ? <Collection /> : screen === "result" ? <Result /> : <Menu />;
  return <AnimatePresence mode="wait"><motion.div key={screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>{page}</motion.div></AnimatePresence>;
}
