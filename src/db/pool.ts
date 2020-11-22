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

const createDefaultTable = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);
};

export const setup = () => {
  createDefaultTable();
};

console.log("Created Database!");
