// local.js
const { ApolloServer } = require("apollo-server");

const { typeDefs, resolvers, mocks } = require("./graphql/schema");

const { sequelize, models } = require("./db/index");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  mocks,
  mockEntireSchema: false
});

const eraseDatabaseOnSync = true;

const createUsersWithAddictions = async () => {
  await models.User.create(
    {
      username: "rwieruch",
      addictions: [
        {
          text: "Published the Road to learn React"
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
};

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    await createUsersWithAddictions();
  }
  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});
