#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const testDir = path.join(root, "src");

const FORBIDDEN = /\b(describe\.skip|it\.skip|test\.skip|fit\(|fdescribe\(|xit\(|xdescribe\(|\.only\()\b/;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function main() {
  const tests = walk(testDir);
  const violations = [];
  for (const file of tests) {
    const content = fs.readFileSync(file, "utf8");
    if (FORBIDDEN.test(content)) {
      violations.push(path.relative(root, file));
    }
  }

  if (violations.length) {
    console.error("Forbidden skipped or focused test found:\n" + violations.map((v) => `  ✗ ${v}`).join("\n"));
    process.exit(1);
  }
  console.log("No skipped tests detected. Suite valid.");
}

main();
