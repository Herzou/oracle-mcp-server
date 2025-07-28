#!/usr/bin/env node
import oracledb from 'oracledb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

async function testListTables() {
  try {
    // Initialize Oracle client in thick mode if wallet is configured
    if (process.env.TNS_ADMIN || process.env.ORACLE_WALLET_LOCATION) {
      const clientOpts = {};
      
      if (process.env.ORACLE_CLIENT_PATH) {
        clientOpts.libDir = process.env.ORACLE_CLIENT_PATH;
      }
      
      if (process.env.TNS_ADMIN) {
        clientOpts.configDir = process.env.TNS_ADMIN;
      }
      
      oracledb.initOracleClient(clientOpts);
      console.log('✅ Oracle client initialized in thick mode');
    }

    // Get connection
    const config = {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD
    };

    if (process.env.ORACLE_TNS_NAME) {
      config.connectString = process.env.ORACLE_TNS_NAME;
      config.configDir = process.env.TNS_ADMIN;
      config.walletLocation = process.env.TNS_ADMIN;
      config.walletPassword = process.env.ORACLE_PASSWORD;
    }

    console.log('🔌 Connecting to Oracle...');
    const connection = await oracledb.getConnection(config);
    console.log('✅ Connected successfully!');

    // List PhotoSight tables
    const result = await connection.execute(`
      SELECT owner, table_name, num_rows, last_analyzed
      FROM all_tables
      WHERE owner = :schema
      AND table_name IN ('PHOTOS', 'PROJECTS', 'TASKS', 'YOLO_DETECTIONS')
      ORDER BY table_name
    `, { schema: process.env.ORACLE_USER.toUpperCase() });

    console.log('\n📊 PhotoSight Tables:');
    console.log('=' .repeat(60));
    
    if (result.rows && result.rows.length > 0) {
      for (const row of result.rows) {
        console.log(`Table: ${row[1]}`);
        console.log(`  Owner: ${row[0]}`);
        console.log(`  Rows: ${row[2] || 'Not analyzed'}`);
        console.log(`  Last Analyzed: ${row[3] || 'Never'}`);
        console.log('-'.repeat(60));
      }
    } else {
      console.log('No PhotoSight tables found');
    }

    // Test a simple query
    const photoCount = await connection.execute(
      'SELECT COUNT(*) FROM PHOTOS'
    );
    console.log(`\n📸 Total photos in database: ${photoCount.rows[0][0]}`);

    await connection.close();
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testListTables();