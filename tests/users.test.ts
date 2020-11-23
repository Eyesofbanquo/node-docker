import chaiHttp from "chai-http";
import chai from "chai";
import "mocha";
import { expect } from "chai";
import {
  createTokensTable,
  createUsersTable,
  createUUIDExtension,
  deleteTokensTable,
  deleteUsersTable,
} from "../src/api/queries";
import { AppController } from "../server";

chai.use(chaiHttp);

describe("Users Tests", () => {
  describe("Login", () => {
    beforeEach((done) => {
      console.log(process.env.NODE_ENV);
      createUUIDExtension().catch((err) => console.log(err));
      createUsersTable().catch((err) => console.log(err));
      createTokensTable()
        .then((result) => done())
        .catch();
    });

    afterEach((done) => {
      deleteUsersTable().catch();
      deleteTokensTable()
        .then((res) => done())
        .catch();
    });

    context('Given the user "Eyes" does not exist', () => {
      it("Should create the user 'Eyes'", (done) => {
        const controller = new AppController();

        chai
          .request(controller.app)
          .post("/register")
          .send({ username: "Eyes", password: "Random" })
          .then((results) => {
            expect(results.status).to.equal(200);
            expect(results.body.data.username).to.equal("Eyes");
            expect(results.body.data.password).to.not.exist;
            done();
          })
          .catch((err) => done(err));
      });
    });
  });
});
