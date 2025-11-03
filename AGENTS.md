# Agent Guidelines for nala-db-mcp

## Build/Lint/Test Commands
- **Lint & Format**: `bun run check` (runs Biome with auto-fix)
- **Run All Tests**: `bun test`
- **Run Single Test**: `bun test <file-path>` (e.g., `bun test test/db.test.ts`)
- **Start Server**: `bun run start`

## Code Style
- **Runtime**: Bun (use Bun APIs like `bun:sqlite`, `bun:test` when available)
- **Formatter**: Biome with space indentation, double quotes, organized imports
- **TypeScript**: Strict mode enabled (`tsconfig.json`); use `noUncheckedIndexedAccess` and `noImplicitOverride`
- **Imports**: Organize imports alphabetically; use `.js` extension for MCP SDK imports
- **Types**: Prefer explicit types; use `const` type assertions (e.g., `"sqlite" as const`)
- **Any Usage**: Only use `any` when necessary with `biome-ignore` comment explaining why
- **Error Handling**: Use tuple pattern `[result, error]` via `to()` helper for async operations
- **Naming**: camelCase for variables/functions, PascalCase for types, SCREAMING_SNAKE_CASE for constants/regex
- **Async**: Always close database connections after queries; use `async`/`await` consistently

## Project Structure
- Entry point: `index.ts` (MCP server setup)
- Core logic: `src/db.ts` (database connection and utilities)
- Tests: `test/*.test.ts` (Bun test framework)
