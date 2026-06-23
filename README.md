# ARG Platform — Diegetic Detective Game

Platform web untuk game detektif/misteri interaktif berbasis "internet buatan":
puluhan situs palsu (perusahaan korup, blog korban, forum konspirasi, server
backup, webmail) yang saling terhubung lewat clue, plus terminal simulator,
alat dekripsi, dan backend ringan untuk progress/leaderboard.

## Status saat ini (semua bagian sudah dites jalan end-to-end)

- ✅ Template engine custom (`sites-builder/template-engine.js`) — tanpa
  dependency npm, mendukung variable, `{{#each}}`, `{{#if}}`, dan partial.
- ✅ 4 jenis template situs sudah jadi: `corporate-site`, `forum-conspiracy`,
  `personal-blog`, `webmail-client`.
- ✅ Build script (`sites-builder/build.js`) yang merender semua situs di
  `content/case-01/` jadi HTML statis di `dist/case-01/`, plus build step
  khusus untuk halaman terminal dan tools global.
- ✅ Terminal simulator (`puzzle-engine/terminal-sim/`) — `ls`, `cat`, `cd`,
  `pwd`, `grep -r`, jalan di Node (untuk testing) maupun browser.
- ✅ Decrypt tools (`puzzle-engine/decrypt/`) — Caesar cipher (brute-force
  25 geseran), Vigenère cipher (kata kunci), dan steganography-check
  (akrostik). Ada widget HTML interaktif di `dist/tools/decryption-tool/`.
- ✅ Inbox simulator (`puzzle-engine/inbox-sim/`) — email diegetic dirender
  otomatis jadi situs webmail statis (`site-webmail`), single-source-of-truth
  di `emails/case-01/*.json`, disinkronkan otomatis saat build.
- ✅ Backend (`backend/`) — Express + `node:sqlite` bawaan (Node 22+, **tidak
  ada dependency native yang perlu dikompilasi**). Endpoint: identify player,
  validate-clue (server-side, jawaban tidak pernah dikirim ke client),
  progress, leaderboard. Sudah dites end-to-end dengan curl, termasuk alur
  3-puzzle berurutan (unlock bertahap).
<<<<<<< HEAD
- ✅ Hub (`hub/`) — portal masuk non-diegetic, halaman "Submit Jawaban"
  (`submit-answer.html`) dengan progress bertahap (locked/unlocked/solved)
  yang langsung terhubung ke `validate-clue` API, dan halaman "Case Selesai"
  (`case-complete.html`) yang menampilkan ringkasan poin per puzzle. Kedua
  halaman generik lewat `?case=case-01` / `?case=case-02`.
- ✅ CLI generator (`scripts/new-site.js`) untuk scaffold situs baru dalam
  hitungan detik.
- ✅ **Dua kasus contoh penuh, membuktikan pola bisa direplikasi cepat:**
  - Case-01 "The Veridian Files": korupsi korporat, 5 lokasi
    (corporate → forum → blog → webmail → terminal → decrypt tool), 3 puzzle
    berurutan, 85 poin total.
  - Case-02 "The Mirrored Profile": pencurian identitas digital, 5 lokasi
    (blog korban → forum keamanan siber → portal berita → webmail phishing →
    terminal server staging), 3 puzzle berurutan, 80 poin total. Dibangun
    dengan template yang SAMA PERSIS dengan case-01 (forum-conspiracy,
    personal-blog, webmail-client) plus satu template baru (`news-portal`).
- ✅ Template ke-5: `news-portal` — portal berita gaya broadsheet.
=======
- ✅ Hub (`hub/`) — portal masuk non-diegetic + halaman "Case Selesai"
  (`case-complete.html`) yang menampilkan ringkasan poin per puzzle.
- ✅ CLI generator (`scripts/new-site.js`) untuk scaffold situs baru dalam
  hitungan detik.
- ✅ Satu kasus contoh penuh (case-01: "The Veridian Files") dengan cerita
  yang nyambung lintas 5 lokasi: situs corporate → forum → blog → webmail →
  terminal → decrypt tool, dengan 3 puzzle berurutan (85 poin total).
>>>>>>> 0e2a2c03234cafc207115d10c35fb2df1020178a

## Cara menjalankan

### 1. Build semua situs statis
```bash
node sites-builder/build.js          # build semua case
node sites-builder/build.js case-01  # build satu case saja
```
Output ada di `dist/case-01/<nama-situs>/<halaman>.html`. Buka langsung di
browser (file://) atau serve dengan static server apa saja.

### 2. Jalankan backend
```bash
cd backend
npm install
npm start
```
Server jalan di `http://localhost:3001`. Database SQLite otomatis dibuat di
`backend/db/arg-platform.sqlite3` saat pertama kali start.

### 3. Buka hub
Buka `hub/index.html` di browser (pastikan backend sudah jalan supaya login
dan leaderboard berfungsi).

## Menambah situs palsu baru

```bash
node scripts/new-site.js case-01 site-nama-baru corporate-site
```
Ini membuat `sites-builder/content/case-01/site-nama-baru/` berisi
`meta.json` dan `pages/home.json` starter. Edit isinya, lalu:
```bash
node sites-builder/build.js case-01
```

Kalau butuh *jenis* situs baru yang templatenya belum ada (mis. webmail,
news-portal), buat folder baru di `sites-builder/templates/<nama>/` berisi
`layout.html`, `style.css`, `script.js` — ikuti pola 3 template yang sudah
ada sebagai contoh.

## Prinsip desain penting

- **Jangan pernah taruh jawaban clue di `dist/` atau di kode client manapun.**
  Semua jawaban benar hidup di `puzzle-engine/clue-checker/answer-keys/` dan
  HANYA dibaca oleh backend. Validasi selalu lewat
  `POST /api/validate-clue`, yang hanya mengembalikan `correct: true/false`.
- **Template vs konten dipisah ketat.** Menambah situs baru = menambah file
  JSON, bukan menulis ulang HTML. Ini yang membuat skala "puluhan situs"
  realistis dikerjakan satu orang/tim kecil.
- **Terminal simulator tidak mengeksekusi apapun sungguhan** — filesystem-nya
  statis (`filesystem-fake.json`), semua command hanya membaca/mencocokkan
  string yang sudah disiapkan penulis kasus.

## Walkthrough case-01 (untuk QA / demo)

1. Buka `dist/case-01/site-veridian-corp/about.html` → buka DevTools console
   → temukan hint alamat server backup.
2. Buka `dist/case-01/site-darkforum/thread-4471.html` → forum mengonfirmasi
   ada server backup lama yang bisa diakses.
3. Buka `dist/case-01/site-jane-blog/home.html` → konteks emosional + hint
   untuk cek inbox email perusahaan.
4. Buka `dist/case-01/site-webmail/inbox.html` → baca 3 email (Daniel lapor
   kejanggalan data → Richard minta jangan diteruskan → HR umumkan
   "pengunduran diri").
5. Buka `dist/case-01/terminal-backup-archive/index.html` → jalankan
   `cd home/dkurniawan`, `cat notes.txt`, `cd .trash`, `cat override_log.csv`
   → ditemukan log: Richard Hale menonaktifkan akun Daniel.
6. Di terminal yang sama: `cat encrypted_memo.txt` → salin teks terenkripsi.
7. Buka `dist/tools/decryption-tool/index.html` → tab Vigenère → tempel teks
   → kata kunci "VERIDIAN" → terungkap: Richard bertindak sendirian.
8. Submit semua jawaban lewat `POST /api/validate-clue` (atau lewat hub bila
   sudah dibuatkan form UI-nya) → total 85 poin, case selesai.
9. Buka `hub/case-complete.html` → lihat ringkasan poin per puzzle.

## Struktur folder

```
arg-platform/
├── docs/                  # lore kasus & desain alur puzzle
├── sites-builder/         # mesin generator situs palsu
│   ├── templates/         # kerangka per JENIS situs (reusable)
│   ├── content/           # data per situs individual (case-01, case-02, ...)
│   ├── partials/          # komponen diegetic lintas-template (browser-chrome, dst)
│   ├── template-engine.js
│   └── build.js
├── puzzle-engine/         # logika teka-teki, terpisah dari tampilan
│   ├── terminal-sim/
│   ├── clue-checker/      # answer-keys HANYA dibaca backend
│   ├── decrypt/           # (belum diisi — lihat TODO)
│   └── inbox-sim/         # (belum diisi — lihat TODO)
├── backend/                # Express + node:sqlite, validasi & progress
├── hub/                    # portal masuk non-diegetic
├── dist/                   # OUTPUT build, di-deploy sebagai "internet palsu"
└── scripts/                # CLI helper (new-site.js)
```

<<<<<<< HEAD
## Catatan penting: hub harus di-serve lewat HTTP server

`hub/submit-answer.js` dan `hub/case-complete.js` memakai `fetch()` untuk
membaca file JSON lokal (manifest puzzle). Browser modern memblokir ini kalau
file dibuka langsung lewat `file://`. Jalankan static server sederhana saat
development:
```bash
cd hub && python3 -m http.server 8088
# lalu buka http://localhost:8088
```

=======
>>>>>>> 0e2a2c03234cafc207115d10c35fb2df1020178a
## TODO / ide pengembangan lanjutan

- Hub belum punya autentikasi sungguhan (sengaja ringan — hanya display name,
  cocok untuk game santai, bukan untuk data sensitif).
- Belum ada deploy script (`scripts/deploy.sh` baru placeholder ide).
<<<<<<< HEAD
- `decryptedMemo` di case-01 dan jawaban-jawaban di case-02 masih dicocokkan
  lewat ketik manual di form submit; belum ada widget yang otomatis
  memverifikasi hasil decrypt tool / terminal langsung ke `validate-clue` API
  tanpa pemain perlu menyalin manual.
- Case-03 dst belum dibuat, tapi pola replikasi sudah terbukti dua kali
  (case-01 dan case-02 pakai template yang sama, hanya beda konten + 1
  template baru per kasus jika perlu).
=======
- Case-02 dan seterusnya belum dibuat — pola yang sudah terbukti di case-01
  tinggal direplikasi: buat folder `content/case-02/`, `emails/case-02/`,
  `answer-keys/case-02.json`, daftarkan terminal target baru jika perlu.
- Template `news-portal` (disebut di rencana awal) belum dibuat — bisa
  dicontoh dari pola 4 template yang sudah ada.
- `decryptedMemo` di case-01 saat ini dicocokkan lewat backend secara manual
  (pemain ketik hasil decode-nya); belum ada widget yang otomatis memverifikasi
  hasil decrypt tool langsung terhubung ke `validate-clue` API.
>>>>>>> 0e2a2c03234cafc207115d10c35fb2df1020178a
