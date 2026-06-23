// backend/src/models/Player.js

function findOrCreatePlayer(db, displayName) {
  const existing = db
    .prepare("SELECT * FROM players WHERE display_name = ?")
    .get(displayName);
  if (existing) return existing;

  const result = db
    .prepare("INSERT INTO players (display_name) VALUES (?)")
    .run(displayName);
  return db.prepare("SELECT * FROM players WHERE id = ?").get(result.lastInsertRowid);
}

function getPlayerById(db, id) {
  return db.prepare("SELECT * FROM players WHERE id = ?").get(id);
}

module.exports = { findOrCreatePlayer, getPlayerById };
