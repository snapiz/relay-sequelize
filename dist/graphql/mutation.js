"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attributeInputFields = attributeInputFields;
exports.inputArgsToWhere = inputArgsToWhere;
exports.createMutations = createMutations;
exports.createAssociationMutations = createAssociationMutations;

var _graphql = require("graphql");

var _lodash = require("lodash");

var _graphqlSequelize = require("graphql-sequelize");

var _graphqlRelay = require("graphql-relay");

var _utils = require("../utils");

var _type = require("./type");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function attributeInputFields(model, options) {
  options = Object.assign({}, {
    globalId: true
  }, options || {});

  var exclude = options.exclude || [];

  options.exclude = function (key) {
    return ~exclude.indexOf(key) || model.rawAttributes[key]._autoGenerated && !model.rawAttributes[key].references && !model.rawAttributes[key].primaryKey;
  };

  var fields = (0, _graphqlSequelize.attributeFields)(model, {
    commentToDescription: true,
    globalId: false,
    exclude: options.exclude
  });

  return Object.keys(fields).reduce(function (obj, key) {
    if (options.only && !~options.only.indexOf(key)) {
      delete obj[key];
      return obj;
    }

    if (options.globalId && model.rawAttributes[key] && model.rawAttributes[key].references || model.rawAttributes[key].primaryKey) {
      obj[key] = { type: model.rawAttributes[key].allowNull ? _graphql.GraphQLString : new _graphql.GraphQLNonNull(_graphql.GraphQLString) };
    }

    return obj;
  }, fields);
}

function inputArgsToWhere(model, args) {
  return Object.keys(args).reduce(function (obj, key) {
    if (model.rawAttributes[key] && (model.rawAttributes[key].references || model.rawAttributes[key].primaryKey)) {
      obj[key] = parseInt((0, _graphqlRelay.fromGlobalId)(args[key]).id, 10);
    } else {
      obj[key] = args[key];
    }

    return obj;
  }, {});
}

function createMutations(model, nodeInterface) {
  var _Object$assign;

  var name = (0, _lodash.upperFirst)(model.name);

  var options = (0, _lodash.mergeWith)({
    create: {
      exclude: []
    },
    update: {
      exclude: []
    },
    delete: {}
  }, model.options, _utils.customizer);

  var before = options.before,
      create = options.create,
      update = options.update;


  create.exclude.push(model.primaryKeyAttribute);

  var objectType = (0, _type.createObjectType)(model, nodeInterface);

  if (model.primaryKeyAttributes.length > 1) {
    return {};
  }

  return Object.assign((_Object$assign = {}, _defineProperty(_Object$assign, "create" + name, {
    name: "Create" + name,
    inputFields: attributeInputFields(model, { exclude: create.exclude }),
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(objectType.name), {
      type: objectType,
      resolve: function resolve(source) {
        return source;
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
      args = inputArgsToWhere(model, args);

      if (before) {
        before(args, context, info);
      }

      if (create.before) {
        create.before(args, context, info);
      }

      return model.create(args).then(function (row) {
        if (create.after) {
          create.after(args, context, info, row);
        }

        return row;
      });
    }
  }), _defineProperty(_Object$assign, "update" + name, {
    name: "Update" + name,
    inputFields: attributeInputFields(model, { exclude: update.exclude }),
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(objectType.name), {
      type: objectType,
      resolve: function resolve(source) {
        return source;
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
      args = inputArgsToWhere(model, args);

      return model.findById(args.id).then(function (row) {
        if (!row) {
          throw new Error(model.name + " not foud");
        }

        if (before) {
          before(args, context, info);
        }

        if (update.before) {
          update.before(args, context, info, row);
        }

        return row.update(args);
      }).then(function (row) {
        if (update.after) {
          update.after(args, context, info, row);
        }

        return row;
      });
    }
  }), _defineProperty(_Object$assign, "delete" + name, {
    name: "Delete" + name,
    inputFields: attributeInputFields(model, { only: model.primaryKeyAttributes }),
    outputFields: _defineProperty({}, (0, _lodash.camelCase)(objectType.name), {
      type: objectType,
      resolve: function resolve(source) {
        return source;
      }
    }),
    mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
      args = inputArgsToWhere(model, args);

      return model.findById(args.id).then(function (row) {
        if (!row) {
          throw new Error(model.name + " not found");
        }

        if (before) {
          before(args, context, info);
        }

        if (options.delete.before) {
          options.delete.before(args, context, info, row);
        }

        return row ? row.destroy().then(function () {
          if (options.delete.after) {
            options.delete.after(args, context, info, row);
          }

          return row;
        }) : {};
      });
    }
  }), _Object$assign), createAssociationMutations(model, nodeInterface));
}

function createAssociationMutations(model, nodeInterface) {
  var name = (0, _lodash.upperFirst)(model.name);

  var _attributeInputFields = attributeInputFields(model, { only: model.primaryKeyAttributes }),
      id = _attributeInputFields.id;

  var objectType = (0, _type.createObjectType)(model, nodeInterface);

  return Object.keys(model.associations).reduce(function (obj, e) {
    var association = model.associations[e];
    var associationName = (0, _lodash.upperFirst)(e);

    if (association.associationType !== "BelongsToMany") {
      return obj;
    }

    var _mergeWith = (0, _lodash.mergeWith)({
      manyToMany: {}
    }, association.target.options, _utils.customizer),
        manyToMany = _mergeWith.manyToMany;

    var fields = attributeInputFields(association.target, { only: association.target.primaryKeyAttribute });
    var fieldName = (0, _lodash.camelCase)(association.target.name) + "Ids";
    var inputFields = _defineProperty({
      id: id
    }, fieldName, { type: new _graphql.GraphQLNonNull(new _graphql.GraphQLList(fields[association.target.primaryKeyAttribute].type)) });

    obj["add" + name + associationName] = {
      name: "Add" + name + associationName,
      inputFields: inputFields,
      outputFields: _defineProperty({}, (0, _lodash.camelCase)(objectType.name), {
        type: objectType,
        resolve: function resolve(source) {
          return source;
        }
      }),
      mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
        args.id = parseInt((0, _graphqlRelay.fromGlobalId)(args.id).id, 10);
        args[fieldName] = args[fieldName].map(function (i) {
          return parseInt((0, _graphqlRelay.fromGlobalId)(i).id, 10);
        });

        return model.findById(args.id).then(function (row) {
          if (!row) {
            throw new Error(model.name + " not found");
          }

          return association.target.findAll({ where: { id: { $in: args[fieldName] } } }).then(function (items) {
            if (manyToMany.before) {
              manyToMany.before(context, row, items);
            }

            row["add" + associationName](items);

            if (manyToMany.after) {
              manyToMany.after(context, row, items);
            }

            return row.save();
          });
        });
      }
    };

    obj["remove" + name + associationName] = {
      name: "Remove" + name + associationName,
      inputFields: inputFields,
      outputFields: _defineProperty({}, (0, _lodash.camelCase)(objectType.name), {
        type: objectType,
        resolve: function resolve(source) {
          return source;
        }
      }),
      mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
        args.id = parseInt((0, _graphqlRelay.fromGlobalId)(args.id).id, 10);
        args[fieldName] = args[fieldName].map(function (i) {
          return parseInt((0, _graphqlRelay.fromGlobalId)(i).id, 10);
        });

        return model.findById(args.id).then(function (row) {
          if (!row) {
            throw new Error(model.name + " not found");
          }

          return association.target.findAll({ where: { id: { $in: args[fieldName] } } }).then(function (items) {
            if (manyToMany.before) {
              manyToMany.before(context, row, items);
            }

            row["remove" + associationName](items);

            if (manyToMany.after) {
              manyToMany.after(context, row, items);
            }

            return row.save();
          });
        });
      }
    };

    obj["set" + name + associationName] = {
      name: "Set" + name + associationName,
      inputFields: inputFields,
      outputFields: _defineProperty({}, (0, _lodash.camelCase)(objectType.name), {
        type: objectType,
        resolve: function resolve(source) {
          return source;
        }
      }),
      mutateAndGetPayload: function mutateAndGetPayload(args, context, info) {
        args.id = parseInt((0, _graphqlRelay.fromGlobalId)(args.id).id, 10);
        args[fieldName] = args[fieldName].map(function (i) {
          return parseInt((0, _graphqlRelay.fromGlobalId)(i).id, 10);
        });

        return model.findById(args.id).then(function (row) {
          if (!row) {
            throw new Error(model.name + " not found");
          }

          return association.target.findAll({ where: { id: { $in: args[fieldName] } } }).then(function (items) {
            if (manyToMany.before) {
              manyToMany.before(context, row, items);
            }

            row["set" + associationName](items);

            if (manyToMany.after) {
              manyToMany.after(context, row, items);
            }

            return model.findById(args.id);
          });
        });
      }
    };

    return obj;
  }, {});
}