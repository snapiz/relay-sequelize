const { expect } = require('chai');
const { createSequelizeGraphql, sequelizeGraphQLObjectTypes } = require('../../src');
const sequelize = require('../data/sequelize');

describe('#createSequelizeGraphql()', function () {
  const { queries, mutations, nodeTypeMapper } = createSequelizeGraphql(sequelize);
  describe('nodeMapper', function() {
    it('should have 4 node types', function(){
      expect(Object.keys(nodeTypeMapper.map)).to.lengthOf(4);
    });
  });
  describe('user', function () {
    it('type should be defined', function () {
      expect(sequelizeGraphQLObjectTypes.user).to.not.be.undefined;
    });
    it('type should have fields', function () {
      expect(sequelizeGraphQLObjectTypes.user._typeConfig.fields).to.not.be.undefined;
    });
    it('type should have id', function () {
      expect(sequelizeGraphQLObjectTypes.user._typeConfig.fields.id).to.not.be.undefined;
    });
    it('type should have email', function () {
      expect(sequelizeGraphQLObjectTypes.user._typeConfig.fields.email).to.not.be.undefined;
    });
    it('type should not have password', function () {
      expect(sequelizeGraphQLObjectTypes.user._typeConfig.fields.password).to.be.undefined;
    });
    it('type should have todos', function () {
      expect(sequelizeGraphQLObjectTypes.user._typeConfig.fields.todos).to.not.be.undefined;
    });
    it('type should have assignedTodos', function () {
      expect(sequelizeGraphQLObjectTypes.user._typeConfig.fields.assignedTodos).to.not.be.undefined;
    });
    it('find query should be defined', function () {
      expect(queries.user).to.not.be.undefined;
    });
    it('findAll query should be defined', function () {
      expect(queries.users).to.not.be.undefined;
    });
    it('create mutation should be defined', function () {
      expect(mutations.createUser).to.not.be.undefined;
    });
    it('update mutation should be defined', function () {
      expect(mutations.updateUser).to.not.be.undefined;
    });
    it('delete mutation should be defined', function () {
      expect(mutations.deleteUser).to.not.be.undefined;
    });
  });
  describe('todo', function () {
    it('type should be defined', function () {
      expect(sequelizeGraphQLObjectTypes.todo).to.not.be.undefined;
    });
    it('type should have fields', function () {
      expect(sequelizeGraphQLObjectTypes.todo._typeConfig.fields).to.not.be.undefined;
    });
    it('type should have id', function () {
      expect(sequelizeGraphQLObjectTypes.todo._typeConfig.fields.id).to.not.be.undefined;
    });
    it('type should have text', function () {
      expect(sequelizeGraphQLObjectTypes.todo._typeConfig.fields.text).to.not.be.undefined;
    });
    it('type should have completed', function () {
      expect(sequelizeGraphQLObjectTypes.todo._typeConfig.fields.completed).to.not.be.undefined;
    });
    it('type should have assignees', function () {
      expect(sequelizeGraphQLObjectTypes.todo._typeConfig.fields.assignees).to.not.be.undefined;
    });
    it('type should have owner', function () {
      expect(sequelizeGraphQLObjectTypes.todo._typeConfig.fields.owner).to.not.be.undefined;
    });
    it('type should have todoNotes', function () {
      expect(sequelizeGraphQLObjectTypes.todo._typeConfig.fields.todoNotes).to.not.be.undefined;
    });
    it('find query should be defined', function () {
      expect(queries.todo).to.not.be.undefined;
    });
    it('findAll query should be defined', function () {
      expect(queries.todos).to.not.be.undefined;
    });
    it('create mutation should be defined', function () {
      expect(mutations.createTodo).to.not.be.undefined;
    });
    it('update mutation should be defined', function () {
      expect(mutations.updateTodo).to.not.be.undefined;
    });
    it('delete mutation should be defined', function () {
      expect(mutations.deleteTodo).to.not.be.undefined;
    });
  });
  describe('todoNote', function () {
    it('type should be defined', function () {
      expect(sequelizeGraphQLObjectTypes.todoNote).to.not.be.undefined;
    });
    it('type should have fields', function () {
      expect(sequelizeGraphQLObjectTypes.todoNote._typeConfig.fields).to.not.be.undefined;
    });
    it('type should have id', function () {
      expect(sequelizeGraphQLObjectTypes.todoNote._typeConfig.fields.id).to.not.be.undefined;
    });
    it('type should have text', function () {
      expect(sequelizeGraphQLObjectTypes.todoNote._typeConfig.fields.text).to.not.be.undefined;
    });
    it('type should have todo', function () {
      expect(sequelizeGraphQLObjectTypes.todoNote._typeConfig.fields.todo).to.not.be.undefined;
    });
    it('find query should be defined', function () {
      expect(queries.todoNote).to.not.be.undefined;
    });
    it('findAll query should be defined', function () {
      expect(queries.todoNotes).to.not.be.undefined;
    });
    it('create mutation should be defined', function () {
      expect(mutations.createTodoNote).to.not.be.undefined;
    });
    it('update mutation should be defined', function () {
      expect(mutations.updateTodoNote).to.not.be.undefined;
    });
    it('delete mutation should be defined', function () {
      expect(mutations.deleteTodoNote).to.not.be.undefined;
    });
  });
  describe('todoAssignee', function () {
    it('type should be defined', function () {
      expect(sequelizeGraphQLObjectTypes.todoAssignee).to.not.be.undefined;
    });
    it('type should have fields', function () {
      expect(sequelizeGraphQLObjectTypes.todoAssignee._typeConfig.fields).to.not.be.undefined;
    });
    it('type should have id', function () {
      expect(sequelizeGraphQLObjectTypes.todoAssignee._typeConfig.fields.id).to.not.be.undefined;
    });
    it('type should have primary', function () {
      expect(sequelizeGraphQLObjectTypes.todoAssignee._typeConfig.fields.primary).to.not.be.undefined;
    });
    it('find query should be defined', function () {
      expect(queries.todoAssignee).to.not.be.undefined;
    });
    it('findAll query should be defined', function () {
      expect(queries.todoAssignees).to.not.be.undefined;
    });
    it('create mutation should be defined', function () {
      expect(mutations.createTodoAssignee).to.not.be.undefined;
    });
    it('update mutation should be defined', function () {
      expect(mutations.updateTodoAssignee).to.not.be.undefined;
    });
    it('delete mutation should be defined', function () {
      expect(mutations.deleteTodoAssignee).to.not.be.undefined;
    });
  });
});