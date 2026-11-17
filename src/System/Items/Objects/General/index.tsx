/**
 * System Items - Objects Module
 * Interactive non-obstacle items like speed boost pads, score multipliers, and dynamic signposts.
 */

export interface ItemObjectSpec {
  id: string;
  category: 'boost' | 'checkpoint' | 'signpost';
  label: string;
}

export const ITEM_OBJECTS: Record<string, ItemObjectSpec> = {
  speed_pad: { id: 'speed_pad', category: 'boost', label: 'Gallop Boost Pad' },
  checkpoint_flag: { id: 'checkpoint_flag', category: 'checkpoint', label: 'Milestone Flag' }
};
