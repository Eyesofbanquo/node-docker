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

interface CreateTokenProps {
  userId: string;
  refreshToken: string;
}
/**
 *
 * @param {CreateTokenProps} props -
 */
export const createToken = (props: CreateTokenProps) => {
  const { userId, refreshToken } = props;
  return pool.query(
    `INSERT INTO ${getTokensTable()} (user_id, refresh_token)
  VALUES ($1, $2) 
  ON CONFLICT DO NOTHING
  RETURNING *`,
    [userId, refreshToken]
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

export const deleteTokensTable = () => {
  return pool.query(`DROP TABLE ${getTokensTable()}`);
};
