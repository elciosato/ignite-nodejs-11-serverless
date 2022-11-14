import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../../utils/dynamodbClient";

export const main: APIGatewayProxyHandler = async (event) => {
  const { userid } = event.pathParameters;

  const res = await document
    .query({
      TableName: "users_todos",
      KeyConditionExpression: "user_id = :userid",
      ExpressionAttributeValues: {
        ":userid": userid,
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: res.Items,
    }),
  };
};
