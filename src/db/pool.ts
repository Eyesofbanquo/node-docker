import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

let databaseConfig;

if (process.env.DATABASE_URL) {
  databaseConfig = { connectionString: process.env.DATABASE_URL };
}

const pool = new Pool(databaseConfig);

export default pool;

const createDefaultDatabase = async () => {
  await pool.query(`CREATE DATABASE avon`).catch();
};

const createUUIDExtension = async () => {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`).catch();
};
const createDefaultTable = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT (now() at time zone 'utc')
  )`);
};

export const setup = async () => {
  await createUUIDExtension();
  await createDefaultTable();
};

console.log("Created Database!");
