/**
 * Rating Presets Index
 * Exports all category presets
 * v0.38.5 - Category-Adaptive Rating Templates
 */

import { snackPreset } from './snack';
import { outfitPreset } from './outfit';
import { carPreset } from './car';
import { roomPreset } from './room';
import { giftPreset } from './gift';
import { petPreset } from './pet';

export const PRESETS = {
  snack: snackPreset,
  outfit: outfitPreset,
  car: carPreset,
  room: roomPreset,
  gift: giftPreset,
  pet: petPreset,
};

export type CategoryPreset = typeof snackPreset;

