# Lambda Response Streaming with API Gateway

Example of how Lambda response streaming can be used with API Gateway to return larger data sets.

## Deploying

cdk deploy --profile=<profile-name>

## Ongoing notes from AWS docs

- Lambda response size limit is 6mb, which is fine but also not suitable for the biggest queries.
- API Gateway has a response payload limit of 10 MB
- Response stream 20 MB
- The first 6MB of your function’s response payload has uncapped bandwidth. After this initial burst, Lambda streams your response at a maximum rate of 2MBps. If your function responses never exceed 6MB, then this bandwidth limit never applies.
- Processed Bytes $0.008000 per GB
