import { S3 } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
  const s3 = new S3();
  var bucketName = process.env.BUCKET_NAME || "";
  var fileName = event.queryStringParameters?.file || "two-mb";
  fileName = fileName + ".txt";

  const data = await s3
    .getObject({ Bucket: bucketName, Key: fileName })
    .promise();
  const fileContents = data.Body?.toString("utf-8") || "";
  const result = fileName + " " + fileContents;
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: result,
  };
};
