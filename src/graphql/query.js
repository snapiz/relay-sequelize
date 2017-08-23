import { GraphQLObjectType, GraphQLInt, GraphQLEnumType } from "graphql";
import { relay } from "graphql-sequelize";
import { createObjectType, createOrderByEnum } from "./type";
import { camelCase, upperFirst } from "lodash";

export function createQueries(model, nodeInterface) {
  const name = camelCase(model.name);
  const uname = upperFirst(name);
  const { find, before } = model.options;

  const { connectionType, connectionArgs, resolve } = relay.sequelizeConnection({
    name: uname,
    nodeType: createObjectType(model, nodeInterface),
    target: model,
    orderBy: createOrderByEnum(model),
    connectionFields: {
      total: {
        type: GraphQLInt,
        resolve: () => {
          return model.count();
        }
      }
    },
  });

  return {
    [`${name}s`]: {
      type: connectionType,
      args: connectionArgs,
      resolve: (source, args, context, info) => {
        if (before) {
          before(args, context, info);
        }

        if (find && find.before) {
          find.before(args, context, info);
        }

        return resolve(source, args, context, info);
      }
    }
  };
}