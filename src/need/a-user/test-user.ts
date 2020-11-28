import pool from "../../db/pool";
import { getTokensTable } from "../a-token/queries";
import { getUsersTable } from "./queries";

export const testUUID = "836f2c23-ae42-4fbe-8575-256740261005";
export const TEST_REFRESH_TOKEN = process.env.TEST_REFRESH_TOKEN;
export const TEST_ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN;
export const createTestUser = async () => {
  await pool.query(
    `INSERT INTO ${getUsersTable()} (id, username, password, is_admin, deleted) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
    [testUUID, "test", "testpassword", false, false]
  );
  await pool.query(
    `INSERT INTO ${getTokensTable()} (id, refresh_token) VALUES ($1, $2)`,
    [testUUID, process.env.TEST_REFRESH_TOKEN]
  );
};
