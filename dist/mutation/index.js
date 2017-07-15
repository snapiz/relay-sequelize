"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCreateMutation = createCreateMutation;
exports.createDeleteMutation = createDeleteMutation;
exports.createUpdateMutation = createUpdateMutation;

var _graphqlRelay = require("graphql-relay");

var _lodash = require("lodash");

var _graphql = require("graphql");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('graphql-sequelize'),
    attributeFields = _require.attributeFields;

function createCreateMutation(model, graphqlType) {
  var _model$options$graphq = model.options.graphql = (0, _lodash.merge)({
    create: {
      exclude: []
    }
  }, model.options.graphql),
      exclude = _model$options$graphq.create.exclude;

  exclude.push('id', 'createdAt', 'updatedAt');

  return (0, _graphqlRelay.mutationWithClientMutationId)({
    name: "create" + (0, _lodash.upperFirst)(model.name),
    inputFields: attributeFields(model, {
      commentToDescription: true,
      globalId: false,
      exclude: exclude
    }),
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(model.name), {
      type: graphqlType,
      resolve: function resolve(_ref) {
        var dataValues = _ref.dataValues;

        return dataValues;
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args) {
      return model.create(args);
    }
  });;
}
function createDeleteMutation(model, graphqlType) {
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

  return (0, _graphqlRelay.mutationWithClientMutationId)({
    name: "delete" + (0, _lodash.upperFirst)(model.name),
    inputFields: {
      id: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) }
    },
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(model.name), {
      type: graphqlType,
      resolve: function resolve(_ref2) {
        var dataValues = _ref2.dataValues;

        return dataValues;
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args) {
      return model.findById(parseInt((0, _graphqlRelay.fromGlobalId)(args.id).id, 10)).then(function (row) {
        return row ? row.destroy(args).then(function () {
          return row;
        }) : {};
      });
    }
  });;
}
function createUpdateMutation(model, graphqlType) {
  var _model$options$graphq2 = model.options.graphql = (0, _lodash.merge)({
    update: {
      exclude: []
    }
  }, model.options.graphql),
      exclude = _model$options$graphq2.update.exclude;

  exclude.push('id', 'createdAt', 'updatedAt');

  return (0, _graphqlRelay.mutationWithClientMutationId)({
    name: "update" + (0, _lodash.upperFirst)(model.name),
    inputFields: (0, _lodash.merge)({ id: { type: new _graphql.GraphQLNonNull(_graphql.GraphQLString) } }, attributeFields(model, {
      commentToDescription: true,
      globalId: false,
      exclude: exclude
    })),
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(model.name), {
      type: graphqlType,
      resolve: function resolve(_ref3) {
        var dataValues = _ref3.dataValues;

        return dataValues;
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args) {
      return model.findById(parseInt((0, _graphqlRelay.fromGlobalId)(args.id).id, 10)).then(function (row) {
        return row ? row.update(args) : {};
      });
    }
  });;
}