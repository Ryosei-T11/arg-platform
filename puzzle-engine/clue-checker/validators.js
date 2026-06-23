// puzzle-engine/clue-checker/validators.js
//
// Logika pencocokan jawaban. Dipakai oleh backend/src/routes/validate-clue.js.
// Sengaja TIDAK dipakai langsung di sites-builder/dist — jawaban tidak boleh
// pernah dikirim ke client dalam bentuk apapun, hanya hasil benar/salah.

function normalize(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[.,!?'"]/g, "")
    .replace(/\s+/g, " ");
}

function checkAnswer(answerKeyEntry, userInput) {
  if (!answerKeyEntry) {
    return { correct: false, reason: "puzzle_not_found" };
  }
  const normalizedInput = normalize(userInput);
  const isCorrect = answerKeyEntry.acceptedAnswers
    .map(normalize)
    .includes(normalizedInput);

  return {
    correct: isCorrect,
    unlocksNext: isCorrect ? answerKeyEntry.unlocksNext : null,
    pointValue: isCorrect ? answerKeyEntry.pointValue : 0,
  };
}

module.exports = { checkAnswer, normalize };
