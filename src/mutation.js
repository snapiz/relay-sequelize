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

import {
  toCursor,
  fromCursor
} from "./utils/cursor";

export function createCreateMutation(model, graphqlType) {
  const {
      create: {
        exclude,
    before
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
      [camelCase(graphqlType.name)]: {
        type: graphqlType,
        resolve: function ({ dataValues }) {
          return { node: dataValues, cursor: toCursor(dataValues) };
        },
      }
    },
    mutateAndGetPayload: function (args, context, info) {
      if (model.options.graphql && model.options.graphql.before) {
        model.options.graphql.before(args, context, info);
      }
      if (before) {
        before(args, context, info);
      }
      return model.create(args);
    },
  });;
}

export function createUpdateMutation(model, graphqlType) {
  const {
      update: {
        exclude,
        before
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
      [camelCase(graphqlType.name)]: {
        type: graphqlType,
        resolve: function ({ dataValues }) {
          return dataValues ? { node: dataValues, cursor: toCursor(dataValues) } : null;
        },
      }
    },
    mutateAndGetPayload: function (args, context, info) {
      return model.findById(parseInt(fromGlobalId(args.id).id, 10)).then(function (row) {
        if (!row) {
          return {};
        }
         if (model.options.graphql && model.options.graphql.before) {
          model.options.graphql.before(args, context, info);
        }
        if (before) {
          before(row, args, context, info);
        } 
        return row.update(args);
      });
    },
  });;
}

export function createDeleteMutation(model, graphqlType) {
  const {
      delete: {
        before
      }
    } = model.options.graphql = merge({
      delete: {}
    }, model.options.graphql);

  return mutationWithClientMutationId({
    name: `delete${upperFirst(model.name)}`,
    inputFields: {
      id: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      [camelCase(graphqlType.name)]: {
        type: graphqlType,
        resolve: function ({ dataValues }) {
          return dataValues ? { node: dataValues, cursor: toCursor(dataValues) } : null;
        },
      }
    },
    mutateAndGetPayload: function (args, context, info) {
      return model.findById(parseInt(fromGlobalId(args.id).id, 10)).then((row) => {
        if (!row) {
          return {};
        }
         if (model.options.graphql && model.options.graphql.before) {
          model.options.graphql.before(args, context, info);
        }
        if (before) {
          before(row, args, context, info);
        } 
        return row ? row.destroy(args).then(() => row) : {};
      });
    },
  });;
}