/**
 * Chronicle Generator
 * Compiles weekly world stats from various game systems
 * v0.36.43 - World Chronicle 2.0
 */
import { ChronicleStatsSnapshot, ChronicleGenerationInput, ChronicleGenerationResult } from './types';
/**
 * Generate chronicle stats snapshot
 * Pulls data from missions, combat, market, social systems
 * Uses simple queries for performance
 */
export declare function generateChronicleStats(input: ChronicleGenerationInput): Promise<ChronicleStatsSnapshot>;
/**
 * Generate and save chronicle entry
 */
export declare function generateChronicle(input: ChronicleGenerationInput): Promise<ChronicleGenerationResult>;
