#!/usr/bin/env node

import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Oracle client
if (process.env.ORACLE_CLIENT_PATH && process.env.TNS_ADMIN) {
  oracledb.initOracleClient({
    libDir: process.env.ORACLE_CLIENT_PATH,
    configDir: process.env.TNS_ADMIN
  });
}

async function exploreSchema() {
  let connection;
  
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_TNS_NAME
    });
    
    console.log('🔍 PhotoSight Database Schema\n');
    
    // List all tables with their purposes
    const tables = await connection.execute(
      `SELECT table_name, num_rows, last_analyzed
       FROM user_tables
       ORDER BY table_name`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('📋 All Tables:');
    const userTables = tables.rows.filter(t => !t.TABLE_NAME.startsWith('DR$'));
    userTables.forEach(table => {
      console.log(`\n   ${table.TABLE_NAME}:`);
      console.log(`   - Rows: ${table.NUM_ROWS || 'not analyzed'}`);
      console.log(`   - Last analyzed: ${table.LAST_ANALYZED || 'never'}`);
    });
    
    // Get PHOTOS table full structure
    console.log('\n\n📷 PHOTOS Table Complete Structure:');
    const photoColumns = await connection.execute(
      `SELECT column_name, data_type, data_length, nullable
       FROM user_tab_columns 
       WHERE table_name = 'PHOTOS' 
       ORDER BY column_id`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    photoColumns.rows.forEach((col, idx) => {
      const type = col.DATA_TYPE === 'VARCHAR2' ? `${col.DATA_TYPE}(${col.DATA_LENGTH})` : col.DATA_TYPE;
      console.log(`   ${idx + 1}. ${col.COLUMN_NAME} - ${type} ${col.NULLABLE === 'N' ? 'NOT NULL' : ''}`);
    });
    
    // Check for any existing data
    console.log('\n\n📊 Data Summary:');
    const dataSummary = await connection.execute(
      `SELECT 
         (SELECT COUNT(*) FROM PHOTOS) as photos,
         (SELECT COUNT(*) FROM PROJECTS) as projects,
         (SELECT COUNT(*) FROM TASKS) as tasks,
         (SELECT COUNT(*) FROM FACE_DETECTIONS) as faces,
         (SELECT COUNT(*) FROM YOLO_DETECTIONS) as objects
       FROM DUAL`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const summary = dataSummary.rows[0];
    console.log(`   Photos: ${summary.PHOTOS}`);
    console.log(`   Projects: ${summary.PROJECTS}`);
    console.log(`   Tasks: ${summary.TASKS}`);
    console.log(`   Face Detections: ${summary.FACES}`);
    console.log(`   Object Detections: ${summary.OBJECTS}`);
    
    // Check indexes
    console.log('\n\n🔍 Indexes (non-system):');
    const indexes = await connection.execute(
      `SELECT index_name, table_name, uniqueness, status
       FROM user_indexes
       WHERE index_name NOT LIKE 'DR$%' AND index_name NOT LIKE 'SYS_%'
       ORDER BY table_name, index_name`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    indexes.rows.forEach(idx => {
      console.log(`   ${idx.INDEX_NAME} on ${idx.TABLE_NAME} (${idx.UNIQUENESS}) - ${idx.STATUS}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

exploreSchema();