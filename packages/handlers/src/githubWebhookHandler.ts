import { createHmac } from "crypto";
import { z } from "zod";

/**
 * API Gateway Lambda Proxy Integration event
 */
export interface APIGatewayProxyEvent {
  httpMethod: string;
  path: string;
  headers?: Record<string, string | undefined>;
  body?: string;
}

/**
 * Base handler for GitHub webhook events
 *
 * Handles:
 * - HMAC SHA256 signature verification
 * - Webhook type routing
 * - Standard error handling and logging
 *
 * @example
 * ```typescript
 * import { GitHubWebhookHandler } from '@project-manager/transition-handlers';
 *
 * export class ProjectsV2ItemEditedHandler
 *   extends GitHubWebhookHandler<ProjectsV2ItemEditedPayload>
 * {
 *   webhookEvent = 'projects_v2_item';
 *   webhookAction = 'edited';
 *
 *   async process(payload: ProjectsV2ItemEditedPayload): Promise<void> {
 *     // Your implementation
 *     await saveProjectUpdate(payload);
 *   }
 * }
 *
 * const handler = new ProjectsV2ItemEditedHandler(
 *   process.env.GITHUB_WEBHOOK_SECRET!
 * );
 * export const lambdaHandler = (event: APIGatewayProxyEvent) =>
 *   handler.handle(event);
 * ```
 */
export abstract class GitHubWebhookHandler<T = unknown> {
  /**
   * GitHub webhook event name (from X-GitHub-Event header)
   * @example 'projects_v2_item', 'issues', 'pull_request'
   */
  abstract readonly webhookEvent: string;

  /**
   * GitHub webhook action (from action field in payload, if applicable)
   * Optional - if not set, any action is accepted
   * @example 'edited', 'opened', 'closed'
   */
  abstract readonly webhookAction?: string;

  /**
   * Webhook secret for HMAC verification
   * Should come from environment variable
   */
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  /**
   * Process the webhook payload
   * Implement your business logic here
   *
   * @param payload The typed webhook payload
   * @throws Will be caught and returned as 500 status
   */
  abstract process(payload: T): Promise<void>;

  /**
   * Handle the GitHub webhook
   * Do NOT override this method - implement process() instead
   */
  async handle(event: APIGatewayProxyEvent): Promise<LambdaResponse> {
    const headers = event.headers || {};
    const signature = headers["x-hub-signature-256"];
    const githubEvent = headers["x-github-event"];
    const deliveryId = headers["x-github-delivery"];

    const logContext = {
      deliveryId,
      webhookEvent: githubEvent,
    };

    try {
      // Validate signature
      if (!signature || !this.secret) {
        const error = "Missing signature or webhook secret";
        console.error(error, logContext);
        return this.errorResponse(error, 401);
      }

      if (!this.validateSignature(event.body || "", signature)) {
        const error = "Invalid webhook signature";
        console.error(error, logContext);
        return this.errorResponse(error, 401);
      }

      // Validate event type matches
      if (githubEvent !== this.webhookEvent) {
        const error = `Event type mismatch: expected ${this.webhookEvent}, got ${githubEvent}`;
        console.error(error, logContext);
        return this.errorResponse(error, 400);
      }

      // Parse payload
      let payload: any;
      try {
        payload = JSON.parse(event.body || "{}");
      } catch {
        const error = "Invalid JSON in webhook body";
        console.error(error, logContext);
        return this.errorResponse(error, 400);
      }

      // Validate action if specified
      if (this.webhookAction && payload.action !== this.webhookAction) {
        const error = `Action mismatch: expected ${this.webhookAction}, got ${payload.action}`;
        console.error(error, logContext);
        return this.errorResponse(error, 400);
      }

      // Call the implementation
      console.log(
        `[${this.webhookEvent}.${this.webhookAction || "*"}] Processing webhook`,
        logContext
      );
      await this.process(payload as T);
      console.log(
        `[${this.webhookEvent}.${this.webhookAction || "*"}] Successfully processed webhook`,
        logContext
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          deliveryId,
        }),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[${this.webhookEvent}] Failed to process webhook`,
        {
          ...logContext,
          error: message,
          stack: error instanceof Error ? error.stack : undefined,
        }
      );

      return this.errorResponse(message, 500);
    }
  }

  /**
   * Verify GitHub webhook signature
   * Uses HMAC SHA256 to validate request authenticity
   */
  private validateSignature(body: string, signature: string): boolean {
    try {
      const hash = createHmac("sha256", this.secret)
        .update(body)
        .digest("hex");

      const expected = `sha256=${hash}`;
      // Use timing-safe comparison to prevent timing attacks
      return this.timingSafeEqual(signature, expected);
    } catch (error) {
      console.error("Signature validation error", { error });
      return false;
    }
  }

  /**
   * Timing-safe string comparison
   * Prevents timing attacks on signature verification
   */
  private timingSafeEqual(a: string, b: string): boolean {
    const bufferA = Buffer.from(a, "utf8");
    const bufferB = Buffer.from(b, "utf8");

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < bufferA.length; i++) {
      result |= bufferA[i] ^ bufferB[i];
    }

    return result === 0;
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

/**
 * Lambda response type
 */
export interface LambdaResponse {
  statusCode: number;
  body: string;
}
