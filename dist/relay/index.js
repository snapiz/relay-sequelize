"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphqlRelay = require("graphql-relay");

Object.keys(_graphqlRelay).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _graphqlRelay[key];
    }
  });
});