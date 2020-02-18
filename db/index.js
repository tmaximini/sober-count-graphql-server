// Require AWS SDK and instantiate DocumentClient
const DynamoDB = require("aws-sdk/clients/dynamodb");
const DocumentClient = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION
});
const { Model } = require("dynamodb-toolbox");

const User = new Model("User", {
  // Specify table name
  table: "sober-count-users",

  // Define partition and sort keys
  partitionKey: "pk",
  sortKey: "sk",

  // Define schema
  schema: {
    pk: { type: "string", alias: "slug" },
    sk: { type: "string", hidden: true, alias: "type" },
    passwordHash: { type: "string" },
    email: { type: "string" },
    username: { type: "string" },
    addictions: { type: "list" },
    claps: { type: "number" },
    since: { type: "string" },
    tagline: { type: "string" },
    createdAt: { type: "string" },
    avatarUrl: { type: "string" }
  }
});

module.exports = {
  User
};
