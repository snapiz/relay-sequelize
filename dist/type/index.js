"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sequelizeGraphQLObjectTypes = undefined;
exports.toGraphQLObjectType = toGraphQLObjectType;

var _lodash = require("lodash");

var _graphql = require("graphql");

var _connection = require("../connection");

var _require = require("graphql-sequelize"),
    attributeFields = _require.attributeFields;

var sequelizeGraphQLObjectTypes = exports.sequelizeGraphQLObjectTypes = {};

function toGraphQLObjectType(model, nodeInterface) {
  var name = model.name,
      associations = model.associations,
      graphql = model.options.graphql;


  if (sequelizeGraphQLObjectTypes[name] !== undefined) {
    return sequelizeGraphQLObjectTypes[name];
  }

  var _merge = (0, _lodash.merge)({
    find: {
      exclude: []
    }
  }, graphql),
      exclude = _merge.find.exclude;

  var fields = attributeFields(model, {
    commentToDescription: true,
    globalId: true,
    exclude: exclude
  });

  sequelizeGraphQLObjectTypes[name] = new _graphql.GraphQLObjectType({
    name: name,
    fields: fields,
    interfaces: [nodeInterface]
  });

  Object.keys(associations).reduce(function (obj, associationName) {
    var association = associations[associationName];
    var graphQLObjectType = toGraphQLObjectType(association.target, nodeInterface);

    fields[associationName] = association.associationType === "BelongsTo" ? (0, _connection.createBelongToConnection)(association, graphQLObjectType) : (0, _connection.createHasManyConnections)(association, graphQLObjectType, associationName);

    return fields;
  }, fields);

  return sequelizeGraphQLObjectTypes[name];
}