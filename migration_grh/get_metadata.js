
const oracledb = require('oracledb');
const fs = require('fs');
require('dotenv').config();

// Silence dotenv/oracle logs
console.log = () => {};
console.debug = () => {};

async function run() {
  let connection;

  try {
    const dbConfig = {
      user: process.env.ORACLE_USER || "dgigrh",
      password: process.env.ORACLE_PASSWORD || "159753",
      connectString: process.env.ORACLE_CONNECTION_STRING || "10.2.249.211:1521/nifdb",
      libDir: process.env.ORACLE_CLIENT_LIB_DIR || "D:\\Oracle\\instantclient_11_2"
    };

    if (dbConfig.libDir) {
        try {
            oracledb.initOracleClient({ libDir: dbConfig.libDir });
        } catch(e) {
            // ignore if already init
        }
    }

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION, DATA_SCALE 
       FROM ALL_TAB_COLUMNS 
       WHERE OWNER = 'DGIGRH' 
       ORDER BY TABLE_NAME, COLUMN_ID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Restore console for output
    delete console.log;
    
    const metadata = {};
    result.rows.forEach(row => {
        if (!metadata[row.TABLE_NAME]) {
            metadata[row.TABLE_NAME] = [];
        }
        metadata[row.TABLE_NAME].push(row);
    });

    fs.writeFileSync('tables_metadata.json', JSON.stringify(metadata, null, 2));
    process.stdout.write("Metadata saved to tables_metadata.json");

  } catch (err) {
    delete console.log;
    console.error(err);
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

run();
