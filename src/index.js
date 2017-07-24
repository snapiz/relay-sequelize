const {
  relay: { sequelizeNodeInterface },
  resolver, attributeFields
} = require('graphql-sequelize');

export {
  graphqlExpress,
  graphiqlExpress
} from "graphql-server-express";

import {
  mutationWithClientMutationId,
  fromGlobalId
} from "graphql-relay";

import {
  defaultArgs,
  defaultListArgs
} from "graphql-sequelize";

import {
  GraphQLList,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema,
  GraphQLObjectType
} from "graphql";

import {
  merge,
  camelCase,
  upperFirst
} from "lodash";

import {
  toGraphQLObjectType
} from "./type";

import * as mutations from "./mutation";

export {
  sequelizeGraphQLObjectTypes
} from "./type";


import {
  argsToSequelize,
  resolveEdge
} from "./utils/graphql";

export const mutationNames = ["create", "update", "delete"];

export function createSequelizeGraphql(sequelize) {
  const {
    nodeField,
    nodeInterface,
    nodeTypeMapper
  } = sequelizeNodeInterface(sequelize);

  return Object.keys(sequelize.models).filter(function (name) {
    return sequelize.models[name].options.graphql !== false;
  }).reduce(function (obj, name) {
    const model = sequelize.models[name];
    const { graphql } = model.options;
    const [gType, edgeType] = toGraphQLObjectType(model, nodeInterface);
    const queryName = camelCase(name);
    const mutationName = upperFirst(queryName);

    obj.queries[queryName] = {
      type: edgeType,
      args: merge(defaultArgs(model), { id: { type: GraphQLString } }),
      resolve: function (obj, args, context, info) {
        args = argsToSequelize(model, args);
        if (graphql && graphql.before) {
          graphql.before(args, context, info);
        }
        if (graphql && graphql.find && graphql.find.before) {
          graphql.find.before(args, context, info);
        }
        return resolver(model)(obj, args, context, info).then(function (source) {
          return resolveEdge(source);
        });
      }
    };

    obj.queries[`${queryName}s`] = {
      type: new GraphQLList(gType),
      args: defaultListArgs(),
      resolve: function (obj, args, context, info) {
        if (graphql && graphql.before) {
          graphql.before(args, context, info);
        }
        if (graphql && graphql.find && graphql.find.before) {
          graphql.find.before(args, context, info);
        }
        return resolver(model)(obj, args, context, info);
      }
    };

    mutationNames.reduce(function (mobj, mname) {
      mobj[mname + mutationName] = mutations[`create${upperFirst(mname)}Mutation`](model, edgeType);

      return mobj;
    }, obj.mutations);

    nodeTypeMapper.mapTypes({
      [name]: gType
    });

    return obj;
  }, {
      queries: { node: nodeField },
      mutations: {},
      nodeTypeMapper,
      nodeInterface
    });
}

export function createSequelizeGraphqlSchema(sequelize, options = {}) {
  const { queries, mutations, nodeTypeMapper, nodeInterface } = createSequelizeGraphql(sequelize);
  const _mutations = options.mutations
    ? Object.assign({}, mutations, options.mutations(nodeInterface, attributeFields))
    : mutations;
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootType',
      fields: options.queries
        ? Object.assign({}, queries, options.queries(nodeInterface, resolver))
        : queries
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: Object.keys(_mutations).reduce(function (data, current) {
        data[current] = mutationWithClientMutationId(_mutations[current]);
        return data;
      }, {})
    })
  });
}