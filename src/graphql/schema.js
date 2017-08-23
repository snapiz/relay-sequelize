import { GraphQLSchema, GraphQLObjectType } from "graphql";
import { merge } from "lodash";
import { relay } from "graphql-sequelize";
import { mutationWithClientMutationId } from "graphql-relay";
import { createMutations } from "./mutation";
import { createQueries } from "./query";
import { nodeTypes, objectTypes } from "./type";

export function createSchema(sequelize, options) {
  const { nodeField, nodeInterface, nodeTypeMapper } = relay.sequelizeNodeInterface(sequelize);

  if (!options) {
    options = {};
  }

  let { queries, mutations } = sequelizeToGraphQL(sequelize, nodeInterface);

  if (options.queries) {
    queries = merge(queries, options.queries(objectTypes));
  }

  if (options.mutations) {
    mutations = merge(mutations, options.mutations(objectTypes));
  }
  
  Object.keys(mutations).reduce((obj, e) => {
    mutations[e] = mutationWithClientMutationId(mutations[e]);
  }, mutations);

  nodeTypeMapper.mapTypes(nodeTypes);

  queries.node = nodeField;

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootType',
      fields: queries
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutations
    })
  });
}

export function sequelizeToGraphQL({ models }, nodeInterface) {

  return Object.keys(models).reduce((obj, e) => {
    const model = models[e];
    const queries = createQueries(model, nodeInterface)
    const mutations = createMutations(model, nodeInterface);

    return merge(obj, { queries, mutations });
  }, { queries: {}, mutations: {} });
}