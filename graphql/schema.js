const { gql } = require("apollo-server-lambda");

const {
  getUsers,
  getUserBySlug,
  createDbUser,
  addClaps
} = require("../resolvers/addiction");

const typeDefs = gql`
  type Addiction {
    id: ID!
    name: String!
    since: String!
    status: String
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
    ): User!

    addClaps(username: String!, claps: Int!): User!
  }

  type CreateUserInput {
    name: String!
    email: String!
    addictions: [Addiction]
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
    addictions: [Addiction]
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
      return createDbUser({ ...args });
    },
    addClaps(parent, args) {
      console.log("ADD CLAPS CALLED");
      return addClaps({ ...args });
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
