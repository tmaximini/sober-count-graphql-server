const { gql } = require("apollo-server-lambda");

const { getUserByUsername } = require("../resolvers/addiction");

const typeDefs = gql`
  type Addiction {
    id: ID!
    name: String!
    since: String!
    status: String
  }

  type Query {
    user(name: String!): User
  }

  type User {
    id: ID!
    username: String!
    email: String
    passwordHash: String
    createdAt: Int!
    addictions: [Addiction]
  }

  type Challenge {
    user: User!
    addition: Addiction!
    started: Int!
  }
`;

const resolvers = {
  Query: {
    user(obj, args, context, info) {
      return getUserByUsername(args.name);
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
