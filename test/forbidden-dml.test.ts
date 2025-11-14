import { describe, expect, test } from "bun:test";

describe("Forbidden DML validation", () => {
  const forbiddeDml =
    /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP|CREATE|GRANT|REVOKE|DENY)\b/i;

  test("should reject INSERT statements", () => {
    const query = "INSERT INTO users (name) VALUES ('test')";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject UPDATE statements", () => {
    const query = "UPDATE users SET name = 'test' WHERE id = 1";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject DELETE statements", () => {
    const query = "DELETE FROM users WHERE id = 1";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject TRUNCATE statements", () => {
    const query = "TRUNCATE TABLE users";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject ALTER statements", () => {
    const query = "ALTER TABLE users ADD COLUMN email VARCHAR(255)";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject DROP statements", () => {
    const query = "DROP TABLE users";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject CREATE statements", () => {
    const query = "CREATE TABLE users (id INT PRIMARY KEY)";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject GRANT statements", () => {
    const query = "GRANT SELECT ON users TO public";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject REVOKE statements", () => {
    const query = "REVOKE SELECT ON users FROM public";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject DENY statements", () => {
    const query = "DENY SELECT ON users TO public";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should accept SELECT statements", () => {
    const query = "SELECT * FROM users WHERE id = 1";
    expect(forbiddeDml.test(query)).toBe(false);
  });

  test("should accept SELECT with JOIN", () => {
    const query =
      "SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id";
    expect(forbiddeDml.test(query)).toBe(false);
  });

  test("should accept SELECT with subquery", () => {
    const query =
      "SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)";
    expect(forbiddeDml.test(query)).toBe(false);
  });

  test("should be case insensitive for INSERT", () => {
    const query = "insert into users (name) values ('test')";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should be case insensitive for UPDATE", () => {
    const query = "update users set name = 'test'";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should be case insensitive for DELETE", () => {
    const query = "delete from users";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject queries with forbidden keywords in middle", () => {
    const query = "SELECT * FROM users; DELETE FROM users";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should reject CREATE even with spaces", () => {
    const query = "  CREATE   TABLE   users  ";
    expect(forbiddeDml.test(query)).toBe(true);
  });

  test("should not reject words containing forbidden keywords", () => {
    // "inserted" contains "insert" but is not the keyword
    const query = "SELECT inserted_at FROM users";
    expect(forbiddeDml.test(query)).toBe(false);
  });

  test("should not reject column names with forbidden keywords", () => {
    const query = "SELECT created_by, updated_by FROM users";
    expect(forbiddeDml.test(query)).toBe(false);
  });
});
