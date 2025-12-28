export function encodeCursor(
  cursor: Record<string, unknown> | null,
): string | null {
  if (!cursor) return null;
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

export function decodeCursor(
  encoded: string | undefined | null,
): Record<string, unknown> | null {
  if (!encoded) return null;
  try {
    const decoded = Buffer.from(encoded, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
