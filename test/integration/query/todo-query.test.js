const { expect } = require("chai");
const { graphQLSchema } = require("../../data/sequelize");
const { graphql } = require("../../../src/graphql");
const { base64 } = require("../../../src/utils");

describe("Query", function () {
  describe("Todo", function () {
    const context = {};
    const allBeforeContext = { allBeforeThrow: true };
    const oneBeforeContext = { oneBeforeThrow: true };
    const afterContext = { afterThrow: true };
    const beforeContext = { beforeThrow: true };

    it("should query todo 1", function () {
      const query = `
          query TodoQuery($id: ID!) {
            todo: node(id: $id) {
              ...on Todo {
                id
                text
                completed
                owner {
                  id
                  email
                }
              }
            }
          }
        `;

      const variables = {
        id: base64("todo:1")
      };

      return graphql(graphQLSchema, query, {}, context, variables).then((result) => {
        expect(result.errors).to.be.undefined;
        expect(result.data.todo).not.to.be.null;

        const { data: { todo: { id, text, completed, owner } } } = result;

        expect(id).to.equal(variables.id);
        expect(completed).to.be.true;
        expect(text).to.equal("User has to be great");
        expect(owner.id).to.equal(base64("user:1"));
        expect(owner.email).to.equal("user1@gmail.com");

        return true;
      })
    })

    it("should query todo 2", function () {
      const query = `
          query TodoQuery($id: ID!) {
            todo: node(id: $id) {
              ...on Todo {
                id
                text
                completed
                owner {
                  id
                  email
                }
              }
            }
          }
        `;

      const variables = {
        id: base64("todo:2")
      };

      return graphql(graphQLSchema, query, {}, context, variables).then((result) => {
        expect(result.errors).to.be.undefined;
        expect(result.data.todo).not.to.be.null;

        const { data: { todo: { id, text, completed, owner } } } = result;

        expect(id).to.equal(variables.id);
        expect(completed).to.be.false;
        expect(text).to.equal("Regular plane has a great wing");
        expect(owner.id).to.equal(base64("user:2"));
        expect(owner.email).to.equal("user2@gmail.com");

        return true;
      })
    })

    it("should throw todo one", function () {
      const query = `
          query TodoQuery($id: ID!) {
            todo: node(id: $id) {
              ...on Todo {
                id
                text
                completed
              }
            }
          }
        `;

      const variables = {
        id: base64("todo:1")
      };

      return graphql(graphQLSchema, query, {}, oneBeforeContext, variables).then((result) => {
        expect(result.data.todo).to.be.null;
        expect(result.errors).not.to.be.undefined;
        expect(result.errors).lengthOf(1);
        expect(result.errors[0].message).to.equal("todo one");

        return true;
      })
    })

    it("should query todo", function () {
      const query = `
          query {
            todos (last: 2) {
              total
              edges {
                node {
                  id
                  text
                  completed
                  owner {
                    id
                    email
                  }
                }
              }
            }
          }
        `;

      return graphql(graphQLSchema, query).then((result) => {
        expect(result.errors).to.be.undefined;
        expect(result.data.todos).not.to.be.null;

        const { data: { todos: { total, edges: [todo1, todo2] } } } = result;

        expect(total).to.equal(6);
        expect(result.data.todos.edges).to.lengthOf(2);

        expect(todo1.node.id).to.equal(base64("todo:6"));
        expect(todo1.node.text).to.equal("Everything will be all right");
        expect(todo1.node.completed).to.be.false;
        expect(todo1.node.owner.id).to.equal(base64("user:1"));
        expect(todo1.node.owner.email).to.equal("user1@gmail.com");

        expect(todo2.node.id).to.equal(base64("todo:5"));
        expect(todo2.node.text).to.equal("Just be your self with your soulmate");
        expect(todo2.node.completed).to.be.true;
        expect(todo2.node.owner.id).to.equal(base64("user:3"));
        expect(todo2.node.owner.email).to.equal("user3@gmail.com");

        return true;
      })
    })

    it("should throw todo find before", function () {
      const query = `
          query {
            todos {
              total
              edges {
                node {
                  id
                  text
                  completed
                  owner {
                    id
                  }
                }
              }
            }
          }
        `;

      return graphql(graphQLSchema, query, {}, beforeContext).then((result) => {
        expect(result.data.todos).to.be.null;
        expect(result.errors).not.to.be.undefined;
        expect(result.errors).to.lengthOf(1);
        expect(result.errors[0].message).to.equal("todo find before");

        return true;
      })
    })

    it("should throw todo before", function () {
      const query = `
          query {
            todos {
              total
              edges {
                node {
                  id
                  text
                  completed
                  owner {
                    id
                  }
                }
              }
            }
          }
        `;

      return graphql(graphQLSchema, query, {}, allBeforeContext).then((result) => {
        expect(result.data.todos).to.be.null;
        expect(result.errors).not.to.be.undefined;
        expect(result.errors).lengthOf(1);
        expect(result.errors[0].message).to.equal("todo before");

        return true;
      })
    })
  })
})
