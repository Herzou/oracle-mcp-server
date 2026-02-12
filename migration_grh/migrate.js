
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'myapp',
  password: '159753',
  port: 5432,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // 1. Run DDL
    console.log('Running DDL...');
    const ddl = fs.readFileSync(path.join(__dirname, '../ddl.sql'), 'utf8');
    await client.query(ddl);
    console.log('DDL executed successfully.');

    // 2. Run Data Import
    console.log('Running Data Import (this may take a while)...');
    const dataSql = fs.readFileSync(path.join(__dirname, '../alltablesdatas.sql'), 'utf8');
    
    // Split by statement to avoid memory issues if possible, but pg can handle large strings.
    // However, executing a huge string might timeout or hit buffers.
    // Better to split by ";\n" and execute in transaction.
    
    const statements = dataSql.split(';\n').filter(s => s.trim().length > 0);
    console.log(`Found ${statements.length} insert statements.`);

    // Begin transaction
    await client.query('BEGIN');
    
    let count = 0;
    for (const stmt of statements) {
        if (stmt.trim()) {
            await client.query(stmt);
            count++;
            if (count % 1000 === 0) process.stdout.write(`\rInserted ${count} rows...`);
        }
    }
    
    await client.query('COMMIT');
    console.log('\nData Import completed successfully.');

  } catch (err) {
    console.error('Migration failed:', err);
    try {
        await client.query('ROLLBACK');
    } catch (e) {}
  } finally {
    await client.end();
  }
}

run();
