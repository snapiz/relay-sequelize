const {
  relay: { sequelizeNodeInterface },
  resolver, attributeFields
} = require('graphql-sequelize');

export {
  graphqlExpress,
  graphiqlExpress
} from "graphql-server-express";

import {
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

export const mutationNames = ["create", "update", "delete"];

export function createSequelizeGraphql(sequelize) {
  const {
    nodeField,
    nodeInterface,
    nodeTypeMapper
  } = sequelizeNodeInterface(sequelize);

  return Object.keys(sequelize.models).reduce(function (obj, name) {
    const model = sequelize.models[name];
    const gType = toGraphQLObjectType(model, nodeInterface);
    const queryName = camelCase(name);
    const mutationName = upperFirst(queryName);

    obj.queries[queryName] = {
      type: gType,
      args: merge(defaultArgs(model), { id: { type: GraphQLString } }),
      resolve: function (obj, args, context, info) {
        if (args.id) {
          args.id = parseInt(fromGlobalId(args.id).id, 10);
        }
        return resolver(model)(obj, args, context, info);
      }
    };

    obj.queries[`${queryName}s`] = {
      type: new GraphQLList(gType),
      args: defaultListArgs(),
      resolve: resolver(model)
    };

    mutationNames.reduce(function(mobj, mname) {
      mobj[mname + mutationName] = mutations[`create${upperFirst(mname)}Mutation`](model, gType);
      
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

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootType',
      fields: options.queries
        ? Object.assign({}, queries, options.queries(nodeInterface, resolver))
        : queries
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: options.mutations
        ? Object.assign({}, mutations, options.mutations(nodeInterface, attributeFields))
        : mutations
    })
  });
}