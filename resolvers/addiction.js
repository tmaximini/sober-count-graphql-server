require("console-pretty-print");

const AWS = require("aws-sdk");

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

  AttributesToGet: ["username", "email", "addictions"]
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

const getUserByUsername = async username => {
  const params = User.get({ username });
  const response = await docClient.get(params).promise();
  return User.parse(response);
};

const createDbUser = async ({ username, email }) => {
  console.log({ username });
  const params = User.put({ username, email });
  const response = await docClient.put(params).promise();

  console.info({ response });

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
  getUserByUsername
};
