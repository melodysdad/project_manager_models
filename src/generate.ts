import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { parsePrimitives } from "./parser.ts";
import { parseTransitions } from "./transitionsParser.ts";
import { generateInterfaces } from "./generateInterfaces.ts";
import { generateSchemas } from "./generateSchemas.ts";
import { generateCloudEvents } from "./generateCloudEvents.ts";
import { generateLambdaHandlers } from "./generateLambdaHandlers.ts";
import { generateEventBridgePublishers } from "./generateEventBridgePublishers.ts";

const OUTPUT_DIR = resolve(import.meta.dirname, "../src/generated");

function ensureDirectory(path: string) {
  mkdirSync(dirname(path), { recursive: true });
}

function generate() {
  console.log("🔍 Parsing contracts/PRIMITIVES.md...");
  const { primitives } = parsePrimitives("contracts/PRIMITIVES.md");
  console.log(`✓ Found ${primitives.length} primitives`);

  console.log("🔍 Parsing contracts/TRANSITIONS.md...");
  const { transitions } = parseTransitions("contracts/TRANSITIONS.md");
  console.log(`✓ Found ${transitions.length} transitions (${transitions.filter((t) => !t.futureWork).length} implemented)`);

  console.log("\n📝 Generating TypeScript interfaces...");
  const interfaceCode = generateInterfaces(primitives);
  const interfacePath = resolve(OUTPUT_DIR, "types.ts");
  ensureDirectory(interfacePath);
  writeFileSync(interfacePath, interfaceCode);
  console.log(`✓ Generated ${interfacePath}`);

  console.log("📝 Generating Zod schemas...");
  const schemaCode = generateSchemas(primitives);
  const schemaPath = resolve(OUTPUT_DIR, "schemas.ts");
  ensureDirectory(schemaPath);
  writeFileSync(schemaPath, schemaCode);
  console.log(`✓ Generated ${schemaPath}`);

  console.log("📝 Generating CloudEvent types...");
  const cloudEventCode = generateCloudEvents(transitions);
  const cloudEventPath = resolve(OUTPUT_DIR, "cloudEvents.ts");
  ensureDirectory(cloudEventPath);
  writeFileSync(cloudEventPath, cloudEventCode);
  console.log(`✓ Generated ${cloudEventPath}`);

  console.log("📝 Generating Lambda handler stubs...");
  const handlerCode = generateLambdaHandlers(transitions);
  const handlerPath = resolve(OUTPUT_DIR, "lambdaHandlers.ts");
  ensureDirectory(handlerPath);
  writeFileSync(handlerPath, handlerCode);
  console.log(`✓ Generated ${handlerPath}`);

  console.log("📝 Generating EventBridge publishers...");
  const publisherCode = generateEventBridgePublishers(transitions);
  const publisherPath = resolve(OUTPUT_DIR, "eventBridgePublishers.ts");
  ensureDirectory(publisherPath);
  writeFileSync(publisherPath, publisherCode);
  console.log(`✓ Generated ${publisherPath}`);

  console.log("\n✅ Code generation complete!");
  console.log(`\nGenerated files:`);
  console.log(`  - src/generated/types.ts`);
  console.log(`  - src/generated/schemas.ts`);
  console.log(`  - src/generated/cloudEvents.ts`);
  console.log(`  - src/generated/lambdaHandlers.ts`);
  console.log(`  - src/generated/eventBridgePublishers.ts`);
}

generate();
