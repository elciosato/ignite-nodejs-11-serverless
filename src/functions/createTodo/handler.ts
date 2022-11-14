import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../../utils/dynamodbClient";
import { v4 as uuidV4 } from "uuid";

interface ICreateTodo {
  title: string;
  deadline: string;
}

interface IUserTodo {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  deadline: string;
}

export const main: APIGatewayProxyHandler = async (event) => {
  const { title, deadline } = JSON.parse(event.body) as ICreateTodo;
  const { userid } = event.pathParameters;

  const res = await document
    .query({
      TableName: "users_todos",
      KeyConditionExpression: "user_id = :userid and title = :title",
      ExpressionAttributeValues: {
        ":userid": userid,
        ":title": title,
      },
    })
    .promise();

  const newUserTodo: IUserTodo = {
    id: uuidV4(),
    user_id: userid,
    title,
    done: false,
    deadline: new Date(deadline).toISOString(),
  };

  if (!res.Items[0]) {
    await document
      .put({ TableName: "users_todos", Item: newUserTodo })
      .promise();
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Todo has been created successfully",
      data: newUserTodo,
    }),
  };
};
