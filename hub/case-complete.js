// hub/case-complete.js
const API_BASE = "http://localhost:3001/api";

const urlParams = new URLSearchParams(window.location.search);
const CASE_SLUG = urlParams.get("case") || "case-01";

const playerLineEl = document.getElementById("cc-player-line");
const statsEl = document.getElementById("cc-stats");
const summaryEl = document.getElementById("cc-summary");
const shareBtn = document.getElementById("cc-share-btn");

const CASE_SUMMARIES = {
  "case-01": {
    title: "The Veridian Files",
    text: "Daniel Kurniawan tidak mengundurkan diri. Setelah menemukan manipulasi data emisi Q4, akunnya dinonaktifkan secara sepihak oleh Richard Hale, CEO Veridian Industries, hanya beberapa jam sebelum siaran pers palsu diterbitkan. Memo terenkripsi yang ditemukan di server backup mengonfirmasi bahwa keputusan ini diambil sendiri oleh Hale, tanpa persetujuan dewan direksi.",
  },
  "case-02": {
    title: "The Mirrored Profile",
    text: "Akun media sosial Mira dicuri lewat email phishing yang menyamar sebagai verifikasi akun resmi. Penelusuran log server staging milik 'CloudBackup Pro' mengungkap alamat IP yang sama dipakai untuk mengekspor daftar kontak Mira, terhubung ke alias operator 'reseller_andi88'.",
  },
};

function renderSummary() {
  const summary = CASE_SUMMARIES[CASE_SLUG];
  if (!summary) {
    summaryEl.innerHTML = `<strong>Ringkasan tidak tersedia untuk ${CASE_SLUG}.</strong>`;
    return;
  }
  summaryEl.innerHTML = `<strong>Ringkasan Kasus: ${summary.title}</strong><br><br>${summary.text}`;
}
renderSummary();

async function loadResult() {
  const playerId = localStorage.getItem("arg_player_id");
  const displayName = localStorage.getItem("arg_display_name");

  if (!playerId) {
    playerLineEl.textContent = "Kamu belum login. Kembali ke hub untuk masuk dulu.";
    statsEl.innerHTML = "";
    return;
  }

  playerLineEl.textContent = `Diselesaikan oleh ${displayName}`;

  try {
    const res = await fetch(`${API_BASE}/progress/${playerId}/${CASE_SLUG}`);
    const data = await res.json();
    renderStats(data.solved || []);
  } catch (err) {
    statsEl.innerHTML = `<div class="cc-stats__row"><span class="cc-stats__label">Gagal memuat data (${err.message})</span></div>`;
  }
}

function renderStats(solvedRows) {
  if (solvedRows.length === 0) {
    statsEl.innerHTML = `<div class="cc-stats__row"><span class="cc-stats__label">Belum ada puzzle yang terpecahkan.</span></div>`;
    return;
  }

  const totalPoints = solvedRows.reduce((sum, r) => sum + r.points_awarded, 0);
  const sorted = [...solvedRows].sort((a, b) => new Date(a.solved_at) - new Date(b.solved_at));

  const rowsHtml = sorted
    .map(
      (r) =>
        `<div class="cc-stats__row"><span class="cc-stats__label">${formatPuzzleName(r.puzzle_id)}</span><span>+${r.points_awarded} pts</span></div>`
    )
    .join("");

  statsEl.innerHTML =
    rowsHtml +
    `<div class="cc-stats__row"><span><strong>Total</strong></span><span><strong>${totalPoints} pts</strong></span></div>`;
}

function formatPuzzleName(puzzleId) {
  const names = {
    "who-disabled-daniel-account": "Identifikasi pelaku",
    "decrypt-memo": "Dekripsi memo rahasia",
    "final-accusation": "Tuduhan akhir",
    "phishing-domain": "Temukan domain phishing",
    "operator-ip": "Lacak IP operator",
    "operator-alias": "Bongkar alias operator",
  };
  return names[puzzleId] || puzzleId;
}

shareBtn.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "index.html#leaderboard";
});

loadResult();
