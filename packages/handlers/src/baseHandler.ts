import { z } from "zod";

/**
 * CloudEvent envelope type (minimal, real type from @project-manager/models)
 */
export interface CloudEvent<T = unknown> {
  specversion: "1.0";
  type: string;
  source: string;
  id: string;
  time: string;
  datacontenttype?: "application/json";
  subject?: string;
  data?: T;
}

/**
 * AWS Lambda response
 */
export interface LambdaResponse {
  statusCode: number;
  body: string;
}

/**
 * Base handler for transition events
 *
 * Extend this class to implement a transition event handler.
 * Only implement the abstract `process()` method with your business logic.
 *
 * @example
 * ```typescript
 * import { TransitionHandler } from '@project-manager/transition-handlers';
 * import { ConversationStartedData } from '@project-manager/models';
 *
 * export class ConversationStartedHandler extends TransitionHandler<ConversationStartedData> {
 *   eventType = 'project_manager.conversation.started';
 *
 *   async process(data: ConversationStartedData): Promise<void> {
 *     // Your implementation here
 *     await dynamoDb.put({
 *       TableName: 'conversations',
 *       Item: data,
 *     }).promise();
 *   }
 * }
 * ```
 */
export abstract class TransitionHandler<T = unknown> {
  /**
   * The event type this handler processes
   * Must match the CloudEvent.type exactly
   * @example 'project_manager.conversation.started'
   */
  abstract readonly eventType: string;

  /**
   * Process the transition event
   * Implement your business logic here
   *
   * @param data The typed event data from CloudEvent.data
   * @throws Will be caught and returned as 500 status
   */
  abstract process(data: T): Promise<void>;

  /**
   * Handle the CloudEvent
   * Do NOT override this method - implement process() instead
   */
  async handle(event: CloudEvent<T>): Promise<LambdaResponse> {
    const logContext = {
      eventId: event.id,
      eventType: event.type,
      source: event.source,
    };

    try {
      // Validate event type matches
      if (event.type !== this.eventType) {
        const error = `Event type mismatch: expected ${this.eventType}, got ${event.type}`;
        console.error(error, logContext);
        return this.errorResponse(error, 400);
      }

      // Call the implementation
      console.log(`[${this.eventType}] Processing event`, logContext);
      await this.process(event.data as T);
      console.log(`[${this.eventType}] Successfully processed event`, logContext);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          eventId: event.id,
        }),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${this.eventType}] Failed to process event`, {
        ...logContext,
        error: message,
        stack: error instanceof Error ? error.stack : undefined,
      });

      return this.errorResponse(message, 500);
    }
  }

  /**
   * Helper to format error responses
   */
  private errorResponse(message: string, statusCode: number): LambdaResponse {
    return {
      statusCode,
      body: JSON.stringify({
        success: false,
        error: message,
      }),
    };
  }

  /**
   * Validate data against a Zod schema
   * Useful for runtime validation in your process() method
   */
  protected validate<S extends z.ZodSchema>(schema: S, data: unknown): z.infer<S> {
    return schema.parse(data);
  }
}
