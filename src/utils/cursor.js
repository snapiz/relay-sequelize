import { unbase64, base64 } from "./base64";

export function toCursor(item) {
  const createdAt = item.get !== undefined ? (item.get("createdAt") || item.get("created_at")) : (item.createdAt || item.created_at);
  return base64(String(new Date(createdAt).getTime()));
}

export function fromCursor(cursor) {
  return cursor ? unbase64(cursor) : undefined;
}