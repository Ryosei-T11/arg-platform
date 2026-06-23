// backend/src/models/ProgressEntry.js

function recordSolve(db, { playerId, caseSlug, puzzleId, pointValue }) {
  // INSERT OR IGNORE supaya solve ganda tidak menggandakan poin
  const insert = db.prepare(`
    INSERT OR IGNORE INTO progress (player_id, case_slug, puzzle_id, points_awarded)
    VALUES (?, ?, ?, ?)
  `);
  const result = insert.run(playerId, caseSlug, puzzleId, pointValue);
  return result.changes > 0; // true kalau baru pertama kali solve
}

function getProgressForPlayer(db, playerId, caseSlug) {
  return db
    .prepare("SELECT puzzle_id, solved_at, points_awarded FROM progress WHERE player_id = ? AND case_slug = ?")
    .all(playerId, caseSlug);
}

function getLeaderboard(db, caseSlug, limit = 20) {
  return db
    .prepare(`
      SELECT p.display_name, SUM(pr.points_awarded) AS total_points, MAX(pr.solved_at) AS last_solved_at
      FROM progress pr
      JOIN players p ON p.id = pr.player_id
      WHERE pr.case_slug = ?
      GROUP BY pr.player_id
      ORDER BY total_points DESC, last_solved_at ASC
      LIMIT ?
    `)
    .all(caseSlug, limit);
}

module.exports = { recordSolve, getProgressForPlayer, getLeaderboard };
