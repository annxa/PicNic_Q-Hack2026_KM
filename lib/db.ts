import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "picnic.db");

declare global {
  // eslint-disable-next-line no-var
  var _picnicDb: Database.Database | undefined;
}

function openDb(): Database.Database {
  return new Database(DB_PATH, { readonly: true });
}

// Reuse connection across hot reloads in development
const db: Database.Database =
  process.env.NODE_ENV === "production"
    ? openDb()
    : (global._picnicDb ?? (global._picnicDb = openDb()));

export default db;
