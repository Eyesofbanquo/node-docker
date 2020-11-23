import chaiHttp from "chai-http";
import chai from "chai";
import "mocha";
import { expect } from "chai";
import { v4 as uuidv4 } from "uuid";
import {
  createTokensTable,
  createUser,
  createUsersTable,
  createUUIDExtension,
  deleteTokensTable,
  deleteUsersTable,
  getUsersTable,
} from "../src/api/queries";
import { AppController } from "../server";
import pool from "../src/db/pool";

chai.use(chaiHttp);

describe("Users Tests", () => {
  beforeEach(async () => {
    await createUUIDExtension().catch((err) => console.log(err));
    await createUsersTable().catch((err) => console.log(err));
    await createTokensTable().catch((err) => console.log(err));
  });

  afterEach(async () => {
    await deleteTokensTable().catch((err) => console.log(err));
    await deleteUsersTable().catch();
  });
  describe("Register", () => {
    context('Given the user "Eyes" does not exist', () => {
      it("Should create the user 'Eyes'", (done) => {
        const controller = new AppController();

        chai
          .request(controller.app)
          .post("/register")
          .send({ username: "Eyes", password: "Random" })
          .then((results) => {
            expect(results.status).to.equal(200);
            expect(results.body.success).to.be.true;
            expect(results.body.data.username).to.equal("Eyes");
            expect(results.body.data.password).to.not.exist;
            done();
          })
          .catch((err) => done(err));
      });
    });

    context('Given the user "Eyes" already exists', () => {
      const uuid = uuidv4();
      beforeEach((done) => {
        pool
          .query(
            `INSERT INTO ${getUsersTable()} (id, username, password, is_admin)
        VALUES ($1, $2, $3, $4)`,
            [uuid, "Eyes", "Random", false]
          )
          .then((r) => done())
          .catch((e) => done());
      });

      it("Should not create a new users", (done) => {
        const controller = new AppController();

        chai
          .request(controller.app)
          .post("/register")
          .send({ username: "Eyes", password: "Random" })
          .then((results) => {
            expect(results.status).to.equal(200);
            expect(results.body.success).to.be.false;
            expect(results.body.data.message).not.to.be.undefined;
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe("Login", () => {
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
});
