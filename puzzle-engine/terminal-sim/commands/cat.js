// puzzle-engine/terminal-sim/commands/cat.js
// Menampilkan isi sebuah file.

function cat(args, ctx) {
  const { fs, cwd } = ctx;
  if (!args[0]) return { output: "cat: missing file operand", error: true };

  const targetPath = ctx.resolvePath(cwd, args[0]);
  const node = fs[targetPath];

  if (!node) return { output: `cat: ${args[0]}: No such file or directory`, error: true };
  if (node.type !== "file") return { output: `cat: ${args[0]}: Is a directory`, error: true };

  return { output: node.content, error: false };
}

module.exports = cat;
