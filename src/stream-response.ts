import { S3 } from "aws-sdk";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { Writable } from "stream";

// @ts-ignore - awslambda is a global
export const handler = awslambda.streamifyResponse(requestHandler);

export type ResponseStream = Writable & {
  setContentType(type: string): void;
};

async function requestHandler(
  event: APIGatewayProxyEventV2,
  responseStream: ResponseStream
): Promise<void> {
  const s3 = new S3();
  var bucketName = process.env.BUCKET_NAME || "";
  var fileName = event.queryStringParameters?.file || "two-mb";

  fileName = fileName + ".txt";

  const dataStream = await s3
    .getObject({ Bucket: bucketName, Key: fileName })
    .createReadStream();

  responseStream.setContentType("text/plain");
  responseStream.write("file read: " + fileName + "\n");

  dataStream.on("data", (chunk) => {
    responseStream.write(chunk.toString("utf-8"));
  });

  dataStream.on("end", () => {
    responseStream.end();
  });

  dataStream.on("error", (err) => {
    responseStream.write("Error reading file");
    responseStream.end();
  });
}
