import bcrypt from "bcrypt";
import pool from "../db/pool";
import * as jwt from "jsonwebtoken";
import { getTokensTable, getUsersTable } from "./login/login.queries";
import { expirationDate } from "../need/a-token/refresh";
import { Router, Request, Response, NextFunction } from "express";

var salt = bcrypt.genSaltSync();

const secret_token = process.env.JWT_SECRET;
const secret_refresh_token = process.env.JWT_REFRESH_SECRET;

/**
 * ! Middleware
 * Retreives a user from the database then checks the password.
 * @param {Request} request - The HTTP Request.
 * @param {Response} response - The HTTP Response.
 * @param {NextFunction} next - The function that forwards to the next available request.
 */
export const checkUserPassword = async (request, response, next) => {
  const { username, password } = request.body;

  await pool
    .query(
      `SELECT id, password, username, is_admin FROM ${getUsersTable()} WHERE username = $1`,
      [username]
    )
    .then((res) => {
      if (res.rows.length === 0) {
        response.send({
          success: false,
          data: { message: "User does not exist" },
        });
      }

      if (res.rows.length > 0) {
        const user = res.rows[0];
        bcrypt.compare(password, user.password).then((match) => {
          if (match) {
            request.body = { user: res.rows[0] };
            next();
          } else {
            return response.send({
              success: false,
              data: { message: "Incorrect password" },
            });
          }
        });
      }
    })
    .catch((err) => next(err));
};

export const checkForResponseToken = async (request, response, next) => {
  const { user } = request.body;

  await pool
    .query(`SELECT * FROM ${getTokensTable()}`)
    .then((results) => {
      const row = results.rows.find((tokenRow) => tokenRow.user_id === user.id);
      if (row) {
        try {
          const accessToken = jwt.sign(
            { username: user.username, id: user.id, admin: user.is_admin },
            secret_token,
            { expiresIn: expirationDate }
          );
          response.send({
            success: true,
            data: {
              user: user,
              accessToken: accessToken,
              refreshToken: row.refresh_token,
            },
          });
        } catch (error) {
          next(error);
        }
      } else {
        next();
      }
    })
    .catch((err) => next(err));
};

export const createTokens = (request, response, next) => {
  const { user } = request.body;

  try {
    const accessToken = jwt.sign(
      { username: user.username, id: user.id, admin: user.is_admin },
      secret_token,
      { expiresIn: expirationDate }
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
    next(error);
  }
};

export const saveRefreshToken = async (request, response, next) => {
  const { user, refreshToken } = request.body;

  await pool
    .query(
      `INSERT INTO ${getTokensTable()} (user_id, refresh_token)
  VALUES ($1, $2) 
  ON CONFLICT DO NOTHING
  RETURNING *`,
      [user.id, refreshToken]
    )
    .then((result) => {
      if (result.rows.length > 0) {
        next();
      } else {
        response.send({
          success: false,
          data: { message: "User is already logged in." },
        });
      }
    })
    .catch((err) => {
      next(err);
    });
};

export const hasher = (request, response, next) => {
  const { username, password } = request.body;

  bcrypt.hash(password, salt, (err, hash) => {
    if (err) {
      response.send({ success: false, error: err });
      next(err);
    } else {
      request.body.password = hash;
      next();
    }
  });
};

/**
 * Unpack the refresh token and return the underlying data.
 * @param request The HTTP Request.
 * @param response The HTTP Response.
 * @param next The function that forwards the request
 */
export const unpackRefreshToken = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { refreshToken } = request.body;
  console.log("Hello");

  await jwt.verify(refreshToken, secret_refresh_token, (err, user) => {
    if (err) {
      return response
        .status(200)
        .send({ success: false, error: "Invalid refresh token" });
    }

    request.body.id = user.id;
    request.body.is_admin = user.is_admin;
    request.body.deleted = user.deleted;
    request.body.username = user.username;

    next();
  });
};
