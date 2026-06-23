// puzzle-engine/decrypt/steganography-check.js
//
// Bukan steganografi gambar/binary (di luar scope ARG berbasis teks ini),
// tapi pola "pesan tersembunyi dalam teks" yang umum dipakai di ARG:
//   - akrostik: huruf pertama tiap baris/kalimat membentuk kata
//   - kata terakhir tiap baris membentuk kalimat tersembunyi
//
// Dipakai penulis kasus untuk MEMBUAT clue (helper), bukan untuk pemain
// "brute force" otomatis menemukan jawaban (itu akan menghilangkan teka-tekinya).

function extractFirstLetters(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line[0])
    .join("");
}

function extractLastWords(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const words = line.replace(/[.,!?]$/, "").split(/\s+/);
      return words[words.length - 1];
    })
    .join(" ");
}

// Helper untuk PENULIS KASUS: cek apakah draft akrostik sudah menghasilkan
// kata kunci yang diinginkan, sebelum ditaruh jadi konten final di situs.
function verifyAcrostic(text, expectedKeyword) {
  const extracted = extractFirstLetters(text).toLowerCase();
  return extracted === expectedKeyword.toLowerCase();
}

module.exports = { extractFirstLetters, extractLastWords, verifyAcrostic };
