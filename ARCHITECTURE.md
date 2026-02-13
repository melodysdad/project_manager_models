# Project Manager Models - Architecture

## Overview

This monorepo provides **code generation** and **Lambda layer infrastructure** for building event-driven services in the Project Manager system.

## Project Structure

```
.
├── contracts/                    # Source of truth for domain
│   ├── PRIMITIVES.md            # Data model definitions
│   └── TRANSITIONS.md           # State transition/event definitions
│
├── src/                         # Code generation tools
│   ├── parser.ts                # PRIMITIVES.md parser
│   ├── transitionsParser.ts     # TRANSITIONS.md parser
│   ├── generate*.ts             # Code generators
│   └── generated/               # Generated code (from contracts)
│       ├── types.ts             # Interfaces for primitives
│       ├── schemas.ts           # Zod validators
│       ├── cloudEvents.ts       # CloudEvent types + helpers
│       ├── lambdaHandlers.ts    # Handler stubs (templates)
│       └── eventBridgePublishers.ts
│
└── packages/handlers/           # Lambda layer package
    ├── src/
    │   ├── baseHandler.ts       # TransitionHandler<T> abstract class
    │   └── index.ts             # Public exports
    ├── examples/                # Implementation examples
    │   ├── conversationStarted.example.ts
    │   └── cdk-stack.example.ts
    └── package.json             # Published to npm

```

## Development Workflow

### 1. Define Domain in Contracts

**Update `contracts/PRIMITIVES.md`** with your data models:
```markdown
### **Primitive: `Conversation`**

...fields and descriptions...
```

**Update `contracts/TRANSITIONS.md`** with state transitions:
```markdown
### **Transition: `ConversationStarted`**

#### **Fact Emitted**

* `project_manager.conversation.started`
  * id
  * actor_ids
  * created_at
```

### 2. Generate Code

```bash
npm run generate
```

This creates:
- `src/generated/types.ts` - TypeScript interfaces
- `src/generated/schemas.ts` - Zod validators
- `src/generated/cloudEvents.ts` - CloudEvent helpers
- `src/generated/lambdaHandlers.ts` - Handler stubs
- `src/generated/eventBridgePublishers.ts` - EventBridge routing

### 3. Build & Publish Lambda Layer

```bash
cd packages/handlers
npm run build
npm publish  # or use AWS CDK to publish as layer
```

### 4. Agent Implements Handlers

Agent creates Lambda function using template:

```typescript
import { TransitionHandler } from '@project-manager/transition-handlers';
import type { ConversationStartedData } from '@project-manager/models';

export class ConversationStartedHandler
  extends TransitionHandler<ConversationStartedData>
{
  eventType = 'project_manager.conversation.started';

  async process(data: ConversationStartedData): Promise<void> {
    // Implementation - DynamoDB, EventBridge, business logic
    await saveConversation(data);
    await publishEvent(data);
  }
}
```

### 5. Deploy with CDK

```typescript
const layer = new lambda.LayerVersion(stack, 'HandlersLayer', {
  code: lambda.Code.fromAsset('packages/handlers/dist'),
});

new lambda.Function(stack, 'ConversationStarted', {
  handler: 'index.lambdaHandler',
  code: lambda.Code.fromAsset('handlers/conversation-started/dist'),
  layers: [layer],
});
```

## Generated Artifacts

### `cloudEvents.ts`

CloudEvents 1.0 specification compliance:

```typescript
interface CloudEvent<T> {
  specversion: "1.0";
  type: string;          // "project_manager.conversation.started"
  source: string;
  id: string;           // UUID
  time: string;         // ISO timestamp
  data?: T;
}

// Helper functions
createCloudEvent(type, source, data)
validateCloudEvent(event)
createConversationStartedEvent(data)
```

### `lambdaHandlers.ts`

Handler function stubs with TODOs:

```typescript
export async function handleConversationStarted(
  event: CloudEvent<EventPayload>
): Promise<{ statusCode: number; body: string }>
```

**Purpose:** Template showing expected structure - not meant to be used directly.

### `eventBridgePublishers.ts`

Event routing to SQS queues via EventBridge:

```typescript
type DetailType = "ConversationStarted" | "MessageAdded" | ...;

publishToEventBridge(event)           // Base publisher
publishConversationStarted(cloudEvent) // Typed publishers
```

### `types.ts` & `schemas.ts`

Data model definitions from PRIMITIVES.md:

```typescript
// types.ts
interface Conversation {
  id: string;
  actor_ids: string[];
  title: string;
  created_at: string;
}

// schemas.ts
const ConversationSchema = z.object({...});
```

## Lambda Layer (@project-manager/transition-handlers)

Provides the base `TransitionHandler<T>` class:

```typescript
export abstract class TransitionHandler<T> {
  abstract eventType: string;
  abstract process(data: T): Promise<void>;

  async handle(event: CloudEvent<T>): Promise<LambdaResponse> {
    // Validation ✓
    // Error handling ✓
    // Logging ✓
    // Calls your process() implementation
  }
}
```

**What agents implement:**
```typescript
export class MyHandler extends TransitionHandler<MyData> {
  eventType = 'project_manager.my.event';

  async process(data: MyData): Promise<void> {
    // Your code here
  }
}
```

## Event Flow

```
CloudEvent arrives
    ↓
Lambda invoked with event
    ↓
TransitionHandler.handle() validates + logs
    ↓
Your handler.process() runs business logic
    ↓
Returns 200 or 500
    ↓
EventBridge routes to downstream consumers
```

## Development Tips

### Regenerate on Contract Changes

```bash
# After updating contracts/
npm run generate

# Commit the generated code
git add src/generated/
git commit -m "Update generated code from contracts"
```

### Publish Updated Layer

```bash
cd packages/handlers
npm version patch
npm run build
npm publish

# Update CDK stacks to reference new version
```

### Test Handler Locally

```typescript
import { ConversationStartedHandler } from './handlers';

const handler = new ConversationStartedHandler();
const response = await handler.handle({
  specversion: "1.0",
  type: "project_manager.conversation.started",
  source: "test",
  id: "test-id",
  time: new Date().toISOString(),
  data: { /* test data */ },
});
```

## Dependencies

- **Zod** - Runtime validation
- **AWS SDK v3** - For EventBridge, DynamoDB, etc. (in handlers)
- **aws-cdk-lib** - Infrastructure as code (in CDK stacks)

## Publishing & Deployment

### Publish Handler Layer

```bash
cd packages/handlers
npm run build
npm publish --access=public  # or private
```

### Reference in CDK

```typescript
const handlersLayer = lambda.LayerVersion.fromLayerVersionArn(
  this,
  'HandlersLayer',
  'arn:aws:lambda:region:account:layer:transition-handlers:1'
);
```

### Or Build Locally

```typescript
const handlersLayer = new lambda.LayerVersion(this, 'HandlersLayer', {
  code: lambda.Code.fromAsset('packages/handlers/dist'),
  compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
});
```

## Next Steps

1. ✅ Define PRIMITIVES.md (data models)
2. ✅ Define TRANSITIONS.md (state events)
3. ✅ Generate code with `npm run generate`
4. ✅ Build & publish handler layer
5. 🚀 Create Lambda template repos with layer reference
6. 🚀 Agents implement handlers using template
7. 🚀 Deploy via CDK

## Questions?

See examples in `packages/handlers/examples/` for complete implementations.
