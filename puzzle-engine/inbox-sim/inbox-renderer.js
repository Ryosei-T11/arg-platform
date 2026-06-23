// puzzle-engine/inbox-sim/inbox-renderer.js
//
// Membaca semua file email-*.json dalam satu folder kasus, mengurutkannya
// berdasarkan tanggal, dan menyiapkan data siap pakai untuk dirender jadi
// halaman webmail statis (lihat templates/webmail-client/).

const fs = require("fs");
const path = require("path");

function loadEmailsForCase(caseSlug, baseDir) {
  const emailDir = path.join(baseDir, caseSlug);
  if (!fs.existsSync(emailDir)) return [];

  const files = fs.readdirSync(emailDir).filter((f) => f.endsWith(".json"));
  const emails = files.map((f) => JSON.parse(fs.readFileSync(path.join(emailDir, f), "utf-8")));

  // Urutkan terbaru di atas, seperti inbox sungguhan
  emails.sort((a, b) => new Date(b.date) - new Date(a.date));
  return emails;
}

function formatEmailDate(isoDate) {
  const d = new Date(isoDate);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function buildInboxViewModel(emails) {
  return emails.map((email) => ({
    ...email,
    formattedDate: formatEmailDate(email.date),
    preview: email.bodyHtml.replace(/<[^>]+>/g, "").slice(0, 90) + "...",
  }));
}

module.exports = { loadEmailsForCase, buildInboxViewModel, formatEmailDate };
