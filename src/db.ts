import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect()
  .then(() => {
    console.log('Connected to the PostgreSQL database');
  })
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.error('Error connecting to the database:', err.stack);
    } else {
      console.error('An unknown error occurred:', err);
    }
  });

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL  
      )
    `);
    console.log('Users table is ready.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
      )
    `);
    console.log('Articles table is ready.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        article_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles (id),
        FOREIGN KEY (author_id) REFERENCES users (id)
      )
    `);
    console.log('Comments table is ready.');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error creating tables:', err.stack);
    } else {
      console.error('An unknown error occurred during table creation:', err);
    }
  }
};

createTables();

pool.query('SELECT 1')
  .then((res) => {
    console.log('Database connection test successful:', res.rows);
  })
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.error('Error during query:', err.stack);
    } else {
      console.error('An unknown error occurred during the query:', err);
    }
  });

export default pool;
