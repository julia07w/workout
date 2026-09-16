import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const envText = await readFile(new URL("../.env.local", import.meta.url), "utf8");
const databaseLine = envText.split(/\r?\n/).find((line) => /^\s*DATABASE_URL\s*=/.test(line));

if (!databaseLine) throw new Error("DATABASE_URL отсутствует в .env.local");

const databaseUrl = databaseLine.split("=").slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = schema.split(";").map((statement) => statement.trim()).filter(Boolean);
const sql = neon(databaseUrl);

for (const statement of statements) await sql.query(statement);

const result = await sql.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_profiles', 'workout_progress', 'saved_workouts', 'body_measurements') ORDER BY table_name"
);

console.log(`Neon schema ready: ${result.map((row) => row.table_name).join(", ")}`);
