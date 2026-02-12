
import fs from 'fs';

const metadata = JSON.parse(fs.readFileSync('tables_metadata.json', 'utf8'));

function mapType(col) {
    const type = col.DATA_TYPE;
    switch (type) {
        case 'NUMBER':
            if (col.DATA_SCALE === 0) {
                return 'INTEGER'; // or BIGINT if needed, but INTEGER is usually safe for IDs
            }
            return 'NUMERIC';
        case 'VARCHAR2':
        case 'NVARCHAR2':
            return `VARCHAR(${col.DATA_LENGTH})`;
        case 'CHAR':
            return `CHAR(${col.DATA_LENGTH})`;
        case 'DATE':
        case 'TIMESTAMP(6)':
            return 'TIMESTAMP';
        case 'CLOB':
            return 'TEXT';
        case 'BLOB':
            return 'BYTEA';
        default:
            return 'TEXT'; // Fallback
    }
}

let sql = '';

for (const [tableName, columns] of Object.entries(metadata)) {
    // Drop if exists
    sql += `DROP TABLE IF EXISTS "${tableName}";\n`;
    
    sql += `CREATE TABLE "${tableName}" (\n`;
    const colDefs = columns.map(col => {
        return `  "${col.COLUMN_NAME}" ${mapType(col)}`;
    });
    sql += colDefs.join(',\n');
    sql += `\n);\n\n`;
}

fs.writeFileSync('ddl.sql', sql);
console.log('DDL saved to ddl.sql');
