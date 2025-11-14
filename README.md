# nala-db-mcp

A Model Context Protocol (MCP) server for querying databases. Supports SQLite, PostgreSQL, MySQL, and Microsoft SQL Server with read-only access.

## Features

- **Multiple Database Support**: SQLite, PostgreSQL, MySQL, and MS SQL Server
- **Read-Only Operations**: Safe query execution with DML operation blocking
- **MCP Integration**: Exposes database querying via the Model Context Protocol
- **CSV Output**: Query results returned in CSV format
- **Environment-Based Configuration**: Connection via `DATABASE_URL` environment variable

## Usage

You can use this MCP server with any MCP client, such as Cursor or Claude Desktop.

### Configuration in Cursor

Add the following configuration to your MCP settings file (typically in your Cursor settings or `.cursorrules`):

```json
{
  "mcpServers": {
    "nala-db-mcp": {
      "command": "bunx nala-db-mcp",
      "env": {
        "DATABASE_URL": "mssql://sa:test@localhost:1433/test"
      }
    }
  }
}
```

Replace the `DATABASE_URL` value with your database connection string:

- **SQLite**: `sqlite://path/to/database.db`
- **PostgreSQL**: `postgres://user:password@localhost:5432/dbname`
- **MySQL**: `mysql://user:password@localhost:3306/dbname`
- **MS SQL Server**: `mssql://user:password@localhost:1433/dbname`

Once configured, the MCP server will be available in your Cursor environment, and you can use the `run-query` tool to execute read-only SQL queries.

## Usage (Local)

For local development or custom integrations, you can install and run the server directly.

### Installation

```bash
bun install
```

### Configuration

Set your database connection string in the `DATABASE_URL` environment variable:

```bash
# SQLite
export DATABASE_URL="sqlite://path/to/database.db"

# PostgreSQL
export DATABASE_URL="postgres://user:password@localhost:5432/dbname"

# MySQL
export DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# MS SQL Server
export DATABASE_URL="mssql://user:password@localhost:1433/dbname"
```

### Running the Server

```bash
bun run start
```

The MCP server will start and listen on stdio for MCP client connections.

### Available Tools

#### `run-query`

Executes a read-only SQL query against the configured database.

**Input:**
- `query` (string): SQL query to execute. Must be a SELECT query (no INSERT, UPDATE, DELETE, etc.)

**Output:**
- CSV-formatted query results

**Example:**
```sql
SELECT * FROM users WHERE active = 1
```

## Development

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test test/db.test.ts
```

### Linting and Formatting

```bash
bun run check
```

This runs Biome with auto-fix enabled for code formatting and linting.

## Project Structure

- `index.ts` - MCP server setup and tool registration
- `src/db.ts` - Database connection logic and utilities
- `test/db.test.ts` - Test suite

## Security

- Anything isn't bulletproof, so create a new user with READONLY permissions it's recommended
- All database connections are read-only
- DML operations (INSERT, UPDATE, DELETE, etc.) are blocked via regex validation
- Connection strings support encrypted connections (MS SQL Server uses `Encrypt=true`)

## License

MIT

---

Built with [Bun](https://bun.com) and the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
