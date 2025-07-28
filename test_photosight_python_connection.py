#!/usr/bin/env python3
"""Test Oracle connection for PhotoSight using same config as working MCP server"""

import os
import oracledb

try:
    # Use the SAME configuration that works for MCP server
    user = "ADMIN"
    password = "hdv!gwm6DPQ.ycu.jua"  # From 1Password ADB
    config_dir = "/Users/sam/oracle-wallets/photosight"  # Same wallet as MCP
    wallet_location = config_dir
    
    print(f"Config dir: {config_dir}")
    print(f"User: {user}")
    print(f"Connecting to Oracle Autonomous Database (PhotoSight)...")
    
    # Initialize thick mode for wallet support (like MCP server does)
    oracledb.init_oracle_client(
        lib_dir="/opt/oracle/instantclient_19_16",
        config_dir=config_dir
    )
    print("Oracle client initialized in thick mode")
    
    # Use TNS name from the wallet (same as MCP)
    connection = oracledb.connect(
        user=user,
        password=password,
        dsn="photosightdb_high",  # TNS name from tnsnames.ora
        config_dir=config_dir,
        wallet_location=wallet_location,
        wallet_password=password
    )
    
    print("✅ Connection successful!")
    
    # Test query
    cursor = connection.cursor()
    cursor.execute("SELECT banner FROM v$version WHERE ROWNUM = 1")
    result = cursor.fetchone()
    print(f"Database version: {result[0]}")
    
    # Check PhotoSight tables
    cursor.execute("""
        SELECT table_name, num_rows
        FROM user_tables 
        WHERE table_name IN ('PHOTOS', 'PROJECTS', 'TASKS', 'YOLO_DETECTIONS', 'FACE_DETECTIONS')
        ORDER BY table_name
    """)
    tables = cursor.fetchall()
    
    print("\nPhotoSight tables:")
    for table_name, num_rows in tables:
        print(f"  - {table_name}: {num_rows or 0} rows")
    
    cursor.close()
    connection.close()
    
    print("\n✅ PhotoSight Python can connect successfully!")
    print("\nTo fix PhotoSight app, update its connection to use:")
    print(f"  - Wallet: {config_dir}")
    print(f"  - User: {user}")
    print(f"  - TNS: photosightdb_high")
    print(f"  - Oracle Client: /opt/oracle/instantclient_19_16")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()