const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { getUserByUsername, getUserByEmail } = require("../resolvers/user");

/*
 * Functions
 */

const signIn = async (event, context) => {
  const body = JSON.parse(event.body);

  return login(body)
    .then(session => ({
      statusCode: 200,
      body: JSON.stringify(session)
    }))
    .catch(err => {
      console.log({ err });

      return {
        statusCode: err.statusCode || 500,
        headers: { "Content-Type": "text/plain" },
        body: { stack: err.stack, message: err.message }
      };
    });
};

const me = async event => {
  const slug = await getUserSlugFromToken(event.headers.Authorization);

  console.info({ slug });

  const user = await getUserByUsername(slug);

  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(user)
  };
};

/**
 * Helpers
 */

async function signToken(user) {
  const secret = Buffer.from(process.env.JWT_SECRET, "base64");
  return jwt.sign({ id: user.id, slug: user.slug }, secret, {
    expiresIn: 86400 // expires in 24 hours
  });
}

async function getUserSlugFromToken(token) {
  const secret = Buffer.from(process.env.JWT_SECRET, "base64");

  const decoded = jwt.verify(token.replace("Bearer ", ""), secret);

  console.log("getUserSlugFromToken decoded", decoded);

  return decoded.slug;
}

// todo: replace with dynamodb
async function login(args, context) {
  console.log("looking for user", args.username, context);

  try {
    const user = await getUserByUsername(args.username);

    console.info({ user });

    if (!user.username && !user.passwordHash) {
      return {
        status: "INVALIDCREDENTIALS"
      };
    }

    const isValidPassword = await comparePassword(
      args.password,
      user.passwordHash
    );

    if (isValidPassword) {
      const token = await signToken(user);
      return Promise.resolve({ auth: true, token: token, status: "SUCCESS" });
    } else {
      return {
        status: "INVALIDCREDENTIALS"
      };
    }
  } catch (err) {
    console.info("Error login", err);
    return Promise.reject(new Error(err));
  }
}

function comparePassword(eventPassword, userPassword) {
  return bcrypt.compare(eventPassword, userPassword);
}

module.exports = {
  login,
  signIn,
  me
};
