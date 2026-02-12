import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'dgigrh',
  password: '159753',
  port: 5432,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    console.log('Running DDL...');
    const ddl = fs.readFileSync(path.join(__dirname, 'ddl.sql'), 'utf8');
    // Split DDL by ";" to handle multiple statements if needed, but pg query usually handles it.
    // However, for safety and better error reporting, splitting is good.
    // The ddl.sql has "DROP TABLE ...; CREATE TABLE ...;"
    
    // We can just run the whole file content in one go usually.
    await client.query(ddl);
    console.log('DDL executed successfully.');

  } catch (err) {
    console.error('DDL Execution failed:', err);
  } finally {
    await client.end();
  }
}

run();
