"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createBelongToConnection = createBelongToConnection;
exports.createHasManyConnections = createHasManyConnections;

var _graphql = require("graphql");

var _graphqlRelay = require("graphql-relay");

var _base = require("../utils/base64");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require("graphql-sequelize"),
    sequelizeConnection = _require.relay.sequelizeConnection,
    resolver = _require.resolver;

function createBelongToConnection(association, graphQLObjectType) {
  return {
    type: graphQLObjectType,
    resolve: resolver(association, {
      separate: true
    })
  };
}

function toCursor(item) {
  return (0, _base.base64)(String(new Date(item.get("createdAt")).getTime()));
}

function fromCursor(cursor) {
  return cursor ? (0, _base.unbase64)(cursor) : undefined;
}

function resolve(target, source, args, context, info) {
  var after = args.after,
      before = args.before,
      first = args.first,
      last = args.last;

  var cursor = fromCursor(after || before);
  var orderByAttribute = "createdAt";
  var orderByDirection = last ? "DESC" : "ASC";

  var options = {
    order: [[orderByAttribute, orderByDirection]],
    limit: first || last
  };

  if (cursor) {
    var operator = before ? '$lt' : '$gt';
    options.where = {
      "createdAt": _defineProperty({}, operator, Number(cursor))
    };
  }
  console.log("count" + target.name + "s");
  return Promise.all(source["get" + target.name + "s"](options), source["count" + target.name + "s"]()).then(function (items, total) {
    console.log(total);
    var edges = items.map(function (item) {
      return { node: item, cursor: toCursor(item) };
    });
    return {
      edges: edges,
      pageInfo: {
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        hasPreviousPage: false,
        hasNextPage: false
      },
      source: source
    };;
  });
};

function createHasManyConnections(_ref, graphQLObjectType, name) {
  var target = _ref.target;

  var _sequelizeConnection = sequelizeConnection({
    name: name,
    nodeType: graphQLObjectType,
    target: target,
    connectionFields: {
      total: {
        type: _graphql.GraphQLInt,
        resolve: function resolve(_ref2) {
          var source = _ref2.source;

          return source["count" + target.name + "s"]();
        }
      }
    }
  }),
      connectionType = _sequelizeConnection.connectionType,
      connectionArgs = _sequelizeConnection.connectionArgs;

  return {
    type: connectionType,
    args: connectionArgs,
    resolve: resolve.bind(null, target)
  };
}