/**
 * System Items - Goat Treats Module
 * Scientific definition of nutritious goat treats to gobble during gameplay!
 */

export interface GoatTreatSpec {
  id: string;
  name: string;
  points: number;
  speedBoostDurationMs: number;
  color: string;
  iconSymbol: string;
  nutritionInfo: string;
}

export const GOAT_TREATS: Record<string, GoatTreatSpec> = {
  clover: {
    id: 'clover',
    name: 'Sweet Clover',
    points: 25,
    speedBoostDurationMs: 1500,
    color: '#22c55e',
    iconSymbol: '☘️',
    nutritionInfo: 'High protein clover legume favoured by mountain breeds.'
  },
  golden_apple: {
    id: 'golden_apple',
    name: 'Golden Apple',
    points: 100,
    speedBoostDurationMs: 3000,
    color: '#eab308',
    iconSymbol: '🍎',
    nutritionInfo: 'Rich fructose crunchy apple for instant stamina burst.'
  },
  alfalfa: {
    id: 'alfalfa',
    name: 'Alfalfa Crunch',
    points: 30,
    speedBoostDurationMs: 1200,
    color: '#84cc16',
    iconSymbol: '🌿',
    nutritionInfo: 'Sun-cured premium fiber pellet for digestive energy.'
  },
  salt_lick: {
    id: 'salt_lick',
    name: 'Mineral Salt Block',
    points: 50,
    speedBoostDurationMs: 2000,
    color: '#ec4899',
    iconSymbol: '🧊',
    nutritionInfo: 'Essential sodium and trace minerals for muscular stamina.'
  },
  barley: {
    id: 'barley',
    name: 'Barley Crisp',
    points: 40,
    speedBoostDurationMs: 1800,
    color: '#f97316',
    iconSymbol: '🌾',
    nutritionInfo: 'Complex carbohydrates for sustained trotting power.'
  },
  berry: {
    id: 'berry',
    name: 'Wild Alpine Berry',
    points: 35,
    speedBoostDurationMs: 1000,
    color: '#a855f7',
    iconSymbol: '🫐',
    nutritionInfo: 'Antioxidant-dense wild berry gathered from mountain slopes.'
  },
  carrot: {
    id: 'carrot',
    name: 'Crispy Carrot Slice',
    points: 45,
    speedBoostDurationMs: 1600,
    color: '#f97316',
    iconSymbol: '🥕',
    nutritionInfo: 'Beta-carotene crunchy root vegetable treat.'
  }
};

export function getRandomTreat(seed: number): GoatTreatSpec {
  const keys = Object.keys(GOAT_TREATS);
  const index = Math.abs(seed) % keys.length;
  return GOAT_TREATS[keys[index]];
}
