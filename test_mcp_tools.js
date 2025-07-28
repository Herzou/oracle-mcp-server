#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testMCPServer() {
  console.log('🚀 Testing Oracle MCP Server Tools\n');
  
  // Start the server process
  const serverProcess = spawn('node', ['src/index.js'], {
    cwd: '/Users/sam/dev/oracle-mcp',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Create MCP client
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['src/index.js'],
    cwd: '/Users/sam/dev/oracle-mcp',
  });

  const client = new Client({
    name: 'oracle-mcp-test-client',
    version: '1.0.0',
  }, {
    capabilities: {}
  });

  try {
    // Connect to server
    await client.connect(transport);
    console.log('✅ Connected to Oracle MCP server\n');

    // Test 1: List tables
    console.log('📋 Test 1: List Tables');
    console.log('=' .repeat(50));
    const tablesResult = await client.callTool('list_tables', {});
    console.log(JSON.parse(tablesResult.content[0].text).slice(0, 5)); // Show first 5 tables
    
    // Test 2: Describe PHOTOS table
    console.log('\n📊 Test 2: Describe PHOTOS Table');
    console.log('=' .repeat(50));
    const describeResult = await client.callTool('describe_table', {
      table_name: 'PHOTOS'
    });
    console.log(JSON.parse(describeResult.content[0].text));
    
    // Test 3: Execute a query
    console.log('\n🔍 Test 3: Execute Query');
    console.log('=' .repeat(50));
    const queryResult = await client.callTool('execute_query', {
      query: 'SELECT table_name, num_rows FROM user_tables WHERE table_name LIKE :pattern',
      params: ['%PHOTO%']
    });
    console.log(JSON.parse(queryResult.content[0].text));
    
    // Test 4: Get indexes
    console.log('\n🔑 Test 4: Get Indexes for PHOTOS');
    console.log('=' .repeat(50));
    const indexResult = await client.callTool('get_table_indexes', {
      table_name: 'PHOTOS'
    });
    console.log(JSON.parse(indexResult.content[0].text));
    
    // Test 5: List schemas
    console.log('\n🏗️ Test 5: List Schemas');
    console.log('=' .repeat(50));
    const schemasResult = await client.callTool('list_schemas', {});
    console.log(JSON.parse(schemasResult.content[0].text).slice(0, 5)); // Show first 5 schemas

    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    serverProcess.kill();
  }
}

// Run the test
testMCPServer().catch(console.error);