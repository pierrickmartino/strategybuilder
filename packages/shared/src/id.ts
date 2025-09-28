const DEFAULT_LENGTH = 8;

function stripDashes(value: string): string {
  return value.replace(/-/g, "");
}

type MaybeCrypto = { randomUUID?: () => string };

function fromNativeUuid(length: number): string | null {
  if (typeof globalThis === "undefined") {
    return null;
  }
  const nativeCrypto = (globalThis as { crypto?: MaybeCrypto }).crypto;
  if (!nativeCrypto || typeof nativeCrypto.randomUUID !== "function") {
    return null;
  }
  return stripDashes(nativeCrypto.randomUUID()).slice(0, length);
}

function fallbackSegment(length: number): string {
  const source = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  if (source.length >= length) {
    return source.slice(-length);
  }
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = source;
  while (result.length < length) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result.slice(-length);
}

export function generateIdSegment(length: number = DEFAULT_LENGTH): string {
  if (length <= 0) {
    throw new Error("length must be greater than 0");
  }
  const native = fromNativeUuid(length);
  if (native) {
    return native;
  }
  return fallbackSegment(length);
}

export function createPrefixedId(prefix: string, length: number = DEFAULT_LENGTH): string {
  const segment = generateIdSegment(length);
  return prefix ? `${prefix}-${segment}` : segment;
}
