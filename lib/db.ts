import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "backend", "picnic.db");

declare global {
  // eslint-disable-next-line no-var
  var _picnicDb: Database.Database | undefined;
  // eslint-disable-next-line no-var
  var _picnicDbWrite: Database.Database | undefined;
}

// Read-only connection (used by all GET routes)
const db: Database.Database =
  process.env.NODE_ENV === "production"
    ? new Database(DB_PATH, { readonly: true })
    : (global._picnicDb ??
        (global._picnicDb = new Database(DB_PATH, { readonly: true })));

// Write-enabled connection (used by mutation routes like /api/checkout)
export const dbWrite: Database.Database =
  process.env.NODE_ENV === "production"
    ? new Database(DB_PATH)
    : (global._picnicDbWrite ??
        (global._picnicDbWrite = new Database(DB_PATH)));

// ── Migrations ────────────────────────────────────────────────────────────────
// Run on the write connection (read-only connection can't ALTER TABLE)
try {
  dbWrite.prepare("ALTER TABLE orders ADD COLUMN co2_saved REAL DEFAULT 0").run();
} catch {
  // Column already exists — ignore
}

export default db;
