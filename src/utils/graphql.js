import {
  GraphQLNonNull,
  GraphQLString
} from "graphql";

import {
  fromGlobalId
} from "graphql-relay";

import {
  toCursor
} from "./cursor";

export function defaultExcludeFields(model, exclude) {
  return Object.keys(model.rawAttributes).reduce(function (data, current) {
    const item = model.rawAttributes[current];

    if (item.primaryKey || item._autoGenerated || item.references) {
      data.push(current);
    }

    return data;
  }, exclude);
}

export function parsePrimaryKeyinputFields(model, options) {
  const { exclude } = options || {};
  return Object.keys(model.rawAttributes).reduce(function (data, current) {
    const item = model.rawAttributes[current];

    if ((item.primaryKey || item.references) && (!exclude || exclude.indexOf(current) === -1)) {
      data[current] = { type: item.allowNull ? GraphQLString : new GraphQLNonNull(GraphQLString) };
    }

    return data;
  }, {});
}

export function argsToSequelize(model, args) {
  return Object.keys(args).reduce(function (data, current) {
    if (model.rawAttributes[current]) {
      data[current] = (model.rawAttributes[current].primaryKey || model.rawAttributes[current].references) ? parseInt(fromGlobalId(args[current]).id, 10) : args[current];
    }

    return data;
  }, {});
}

export function resolveEdge(source) {
  return source ? { node: source, cursor: toCursor(source) } : null;
}