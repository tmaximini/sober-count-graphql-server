require("console-pretty-print");

const AWS = require("aws-sdk");
const slugify = require("slugify");
const uuidv4 = require("uuid/v4");
const bcrypt = require("bcrypt");

const { User } = require("../db");

const isLambda = !!(process.env.LAMBDA_TASK_ROOT || false);

if (isLambda) {
  AWS.config.update({
    region: process.env.AWS_REGION
  });
} else {
  require("dotenv").config();
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
  });
}

// INIT AWS
// env variables set on Lambda function in AWS console1
const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

const s3DefaultParams = {
  ACL: "public-read",
  Bucket: "sober-count-v1",
  Conditions: [
    ["content-length-range", 0, 1024000], // 1 Mb
    { acl: "public-read" }
  ]
};

const defaultParams = {
  TableName: "sober-count-users",

  AttributesToGet: [
    "username",
    "slug",
    "email",
    "since",
    "tagline",
    "claps",
    "avatarUrl"
  ]
};

const getUserByUsername = async username => {
  const params = User.get({ slug: slugify(username), sk: "User" });
  const response = await docClient.get(params).promise();
  return User.parse(response);
};

const getUserByEmail = async email => {
  const params = User.get({ email, sk: "User" });
  const response = await docClient.get(params).promise();
  return User.parse(response);
};

const createDbUser = async props => {
  console.log("createDbUser", props);
  const passwordHash = await bcrypt.hash(props.password, 8); // hash the pass
  console.log("passwordHash", passwordHash);
  delete props.password; // don't save it in clear text

  const params = User.put({
    ...props,
    id: uuidv4(),
    type: "User",
    slug: slugify(props.username),
    passwordHash,
    claps: 0,
    createdAt: new Date()
  });
  console.info("creating user with params: ", params);
  const response = await docClient.put(params).promise();

  return User.parse(response);
};

const addClaps = async ({ username, claps }) => {
  const dbUser = await getUserByUsername(username);

  const params = User.put({
    ...dbUser,
    type: "User",
    claps: dbUser.claps + claps
  });
  const response = await docClient.put(params).promise();

  return User.parse(response);
};

const getUsers = async () => {
  const response = await docClient.scan({ ...defaultParams }).promise();
  return User.parse(response);
};

const handleFileUpload = async file => {
  const { createReadStream, filename } = await file;

  const key = uuidv4();

  return new Promise((resolve, reject) => {
    s3.upload(
      {
        ...s3DefaultParams,
        Body: createReadStream(),
        Key: `${key}/${filename}`
      },
      (err, data) => {
        if (err) {
          console.log("error uploading...", err);
          reject(err);
        } else {
          console.log("successfully uploaded file...", data);
          resolve(data);
        }
      }
    );
  });
};

module.exports = {
  getUsers,
  createDbUser,
  getUserByUsername,
  getUserByEmail,
  addClaps,
  handleFileUpload
};
