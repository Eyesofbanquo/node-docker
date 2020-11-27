import chaiHttp from "chai-http";
import * as jwt from "jsonwebtoken";
import "mocha";
import chai, { expect } from "chai";
import { AppController } from "../../../server";

chai.use(chaiHttp);
describe("Health check", () => {
  it("should display 'ok'", (done) => {
    const controller = new AppController();

    chai
      .request(controller.app)
      .get("/health")
      .then((response) => {
        expect(response.text).to.equal("ok");
        done();
      })
      .catch((err) => done(err));
  });
});
