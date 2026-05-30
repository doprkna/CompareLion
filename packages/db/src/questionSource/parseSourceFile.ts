import * as fs from 'fs';
import * as path from 'path';
import type { SourceQuestionRow } from './types';

export type SourceFileFormat = 'json' | 'csv' | 'tsv';

export interface ParsedSourceFile {
  format: SourceFileFormat;
  filePath: string;
  headers: string[];
  rows: SourceQuestionRow[];
}

/** Parse one CSV/TSV record respecting quoted fields. */
function parseDelimitedRecords(content: string, delimiter: string): string[][] {
  const records: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      continue;
    } else if (c === '\n') {
      row.push(field);
      if (row.some((cell) => cell.trim().length > 0)) {
        records.push(row);
      }
      row = [];
      field = '';
    } else {
      field += c;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim().length > 0)) {
      records.push(row);
    }
  }

  return records;
}

function recordsToRows(records: string[][]): { headers: string[]; rows: SourceQuestionRow[] } {
  if (records.length === 0) {
    return { headers: [], rows: [] };
  }
  const headers = records[0].map((h) => h.trim());
  const rows: SourceQuestionRow[] = [];
  for (let i = 1; i < records.length; i++) {
    const values = records[i];
    const row: SourceQuestionRow = {};
    headers.forEach((header, idx) => {
      const v = values[idx]?.trim() ?? '';
      if (v !== '') row[header] = v;
    });
    rows.push(row);
  }
  return { headers, rows };
}

export function parseSourceFile(filePath: string): ParsedSourceFile {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`File not found: ${abs}`);
  }

  const ext = path.extname(abs).toLowerCase();
  const raw = fs.readFileSync(abs, 'utf-8');

  if (ext === '.json') {
    const data = JSON.parse(raw) as unknown;
    const rows = (Array.isArray(data) ? data : [data]) as SourceQuestionRow[];
    const headers =
      rows.length > 0 ? Object.keys(rows[0]).filter((k) => rows[0][k] !== undefined) : [];
    return { format: 'json', filePath: abs, headers, rows };
  }

  const delimiter = ext === '.tsv' ? '\t' : ',';
  const format: SourceFileFormat = ext === '.tsv' ? 'tsv' : 'csv';
  const records = parseDelimitedRecords(raw.replace(/^\uFEFF/, ''), delimiter);
  const { headers, rows } = recordsToRows(records);
  return { format, filePath: abs, headers, rows };
}

export function sourceNameFromFile(filePath: string): string {
  return path.basename(filePath, path.extname(filePath)).replace(/[^\w.-]+/g, '-');
}
