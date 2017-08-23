"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.customizer = customizer;

var _lodash = require("lodash");

function customizer(objValue, srcValue) {
  if ((0, _lodash.isArray)(objValue)) {
    return objValue.concat(srcValue);
  }
}