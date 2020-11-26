import pool from "../../db/pool";
import { getUsersTable } from "../a-user/queries";

export const TOKENS_TABLE = "refresh_tokens";
export const TOKENS_CI_TABLE = "refresh_tokens_ci";

export const getTokensTable = () => {
  if (process.env.NODE_ENV === "ci") {
    return TOKENS_CI_TABLE;
  } else {
    return TOKENS_TABLE;
  }
};

export const createTokensTable = () => {
  return pool.query(`CREATE TABLE IF NOT EXISTS ${getTokensTable()} (
    user_id UUID REFERENCES ${getUsersTable()}(id) PRIMARY KEY,
    refresh_token TEXT NOT NULL UNIQUE
  )`);
};

export const getTokens = () => {
  return pool.query(`SELECT * FROM ${getTokensTable()}`);
};

export const deleteToken = (props: { userId: string }) => {
  return pool.query(`DELETE FROM ${getTokensTable()} WHERE user_id = $1`, [
    props.userId,
  ]);
};

export const deleteTokensTable = () => {
  return pool.query(`DROP TABLE ${getTokensTable()}`);
};
