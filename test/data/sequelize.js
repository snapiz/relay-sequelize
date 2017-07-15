const Sequelize = require('sequelize');
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
    graphql: {
      before: function (args, context, info) {
        const { isAdmin } = context.user;
        if (!isAdmin) {
          throw new Error("You are not allow to perform this action");
        }
      },
      find: {
        exclude: ['password'],
        before: function (args, context, info) {
          const { isAllowFind } = context.user;
          if (isAllowFind !== undefined && !isAllowFind) {
            throw new Error("You are not allow to perform this action");
          }
        }
      },
      create: {
        before: function (args, context, info) {
          args.email = "tr_" + args.email;
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
    graphql: {
      orderBy: {
        TEXT: { value: ['text', 'DESC'] },
      }
    }
  });

let TodoNote = sequelize.define('todoNote', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

let TodoAssignee = sequelize.define('todoAssignee', {
  primary: {
    type: Sequelize.BOOLEAN
  }
}, {
    graphql: false
  });

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

module.exports = sequelize;