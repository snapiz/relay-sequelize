import {
  merge
} from "lodash";

import {
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

import {
  attributeFields
} from "graphql-sequelize";

import {
  createBelongToConnection,
  createHasManyConnections
} from "./connection";

export const sequelizeGraphQLObjectTypes = {};
export const graphqlEdgeTypes = {};

export function toGraphQLObjectType(model, nodeInterface) {
  const { name, associations, options: { graphql } } = model;

  if (sequelizeGraphQLObjectTypes[name] !== undefined) {
    return [sequelizeGraphQLObjectTypes[name], graphqlEdgeTypes[name]];
  }

  const { find: { exclude } } = merge({
    find: {
      exclude: []
    }
  }, graphql);

  let fields = attributeFields(model, {
    commentToDescription: true,
    globalId: true,
    exclude: exclude
  });

  sequelizeGraphQLObjectTypes[name] = new GraphQLObjectType({
    name: name,
    fields: fields,
    interfaces: [nodeInterface]
  });

  graphqlEdgeTypes[name] = new GraphQLObjectType({
    name: `${name}Edge`,
    fields: {
      cursor: { type: GraphQLString },
      node: { type: sequelizeGraphQLObjectTypes[name] }
    }
  });

  Object.keys(associations).reduce(function (obj, associationName) {
    const association = associations[associationName];
    const [graphQLObjectType] = toGraphQLObjectType(association.target, nodeInterface);

    fields[associationName] =
      association.associationType === "BelongsTo"
        ? createBelongToConnection(association, graphQLObjectType)
        : createHasManyConnections(association, graphQLObjectType, associationName);

    return fields;
  }, fields);

  return [sequelizeGraphQLObjectTypes[name], graphqlEdgeTypes[name]];
}