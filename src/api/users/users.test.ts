import chaiHttp from "chai-http";
import * as jwt from "jsonwebtoken";
import "mocha";
import chai, { expect } from "chai";
import {
  createUUIDExtension,
  createUsersTable,
  createTokensTable,
  deleteTokensTable,
  deleteUsersTable,
  createUser,
  createToken as addTokenToDatabase,
} from "./users.queries";
import { AppController } from "../../../server";
import { createTestUser, TEST_ACCESS_TOKEN } from "../../need/a-user/test-user";

chai.use(chaiHttp);

describe("Users Endpoint", () => {
  beforeEach(async () => {
    await createUUIDExtension().catch((err) => console.log(err));
    await createUsersTable().catch((err) => console.log(err));
    await createTokensTable().catch((err) => console.log(err));
    await createUser({ username: "Markim", password: "Shaw" });
    await createTestUser().catch();
  });

  afterEach(async () => {
    await deleteTokensTable().catch((err) => console.log(err));
    await deleteUsersTable().catch();
  });

  context("Given the user is an admin", () => {});

  context("Given the user is not an admin", () => {
    context("For invalid headers", () => {
      it("should say to add Bearer in error message", (done) => {
        const controller = new AppController();

        chai
          .request(controller.app)
          .get("/users")
          .set({ Authorization: TEST_ACCESS_TOKEN })
          .then((results) => {
            expect(results.body.success).to.be.false;
            expect(results.body.data).to.be.undefined;
            expect(results.body.error).to.not.be.undefined;

            const errorMessage = results.body.error.find(
              (value) => value.token
            );
            expect(errorMessage.token).to.contain("Bearer");

            done();
          })
          .catch((err) => done(err));
      });

      it("should throw token error if nothing was received", (done) => {
        const controller = new AppController();

        chai
          .request(controller.app)
          .get("/users")
          .then((results) => {
            expect(results.body.success).to.be.false;
            expect(results.body.data).to.be.undefined;
            expect(results.body.error).to.not.be.undefined;
            done();
          })
          .catch((err) => done(err));
      });

      it("should ask for the jwt token if only Bearer is sent", (done) => {
        const controller = new AppController();

        chai
          .request(controller.app)
          .get("/users")
          .set({ Authorization: "Bearer" })
          .then((results) => {
            expect(results.body.success).to.be.false;
            expect(results.body.data).to.be.undefined;
            expect(results.body.error).to.not.be.undefined;
            const errorMessage = results.body.error.find(
              (value) => value.token
            );
            expect(errorMessage.token).to.contain("jwt");
            expect(errorMessage.token).to.contain("access");
            done();
          })
          .catch((err) => done(err));
      });
    });

    context("For valid headers", () => {});
    it("should return all users", (done) => {
      const controller = new AppController();

      chai
        .request(controller.app)
        .get("/users")
        .set({ Authorization: "Bearer " + TEST_ACCESS_TOKEN })
        .then((results) => {
          expect(results.body.success).to.be.true;
          expect(results.body.data.users).to.not.be.empty;
          expect(results.body.data.users.length).to.equal(2);
          done();
        })
        .catch((err) => done(err));
    });
  });
});
