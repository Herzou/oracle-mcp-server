import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tables = [
    "AFFECTATIONS",
    "API_ACCESS",
    "API_KEYS",
    "API_KEYS_PROD",
    "API_LISTE",
    "API_MEMBERS",
    "APPS_ADMIN",
    "APP_LIST",
    "APP_PRIVILEGE",
    "DIRECTIONS",
    "DIRECTIONS_T",
    "DIR_CORRESP",
    "GRH_USERS",
    "PERSONNEL",
    "PERSONNEL_T",
    "PERS_CORRESP",
    "PRT_DIRECTIONS",
    "RH_SITUATIONS",
    "RH_SITUATIONS_PORTAL",
    "SERVICES",
    "SERVICES_T",
    "SERV_CORRESP",
    "TEST_DATE",
    "USER_ACCESS",
    "USER_ACCESS_LIST",
    "USER_APP",
    "USER_GRADES",
    "USER_SESSION"
];

console.log("Starting full data insertion...");

for (const table of tables) {
    const jsonFile = path.join(__dirname, `data_${table}.json`);
    if (fs.existsSync(jsonFile)) {
        console.log(`\nProcessing ${table}...`);
        try {
            execSync(`node migration_grh/insert_data.js ${table} "${jsonFile}"`, { stdio: 'inherit' });
        } catch (err) {
            console.error(`Failed to insert ${table}`);
        }
    } else {
        console.warn(`Data file not found for ${table}: ${jsonFile}`);
    }
}

console.log("\nFull insertion complete.");
