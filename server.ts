require("dotenv").config();
import express from "express";
import * as bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import pool, { setup } from "./src/db/pool";
import {
  hasher,
  retrieveUser,
  createTokens,
  saveRefreshToken,
} from "./src/api/middleware";

setup();

const secret_token = process.env.JWT_SECRET;
const secret_refresh_token = process.env.JWT_REFRESH_SECRET;

const app = express();
app.use(bodyParser.json());

app.get("/", (request, response) => {
  response.send({ success: true });
});

app.get("/hello", (request, response) => {
  response.send({ data: "Hello world" });
});

app.post("/register", hasher, async (request, response) => {
  const { username, password } = request.body;

  console.log(password);
  await pool
    .query(
      `INSERT INTO users (username, password, is_admin)
       VALUES ($1, $2, $3)
        ON CONFLICT (username) DO NOTHING
         RETURNING *`,
      [username, password, false]
    )
    .then((res) => {
      console.log(res.rows);
      if (res.rows.length === 0) {
        response.send({ success: false, data: null });
      }

      if (res.rows.length > 0) {
        response.send({ success: true, data: res.rows[0] });
      }
    })
    .catch((err) => response.send({ success: false, error: err }));
});

app.post(
  "/login",
  retrieveUser,
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

app.post("/refresh", async (request, response) => {
  const { refreshToken } = request.body;

  if (!refreshToken) {
    return response.sendStatus(401);
  }

  await pool
    .query(`SELECT * FROM refresh_tokens`)
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
          response.send({ success: true, data: { accessToken: accessToken } });
        });
      } else {
        return response.sendStatus(403);
      }
    })
    .catch((err) => response.send({ success: false, error: err }));
});

app.post("/logout", async (request, response) => {
  const { id } = request.body;

  await pool
    .query(`DELETE FROM refresh_tokens WHERE user_id = id`)
    .then((results) => {
      response.send({ success: true, data: { message: "Logged out!" } });
    })
    .catch((err) => response.send({ success: false, error: err }));
});

app.listen(3000, () => {
  console.log("Running on 3000");
});
