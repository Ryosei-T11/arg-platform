// backend/src/routes/leaderboard.js
const express = require("express");
const { getLeaderboard } = require("../models/ProgressEntry");

function leaderboardRouter(db) {
  const router = express.Router();

  // GET /api/leaderboard/:caseSlug
  router.get("/:caseSlug", (req, res) => {
    const rows = getLeaderboard(db, req.params.caseSlug);
    res.json({ leaderboard: rows });
  });

  return router;
}

module.exports = leaderboardRouter;
