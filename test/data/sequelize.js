const Sequelize = require('sequelize');
const { createSchema } = require("../../src/graphql");
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: './test/data/db.sqlite',
  logging: false
});

let User = sequelize.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
    underscored: true,
    before: function (args, context, info) {
      if (context && context.allBeforeThrow) {
        throw new Error("user before");
      }
    },
    one: {
      before: function (source, context) {
        if (context && context.oneBeforeThrow) {
          throw new Error("user one");
        }
      }
    },
    find: {
      exclude: ['password'],
      before: function (args, context, info) {
        if (context && context.beforeThrow) {
          throw new Error("user find before");
        }
      }
    },
    update: {
      exclude: ['isAdmin'],
      before: function (args, context, info) {
        if (context && context.beforeThrow) {
          throw new Error("user update before");
        }
      },
      after: function (args, context, info) {
        if (context && context.afterThrow) {
          throw new Error("user update after");
        }
      }
    },
    delete: {
      before: function (args, context, info) {
        if (context && context.beforeThrow) {
          throw new Error("user delete before");
        }
      },
      after: function (args, context, info) {
        if (context && context.afterThrow) {
          throw new Error("user delete after");
        }
      }
    },
    manyToMany: {
      before: function (args, context, info) {
        if (context && context.beforeThrow) {
          throw new Error("user manyToMany before");
        }
      },
      after: function (args, context, info) {
        if (context && context.afterThrow) {
          throw new Error("user manyToMany after");
        }
      }
    },
    create: {
      before: function (args, context, info) {
        args.email = "tr_" + args.email;
        if (context && context.beforeThrow) {
          throw new Error("user create before");
        }
      },
      after: function (args, context, info) {
        if (context && context.afterThrow) {
          throw new Error("user create after");
        }
      }
    }
  });

let Todo = sequelize.define('todo', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
}, {
    underscored: true,
    before: function (args, context, info) {
      if (context && context.allBeforeThrow) {
        throw new Error("todo before");
      }
    },
    one: {
      before: function (source, context) {
        if (context && context.oneBeforeThrow) {
          throw new Error("todo one");
        }
      }
    },
    find: {
      before: function (args, context, info) {
        if (context && context.beforeThrow) {
          throw new Error("todo find before");
        }
      }
    },
    update: {
      before: function (args, context, info) {
        if (context && context.beforeThrow) {
          throw new Error("todo update before");
        }
      },
      after: function (args, context, info) {
        if (context && context.afterThrow) {
          throw new Error("todo update after");
        }
      }
    },
    delete: {
      before: function (args, context, info) {
        if (context && context.beforeThrow) {
          throw new Error("todo delete before");
        }
      },
      after: function (args, context, info) {
        if (context && context.afterThrow) {
          throw new Error("todo delete after");
        }
      }
    },
    manyToMany: {
      before: function (args, context, info) {
        if (context && context.beforeThrow) {
          throw new Error("todo manyToMany before");
        }
      },
      after: function (args, context, info) {
        if (context && context.afterThrow) {
          throw new Error("todo manyToMany after");
        }
      }
    },
    create: {
      before: function (args, context, info) {
        if (context && context.beforeThrow) {
          throw new Error("todo create before");
        }
      },
      after: function (args, context, info) {
        if (context && context.afterThrow) {
          throw new Error("todo create after");
        }
      }
    }
  });

let TodoNote = sequelize.define('todoNote', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

let TodoAssignee = sequelize.define('todoAssignee');

User.hasMany(Todo, {
  as: 'todos',
  foreignKey: 'userId'
});

User.belongsToMany(Todo, {
  as: 'assignedTodos',
  through: TodoAssignee
});

Todo.belongsToMany(User, {
  as: 'assignees',
  through: TodoAssignee
});

Todo.belongsTo(User, {
  as: 'owner',
  foreignKey: 'userId'
});

Todo.hasMany(TodoNote, {
  as: 'todoNotes',
  foreignKey: 'todoId'
});

TodoNote.belongsTo(Todo, {
  as: 'todo',
  foreignKey: 'todoId'
});

sequelize.graphQLSchema = createSchema(sequelize);

module.exports = sequelize;