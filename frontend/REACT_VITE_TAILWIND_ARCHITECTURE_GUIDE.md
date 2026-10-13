# React + Vite + Tailwind CSS Architecture Blueprint
> **Complete Enterprise Architecture Guide: Clean Architecture, Atomic Design, Strict Validation Gates & AI Agent Rules**

This guide provides the complete blueprint for bootstrapping or porting any web application into a strict enterprise-grade architecture using **React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, and Atomic Design**.

It preserves 100% of the architectural invariants, layer isolations, automated validation scripts, Husky pre-commit gates, and AI agent rules established in the Vitagro Portal standard, converted seamlessly from Next.js + MUI to **React + Vite + Tailwind CSS**.

---

## Table of Contents
1. [Architectural Overview & Core Invariants](#1-architectural-overview--core-invariants)
2. [Project File Structure](#2-project-file-structure)
3. [Tech Stack & Package Configuration](#3-tech-stack--package-configuration)
4. [Strict Atomic Design System](#4-strict-atomic-design-system)
5. [Tailwind CSS Design System & Zero-Hardcoded Styling Rules](#5-tailwind-css-design-system--zero-hardcoded-styling-rules)
6. [Clean Architecture & Data Flow Isolation](#6-clean-architecture--data-flow-isolation)
7. [Zero-`useState` Form System Pattern](#7-zero-usestate-form-system-pattern)
8. [Automated Validation Scripts](#8-automated-validation-scripts)
9. [Pre-commit Hooks & Quality Enforcement Pipeline](#9-pre-commit-hooks--quality-enforcement-pipeline)
10. [Cursor / AI Agent Rules (`.cursor/rules`)](#10-cursor--ai-agent-rules)
11. [New Project Bootstrap Checklist](#11-new-project-bootstrap-checklist)

---

## 1. Architectural Overview & Core Invariants

### 1.1 Non-Negotiable Invariants
1. **Strict Layer Flow**:
   ```
   Route View / Page (src/app/pages/)
         ↓ (calls use-case hook, passes props)
   Presentation Component (src/atomic/ or src/app/components/)
         ↓
   Use Case Hook (src/app/domain/*/*.use-case.ts)
         ↓
   HTTP Operation / Mutation / Query (src/app/data/http/*)
         ↓
   DTO Mapping & Validation (src/app/data/http/*/*.dto.ts)
         ↓
   Axios Client (src/app/core/http/)
   ```
2. **Layer Isolation**:
   - Presentation components and atomics **must never** import use-case hooks or datasources. Pages/routes orchestrate use-cases and pass down props.
   - HTTP hooks (`useMutationHttpRequest`, `useQueryHttpRequest`) are **only permitted** inside `*.use-case.ts`.
   - Exactly **one** use-case hook per `*.use-case.ts`.
   - Exactly **one** `*Mutation` function exported per `*.mutation.ts`.
   - Exactly **one** `<module>.dto.ts` per HTTP domain module. No split DTO files (`create-*.dto.ts`, `*-list.dto.ts`).
3. **DTO Responsibilities**:
   - DTO mappers (`mapXToDto`, `mapXResponseDtoToData`) own all envelope and field transformation.
   - Never inline `snake_case` payloads in mutations.
   - Never use fake `as AxiosResponse` or inline error throwing inside mutation/query execution functions.
4. **Tailwind Styling Governance**:
   - **No arbitrary brackets** (e.g., `text-[#1f80ff]`, `p-[13px]`, `w-[540px]`).
   - **No inline styles** (`style={{ ... }}`).
   - All colors, spacing, and sizing must come from configured theme tokens.
5. **Form Architecture**:
   - Never store form input values in `useState` (`form`, `values`, `draft`, etc.).
   - Forms use `<Form>` + `<Form.Fields>` + `<Form.Field>` where fields register into an internal context.
6. **File Size Hard Caps**:
   - Route `page.tsx` / `layout.tsx`: **Max 350 lines**.
   - UI `*.component.tsx`, `src/atomic/**`, and HTTP `*.dto.ts`: **Max 650 lines**.
7. **Zero Skipped Tests**:
   - `test.skip`, `it.skip`, `describe.skip`, `.only`, `xit`, `xdescribe` are blocked by pre-commit hooks. Every behavioral change must ship with passing tests.

---

## 2. Project File Structure

```
my-vite-app/
├── .cursor/
│   ├── agent-rules/
│   │   ├── project-core.mdc           # Core architecture & pre-commit rules
│   │   ├── atomic-design.mdc          # Atomic folder & catalog rules
│   │   └── tailwind-styling.mdc       # Strict Tailwind token constraints
│   └── rules -> agent-rules           # Symlink for Cursor IDE compatibility
├── .husky/
│   └── pre-commit                     # Strict 10-step pre-commit shell script
├── .storybook/
│   ├── main.ts                        # Storybook Vite config
│   └── preview.tsx                    # Tailwind imports & App Provider wrapper
├── eslint-rules/
│   ├── architecture.mjs               # Custom ESLint architectural rules
│   └── atomic-catalog.data.mjs        # Catalog reading helper for rules & scripts
├── public/
├── scripts/
│   ├── validate-atomic-catalog.mjs    # Validates disk folders vs catalog JSON
│   ├── validate-http-layer.mjs        # Validates HTTP layer structure
│   ├── validate-file-line-limit.mjs   # Blocks oversized god-files
│   └── validate-no-skipped-tests.mjs  # Blocks skipped/focused tests
├── src/
│   ├── atomic/                        # Atomic Design Hierarchy
│   │   ├── atomic.catalog.json        # Canonical single-source-of-truth registry
│   │   ├── atomic.catalog.ts          # Typed catalog metadata
│   │   ├── atm.button/                # Atoms (base primitives)
│   │   │   ├── button.component.tsx
│   │   │   ├── button.stories.tsx
│   │   │   └── index.ts               # Barrel export
│   │   ├── mol.search-bar/            # Molecules (composed atoms)
│   │   ├── obj.form/                  # Organisms (zero-useState form system)
│   │   └── org.sidebar/               # Page organisms (shell sections)
│   ├── app/
│   │   ├── core/                      # HTTP client, auth token storage, error handling
│   │   ├── data/
│   │   │   └── http/                  # Clean HTTP domain modules
│   │   │       ├── client/            # Axios instance & interceptors
│   │   │       ├── dto/               # Shared base DTOs (pagination, error)
│   │   │       └── <module>/          # e.g., auth, users, products
│   │   │           ├── <module>.dto.ts        # Exactly one DTO per module
│   │   │           ├── <action>.mutation.ts   # One mutation per file
│   │   │           └── <module>.query.ts      # One standardized paginated query
│   │   ├── domain/                    # Clean business use cases
│   │   │   └── <module>/
│   │   │       └── use-<action>.use-case.ts   # One hook per use-case file
│   │   ├── models/                    # Domain entity interfaces (camelCase)
│   │   ├── pages/                     # Routed view orchestrators
│   │   │   ├── (admin)/
│   │   │   │   ├── dashboard.page.tsx
│   │   │   │   └── users.page.tsx
│   │   │   └── (auth)/
│   │   │       └── login.page.tsx
│   │   ├── components/                # Page-specific views & widgets
│   │   ├── routes/                    # Route definition object & router setup
│   │   │   └── routes.ts
│   │   └── store/                     # Global state (Zustand or TypeDI stores)
│   ├── styles/
│   │   ├── app.css                    # Tailwind imports & CSS variables
│   │   └── tokens.ts                  # Shared design token constants
│   ├── __tests__/                     # Mirrors src structure
│   ├── App.tsx                        # Root layout & providers (QueryClientProvider)
│   └── main.tsx                       # Vite entry point
├── .env.example
├── eslint.config.mjs
├── index.html
├── jest.config.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Tech Stack & Package Configuration

### 3.1 `package.json`
```json
{
  "name": "enterprise-vite-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "lint:fix": "eslint --fix src/",
    "format": "prettier --write \"**/*.{ts,tsx,js,mjs,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,mjs,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "validate:atomic-catalog": "node scripts/validate-atomic-catalog.mjs",
    "validate:http-layer": "node scripts/validate-http-layer.mjs",
    "validate:file-line-limit": "node scripts/validate-file-line-limit.mjs",
    "validate:no-skipped-tests": "node scripts/validate-no-skipped-tests.mjs",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "node --max-old-space-size=4096 ./node_modules/eslint/bin/eslint.js --fix --max-warnings=0 --no-warn-ignored",
      "prettier --write"
    ],
    "*.{js,mjs,cjs}": [
      "node --max-old-space-size=4096 ./node_modules/eslint/bin/eslint.js --fix --max-warnings=0 --no-warn-ignored"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  },
  "dependencies": {
    "@tanstack/react-query": "^5.66.0",
    "axios": "^1.7.9",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.5",
    "tailwind-merge": "^3.0.1",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@storybook/addon-docs": "^8.5.5",
    "@storybook/addon-essentials": "^8.5.5",
    "@storybook/react": "^8.5.5",
    "@storybook/react-vite": "^8.5.5",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.13.1",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.20.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-unused-imports": "^4.1.4",
    "husky": "^9.1.7",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "lint-staged": "^15.4.3",
    "postcss": "^8.5.2",
    "prettier": "^3.5.0",
    "storybook": "^8.5.5",
    "tailwindcss": "^3.4.17",
    "ts-jest": "^29.2.5",
    "typescript": "^5.7.3",
    "vite": "^6.1.0"
  }
}
```

### 3.2 `vite.config.ts`
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
```

---

## 4. Strict Atomic Design System

### 4.1 Hierarchy & Direction
- `atm.*` (Atoms): Base UI elements (buttons, inputs, labels, badges, spinners).
- `mol.*` (Molecules): Combinations of atoms (search bars, input-with-adornment, breadcrumbs).
- `obj.*` (Organisms): Composed interactive units (form system, data tables, modals, cards).
- `org.*` (Page Organisms): Major composite layouts and sections (top navigation, sidebars).

**Strict Rule**: Lower tiers **never** import from higher tiers (`atm.*` cannot import `mol.*`, `obj.*`, or `org.*`).

### 4.2 Single-Source-of-Truth Catalog
Before any atomic folder can be committed or built, it **must** be registered in `src/atomic/atomic.catalog.json`.

`src/atomic/atomic.catalog.json`:
```json
[
  {
    "folder": "atm.button",
    "semanticId": "primary-button",
    "tier": "atm",
    "description": "Base interactive button primitive with variants"
  },
  {
    "folder": "atm.input",
    "semanticId": "text-input",
    "tier": "atm",
    "description": "Base HTML input element"
  },
  {
    "folder": "mol.form-control",
    "semanticId": "form-control-wrapper",
    "tier": "mol",
    "description": "Input field paired with label and error caption"
  },
  {
    "folder": "obj.form",
    "semanticId": "form-container",
    "tier": "obj",
    "description": "Zero-useState form state manager & layout"
  }
]
```

### 4.3 Barrel Imports Only
Cross-atomic imports must always reference the package barrel:
```typescript
// Allowed:
import { Button } from "@/atomic/atm.button";

// Forbidden:
import { Button } from "@/atomic/atm.button/button.component";
```

---

## 5. Tailwind CSS Design System & Zero-Hardcoded Styling Rules

### 5.1 `tailwind.config.ts`
All tokens (colors, spacing, typography, dimensions) are declared here.

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./.storybook/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: "#1f80ff",
          hover: "#1767d2",
          light: "#e8f2ff",
          contrast: "#ffffff",
        },
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          500: "#64748b",
          900: "#0f172a",
        },
        feedback: {
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
      spacing: {
        "form-field": "1.25rem", // 20px
        "form-section": "2rem",   // 32px
      },
      width: {
        "modal-sm": "24rem",
        "modal-md": "32rem",
        "modal-lg": "48rem",
        "avatar-sm": "2rem",
        "avatar-md": "2.5rem",
        "avatar-lg": "3.5rem",
      },
      borderRadius: {
        token: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
```

### 5.2 Strict Styling Rules
| Code Pattern | Status | Reason / Remedy |
| :--- | :--- | :--- |
| `className="p-4 bg-primary-main"` | **Allowed** | Uses predefined design tokens |
| `className="p-[13px]"` | **Forbidden** | Arbitrary spacing value; map to standard scale |
| `className="text-[#1f80ff]"` | **Forbidden** | Arbitrary hex color; use `text-primary-main` |
| `className="w-[347px]"` | **Forbidden** | Arbitrary width; add semantic token in `tailwind.config.ts` |
| `style={{ padding: 12 }}` | **Forbidden** | Inline styles bypass theme and maintainability |

---

## 6. Clean Architecture & Data Flow Isolation

### 6.1 Layer Isolation Flowchart
```
[Route / Page Orchestrator] (src/app/pages/users.page.tsx)
    │
    ├── Reads useUsersUseCase()
    ├── Passes data & callbacks to <UsersTable /> & <UsersHeader />
    │
[Presentation Component] (src/app/components/users-table.component.tsx)
    │  (Pure UI — NO use-case imports, NO data imports)
    │
[Use Case Hook] (src/app/domain/users/use-get-users.use-case.ts)
    │  (Calls HTTP hook, transforms data into UI models)
    │
[HTTP Mutation / Query] (src/app/data/http/users/users.query.ts)
    │  (Calls Axios client, invokes DTO mappers)
    │
[Module DTO & Mappers] (src/app/data/http/users/users.dto.ts)
    │  (Validates response envelopes, converts snake_case ↔ camelCase)
    │
[Backend API]
```

### 6.2 Module DTO Pattern (`src/app/data/http/users/users.dto.ts`)
Each HTTP domain module contains **exactly one** `.dto.ts` file containing all network contracts, request mappers, and response validators.

```typescript
import type { UserModel } from "@/app/models/user.model";

// 1. Raw API Response Contracts (matching backend payload)
export interface UserResponseDto {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateUserRequestDto {
  first_name: string;
  last_name: string;
  email_address: string;
}

// 2. Request Mapper (UI CamelCase -> Backend Snake_case)
export function mapCreateUserToDto(input: {
  firstName: string;
  lastName: string;
  email: string;
}): CreateUserRequestDto {
  return {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email_address: input.email.trim().toLowerCase(),
  };
}

// 3. Response Mapper & Envelope Validator
export function mapUserResponseDtoToModel(dto: UserResponseDto): UserModel {
  if (!dto || typeof dto.id !== "string") {
    throw new Error("Invalid User API response envelope: missing user id");
  }

  return {
    id: dto.id,
    fullName: `${dto.first_name} ${dto.last_name}`.trim(),
    email: dto.email_address,
    isActive: dto.is_active,
    createdAt: new Date(dto.created_at),
  };
}
```

### 6.3 HTTP Mutation Pattern (`src/app/data/http/users/create-user.mutation.ts`)
- Exactly **one** exported mutation per file.
- Export name must end with `Mutation`.
- Never inline `snake_case` keys.

```typescript
import { apiClient } from "@/app/core/http/api-client";
import {
  mapCreateUserToDto,
  mapUserResponseDtoToModel,
  type UserResponseDto,
} from "./users.dto";
import type { UserModel } from "@/app/models/user.model";

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
}

export async function createUserMutation(
  input: CreateUserInput
): Promise<UserModel> {
  const payload = mapCreateUserToDto(input);
  const response = await apiClient.post<UserResponseDto>("/users", payload);
  return mapUserResponseDtoToModel(response.data);
}
```

### 6.4 Use-Case Hook Pattern (`src/app/domain/users/use-create-user.use-case.ts`)
- Exactly **one** exported use-case hook per file.
- Contains the TanStack Query `useMutation` or `useQuery` invocation.

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserMutation, type CreateUserInput } from "@/app/data/http/users/create-user.mutation";

export function useCreateUserUseCase() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateUserInput) => createUserMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    createUser: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
  };
}
```

### 6.5 Thin Route Page Orchestration (`src/app/pages/users.page.tsx`)
Pages remain **under 350 lines**, delegating layout and rendering to presentation components.

```typescript
import { useCreateUserUseCase } from "@/app/domain/users/use-create-user.use-case";
import { UserFormModal } from "@/app/components/user-form-modal.component";

export default function UsersPage() {
  const { createUser, isSubmitting } = useCreateUserUseCase();

  const handleCreate = async (values: { firstName: string; lastName: string; email: string }) => {
    await createUser(values);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
      <UserFormModal onSubmit={handleCreate} isLoading={isSubmitting} />
    </div>
  );
}
```

---

## 7. Zero-`useState` Form System Pattern

In this architecture, storing form field values in `useState` is **forbidden**. Forms use an unmanaged/ref-backed context container (`@/atomic/obj.form`).

### 7.1 Form Implementation (`src/atomic/obj.form/form.component.tsx`)
```typescript
import React, { createContext, useContext, useRef, type ReactNode } from "react";

type FormValues = Record<string, any>;

interface FormContextType {
  registerField: (name: string, getValue: () => any) => void;
  unregisterField: (name: string) => void;
}

const FormContext = createContext<FormContextType | null>(null);

export interface FormProps {
  children: ReactNode;
  onSubmit: (values: FormValues) => void | Promise<void>;
  className?: string;
}

export function Form({ children, onSubmit, className = "space-y-form-field" }: FormProps) {
  const fieldGetters = useRef<Map<string, () => any>>(new Map());

  const registerField = (name: string, getValue: () => any) => {
    fieldGetters.current.set(name, getValue);
  };

  const unregisterField = (name: string) => {
    fieldGetters.current.delete(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values: FormValues = {};
    for (const [name, getter] of fieldGetters.current.entries()) {
      values[name] = getter();
    }
    onSubmit(values);
  };

  return (
    <FormContext.Provider value={{ registerField, unregisterField }}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function FormFields({ children }: { children: ReactNode }) {
  return <div className="space-y-form-field">{children}</div>;
}

export interface FormFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}

export function FormField({ name, label, defaultValue = "", type = "text", required }: FormFieldProps) {
  const ctx = useContext(FormContext);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!ctx) return;
    ctx.registerField(name, () => inputRef.current?.value ?? "");
    return () => ctx.unregisterField(name);
  }, [ctx, name]);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-neutral-900">
        {label} {required && <span className="text-feedback-error">*</span>}
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="px-3.5 py-2 border border-neutral-200 rounded-token text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-main"
      />
    </div>
  );
}

Form.Fields = FormFields;
Form.Field = FormField;
```

---

## 8. Automated Validation Scripts

All 4 scripts live in the `scripts/` directory and are run by Husky and CI.

### 8.1 `scripts/validate-atomic-catalog.mjs`
Ensures that all folders in `src/atomic/` are registered in `atomic.catalog.json` and prevents duplicates.

```javascript
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
```

### 8.2 `scripts/validate-http-layer.mjs`
Validates strict HTTP module conventions.

```javascript
#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const httpRoot = path.resolve(__dirname, "../src/app/data/http");

const SKIP_FOLDERS = new Set(["client", "dto", "interceptors"]);
const FORBIDDEN_SPLIT_DTO = /^(create|update|patch|delete|search)-.+\.dto\.ts$/i;
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
    const dtos = files.filter((f) => f.endsWith(".dto.ts"));
    const ops = files.filter((f) => f.endsWith(".mutation.ts") || f.endsWith(".query.ts"));

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
      if (op.endsWith(".query.ts") && WRITE_METHOD_IN_QUERY.test(content)) {
        errors.push(`[${mod}] "${op}" contains write method. Move to dedicated *.mutation.ts`);
      }
      if (op.endsWith(".mutation.ts")) {
        const mutations = [...content.matchAll(/export\s+const\s+(\w+Mutation)\b|export\s+async\s+function\s+(\w+Mutation)\b/g)];
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
```

### 8.3 `scripts/validate-file-line-limit.mjs`
Blocks god-files.

```javascript
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

const EXEMPT_RE = /(\.stories\.(tsx|ts)$)|(\.(test|spec)\.(tsx|ts)$)|(styles\/tokens\.ts$)/;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
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

    if (base.endsWith(".page.tsx") || base.endsWith("layout.tsx")) {
      if (lines > MAX_PAGE_LINES) {
        errors.push(`${rel} (${lines} lines, max ${MAX_PAGE_LINES} for route pages)`);
      }
    } else if (base.endsWith(".dto.ts")) {
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
```

### 8.4 `scripts/validate-no-skipped-tests.mjs`
Ensures all tests are executed without exclusions.

```javascript
#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const testDir = path.join(root, "src/__tests__");

const FORBIDDEN = /\b(describe\.skip|it\.skip|test\.skip|fit\(|fdescribe\(|xit\(|xdescribe\(|\.only\()\b/;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(test|spec)\.(ts|tsx|js)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function main() {
  const tests = walk(testDir);
  if (tests.length === 0) {
    console.error("Error: No test files found in src/__tests__.");
    process.exit(1);
  }

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
```

---

## 9. Pre-commit Hooks & Quality Enforcement Pipeline

### 9.1 `.husky/pre-commit`
```bash
#!/usr/bin/env sh
set -e

echo "Running 10-step enterprise pre-commit checks..."

# [0/10] Atomic Folder Prefix
echo "  [0/10] Checking atomic folder prefixes..."
if [ -d "src/atomic" ]; then
  for dir in src/atomic/*/; do
    folder=$(basename "$dir")
    if ! echo "$folder" | grep -qE '^(atm|mol|obj|org)\.'; then
      echo "Invalid atomic folder: $folder. Must start with atm., mol., obj., or org."
      exit 1
    fi
  done
fi

# [0b/10] Atomic Catalog Registry
echo "  [0b/10] Validating atomic catalog..."
node scripts/validate-atomic-catalog.mjs

# [0c/10] HTTP Layer Structure
echo "  [0c/10] Validating HTTP layer structure..."
node scripts/validate-http-layer.mjs

# [0d/10] Test Integrity (No skipped/focused tests)
echo "  [0d/10] Checking for skipped tests..."
node scripts/validate-no-skipped-tests.mjs

# [0e/10] File Line Limits
echo "  [0e/10] Validating file line limits..."
node scripts/validate-file-line-limit.mjs

# [1/10] lint-staged (ESLint + Prettier on staged files)
echo "  [1/10] Running lint-staged..."
npx lint-staged

# [1b/10] Full Repository Prettier Check
echo "  [1b/10] Checking global formatting..."
npm run format:check

# [2/10] Full src/ Architecture Lint
echo "  [2/10] Running architecture ESLint on full src/..."
npx eslint src/ --max-warnings=0

# [3/10] Strict TypeScript Check
echo "  [3/10] Running TypeScript compilation check..."
npm run type-check

# [4/10] Full Test Suite Execution
echo "  [4/10] Running tests..."
npm test

# [5/10] Vite Production Build Validation
echo "  [5/10] Verifying Vite production build..."
npm run build

echo "All 10 quality checks passed successfully. Commit accepted."
```

---

## 10. Cursor / AI Agent Rules

Place these rules in `.cursor/agent-rules/` and symlink `.cursor/rules` to `.cursor/agent-rules`.

### 10.1 `.cursor/agent-rules/project-core.mdc`
```markdown
---
description: Core architecture, data flow, forms, and quality gates for the project
alwaysApply: true
---

# Project Core Architecture Rules

## 1. Data Flow (Strict Clean Architecture)
Component (.tsx) → *.use-case.ts → *.datasource.ts / HTTP hooks → API.
- HTTP hooks (`useMutationHttpRequest`, `useQueryHttpRequest`) are ONLY allowed in `*.use-case.ts`.
- Exactly one hook exported per `*.use-case.ts`.
- Presentation components and atomics must NEVER import domain use cases or datasources.
- Pages/routes call use cases and pass data/handlers to presentation components as props.
- One mutation per `*.mutation.ts` (export name must end with `Mutation`).

## 2. Forms (Strict)
- Submit forms strictly use `@/atomic/obj.form`: `<Form>` + `<Form.Fields>` + `<Form.Field>`.
- NEVER store form field values in `useState` (`form`, `draft`, `values`, validation objects).
- Form.Field manages values internally.

## 3. File Size Ceilings
- Route pages (`*.page.tsx` / `layout.tsx`): Max 350 lines.
- UI components, atomic components, and HTTP DTOs: Max 650 lines.
- God-files must be split into thin containers and sub-components.

## 4. HTTP Module Structure
Under `src/app/data/http/<module>/`:
- Exactly ONE `<module>.dto.ts` per domain module.
- No action-split DTOs (`create-*.dto.ts`, etc.).
- Never build snake_case payloads inline in mutations; use `mapXToDto` in `<module>.dto.ts`.
- Response validation and mapping belongs in `mapXResponseDtoToData` in the module DTO.

## 5. Tests
- No skipped or focused tests: never use `test.skip`, `it.skip`, `describe.skip`, or `.only`.
- Logic/UI changes must ship with corresponding unit tests in `src/__tests__/`.
```

### 10.2 `.cursor/agent-rules/atomic-design.mdc`
```markdown
---
description: Atomic design and catalog rules for src/atomic/
globs: src/atomic/**/*
alwaysApply: false
---

# Atomic Component Rules

1. **Hierarchy**: `atm.*` → `mol.*` → `obj.*` → `org.*`. Lower tiers must never import higher tiers.
2. **Catalog First**: Before creating `src/atomic/<tier>.<name>/`, register its unique `semanticId` in `src/atomic/atomic.catalog.json`.
3. **No Duplicate UI Primitives**: Extend existing atomics rather than creating redundant folders.
4. **Barrel Imports Only**: Always import cross-atomics via `@/atomic/<tier>.<name>`, never internal paths.
5. **Stories**: Every atomic folder must include `<name>.stories.tsx`.
```

### 10.3 `.cursor/agent-rules/tailwind-styling.mdc`
```markdown
---
description: Strict Tailwind CSS token usage — no arbitrary values or inline styles
globs: "**/*.{tsx,ts,jsx,js}"
alwaysApply: false
---

# Tailwind Styling Rules

1. **No Arbitrary Brackets**: Never use bracket notation like `bg-[#1f80ff]`, `p-[13px]`, `w-[540px]`, or `text-[12px]`.
2. **Theme Tokens Only**: Use configured utilities (e.g., `bg-primary-main`, `p-4`, `w-modal-md`).
3. **New Tokens**: If a specific spacing or dimension is needed, declare it in `tailwind.config.ts`.
4. **No Inline Styles**: Never use `style={{ ... }}` for styling.
```

---

## 11. New Project Bootstrap Checklist

When creating a new repository with this architecture:

1. **Initialize Vite**:
   ```bash
   npm create vite@latest my-app -- --template react-ts
   cd my-app
   ```
2. **Install Core & Quality Dependencies**:
   ```bash
   npm install @tanstack/react-query axios clsx tailwind-merge react-router-dom lucide-react zustand
   npm install -D tailwindcss postcss autoprefixer eslint prettier husky lint-staged jest ts-jest @types/jest @testing-library/react @testing-library/jest-dom storybook
   ```
3. **Configure Tailwind & TypeScript**:
   - Run `npx tailwindcss init -p -t`.
   - Copy `tailwind.config.ts` from Section 5.1.
   - Configure `@/*` path alias in `tsconfig.json` and `vite.config.ts`.
4. **Set Up Scripts & Husky**:
   - Copy the 4 scripts from Section 8 into `scripts/` and make them executable (`chmod +x scripts/*.mjs`).
   - Run `npx husky init`.
   - Copy `.husky/pre-commit` from Section 9.1.
5. **Add Agent Rules**:
   - Create `.cursor/agent-rules/` and populate the 3 `.mdc` rule files from Section 10.
   - Create symlink: `ln -s agent-rules .cursor/rules`.
6. **Verify Initial Gates**:
   ```bash
   npm run validate:atomic-catalog
   npm run validate:http-layer
   npm run validate:file-line-limit
   npm run validate:no-skipped-tests
   npm run build
   ```
