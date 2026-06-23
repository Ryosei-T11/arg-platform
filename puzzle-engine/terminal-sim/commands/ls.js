// puzzle-engine/terminal-sim/commands/ls.js
// Menampilkan isi direktori pada path saat ini.

function ls(args, ctx) {
  const { fs, cwd } = ctx;
  const targetPath = args[0] ? ctx.resolvePath(cwd, args[0]) : cwd;
  const node = fs[targetPath];

  if (!node) return { output: `ls: cannot access '${args[0] || targetPath}': No such file or directory`, error: true };
  if (node.type !== "dir") return { output: args[0] || targetPath, error: false };

  return { output: node.children.join("  "), error: false };
}

module.exports = ls;
