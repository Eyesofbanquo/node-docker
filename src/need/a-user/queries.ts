import pool from "../../db/pool";

export const USERS_TABLE = "users";
export const USERS_CI_TABLE = "users_ci";

export const getUsersTable = () => {
  if (process.env.NODE_ENV === "ci") {
    return USERS_CI_TABLE;
  } else {
    return USERS_TABLE;
  }
};

export const createUsersTable = () => {
  return pool.query(`CREATE TABLE IF NOT EXISTS ${getUsersTable()} (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT false,
    created_date TIMESTAMP DEFAULT (now() at time zone 'utc')
  )`);
};

export const getUsers = () => {
  return pool.query(`SELECT * FROM ${getUsersTable()}`);
};

export const getAvailableUsers = () => {
  return pool.query(`SELECT * FROM ${getUsersTable()} WHERE deleted = false;`);
};

/**
 * Create a user inside the appropriate `env` database.
 * @param props
 */
export const createUser = (props: { username: string; password: string }) => {
  return pool.query(
    `INSERT INTO ${getUsersTable()} (username, password, is_admin)
  VALUES ($1, $2, $3)
   ON CONFLICT (username) DO NOTHING
    RETURNING id, username, is_admin`,
    [props.username, props.password, false]
  );
};

export const deleteUsersTable = () => {
  return pool.query(`DROP TABLE ${getUsersTable()}`);
};
