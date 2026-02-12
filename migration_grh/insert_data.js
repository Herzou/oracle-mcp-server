import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get args
const tableName = process.argv[2];
const dataFile = process.argv[3];

if (!tableName || !dataFile) {
    console.error('Usage: node insert_data.js <TABLE_NAME> <DATA_JSON_FILE>');
    process.exit(1);
}

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'dgigrh',
  password: '159753',
  port: 5432,
});

async function run() {
  try {
    const dataContent = fs.readFileSync(dataFile, 'utf8');
    const rows = JSON.parse(dataContent);

    if (!rows || rows.length === 0) {
        console.log(`No data to insert for ${tableName}.`);
        return;
    }

    await client.connect();
    
    // Truncate table first to avoid duplicates
    console.log(`Truncating table "${tableName}"...`);
    await client.query(`TRUNCATE TABLE "${tableName}" CASCADE`);

    console.log(`Connected to PostgreSQL. Inserting ${rows.length} rows into "${tableName}"...`);

    // Assuming all rows have same structure, take keys from first row
    // But be careful if some rows have missing keys (nulls might be omitted in JSON?)
    // Better to collect all unique keys from all rows? Or assume consistent schema?
    // Oracle MCP output usually includes nulls as null.
    
    const columns = Object.keys(rows[0]);
    const quotedColumns = columns.map(c => `"${c}"`).join(', ');
    
    // Prepare statement
    // INSERT INTO "TABLE" ("COL1", "COL2") VALUES ($1, $2)
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO "${tableName}" (${quotedColumns}) VALUES (${placeholders})`;

    // Batch insert using transaction
    await client.query('BEGIN');

    let count = 0;
    for (const row of rows) {
        const values = columns.map(col => {
            let val = row[col];
            // Handle specific types if needed, but pg driver handles basics (string, number, date strings).
            // If date is "2023-01-01T..." it works.
            return val;
        });

        try {
            await client.query(query, values);
            count++;
            if (count % 100 === 0) process.stdout.write(`\rInserted ${count}/${rows.length}`);
        } catch (err) {
            console.error(`\nError inserting row into ${tableName}:`, err.message);
            // console.error('Row:', row);
        }
    }

    await client.query('COMMIT');
    console.log(`\nSuccessfully inserted ${count} rows into "${tableName}".`);

  } catch (err) {
    console.error('Migration failed:', err);
    try { await client.query('ROLLBACK'); } catch (e) {}
  } finally {
    await client.end();
  }
}

run();
