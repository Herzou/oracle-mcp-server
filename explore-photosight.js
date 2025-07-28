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

async function explorePhotoSight() {
  let connection;
  
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_TNS_NAME
    });
    
    console.log('🔍 Exploring PhotoSight Database\n');
    
    // Check table row counts
    const countQuery = `
      SELECT 
        'PHOTOS' as table_name, COUNT(*) as row_count FROM PHOTOS
      UNION ALL
      SELECT 'PROJECTS', COUNT(*) FROM PROJECTS
      UNION ALL
      SELECT 'TASKS', COUNT(*) FROM TASKS
      UNION ALL
      SELECT 'FACE_DETECTIONS', COUNT(*) FROM FACE_DETECTIONS
      UNION ALL
      SELECT 'YOLO_DETECTIONS', COUNT(*) FROM YOLO_DETECTIONS
      UNION ALL
      SELECT 'ANALYSIS_RESULTS', COUNT(*) FROM ANALYSIS_RESULTS
    `;
    
    const counts = await connection.execute(countQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    console.log('📊 Table Row Counts:');
    counts.rows.forEach(row => {
      console.log(`   ${row.TABLE_NAME}: ${row.ROW_COUNT} rows`);
    });
    
    // Check PHOTOS table structure
    console.log('\n📷 PHOTOS Table Structure (first 10 columns):');
    const photoColumns = await connection.execute(
      `SELECT column_name, data_type, nullable 
       FROM user_tab_columns 
       WHERE table_name = 'PHOTOS' 
       ORDER BY column_id
       FETCH FIRST 10 ROWS ONLY`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    photoColumns.rows.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.NULLABLE === 'N' ? 'NOT NULL' : ''}`);
    });
    
    // Check if there are any photos
    const samplePhotos = await connection.execute(
      `SELECT file_path, capture_date, width, height, file_size_bytes
       FROM PHOTOS 
       WHERE ROWNUM <= 5`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (samplePhotos.rows.length > 0) {
      console.log('\n📸 Sample Photos:');
      samplePhotos.rows.forEach(photo => {
        console.log(`   - ${photo.FILE_PATH}`);
        console.log(`     Date: ${photo.CAPTURE_DATE}, Size: ${photo.WIDTH}x${photo.HEIGHT}, ${Math.round(photo.FILE_SIZE_BYTES/1024/1024)}MB`);
      });
    } else {
      console.log('\n📸 No photos found in database yet.');
    }
    
    // Check JSON columns
    console.log('\n🔧 JSON Search Indexes:');
    const jsonIndexes = await connection.execute(
      `SELECT index_name, index_type, status 
       FROM user_indexes 
       WHERE index_name LIKE 'IDX_%JSON%'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    jsonIndexes.rows.forEach(idx => {
      console.log(`   - ${idx.INDEX_NAME} (${idx.INDEX_TYPE}) - ${idx.STATUS}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

explorePhotoSight();