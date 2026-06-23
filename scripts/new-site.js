#!/usr/bin/env node
// scripts/new-site.js
//
// Cara pakai:
//   node scripts/new-site.js case-01 site-jane-blog personal-blog
//   node scripts/new-site.js <case-slug> <site-slug> <template-name>
//
// Membuat folder content/<case>/<site>/ berisi meta.json starter
// dan satu pages/home.json starter, siap diisi.

const fs = require("fs");
const path = require("path");

const [, , caseSlug, siteSlug, templateName] = process.argv;

if (!caseSlug || !siteSlug || !templateName) {
  console.error("Cara pakai: node scripts/new-site.js <case-slug> <site-slug> <template-name>");
  console.error("Contoh:     node scripts/new-site.js case-01 site-jane-blog personal-blog");
  process.exit(1);
}

const ROOT = path.join(__dirname, "..");
const TEMPLATES_DIR = path.join(ROOT, "sites-builder", "templates");
const CONTENT_DIR = path.join(ROOT, "sites-builder", "content");

const templateDir = path.join(TEMPLATES_DIR, templateName);
if (!fs.existsSync(templateDir)) {
  console.error(`Template "${templateName}" tidak ditemukan di sites-builder/templates/`);
  console.error("Template yang tersedia:", fs.readdirSync(TEMPLATES_DIR).join(", "));
  process.exit(1);
}

const siteDir = path.join(CONTENT_DIR, caseSlug, siteSlug);
const pagesDir = path.join(siteDir, "pages");

if (fs.existsSync(siteDir)) {
  console.error(`Folder ${siteDir} sudah ada. Hapus dulu atau pakai nama lain.`);
  process.exit(1);
}

fs.mkdirSync(pagesDir, { recursive: true });

const metaStarter = {
  template: templateName,
  companyName: "Nama Situs Baru",
  fakeDomain: "ganti-domain-ini.com",
  foundedYear: 2020,
  tagline: "Ganti tagline di sini.",
  nav: [{ label: "Home", href: "home.html" }],
};

const pageStarter = {
  title: "Beranda",
  fakePath: "/home.html",
  bodyHtml: "<h2>Halaman baru</h2><p>Ganti konten ini.</p>",
};

fs.writeFileSync(path.join(siteDir, "meta.json"), JSON.stringify(metaStarter, null, 2));
fs.writeFileSync(path.join(pagesDir, "home.json"), JSON.stringify(pageStarter, null, 2));

console.log(`✓ Situs baru dibuat: sites-builder/content/${caseSlug}/${siteSlug}/`);
console.log(`  - meta.json (edit companyName, fakeDomain, nav)`);
console.log(`  - pages/home.json (edit bodyHtml)`);
console.log(`\nJalankan: node sites-builder/build.js ${caseSlug}`);
