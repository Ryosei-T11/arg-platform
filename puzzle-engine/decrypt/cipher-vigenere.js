// puzzle-engine/decrypt/cipher-vigenere.js
//
// Vigenère cipher (geser huruf berdasarkan huruf kata kunci yang berulang).
// Lebih sulit ditebak brute-force dibanding Caesar — cocok untuk clue
// "tingkat lanjut" yang baru terbuka setelah pemain menemukan kata kunci
// dari clue lain (mis. nama proyek rahasia, inisial seseorang).

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

function cleanKey(key) {
  return key.toLowerCase().replace(/[^a-z]/g, "");
}

function processChar(char, keyChar, direction) {
  const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
  const lower = char.toLowerCase();
  const idx = ALPHABET.indexOf(lower);
  if (idx === -1) return { result: char, consumesKey: false };

  const keyIdx = ALPHABET.indexOf(keyChar);
  const shifted = ALPHABET[(idx + direction * keyIdx + 26 * 100) % 26];
  return { result: isUpper ? shifted.toUpperCase() : shifted, consumesKey: true };
}

function transform(text, key, direction) {
  const cleanedKey = cleanKey(key);
  if (!cleanedKey) throw new Error("Kata kunci tidak boleh kosong / tanpa huruf");

  let keyPos = 0;
  return text
    .split("")
    .map((char) => {
      const keyChar = cleanedKey[keyPos % cleanedKey.length];
      const { result, consumesKey } = processChar(char, keyChar, direction);
      if (consumesKey) keyPos++;
      return result;
    })
    .join("");
}

function encode(plainText, key) {
  return transform(plainText, key, 1);
}

function decode(cipherText, key) {
  return transform(cipherText, key, -1);
}

module.exports = { encode, decode };
