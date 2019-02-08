const bcrypt = require('bcrypt');
const db = require('../models/index');
const User = require('../models/user')(db.sequelize, db.Sequelize);
const ValidationErrorsSerializer = require('../serializers/ValidationErrorsSerializer');

const AuthController = {
    me(req, res, next) {
        res.send('me');
    },
    login(req, res, next) {
        res.send('login');
    },
    register(req, res, next) {
        const body = req.body;

        User.build({
                name: body.name,
                email: body.email,
                password: body.password
            })
            .validate()
            .then(user => {
                bcrypt.hash(body.password, 10, function(err, hash) {
                    user.password = hash;

                    user.save()
                        .then(user => {
                            res.send({
                                status: 'success',
                                body: {
                                    text: "User was successfully registered.",
                                    data: {
                                        name: user.name,
                                        email: user.email
                                    }
                                }
                            });
                        })
                        .catch(error => {
                            res.send({
                                status: 'failed',
                                body: {
                                    text: "Unexpected error occurred. Try again later."
                                }
                            }, 500);
                        });
                });
            })
            .catch(error => {
                res.send({
                    status: 'failed',
                    body: {
                        text: "Validation error.",
                        data: {
                            errors: ValidationErrorsSerializer.serialize(error.errors)
                        }
                    }
                }, 422)
            });

    }
}

module.exports = AuthController;