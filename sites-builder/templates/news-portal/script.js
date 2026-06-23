document.addEventListener("DOMContentLoaded", () => {
  const hint = document.querySelector("[data-console-hint]");
  if (hint) {
    console.log("%c[editorial]", "color:#c0392b;font-weight:bold;", hint.dataset.consoleHint);
  }
});
