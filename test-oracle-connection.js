#!/usr/bin/env node

import oracledb from 'oracledb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// For Oracle Autonomous Database, we need thick mode with wallet support
if (process.env.TNS_ADMIN || process.env.ORACLE_CLIENT_PATH) {
  try {
    // Try to initialize thick mode for wallet support
    const clientOpts = {};
    if (process.env.ORACLE_CLIENT_PATH) {
      clientOpts.libDir = process.env.ORACLE_CLIENT_PATH;
    }
    if (process.env.TNS_ADMIN) {
      clientOpts.configDir = process.env.TNS_ADMIN;
    }
    oracledb.initOracleClient(clientOpts);
    console.log('Oracle client initialized in thick mode');
  } catch (err) {
    console.log('Error initializing Oracle client:', err.message);
    console.log('Continuing in thin mode...');
  }
}

async function testConnection() {
  let connection;
  
  try {
    // Determine connection configuration
    let connectString, user, password;
    
    if (process.env.ORACLE_CONNECTION_STRING) {
      console.log('Using Easy Connect String method');
      connectString = process.env.ORACLE_CONNECTION_STRING;
      user = process.env.ORACLE_USER;
      password = process.env.ORACLE_PASSWORD;
    } else if (process.env.ORACLE_TNS_NAME) {
      console.log('Using TNS Name method');
      connectString = process.env.ORACLE_TNS_NAME;
      user = process.env.ORACLE_USER;
      password = process.env.ORACLE_PASSWORD;
    } else {
      console.log('Using individual components method');
      const host = process.env.ORACLE_HOST || 'localhost';
      const port = process.env.ORACLE_PORT || '1521';
      const service = process.env.ORACLE_SERVICE_NAME || process.env.ORACLE_SID;
      
      if (!service) {
        throw new Error('Oracle connection requires either CONNECTION_STRING, TNS_NAME, or SERVICE_NAME/SID');
      }
      
      connectString = `${host}:${port}/${service}`;
      user = process.env.ORACLE_USER;
      password = process.env.ORACLE_PASSWORD;
    }
    
    console.log(`Connecting to Oracle at: ${connectString}`);
    console.log(`User: ${user}`);
    
    // Create connection
    connection = await oracledb.getConnection({
      user: user,
      password: password,
      connectString: connectString
    });
    
    console.log('✅ Successfully connected to Oracle Database');
    
    // Test query
    const result = await connection.execute(
      `SELECT banner FROM v$version WHERE ROWNUM = 1`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('Database version:', result.rows[0]?.BANNER);
    
    // Get current schema
    const schemaResult = await connection.execute(
      `SELECT USER FROM DUAL`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('Current schema:', schemaResult.rows[0]?.USER);
    
    // List tables count
    const tableCount = await connection.execute(
      `SELECT COUNT(*) as TABLE_COUNT FROM user_tables`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('Tables in current schema:', tableCount.rows[0]?.TABLE_COUNT);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Connection closed');
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
}

testConnection();