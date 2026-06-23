// sites-builder/template-engine.js
//
// Template engine super-ringan, dibuat sendiri (tanpa dependency npm) supaya
// proyek ini tetap bisa di-build hanya dengan Node.js bawaan.
// Mendukung:
//   {{var.path}}        -> escaped output
//   {{{var.path}}}      -> raw HTML output (untuk bodyHtml yang sudah aman)
//   {{#each list}}...{{/each}}   -> iterasi array, akses field via {{this.x}}
//   {{#if cond}}...{{/if}}       -> kondisional sederhana (truthy check)
//   {{> partialName}}    -> sisipkan partial dari sites-builder/partials/

const fs = require("fs");
const path = require("path");

const PARTIALS_DIR = path.join(__dirname, "partials");
const partialCache = {};

function loadPartial(name) {
  if (partialCache[name]) return partialCache[name];
  const filePath = path.join(PARTIALS_DIR, `${name}.html`);
  const content = fs.readFileSync(filePath, "utf-8");
  partialCache[name] = content;
  return content;
}

function getValue(ctx, keyPath) {
  return keyPath.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[key];
  }, ctx);
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function render(template, ctx) {
  let output = template;

  // 1. Partials: {{> name}}
  output = output.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    const partialTpl = loadPartial(name);
    return render(partialTpl, ctx);
  });

  // 2. Blocks: {{#each list}}...{{/each}} dan {{#if cond}}...{{/if}}
  // Diproses dengan regex non-greedy, mendukung satu level nesting via loop ulang.
  let prevOutput;
  do {
    prevOutput = output;

    output = output.replace(
      /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_, listPath, inner) => {
        const list = getValue(ctx, listPath);
        if (!Array.isArray(list)) return "";
        return list
          .map((item) => render(inner, { ...ctx, this: item }))
          .join("");
      }
    );

    output = output.replace(
      /\{\{#if\s+([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_, condPath, inner) => {
        const val = getValue(ctx, condPath);
        return val ? render(inner, ctx) : "";
      }
    );
  } while (output !== prevOutput);

  // 3. Raw output: {{{var}}}
  output = output.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, keyPath) => {
    const val = getValue(ctx, keyPath);
    return val === undefined ? "" : String(val);
  });

  // 4. Escaped output: {{var}}
  output = output.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, keyPath) => {
    return escapeHtml(getValue(ctx, keyPath));
  });

  return output;
}

module.exports = { render };
