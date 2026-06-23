// puzzle-engine/terminal-sim/commands/grep.js
// Mencari string pada satu file (grep "kata" file.txt) atau rekursif (-r) di semua file.

function grep(args, ctx) {
  const { fs, cwd } = ctx;
  const recursive = args.includes("-r");
  const cleanArgs = args.filter((a) => a !== "-r");
  const [needle, filePath] = cleanArgs;

  if (!needle) return { output: "grep: missing search pattern", error: true };

  const matches = [];

  if (recursive || !filePath) {
    for (const [p, node] of Object.entries(fs)) {
      if (node.type === "file" && node.content.toLowerCase().includes(needle.toLowerCase())) {
        node.content.split("\n").forEach((line) => {
          if (line.toLowerCase().includes(needle.toLowerCase())) {
            matches.push(`${p}: ${line}`);
          }
        });
      }
    }
  } else {
    const targetPath = ctx.resolvePath(cwd, filePath);
    const node = fs[targetPath];
    if (!node || node.type !== "file") {
      return { output: `grep: ${filePath}: No such file`, error: true };
    }
    node.content.split("\n").forEach((line) => {
      if (line.toLowerCase().includes(needle.toLowerCase())) matches.push(line);
    });
  }

  if (matches.length === 0) return { output: "", error: false };
  return { output: matches.join("\n"), error: false };
}

module.exports = grep;
