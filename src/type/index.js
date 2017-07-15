import {
  merge
} from "lodash";

import {
  GraphQLObjectType,
} from "graphql";

const {
  attributeFields
} = require("graphql-sequelize");

import {
  createBelongToConnection,
  createHasManyConnections
} from "../connection";

export const sequelizeGraphQLObjectTypes = {};

export function toGraphQLObjectType(model, nodeInterface) {
  const { name, associations, options: { graphql } } = model;

  if (sequelizeGraphQLObjectTypes[name] !== undefined) {
    return sequelizeGraphQLObjectTypes[name];
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

  Object.keys(associations).reduce(function (obj, associationName) {
    const association = associations[associationName];
    const graphQLObjectType = toGraphQLObjectType(association.target, nodeInterface);

    fields[associationName] =
      association.associationType === "BelongsTo"
        ? createBelongToConnection(association, graphQLObjectType)
        : createHasManyConnections(association, graphQLObjectType, associationName);

    return fields;
  }, fields);

  return sequelizeGraphQLObjectTypes[name];
}