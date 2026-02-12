# Oracle MCP Server

A Model Context Protocol (MCP) server that provides flexible access to Oracle databases for AI assistants like Claude. Supports querying across multiple schemas and comprehensive database introspection.

## Features

- Execute SQL queries with parameter binding
- List tables across multiple schemas or filter by specific schema
- Describe table structures with multi-schema support
- View indexes and constraints across schemas
- Multiple Oracle authentication methods
- Automatic parameter conversion (PostgreSQL style to Oracle)
- SQL injection prevention via bind variables
- Audit logging for security monitoring

## Installation

```bash
npm install
```

## Configuration

### Environment Variables

Create a `.env` file with your Oracle connection details. Choose one of these methods:

#### Method 1: Easy Connect String
```env
ORACLE_CONNECTION_STRING=hostname:1521/service_name
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
```

#### Method 2: TNS Name
```env
ORACLE_TNS_NAME=ORCL
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
```

#### Method 3: Individual Components
```env
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=ORCL  # or ORACLE_SID=ORCL
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
```

Optional settings:
```env
ORACLE_DEFAULT_SCHEMA=HR  # Default schema if different from user
```

## Usage with Claude Desktop / Trae / VS Code

This configuration works for any MCP-compatible client (Claude Desktop, Trae, VS Code with MCP extension).

A pre-configured file `mcp-config.json` has been generated in the project root with your local settings.

You can copy the following configuration into your MCP client's settings file:

- **Trae**: Add to your workspace or global settings.
- **VS Code**: Use with the MCP extension, add to `.vscode/settings.json` or global settings.
- **Claude Desktop**: `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "oracle": {
      "command": "node",
      "args": [
        "D:/DockerProjects/srv56oci8/docker_php56-oci8-srv/web/mcp-oracle/src/index.js"
      ],
      "cwd": "D:/DockerProjects/srv56oci8/docker_php56-oci8-srv/web/mcp-oracle",
      "env": {
        "ORACLE_CONNECTION_STRING": "10.2.249.211:1521/nifdb",
        "ORACLE_USER": "dgigrh",
        "ORACLE_PASSWORD": "your_password"
      }
    }
  }
}
```

> **Note**: Replace `your_password` with your actual password if not using the generated file.
> The generated `mcp-config.json` contains your actual credentials from `.env`.

## Available Tools

1. **execute_query** - Execute any SQL query
   - Supports parameter binding
   - Auto-converts PostgreSQL-style parameters ($1) to Oracle (:1)
   - Returns rows, rowCount, and metadata

2. **list_tables** - List database tables
   - Filter by specific schema or show all accessible schemas
   - Filter by pattern (with % wildcards)
   - Shows schema name, table name, row count, and last analyzed date

3. **describe_table** - Get table structure
   - Column names, types, sizes
   - Nullable constraints
   - Default values
   - Works across all accessible schemas or filter by specific schema

4. **get_table_indexes** - View table indexes
   - Index types and uniqueness
   - Indexed columns
   - Status information
   - Shows schema name for each index

5. **get_table_constraints** - View table constraints
   - Primary keys, foreign keys
   - Unique and check constraints
   - Referenced tables
   - Shows schema name for each constraint

6. **list_schemas** - List all accessible schemas

## Security

- All queries use bind variables to prevent SQL injection
- Connections are created per-query (no persistent pools)
- Comprehensive audit logging with timestamps and duration
- Environment variables keep credentials secure
- Supports both read-only and read-write operations

## Requirements

- Node.js 18+
- Oracle Database (any version)
- Network access to Oracle database

## License

MIT