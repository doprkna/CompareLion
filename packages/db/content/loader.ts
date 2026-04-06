/**
 * Content pack loader v1
 * C10 - Content Pack Packaging
 *
 * Discovers packs, reads manifest + content files, returns normalized data.
 * Runs in Node (seeding). Uses process.cwd() to resolve content-packs by default.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { PackManifest, FlowQuestionRecord, PollRecord } from './types';

const DEFAULT_PACKS_DIR = 'content-packs';

function getPacksDir(): string {
  const fromEnv = process.env.CONTENT_PACKS_DIR;
  if (fromEnv) return path.isAbsolute(fromEnv) ? fromEnv : path.join(process.cwd(), fromEnv);
  return path.join(process.cwd(), DEFAULT_PACKS_DIR);
}

/**
 * Load manifest from pack folder
 */
export function loadPackManifest(packPath: string): PackManifest {
  const manifestPath = path.join(packPath, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Content pack manifest not found: ${manifestPath}`);
  }
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  const m = JSON.parse(raw) as PackManifest;
  if (!m.packKey || m.schemaVersion === undefined) {
    throw new Error(`Invalid manifest: packKey and schemaVersion required`);
  }
  return m;
}

/**
 * Parse JSONL file into array of records
 */
function loadJsonl<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n').filter((l) => l.trim());
  return lines.map((line) => JSON.parse(line) as T);
}

/**
 * Load questions from a flow-questions pack
 */
export function loadQuestionsFromPack(packPath: string): FlowQuestionRecord[] {
  const manifest = loadPackManifest(packPath);
  if (manifest.type !== 'flow-questions' && manifest.type !== 'questions') {
    throw new Error(`Pack ${manifest.packKey} is not flow-questions type`);
  }
  const questionsPath = path.join(packPath, 'questions.jsonl');
  return loadJsonl<FlowQuestionRecord>(questionsPath);
}

/**
 * Load polls from a polls pack
 */
export function loadPollsFromPack(packPath: string): PollRecord[] {
  const manifest = loadPackManifest(packPath);
  if (manifest.type !== 'polls') {
    throw new Error(`Pack ${manifest.packKey} is not polls type`);
  }
  const pollsPath = path.join(packPath, 'polls.jsonl');
  return loadJsonl<PollRecord>(pollsPath);
}

/**
 * Resolve pack path by packKey (relative to packs dir)
 */
export function resolvePackPath(packKey: string): string {
  const packsDir = getPacksDir();
  const packPath = path.join(packsDir, packKey);
  if (!fs.existsSync(packPath) || !fs.statSync(packPath).isDirectory()) {
    throw new Error(`Content pack not found: ${packKey} at ${packPath}`);
  }
  return packPath;
}

/**
 * Load full content pack (manifest + typed content)
 */
export function loadContentPack<T>(
  packKey: string,
  loader: (packPath: string) => T[]
): { manifest: PackManifest; records: T[] } {
  const packPath = resolvePackPath(packKey);
  const manifest = loadPackManifest(packPath);
  const records = loader(packPath);
  return { manifest, records };
}
