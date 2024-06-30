import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda, aws_lambda_nodejs } from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Bucket, BlockPublicAccess } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
export class LambdaResponseStreamingExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    cdk.Tags.of(this).add("project", "lambda-response-streaming");

    const bucket = new Bucket(this, "lambdaresponsestreamsamplefiles", {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    new BucketDeployment(this, "SampleFiles", {
      sources: [Source.asset("sample_files")],
      destinationBucket: bucket,
    });

    const api = new apigw.RestApi(this, "LambdaResponseStreamingExampleApi", {
      description: "Lambda Response Streaming Example API",
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
    });

    const functionBufferResponse = new aws_lambda_nodejs.NodejsFunction(
      this,
      "functionBufferResponse",
      {
        entry: "src/buffer-response.ts",
        handler: "handler",
        runtime: aws_lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(15),
        memorySize: 512,
        ephemeralStorageSize: cdk.Size.mebibytes(512),
        environment: { BUCKET_NAME: bucket.bucketName },
      }
    );
    bucket.grantRead(functionBufferResponse);
    const bufferResponsePath = api.root.addResource("buffer-response");
    bufferResponsePath.addMethod(
      "GET",
      new apigw.LambdaIntegration(functionBufferResponse)
    );

    const functionStreamResponse = new aws_lambda_nodejs.NodejsFunction(
      this,
      "functionStreamResponse",
      {
        entry: "src/stream-response.ts",
        handler: "handler",
        runtime: aws_lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(15),
        memorySize: 512,
        ephemeralStorageSize: cdk.Size.mebibytes(512),
        environment: { BUCKET_NAME: bucket.bucketName },
      }
    );
    bucket.grantRead(functionStreamResponse);

    const functionUrl = functionStreamResponse.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      invokeMode: aws_lambda.InvokeMode.RESPONSE_STREAM,
    });
    const StreamResponsePath = api.root.addResource("stream-response");
    StreamResponsePath.addMethod(
      "GET",
      new apigw.HttpIntegration(functionUrl.url)
    );
  }
}
