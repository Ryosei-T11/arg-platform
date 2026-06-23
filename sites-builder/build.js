// sites-builder/build.js
//
// Cara pakai:
//   node sites-builder/build.js              -> build semua case
//   node sites-builder/build.js case-01       -> build satu case saja
//
// Alur:
//   content/case-01/site-veridian-corp/meta.json   -> info situs (template, domain palsu, nav)
//   content/case-01/site-veridian-corp/pages/*.json -> satu file = satu halaman
//   -> dirender pakai templates/<template-name>/layout.html
//   -> ditulis ke dist/case-01/<site-slug>/<page-slug>.html

const fs = require("fs");
const path = require("path");
const { render } = require("./template-engine");

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, "content");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const DIST_DIR = path.join(ROOT, "..", "dist");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyTemplateAssets(templateName, destDir) {
  const templateDir = path.join(TEMPLATES_DIR, templateName);
  const assetsOutDir = path.join(destDir, "_assets");
  ensureDir(assetsOutDir);
  for (const file of ["style.css", "script.js"]) {
    const src = path.join(templateDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(assetsOutDir, file));
    }
  }
  // Salin juga CSS diegetic bersama (browser-chrome dsb)
  const commonCss = path.join(ROOT, "partials", "_diegetic-common.css");
  if (fs.existsSync(commonCss)) {
    fs.copyFileSync(commonCss, path.join(assetsOutDir, "diegetic-common.css"));
  }
}

function buildSite(caseSlug, siteSlug) {
  const siteDir = path.join(CONTENT_DIR, caseSlug, siteSlug);
  const meta = readJson(path.join(siteDir, "meta.json"));
  const pagesDir = path.join(siteDir, "pages");

  if (!fs.existsSync(pagesDir)) {
    console.warn(`  ! ${siteSlug}: tidak ada folder pages/, dilewati`);
    return;
  }

  const layoutPath = path.join(TEMPLATES_DIR, meta.template, "layout.html");
  if (!fs.existsSync(layoutPath)) {
    console.error(`  ! ${siteSlug}: template "${meta.template}" tidak ditemukan`);
    return;
  }
  const layoutTpl = fs.readFileSync(layoutPath, "utf-8");

  const outDir = path.join(DIST_DIR, caseSlug, siteSlug);
  ensureDir(outDir);
  copyTemplateAssets(meta.template, outDir);

  const pageFiles = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".json"));

  for (const pageFile of pageFiles) {
    const page = readJson(path.join(pagesDir, pageFile));
    const pageSlug = path.basename(pageFile, ".json");

    const ctx = {
      site: meta,
      page: { ...page, fakePath: page.fakePath || `/${pageSlug}.html` },
      root: ".", // semua halaman 1 level di dalam folder situsnya
      assetPath: "./_assets",
    };

    const html = render(layoutTpl, ctx);
    fs.writeFileSync(path.join(outDir, `${pageSlug}.html`), html, "utf-8");
  }

  console.log(`  ✓ ${siteSlug} (${pageFiles.length} halaman, template: ${meta.template})`);
}

function syncWebmailPages(caseSlug) {
  // Untuk tiap situs bertemplate "webmail-client" di case ini, generate
  // pages/inbox.json otomatis dari puzzle-engine/inbox-sim/emails/<case>/*.json
  // SEBELUM buildSite() dipanggil. Ini membuat email jadi single-source-of-truth
  // (ditulis sekali di inbox-sim/, bukan diduplikasi manual ke content/).
  const { loadEmailsForCase, buildInboxViewModel } = require(
    path.join(ROOT, "..", "puzzle-engine", "inbox-sim", "inbox-renderer")
  );
  const EMAILS_BASE_DIR = path.join(ROOT, "..", "puzzle-engine", "inbox-sim", "emails");

  const caseDir = path.join(CONTENT_DIR, caseSlug);
  if (!fs.existsSync(caseDir)) return;

  const siteSlugs = fs.readdirSync(caseDir).filter((f) =>
    fs.statSync(path.join(caseDir, f)).isDirectory()
  );

  for (const siteSlug of siteSlugs) {
    const metaPath = path.join(caseDir, siteSlug, "meta.json");
    if (!fs.existsSync(metaPath)) continue;
    const meta = readJson(metaPath);
    if (meta.template !== "webmail-client") continue;

    const emails = loadEmailsForCase(caseSlug, EMAILS_BASE_DIR);
    const emailsViewModel = buildInboxViewModel(emails);

    const pagesDir = path.join(caseDir, siteSlug, "pages");
    ensureDir(pagesDir);
    const inboxPage = {
      title: "Kotak Masuk",
      fakePath: "/inbox.html",
      emails: emailsViewModel,
    };
    fs.writeFileSync(path.join(pagesDir, "inbox.json"), JSON.stringify(inboxPage, null, 2));
    console.log(`  ↻ ${siteSlug}: pages/inbox.json disinkronkan (${emails.length} email)`);
  }
}

function buildCase(caseSlug) {
  const caseDir = path.join(CONTENT_DIR, caseSlug);
  if (!fs.existsSync(caseDir)) {
    console.error(`Case "${caseSlug}" tidak ditemukan di ${caseDir}`);
    return;
  }
  console.log(`\nBuilding ${caseSlug}...`);

  syncWebmailPages(caseSlug);

  const siteSlugs = fs.readdirSync(caseDir).filter((f) =>
    fs.statSync(path.join(caseDir, f)).isDirectory()
  );
  for (const siteSlug of siteSlugs) {
    buildSite(caseSlug, siteSlug);
  }
}

function buildTerminalPages() {
  // Menyuntikkan filesystem-fake.json ke dalam template terminal-page,
  // lalu menulis hasilnya ke tiap lokasi yang didaftarkan di terminal-sim/terminal-targets.json
  const PUZZLE_DIR = path.join(ROOT, "..", "puzzle-engine", "terminal-sim");
  const targetsFile = path.join(PUZZLE_DIR, "terminal-targets.json");
  if (!fs.existsSync(targetsFile)) return;

  const targets = readJson(targetsFile);
  const tplPath = path.join(PUZZLE_DIR, "terminal-page.template.html");
  const tpl = fs.readFileSync(tplPath, "utf-8");

  for (const target of targets) {
    const fsData = readJson(path.join(PUZZLE_DIR, target.filesystem));
    const html = tpl.replace("__FILESYSTEM_JSON__", JSON.stringify(fsData, null, 2));
    const outPath = path.join(DIST_DIR, target.outPath);
    ensureDir(path.dirname(outPath));
    fs.writeFileSync(outPath, html, "utf-8");
    console.log(`  ✓ terminal page -> dist/${target.outPath}`);
  }
}

function buildDecryptTool() {
  // Alat decrypt bersifat global (bukan per-kasus) — disalin ke dist/tools/
  const srcPath = path.join(ROOT, "..", "puzzle-engine", "decrypt", "decrypt-tool-page.html");
  if (!fs.existsSync(srcPath)) return;
  const outDir = path.join(DIST_DIR, "tools", "decryption-tool");
  ensureDir(outDir);
  fs.copyFileSync(srcPath, path.join(outDir, "index.html"));
  console.log(`  ✓ decrypt tool -> dist/tools/decryption-tool/index.html`);
}

function main() {
  const arg = process.argv[2];
  ensureDir(DIST_DIR);

  if (arg) {
    buildCase(arg);
  } else {
    const cases = fs.readdirSync(CONTENT_DIR).filter((f) =>
      fs.statSync(path.join(CONTENT_DIR, f)).isDirectory()
    );
    cases.forEach(buildCase);
  }

  console.log("\nBuilding terminal pages...");
  buildTerminalPages();

  console.log("\nBuilding shared tools...");
  buildDecryptTool();

  console.log("\nBuild selesai. Output ada di /dist\n");
}

main();
