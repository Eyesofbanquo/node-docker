import { Router } from "express";
import * as bodyParser from "body-parser";
import { createUser } from "./register.queries";
import { hasher } from "../middleware";
import {
  userValidationRules,
  validateUser,
} from "../../need/a-validator/user-validation";

export const router = Router();

router.use(bodyParser.json());

router.post(
  "/register",
  userValidationRules(),
  validateUser,
  hasher,
  async (request, response) => {
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
  }
);
