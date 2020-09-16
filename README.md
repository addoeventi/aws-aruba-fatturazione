# Addo AWS API

The backend for a serverless Addo application.
Built with AWS Lambda and the Serverless Framework.

## Setup

### Prerequisites

- Node.js & NPM
- Yarn
- [The Serverless Framework](https://serverless.com/framework/)

### Install dependencies

```
yarn
```

or

```
npm i
```

### Running Tests

```
yarn test
```

```
npm run test
```

### Deploy

```
serverless deploy
```

## Configuration

Enter your configuration variables in `secrets.json`. Example:

```javascript
{
  "stripeSecretKey": "sk_test_or_live_1234656",
  "mongodb_connection_string": "mongodb+srv://addo:VeryStrongPassord@addomongodb.com/dbname?retryWrites=true&w=majority",
  "images": {
    "endpoint": "https://image_to_upload_on_S3_AWS.com",
    "bucket": "BucketName",
    "accessKeyId": "123456ASDFG",
    "secretAccessKey": "123456ASDFG",
    "region": "region-aws"
  }
}
```

You need:

- Your Stripe **secret key**
- Your **MongoDb connection string**
- **Endpoint** of images storage
- **Bucket name** of AWS Storage
- **AccessKeyId**
- **SecretAccessKey**
- **AWS Region**

## Thanks

**addo-aws-api** © 2020+, Addo Ticket Srl. <br>
Authored and maintained by Addo Ticket Srl with help from contributors ([list][contributors]).

> [Addo Ticket Srl](http://addochesifastasera.com) &nbsp;&middot;&nbsp;
