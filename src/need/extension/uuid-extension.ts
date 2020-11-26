import pool from "../../db/pool";

export const createUUIDExtension = () => {
  return pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
};
