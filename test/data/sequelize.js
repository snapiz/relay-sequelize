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
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
    graphql: {
      before: function (obj, args, context, info) {

      },
      find: {
        exclude: ['password'],
        before: function (obj, args, context, info) {
          const { isAllowFind } = context;
          /* if (isAllowFind !== undefined && !isAllowFind) {
            throw new Error()
          } */
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