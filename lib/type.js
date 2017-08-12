"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.graphqlEdgeTypes = exports.sequelizeGraphQLObjectTypes = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.toGraphQLObjectType = toGraphQLObjectType;

var _lodash = require("lodash");

var _graphql = require("graphql");

var _graphqlSequelize = require("graphql-sequelize");

var _connection = require("./connection");

var sequelizeGraphQLObjectTypes = exports.sequelizeGraphQLObjectTypes = {};
var graphqlEdgeTypes = exports.graphqlEdgeTypes = {};

function toGraphQLObjectType(model, nodeInterface) {
  var name = model.name,
      associations = model.associations,
      graphql = model.options.graphql;


  if (sequelizeGraphQLObjectTypes[name] !== undefined) {
    return [sequelizeGraphQLObjectTypes[name], graphqlEdgeTypes[name]];
  }

  var _merge = (0, _lodash.merge)({
    find: {
      exclude: []
    }
  }, graphql),
      exclude = _merge.find.exclude;

  var fields = (0, _graphqlSequelize.attributeFields)(model, {
    commentToDescription: true,
    globalId: true,
    exclude: exclude
  });

  sequelizeGraphQLObjectTypes[name] = new _graphql.GraphQLObjectType({
    name: name,
    fields: fields,
    interfaces: [nodeInterface]
  });

  graphqlEdgeTypes[name] = new _graphql.GraphQLObjectType({
    name: name + "Edge",
    fields: {
      cursor: { type: _graphql.GraphQLString },
      node: { type: sequelizeGraphQLObjectTypes[name] }
    }
  });

  Object.keys(associations).reduce(function (obj, associationName) {
    var association = associations[associationName];

    var _toGraphQLObjectType = toGraphQLObjectType(association.target, nodeInterface),
        _toGraphQLObjectType2 = _slicedToArray(_toGraphQLObjectType, 1),
        graphQLObjectType = _toGraphQLObjectType2[0];

    fields[associationName] = association.associationType === "BelongsTo" ? (0, _connection.createBelongToConnection)(association, graphQLObjectType) : (0, _connection.createHasManyConnections)(association, graphQLObjectType, associationName);

    return fields;
  }, fields);

  return [sequelizeGraphQLObjectTypes[name], graphqlEdgeTypes[name]];
}