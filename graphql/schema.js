const { gql } = require("apollo-server-lambda");

const {
  getUsers,
  getUserBySlug,
  createDbUser,
  addClaps,
  handleFileUpload
} = require("../resolvers/user");

const typeDefs = gql`
  type S3Object {
    ETag: String
    Location: String!
    Key: String!
    Bucket: String!
  }

  type Query {
    user(name: String!): User
    users: [User]
  }

  type Mutation {
    createUser(
      username: String!
      email: String!
      tagline: String
      since: String!
      avatarUrl: String
    ): User!

    addClaps(username: String!, claps: Int!): User!
    uploadFile(file: Upload!): S3Object
  }

  type User {
    slug: String!
    username: String!
    email: String!
    since: String!
    # passwordHash: String
    createdAt: Int!
    claps: Int!
    tagline: String
    whyStatement: String
    avatarUrl: String
  }
`;

const resolvers = {
  Query: {
    user(obj, args, context, info) {
      return getUserBySlug(args.name);
    },
    users(obj, args, context, info) {
      return getUsers();
    }
  },
  Mutation: {
    createUser(parent, args) {
      console.log({ args });
      return createDbUser({ ...args });
    },
    addClaps(parent, args) {
      return addClaps({ ...args });
    },
    uploadFile: async (parent, { file }) => {
      const response = await handleFileUpload(file);
      console.info({ response });

      return response;
    }
  }
};

const mocks = {};

module.exports = {
  typeDefs,
  resolvers,
  mocks,
  mockEntireSchema: false,
  context: ({ event, context }) => ({
    headers: event.headers,
    functionName: context.functionName,
    event,
    context
  })
};
