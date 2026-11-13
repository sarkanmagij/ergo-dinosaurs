import LZString from 'lz-string';
import { isValidSelection, type Assessment } from './extinction-risk';
export function encodeAssessment(data: Assessment) { return LZString.compressToEncodedURIComponent(JSON.stringify(data)); }
export function decodeAssessment(encoded: string): Assessment | null {
  try {
    if (encoded.length > 12000) return null;
    const value = JSON.parse(LZString.decompressFromEncodedURIComponent(encoded) || 'null');
    if (!value || typeof value.industry !== 'string' || typeof value.size !== 'string' || typeof value.regulated !== 'boolean' || !Array.isArray(value.entries) || !isValidSelection(value.entries.length)) return null;
    if (!value.entries.every((e: { name?: unknown; answers?: unknown }) => typeof e.name === 'string' && e.name.length > 0 && e.name.length <= 100 && Array.isArray(e.answers) && e.answers.length === 5 && e.answers.every((a: unknown) => typeof a === 'number' && Number.isInteger(a) && a >= 0 && a <= 3))) return null;
    return value;
  } catch { return null; }
}