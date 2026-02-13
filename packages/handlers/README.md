# @project-manager/transition-handlers

Base handler classes and utilities for implementing event handlers in AWS Lambda.

## Overview

This package provides:
- `TransitionHandler<T>` - Abstract base class for handling CloudEvents (EventBridge)
- `GitHubWebhookHandler<T>` - Abstract base class for handling GitHub webhooks (API Gateway)
- Type-safe event handling with automatic validation
- HMAC SHA256 signature verification for GitHub webhooks
- Automatic error handling, validation, and logging
- Easy integration with AWS Lambda

## Installation

```bash
npm install @project-manager/transition-handlers @project-manager/models
```

## Quick Start

### CloudEvents (EventBridge)

```typescript
import { TransitionHandler } from '@project-manager/transition-handlers';
import type { ConversationStartedData } from '@project-manager/models';

export class ConversationStartedHandler
  extends TransitionHandler<ConversationStartedData>
{
  eventType = 'project_manager.conversation.started';

  async process(data: ConversationStartedData): Promise<void> {
    // Your implementation
    await saveConversation(data);
  }
}

const handler = new ConversationStartedHandler();
export const lambdaHandler = (event: any) => handler.handle(event);
```

### GitHub Webhooks

```typescript
import { GitHubWebhookHandler } from '@project-manager/transition-handlers';
import type { ProjectsV2ItemEditedPayload } from '@project-manager/transition-handlers';

export class ProjectsV2ItemEditedHandler
  extends GitHubWebhookHandler<ProjectsV2ItemEditedPayload>
{
  webhookEvent = 'projects_v2_item';
  webhookAction = 'edited';

  async process(payload: ProjectsV2ItemEditedPayload): Promise<void> {
    // Your implementation
    await updateProjectMetadata(payload);
  }
}

// Handler needs webhook secret for signature verification
const handler = new ProjectsV2ItemEditedHandler(
  process.env.GITHUB_WEBHOOK_SECRET!
);
export const lambdaHandler = (event: any) => handler.handle(event);
```

### Deploy with CDK

```typescript
// EventBridge handler
new Function(this, 'ConversationStartedHandler', {
  runtime: Runtime.NODEJS_20_X,
  handler: 'index.lambdaHandler',
  code: Code.fromAsset('dist'),
  layers: [handlersLayer],
});

// GitHub webhook handler (via API Gateway)
new Function(this, 'GitHubWebhookHandler', {
  runtime: Runtime.NODEJS_20_X,
  handler: 'index.lambdaHandler',
  code: Code.fromAsset('dist'),
  layers: [handlersLayer],
  environment: {
    GITHUB_WEBHOOK_SECRET: webhookSecret.secretValue,
  },
});
```

## What's Included

### TransitionHandler<T>

Abstract base class for transition event handlers.

**Methods:**
- `handle(event)` - Processes CloudEvent, validates type, calls your process()
- `process(data)` - Override this with your business logic
- `validate(schema, data)` - Helper to validate data with Zod schemas

**Features:**
- Type-safe event handling
- Automatic error handling (500 response)
- Event type validation (400 on mismatch)
- Structured logging with event context
- CloudEvents spec compliance

### CloudEvent<T>

CloudEvents 1.0 envelope type:

```typescript
interface CloudEvent<T> {
  specversion: "1.0";
  type: string;
  source: string;
  id: string;
  time: string;
  datacontenttype?: "application/json";
  subject?: string;
  data?: T;
}
```

### GitHubWebhookHandler<T>

Abstract base class for GitHub webhook event handlers.

**Key Features:**
- HMAC SHA256 signature verification (prevents spoofing)
- Webhook event type validation (from X-GitHub-Event header)
- Optional action filtering (e.g., "edited" vs "created")
- Timing-safe signature comparison (prevents timing attacks)
- Automatic error handling (200/400/401/500 responses)
- Request context logging

**Properties:**
- `webhookEvent` - GitHub event name (e.g., "projects_v2_item", "issues")
- `webhookAction` - Optional action filter (e.g., "edited")

**Example:**
```typescript
export class IssueOpenedHandler extends GitHubWebhookHandler<IssuesPayload> {
  webhookEvent = 'issues';
  webhookAction = 'opened';

  async process(payload: IssuesPayload): Promise<void> {
    // Payload is already verified and type-safe
    await createIssueRecord(payload.issue);
  }
}
```

### LambdaResponse

Properly formatted Lambda response:

```typescript
interface LambdaResponse {
  statusCode: number;
  body: string; // JSON
}
```

### GitHub Webhook Types

Pre-defined types for common GitHub webhook events:

```typescript
import type {
  ProjectsV2ItemEditedPayload,
  IssuesPayload,
  PullRequestPayload,
  PushPayload,
  GitHubUser,
  GitHubOrganization,
} from '@project-manager/transition-handlers';
```

## Examples

See `examples/` for full implementations:
- `conversationStarted.example.ts` - Handle conversation creation
- (Add more as you build handlers)

## Integration with Models Package

When used with `@project-manager/models`, you get:

```typescript
// Event types
import type {
  ConversationStartedData,
  MessageAddedData,
  ConversationCheckpointCreatedData,
} from '@project-manager/models';

// Validation schemas
import {
  ConversationStartedSchema,
  validateCloudEvent,
} from '@project-manager/models';

// Publishers for downstream events
import {
  publishToEventBridge,
  publishConversationStarted,
} from '@project-manager/models';
```

## Lambda Response Format

Your handlers automatically return:

**Success (200):**
```json
{
  "statusCode": 200,
  "body": "{\"success\": true, \"eventId\": \"uuid-here\"}"
}
```

**Error (500):**
```json
{
  "statusCode": 500,
  "body": "{\"success\": false, \"error\": \"message\"}"
}
```

**Validation Error (400):**
```json
{
  "statusCode": 400,
  "body": "{\"success\": false, \"error\": \"Event type mismatch\"}"
}
```

## Best Practices

1. **Keep `process()` focused** - Only implement your specific business logic
2. **Use Zod schemas** - Validate complex data structures
3. **Publish downstream events** - Coordinate with other services via EventBridge
4. **Log appropriately** - The base handler logs automatically, add domain-specific logs as needed
5. **Handle errors explicitly** - Let exceptions bubble up, the handler catches them

## Logging

The base handler provides structured logging:

```
[project_manager.conversation.started] Processing event {
  eventId: "...",
  eventType: "...",
  source: "..."
}
```

Add your own logs in `process()`:

```typescript
async process(data: ConversationStartedData): Promise<void> {
  console.log(`Creating conversation ${data.id}`);
  // ... your code ...
  console.log(`✓ Conversation created`);
}
```

## Error Handling

Errors in `process()` are caught and automatically converted to appropriate HTTP responses:

```typescript
async process(data: ConversationStartedData): Promise<void> {
  if (!data.id) {
    throw new Error('Missing conversation ID'); // → 500 response
  }
}
```

## GitHub Webhook Security

### Signature Verification

GitHub webhooks include HMAC SHA256 signatures for verification:

```
X-Hub-Signature-256: sha256=<calculated_hash>
```

The `GitHubWebhookHandler` automatically:
1. Extracts signature from `X-Hub-Signature-256` header
2. Recalculates HMAC SHA256 using webhook secret
3. Uses timing-safe comparison to prevent timing attacks
4. Returns 401 if signature is invalid

**Important:** Always configure the webhook secret in GitHub and pass it to the handler:

```typescript
const handler = new MyWebhookHandler(process.env.GITHUB_WEBHOOK_SECRET!);
```

### Response Codes

- **200**: Webhook processed successfully
- **400**: Event type or action mismatch
- **401**: Invalid or missing signature
- **500**: Error during processing

## Testing GitHub Webhooks Locally

Use GitHub's webhook delivery history to resend payloads, or test with curl:

```bash
# Get the webhook secret
SECRET="your-webhook-secret"

# Create test payload
PAYLOAD='{"action": "edited", "projects_v2": {...}}'

# Calculate signature
SIGNATURE="sha256=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -r | cut -d' ' -f1)"

# Send to local API
curl -X POST http://localhost:3000/webhook \
  -H "X-GitHub-Event: projects_v2_item" \
  -H "X-Hub-Signature-256: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"
```

## License

Proprietary - Project Manager Team
