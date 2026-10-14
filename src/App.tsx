import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, BookOpen, Bot, ChevronLeft, ChevronRight, Crown, FlipHorizontal2, GraduationCap, RotateCcw, Sparkles, Swords, Users, X } from "lucide-react";
import { ChessBoard } from "./components/board/ChessBoard";
import { AbilityCard } from "./components/abilities/AbilityCard";
import { ABILITIES, ABILITY_LIST } from "./game/abilities/registry";
import type { Difficulty, ModifierId } from "./game/models/types";
import { MODIFIERS, useGameStore } from "./store/gameStore";
import { assetUrl } from "./config/assets";
import { TUTORIALS } from "./game/tutorials";
import { TutorialBoard } from "./components/tutorial/TutorialBoard";
import { ChessPiece } from "./components/board/ChessPiece";

function Brand() {
  return <div className="brand"><span className="brand-gem"><ChessPiece type="p" color="b" className="brand-piece" /></span><span><strong>PAWN</strong><em>STORM</em></span></div>;
}

function Menu() {
  const setScreen = useGameStore((s) => s.setScreen); const started = useGameStore((s) => s.started); const resume = useGameStore((s) => s.resumeGame);
  return <main className="landing">
    <div className="storm-grid" />
    <header className="topbar"><Brand /><nav className="topnav" aria-label="Navegação principal"><button className="ghost-link" onClick={() => setScreen("learn")}>Aprenda</button><button className="ghost-link" onClick={() => setScreen("collection")}>Poderes</button></nav></header>
    <section className="hero">
      <motion.div className="hero-copy" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}>
        <span className="eyebrow"><Sparkles /> Xadrez reinventado</span>
        <h1>Peões pequenos.<br /><i>Poderes absurdos.</i></h1>
        <p>Você tem um rei, oito peões e zero obrigação de jogar limpo. Evolua sua tropa, quebre as regras e derrube o rei rival.</p>
        <div className="hero-actions"><button className="cta" onClick={() => setScreen("setup")}><Swords /> Montar meu deck <ChevronRight /></button><button className="secondary" onClick={() => setScreen("learn")}><GraduationCap /> Aprender xadrez</button>{started && <button className="secondary" onClick={resume}>Continuar partida</button>}</div>
        <div className="rule-pills"><span><b>8</b> peões</span><span><b>3</b> evoluções</span><span><b>5</b> poderes</span></div>
      </motion.div>
      <motion.div className="hero-cards" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}>
        <article className="splash-card card-a"><img src={assetUrl("assets/powers/onda-de-impacto.png")} alt="Onda de Impacto" /><span>Onda de Impacto</span></article>
        <article className="splash-card card-b"><img src={assetUrl("assets/powers/pacto-de-protecao.png")} alt="Pacto de Proteção" /><span>Pacto de Proteção</span></article>
        <article className="splash-card card-c"><img src={assetUrl("assets/powers/golpe-arcano.png")} alt="Golpe Arcano" /><span>Golpe Arcano</span></article>
      </motion.div>
    </section>
  </main>;
}

function Learn() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const setScreen = useGameStore((s) => s.setScreen);
  const updateConfig = useGameStore((s) => s.updateConfig);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const lesson = TUTORIALS[lessonIndex];
  const step = lesson.steps[stepIndex];
  const chooseLesson = (index: number) => { setLessonIndex(index); setStepIndex(0); };
  const practice = (opponent: "computer" | "local") => { updateConfig({ opponent }); setScreen("setup"); };
  const next = () => {
    if (stepIndex < lesson.steps.length - 1) setStepIndex((value) => value + 1);
    else if (lessonIndex < TUTORIALS.length - 1) chooseLesson(lessonIndex + 1);
  };
  const previous = () => {
    if (stepIndex > 0) setStepIndex((value) => value - 1);
    else if (lessonIndex > 0) { const previousLesson = TUTORIALS[lessonIndex - 1]; setLessonIndex(lessonIndex - 1); setStepIndex(previousLesson.steps.length - 1); }
  };

  return <main className="learn-page">
    <header className="topbar"><button className="round-button" onClick={() => setScreen("menu")} aria-label="Voltar ao menu"><ArrowLeft /></button><Brand /><span className="step-label">ACADEMIA</span></header>
    <section className="learn-intro">
      <div><span className="learn-mark"><GraduationCap /></span><h1>Aprenda xadrez<br /><i>jogando.</i></h1><p>Do primeiro movimento ao xeque-mate — e depois, às regras impossíveis do Pawn Storm.</p></div>
      <div className="practice-choices"><button className="practice-machine" onClick={() => practice("computer")}><Bot /><span><b>Praticar vs máquina</b><small>Escolha a dificuldade e jogue no seu ritmo.</small></span><ChevronRight /></button><button onClick={() => practice("local")}><Users /><span><b>Jogar com amigo</b><small>Duas pessoas, um dispositivo, turnos alternados.</small></span><ChevronRight /></button></div>
    </section>
    <section className="learn-shell">
      <aside className="lesson-index" aria-label="Tutoriais">
        <div className="lesson-index-title"><BookOpen /><span><b>Trilha essencial</b><small>{TUTORIALS.length} lições curtas</small></span></div>
        {TUTORIALS.map((item, index) => <button key={item.id} className={index === lessonIndex ? "active" : ""} onClick={() => chooseLesson(index)}><span>{index + 1}</span><b>{item.title}</b><small>{item.duration}</small></button>)}
      </aside>
      <article className="lesson-stage">
        <div className="lesson-progress"><span>Lição {lessonIndex + 1} de {TUTORIALS.length}</span><div>{lesson.steps.map((_, index) => <i key={index} className={index <= stepIndex ? "filled" : ""} />)}</div><b>{lesson.duration}</b></div>
        <div className="lesson-workbench">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="lesson-visual" key={`${lesson.id}-${stepIndex}`} initial={reducedMotion ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={reducedMotion ? undefined : { opacity: 0, x: 12 }} transition={{ duration: .22 }}><TutorialBoard step={step} reducedMotion={reducedMotion} /></motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="lesson-copy" key={`${lesson.id}-copy-${stepIndex}`} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: .2 }}>
              <span>PASSO {stepIndex + 1} / {lesson.steps.length}</span><h2>{step.title}</h2><p>{step.body}</p><blockquote><Sparkles /> <span><b>Pense assim</b>{step.tip}</span></blockquote>
            </motion.div>
          </AnimatePresence>
        </div>
        <footer className="lesson-controls"><button className="secondary" disabled={lessonIndex === 0 && stepIndex === 0} onClick={previous}><ChevronLeft /> Anterior</button><button className="cta" onClick={stepIndex === lesson.steps.length - 1 && lessonIndex === TUTORIALS.length - 1 ? () => practice("computer") : next}>{stepIndex === lesson.steps.length - 1 && lessonIndex === TUTORIALS.length - 1 ? <><Bot /> Praticar agora</> : <>Continuar <ChevronRight /></>}</button></footer>
      </article>
    </section>
  </main>;
}

function Setup() {
  const config = useGameStore((s) => s.config); const toggle = useGameStore((s) => s.toggleConfigModifier); const update = useGameStore((s) => s.updateConfig); const start = useGameStore((s) => s.startGame); const setScreen = useGameStore((s) => s.setScreen);
  const selected = config.selectedModifiers ?? ["queen", "knight", "rook"];
  return <main className="draft-page">
    <header className="topbar"><button className="round-button" onClick={() => setScreen("menu")} aria-label="Voltar"><ArrowLeft /></button><Brand /><span className="step-label">PREPARAÇÃO</span></header>
    <section className="draft-shell">
      <div className="draft-heading"><span className="eyebrow">Prepare a partida</span><h1>Escolha como jogar e suas <i>3 evoluções</i></h1><p>Enfrente a máquina ou divida o tabuleiro com um amigo. Depois, monte o trio que transforma seus peões.</p></div>
      <div className="play-mode-picker" aria-label="Modo de jogo"><button className={config.opponent === "computer" ? "active" : ""} onClick={() => update({ opponent: "computer" })}><Bot /><span><b>Vs máquina</b><small>IA com três dificuldades</small></span></button><button className={config.opponent === "local" ? "active" : ""} onClick={() => update({ opponent: "local" })}><Users /><span><b>Vs jogador</b><small>Dois jogadores no mesmo dispositivo</small></span></button></div>
      <div className="modifier-grid">{(Object.entries(MODIFIERS) as [ModifierId, typeof MODIFIERS[ModifierId]][]).map(([id, item]) => {
        const active = selected.includes(id); const disabled = !active && selected.length >= 3;
        return <button key={id} className={`modifier-choice ${active ? "active" : ""}`} disabled={disabled} onClick={() => toggle(id)}>
          <img className="modifier-art" src={item.image} alt="" loading="lazy" decoding="async" /><span className="pick-count">{active ? "✓ escolhida" : "selecionar"}</span><strong>{item.name}</strong><small>{item.description}</small>
        </button>;
      })}</div>
      <div className="draft-footer"><div>{config.opponent === "computer" ? <><span>Dificuldade</span><div className="segment">{(["easy", "medium", "hard"] as Difficulty[]).map((level) => <button key={level} className={config.difficulty === level ? "active" : ""} onClick={() => update({ difficulty: level })}>{level === "easy" ? "Leve" : level === "medium" ? "Tática" : "Brutal"}</button>)}</div></> : <><span>Partida local</span><small className="local-note">As brancas começam; passe o dispositivo a cada turno.</small></>}</div><button className="cta" disabled={selected.length !== 3} onClick={start}>Sortear 5 poderes e jogar <ChevronRight /></button></div>
    </section>
  </main>;
}

function Game() {
  const fen = useGameStore((s) => s.fen); const config = useGameStore((s) => s.config); const notice = useGameStore((s) => s.notice); const thinking = useGameStore((s) => s.aiThinking); const reducedMotion = useGameStore((s) => s.reducedMotion); const runAi = useGameStore((s) => s.runAi); const restart = useGameStore((s) => s.restart); const resign = useGameStore((s) => s.resign); const flip = useGameStore((s) => s.toggleFlip);
  const hands = useGameStore((s) => s.hands); const modifiers = useGameStore((s) => s.modifiers); const selectedAbility = useGameStore((s) => s.selectedAbility); const selectedModifier = useGameStore((s) => s.selectedModifier); const pending = useGameStore((s) => s.pendingAction); const selectAbility = useGameStore((s) => s.selectAbility); const selectModifier = useGameStore((s) => s.selectModifier); const confirm = useGameStore((s) => s.confirmAbility); const cancel = useGameStore((s) => s.cancelSelection); const history = useGameStore((s) => s.history);
  const chess = new Chess(fen); const turn = chess.turn(); const mine = config.opponent === "local" || turn === config.playerColor;
  const turnLabel = config.opponent === "local" ? `VEZ DAS ${turn === "w" ? "BRANCAS" : "PRETAS"}` : thinking ? "RIVAL PENSANDO" : mine ? "SUA VEZ" : "VEZ DO RIVAL";
  useEffect(() => { if (config.opponent === "computer" && !mine) runAi(); }, [fen, config.opponent, mine, runAi]);
  return <main className="arena-page">
    <header className="game-topbar"><Brand /><div className={`turn-status ${thinking ? "is-thinking" : ""}`}><span className={`turn-orb ${turn}`} /> <b>{turnLabel}</b><small>{config.opponent === "local" ? "Partida local" : turn === "w" ? "Brancas" : "Pretas"}</small></div><div className="top-actions"><button onClick={flip} aria-label="Inverter"><FlipHorizontal2 /></button><button onClick={restart} aria-label="Reiniciar"><RotateCcw /></button><button className="resign" onClick={resign}>Desistir</button></div></header>
    <div className="arena-layout">
      <section className="board-zone">
        {history.at(-1)?.ability && <motion.span key={history.at(-1)!.id} className="power-burst" aria-hidden="true" initial={reducedMotion ? false : { opacity: 0, scale: .4 }} animate={reducedMotion ? { opacity: 0 } : { opacity: [0, .85, 0], scale: [.4, 1.05, 1.22] }} transition={{ duration: .65, ease: "easeOut" }} />}
        <div className="mission"><span>OBJETIVO</span><strong>Capture o rei inimigo</strong><AnimatePresence initial={false} mode="wait"><motion.small key={notice ?? "default"} initial={reducedMotion ? false : { opacity: 0, scale: .25, filter: "blur(4px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={reducedMotion ? undefined : { opacity: 0, y: -4 }} transition={{ type: "spring", duration: .3, bounce: 0 }}>{notice ?? "Escolha sua jogada."}</motion.small></AnimatePresence></div><ChessBoard /><div className="timeline">{history.slice(-4).map((h) => <motion.span key={h.id} initial={reducedMotion ? false : { opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .2, ease: "easeOut" }}><b>{h.color === "w" ? "○" : "●"}</b>{h.notation}</motion.span>)}</div>
      </section>
      <aside className="command-panel">
        <section><div className="panel-heading"><span>EVOLUÇÕES</span><b>{modifiers[turn].filter((m) => !m.used).length}/3</b></div><div className="modifier-hand">{modifiers[turn].map((card) => { const item = MODIFIERS[card.id]; return <button key={card.id} disabled={card.used || !mine} className={`${selectedModifier === card.id ? "active" : ""} ${card.used ? "used" : ""}`} onClick={() => selectModifier(selectedModifier === card.id ? undefined : card.id)}><img src={item.image} alt="" loading="lazy" decoding="async" /><b>{item.name}</b><small>{card.used ? "usada" : "evoluir peão"}</small></button>; })}</div></section>
        <section className="deck-section"><div className="panel-heading"><span>{config.opponent === "local" ? `DECK ${turn === "w" ? "DAS BRANCAS" : "DAS PRETAS"}` : "SEU DECK"}</span><b>5 cartas sorteadas</b></div><div className="power-deck">{hands[turn].map((ability) => <AbilityCard key={ability.id} ability={ability} compact selected={selectedAbility === ability.id} onSelect={mine ? () => selectAbility(selectedAbility === ability.id ? undefined : ability.id) : undefined} />)}</div></section>
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
  const screen = useGameStore((s) => s.screen); const page = screen === "menu" ? <Menu /> : screen === "learn" ? <Learn /> : screen === "setup" ? <Setup /> : screen === "game" ? <Game /> : screen === "collection" ? <Collection /> : screen === "result" ? <Result /> : <Menu />;
  return <AnimatePresence mode="wait"><motion.div key={screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>{page}</motion.div></AnimatePresence>;
}
