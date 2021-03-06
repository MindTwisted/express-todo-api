const bcrypt = require('bcrypt');
const View = require('../views/index');
const db = require('../models/index');
const User = db.User;
const Token = db.Token;

const AuthController = {
    me(req, res, next) {
        const user = req.user;
        const data = {
            user
        };

        res.status(200).send(View.generate(null, data));
    },
    logout(req, res, next) {
        const user = req.user;

        Token.destroy({
                where: {
                    UserId: user.id
                }
            })
            .then(() => {
                const text = `User ${user.name} was successfully logged out.`;
                        
                res.status(200).send(View.generate(text));
            }).catch(next);
    },
    login(req, res, next) {
        const body = req.body;
        const email = body.email;
        const password = body.password;

        User.findOne({
                where: {email}
            })
            .then(user => {
                if (!user) {
                    return res.status(403).send(View.generate("Invalid credentials.", null, false));
                }

                return bcrypt.compare(password, user.password)
                    .then(result => {
                        if (!result) {
                            return Promise.resolve(null);
                        }

                        return Token.create({
                            UserId: user.id
                        });
                    })
                    .then(token => {
                        if (!token) {
                            return res.status(403).send(View.generate("Invalid credentials.", null, false));
                        }

                        const text = `User ${user.name} was successfully logged in.`;
                        const data = {
                            user,
                            token
                        };

                        res.status(200).send(View.generate(text, data));
                    });
            }).catch(next);
    },
    register(req, res, next) {
        const body = req.body;

        User.create({
                name: body.name,
                email: body.email,
                password: body.password
            })
            .then(user => {
                const text = 'User was successfully registered.';
                const data = {
                    user
                };

                res.status(200).send(View.generate(text, data));
            }).catch(next);
    }
}

module.exports = AuthController;