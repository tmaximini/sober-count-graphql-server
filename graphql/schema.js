const { gql } = require("apollo-server-lambda");

const {
  getUsers,
  getUserByUsername,
  createDbUser
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
    createUser(username: String!, email: String!): User!
  }

  type CreateUserInput {
    name: String!
    email: String!
    addictions: [Addiction]
  }

  type User {
    id: ID!
    username: String!
    email: String
    # passwordHash: String
    createdAt: Int!
    addictions: [Addiction]
  }
`;

const resolvers = {
  Query: {
    user(obj, args, context, info) {
      return getUserByUsername(args.name);
    },
    users(obj, args, context, info) {
      return getUsers();
    }
  },
  Mutation: {
    createUser(parent, args) {
      return createDbUser({ ...args });
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
