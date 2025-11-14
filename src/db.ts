import { SQL } from "bun";
import { ConnectionString } from "connection-string";
import sqlServer from "mssql";
import z from "zod";

type SupportedDatabaseTypes = "sqlite" | "mysql" | "postgres" | "mssql";

export const forbiddenDml =
  /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP|CREATE|GRANT|REVOKE|DENY)\b/i;

// Loads DATABASE_URL environment variable and returns a database connection
const loadConnectionStringFromEnv = (): string => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return connectionString;
};

const getDatabaseType = (connectionString: string): SupportedDatabaseTypes => {
  if (connectionString.includes("sqlite")) {
    return "sqlite" as const;
  } else if (connectionString.includes("mysql")) {
    return "mysql" as const;
  } else if (connectionString.includes("postgres")) {
    return "postgres" as const;
  } else if (connectionString.includes("mssql")) {
    return "mssql" as const;
  } else {
    throw new Error("Unsupported database type");
  }
};

const querySchema = z
  .string()
  .min(1)
  .refine((query) => !forbiddenDml.test(query), {
    message: "Query must not be a destructive/update query",
  });

type QueryRunner = {
  query: (query: string) => Promise<{
    // biome-ignore lint/suspicious/noExplicitAny: we don't know the type of the rows
    rows: any[];
  }>;
};

export const getQueryRunner = async (): Promise<QueryRunner> => {
  const connectionString = loadConnectionStringFromEnv();
  const databaseType = getDatabaseType(connectionString);

  if (
    databaseType === "sqlite" ||
    databaseType === "postgres" ||
    databaseType === "mysql"
  ) {
    const database = new SQL(connectionString, { readonly: true });
    return {
      query: async (query: string) => {
        querySchema.parse(query);
        const result = await database.unsafe(query);
        await database.close();
        return {
          // biome-ignore lint/suspicious/noExplicitAny: we don't know the type of the rows
          rows: result as any[],
        };
      },
    };
  }

  if (databaseType !== "mssql") throw new Error("Unsupported database type");

  const cs = new ConnectionString(connectionString);
  const host = cs.hosts?.[0]?.name ?? "";
  const port = cs.hosts?.[0]?.port ?? 0;
  const username = cs.user ?? "";
  const password = cs.password ?? "";
  const database = cs.path?.[0] ?? "";

  const sql = await sqlServer.connect(
    `Server=${host},${port};Database=${database};User Id=${username};Password=${password};Encrypt=true;TrustServerCertificate=true;ApplicationName=nala-db-mcp;ApplicationIntent=ReadOnly;`,
  );

  return {
    query: async (query: string) => {
      querySchema.parse(query);
      const result = await sql.query(query);
      await sql.close();
      return {
        rows: result.recordset,
      };
    },
  };
};

export async function to<T>(promise: Promise<T>): Promise<[T | null, unknown]> {
  try {
    const result = await promise;
    return [result, null];
  } catch (err) {
    return [null, err];
  }
}

// We convert the array to a CSV string, it have the headers on the first row and then the data rows
// biome-ignore lint/suspicious/noExplicitAny: we don't know the type of the array
export const arrayToCsv = (array: any[]): string => {
  const headers = Object.keys(array[0]);
  const csv = [
    headers.join(","),
    ...array.map((row) => Object.values(row).join(",")),
  ].join("\n");
  return csv;
};
