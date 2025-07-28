# PhotoSight Oracle Configuration Guide

## ✅ Configuration Successfully Updated

Both the Oracle MCP server and PhotoSight Python app are now using the same Oracle backend with these verified settings:

### Database Connection
- **User**: `ADMIN`
- **Password**: `hdv!gwm6DPQ.ycu.jua` (from 1Password "Adb" item)
- **TNS Name**: `photosightdb_high`
- **Wallet Location**: `/Users/sam/oracle-wallets/photosight`
- **Oracle Client**: `/opt/oracle/instantclient_19_16`

### Required Environment Variables for PhotoSight

```bash
# Oracle connection
export ORACLE_USER=ADMIN
export ORACLE_PASSWORD='hdv!gwm6DPQ.ycu.jua'
export TNS_ADMIN=/Users/sam/oracle-wallets/photosight
export ORACLE_CLIENT_PATH=/opt/oracle/instantclient_19_16

# For Python oracledb thick mode
export LD_LIBRARY_PATH=/opt/oracle/instantclient_19_16:$LD_LIBRARY_PATH
```

### Python Connection Code

```python
import oracledb

# Initialize thick mode (required for wallet)
oracledb.init_oracle_client(
    lib_dir="/opt/oracle/instantclient_19_16",
    config_dir="/Users/sam/oracle-wallets/photosight"
)

# Connect using TNS name
connection = oracledb.connect(
    user="ADMIN",
    password="hdv!gwm6DPQ.ycu.jua",
    dsn="photosightdb_high",
    config_dir="/Users/sam/oracle-wallets/photosight",
    wallet_location="/Users/sam/oracle-wallets/photosight",
    wallet_password="hdv!gwm6DPQ.ycu.jua"
)
```

## Issue Resolution Summary

The PhotoSight Python app connection issues were resolved by:
1. ✅ Updated wallet path from `~/Downloads/wallet2` to `/Users/sam/oracle-wallets/photosight`
2. ✅ Implemented Oracle thick mode initialization
3. ✅ Using TNS name (`photosightdb_high`) instead of direct DSN
4. ✅ Fixed .env.oracle to remove conflicting TNS_ADMIN export

## Verified Working

Both systems are now successfully connected:
- **Oracle MCP Server**: ✅ Connected and operational
- **PhotoSight Python App**: ✅ Connected and found 4 PhotoSight tables
  - PHOTOS
  - PROJECTS  
  - TASKS
  - YOLO_DETECTIONS

## Migration Complete

PhotoSight has been migrated from:
- **From**: PostgreSQL (Docker container `photosight-postgres`)
- **To**: Oracle Autonomous Database (photosightdb)

Both the Node.js MCP server and Python PhotoSight application are now using the same Oracle backend with identical configuration.