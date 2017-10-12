const { expect } = require("chai");
const { graphQLSchema } = require("../../data/sequelize");
const { graphql } = require("../../../src/graphql");
const { base64 } = require("../../../src/utils");

describe("Query", function () {
  describe("User", function () {
    const context = {};
    const allBeforeContext = { allBeforeThrow: true };
    const oneBeforeContext = { oneBeforeThrow: true };
    const afterContext = { afterThrow: true };
    const beforeContext = { beforeThrow: true };

    it("should query user 1", function () {
      const query = `
          query UserQuery($id: ID!) {
            node(id: $id) {
              ...on User {
                id
                email
                isAdmin
                todos {
                  total
                }
              }
            }
          }
        `;

      const variables = {
        id: base64("user:1")
      };

      return graphql(graphQLSchema, query, {}, context, variables).then((result) => {
        expect(result.errors).to.be.undefined;
        expect(result.data.node).not.to.be.null;

        const { data: { node: { id, email, isAdmin, todos: { total } } } } = result;

        expect(id).to.equal(variables.id);
        expect(email).to.equal("user1@gmail.com");
        expect(isAdmin).to.be.true;
        expect(total).to.equal(3);

        return true;
      })
    })

    it("should query user 2", function () {
      const query = `
          query UserQuery($id: ID!) {
            user: node(id: $id) {
              ...on User {
                id
                email
                isAdmin
                todos {
                  total
                }
              }
            }
          }
        `;

      const variables = {
        id: base64("user:2")
      };

      return graphql(graphQLSchema, query, {}, context, variables).then((result) => {
        expect(result.errors).to.be.undefined;
        expect(result.data.user).not.to.be.null;

        const { data: { user: { id, email, isAdmin, todos: { total } } } } = result;

        expect(id).to.equal(variables.id);
        expect(email).to.equal("user2@gmail.com");
        expect(isAdmin).to.be.false;
        expect(total).to.equal(1);

        return true;
      })
    })

    it('should throw Cannot query field "password" on type "User"', function () {
      const query = `
            query UserQuery($id: ID!) {
              node(id: $id) {
                ...on User {
                  id
                  email
                  isAdmin
                  password
                }
              }
            }
          `;

      const variables = {
        id: base64("user:1")
      };

      return graphql(graphQLSchema, query, {}, context, variables).then((result) => {
        expect(result.errors).not.to.be.undefined;
        expect(result.errors).lengthOf(1);
        expect(result.errors[0].message).to.equal('Cannot query field "password" on type "User".');
        expect(result.data).to.be.undefined;

        return true;
      })
    })

    it("should throw user one", function () {
      const query = `
          query UserQuery($id: ID!) {
            node(id: $id) {
              ...on User {
                id
                email
                isAdmin
              }
            }
          }
        `;

      const variables = {
        id: base64("user:1")
      };

      return graphql(graphQLSchema, query, {}, oneBeforeContext, variables).then((result) => {
        expect(result.data.node).to.be.null;
        expect(result.errors).not.to.be.undefined;
        expect(result.errors).lengthOf(1);
        expect(result.errors[0].message).to.equal("user one");

        return true;
      })
    })

    it("should query users", function () {
      const query = `
          query {
            users {
              total
              edges {
                node {
                  id
                  email
                  isAdmin
                  todos {
                    total
                  }
                }
              }
            }
          }
        `;

      return graphql(graphQLSchema, query).then((result) => {
        expect(result.errors).to.be.undefined;
        expect(result.data.users).not.to.be.null;

        const { data: { users: { total, edges: [user1, user2, user3] } } } = result;

        expect(total).to.equal(3);

        expect(user1.node.id).to.equal(base64("user:1"));
        expect(user1.node.email).to.equal("user1@gmail.com");
        expect(user1.node.isAdmin).to.be.true;
        expect(user1.node.todos.total).to.equal(3);

        expect(user2.node.id).to.equal(base64("user:2"));
        expect(user2.node.email).to.equal("user2@gmail.com");
        expect(user2.node.isAdmin).to.be.false;
        expect(user2.node.todos.total).to.equal(1);

        expect(user3.node.id).to.equal(base64("user:3"));
        expect(user3.node.email).to.equal("user3@gmail.com");
        expect(user3.node.isAdmin).to.be.false;
        expect(user3.node.todos.total).to.equal(2);

        return true;
      })
    })

    it('sould throw Cannot query field "password" on type "User".', function () {
      const query = `
          query {
            users {
              total
              edges {
                node {
                  id
                  email
                  isAdmin
                  password
                  todos {
                    total
                  }
                }
              }
            }
          }
        `;

      return graphql(graphQLSchema, query).then((result) => {
        expect(result.errors).not.to.be.undefined;
        expect(result.errors).lengthOf(1);
        expect(result.errors[0].message).to.equal('Cannot query field "password" on type "User".');
        expect(result.data).to.be.undefined;

        return true;
      })
    })

    it("should throw user find before", function () {
      const query = `
          query {
            users {
              total
              edges {
                node {
                  id
                  email
                  isAdmin
                  todos {
                    total
                  }
                }
              }
            }
          }
        `;

      return graphql(graphQLSchema, query, {}, beforeContext).then((result) => {
        expect(result.data.users).to.be.null;
        expect(result.errors).not.to.be.undefined;
        expect(result.errors).lengthOf(1);
        expect(result.errors[0].message).to.equal("user find before");

        return true;
      })
    })

    it("should throw user before", function () {
      const query = `
          query {
            users {
              total
              edges {
                node {
                  id
                  email
                  isAdmin
                  todos {
                    total
                  }
                }
              }
            }
          }
        `;

      return graphql(graphQLSchema, query, {}, allBeforeContext).then((result) => {
        expect(result.data.users).to.be.null;
        expect(result.errors).not.to.be.undefined;
        expect(result.errors).lengthOf(1);
        expect(result.errors[0].message).to.equal("user before");

        return true;
      })
    })
  })
})
