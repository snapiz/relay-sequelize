const { expect } = require("chai");
const { sequelizeToGraphQL } = require("../../../src/graphql");
const sequelize = require("../../data/sequelize");

describe("Schema", () => {
  describe("Schema.sequelizeToGraphQL()", () => {
    const { queries, mutations } = sequelizeToGraphQL(sequelize);

    it("should define queries", () => {
      expect(queries).to.not.undefined;
      expect(queries).to.not.null;
      expect(Object.keys(queries)).lengthOf(4);
    })

    it("should define users query", () => {
      expect(queries.users).to.not.undefined;
      expect(queries.users).to.not.null;
    })

    it("should define todos query", () => {
      expect(queries.todos).to.not.undefined;
      expect(queries.todos).to.not.null;
    })

    it("should define todoAssignees query", () => {
      expect(queries.todoAssignees).to.not.undefined;
      expect(queries.todoAssignees).to.not.null;
    })

    it("should define todoNotes query", () => {
      expect(queries.todoNotes).to.not.undefined;
      expect(queries.todoNotes).to.not.null;
    })

    it("should define mutations", () => {
      expect(mutations).to.not.undefined;
      expect(mutations).to.not.null;
      expect(Object.keys(mutations)).lengthOf(15);
    })
  })
})