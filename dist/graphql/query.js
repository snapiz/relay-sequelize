"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createQueries = createQueries;

var _graphql = require("graphql");

var _graphqlSequelize = require("graphql-sequelize");

var _type = require("./type");

var _lodash = require("lodash");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createQueries(model, nodeInterface) {
  var name = (0, _lodash.camelCase)(model.name);
  var uname = (0, _lodash.upperFirst)(name);
  var _model$options = model.options,
      find = _model$options.find,
      before = _model$options.before;

  var _relay$sequelizeConne = _graphqlSequelize.relay.sequelizeConnection({
    name: uname,
    nodeType: (0, _type.createObjectType)(model, nodeInterface),
    target: model,
    orderBy: (0, _type.createOrderByEnum)(model),
    connectionFields: {
      total: {
        type: _graphql.GraphQLInt,
        resolve: function resolve() {
          return model.count();
        }
      }
    }
  }),
      connectionType = _relay$sequelizeConne.connectionType,
      connectionArgs = _relay$sequelizeConne.connectionArgs,
      _resolve = _relay$sequelizeConne.resolve;

  return _defineProperty({}, name + "s", {
    type: connectionType,
    args: connectionArgs,
    resolve: function resolve(source, args, context, info) {
      if (before) {
        before(args, context, info);
      }

      if (find && find.before) {
        find.before(args, context, info);
      }

      return _resolve(source, args, context, info);
    }
  });
}