#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const SRC = path.join(root, "src");

const MAX_PAGE_LINES = 350;
const MAX_COMPONENT_LINES = 650;
const MAX_DTO_LINES = 650;

const EXEMPT_RE = /(\.stories\.(tsx|ts|jsx|js)$)|(\.(test|spec)\.(tsx|ts|jsx|js)$)|(styles\/tokens\.(ts|js)$)/;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function main() {
  const files = walk(SRC);
  const errors = [];

  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    if (EXEMPT_RE.test(rel)) continue;

    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).length;
    const base = path.basename(rel);

    if (base.endsWith(".page.tsx") || base.endsWith(".page.jsx") || base.endsWith("layout.tsx") || base.endsWith("layout.jsx")) {
      if (lines > MAX_PAGE_LINES) {
        errors.push(`${rel} (${lines} lines, max ${MAX_PAGE_LINES} for route pages)`);
      }
    } else if (base.endsWith(".dto.ts") || base.endsWith(".dto.js")) {
      if (lines > MAX_DTO_LINES) {
        errors.push(`${rel} (${lines} lines, max ${MAX_DTO_LINES} for DTOs)`);
      }
    } else {
      if (lines > MAX_COMPONENT_LINES) {
        errors.push(`${rel} (${lines} lines, max ${MAX_COMPONENT_LINES} for components)`);
      }
    }
  }

  if (errors.length) {
    console.error("File Line Limit Validation Failed:\n" + errors.map((e) => `  ✗ ${e}`).join("\n"));
    process.exit(1);
  }
  console.log("File line limits OK.");
}

main();
