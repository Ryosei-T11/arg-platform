document.addEventListener("DOMContentLoaded", () => {
  const hint = document.querySelector("[data-console-hint]");
  if (hint) {
    console.log("%c[mail]", "color:#2962ff;font-weight:bold;", hint.dataset.consoleHint);
  }
});
