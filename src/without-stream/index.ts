import { S3 } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";

const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  var bucketName = process.env.BUCKET_NAME || "";
  var key = event.pathParameters?.key || "two-mb.txt";
  const data = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
  const fileContents = data.Body?.toString("utf-8") || "";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: fileContents,
  };
};
