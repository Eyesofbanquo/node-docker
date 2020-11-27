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
  getUsersTable,
} from "./register.queries";

import { AppController } from "../../../server";
import pool from "../../db/pool";

chai.use(chaiHttp);

describe("Register", () => {
  beforeEach(async () => {
    await createUUIDExtension().catch((err) => console.log(err));
    await createUsersTable().catch((err) => console.log(err));
    await createTokensTable().catch((err) => console.log(err));
  });

  afterEach(async () => {
    await deleteTokensTable().catch((err) => console.log(err));
    await deleteUsersTable().catch();
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
          expect(results.body.success).to.be.true;
          expect(results.body.data.username).to.equal("Eyes");
          expect(results.body.data.password).to.not.exist;
          done();
        })
        .catch((err) => done(err));
    });
  });

  context("Given the user '   Eyes    ' is looking to register", () => {
    it("Should sanitize the username", (done) => {
      const controller = new AppController();

      chai
        .request(controller.app)
        .post("/register")
        .send({ username: "   Eyes    ", password: "Random" })
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
