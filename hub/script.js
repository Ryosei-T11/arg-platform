// hub/script.js
// Menyambungkan hub (portal) ke backend API.
// API_BASE diasumsikan jalan di localhost:3001 saat development;
// ganti sesuai domain backend saat deploy.

const API_BASE = "http://localhost:3001/api";

const loginBtn = document.getElementById("login-btn");
const nameInput = document.getElementById("display-name");
const statusEl = document.getElementById("login-status");
const leaderboardList = document.getElementById("leaderboard-list");

loginBtn.addEventListener("click", async () => {
  const displayName = nameInput.value.trim();
  if (displayName.length < 2) {
    statusEl.textContent = "Nama minimal 2 karakter.";
    return;
  }
  statusEl.textContent = "Menghubungkan...";
  try {
    const res = await fetch(`${API_BASE}/progress/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal login");

    localStorage.setItem("arg_player_id", data.playerId);
    localStorage.setItem("arg_display_name", data.displayName);
    statusEl.textContent = `Masuk sebagai ${data.displayName}. Selamat berinvestigasi!`;
  } catch (err) {
    statusEl.textContent = `Gagal: ${err.message}`;
  }
});

async function loadLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/leaderboard/case-01`);
    const data = await res.json();
    renderLeaderboard(data.leaderboard || []);
  } catch (err) {
    leaderboardList.innerHTML = `<li class="hub-empty">Backend belum aktif (${err.message})</li>`;
  }
}

function renderLeaderboard(rows) {
  if (rows.length === 0) {
    leaderboardList.innerHTML = `<li class="hub-empty">Belum ada yang menyelesaikan teka-teki.</li>`;
    return;
  }
  leaderboardList.innerHTML = rows
    .map(
      (row, i) => `<li><span>#${i + 1} ${row.display_name}</span><span>${row.total_points} pts</span></li>`
    )
    .join("");
}

// Restore nama jika sudah pernah login sebelumnya
const savedName = localStorage.getItem("arg_display_name");
if (savedName) {
  nameInput.value = savedName;
  statusEl.textContent = `Masuk sebagai ${savedName}.`;
}

loadLeaderboard();
