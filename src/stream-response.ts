import { S3 } from "aws-sdk";
import { APIGatewayProxyEventV2 } from "aws-lambda";

import { ResponseStream } from "./utils/ResponseStream";

// @ts-ignore - awslambda is a global
export const handler = awslambda.streamifyResponse(requestHandler);

async function requestHandler(
  event: APIGatewayProxyEventV2,
  responseStream: ResponseStream
): Promise<void> {
  const s3 = new S3();
  var bucketName = process.env.BUCKET_NAME || "";
  var fileName = event.queryStringParameters?.file || "two-mb";

  fileName = fileName + ".txt";

  const data = await s3
    .getObject({ Bucket: bucketName, Key: fileName })
    .promise();
  const fileContents = data.Body?.toString("utf-8") || "";

  const result = fileName + " " + fileContents;
  responseStream.setContentType("text/plain");
  responseStream.write(result);
  responseStream.end();
}
