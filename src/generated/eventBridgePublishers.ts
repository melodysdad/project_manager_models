// Auto-generated from contracts/TRANSITIONS.md
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
  | "ConversationStarted"
  | "ConversationCheckpointCreated"
  | "TaskCreated"
  | "TaskCheckpointCreated"
  | "MessageAdded";

/**
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
    throw new Error(`Failed to publish event to EventBridge`);
  }

  return response.Entries?.[0]?.EventId || "unknown";
}

/**
 * Publish ConversationStarted event to EventBridge
 *
 * Routes to SQS queues configured for: project_manager.conversation.started
 */
export async function publishConversationStarted(
  cloudEvent: CloudEvent,
  options?: {
    eventBusName?: string;
  }
): Promise<string> {
  const eventBridgeEvent: EventBridgeEvent = {
    source: cloudEvent.source,
    "detail-type": "ConversationStarted",
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

/**
 * Publish ConversationCheckpointCreated event to EventBridge
 *
 * Routes to SQS queues configured for: project_manager.conversation.checkpoint.created
 */
export async function publishConversationCheckpointCreated(
  cloudEvent: CloudEvent,
  options?: {
    eventBusName?: string;
  }
): Promise<string> {
  const eventBridgeEvent: EventBridgeEvent = {
    source: cloudEvent.source,
    "detail-type": "ConversationCheckpointCreated",
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

/**
 * Publish MessageAdded event to EventBridge
 *
 * Routes to SQS queues configured for: project_manager.message.added
 */
export async function publishMessageAdded(
  cloudEvent: CloudEvent,
  options?: {
    eventBusName?: string;
  }
): Promise<string> {
  const eventBridgeEvent: EventBridgeEvent = {
    source: cloudEvent.source,
    "detail-type": "MessageAdded",
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

