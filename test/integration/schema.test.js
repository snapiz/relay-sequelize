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
    it('should not be null', function () {
      return graphql(schema, `
        query {
          viewer {
            id
            email
            todos(first: 2) {
              total
              edges {
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
  describe('user', function () {
    it('should find, create, update and delete', function () {
      return graphql(schema, `
        query {
          users {
            id
            email
          }
        }
      `, {}, { user: { isAdmin: true, isAllowFind: true } }).then(function (result) {
          expect(result).to.not.undefined;
          return true;
        })
    });
    it('should not perform find request, but can create, update and delete', function () {
      return graphql(schema, `
        query {
          users {
            id
            email
          }
        }
      `, {}, { user: { isAdmin: true, isAllowFind: false } }).then(function (result) {
          expect(result).to.undefined;
          return true;
        })
    });
    it('should not be read', function () {
      return graphql(schema, `
        query {
          users {
            id
            email
          }
        }
      `, {}, { user: { isAdmin: false } }).then(function (result) {
          expect(result).to.undefined;
          return true;
        })
    });
  });
}); 