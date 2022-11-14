import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "ignite-nodejs-11-serverless",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-dynamodb-local",
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["dynamodb:*"],
            Resource: ["*"],
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: {
    createTodo: {
      handler: "src/functions/createTodo/handler.main",
      events: [
        {
          http: {
            path: "todos/{userid}",
            method: "post",
            cors: true,
          },
        },
      ],
    },
    listTodo: {
      handler: "src/functions/listTodo/handler.main",
      events: [
        {
          http: {
            path: "todos/{userid}",
            method: "get",
            cors: true,
          },
        },
      ],
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    dynamodb: {
      stages: ["dev", "local"],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      },
    },
  },
  resources: {
    Resources: {
      dbCertificateUsers: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "users_todos",
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: "user_id",
              AttributeType: "S",
            },
            {
              AttributeName: "title",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "user_id",
              KeyType: "HASH",
            },
            {
              AttributeName: "title",
              KeyType: "RANGE",
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
