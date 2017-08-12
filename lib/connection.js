"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.createBelongToConnection = createBelongToConnection;
exports.createHasManyConnections = createHasManyConnections;

var _graphql = require("graphql");

var _graphqlRelay = require("graphql-relay");

var _utils = require("./utils");

var _lodash = require("lodash");

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

function resolve(target, source, args, context, info) {
  var createdAtField = target.rawAttributes.createdAt || target.rawAttributes.created_at;
  if (!createdAtField) {
    throw new Error("cannot found createdAt field");
  }
  var after = args.after,
      before = args.before,
      first = args.first,
      last = args.last;

  var cursor = (0, _utils.fromCursor)(after || before);
  var orderByDirection = last ? "DESC" : "ASC";

  var options = {
    order: [[createdAtField.field, orderByDirection]],
    limit: first || last
  };

  if (cursor) {
    var operator = before ? '$lt' : '$gt';
    options.where = _defineProperty({}, createdAtField.field, _defineProperty({}, operator, Number(cursor)));
  }
  var fnTargetname = (0, _lodash.capitalize)(target.name);
  return source["get" + fnTargetname + "s"](options).then(function (items) {
    var edges = items.map(function (item) {
      return { node: item, cursor: (0, _utils.toCursor)(item) };
    });

    var result = {
      edges: edges,
      pageInfo: {
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        hasPreviousPage: false,
        hasNextPage: false
      },
      source: source
    };

    var prevOptions = Object.assign({}, options, {
      where: _defineProperty({}, createdAtField.field, {
        $lt: Number((0, _utils.fromCursor)(result.pageInfo.startCursor))
      })
    });

    var nextOptions = Object.assign({}, options, {
      where: _defineProperty({}, createdAtField.field, {
        $gt: Number((0, _utils.fromCursor)(result.pageInfo.endCursor))
      })
    });

    return Promise.all([source["get" + fnTargetname + "s"](prevOptions), source["get" + fnTargetname + "s"](nextOptions)]).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          prev = _ref2[0],
          next = _ref2[1];

      result.pageInfo.hasPreviousPage = prev.length > 0;
      result.pageInfo.hasNextPage = next.length > 0;
      return result;
    });
  });
};

function createHasManyConnections(_ref3, graphQLObjectType, name) {
  var target = _ref3.target;

  var fnTargetname = (0, _lodash.capitalize)(target.name);

  var _sequelizeConnection = sequelizeConnection({
    name: name,
    nodeType: graphQLObjectType,
    target: target,
    connectionFields: {
      total: {
        type: _graphql.GraphQLInt,
        resolve: function resolve(_ref4) {
          var source = _ref4.source;

          return source["count" + fnTargetname + "s"]();
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