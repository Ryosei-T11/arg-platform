// Perilaku diegetic ringan untuk situs corporate.
// Tidak ada logika clue-checking di sini — itu tugas puzzle-engine.
// File ini hanya membuat situs terasa "hidup" dan kadang menyembunyikan jejak.

document.addEventListener("DOMContentLoaded", () => {
  // Console log palsu yang bisa jadi clue (pemain yang buka DevTools dapat reward)
  const hint = document.querySelector("[data-console-hint]");
  if (hint) {
    console.log("%c[SYSTEM]", "color:#1abc9c;font-weight:bold;", hint.dataset.consoleHint);
  }

  // Highlight halus saat hover di kartu tim — sekadar polish visual
  document.querySelectorAll(".corp-team__card").forEach((card) => {
    card.addEventListener("mouseenter", () => card.style.transform = "translateY(-2px)");
    card.addEventListener("mouseleave", () => card.style.transform = "translateY(0)");
  });
});
