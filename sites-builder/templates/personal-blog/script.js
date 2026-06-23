document.addEventListener("DOMContentLoaded", () => {
  const hint = document.querySelector("[data-console-hint]");
  if (hint) {
    console.log("%c[diary]", "color:#c2745c;font-style:italic;", hint.dataset.consoleHint);
  }
});
