export function mapMarkdownTypeToTypeScript(markdownType: string): string {
  const typeMap: Record<string, string> = {
    GUID: "string",
    string: "string",
    timestamp: "Date | number",
    boolean: "boolean",
    "ENUM(HUMAN | SYSTEM | AI)": "'HUMAN' | 'SYSTEM' | 'AI'",
    "Enum with the following possible values:": "string", // Will be handled specially
    "ENUM (WORK_STARTED | WORK_PAUSED | WORK_COMPLETED | WORK_REJECTED|WORK_APPROVED)":
      "'WORK_STARTED' | 'WORK_PAUSED' | 'WORK_COMPLETED' | 'WORK_REJECTED' | 'WORK_APPROVED'",
  };

  // Check exact matches first
  for (const [key, value] of Object.entries(typeMap)) {
    if (markdownType.includes(key)) {
      return value;
    }
  }

  // Handle array types
  if (markdownType.includes("[")) {
    const innerType = markdownType.match(/\[(.*?)\]/)?.[1] || "unknown";
    if (innerType.includes("{")) {
      // Complex object array
      if (innerType.includes("external_source")) {
        return "Array<{ external_source: string; identity: unknown }>";
      }
      return "Array<Record<string, unknown>>";
    }
    return `${mapMarkdownTypeToTypeScript(innerType)}[]`;
  }

  // Default
  return "unknown";
}

export function mapMarkdownTypeToZod(markdownType: string): string {
  const zodeMap: Record<string, string> = {
    GUID: "z.string().uuid()",
    string: "z.string()",
    timestamp: "z.union([z.date(), z.number()])",
    boolean: "z.boolean()",
    "ENUM(HUMAN | SYSTEM | AI)":
      "z.enum(['HUMAN', 'SYSTEM', 'AI'])",
    "ENUM (WORK_STARTED | WORK_PAUSED | WORK_COMPLETED | WORK_REJECTED|WORK_APPROVED)":
      "z.enum(['WORK_STARTED', 'WORK_PAUSED', 'WORK_COMPLETED', 'WORK_REJECTED', 'WORK_APPROVED'])",
  };

  // Check exact matches first
  for (const [key, value] of Object.entries(zodeMap)) {
    if (markdownType.includes(key)) {
      return value;
    }
  }

  // Handle array types
  if (markdownType.includes("[")) {
    const innerType = markdownType.match(/\[(.*?)\]/)?.[1] || "unknown";
    if (innerType.includes("{")) {
      // Complex object array
      if (innerType.includes("external_source")) {
        return "z.array(z.object({ external_source: z.string(), identity: z.unknown() }))";
      }
      return "z.array(z.record(z.unknown()))";
    }
    return `z.array(${mapMarkdownTypeToZod(innerType)})`;
  }

  // Default
  return "z.unknown()";
}

export function isEnumType(markdownType: string): boolean {
  return markdownType.toUpperCase().includes("ENUM");
}

export function extractEnumValues(markdownType: string): string[] {
  const enumMatch = markdownType.match(/ENUM\s*\(([^)]+)\)/i);
  if (!enumMatch) return [];

  return enumMatch[1]
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}
