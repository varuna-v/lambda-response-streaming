import { S3 } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";

const s3 = new S3();
const bucketName = "your-bucket-name";
const key = "your-file-key";

export const handler: APIGatewayProxyHandler = async (event) => {
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
