// backend/src/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const progressRouter = require("./routes/progress");
const leaderboardRouter = require("./routes/leaderboard");
const validateClueRouter = require("./routes/validate-clue");

const DB_PATH = path.join(__dirname, "..", "db", "arg-platform.sqlite3");
const SCHEMA_PATH = path.join(__dirname, "..", "db", "schema.sql");
const PORT = process.env.PORT || 3001;

function initDb() {
  const db = new DatabaseSync(DB_PATH);
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  return db;
}

function main() {
  const db = initDb();
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/progress", progressRouter(db));
  app.use("/api/leaderboard", leaderboardRouter(db));
  app.use("/api/validate-clue", validateClueRouter(db));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.listen(PORT, () => {
    console.log(`ARG platform backend jalan di http://localhost:${PORT}`);
  });
}

main();
