import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { parsePrimitives } from "./parser.ts";
import { generateInterfaces } from "./generateInterfaces.ts";
import { generateSchemas } from "./generateSchemas.ts";

const OUTPUT_DIR = resolve(import.meta.dirname, "../src/generated");

function ensureDirectory(path: string) {
  mkdirSync(dirname(path), { recursive: true });
}

function generate() {
  console.log("🔍 Parsing contracts/PRIMITIVES.md...");
  const { primitives } = parsePrimitives("contracts/PRIMITIVES.md");
  console.log(`✓ Found ${primitives.length} primitives`);

  console.log("\n📝 Generating TypeScript interfaces...");
  const interfaceCode = generateInterfaces(primitives);
  const interfacePath = resolve(OUTPUT_DIR, "types.ts");
  ensureDirectory(interfacePath);
  writeFileSync(interfacePath, interfaceCode);
  console.log(`✓ Generated ${interfacePath}`);

  console.log("\n📝 Generating Zod schemas...");
  const schemaCode = generateSchemas(primitives);
  const schemaPath = resolve(OUTPUT_DIR, "schemas.ts");
  ensureDirectory(schemaPath);
  writeFileSync(schemaPath, schemaCode);
  console.log(`✓ Generated ${schemaPath}`);

  console.log("\n✅ Code generation complete!");
  console.log(`\nGenerated files:`);
  console.log(`  - src/generated/types.ts`);
  console.log(`  - src/generated/schemas.ts`);
}

generate();
