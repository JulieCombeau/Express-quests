const crypto = require('crypto');

// const  = "superSecretStringNowoneShouldKnowOrTheyCanGenerateTokens"

const calculateToken = (userEmail = "") => {
    return crypto.createHash("md5").update(userEmail + process.env.PRIVATE_KEY).digest("hex");
};


module.exports = { calculateToken };