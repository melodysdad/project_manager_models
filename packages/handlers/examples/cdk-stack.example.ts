/**
 * Example CDK Stack
 *
 * Shows how to set up a Lambda function with the transition handlers layer.
 * Use this as a template for your own stacks.
 */

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class TransitionHandlersStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create the Lambda layer with handlers package
    const handlersLayer = new lambda.LayerVersion(this, 'TransitionHandlersLayer', {
      code: lambda.Code.fromAsset('packages/handlers/dist'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Transition event handler base classes and utilities',
    });

    // 2. Create DynamoDB table for conversations
    const conversationsTable = new dynamodb.Table(this, 'ConversationsTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For demo only!
    });

    // 3. Create Lambda function for ConversationStarted event
    const conversationStartedHandler = new lambda.Function(
      this,
      'ConversationStartedHandler',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'index.lambdaHandler',
        code: lambda.Code.fromAsset('dist/handlers/conversation-started'),
        layers: [handlersLayer],
        environment: {
          CONVERSATIONS_TABLE: conversationsTable.tableName,
        },
      }
    );

    // 4. Grant the Lambda permission to write to DynamoDB
    conversationsTable.grantWriteData(conversationStartedHandler);

    // 5. Create EventBridge rule to trigger Lambda on ConversationStarted events
    const rule = new events.Rule(this, 'ConversationStartedRule', {
      eventPattern: {
        source: ['project_manager'],
        'detail-type': ['ConversationStarted'],
      },
    });

    rule.addTarget(new targets.LambdaFunction(conversationStartedHandler));

    // Outputs
    new cdk.CfnOutput(this, 'ConversationsTableName', {
      value: conversationsTable.tableName,
    });

    new cdk.CfnOutput(this, 'ConversationStartedHandlerArn', {
      value: conversationStartedHandler.functionArn,
    });
  }
}

/**
 * Usage:
 *
 * const app = new cdk.App();
 * new TransitionHandlersStack(app, 'TransitionHandlersStack');
 */
