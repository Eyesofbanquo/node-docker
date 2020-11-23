import bcrypt from "bcrypt";
import pool from "../db/pool";
import * as jwt from "jsonwebtoken";

const secret_token = process.env.JWT_SECRET;
const secret_refresh_token = process.env.JWT_REFRESH_SECRET;

export const retrieveUser = async (request, response, next) => {
  const { username } = request.body;

  await pool
    .query(`SELECT id, username, is_admin FROM users WHERE username = $1`, [
      username,
    ])
    .then((res) => {
      if (res.rows.length === 0) {
        next(new Error("User does not exist"));
      }

      if (res.rows.length > 0) {
        console.log("help");
        const user = res.rows[0];
        request.body = { user: res.rows[0] };
        next();
      }
    })
    .catch((err) => next(err));
};

export const checkForResponseToken = async (request, response, next) => {
  const { user } = request.body;

  await pool.query(`SELECT * FROM refresh_tokens`).then((results) => {
    const row = results.rows.find((tokenRow) => tokenRow.user_id === user.id);

    if (row.refresh_token) {
      response.send({
        success: false,
        data: { message: "User is already logged in" },
      });
    } else {
      next();
    }
  });
};

export const createTokens = (request, response, next) => {
  const { user } = request.body;

  try {
    const accessToken = jwt.sign(
      { username: user.username, id: user.id, admin: user.is_admin },
      secret_token,
      { expiresIn: "20m" }
    );
    const refreshToken = jwt.sign(
      { username: user.username, id: user.id, admin: user.is_admin },
      secret_refresh_token
    );
    request.body = {
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const saveRefreshToken = async (request, response, next) => {
  const { user, refreshToken } = request.body;

  await pool
    .query(
      `INSERT INTO refresh_tokens (user_id, refresh_token)
  VALUES ($1, $2) 
  ON CONFLICT DO NOTHING
  RETURNING *`,
      [user.id, refreshToken]
    )
    .then((result) => {
      if (result.rows.length > 0) {
        next();
      } else {
        response.send({ success: false, error: "User is already logged in" });
      }
    });
};

export const hasher = (request, response, next) => {
  const { username, password } = request.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      response.send({ success: false, error: err });
      next(err);
    } else {
      request.body.password = hash;
      next();
    }
  });
};
