import { readFileSync } from "fs";
import { resolve } from "path";

export interface TransitionField {
  name: string;
  optional: boolean;
  description?: string;
}

export interface TransitionDefinition {
  name: string;
  description: string;
  eventName: string; // e.g., project_manager.conversation.started
  fields: TransitionField[];
  futureWork: boolean;
}

export interface ParsedTransitions {
  transitions: TransitionDefinition[];
}

export function parseTransitions(filePath: string): ParsedTransitions {
  const content = readFileSync(resolve(filePath), "utf-8");
  const transitions: TransitionDefinition[] = [];

  // Match transition definitions: ### **Transition: `EventName`** with optional *(FUTURE WORK)*
  const transitionMatches = content.matchAll(
    /^### \*\*Transition: `(\w+)`\*\*\s*(\*\(FUTURE WORK\)\*)?\n\n([\s\S]*?)(?=\n### \*\*|$)/gm
  );

  for (const match of transitionMatches) {
    const name = match[1];
    const isFutureWork = !!match[2];
    const section = match[3];

    // Extract description
    const descriptionMatch = section.match(
      /#### \*\*Description(:|\/\*\*)\*?\*?\n\n([\s\S]*?)(?=####|$)/
    );
    const description = descriptionMatch
      ? descriptionMatch[2].trim().split("\n")[0]
      : "";

    // Extract the fact/event name from "Fact Emitted" or "#### **Fact Emitted**"
    const factMatch = section.match(
      /#### \*?\*?Fact Emitted\*?\*?\n\n\*\s*`([^`]+)`/
    );
    const eventName = factMatch ? factMatch[1] : "";

    // Extract fields from "Fact Emitted" section
    const factSectionMatch = section.match(
      /#### \*?\*?Fact Emitted\*?\*?\n\n\*\s*`[^`]+`\n([\s\S]*?)(?=####|$)/
    );
    const factSection = factSectionMatch ? factSectionMatch[1] : "";

    const fields: TransitionField[] = [];
    const fieldLines = factSection.split("\n");

    for (const line of fieldLines) {
      const fieldMatch = line.match(/^\s{2,}\*\s+(\w+)\s*(\(optional\))?/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const optional = !!fieldMatch[2];

        fields.push({
          name: fieldName,
          optional,
        });
      }
    }

    // Only add if we found an event name and fields
    if (eventName && fields.length > 0) {
      transitions.push({
        name,
        description,
        eventName,
        fields,
        futureWork: isFutureWork,
      });
    }
  }

  return { transitions };
}
