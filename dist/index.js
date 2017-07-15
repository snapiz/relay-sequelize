"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mutationNames = exports.sequelizeGraphQLObjectTypes = exports.graphiqlExpress = exports.graphqlExpress = undefined;

var _graphqlServerExpress = require("graphql-server-express");

Object.defineProperty(exports, "graphqlExpress", {
  enumerable: true,
  get: function get() {
    return _graphqlServerExpress.graphqlExpress;
  }
});
Object.defineProperty(exports, "graphiqlExpress", {
  enumerable: true,
  get: function get() {
    return _graphqlServerExpress.graphiqlExpress;
  }
});

var _type = require("./type");

Object.defineProperty(exports, "sequelizeGraphQLObjectTypes", {
  enumerable: true,
  get: function get() {
    return _type.sequelizeGraphQLObjectTypes;
  }
});
exports.createSequelizeGraphql = createSequelizeGraphql;
exports.createSequelizeGraphqlSchema = createSequelizeGraphqlSchema;

var _graphqlRelay = require("graphql-relay");

var _graphqlSequelize = require("graphql-sequelize");

var _graphql = require("graphql");

var _lodash = require("lodash");

var _mutation = require("./mutation");

var mutations = _interopRequireWildcard(_mutation);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('graphql-sequelize'),
    sequelizeNodeInterface = _require.relay.sequelizeNodeInterface,
    resolver = _require.resolver,
    attributeFields = _require.attributeFields;

var mutationNames = exports.mutationNames = ["create", "update", "delete"];

function createSequelizeGraphql(sequelize) {
  var _sequelizeNodeInterfa = sequelizeNodeInterface(sequelize),
      nodeField = _sequelizeNodeInterfa.nodeField,
      nodeInterface = _sequelizeNodeInterfa.nodeInterface,
      nodeTypeMapper = _sequelizeNodeInterfa.nodeTypeMapper;

  return Object.keys(sequelize.models).reduce(function (obj, name) {
    var model = sequelize.models[name];
    var gType = (0, _type.toGraphQLObjectType)(model, nodeInterface);
    var queryName = (0, _lodash.camelCase)(name);
    var mutationName = (0, _lodash.upperFirst)(queryName);

    obj.queries[queryName] = {
      type: gType,
      args: (0, _lodash.merge)((0, _graphqlSequelize.defaultArgs)(model), { id: { type: _graphql.GraphQLString } }),
      resolve: function resolve(obj, args, context, info) {
        if (args.id) {
          args.id = parseInt((0, _graphqlRelay.fromGlobalId)(args.id).id, 10);
        }
        return resolver(model)(obj, args, context, info);
      }
    };

    obj.queries[queryName + "s"] = {
      type: new _graphql.GraphQLList(gType),
      args: (0, _graphqlSequelize.defaultListArgs)(),
      resolve: resolver(model)
    };

    mutationNames.reduce(function (mobj, mname) {
      mobj[mname + mutationName] = mutations["create" + (0, _lodash.upperFirst)(mname) + "Mutation"](model, gType);

      return mobj;
    }, obj.mutations);

    nodeTypeMapper.mapTypes(_defineProperty({}, name, gType));

    return obj;
  }, {
    queries: { node: nodeField },
    mutations: {},
    nodeTypeMapper: nodeTypeMapper,
    nodeInterface: nodeInterface
  });
}

function createSequelizeGraphqlSchema(sequelize) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _createSequelizeGraph = createSequelizeGraphql(sequelize),
      queries = _createSequelizeGraph.queries,
      mutations = _createSequelizeGraph.mutations,
      nodeTypeMapper = _createSequelizeGraph.nodeTypeMapper,
      nodeInterface = _createSequelizeGraph.nodeInterface;

  return new _graphql.GraphQLSchema({
    query: new _graphql.GraphQLObjectType({
      name: 'RootType',
      fields: options.queries ? Object.assign({}, queries, options.queries(nodeInterface, resolver)) : queries
    }),
    mutation: new _graphql.GraphQLObjectType({
      name: 'Mutation',
      fields: options.mutations ? Object.assign({}, mutations, options.mutations(nodeInterface, attributeFields)) : mutations
    })
  });
}