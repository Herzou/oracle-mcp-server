#!/usr/bin/env node

// Test script to simulate MCP tool calls
import { OracleMCPServer } from './src/index.js';

async function testMCPTools() {
  const server = new OracleMCPServer();
  
  console.log('Testing Oracle MCP Server Tools...\n');
  
  try {
    // Test 1: List schemas
    console.log('1. Testing list_schemas:');
    const schemas = await server.handleListSchemas({});
    console.log(`Found ${JSON.parse(schemas.content[0].text).length} schemas\n`);
    
    // Test 2: List tables
    console.log('2. Testing list_tables:');
    const tables = await server.handleListTables({ schema: 'ADMIN' });
    const tableData = JSON.parse(tables.content[0].text);
    console.log(`Found ${tableData.length} tables in ADMIN schema`);
    console.log('Sample tables:', tableData.slice(0, 5).map(t => t.TABLE_NAME).join(', '), '\n');
    
    // Test 3: Describe PHOTOS table
    console.log('3. Testing describe_table for PHOTOS:');
    const photoTable = await server.handleDescribeTable({ table_name: 'PHOTOS' });
    const columns = JSON.parse(photoTable.content[0].text).columns;
    console.log(`PHOTOS table has ${columns.length} columns`);
    console.log('Sample columns:', columns.slice(0, 5).map(c => `${c.COLUMN_NAME} (${c.DATA_TYPE})`).join(', '), '\n');
    
    // Test 4: Execute a simple query
    console.log('4. Testing execute_query:');
    const query = await server.handleExecuteQuery({
      query: 'SELECT COUNT(*) as photo_count FROM PHOTOS',
      maxRows: 10
    });
    const queryResult = JSON.parse(query.content[0].text);
    console.log('Query result:', queryResult.rows[0], '\n');
    
    // Test 5: Get table constraints
    console.log('5. Testing get_table_constraints for PHOTOS:');
    const constraints = await server.handleGetTableConstraints({ table_name: 'PHOTOS' });
    const constraintData = JSON.parse(constraints.content[0].text);
    console.log(`Found ${constraintData.length} constraints\n`);
    
    console.log('✅ All MCP tools tested successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testMCPTools();