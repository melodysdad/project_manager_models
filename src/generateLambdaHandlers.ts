import { TransitionDefinition } from "./transitionsParser.ts";

export function generateLambdaHandlers(transitions: TransitionDefinition[]): string {
  let output = `// Auto-generated from contracts/TRANSITIONS.md
// Do not edit manually
//
// Template Lambda handlers for processing transition events
// Implement the business logic in the TODO sections

import { CloudEvent } from "./cloudEvents.ts";

/**
 * CloudEvent payload type
 */
interface EventPayload {
  [key: string]: unknown;
}

`;

  // Generate a handler for each current-implementation transition
  for (const transition of transitions) {
    if (!transition.futureWork) {
      output += generateHandler(transition);
    }
  }

  return output;
}

function generateHandler(transition: TransitionDefinition): string {
  const handlerName = `handle${transition.name}`;
  const eventType = transition.eventName;

  return `/**
 * Handle ${transition.name} event
 *
 * Event: ${eventType}
 *
 * ${transition.description}
 */
export async function ${handlerName}(
  event: CloudEvent<EventPayload>
): Promise<{ statusCode: number; body: string }> {
  try {
    // Validate event type
    if (event.type !== "${eventType}") {
      throw new Error(\`Expected event type ${eventType}, got \${event.type}\`);
    }

    // Extract event data
    const data = event.data as EventPayload;

    // TODO: Implement ${transition.name} business logic
    // Steps:
    // 1. Validate input data against schema
    // 2. Persist event to DynamoDB/S3
    // 3. Publish to EventBridge for downstream processing
    // 4. Return success response

    console.log("Processing ${transition.name} event:", {
      id: event.id,
      time: event.time,
      subject: event.subject,
      data,
    });

    // TODO: Replace with actual implementation
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "${transition.name} processed successfully",
        eventId: event.id,
      }),
    };
  } catch (error) {
    console.error("Error processing ${transition.name}:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
}

`;
}
