import { Router } from "express";
import * as bodyParser from "body-parser";

import {
  accessTokenValidationRules,
  validateAccessToken,
} from "../../need/a-validator/access-validation";
import { getAvailableUsers } from "./users.queries";

export const router = Router();

router.use(bodyParser.json());

router.get(
  "/users",
  accessTokenValidationRules(),
  validateAccessToken,
  async (request, response) => {
    await getAvailableUsers()
      .then((results) => {
        const allUsers = results.rows;
        response.send({
          success: true,
          data: {
            users: allUsers,
          },
        });
      })
      .catch((err) => {
        response.send({
          success: false,
          error: "Unavailable to retrieve users",
        });
      });
  }
);
