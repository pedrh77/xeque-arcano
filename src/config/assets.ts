export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const ABILITY_ASSETS = {
  doubleJump: assetUrl("assets/powers/salto-duplo.png"),
  ghostStep: assetUrl("assets/powers/passo-fantasma.png"),
  invertedKnight: assetUrl("assets/powers/onda-de-choque.png"),
  charge: assetUrl("assets/powers/investida-arcana.png"),
  freeMovement: assetUrl("assets/powers/ascensao.png"),
  teleport: assetUrl("assets/powers/teletransporte.png"),
  diagonalDance: assetUrl("assets/powers/danca-diagonal.png"),
  kingStep: assetUrl("assets/powers/escudo-prismatico.png"),
  divineShield: assetUrl("assets/powers/escudo-cristalino.png"),
  counterAttack: assetUrl("assets/powers/contra-golpe.png"),
  arcaneStrike: assetUrl("assets/powers/golpe-arcano.png"),
  pawnEcho: assetUrl("assets/powers/eco-do-peao.png"),
  royalGuard: assetUrl("assets/powers/guarda-real.png"),
  shockwave: assetUrl("assets/powers/onda-de-impacto.png"),
  sacrificeWard: assetUrl("assets/powers/pacto-de-protecao.png"),
  phaseDiagonal: assetUrl("assets/powers/corte-espectral.png"),
} as const;
