// backend/src/routes/validate-clue.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const { checkAnswer } = require("../../../puzzle-engine/clue-checker/validators");
const { recordSolve } = require("../models/ProgressEntry");

const ANSWER_KEYS_DIR = path.join(__dirname, "../../../puzzle-engine/clue-checker/answer-keys");
const answerKeyCache = {};

function loadAnswerKey(caseSlug) {
  if (answerKeyCache[caseSlug]) return answerKeyCache[caseSlug];
  const filePath = path.join(ANSWER_KEYS_DIR, `${caseSlug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  answerKeyCache[caseSlug] = data;
  return data;
}

function validateClueRouter(db) {
  const router = express.Router();

  // POST /api/validate-clue
  // body: { playerId, caseSlug, puzzleId, answer }
  // response: { correct, unlocksNext, pointValue, firstSolve }
  //
  // PENTING: endpoint ini TIDAK PERNAH mengembalikan jawaban yang benar,
  // hanya boolean correct + metadata unlock. Itulah alasan validasi
  // dilakukan di sini, bukan di client/dist.
  router.post("/", (req, res) => {
    const { playerId, caseSlug, puzzleId, answer } = req.body;

    if (!playerId || !caseSlug || !puzzleId || typeof answer !== "string") {
      return res.status(400).json({ error: "Field tidak lengkap" });
    }

    const answerKey = loadAnswerKey(caseSlug);
    if (!answerKey) {
      return res.status(404).json({ error: "Case tidak ditemukan" });
    }

    const entry = answerKey.puzzles[puzzleId];
    const result = checkAnswer(entry, answer);

    let firstSolve = false;
    if (result.correct) {
      firstSolve = recordSolve(db, {
        playerId: Number(playerId),
        caseSlug,
        puzzleId,
        pointValue: result.pointValue,
      });
    }

    res.json({
      correct: result.correct,
      unlocksNext: result.unlocksNext || null,
      pointValue: result.pointValue || 0,
      firstSolve,
    });
  });

  return router;
}

module.exports = validateClueRouter;
