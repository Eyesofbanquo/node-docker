import { Router } from "express";
import * as jwt from "jsonwebtoken";
import * as bodyParser from "body-parser";
import { getTokens } from "./refresh.queries";
import {
  secret_refresh_token,
  secret_token,
} from "../../need/a-secret/secrets";
import { expirationDate } from "../../need/a-token/refresh";

export const router = Router();

router.use(bodyParser.json());

router.post("/refresh", async (request, response) => {
  const { refreshToken } = request.body;

  if (!refreshToken) {
    console.log("help");
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
            { expiresIn: expirationDate }
          );
          response.send({
            success: true,
            data: { accessToken: accessToken },
          });
        });
      } else {
        console.log("help");
        return response.sendStatus(403);
      }
    })
    .catch((err) => response.send({ success: false, error: "Token mismatch" }));
});
