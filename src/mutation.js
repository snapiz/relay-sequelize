import {
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
  fromCursor,
} from "./utils/cursor";

import {
  defaultExcludeFields,
  parsePrimaryKeyinputFields,
  argsToSequelize,
  resolveEdge
} from "./utils/graphql";

export function createCreateMutation(model, graphqlType) {
  const {
      create: { exclude, before, after }
    } = model.options.graphql = merge({
      create: {
        exclude: []
      }
    }, model.options.graphql);

  return {
    name: `create${upperFirst(model.name)}`,
    inputFields: merge(parsePrimaryKeyinputFields(model, { exclude: ["id"].concat(exclude) }), attributeFields(model, {
      commentToDescription: true,
      globalId: false,
      exclude: defaultExcludeFields(model, exclude)
    })),
    outputFields: {
      [camelCase(graphqlType.name)]: {
        type: graphqlType,
        resolve: function (source) {
          return resolveEdge(source);
        },
      }
    },
    mutateAndGetPayload: function (args, context, info) {
      args = argsToSequelize(model, args);
      if (model.options.graphql && model.options.graphql.before) {
        model.options.graphql.before(args, context, info);
      }
      if (before) {
        before(args, context, info);
      }
      return model.create(args).then(function (result) {
        if (after) {
          after(args, context, info, result);
        }
        return result;
      });
    },
  }
}

export function createUpdateMutation(model, graphqlType) {
  const {
      update: { exclude, before, after }
    } = model.options.graphql = merge({
      update: {
        exclude: []
      }
    }, model.options.graphql);

  return {
    name: `update${upperFirst(model.name)}`,
    inputFields: merge(parsePrimaryKeyinputFields(model, {exclude}), attributeFields(model, {
      commentToDescription: true,
      globalId: false,
      exclude: defaultExcludeFields(model, exclude)
    })),
    outputFields: {
      [camelCase(graphqlType.name)]: {
        type: graphqlType,
        resolve: function (source) {
          return resolveEdge(source);
        },
      }
    },
    mutateAndGetPayload: function (args, context, info) {
      args = argsToSequelize(model, args);
      return model.findById(args.id).then(function (row) {
        if (!row) {
          throw new Error(`${model.name} not found`);
        }
        if (model.options.graphql && model.options.graphql.before) {
          model.options.graphql.before(args, context, info);
        }
        if (before) {
          before(args, context, info, row);
        }
        return row.update(args);
      }).then(function (result) {
        if (after) {
          after(args, context, info, result);
        }
        return result;
      });
    },
  }
}

export function createDeleteMutation(model, graphqlType) {
  const {
      delete: { before, after }
    } = model.options.graphql = merge({
      delete: {}
    }, model.options.graphql);

  return {
    name: `delete${upperFirst(model.name)}`,
    inputFields: {
      id: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      [camelCase(graphqlType.name)]: {
        type: graphqlType,
        resolve: function (source) {
          return resolveEdge(source);
        },
      }
    },
    mutateAndGetPayload: function (args, context, info) {
      args = argsToSequelize(model, args);
      return model.findById(args.id).then((row) => {
        if (!row) {
          throw new Error(`${model.name} not found`);
        }
        if (model.options.graphql && model.options.graphql.before) {
          model.options.graphql.before(args, context, info);
        }
        if (before) {
          before(args, context, info, row);
        }
        return row ? row.destroy(args).then(() => {
          if (after) {
            after(args, context, info, row);
          }
          return row;
        }) : {};
      });
    },
  }
}