/**
 * @project-manager/transition-handlers
 *
 * Base classes and utilities for implementing transition event handlers.
 * Import from this package in your Lambda functions.
 *
 * @example
 * ```typescript
 * import { TransitionHandler, LambdaResponse } from '@project-manager/transition-handlers';
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
 */

export { TransitionHandler, type CloudEvent, type LambdaResponse } from "./baseHandler.ts";

// When used with @project-manager/models layer, also import:
// import type { ConversationStartedData, MessageAddedData, ... } from '@project-manager/models';
// import { publishConversationStarted, validateCloudEvent } from '@project-manager/models';
