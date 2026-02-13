/**
 * Example CDK Stack for GitHub Webhook Handler
 *
 * Sets up API Gateway to receive GitHub webhooks with Lambda processing.
 * GitHub sends webhooks as POST requests to the API endpoint.
 */

import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export class GitHubWebhookStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create the Lambda layer with handlers package
    const handlersLayer = new lambda.LayerVersion(
      this,
      "TransitionHandlersLayer",
      {
        code: lambda.Code.fromAsset("packages/handlers/dist"),
        compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
        description: "GitHub webhook and event handler utilities",
      }
    );

    // 2. Retrieve GitHub webhook secret from Secrets Manager
    const webhookSecret = secretsmanager.Secret.fromSecretPartialArn(
      this,
      "GitHubWebhookSecret",
      `arn:aws:secretsmanager:${this.region}:${this.account}:secret:github-webhook-secret`
    );

    // 3. Create DynamoDB tables
    const webhooksTable = new dynamodb.Table(this, "WebhooksTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For demo!
    });

    const projectsTable = new dynamodb.Table(this, "ProjectsTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const activityTable = new dynamodb.Table(this, "ActivityTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 4. Create Lambda function for GitHub webhook
    const projectsV2ItemEditedHandler = new lambda.Function(
      this,
      "ProjectsV2ItemEditedHandler",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.lambdaHandler",
        code: lambda.Code.fromAsset(
          "dist/handlers/github-projects-v2-item-edited"
        ),
        layers: [handlersLayer],
        environment: {
          // GitHub webhook secret from Secrets Manager
          GITHUB_WEBHOOK_SECRET: webhookSecret
            .secretValue
            .unsafeUnwrap(), // In production, use secret reference
          WEBHOOKS_TABLE: webhooksTable.tableName,
          PROJECTS_TABLE: projectsTable.tableName,
          ACTIVITY_TABLE: activityTable.tableName,
        },
        timeout: cdk.Duration.seconds(30),
        memorySize: 512,
      }
    );

    // 5. Grant Lambda permissions to write to DynamoDB
    webhooksTable.grantWriteData(projectsV2ItemEditedHandler);
    projectsTable.grantWriteData(projectsV2ItemEditedHandler);
    activityTable.grantWriteData(projectsV2ItemEditedHandler);

    // 6. Create API Gateway for webhook endpoint
    const api = new apigateway.RestApi(this, "GitHubWebhookAPI", {
      restApiName: "GitHub Webhook API",
      description: "Receives GitHub webhook events",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // 7. Create webhook endpoint
    const webhooksResource = api.root.addResource("webhooks");
    const projectsResource = webhooksResource.addResource("projects-v2-item");

    projectsResource.addMethod("POST", new apigateway.LambdaIntegration(projectsV2ItemEditedHandler));

    // 8. Outputs for GitHub webhook configuration
    new cdk.CfnOutput(this, "WebhookURL", {
      value: projectsResource.getResource()!.url,
      description: "Use this URL in GitHub webhook settings",
    });

    new cdk.CfnOutput(this, "WebhooksTableName", {
      value: webhooksTable.tableName,
    });

    new cdk.CfnOutput(this, "ProjectsTableName", {
      value: projectsTable.tableName,
    });

    new cdk.CfnOutput(this, "ActivityTableName", {
      value: activityTable.tableName,
    });
  }
}

/**
 * GitHub Webhook Configuration
 *
 * In your GitHub organization/repository settings:
 *
 * 1. Go to Settings → Webhooks → Add webhook
 * 2. Payload URL: https://your-api-gateway-url/webhooks/projects-v2-item
 * 3. Content type: application/json
 * 4. Secret: Set to your webhook secret
 * 5. Events: Select "Projects v2 item"
 * 6. Active: Checked
 *
 * The handler will verify the signature using the secret you set.
 * GitHub sends it in X-Hub-Signature-256 header.
 */
