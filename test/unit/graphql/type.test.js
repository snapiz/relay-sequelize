const { expect } = require("chai");
const sequelize = require("../../data/sequelize");
const {
  createObjectType,
  GraphQLString
} = require("../../../src/graphql");

describe("GraphQL", () => {
  describe("createObjectType()", () => {
    describe("User", () => {
      const objectType = createObjectType(sequelize.models.user);

      it("should be defined", () => {
        expect(objectType).to.not.undefined;
        expect(objectType).to.not.null;
      })

      it("should be name User", () => {
        expect(objectType.name).to.be.equal("User");
      })

      it("should have fields", () => {
        expect(objectType._typeConfig.fields).to.not.undefined;
      })

      it("should have email field", () => {
        expect(objectType._typeConfig.fields.email).to.not.undefined;
      })

      it("should not have password field", () => {
        expect(objectType._typeConfig.fields.password).to.be.undefined;
      })

      it("should have isAdmin field", () => {
        expect(objectType._typeConfig.fields.isAdmin).to.not.undefined;
      })

      it("should have todos field", () => {
        expect(objectType._typeConfig.fields.todos).to.not.undefined;
      })
    })
  })
})