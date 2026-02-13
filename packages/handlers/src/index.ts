/**
 * @project-manager/transition-handlers
 *
 * Base classes and utilities for implementing event handlers.
 * - TransitionHandler<T> for CloudEvents (EventBridge)
 * - GitHubWebhookHandler<T> for GitHub webhooks (API Gateway)
 *
 * @example TransitionHandler (CloudEvents)
 * ```typescript
 * import { TransitionHandler } from '@project-manager/transition-handlers';
 * import { ConversationStartedData } from '@project-manager/models';
 *
 * export class ConversationStartedHandler extends TransitionHandler<ConversationStartedData> {
 *   eventType = 'project_manager.conversation.started';
 *
 *   async process(data: ConversationStartedData): Promise<void> {
 *     // Implementation
 *   }
 * }
 * ```
 *
 * @example GitHubWebhookHandler (GitHub webhooks)
 * ```typescript
 * import { GitHubWebhookHandler } from '@project-manager/transition-handlers';
 * import type { ProjectsV2ItemEditedPayload } from '@project-manager/transition-handlers';
 *
 * export class ProjectsV2ItemEditedHandler
 *   extends GitHubWebhookHandler<ProjectsV2ItemEditedPayload>
 * {
 *   webhookEvent = 'projects_v2_item';
 *   webhookAction = 'edited';
 *
 *   async process(payload: ProjectsV2ItemEditedPayload): Promise<void> {
 *     // Implementation
 *   }
 * }
 *
 * const handler = new ProjectsV2ItemEditedHandler(process.env.GITHUB_WEBHOOK_SECRET!);
 * export const lambdaHandler = (event) => handler.handle(event);
 * ```
 */

// CloudEvent handlers
export { TransitionHandler, type CloudEvent, type LambdaResponse } from "./baseHandler.ts";

// GitHub webhook handlers
export { GitHubWebhookHandler, type APIGatewayProxyEvent } from "./githubWebhookHandler.ts";

// GitHub webhook types
export type {
  GitHubUser,
  GitHubOrganization,
  ProjectsV2,
  ProjectsV2Item,
  ProjectsV2ItemEditedPayload,
  IssuesPayload,
  PullRequestPayload,
  PushPayload,
} from "./githubTypes.ts";
