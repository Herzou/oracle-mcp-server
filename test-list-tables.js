#!/usr/bin/env node

import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Oracle client for wallet support
if (process.env.ORACLE_CLIENT_PATH && process.env.TNS_ADMIN) {
  oracledb.initOracleClient({
    libDir: process.env.ORACLE_CLIENT_PATH,
    configDir: process.env.TNS_ADMIN
  });
}

async function listTables() {
  let connection;
  
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_TNS_NAME
    });
    
    console.log('Connected to Oracle Database\n');
    
    // List user tables
    const result = await connection.execute(
      `SELECT table_name, num_rows, last_analyzed 
       FROM user_tables 
       ORDER BY table_name`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log(`Found ${result.rows.length} tables in ${process.env.ORACLE_USER} schema:\n`);
    
    result.rows.forEach(row => {
      console.log(`- ${row.TABLE_NAME} (${row.NUM_ROWS || 'not analyzed'} rows)`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

listTables();