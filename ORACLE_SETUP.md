# Oracle MCP Server Setup Guide

## Current Status

✅ **Completed:**
- Oracle MCP server code ready
- Oracle Instant Client installed at `/opt/oracle/instantclient_19_16`
- Wallet extracted to `/Users/sam/oracle-wallets/photosight`
- TNS configuration ready
- Connection reaching the database successfully

❌ **Pending:**
- Need the ADMIN password for your Autonomous Database

## Next Steps

### 1. Get/Reset ADMIN Password

The ADMIN password was set when you created the Autonomous Database. If you don't remember it:

1. Go to [Oracle Cloud Console](https://cloud.oracle.com)
2. Navigate to your Autonomous Database (photosightdb)
3. Click "More Actions" → "Administrator Password"
4. Reset the password

### 2. Update .env File

Add the ADMIN password to `.env`:
```
ORACLE_PASSWORD=your_admin_password_here
```

### 3. Test Connection

```bash
node test-oracle-connection.js
```

### 4. (Optional) Create Application Users

Once connected as ADMIN, you can create specific users:

```bash
export TNS_ADMIN=/Users/sam/oracle-wallets/photosight
/opt/oracle/instantclient_19_16/sqlplus admin@photosightdb_high

# Then run:
@setup-oracle-users.sql
```

This will create:
- `photosight_readonly` - Read-only access
- `photosight_dev` - Read/write access

### 5. Start Using the MCP Server

Once connected, the server provides these tools:
- `execute_query` - Run any SQL query
- `list_tables` - Browse database tables
- `describe_table` - View table structure
- `get_table_indexes` - Check indexes
- `get_table_constraints` - View constraints
- `list_schemas` - List accessible schemas

## Connection Test Output

When successful, you should see:
```
✅ Successfully connected to Oracle Database
Database version: Oracle Database 19c Enterprise Edition...
Current schema: ADMIN
Tables in current schema: X
```

## Alternative: Direct SQL Developer Web Access

Your database is also accessible via:
https://gfca71b2aacce62-photosightdb.adb.us-chicago-1.oraclecloudapps.com/ords/admin/_sdw/

Use this for manual queries while setting up the MCP connection.