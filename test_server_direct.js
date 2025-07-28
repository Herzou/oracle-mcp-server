#!/usr/bin/env node
import oracledb from 'oracledb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Initialize Oracle client
if (process.env.TNS_ADMIN) {
  const clientOpts = {};
  if (process.env.ORACLE_CLIENT_PATH) {
    clientOpts.libDir = process.env.ORACLE_CLIENT_PATH;
  }
  if (process.env.TNS_ADMIN) {
    clientOpts.configDir = process.env.TNS_ADMIN;
  }
  oracledb.initOracleClient(clientOpts);
  console.log('✅ Oracle client initialized');
}

async function getConnection() {
  const config = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_TNS_NAME,
    configDir: process.env.TNS_ADMIN,
    walletLocation: process.env.TNS_ADMIN,
    walletPassword: process.env.ORACLE_PASSWORD
  };
  
  return await oracledb.getConnection(config);
}

async function testServerTools() {
  console.log('🧪 Testing Oracle MCP Server Tools\n');
  
  try {
    // Test 1: List tables (simulate list_tables tool)
    console.log('1️⃣ Testing list_tables tool:');
    const conn1 = await getConnection();
    const tables = await conn1.execute(`
      SELECT owner, table_name, num_rows
      FROM all_tables
      WHERE owner = :owner
      ORDER BY table_name
      FETCH FIRST 10 ROWS ONLY
    `, { owner: process.env.ORACLE_USER.toUpperCase() });
    
    console.log(`Found ${tables.rows.length} tables`);
    tables.rows.forEach(row => {
      console.log(`  - ${row[1]} (${row[2] || 0} rows)`);
    });
    await conn1.close();
    
    // Test 2: Describe table (simulate describe_table tool)
    console.log('\n2️⃣ Testing describe_table tool for PHOTOS:');
    const conn2 = await getConnection();
    const columns = await conn2.execute(`
      SELECT column_name, data_type, nullable, data_default
      FROM all_tab_columns
      WHERE owner = :owner AND table_name = :table_name
      ORDER BY column_id
    `, { 
      owner: process.env.ORACLE_USER.toUpperCase(),
      table_name: 'PHOTOS'
    });
    
    console.log(`PHOTOS table has ${columns.rows.length} columns:`);
    columns.rows.forEach(row => {
      console.log(`  - ${row[0]}: ${row[1]} ${row[2] === 'N' ? 'NOT NULL' : ''}`);
    });
    await conn2.close();
    
    // Test 3: Execute query (simulate execute_query tool)
    console.log('\n3️⃣ Testing execute_query tool:');
    const conn3 = await getConnection();
    const result = await conn3.execute(
      'SELECT COUNT(*) as photo_count FROM PHOTOS'
    );
    console.log(`Query result: ${result.rows[0][0]} photos in database`);
    await conn3.close();
    
    // Test 4: Get indexes (simulate get_table_indexes tool)
    console.log('\n4️⃣ Testing get_table_indexes tool for PHOTOS:');
    const conn4 = await getConnection();
    const indexes = await conn4.execute(`
      SELECT index_name, index_type, uniqueness
      FROM all_indexes
      WHERE owner = :owner AND table_name = :table_name
    `, {
      owner: process.env.ORACLE_USER.toUpperCase(),
      table_name: 'PHOTOS'
    });
    
    if (indexes.rows.length > 0) {
      console.log(`Found ${indexes.rows.length} indexes:`);
      indexes.rows.forEach(row => {
        console.log(`  - ${row[0]} (${row[1]}, ${row[2]})`);
      });
    } else {
      console.log('No indexes found for PHOTOS table');
    }
    await conn4.close();
    
    // Test 5: Get constraints (simulate get_table_constraints tool)
    console.log('\n5️⃣ Testing get_table_constraints tool for PHOTOS:');
    const conn5 = await getConnection();
    const constraints = await conn5.execute(`
      SELECT constraint_name, constraint_type
      FROM all_constraints
      WHERE owner = :owner AND table_name = :table_name
    `, {
      owner: process.env.ORACLE_USER.toUpperCase(),
      table_name: 'PHOTOS'
    });
    
    if (constraints.rows.length > 0) {
      console.log(`Found ${constraints.rows.length} constraints:`);
      constraints.rows.forEach(row => {
        const typeMap = {
          'P': 'PRIMARY KEY',
          'U': 'UNIQUE',
          'R': 'FOREIGN KEY',
          'C': 'CHECK'
        };
        console.log(`  - ${row[0]} (${typeMap[row[1]] || row[1]})`);
      });
    } else {
      console.log('No constraints found for PHOTOS table');
    }
    await conn5.close();
    
    console.log('\n✅ All tools tested successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testServerTools();