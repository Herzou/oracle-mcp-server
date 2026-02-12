import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'dgigrh',
    password: '159753',
    port: 5432,
});

const tables = [
    { name: "AFFECTATIONS", expected: 0 },
    { name: "API_ACCESS", expected: 29 },
    { name: "API_KEYS", expected: 10 },
    { name: "API_KEYS_PROD", expected: 4 },
    { name: "API_LISTE", expected: 37 },
    { name: "API_MEMBERS", expected: 11 },
    { name: "APPS_ADMIN", expected: 5 },
    { name: "APP_LIST", expected: 37 },
    { name: "APP_PRIVILEGE", expected: 95 },
    { name: "DIRECTIONS", expected: 22 },
    { name: "DIRECTIONS_T", expected: 21 },
    { name: "DIR_CORRESP", expected: 21 },
    { name: "GRH_USERS", expected: 1474 }, // Approx
    { name: "PERSONNEL", expected: 1471 }, // Approx
    { name: "PERSONNEL_T", expected: 1428 }, // Approx
    { name: "PERS_CORRESP", expected: 1428 }, // Approx
    { name: "PRT_DIRECTIONS", expected: 0 },
    { name: "RH_SITUATIONS", expected: 3199 }, // Approx
    { name: "RH_SITUATIONS_PORTAL", expected: 3199 }, // Approx
    { name: "SERVICES", expected: 156 },
    { name: "SERVICES_T", expected: 156 },
    { name: "SERV_CORRESP", expected: 156 },
    { name: "TEST_DATE", expected: 2 },
    { name: "USER_ACCESS", expected: 3 },
    { name: "USER_ACCESS_LIST", expected: 0 },
    { name: "USER_APP", expected: 22608 }, // Approx, Oracle said 22608, fetched 23785?
    { name: "USER_GRADES", expected: 4 },
    { name: "USER_SESSION", expected: 461 }
];

async function verify() {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL for verification.\n");
        console.log("Table Name | PG Rows | Expected (approx) | Status");
        console.log("-------------------------------------------------------");

        let allGood = true;

        for (const table of tables) {
            try {
                const res = await client.query(`SELECT COUNT(*) as count FROM "${table.name}"`);
                const count = parseInt(res.rows[0].count);
                const diff = Math.abs(count - table.expected);
                // Allow some difference as Oracle stats might be old or new data added
                const status = (count === table.expected) ? "MATCH" : (diff < 10000 ? "DIFF (Acceptable?)" : "MISMATCH"); 
                
                console.log(`${table.name.padEnd(20)} | ${count.toString().padEnd(7)} | ${table.expected.toString().padEnd(17)} | ${status}`);
                
                if (count === 0 && table.expected > 0) {
                     // Check if it really should be 0
                     console.warn(`WARNING: Table ${table.name} is empty in Postgres!`);
                     allGood = false;
                }
            } catch (err) {
                console.error(`Error checking ${table.name}: ${err.message}`);
                allGood = false;
            }
        }

        console.log("\nVerification complete.");
        
    } catch (err) {
        console.error("Connection error", err);
    } finally {
        await client.end();
    }
}

verify();
