import { TransitionDefinition } from "./transitionsParser.ts";

export function generateEventBridgePublishers(
  transitions: TransitionDefinition[]
): string {
  let output = `// Auto-generated from contracts/TRANSITIONS.md
// Do not edit manually
//
// EventBridge publishers for routing transition events to SQS queues

import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { CloudEvent } from "./cloudEvents.ts";

const eventBridgeClient = new EventBridgeClient();

/**
 * EventBridge detail-type format for routing
 * pattern_name format allows targeting specific patterns
 */
type DetailType =
`;

  // Generate type union for detail types
  const detailTypes = transitions.map((t) => `  | "${t.name}"`);
  output += detailTypes.join("\n") + ";\n\n";

  // Generate publisher interface
  output += `/**
 * EventBridge event to be published
 */
interface EventBridgeEvent {
  source: string;
  "detail-type": DetailType;
  detail: Record<string, unknown>;
  "event-bus-name"?: string;
}

/**
 * Publish event to EventBridge for routing to SQS queues
 */
export async function publishToEventBridge(
  event: EventBridgeEvent
): Promise<string> {
  const command = new PutEventsCommand({
    Entries: [
      {
        Source: event.source,
        DetailType: event["detail-type"],
        Detail: JSON.stringify(event.detail),
        EventBusName: event["event-bus-name"],
      },
    ],
  });

  const response = await eventBridgeClient.send(command);

  if (response.FailedEntryCount && response.FailedEntryCount > 0) {
    throw new Error(\`Failed to publish event to EventBridge\`);
  }

  return response.Entries?.[0]?.EventId || "unknown";
}

`;

  // Generate publisher functions for each transition
  for (const transition of transitions) {
    if (!transition.futureWork) {
      output += generatePublisher(transition);
    }
  }

  return output;
}

function generatePublisher(transition: TransitionDefinition): string {
  const functionName = `publish${transition.name}`;
  const detailType = transition.name;

  return `/**
 * Publish ${transition.name} event to EventBridge
 *
 * Routes to SQS queues configured for: ${transition.eventName}
 */
export async function ${functionName}(
  cloudEvent: CloudEvent,
  options?: {
    eventBusName?: string;
  }
): Promise<string> {
  const eventBridgeEvent: EventBridgeEvent = {
    source: cloudEvent.source,
    "detail-type": "${detailType}",
    detail: {
      // CloudEvent metadata
      specversion: cloudEvent.specversion,
      id: cloudEvent.id,
      time: cloudEvent.time,
      subject: cloudEvent.subject,
      // Event data
      ...cloudEvent.data,
    },
    "event-bus-name": options?.eventBusName,
  };

  return publishToEventBridge(eventBridgeEvent);
}

`;
}
