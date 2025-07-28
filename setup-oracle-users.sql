-- Run this script as ADMIN user to create the photosight users
-- Connect using SQL*Plus: 
-- export TNS_ADMIN=/Users/sam/oracle-wallets/photosight
-- /opt/oracle/instantclient_19_16/sqlplus admin@photosightdb_high

-- Create read-only user
-- Note: Replace ${READONLY_USER_PASSWORD} with your actual password when running
CREATE USER photosight_readonly IDENTIFIED BY "${READONLY_USER_PASSWORD}";
GRANT CREATE SESSION TO photosight_readonly;
GRANT SELECT ANY TABLE TO photosight_readonly;

-- Create development user with more privileges  
-- Note: Replace ${DEV_USER_PASSWORD} with your actual password when running
CREATE USER photosight_dev IDENTIFIED BY "${DEV_USER_PASSWORD}";
GRANT CREATE SESSION TO photosight_dev;
GRANT SELECT ANY TABLE TO photosight_dev;
GRANT INSERT ANY TABLE TO photosight_dev;
GRANT UPDATE ANY TABLE TO photosight_dev;
GRANT DELETE ANY TABLE TO photosight_dev;

-- Grant quota on tablespace (adjust as needed)
ALTER USER photosight_dev QUOTA UNLIMITED ON DATA;

COMMIT;