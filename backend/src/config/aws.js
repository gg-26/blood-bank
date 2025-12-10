require('dotenv').config();

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

const s3Config = {
  bucketName: process.env.S3_BUCKET_NAME || 'blood-bank-static-assets'
};

module.exports = {
  awsConfig,
  s3Config
};

