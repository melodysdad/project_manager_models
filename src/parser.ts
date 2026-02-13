import { readFileSync } from "fs";
import { resolve } from "path";

export interface FieldDefinition {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

export interface PrimitiveDefinition {
  name: string;
  description: string;
  fields: FieldDefinition[];
}

export interface ParsedPrimitives {
  primitives: PrimitiveDefinition[];
}

export function parsePrimitives(filePath: string): ParsedPrimitives {
  const content = readFileSync(resolve(filePath), "utf-8");
  const primitives: PrimitiveDefinition[] = [];

  // Split content into primitive sections (from ### Name to next ### or end)
  // Note: Some primitives have blank lines after the heading, others don't
  const primitiveMatches = content.matchAll(
    /^### (\w+)\n([\s\S]*?)(?=\n### |\Z)/gm
  );

  for (const match of primitiveMatches) {
    const name = match[1];
    const section = match[2];

    // Skip the "Interfaces" section
    if (name === "Interfaces") {
      continue;
    }

    // Extract description (text before "#### Fields")
    const descriptionMatch = section.match(
      /^([\s\S]*?)(?=#### Fields|\Z)/
    );
    const description = descriptionMatch
      ? descriptionMatch[1].trim().replace(/\n\n/g, " ")
      : "";

    // Extract fields section - capture everything after "#### Fields\n\n"
    const fieldsMatch = section.match(
      /#### Fields\n\n([\s\S]*)/
    );
    const fieldsSection = fieldsMatch ? fieldsMatch[1] : "";

    const fields: FieldDefinition[] = [];
    const fieldLines = fieldsSection.split("\n");

    for (const line of fieldLines) {
      // Match lines starting with * or - followed by field definition
      const fieldMatch = line.match(
        /^[\s]*[-*]\s+(\w+)(\??)\s*:\s*(.+?)$/
      );
      if (fieldMatch) {
        const fullName = fieldMatch[1];
        const questionMark = fieldMatch[2];
        const fieldType = fieldMatch[3].trim();

        fields.push({
          name: fullName,
          type: fieldType,
          optional: questionMark === "?" || fieldType.includes("?"),
        });
      }
    }

    if (fields.length > 0) {
      primitives.push({
        name,
        description,
        fields,
      });
    }
  }

  return { primitives };
}
