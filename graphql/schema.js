const { gql } = require("apollo-server-lambda");

const {
  getAddictionById,
  getAddictionByName
} = require("../resolvers/addiction");

const typeDefs = gql`
  type Addiction {
    id: ID!
    name: String
    descriptionLong: String
    descriptionShort: String
    users: [User!]
  }

  type Query {
    addiction(id: ID!): Addiction
    addictionByName(name: String!): Addiction
  }

  type User {
    id: ID!
    username: String!
    passwordHash: String
    createdAt: Int!
  }

  type Challenge {
    user: User!
    addition: Addiction!
    started: Int!
  }
`;

const resolvers = {
  Query: {
    addiction(obj, args, context, info) {
      return getAddictionById(args.id);
    },
    addictionByName(obj, args, context, info) {
      return getAddictionByName(args.name);
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
