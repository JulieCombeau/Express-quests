const authRouter = require('express').Router();
const User = require('../models/user');
const { verifyPassword } = require('../helpers/argonHelpers');
const { calculateToken } = require('../helpers/cryptoHelpers')

authRouter.post('/checkCredentials', (req, res) => {
const { email, password } = req.body;
    User.findByEmail(email).then((user) => {
        if (!user) {
            res.status(401).send("Invalid credentials")
        } else {
            verifyPassword(password, user.hashedPassword).then((verification) => {
                if (verification) {
                    // const token = calculateToken(email);
                    // User.update(user.id, { token: token })
                    // res.cookie('user_token', token)
                    res.send(calculateToken(email))
                } else {
                    res.status(401).send("Invalid credentials")
                }
            })
        }
    })
});

module.exports = authRouter;