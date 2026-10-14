import { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { ABILITIES } from "../../game/abilities/registry";
import type { AbilityState } from "../../game/models/types";

const failedImages = new Set<string>();

interface Props {
  ability: AbilityState;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

export function AbilityCard({ ability, selected, onSelect, compact }: Props) {
  const definition = ABILITIES[ability.id];
  const [imageFailed, setImageFailed] = useState(() => failedImages.has(definition.image));
  const disabled = ability.usesLeft === 0;
  const rarityClass = definition.rarity.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return (
    <motion.button
      type="button"
      className={`ability-card rarity-${rarityClass} ${selected ? "is-selected" : ""} ${compact ? "is-compact" : ""}`}
      onClick={onSelect}
      disabled={disabled || !onSelect}
      animate={selected ? { y: -2, scale: 1.02 } : { y: 0, scale: 1 }}
      transition={{ type: "spring", duration: .3, bounce: 0 }}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      aria-pressed={selected}
      aria-label={`${definition.name}. ${definition.description}. ${ability.usesLeft} uso restante.`}
    >
      <span className="ability-art" aria-hidden="true">
        {!imageFailed ? (
          <img src={definition.image} alt="" loading="lazy" onError={() => { failedImages.add(definition.image); setImageFailed(true); }} />
        ) : (
          <span className="ability-placeholder"><Sparkles size={compact ? 18 : 26} strokeWidth={1.6} /></span>
        )}
        <span className="ability-rarity">{definition.rarity}</span>
      </span>
      <span className="ability-copy">
        <strong>{definition.name}</strong>
        {!compact && <small>{definition.category}</small>}
        {!compact && <span>{definition.description}</span>}
      </span>
      <span className="ability-uses">{disabled ? "Esgotada" : `${ability.usesLeft} uso`}</span>
    </motion.button>
  );
}
