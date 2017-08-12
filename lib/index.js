"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mutationNames = exports.graphiqlExpress = exports.graphqlExpress = exports.graphqlEdgeTypes = exports.sequelizeGraphQLObjectTypes = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _utils = require("./utils");

Object.keys(_utils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _utils[key];
    }
  });
});

var _type = require("./type");

Object.defineProperty(exports, "sequelizeGraphQLObjectTypes", {
  enumerable: true,
  get: function get() {
    return _type.sequelizeGraphQLObjectTypes;
  }
});
Object.defineProperty(exports, "graphqlEdgeTypes", {
  enumerable: true,
  get: function get() {
    return _type.graphqlEdgeTypes;
  }
});

var _graphqlServerExpress = require("graphql-server-express");

Object.defineProperty(exports, "graphqlExpress", {
  enumerable: true,
  get: function get() {
    return _graphqlServerExpress.graphqlExpress;
  }
});
Object.defineProperty(exports, "graphiqlExpress", {
  enumerable: true,
  get: function get() {
    return _graphqlServerExpress.graphiqlExpress;
  }
});
exports.createSequelizeGraphql = createSequelizeGraphql;
exports.createSequelizeGraphqlSchema = createSequelizeGraphqlSchema;

var _graphqlRelay = require("graphql-relay");

var _graphqlSequelize = require("graphql-sequelize");

var _graphql = require("graphql");

var _lodash = require("lodash");

var _mutation = require("./mutation");

var mutations = _interopRequireWildcard(_mutation);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('graphql-sequelize'),
    sequelizeNodeInterface = _require.relay.sequelizeNodeInterface,
    resolver = _require.resolver,
    attributeFields = _require.attributeFields;

var mutationNames = exports.mutationNames = ["create", "update", "delete"];

function createSequelizeGraphql(sequelize) {
  var _sequelizeNodeInterfa = sequelizeNodeInterface(sequelize),
      nodeField = _sequelizeNodeInterfa.nodeField,
      nodeInterface = _sequelizeNodeInterfa.nodeInterface,
      nodeTypeMapper = _sequelizeNodeInterfa.nodeTypeMapper;

  return Object.keys(sequelize.models).filter(function (name) {
    return sequelize.models[name].options.graphql !== false;
  }).reduce(function (obj, name) {
    var model = sequelize.models[name];
    var graphql = model.options.graphql;

    var _toGraphQLObjectType = (0, _type.toGraphQLObjectType)(model, nodeInterface),
        _toGraphQLObjectType2 = _slicedToArray(_toGraphQLObjectType, 2),
        gType = _toGraphQLObjectType2[0],
        edgeType = _toGraphQLObjectType2[1];

    var queryName = (0, _lodash.camelCase)(name);
    var mutationName = (0, _lodash.upperFirst)(queryName);

    obj.queries[queryName] = {
      type: edgeType,
      args: (0, _lodash.merge)((0, _graphqlSequelize.defaultArgs)(model), { id: { type: _graphql.GraphQLString } }),
      resolve: function resolve(obj, args, context, info) {
        args = (0, _utils.argsToSequelize)(model, args);
        if (graphql && graphql.before) {
          graphql.before(args, context, info);
        }
        if (graphql && graphql.find && graphql.find.before) {
          graphql.find.before(args, context, info);
        }
        return resolver(model)(obj, args, context, info).then(function (source) {
          return (0, _utils.resolveEdge)(source);
        });
      }
    };

    obj.queries[queryName + "s"] = {
      type: new _graphql.GraphQLList(gType),
      args: (0, _graphqlSequelize.defaultListArgs)(),
      resolve: function resolve(obj, args, context, info) {
        if (graphql && graphql.before) {
          graphql.before(args, context, info);
        }
        if (graphql && graphql.find && graphql.find.before) {
          graphql.find.before(args, context, info);
        }
        return resolver(model)(obj, args, context, info);
      }
    };

    mutationNames.reduce(function (mobj, mname) {
      mobj[mname + mutationName] = mutations["create" + (0, _lodash.upperFirst)(mname) + "Mutation"](model, edgeType);

      return mobj;
    }, obj.mutations);

    nodeTypeMapper.mapTypes(_defineProperty({}, name, gType));

    return obj;
  }, {
    queries: { node: nodeField },
    mutations: {},
    nodeTypeMapper: nodeTypeMapper,
    nodeInterface: nodeInterface
  });
}

function createSequelizeGraphqlSchema(sequelize) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _createSequelizeGraph = createSequelizeGraphql(sequelize),
      queries = _createSequelizeGraph.queries,
      mutations = _createSequelizeGraph.mutations,
      nodeTypeMapper = _createSequelizeGraph.nodeTypeMapper,
      nodeInterface = _createSequelizeGraph.nodeInterface;

  var _mutations = options.mutations ? Object.assign({}, mutations, options.mutations(nodeInterface, attributeFields)) : mutations;
  return new _graphql.GraphQLSchema({
    query: new _graphql.GraphQLObjectType({
      name: 'RootType',
      fields: options.queries ? Object.assign({}, queries, options.queries(nodeInterface, resolver)) : queries
    }),
    mutation: new _graphql.GraphQLObjectType({
      name: 'Mutation',
      fields: Object.keys(_mutations).reduce(function (data, current) {
        data[current] = (0, _graphqlRelay.mutationWithClientMutationId)(_mutations[current]);
        return data;
      }, {})
    })
  });
}