// backend/src/routes/progress.js
const express = require("express");
const { findOrCreatePlayer } = require("../models/Player");
const { getProgressForPlayer } = require("../models/ProgressEntry");

function progressRouter(db) {
  const router = express.Router();

  // POST /api/progress/identify  { displayName } -> { playerId }
  // Dipanggil sekali di awal sesi pemain (tanpa password — sengaja ringan,
  // ini bukan sistem akun, hanya identitas in-game).
  router.post("/identify", (req, res) => {
    const { displayName } = req.body;
    if (!displayName || typeof displayName !== "string" || displayName.trim().length < 2) {
      return res.status(400).json({ error: "displayName tidak valid (minimal 2 karakter)" });
    }
    const player = findOrCreatePlayer(db, displayName.trim());
    res.json({ playerId: player.id, displayName: player.display_name });
  });

  // GET /api/progress/:playerId/:caseSlug -> daftar puzzle yang sudah terpecahkan
  router.get("/:playerId/:caseSlug", (req, res) => {
    const { playerId, caseSlug } = req.params;
    const rows = getProgressForPlayer(db, Number(playerId), caseSlug);
    res.json({ solved: rows });
  });

  return router;
}

module.exports = progressRouter;
