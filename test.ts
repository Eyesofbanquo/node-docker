import "mocha";
import "chai";
import { expect } from "chai";

describe("Random test", () => {
  context("Given this is in docker", () => {
    it("should pass this test", () => {
      expect(true).to.be.true;
    });
  });
});
