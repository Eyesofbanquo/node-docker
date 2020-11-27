import { Router } from "express";
import * as bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import {
  checkUserPassword,
  checkForResponseToken,
  createTokens,
  saveRefreshToken,
} from "../middleware";

export const router = Router();

router.use(bodyParser.json());

router.post(
  "/login",
  checkUserPassword,
  checkForResponseToken,
  createTokens,
  saveRefreshToken,
  (request, response) => {
    const { user, refreshToken, accessToken } = request.body;

    response.send({
      success: true,
      data: {
        user: user,
        refreshToken: refreshToken,
        accessToken: accessToken,
      },
    });
  }
);
