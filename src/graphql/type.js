import { customizer } from "../utils";
import { merge, camelCase, upperFirst, mergeWith } from "lodash";
import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLEnumType } from "graphql";
import { attributeFields, relay, resolver } from "graphql-sequelize";
import { fromGlobalId } from "graphql-relay";

export const objectTypes = {};
export const nodeTypes = {};

export function createObjectType(model, nodeInterface) {
  if (!model) {
    throw new Error("model is not defined");
  }

  const name = upperFirst(camelCase(model.name));

  const options = mergeWith({
    find: { exclude: [] }
  }, model.options || {}, customizer);

  if (objectTypes[name]) {
    return objectTypes[name];
  }

  let fields = attributeFields(model, {
    commentToDescription: true,
    globalId: true,
    exclude: (key) => ~options.find.exclude.indexOf(key) || model.rawAttributes[key].references
  });

  const objectType = new GraphQLObjectType({
    name: `${name}`,
    fields: fields,
    interfaces: [nodeInterface]
  });

  objectTypes[name] = objectType;
  nodeTypes[model.name] = {
    type: objectType,
    resolve(globalId, context) {
      const { id } = fromGlobalId(globalId);

      return model.findById(id).then((e) => {
        if (options.one && options.one.before) {
          options.one.before(e, context);
        }

        return e;
      });
    }
  }

  Object.keys(model.associations).reduce(function (obj, associationName) {
    const association = model.associations[associationName];
    const associationObjectType = createObjectType(association.target, nodeInterface);

    if (association.associationType === "BelongsTo") {
      fields[associationName] = {
        type: associationObjectType,
        resolve: resolver(association)
      };

      return fields;
    }

    const uAssociationName = upperFirst(associationName);
    const { connectionType, connectionArgs, resolve } = relay.sequelizeConnection({
      name: uAssociationName,
      nodeType: createObjectType(association.target, nodeInterface),
      target: association,
      orderBy: createOrderByEnum(association.target),
      connectionFields: {
        total: {
          type: GraphQLInt,
          resolve: ({ source }) => {
            return source[`count${uAssociationName}`]();
          }
        }
      },
    });

    fields[associationName] = {
      type: connectionType,
      args: connectionArgs,
      resolve: resolve
    }

    return fields;
  }, fields);

  return objectType;
}

export function createOrderByEnum(model) {
  const name = upperFirst(camelCase(model.name)) + "OrderBY";

  if (model.options.orderBy && !objectTypes[name]) {
    objectTypes[name] = new GraphQLEnumType({
      name: name,
      values: model.options.orderBy
    })
  }

  return objectTypes[name];
}