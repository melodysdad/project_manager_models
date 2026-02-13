export function mapMarkdownTypeToTypeScript(markdownType: string): string {
  // Handle array types first (before checking other patterns)
  if (markdownType.includes("[")) {
    const innerType = markdownType.match(/\[(.*?)\]/)?.[1] || "unknown";
    if (innerType.includes("{")) {
      // Complex object array
      if (innerType.includes("external_source")) {
        return "Array<{ external_source: string; identity: unknown }>";
      }
      return "Array<Record<string, unknown>>";
    }
    // Recursively map the inner type
    const mappedInnerType = mapMarkdownTypeToTypeScript(innerType.trim());
    return `${mappedInnerType}[]`;
  }

  // Handle ENUM types
  if (markdownType.includes("ENUM")) {
    const enumMatch = markdownType.match(/ENUM\s*\(([^)]+)\)/i);
    if (enumMatch) {
      const values = enumMatch[1]
        .split("|")
        .map((v) => `'${v.trim()}'`)
        .join(" | ");
      return values;
    }
  }

  const typeMap: Record<string, string> = {
    GUID: "string",
    string: "string",
    timestamp: "Date | number",
    boolean: "boolean",
  };

  // Check exact matches
  for (const [key, value] of Object.entries(typeMap)) {
    if (markdownType.includes(key)) {
      return value;
    }
  }

  // Default
  return "unknown";
}

export function mapMarkdownTypeToZod(markdownType: string): string {
  // Handle array types first (before checking other patterns)
  if (markdownType.includes("[")) {
    const innerType = markdownType.match(/\[(.*?)\]/)?.[1] || "unknown";
    if (innerType.includes("{")) {
      // Complex object array
      if (innerType.includes("external_source")) {
        return "z.array(z.object({ external_source: z.string(), identity: z.unknown() }))";
      }
      return "z.array(z.record(z.unknown()))";
    }
    // Recursively map the inner type
    const mappedInnerType = mapMarkdownTypeToZod(innerType.trim());
    return `z.array(${mappedInnerType})`;
  }

  // Handle ENUM types
  if (markdownType.includes("ENUM")) {
    const enumMatch = markdownType.match(/ENUM\s*\(([^)]+)\)/i);
    if (enumMatch) {
      const values = enumMatch[1]
        .split("|")
        .map((v) => `'${v.trim()}'`)
        .join(", ");
      return `z.enum([${values}])`;
    }
  }

  const zodeMap: Record<string, string> = {
    GUID: "z.string().uuid()",
    string: "z.string()",
    timestamp: "z.union([z.date(), z.number()])",
    boolean: "z.boolean()",
  };

  // Check exact matches
  for (const [key, value] of Object.entries(zodeMap)) {
    if (markdownType.includes(key)) {
      return value;
    }
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
