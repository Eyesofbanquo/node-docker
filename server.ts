require("dotenv").config();
import express from "express";
import cors from "cors";
import * as bodyParser from "body-parser";
import pool, { setup } from "./src/db/pool";
import { router as LoginRouter } from "./src/api/login/login.route";
import { router as RegisterRouter } from "./src/api/register/register.route";
import { router as RefreshRouter } from "./src/api/refresh/refresh.route";
import { router as LogoutRouter } from "./src/api/logout/logout.route";
import { router as HealthCheck } from "./src/api/health-check/health";
import { router as UsersRouter } from "./src/api/users/users.route";

setup();

export class AppController {
  app: express.Express;
  port: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || "3000";

    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(LoginRouter);
    this.app.use(RegisterRouter);
    this.app.use(RefreshRouter);
    this.app.use(LogoutRouter);
    this.app.use(HealthCheck);
    this.app.use(UsersRouter);

    this.app.get("/", (request, response) => {
      response.send({ success: true });
    });
    this.app.get("/example", (request, response) => {
      response.send("Example text");
    });
  }
}

const controller = new AppController();

controller.app.listen(controller.port, () =>
  console.log("Running on port", controller.port)
);
