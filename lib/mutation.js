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

var _graphql2 = require("./utils/graphql");

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
      before = _model$options$graphq2.before,
      after = _model$options$graphq2.after;

  return {
    name: "create" + (0, _lodash.upperFirst)(model.name),
    inputFields: (0, _lodash.merge)((0, _graphql2.parsePrimaryKeyinputFields)(model, { exclude: ["id"].concat(exclude) }), attributeFields(model, {
      commentToDescription: true,
      globalId: false,
      exclude: (0, _graphql2.defaultExcludeFields)(model, exclude)
    })),
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(graphqlType.name), {
      type: graphqlType,
      resolve: function resolve(source) {
        return (0, _graphql2.resolveEdge)(source);
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
      args = (0, _graphql2.argsToSequelize)(model, args);
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
    }
  };
}

function createUpdateMutation(model, graphqlType) {
  var _model$options$graphq3 = model.options.graphql = (0, _lodash.merge)({
    update: {
      exclude: []
    }
  }, model.options.graphql),
      _model$options$graphq4 = _model$options$graphq3.update,
      exclude = _model$options$graphq4.exclude,
      before = _model$options$graphq4.before,
      after = _model$options$graphq4.after;

  return {
    name: "update" + (0, _lodash.upperFirst)(model.name),
    inputFields: (0, _lodash.merge)((0, _graphql2.parsePrimaryKeyinputFields)(model, { exclude: exclude }), attributeFields(model, {
      commentToDescription: true,
      globalId: false,
      exclude: (0, _graphql2.defaultExcludeFields)(model, exclude)
    })),
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(graphqlType.name), {
      type: graphqlType,
      resolve: function resolve(source) {
        return (0, _graphql2.resolveEdge)(source);
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
      args = (0, _graphql2.argsToSequelize)(model, args);
      return model.findById(args.id).then(function (row) {
        if (!row) {
          throw new Error(model.name + " not found");
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
    }
  };
}

function createDeleteMutation(model, graphqlType) {
  var _model$options$graphq5 = model.options.graphql = (0, _lodash.merge)({
    delete: {}
  }, model.options.graphql),
      _model$options$graphq6 = _model$options$graphq5.delete,
      before = _model$options$graphq6.before,
      after = _model$options$graphq6.after;

  return {
    name: "delete" + (0, _lodash.upperFirst)(model.name),
    inputFields: {
      id: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) }
    },
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(graphqlType.name), {
      type: graphqlType,
      resolve: function resolve(source) {
        return (0, _graphql2.resolveEdge)(source);
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
      args = (0, _graphql2.argsToSequelize)(model, args);
      return model.findById(args.id).then(function (row) {
        if (!row) {
          throw new Error(model.name + " not found");
        }
        if (model.options.graphql && model.options.graphql.before) {
          model.options.graphql.before(args, context, info);
        }
        if (before) {
          before(args, context, info, row);
        }
        return row ? row.destroy(args).then(function () {
          if (after) {
            after(args, context, info, row);
          }
          return row;
        }) : {};
      });
    }
  };
}