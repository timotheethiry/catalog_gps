const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pwRules = require('../security/password');
const { Validator } = require('node-input-validator');

const User = require('../models/user');

exports.createUser = (req, res, next) => {
    const validInput = new Validator(req.body, {
        email: 'required|email|length:100',
        password: 'required',
        lastname: 'required|string|length:100',
        firstname: 'required|string|length:100'
    });

    validInput.check()
    .then((matched) => {
        if (!matched) {
            res.status(400).send(validInput.errors);
        } else {
            if (pwRules.validate(req.body.password)) {
                bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    const newId = new mongoose.Types.ObjectId();
                    const user = new User({
                        userId: newId,
                        email: req.body.email,
                        password: hash,
                        lastname: req.body.lastname,
                        firstname: req.body.firstname,
                        isAdmin: false
                    });
                    
                    user.save()
                    .then(() => res.status(201).json({ message: 'User account created !' }))
                    .catch(error => res.status(500).json({ error: "Internal servor error" }));
                })
                .catch(error => res.status(500).json({ error: "Internal servor error" }));
            } else {
                throw 'Invalid password';
            }
        }
    })
    .catch(() => res.status(400).send(validInput.errors));
};


exports.logUser = (req, res, next) => {
    const validInput = new Validator(req.body, {
        email: 'required|email|length:100',
        password: 'required'
    });

    validInput.check()
    .then((matched) => {
        if (!matched) {
            res.status(400).send(validInput.errors);
        } else {
            User.findOne({ email: req.body.email })
            .then( user => {
                if (!user) {
                    const f = resolve => setTimeout(resolve, 5000);
                    Promise.all(f);
                    return res.status(401).json({ error: "Username or password is invalid !"}); 
                }

                bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        const f = resolve => setTimeout(resolve, 5000);
                        Promise.all(f);
                        return res.status(401).json({ error: "Username or password is invalid !"});
                    }

                    const jwt = require('jsonwebtoken');
                    
                    res.status(200).json({ 
                        userId: user.userId, 
                        token: jwt.sign(
                            { 
                                userId: user.userId, 
                                isAdmin: user.isAdmin 
                            },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        ),
						isAdmin: user.isAdmin
                    });
                })
                .catch(error => res.status(500).json({ error: "Internal servor error" }));
            })
            .catch(error => res.status(500).json({ error: "Internal servor error" }));
        }
    })
    .catch(() => res.status(400).send(validInput.errors));
};


exports.getAllUsers = (req, res, next) => {
    User.find()
    .then(users => {
        users.forEach(user => {
            user.email = "xxxx.xxx@xxx.xxx";
            user.password = "xxx";
            user.isAdmin = false;
        });
        res.status(200).json(users);
    })
    .catch(error => res.status(404).json({ error: "Didn't find user" }));
};


exports.getUser = (req, res, next) => {
    if (res.locals.userId == req.params.id) {

        User.findOne({ userId: req.params.id })
        .then(user => res.status(200).json(user))
        .catch(error => res.status(404).json({ error: "Didn't find user" }));
    } 
    else {

        User.findOne({ userId: req.params.id })
        .then(user => {

            user.email = "xxxx.xxx@xxx.xxx";
            user.password = "xxx";
            user.isAdmin = false;
            res.status(200).json(user);
        })
        .catch(error => res.status(404).json({ error: "Didn't find user" }));
    }
};


exports.deleteUser = (req, res, next) => {
    User.findOne({ userId: req.params.id })
    .then( user => {
        if (!user) {
            return res.status(404).json({ error: "Didn't find user !"}); 
        }

        if ( user.userId == res.locals.userId ) {
            user.deleteOne({ userId: req.params.id })
            .then(() => res.status(200).json({ message: 'User account deleted !' }))
            .catch(error => res.status(500).json({ error: "Internal servor error" }));
        } else {
            return res.status(401).json({ error: "Access denied!" });
        }
    })
    .catch(error => res.status(500).json({ error: "Internal servor error" }));
};

exports.updateUser = (req, res) => {

    const validInput = new Validator(req.body, {
        email: 'required|email|length:100',
        password: 'required',
        lastname: 'required|string|length:100',
        firstname: 'required|string|length:100'
    });
    
    validInput.check()
    .then((matched) =>{
        if(!matched) {
            res.staus(403).json(validInput.errors)
        } else {
            user.findOne({userId: req.params.id})
            .then(user => {
                if (!user) {
                    res.status(404).json({ error: "User not found !"}); 
                }

                if ( user.userId == res.locals.userId ) {

                    const updateUser = {
                        userId: user.userId,
                        email: user.email,
                        password: user.password,
                        lastname: req.body.lastname,
                        firstname: req.body.firstname,
                        isAdmin: false
                    }


                    User.updateOne({ userId: req.params.id }, { ...req.body })
                    .then(() => res.status(200).json({ message: 'User account modified !' }))
                    .catch(error => res.status(500).json({ message: "Internal servor error udate", error: error }));
                } else {
                    return res.status(401).json({ error: "Access denied!" });
                }

            })
            .catch(error => res.status(500).json({ message: "Internal servor error find", error: error }));
        }
    })
    .catch(err => res.status(500).json({error: err}));
}