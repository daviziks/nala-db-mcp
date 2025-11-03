#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import { arrayToCsv, getQueryRunner, to } from "./src/db";

const server = new McpServer({
  name: "nala-db-mcp",
  version: "1.0.0",
  title: "Nala Database MCP",
  description: "A MCP for querying databases",
});

const forbiddeDml =
  /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP|CREATE|GRANT|REVOKE|DENY)\b/i;

const inputSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe("MUST NOT BE A DESTRUCTIVE/UPDATE QUERY")
    .refine((query) => !forbiddeDml.test(query), {
      message: "Query must not be a destructive/update query",
    }),
});

server.registerTool(
  "run-query",
  {
    title: "Peforms a query on the database",
    inputSchema: inputSchema.shape,
  },
  async (input) => {
    const [queryRunner, error] = await to(getQueryRunner());
    if (error || !queryRunner) {
      return {
        isError: true,
        content: [
          {
            text: `Failed to initialize the query runner, verify your environment variables, here is the error: ${error}`,
            type: "text",
          },
        ],
      };
    }
    const result = await queryRunner.query(input.query);
    return {
      content: [
        {
          type: "text",
          text: arrayToCsv(result.rows),
        },
      ],
      isError: false,
    };
  },
);

const transport = new StdioServerTransport();

const [, error] = await to(server.connect(transport));

if (error) {
  console.error("Failed to connect to Nala Database MCP", error);
  process.exit(1);
}

console.log("Nala Database MCP is running on stdio");
