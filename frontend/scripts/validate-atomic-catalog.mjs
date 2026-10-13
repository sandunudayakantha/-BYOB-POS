#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.resolve(__dirname, "../src/atomic/atomic.catalog.json");
const atomicRoot = path.resolve(__dirname, "../src/atomic");

const ATOMIC_FOLDER_PATTERN = /^(atm|mol|obj|org)\./;

function main() {
  if (!fs.existsSync(catalogPath)) {
    console.error("Missing src/atomic/atomic.catalog.json");
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const errors = [];
  const semanticIds = new Map();
  const registeredFolders = new Set(catalog.map((entry) => entry.folder));

  for (const entry of catalog) {
    if (semanticIds.has(entry.semanticId)) {
      errors.push(`Duplicate semanticId "${entry.semanticId}" in catalog.`);
    }
    semanticIds.set(entry.semanticId, entry);
  }

  const diskFolders = fs.existsSync(atomicRoot)
    ? fs.readdirSync(atomicRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory() && ATOMIC_FOLDER_PATTERN.test(d.name))
        .map((d) => d.name)
    : [];

  for (const folder of diskFolders) {
    if (!registeredFolders.has(folder)) {
      errors.push(`Unregistered atomic folder "${folder}". Add it to atomic.catalog.json first.`);
    }
  }

  for (const entry of catalog) {
    if (!diskFolders.includes(entry.folder)) {
      errors.push(`Catalog entry "${entry.folder}" has no matching folder on disk.`);
    }
  }

  if (errors.length) {
    console.error("Atomic Catalog Validation Failed:");
    errors.forEach((e) => console.error(`  ✗ ${e}`));
    process.exit(1);
  }
  console.log("Atomic catalog OK.");
}

main();
