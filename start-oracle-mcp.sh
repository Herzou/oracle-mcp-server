#!/bin/bash

# Oracle MCP Server Startup Script
# Ensures all environment variables are set properly

# Set Oracle environment variables
export ORACLE_TNS_NAME=photosightdb_high
export ORACLE_USER=ADMIN
export ORACLE_PASSWORD="hdv!gwm6DPQ.ycu.jua"
export TNS_ADMIN=/Users/sam/oracle-wallets/photosight
export ORACLE_CLIENT_PATH=/opt/oracle/instantclient_19_16

# Change to the project directory
cd "$(dirname "$0")"

# Start the MCP server
exec node src/index.js