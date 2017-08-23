"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSchema = createSchema;
exports.sequelizeToGraphQL = sequelizeToGraphQL;

var _graphql = require("graphql");

var _lodash = require("lodash");

var _graphqlSequelize = require("graphql-sequelize");

var _graphqlRelay = require("graphql-relay");

var _mutation = require("./mutation");

var _query = require("./query");

var _type = require("./type");

function createSchema(sequelize, options) {
  var _relay$sequelizeNodeI = _graphqlSequelize.relay.sequelizeNodeInterface(sequelize),
      nodeField = _relay$sequelizeNodeI.nodeField,
      nodeInterface = _relay$sequelizeNodeI.nodeInterface,
      nodeTypeMapper = _relay$sequelizeNodeI.nodeTypeMapper;

  if (!options) {
    options = {};
  }

  var _sequelizeToGraphQL = sequelizeToGraphQL(sequelize, nodeInterface),
      queries = _sequelizeToGraphQL.queries,
      mutations = _sequelizeToGraphQL.mutations;

  if (options.queries) {
    queries = (0, _lodash.merge)(queries, options.queries(_type.objectTypes));
  }

  if (options.mutations) {
    mutations = (0, _lodash.merge)(mutations, options.mutations(_type.objectTypes));
  }

  Object.keys(mutations).reduce(function (obj, e) {
    mutations[e] = (0, _graphqlRelay.mutationWithClientMutationId)(mutations[e]);
  }, mutations);

  nodeTypeMapper.mapTypes(_type.nodeTypes);

  queries.node = nodeField;

  return new _graphql.GraphQLSchema({
    query: new _graphql.GraphQLObjectType({
      name: 'RootType',
      fields: queries
    }),
    mutation: new _graphql.GraphQLObjectType({
      name: 'Mutation',
      fields: mutations
    })
  });
}

function sequelizeToGraphQL(_ref, nodeInterface) {
  var models = _ref.models;


  return Object.keys(models).reduce(function (obj, e) {
    var model = models[e];
    var queries = (0, _query.createQueries)(model, nodeInterface);
    var mutations = (0, _mutation.createMutations)(model, nodeInterface);

    return (0, _lodash.merge)(obj, { queries: queries, mutations: mutations });
  }, { queries: {}, mutations: {} });
}