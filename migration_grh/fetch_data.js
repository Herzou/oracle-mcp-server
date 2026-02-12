import oracledb from 'oracledb';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const host = process.env.ORACLE_HOST || 'localhost';
const port = process.env.ORACLE_PORT || '1521';
const service = process.env.ORACLE_SERVICE_NAME || process.env.ORACLE_SID;
const user = process.env.ORACLE_USER;
const password = process.env.ORACLE_PASSWORD;
const libDir = process.env.ORACLE_CLIENT_LIB_DIR || 'D:/Oracle/instantclient_11_2';

if (libDir) {
    try {
        oracledb.initOracleClient({ libDir });
        console.log(`Oracle client initialized with libDir: ${libDir}`);
    } catch (err) {
        console.error('Failed to initialize Oracle client:', err);
    }
}

if (!service || !user || !password) {
    console.error('Missing Oracle credentials in .env');
    process.exit(1);
}

const connectString = `${host}:${port}/${service}`;

async function fetchData(tableName) {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user,
            password,
            connectString
        });

        console.log(`Connected to Oracle. Fetching data for ${tableName}...`);

        // Fetch all rows
        const result = await connection.execute(
            `SELECT * FROM DGIGRH.${tableName}`,
            [],
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
                fetchArraySize: 1000, // optimize fetching
                fetchAsString: [oracledb.CLOB]
            }
        );

        const rows = result.rows;
        console.log(`Fetched ${rows.length} rows.`);

        // Clean RN if exists (though we are selecting *, RN shouldn't be there unless it's a view/column)
        // Note: result.rows contains the data.
        
        // Write to file
        const outFile = path.join(__dirname, `data_${tableName}.json`);
        fs.writeFileSync(outFile, JSON.stringify(rows, null, 2));
        console.log(`Data saved to ${outFile}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

const table = process.argv[2];
if (!table) {
    console.error('Usage: node fetch_data.js <TABLE_NAME>');
    process.exit(1);
}

fetchData(table);
