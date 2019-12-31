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
  partitionKey: "username",

  // Define schema
  schema: {
    pk: { type: "string", alias: "id" },
    sk: { type: "string", hidden: true },
    username: { type: "string" },
    email: { type: "string" },
    addictions: { type: "list" }
  }
});

const seed = () => {
  const items = [
    {
      username: "tmaximini",
      email: "tmaximini@gmail.com",
      addictions: [
        {
          name: "alcohol",
          since: "1577811214299",
          status: "running"
        },
        {
          name: "porn",
          since: "1577811214299",
          status: "running"
        },
        {
          name: "nicotine",
          since: "1577811214299",
          status: "running"
        },
        {
          name: "drugs",
          since: "1577811214299",
          status: "running"
        },
        {
          name: "gaming",
          since: "1577811214299",
          status: "running"
        }
      ]
    }
  ];
  items.forEach(async item => {
    // Use the 'put' method of MyModel to generate parameters
    let params = User.put(item);
    // Pass the parameters to the DocumentClient's `put` method
    let result = await DocumentClient.put(params).promise();
    console.info({ result });
  });
};

module.exports = {
  User,
  seed
};
