const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { getUserByUsername } = require("../resolvers/user");

/*
 * Functions
 */

module.exports.signIn = async (event, context) => {
  const body = JSON.parse(event.body);

  return login(body)
    .then(session => ({
      statusCode: 200,
      body: JSON.stringify(session)
    }))
    .catch(err => {
      console.log({ error });

      return {
        statusCode: err.statusCode || 500,
        headers: { "Content-Type": "text/plain" },
        body: { stack: err.stack, message: err.message }
      };
    });
};

module.exports.me = () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/json" },
    body: { test: "protected" }
  };
};

/**
 * Helpers
 */

async function signToken(id) {
  const secret = Buffer.from(process.env.JWT_SECRET, "base64");
  return jwt.sign({ id: id }, secret, {
    expiresIn: 86400 // expires in 24 hours
  });
}

// todo: replace with dynamodb
async function login(eventBody) {
  console.log("looking for user", eventBody.username);

  try {
    const user = await getUserByUsername(eventBody.username);

    const isValidPassword = await comparePassword(
      eventBody.password,
      user.passwordHash
    );

    if (isValidPassword) {
      const token = await signToken(user.id);
      return Promise.resolve({ auth: true, token: token });
    }
  } catch (err) {
    console.info("Error login", err);
    return Promise.reject(new Error(err));
  }
}

function comparePassword(eventPassword, userPassword) {
  return bcrypt.compare(eventPassword, userPassword);
}

// function me(userId) {
//   return User.findById(userId, { password: 0 })
//     .then(user => (!user ? Promise.reject("No user found.") : user))
//     .catch(err => Promise.reject(new Error(err)));
// }

// function checkIfInputIsValid(eventBody) {
//   if (!(eventBody.password && eventBody.password.length >= 7)) {
//     return Promise.reject(
//       new Error(
//         "Password error. Password needs to be longer than 8 characters."
//       )
//     );
//   }

//   if (
//     !(
//       eventBody.name &&
//       eventBody.name.length > 5 &&
//       typeof eventBody.name === "string"
//     )
//   )
//     return Promise.reject(
//       new Error("Username error. Username needs to longer than 5 characters")
//     );

//   if (!(eventBody.email && typeof eventBody.name === "string"))
//     return Promise.reject(
//       new Error("Email error. Email must have valid characters.")
//     );

//   return Promise.resolve();
// }

// todo: replace with dynamodb
// function register(eventBody) {
//   return checkIfInputIsValid(eventBody) // validate input
//     .then(
//       () => User.findOne({ email: eventBody.email }) // check if user exists
//     )
//     .then(
//       user =>
//         user
//           ? Promise.reject(new Error("User with that email exists."))
//           : bcrypt.hash(eventBody.password, 8) // hash the pass
//     )
//     .then(
//       hash =>
//         User.create({
//           name: eventBody.name,
//           email: eventBody.email,
//           password: hash
//         }) // create the new user
//     )
//     .then(user => ({ auth: true, token: signToken(user._id) })); // sign the token and send it back
// }
