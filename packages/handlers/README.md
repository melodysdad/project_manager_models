# @project-manager/transition-handlers

Base handler classes and utilities for implementing Project Manager transition event handlers in AWS Lambda.

## Overview

This package provides:
- `TransitionHandler<T>` - Abstract base class for handling transition events
- Type-safe event handling with CloudEvents spec compliance
- Automatic error handling, validation, and logging
- Easy integration with AWS Lambda

## Installation

```bash
npm install @project-manager/transition-handlers @project-manager/models
```

## Quick Start

### 1. Extend TransitionHandler

```typescript
import { TransitionHandler } from '@project-manager/transition-handlers';
import type { ConversationStartedData } from '@project-manager/models';

export class ConversationStartedHandler
  extends TransitionHandler<ConversationStartedData>
{
  eventType = 'project_manager.conversation.started';

  async process(data: ConversationStartedData): Promise<void> {
    // Your implementation here
    console.log('Processing conversation:', data.id);
  }
}
```

### 2. Export Lambda Handler

```typescript
const handler = new ConversationStartedHandler();
export const lambdaHandler = (event: any) => handler.handle(event);
```

### 3. Deploy with CDK

```typescript
// In your CDK stack
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';

new Function(this, 'ConversationStartedHandler', {
  runtime: Runtime.NODEJS_20_X,
  handler: 'index.lambdaHandler',
  code: Code.fromAsset('dist'),
  layers: [transitionHandlersLayer], // Reference the layer
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

### LambdaResponse

Properly formatted Lambda response:

```typescript
interface LambdaResponse {
  statusCode: number;
  body: string; // JSON
}
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

Errors in `process()` are caught and automatically converted to 500 responses:

```typescript
async process(data: ConversationStartedData): Promise<void> {
  if (!data.id) {
    throw new Error('Missing conversation ID'); // → 500 response
  }
}
```

## License

Proprietary - Project Manager Team
