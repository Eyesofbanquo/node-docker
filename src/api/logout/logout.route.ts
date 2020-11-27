import { Router } from "express";
import * as bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import {
  checkUserPassword,
  checkForResponseToken,
  createTokens,
  saveRefreshToken,
} from "../middleware";
import { deleteToken } from "./logout.queries";

export const router = Router();

router.use(bodyParser.json());

router.post("/logout", async (request, response) => {
  const { id } = request.body;

  await deleteToken({ userId: id })
    .then((results) => {
      response.send({ success: true, data: { message: "Logged out!" } });
    })
    .catch((err) => response.send({ success: false, error: err }));
});
