document.addEventListener("DOMContentLoaded", () => {
  const hint = document.querySelector("[data-console-hint]");
  if (hint) {
    console.log("%c[trace]", "color:#e8590c;", hint.dataset.consoleHint);
  }
});
