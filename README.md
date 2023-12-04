## GroupHints
Lambda function that provides hints to OpenAI for categorization.

### File Breakdown:

`index.mjs` - the NodeJs code that is provided to the Lambda function

### Updating Lambda Function:

1. Pull this repo, make changes, test, commit
2. Run `zip -r group-hints-lambda.zip .` per https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html
3. Upload zip to `groupHints` Lambda function on console

Note: `node_modules` and the `.zip` file are listed in `.gitignore`
