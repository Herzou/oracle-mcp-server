DROP TABLE IF EXISTS "V_PRIVILEGE";

CREATE OR REPLACE VIEW "V_PRIVILEGE" (
    "ID", 
    "CD_APP", 
    "SLUG", 
    "PRIVILEGE", 
    "APP_NOM", 
    "DESCRIPTION", 
    "TYPE", 
    "ROLE", 
    "ACCES"
) AS 
SELECT 
    pv."ID",
    pv."CD_APP",
    ap."SLUG",
    pv."PRIVILEGE",
    ap."APP_NOM",
    pv."DESCRIPTION",
    pv."PRIV_TYPE" AS "TYPE", 
    pv."NIVEAU_ROLE" AS "ROLE", 
    pv."NIVEAU_ACCES" AS "ACCES"
FROM "APP_PRIVILEGE" pv 
LEFT JOIN "APP_LIST" ap ON pv."CD_APP" = ap."CD_APP";
