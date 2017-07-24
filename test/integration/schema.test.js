const { expect } = require('chai');
const { sequelizeGraphQLObjectTypes, createSequelizeGraphqlSchema } = require('../../src');
const { base64, unbase64 } = require('../../src/utils/base64');
const sequelize = require('../data/sequelize');
const sequelize_fixtures = require('sequelize-fixtures');
const { graphql } = require('graphql');

describe('#createSequelizeGraphql()', function () {
  const schema = createSequelizeGraphqlSchema(sequelize, {
    queries: function (nodeInterface, resolver) {
      return {
        viewer: {
          type: sequelizeGraphQLObjectTypes.user,
          resolve: function (obj, args, context, info) {
            args.id = 1;
            return resolver(sequelize.models.user)(obj, args, context, info);
          }
        }
      };
    }
  });
  describe('viewer', function () {
    it('should found first of 2 users', function () {
      return graphql(schema, `
        query {
          viewer {
            id
            email
            todos(first: 2) {
              total
              edges {
                cursor
                node {
                  id
                  text
                  completed
                }
              }
            }
          }
        }
      `).then(function (result) {
          expect(result).to.not.undefined;
          expect(result.data.viewer).to.not.null;

          const { id, email, todos } = result.data.viewer;
          expect(unbase64(id)).to.be.equal('user:1');
          expect(email).to.be.equal('user1@gmail.com');
          expect(todos.total).to.equal(3);
          expect(todos.edges).lengthOf(2);
          expect(unbase64(todos.edges[0].node.id)).to.be.equal('todo:1');
          expect(todos.edges[0].node.text).to.be.equal('User has to be great');
          expect(todos.edges[0].node.completed).to.be.equal(true);
          expect(unbase64(todos.edges[1].node.id)).to.be.equal('todo:3');
          expect(todos.edges[1].node.text).to.be.equal('My boat has to be very clean before meeting some girl');
          expect(todos.edges[1].node.completed).to.be.equal(false);
          return true;
        })
    });
  });
  describe('query', function () {
    it('should find on user', function () {
      return graphql(schema, `
        query {
          users {
            id
            email
          }
        }
      `, {}, { user: { isAdmin: true, isAllowFind: true } }).then(function (result) {
          expect(result).to.not.undefined;
          expect(result.errors).to.undefined;
          expect(result.data.users).to.not.null;
          return true;
        })
    });
    it('should not allow to find on user', function () {
      return graphql(schema, `
        query {
          users {
            id
            email
          }
        }
      `, {}, { user: { isAdmin: true, isAllowFind: false } }).then(function (result) {
          expect(result).to.not.undefined;
          expect(result.errors).to.not.undefined;
          expect(result.errors[0].message).to.be.equal('You are not allow to perform this action');
          return true;
        })
    });
    it('should not allow to find on user as not admin', function () {
      return graphql(schema, `
        query {
          users {
            id
            email
          }
        }
      `, {}, { user: { isAdmin: false } }).then(function (result) {
          expect(result).to.not.undefined;
          expect(result.errors).to.not.undefined;
          expect(result.errors[0].message).to.be.equal('You are not allow to perform this action');
          return true;
        })
    });

    it('should successfully create an user', function () {
      const createUserMutation = `
        mutation createUserTest($input: createUserInput!) {
          createUser(input: $input) {
            userEdge {
              cursor
              node {
                id
                email
              }
            }
          }
        }
      `;
      const createUserVariables = {
        "input": {
          "email": `user4@gmail.com`,
          "password": `user4user4`,
          "clientMutationId": "test"
        }
      };
      const cxt = {
        user: { isAdmin: true }
      };
      return graphql(schema, createUserMutation, {}, cxt, createUserVariables).then(function (result) {
        expect(result).to.not.undefined;
        expect(result.errors).to.undefined;
        expect(result.data.createUser.userEdge.node.email).to.be.equals('tr_user4@gmail.com');

        return true;
      });
    });
    it('should successfully update an user', function () {
      const updateUserMutation = `
          mutation updateUserTest($input: updateUserInput!) {
            updateUser(input: $input) {
              userEdge {
                cursor
                node {
                  id
                  email
                }
              }
            }
          }
        `;
      const updateUserVariables = {
        "input": {
          "id": "dXNlcjox",
          "email": `user4_updated@gmail.com`,
          "password": `user4user4`,
          "clientMutationId": "test"
        }
      };
      const cxt = {
        user: { isAdmin: true }
      };
      return graphql(schema, updateUserMutation, {}, cxt, updateUserVariables).then(function (result) {
        expect(result).to.not.undefined;
        expect(result.errors).to.undefined;
        expect(result.data.updateUser.userEdge.node.email).to.be.equals('user4_updated@gmail.com');
        return true;
      })
    });
    it('should successfully delete an user', function () {
      const deleteeUserMutation = `
          mutation deleteUserTest($input: deleteUserInput!) {
            deleteUser(input: $input) {
              userEdge {
                cursor
                node {
                  id
                  email
                }
              }
            }
          }
        `;
      const deleteUserVariables = {
        "input": {
          "id": "dXNlcjox",
        }
      };
      const cxt = {
        user: { isAdmin: true }
      };
      return graphql(schema, deleteeUserMutation, {}, cxt, deleteUserVariables).then(function (result) {
        expect(result).to.not.undefined;
        expect(result.errors).to.undefined;
        expect(result.data.deleteUser.userEdge.node.id).to.be.equals('dXNlcjox');
        expect(result.data.deleteUser.userEdge.node.email).to.be.equals('user4_updated@gmail.com');

        return true;
      })
    });
    it('should not allow to create an user', function () {
      const createUserMutation = `
        mutation createUserTest($input: createUserInput!) {
          createUser(input: $input) {
            userEdge {
              cursor
              node {
                email
              }
            }
          }
        }
      `;
      const createUserVariables = {
        "input": {
          "email": `user4@gmail.com`,
          "password": `user4user4`,
          "clientMutationId": "test"
        }
      };
      const cxt = {
        user: { isAdmin: false }
      };
      return graphql(schema, createUserMutation, {}, cxt, createUserVariables).then(function (result) {
        expect(result).to.not.undefined;
        expect(result.errors).to.not.undefined;
        expect(result.errors[0].message).to.be.equal('You are not allow to perform this action');
        return true;
      })
    });
    it('should create an todoAssignee', function () {
      const createUserMutation = `
        mutation createTodoAssigneeest($input: createTodoAssigneeInput!) {
          createTodoAssignee(input: $input) {
            todoAssigneeEdge {
              cursor
              node {
                id
              }
            }
          }
        }
      `;
      const createUserVariables = {
        "input": {
          "user_id": base64("user:3"),
          "todo_id": base64("todo:6"),
          "clientMutationId": "test"
        }
      };
      const cxt = {
        user: { isAdmin: true }
      };
      return graphql(schema, createUserMutation, {}, cxt, createUserVariables).then(function (result) {
        expect(result).to.not.undefined;
        expect(result.errors).to.undefined;
        expect(result.data.createTodoAssignee).to.not.undefined;

        return true;
      })
    });
    it('should query one user', function () {
      const createUserMutation = `
        query queryUser($id: String!) {
          user(id: $id) {
            node {
              id,
              email
            }
          }
        }
      `;
      const createUserVariables = {
        "id": base64("user:2")
      };
      const cxt = {
        user: { isAdmin: true }
      };
      return graphql(schema, createUserMutation, {}, cxt, createUserVariables).then(function (result) {
        expect(result).to.not.undefined;
        expect(result.errors).to.undefined;
        expect(result.data.user).to.not.undefined;
        const { email } = result.data.user.node;
        expect(email).to.be.eq("user2@gmail.com");
        
        return true;
      })
    });
  });
}); 