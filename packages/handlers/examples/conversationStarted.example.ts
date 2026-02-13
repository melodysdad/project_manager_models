/**
 * Example: ConversationStarted Handler
 *
 * This is what an agent would implement in a Lambda function.
 * That's it! The base class handles:
 * - Event type validation
 * - Error handling
 * - Logging
 * - Lambda response formatting
 */

import { TransitionHandler } from "../src/index.ts";
import type { ConversationStartedData } from "@project-manager/models";
import { publishToEventBridge } from "@project-manager/models";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDB = new DynamoDBClient({});

export class ConversationStartedHandler extends TransitionHandler<ConversationStartedData> {
  eventType = "project_manager.conversation.started";

  async process(data: ConversationStartedData): Promise<void> {
    // 1. Persist conversation to DynamoDB
    await dynamoDB.send(
      new PutCommand({
        TableName: process.env.CONVERSATIONS_TABLE!,
        Item: {
          pk: `CONV#${data.id}`,
          sk: "METADATA",
          ...data,
          createdAt: new Date().toISOString(),
        },
      })
    );

    // 2. Publish downstream event
    await publishToEventBridge({
      source: "project_manager",
      "detail-type": "ConversationStarted",
      detail: {
        conversationId: data.id,
        actorIds: data.actor_ids,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`✓ Conversation ${data.id} created and published`);
  }
}

// Export Lambda handler
const handler = new ConversationStartedHandler();
export const lambdaHandler = (event: any) => handler.handle(event);
