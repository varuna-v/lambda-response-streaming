import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda, aws_lambda_nodejs } from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Bucket, BlockPublicAccess } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
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

    const functionWithoutStream = new aws_lambda_nodejs.NodejsFunction(
      this,
      "functionWithoutStream",
      {
        entry: "src/without-stream.ts",
        handler: "handler",
        runtime: aws_lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(15),
        memorySize: 512,
        ephemeralStorageSize: cdk.Size.mebibytes(512),
        environment: { BUCKET_NAME: bucket.bucketName },
      }
    );
    bucket.grantRead(functionWithoutStream);
    const withoutStreamPath = api.root.addResource("without-stream");
    withoutStreamPath.addMethod(
      "GET",
      new apigw.LambdaIntegration(functionWithoutStream)
    );

    const functionWithStream = new aws_lambda_nodejs.NodejsFunction(
      this,
      "functionWithStream",
      {
        entry: "src/with-stream.ts",
        handler: "handler",
        runtime: aws_lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(15),
        memorySize: 512,
        ephemeralStorageSize: cdk.Size.mebibytes(512),
        environment: { BUCKET_NAME: bucket.bucketName },
      }
    );
    bucket.grantRead(functionWithStream);

    const functionUrl = functionWithStream.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      invokeMode: aws_lambda.InvokeMode.RESPONSE_STREAM,
    });
    const withStreamPath = api.root.addResource("with-stream");
    withStreamPath.addMethod("GET", new apigw.HttpIntegration(functionUrl.url));
  }
}
