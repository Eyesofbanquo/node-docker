import chaiHttp from "chai-http";
import chai from "chai";
import "mocha";
import { expect } from "chai";
import { v4 as uuidv4 } from "uuid";
import {
  createTokensTable,
  createUsersTable,
  createUUIDExtension,
  deleteTokensTable,
  deleteUsersTable,
} from "../queries";
import { AppController } from "../../../server";
import pool from "../../db/pool";

chai.use(chaiHttp);

describe("Login Tests", () => {
  beforeEach(async () => {
    await createUUIDExtension().catch((err) => console.log(err));
    await createUsersTable().catch((err) => console.log(err));
    await createTokensTable().catch((err) => console.log(err));
  });

  afterEach(async () => {
    await deleteTokensTable().catch((err) => console.log(err));
    await deleteUsersTable().catch();
  });

  context("Given the user has registered", () => {
    beforeEach((done) => {
      const controller = new AppController();
      chai
        .request(controller.app)
        .post("/register")
        .send({ username: "Eyes", password: "Random" })
        .then((results) => done())
        .catch((err) => done(err));
    });

    context("Given the password is correct", () => {
      it("Should return a user, access and refresh token", (done) => {
        const controller = new AppController();

        chai
          .request(controller.app)
          .post("/login")
          .send({ username: "Eyes", password: "Random" })
          .then((results) => {
            expect(results.body.success).to.be.true;
            expect(results.body.data.refreshToken).to.exist;
            expect(results.body.data.accessToken).to.exist;
            done();
          })
          .catch((err) => done(err));
      });
    });

    context("Given the password is NOT correct", () => {
      it("Should return an error message", (done) => {
        const controller = new AppController();

        chai
          .request(controller.app)
          .post("/login")
          .send({ username: "Eyes", password: "Randomgawljgjnawognwagnow" })
          .then((results) => {
            expect(results.body.success).to.be.false;
            done();
          })
          .catch((err) => done(err));
      });
    });
  });
  context("Given the user has not registered", () => {
    it("should send an error", (done) => {
      const controller = new AppController();

      chai
        .request(controller.app)
        .post("/login")
        .send({ username: "Eyes", password: "Randomgawljgjnawognwagnow" })
        .then((results) => {
          expect(results.body.success).to.be.false;
          expect(results.body.data.message).to.exist;
          done();
        })
        .catch((err) => done(err));
    });
  });
  context("Given the user is already logged in", () => {
    beforeEach(async () => {
      const controller = new AppController();
      await chai
        .request(controller.app)
        .post("/register")
        .send({ username: "Eyes", password: "Random" })
        .catch((err) => console.log(err));
      await chai
        .request(controller.app)
        .post("/login")
        .send({ username: "Eyes", password: "Random" })
        .catch((err) => console.log(err));
    });

    it("should send message saying user is already logged in", (done) => {
      const controller = new AppController();
      chai
        .request(controller.app)
        .post("/login")
        .send({ username: "Eyes", password: "Random" })
        .then((results) => {
          expect(results.body.data.message).to.not.be.undefined;
          done();
        })
        .catch((err) => done(err));
    });
  });
});
