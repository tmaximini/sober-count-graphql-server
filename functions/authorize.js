const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens

function generateAuthResponse(principalId, effect, methodArn) {
  const policyDocument = generatePolicyDocument(effect, methodArn);

  return {
    principalId,
    policyDocument
  };
}

function generatePolicyDocument(effect, methodArn) {
  if (!effect || !methodArn) return null;

  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: methodArn
      }
    ]
  };

  return policyDocument;
}

module.exports.verifyToken = async (event, context, callback) => {
  const token = event.authorizationToken;
  const methodArn = event.methodArn;

  if (!token || !methodArn) return null;

  console.log("token, methodArn", token, methodArn, process.env.JWT_SECRET);

  // verifies token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    console.info({ err, decoded });

    if (err) {
      return generateAuthResponse(decoded.id, "Deny", methodArn);
    } else {
      return generateAuthResponse(decoded.id, "Allow", methodArn);
    }
  });
};
