import { Router } from "express";
import * as bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import {
  retrieveUser,
  checkForResponseToken,
  createTokens,
  saveRefreshToken,
} from "../middleware";

export const router = Router();

router.use(bodyParser.json());

router.post(
  "/login",
  retrieveUser,
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
