import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda, aws_lambda_nodejs } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import * as apigw from "aws-cdk-lib/aws-apigateway";

export class LambdaResponseStreamingExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    cdk.Tags.of(this).add("project", "lambda-response-streaming");

    const bucketName = StringParameter.fromStringParameterName(
      this,
      "LambdaResponseStreamingSampleFilesBucketName",
      "/lambda-response-streaming/sample-files-bucket"
    );

    const functionWithoutStream = new aws_lambda_nodejs.NodejsFunction(
      this,
      "functionWithoutStream",
      {
        entry: "src/without-stream.ts",
        handler: "handler",
        runtime: aws_lambda.Runtime.NODEJS_20_X,
        environment: { BUCKET_NAME: bucketName.stringValue },
      }
    );

    const api = new apigw.RestApi(this, "LambdaResponseStreamingExampleApi", {
      description: "Lambda Response Streaming Example API",
    });
    const withoutStreamPath = api.root.addResource("without-stream");
    withoutStreamPath.addMethod(
      "GET",
      new apigw.LambdaIntegration(functionWithoutStream)
    );
  }
}
