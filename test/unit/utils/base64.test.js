const { expect } = require('chai');
const { base64, unbase64} = require("../../../src/utils");

describe("Base64", () => {

  describe("base64()", () => {

    it("should encode User:1", () => {
      expect(base64("User:1")).to.be.equal("VXNlcjox");
    })

    it("should encode timestamp", () => {
      const date = new Date("2017-08-15");
      expect(base64(String(date.getTime()))).to.be.equal("MTUwMjc1NTIwMDAwMA==");
    })
  })

  describe("unbase64()", () => {
    
        it("should decode VXNlcjox", () => {
          expect(unbase64("VXNlcjox")).to.be.equal("User:1");
        })
    
        it("should decode MTUwMjc1NTIwMDAwMA==", () => {
          const date = new Date("2017-08-15");
          expect(unbase64("MTUwMjc1NTIwMDAwMA==")).to.be.equal(String(date.getTime()));
        })
      })

})