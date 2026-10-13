#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const httpRoot = path.resolve(__dirname, "../src/app/data/http");

const SKIP_FOLDERS = new Set(["client", "dto", "interceptors"]);
const FORBIDDEN_SPLIT_DTO = /^(create|update|patch|delete|search)-.+\.dto\.(ts|js)$/i;
const WRITE_METHOD_IN_QUERY = /HttpMethod\.(Post|Put|Patch|Delete)\b|method:\s*["'](POST|PUT|PATCH|DELETE)["']/i;
const INLINE_SNAKE = /\b(?:data|payload)\s*[:=]\s*\{[\s\S]*?\b([a-z][a-z0-9]*(?:_[a-z0-9]+)+)\s*:/;

function main() {
  if (!fs.existsSync(httpRoot)) return;
  const errors = [];
  const modules = fs.readdirSync(httpRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !SKIP_FOLDERS.has(d.name) && !d.name.startsWith("."))
    .map((d) => d.name);

  for (const mod of modules) {
    const dir = path.join(httpRoot, mod);
    const files = fs.readdirSync(dir);
    const dtos = files.filter((f) => f.endsWith(".dto.ts") || f.endsWith(".dto.js"));
    const ops = files.filter((f) => f.endsWith(".mutation.ts") || f.endsWith(".mutation.js") || f.endsWith(".query.ts") || f.endsWith(".query.js"));

    if (ops.length > 0 && dtos.length === 0) {
      errors.push(`[${mod}] Missing module DTO: expected ${mod}.dto.ts`);
    }
    if (dtos.length > 1) {
      errors.push(`[${mod}] Multiple DTO files found. Only one ${mod}.dto.ts allowed.`);
    }

    for (const dto of dtos) {
      if (FORBIDDEN_SPLIT_DTO.test(dto)) {
        errors.push(`[${mod}] Action-split DTO "${dto}" forbidden. Put all in ${mod}.dto.ts.`);
      }
    }

    for (const op of ops) {
      const content = fs.readFileSync(path.join(dir, op), "utf8");
      if ((op.endsWith(".query.ts") || op.endsWith(".query.js")) && WRITE_METHOD_IN_QUERY.test(content)) {
        errors.push(`[${mod}] "${op}" contains write method. Move to dedicated *.mutation.ts`);
      }
      if (op.endsWith(".mutation.ts") || op.endsWith(".mutation.js")) {
        const mutations = [...content.matchAll(/export\s+(?:const|async\s+function)\s+(\w+Mutation)\b/g)];
        if (mutations.length !== 1) {
          errors.push(`[${mod}] "${op}" must export exactly one *Mutation function.`);
        }
        if (INLINE_SNAKE.test(content)) {
          errors.push(`[${mod}] "${op}" contains inline snake_case payload. Use mapper in DTO.`);
        }
      }
    }
  }

  if (errors.length) {
    console.error("HTTP Layer Validation Failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }
  console.log("HTTP layer structure OK.");
}

main();
