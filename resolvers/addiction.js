require("console-pretty-print");

const AWS = require("aws-sdk");
const slugify = require("slugify");
// const uuidv4 = require("uuid/v4");

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

const { transformArticle } = require("../transformers/article");

// INIT AWS
// env variables set on Lambda function in AWS console

const docClient = new AWS.DynamoDB.DocumentClient();

const defaultParams = {
  TableName: "sober-count-users",

  AttributesToGet: ["username", "slug", "email", "since", "tagline", "claps"]
};

const getByParams = params =>
  new Promise((resolve, reject) => {
    docClient.get(params, (err, data) => {
      if (err) {
        console.log("error getting from dynamodb", err);
        reject(err);
      } else {
        const result = transformArticle(data.Item);
        console.log("yay got data from dynamodb", result);
        resolve(result);
      }
    });
  });

const queryByParams = params =>
  new Promise((resolve, reject) => {
    docClient.query(params, (err, data) => {
      if (err) {
        console.log("error getting from dynamodb", err);
        reject(err);
      } else {
        if (data.Items && data.Items.length > 0) {
          const result = transformArticle(data.Items[0]);
          console.log("yay got data from dynamodb", result);
          resolve(result);
        } else {
          reject("no Item Found");
        }
      }
    });
  });

const getAddictionById = async id => {
  const params = {
    ...defaultParams,
    Key: {
      id
    }
  };

  return getByParams(params);
};

const getUserBySlug = async username => {
  const params = User.get({ slug: slugify(username), sk: "User" });
  const response = await docClient.get(params).promise();
  return User.parse(response);
};

const createDbUser = async props => {
  const params = User.put({
    ...props,
    claps: 0,
    slug: slugify(props.username),
    type: "User",
    createdAt: new Date()
  });
  const response = await docClient.put(params).promise();

  return User.parse(response);
};

const addClaps = async ({ username, claps }) => {
  const dbUser = await getUserBySlug(username);

  console.info({ username, claps });

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

module.exports = {
  getAddictionById,
  getUsers,
  createDbUser,
  getUserBySlug,
  addClaps
};
