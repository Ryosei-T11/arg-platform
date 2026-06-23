// puzzle-engine/terminal-sim/terminal.js
//
// Engine inti terminal simulator. Dipakai di sisi client (browser) untuk
// kasus seperti "akses server backup Veridian". Filesystem-nya statis
// (filesystem-fake.json) — TIDAK ada eksekusi command sungguhan, semuanya
// pencocokan string di path & content yang sudah disiapkan penulis kasus.

const ls = require("./commands/ls");
const cat = require("./commands/cat");
const grep = require("./commands/grep");

const COMMANDS = { ls, cat, grep };

function resolvePath(cwd, target) {
  if (target.startsWith("/")) return normalize(target);
  if (target === "..") {
    const parts = cwd.split("/").filter(Boolean);
    parts.pop();
    return "/" + parts.join("/");
  }
  if (target === ".") return cwd;
  const joined = cwd === "/" ? `/${target}` : `${cwd}/${target}`;
  return normalize(joined);
}

function normalize(p) {
  return p.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

class Terminal {
  constructor(filesystem, promptLabel = "guest@backup-archive") {
    this.fs = filesystem;
    this.cwd = "/";
    this.promptLabel = promptLabel;
    this.history = [];
  }

  prompt() {
    return `${this.promptLabel}:${this.cwd}$`;
  }

  run(rawLine) {
    const line = rawLine.trim();
    this.history.push(line);
    if (!line) return { output: "", error: false };

    const [cmd, ...args] = line.split(/\s+/);

    if (cmd === "cd") {
      return this._cd(args[0]);
    }
    if (cmd === "pwd") {
      return { output: this.cwd, error: false };
    }
    if (cmd === "help") {
      return { output: "Available commands: ls, cat, cd, pwd, grep", error: false };
    }
    if (cmd === "clear") {
      return { output: "__CLEAR__", error: false };
    }

    const handler = COMMANDS[cmd];
    if (!handler) {
      return { output: `${cmd}: command not found`, error: true };
    }

    const ctx = { fs: this.fs, cwd: this.cwd, resolvePath };
    return handler(args, ctx);
  }

  _cd(target) {
    if (!target || target === "~") {
      this.cwd = "/";
      return { output: "", error: false };
    }
    const targetPath = resolvePath(this.cwd, target);
    const node = this.fs[targetPath];
    if (!node) return { output: `cd: ${target}: No such file or directory`, error: true };
    if (node.type !== "dir") return { output: `cd: ${target}: Not a directory`, error: true };
    this.cwd = targetPath;
    return { output: "", error: false };
  }
}

module.exports = { Terminal, resolvePath };
