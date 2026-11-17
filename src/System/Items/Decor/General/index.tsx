/**
 * System Items - Decor Module
 * Environmental background props and decorative assets.
 */

export interface DecorSpec {
  id: string;
  name: string;
  scale: number;
}

export const DECOR_ITEMS: Record<string, DecorSpec> = {
  lantern: { id: 'lantern', name: 'Rustic Lantern', scale: 1.0 },
  banner: { id: 'banner', name: 'Rider Crest Banner', scale: 1.5 }
};
