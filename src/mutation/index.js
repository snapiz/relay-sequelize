import {
  mutationWithClientMutationId,
  fromGlobalId
} from "graphql-relay";

const {
  attributeFields
} = require('graphql-sequelize');

import {
  upperFirst,
  camelCase,
  merge
} from "lodash";

import {
  GraphQLNonNull,
  GraphQLString
} from "graphql";

export function createCreateMutation(model, graphqlType) {
  const {
      create: {
        exclude
      }
    } = model.options.graphql = merge({
      create: {
        exclude: []
      }
    }, model.options.graphql);

  exclude.push('id', 'createdAt', 'updatedAt');

  return mutationWithClientMutationId({
    name: `create${upperFirst(model.name)}`,
    inputFields: attributeFields(model, {
      commentToDescription: true,
      globalId: false,
      exclude: exclude
    }),
    outputFields: {
      [camelCase(model.name)]: {
        type: graphqlType,
        resolve: function ({ dataValues }) {
          return dataValues;
        },
      }
    },
    mutateAndGetPayload: function (args) {
      return model.create(args);
    },
  });;
}
export function createDeleteMutation(model, graphqlType) {
  /*const {
      create: {
        exclude
      }
    } = model.options.graphql = merge({
      create: {
        exclude: []
      }
    }, model.options.graphql);

  exclude.push('id', 'createdAt', 'updatedAt');*/

  return mutationWithClientMutationId({
    name: `delete${upperFirst(model.name)}`,
    inputFields: {
      id: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      [camelCase(model.name)]: {
        type: graphqlType,
        resolve: function ({ dataValues }) {
          return dataValues;
        },
      }
    },
    mutateAndGetPayload: function (args) {
      return model.findById(parseInt(fromGlobalId(args.id).id, 10)).then((row) => {
        return row ? row.destroy(args).then(() => row) : {};
      });
    },
  });;
}
export function createUpdateMutation(model, graphqlType) {
  const {
      update: {
        exclude
      }
    } = model.options.graphql = merge({
      update: {
        exclude: []
      }
    }, model.options.graphql);

  exclude.push('id', 'createdAt', 'updatedAt');

  return mutationWithClientMutationId({
    name: `update${upperFirst(model.name)}`,
    inputFields: merge({ id: { type: new GraphQLNonNull(GraphQLString) } }, attributeFields(model, {
      commentToDescription: true,
      globalId: false,
      exclude: exclude
    })),
    outputFields: {
      [camelCase(model.name)]: {
        type: graphqlType,
        resolve: function ({ dataValues }) {
          return dataValues;
        },
      }
    },
    mutateAndGetPayload: function (args) {
      return model.findById(parseInt(fromGlobalId(args.id).id, 10)).then((row) => row ? row.update(args) : {});
    },
  });;
}