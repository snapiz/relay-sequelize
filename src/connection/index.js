const {
  relay: { sequelizeConnection },
  resolver
} = require("graphql-sequelize");

import {
  GraphQLInt
} from "graphql";

import {
  mutationWithClientMutationId,
  fromGlobalId
} from "graphql-relay";

import {
  base64,
  unbase64
} from "../utils/base64";

import { capitalize } from "lodash";

export function createBelongToConnection(association, graphQLObjectType) {
  return {
    type: graphQLObjectType,
    resolve: resolver(association, {
      separate: true
    })
  };
}

function toCursor(item) {
  return base64(String(new Date(item.get("createdAt")).getTime()));
}

function fromCursor(cursor) {
  return cursor ? unbase64(cursor) : undefined;
}

function resolve(target, source, args, context, info) {
  const { after, before, first, last } = args;
  const cursor = fromCursor(after || before);
  const orderByAttribute = "createdAt";
  const orderByDirection = last ? "DESC" : "ASC";

  let options = {
    order: [[orderByAttribute, orderByDirection]],
    limit: first || last
  };

  if (cursor) {
    const operator = before ? '$lt' : '$gt';
    options.where = {
      "createdAt": { [operator]: Number(cursor) }
    };
  }
  const fnTargetname = capitalize(target.name);
  return source[`get${fnTargetname}s`](options).then(function (items) {
    const edges = items.map(function (item) {
      return { node: item, cursor: toCursor(item) };
    });

    let result = {
      edges,
      pageInfo: {
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        hasPreviousPage: false,
        hasNextPage: false
      },
      source: source
    };

    const prevOptions = Object.assign({}, options, {
      where: {
        "createdAt": {
          $lt: Number(fromCursor(result.pageInfo.startCursor))
        }
      }
    });

    const nextOptions = Object.assign({}, options, {
      where: {
        "createdAt": {
          $gt: Number(fromCursor(result.pageInfo.endCursor))
        }
      }
    });

    return Promise.all([
      source[`get${fnTargetname}s`](prevOptions),
      source[`get${fnTargetname}s`](nextOptions)
    ]).then(function ([prev, next]) {
      result.pageInfo.hasPreviousPage = prev.length > 0;
      result.pageInfo.hasNextPage = next.length > 0;
      return result;
    });
  });
};

export function createHasManyConnections({ target }, graphQLObjectType, name) {
  const fnTargetname = capitalize(target.name);
  const { connectionType, connectionArgs } = sequelizeConnection({
    name: name,
    nodeType: graphQLObjectType,
    target: target,
    connectionFields: {
      total: {
        type: GraphQLInt,
        resolve: ({ source }) => {
          return source[`count${fnTargetname}s`]();
        }
      }
    },
  });
  return {
    type: connectionType,
    args: connectionArgs,
    resolve: resolve.bind(null, target)
  }
}