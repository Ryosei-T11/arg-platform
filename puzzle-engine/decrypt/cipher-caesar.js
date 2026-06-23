// puzzle-engine/decrypt/cipher-caesar.js
//
// Caesar cipher klasik (geser huruf sejauh N). Dipakai untuk membuat clue
// "sandi sederhana" yang masuk akal ditemukan di catatan tangan / pesan lama.
//
// Dipakai dua arah:
//  - encode(): alat BANTU PENULIS KASUS untuk membuat teks terenkripsi
//    yang akan ditaruh di content/ (mis. di sebuah file catatan).
//  - decode(): dipanggil dari widget terminal/UI saat pemain mencoba kunci.

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

function shiftChar(char, shift) {
  const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
  const lower = char.toLowerCase();
  const idx = ALPHABET.indexOf(lower);
  if (idx === -1) return char; // bukan huruf (spasi, angka, simbol) -> biarkan apa adanya
  const shifted = ALPHABET[(idx + shift + 26 * 100) % 26];
  return isUpper ? shifted.toUpperCase() : shifted;
}

function encode(plainText, shift) {
  return plainText
    .split("")
    .map((c) => shiftChar(c, shift))
    .join("");
}

function decode(cipherText, shift) {
  return encode(cipherText, -shift);
}

// Brute-force semua 25 kemungkinan geseran — berguna untuk widget "coba semua kunci"
function bruteForceAll(cipherText) {
  const results = [];
  for (let shift = 1; shift <= 25; shift++) {
    results.push({ shift, text: decode(cipherText, shift) });
  }
  return results;
}

module.exports = { encode, decode, bruteForceAll };
