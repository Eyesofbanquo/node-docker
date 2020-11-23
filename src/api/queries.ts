import pool from "../db/pool";

export const USERS_TABLE = "users";
export const USERS_CI_TABLE = "users_ci";
export const TOKENS_TABLE = "refresh_tokens";
export const TOKENS_CI_TABLE = "refresh_tokens_ci";

let usersTable;
let tokensTable;

export const getUsersTable = () => {
  if (process.env.NODE_ENV === "dev") {
    return USERS_TABLE;
  } else if (process.env.NODE_ENV === "ci") {
    return USERS_CI_TABLE;
  }
};

export const getTokensTable = () => {
  if (process.env.NODE_ENV === "dev") {
    return TOKENS_TABLE;
  } else if (process.env.NODE_ENV === "ci") {
    return TOKENS_CI_TABLE;
  }
};

export const createUUIDExtension = () => {
  return pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
};
export const createUsersTable = () => {
  return pool.query(`CREATE TABLE IF NOT EXISTS ${getUsersTable()} (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL,
    created_date TIMESTAMP DEFAULT (now() at time zone 'utc')
  )`);
};

export const createTokensTable = () => {
  return pool.query(`CREATE TABLE IF NOT EXISTS ${getTokensTable()} (
    user_id UUID REFERENCES users(id) PRIMARY KEY,
    refresh_token TEXT NOT NULL UNIQUE
  )`);
};

export const getUsers = () => {
  return pool.query(`SELECT * FROM ${getUsersTable()}`);
};

export const createUser = (props: { username: string; password: string }) => {
  return pool.query(
    `INSERT INTO ${getUsersTable()} (username, password, is_admin)
  VALUES ($1, $2, $3)
   ON CONFLICT (username) DO NOTHING
    RETURNING id, username, is_admin`,
    [props.username, props.password, false]
  );
};

export const getTokens = () => {
  return pool.query(`SELECT * FROM ${getTokensTable()}`);
};

export const deleteToken = (props: { userId: string }) => {
  return pool.query(`DELETE FROM ${getTokensTable()} WHERE user_id = $1`, [
    props.userId,
  ]);
};

export const deleteUsersTable = () => {
  return pool.query(`DROP TABLE ${getUsersTable()}`);
};

export const deleteTokensTable = () => {
  return pool.query(`DROP TABLE ${getTokensTable()}`);
};
