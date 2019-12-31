// local.js
const { ApolloServer } = require("apollo-server");

const { typeDefs, resolvers, mocks } = require("./graphql/schema");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  mocks,
  mockEntireSchema: false
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
