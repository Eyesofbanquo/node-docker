require("dotenv").config();
import express from "express";
import * as bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import pool, { setup } from "./src/db/pool";
import { router as LoginRouter } from "./src/api/login/login.route";
import {
  hasher,
  retrieveUser,
  createTokens,
  saveRefreshToken,
  checkForResponseToken,
} from "./src/api/middleware";
import { createUser } from "./src/api/login/login.queries";
import { deleteToken, getTokens } from "./src/need/a-token/queries";
import * as glob from "glob";

setup();

const secret_token = process.env.JWT_SECRET;
const secret_refresh_token = process.env.JWT_REFRESH_SECRET;

export class AppController {
  app: express.Express;
  port: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || "3000";

    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(bodyParser.json());
    this.app.use("/", LoginRouter);

    this.app.get("/", (request, response) => {
      response.send({ success: true });
    });

    this.app.post("/register", hasher, async (request, response) => {
      const { username, password } = request.body;

      await createUser({ username: username, password: password })
        .then((res) => {
          if (res.rows.length === 0) {
            response.send({
              success: false,
              data: { message: "User already exists" },
            });
          }

          if (res.rows.length > 0) {
            response.send({ success: true, data: res.rows[0] });
          }
        })
        .catch((err) => response.send({ success: false, error: err }));
    });

    this.app.post("/refresh", async (request, response) => {
      const { refreshToken } = request.body;

      if (!refreshToken) {
        return response.sendStatus(401);
      }

      await getTokens()
        .then((results) => {
          const tokenExists = results.rows.find(
            (tokenRow) => tokenRow.refresh_token === refreshToken
          );
          if (tokenExists) {
            jwt.verify(refreshToken, secret_refresh_token, (err, user) => {
              if (err) {
                return response.sendStatus(403);
              }
              const accessToken = jwt.sign(
                { username: user.username, id: user.id, admin: user.is_admin },
                secret_token,
                { expiresIn: "20m" }
              );
              response.send({
                success: true,
                data: { accessToken: accessToken },
              });
            });
          } else {
            return response.sendStatus(403);
          }
        })
        .catch((err) => response.send({ success: false, error: err }));
    });

    this.app.post("/logout", async (request, response) => {
      const { id } = request.body;

      await deleteToken({ userId: id })
        .then((results) => {
          response.send({ success: true, data: { message: "Logged out!" } });
        })
        .catch((err) => response.send({ success: false, error: err }));
    });

    this.app.get("/health", (request, response) => {
      response.send("ok");
    });
  }
}

const controller = new AppController();

controller.app.listen(controller.port, () =>
  console.log("Running on port", controller.port)
);
