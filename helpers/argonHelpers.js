const argon2 = require("argon2")

const hashingoptions = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 5,
    parallelism: 1,
}

const hashPassword = (plainPasssword) => {
    return argon2.hash(plainPasssword, hashingoptions)
}

const verifyPassword = (plainPasssword, hashedPassword) => {
    return argon2.verify(hashedPassword, plainPasssword, hashingoptions)
}

module.exports = {
    hashPassword,
    verifyPassword,
}