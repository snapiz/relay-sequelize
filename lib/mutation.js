"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCreateMutation = createCreateMutation;
exports.createUpdateMutation = createUpdateMutation;
exports.createDeleteMutation = createDeleteMutation;

var _graphqlRelay = require("graphql-relay");

var _lodash = require("lodash");

var _graphql = require("graphql");

var _cursor = require("./utils/cursor");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('graphql-sequelize'),
    attributeFields = _require.attributeFields;

function createCreateMutation(model, graphqlType) {
  var _model$options$graphq = model.options.graphql = (0, _lodash.merge)({
    create: {
      exclude: []
    }
  }, model.options.graphql),
      _model$options$graphq2 = _model$options$graphq.create,
      exclude = _model$options$graphq2.exclude,
      before = _model$options$graphq2.before;

  exclude.push('id', 'createdAt', 'updatedAt');

  return (0, _graphqlRelay.mutationWithClientMutationId)({
    name: "create" + (0, _lodash.upperFirst)(model.name),
    inputFields: attributeFields(model, {
      commentToDescription: true,
      globalId: false,
      exclude: exclude
    }),
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(graphqlType.name), {
      type: graphqlType,
      resolve: function resolve(_ref) {
        var dataValues = _ref.dataValues;

        return { node: dataValues, cursor: (0, _cursor.toCursor)(dataValues) };
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
      if (model.options.graphql && model.options.graphql.before) {
        model.options.graphql.before(args, context, info);
      }
      if (before) {
        before(args, context, info);
      }
      return model.create(args);
    }
  });;
}

function createUpdateMutation(model, graphqlType) {
  var _model$options$graphq3 = model.options.graphql = (0, _lodash.merge)({
    update: {
      exclude: []
    }
  }, model.options.graphql),
      _model$options$graphq4 = _model$options$graphq3.update,
      exclude = _model$options$graphq4.exclude,
      before = _model$options$graphq4.before;

  exclude.push('id', 'createdAt', 'updatedAt');

  return (0, _graphqlRelay.mutationWithClientMutationId)({
    name: "update" + (0, _lodash.upperFirst)(model.name),
    inputFields: (0, _lodash.merge)({ id: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) } }, attributeFields(model, {
      commentToDescription: true,
      globalId: false,
      exclude: exclude
    })),
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(graphqlType.name), {
      type: graphqlType,
      resolve: function resolve(_ref2) {
        var dataValues = _ref2.dataValues;

        return dataValues ? { node: dataValues, cursor: (0, _cursor.toCursor)(dataValues) } : null;
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
      return model.findById(parseInt((0, _graphqlRelay.fromGlobalId)(args.id).id, 10)).then(function (row) {
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
    }
  });;
}

function createDeleteMutation(model, graphqlType) {
  var _model$options$graphq5 = model.options.graphql = (0, _lodash.merge)({
    delete: {}
  }, model.options.graphql),
      before = _model$options$graphq5.delete.before;

  return (0, _graphqlRelay.mutationWithClientMutationId)({
    name: "delete" + (0, _lodash.upperFirst)(model.name),
    inputFields: {
      id: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) }
    },
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(graphqlType.name), {
      type: graphqlType,
      resolve: function resolve(_ref3) {
        var dataValues = _ref3.dataValues;

        return dataValues ? { node: dataValues, cursor: (0, _cursor.toCursor)(dataValues) } : null;
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
      return model.findById(parseInt((0, _graphqlRelay.fromGlobalId)(args.id).id, 10)).then(function (row) {
        if (!row) {
          return {};
        }
        if (model.options.graphql && model.options.graphql.before) {
          model.options.graphql.before(args, context, info);
        }
        if (before) {
          before(row, args, context, info);
        }
        return row ? row.destroy(args).then(function () {
          return row;
        }) : {};
      });
    }
  });;
}