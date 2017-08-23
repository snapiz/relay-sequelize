"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nodeTypes = exports.objectTypes = undefined;
exports.createObjectType = createObjectType;
exports.createOrderByEnum = createOrderByEnum;

var _utils = require("../utils");

var _lodash = require("lodash");

var _graphql = require("graphql");

var _graphqlSequelize = require("graphql-sequelize");

var _graphqlRelay = require("graphql-relay");

var objectTypes = exports.objectTypes = {};
var nodeTypes = exports.nodeTypes = {};

function createObjectType(model, nodeInterface) {
  if (!model) {
    throw new Error("model is not defined");
  }

  var name = (0, _lodash.upperFirst)((0, _lodash.camelCase)(model.name));

  var options = (0, _lodash.mergeWith)({
    find: { exclude: [] }
  }, model.options || {}, _utils.customizer);

  if (objectTypes[name]) {
    return objectTypes[name];
  }

  var fields = (0, _graphqlSequelize.attributeFields)(model, {
    commentToDescription: true,
    globalId: true,
    exclude: function exclude(key) {
      return ~options.find.exclude.indexOf(key) || model.rawAttributes[key].references;
    }
  });

  var objectType = new _graphql.GraphQLObjectType({
    name: "" + name,
    fields: fields,
    interfaces: [nodeInterface]
  });

  objectTypes[name] = objectType;
  nodeTypes[model.name] = {
    type: objectType,
    resolve: function resolve(globalId, context) {
      var _fromGlobalId = (0, _graphqlRelay.fromGlobalId)(globalId),
          id = _fromGlobalId.id;

      return model.findById(id).then(function (e) {
        if (options.one && options.one.before) {
          options.one.before(e, context);
        }

        return e;
      });
    }
  };

  Object.keys(model.associations).reduce(function (obj, associationName) {
    var association = model.associations[associationName];
    var associationObjectType = createObjectType(association.target, nodeInterface);

    if (association.associationType === "BelongsTo") {
      fields[associationName] = {
        type: associationObjectType,
        resolve: (0, _graphqlSequelize.resolver)(association)
      };

      return fields;
    }

    var uAssociationName = (0, _lodash.upperFirst)(associationName);

    var _relay$sequelizeConne = _graphqlSequelize.relay.sequelizeConnection({
      name: uAssociationName,
      nodeType: createObjectType(association.target, nodeInterface),
      target: association,
      orderBy: createOrderByEnum(association.target),
      connectionFields: {
        total: {
          type: _graphql.GraphQLInt,
          resolve: function resolve(_ref) {
            var source = _ref.source;

            return source["count" + uAssociationName]();
          }
        }
      }
    }),
        connectionType = _relay$sequelizeConne.connectionType,
        connectionArgs = _relay$sequelizeConne.connectionArgs,
        resolve = _relay$sequelizeConne.resolve;

    fields[associationName] = {
      type: connectionType,
      args: connectionArgs,
      resolve: resolve
    };

    return fields;
  }, fields);

  return objectType;
}

function createOrderByEnum(model) {
  var name = (0, _lodash.upperFirst)((0, _lodash.camelCase)(model.name)) + "OrderBY";

  if (model.options.orderBy && !objectTypes[name]) {
    objectTypes[name] = new _graphql.GraphQLEnumType({
      name: name,
      values: model.options.orderBy
    });
  }

  return objectTypes[name];
}