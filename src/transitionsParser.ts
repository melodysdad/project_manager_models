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

  // Split by transition headers
  const lines = content.split("\n");
  let currentTransition: {name?: string; isFutureWork?: boolean; lines?: string[]} | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^### \*\*Transition: `(\w+)`\*\*\s*(\*\(FUTURE WORK\)\*)?/);

    if (headerMatch) {
      // Save previous transition if exists
      if (currentTransition?.name) {
        const parsed = parseTransitionSection(
          currentTransition.name,
          currentTransition.isFutureWork || false,
          (currentTransition.lines || []).join("\n")
        );
        if (parsed) transitions.push(parsed);
      }

      // Start new transition
      currentTransition = {
        name: headerMatch[1],
        isFutureWork: !!headerMatch[2],
        lines: [],
      };
    } else if (currentTransition) {
      currentTransition.lines!.push(line);
    }
  }

  // Don't forget the last transition
  if (currentTransition?.name) {
    const parsed = parseTransitionSection(
      currentTransition.name,
      currentTransition.isFutureWork || false,
      (currentTransition.lines || []).join("\n")
    );
    if (parsed) transitions.push(parsed);
  }

  return { transitions };
}

function parseTransitionSection(
  name: string,
  isFutureWork: boolean,
  sectionText: string
): TransitionDefinition | null {
  // Extract description (first line after header with text)
  const descriptionMatch = sectionText.match(
    /\n\n(.+?)(?:\n\n|$)/
  );
  const description = descriptionMatch ? descriptionMatch[1].trim() : "";

  // Extract the fact/event name
  const factMatch = sectionText.match(
    /#### \*?\*?Fact Emitted\*?\*?\n\n\*\s*`([^`]+)`/
  );
  const eventName = factMatch ? factMatch[1] : "";

  // Extract fields from "Fact Emitted" section
  const factSectionMatch = sectionText.match(
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

  // Only return if we found an event name and fields
  if (eventName && fields.length > 0) {
    return {
      name,
      description,
      eventName,
      fields,
      futureWork: isFutureWork,
    };
  }

  return null;
}
