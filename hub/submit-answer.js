// hub/submit-answer.js
const API_BASE = "http://localhost:3001/api";

const urlParams = new URLSearchParams(window.location.search);
const CASE_SLUG = urlParams.get("case") || "case-01";

const titleEl = document.querySelector(".sa-title");
const playerLineEl = document.getElementById("sa-player-line");
const listEl = document.getElementById("sa-puzzle-list");

if (titleEl) titleEl.textContent = `Submit Jawaban — ${CASE_SLUG}`;

let manifest = null;
let solvedIds = new Set();

async function init() {
  const playerId = localStorage.getItem("arg_player_id");
  const displayName = localStorage.getItem("arg_display_name");

  if (!playerId) {
    playerLineEl.textContent = "";
    listEl.innerHTML = `<div class="sa-login-warning">Kamu belum login. <a href="index.html" style="color:var(--hub-accent)">Kembali ke hub</a> untuk masuk dengan nama detektifmu dulu.</div>`;
    return;
  }

  playerLineEl.textContent = `Masuk sebagai ${displayName}`;

  let manifestRes, progressRes;
  try {
    [manifestRes, progressRes] = await Promise.all([
      fetch(`puzzle-manifest-${CASE_SLUG}.json`).then((r) => {
        if (!r.ok) throw new Error(`manifest untuk "${CASE_SLUG}" tidak ditemukan`);
        return r.json();
      }),
      fetch(`${API_BASE}/progress/${playerId}/${CASE_SLUG}`).then((r) => r.json()),
    ]);
  } catch (err) {
    listEl.innerHTML = `<div class="sa-login-warning">Gagal memuat data kasus: ${err.message}</div>`;
    return;
  }

  manifest = manifestRes;
  solvedIds = new Set((progressRes.solved || []).map((s) => s.puzzle_id));

  render();
}

function getPuzzleStatus(puzzleId) {
  if (solvedIds.has(puzzleId)) return "solved";
  const idx = manifest.order.indexOf(puzzleId);
  if (idx === 0) return "unlocked"; // puzzle pertama selalu terbuka
  const prevId = manifest.order[idx - 1];
  return solvedIds.has(prevId) ? "unlocked" : "locked";
}

function render() {
  listEl.innerHTML = "";

  manifest.order.forEach((puzzleId, idx) => {
    const puzzle = manifest.puzzles[puzzleId];
    const status = getPuzzleStatus(puzzleId);

    const card = document.createElement("div");
    card.className = `sa-puzzle ${status === "locked" ? "sa-puzzle--locked" : ""} ${status === "solved" ? "sa-puzzle--solved" : ""}`;

    const statusLabel =
      status === "solved" ? "✓ Terpecahkan" : status === "locked" ? "🔒 Terkunci" : "Terbuka";
    const statusClass = status === "solved" ? "sa-puzzle__status--solved" : "";

    card.innerHTML = `
      <div class="sa-puzzle__header">
        <span class="sa-puzzle__name">${idx + 1}. ${puzzleId.replace(/-/g, " ")}</span>
        <span class="sa-puzzle__status ${statusClass}">${statusLabel} &middot; ${puzzle.pointValue} pts</span>
      </div>
      <p class="sa-puzzle__prompt">${status === "locked" ? "Selesaikan puzzle sebelumnya untuk membuka ini." : puzzle.prompt}</p>
      ${
        status === "unlocked"
          ? `<div class="sa-puzzle__row">
               <input type="text" placeholder="Jawabanmu..." data-puzzle-id="${puzzleId}">
               <button data-puzzle-id="${puzzleId}">Submit</button>
             </div>
             <p class="sa-puzzle__feedback" data-feedback-for="${puzzleId}"></p>`
          : ""
      }
    `;

    listEl.appendChild(card);
  });

  listEl.querySelectorAll("button[data-puzzle-id]").forEach((btn) => {
    btn.addEventListener("click", () => submitAnswer(btn.dataset.puzzleId));
  });
}

async function submitAnswer(puzzleId) {
  const input = listEl.querySelector(`input[data-puzzle-id="${puzzleId}"]`);
  const feedbackEl = listEl.querySelector(`[data-feedback-for="${puzzleId}"]`);
  const answer = input.value.trim();
  const playerId = localStorage.getItem("arg_player_id");

  if (!answer) {
    feedbackEl.textContent = "Tulis jawaban dulu.";
    feedbackEl.className = "sa-puzzle__feedback sa-puzzle__feedback--wrong";
    return;
  }

  feedbackEl.textContent = "Memeriksa...";
  feedbackEl.className = "sa-puzzle__feedback";

  try {
    const res = await fetch(`${API_BASE}/validate-clue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: Number(playerId), caseSlug: CASE_SLUG, puzzleId, answer }),
    });
    const data = await res.json();

    if (data.correct) {
      feedbackEl.textContent = `Benar! +${data.pointValue} poin.`;
      feedbackEl.className = "sa-puzzle__feedback sa-puzzle__feedback--correct";
      solvedIds.add(puzzleId);
      setTimeout(render, 700); // beri jeda agar pemain sempat baca feedback sebelum kartu berubah
    } else {
      feedbackEl.textContent = "Belum tepat, coba lagi.";
      feedbackEl.className = "sa-puzzle__feedback sa-puzzle__feedback--wrong";
    }
  } catch (err) {
    feedbackEl.textContent = `Gagal menghubungi server (${err.message})`;
    feedbackEl.className = "sa-puzzle__feedback sa-puzzle__feedback--wrong";
  }
}

init();
