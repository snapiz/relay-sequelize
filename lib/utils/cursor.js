"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toCursor = toCursor;
exports.fromCursor = fromCursor;

var _base = require("./base64");

function toCursor(item) {
  var createdAt = item.get !== undefined ? item.get("createdAt") || item.get("created_at") : item.createdAt || item.created_at;
  return (0, _base.base64)(String(new Date(createdAt).getTime()));
}

function fromCursor(cursor) {
  return cursor ? (0, _base.unbase64)(cursor) : undefined;
}