#!/usr/bin/env node
import { spawn } from 'child_process';
import { stdin as input, stdout as output } from 'process';

// Start the MCP server
const server = spawn('node', ['src/index.js'], {
  cwd: '/Users/sam/dev/oracle-mcp',
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'test' }
});

// Handle server output
let buffer = '';
server.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('Server response:', JSON.stringify(response, null, 2));
        
        // Exit after getting response
        if (response.result || response.error) {
          server.kill();
          process.exit(0);
        }
      } catch (e) {
        // Not JSON, just log it
        console.log('Server:', line);
      }
    }
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

// Send test requests
setTimeout(() => {
  // Initialize connection
  const initRequest = {
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '0.1.0',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    },
    id: 1
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // List tables after a short delay
  setTimeout(() => {
    const listTablesRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'list_tables',
        arguments: {}
      },
      id: 2
    };
    
    server.stdin.write(JSON.stringify(listTablesRequest) + '\n');
  }, 500);
}, 1000);

// Timeout after 5 seconds
setTimeout(() => {
  console.log('Test timed out');
  server.kill();
  process.exit(1);
}, 5000);