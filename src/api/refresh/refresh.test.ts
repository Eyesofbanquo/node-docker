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
} from "./refresh.queries";
import { v4 as uuidv4 } from "uuid";
import { secret_refresh_token } from "../../need/a-secret/secrets";
import { expirationDate } from "../../need/a-token/refresh";
import { AppController } from "../../../server";

chai.use(chaiHttp);

/* May need to save this for retrieving all users */
const createToken = (props: {
  username: string;
  id: string;
  is_admin: boolean;
  isExpired: boolean;
}) => {
  const { username, id, is_admin, isExpired } = props;
  const token = jwt.sign(
    { username: username, id: id, admin: is_admin },
    secret_refresh_token,
    {
      expiresIn: isExpired ? "-10s" : expirationDate,
    }
  );
  return token;
};

describe("Refresh Endpoint", () => {
  beforeEach(async () => {
    await createUUIDExtension().catch((err) => console.log(err));
    await createUsersTable().catch((err) => console.log(err));
    await createTokensTable().catch((err) => console.log(err));
  });

  afterEach(async () => {
    await deleteTokensTable().catch((err) => console.log(err));
    await deleteUsersTable().catch();
  });

  context("Refresh sanitization", () => {
    it("should error for non JWT tokens", (done) => {
      const controller = new AppController();

      chai
        .request(controller.app)
        .post("/refresh")
        .send({ refreshToken: "hep" })
        .then((results) => {
          expect(results.body.success).to.be.false;
          expect(results.body.error).to.not.be.undefined;
          done();
        })
        .catch((error) => done(error));
    });
  });

  context("Given the user exists", () => {
    const uuid = uuidv4();
    const refreshToken = createToken({
      username: "Eyes",
      id: uuid,
      is_admin: false,
      isExpired: false,
    });

    beforeEach(async () => {
      let userId;
      await createUser({ username: "Eyes", password: "Random" })
        .then((results) => {
          const user = results.rows[0];
          userId = user.id;
        })
        .catch();
      await addTokenToDatabase({
        userId: userId,
        refreshToken: refreshToken,
      }).catch();
    });

    it("should return a new access token", (done) => {
      const controller = new AppController();

      chai
        .request(controller.app)
        .post("/refresh")
        .send({ refreshToken: refreshToken })
        .then((results) => {
          expect(results.body.success).to.be.true;
          expect(results.body.data).to.not.be.undefined;
          done();
        })
        .catch((error) => done(error));
    });
  });
});
