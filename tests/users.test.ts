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
} from "../src/api/login/login.queries";
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
});
