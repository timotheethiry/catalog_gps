const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Validator } = require('node-input-validator');

const AppError = require('../middleware/AppError');
const tryCatchWrapper = require('../middleware/tryCatchWrapper');

const User = require('../models/user');

const pwRules = require('../security/password');
const { checkIfAddressIsAlreadyBlocked, checkIfAddressReachedMaxAttempts, updateFailureForThisAddress } = require('../security/failedLoginAtempts');


exports.getUser = tryCatchWrapper(async (req, res, next) => {

    const existingUser = await User.findOne({ userId: req.params.id });

    if (!existingUser) {
        return next(new AppError('User not found', 404));

    }

    if (res.locals.userId === existingUser.userId.toString()) { 
        return res.status(200).json(existingUser);
    }

    existingUser.email = 'xxxx.xxx@xxx.xxx';
    existingUser.password = 'xxx';
    existingUser.isAdmin = false;

    return res.status(200).json(existingUser);
}); 


exports.getAllUsers = tryCatchWrapper(async (req, res, next) => {

    const existingUsers = await User.find();

    if (!existingUsers) {
        return next(new AppError('Users not found', 404));

    }

    existingUsers.forEach(user => {
        user.email = 'xxxx.xxx@xxx.xxx';
        user.password = 'xxx';
        user.isAdmin = false;
    });
    return res.status(200).json(existingUsers);
});


exports.createUser = tryCatchWrapper(async (req, res, next) => {

    const userInput = req.body;

    const validInput = new Validator(userInput, {
        email: 'required|email|length:100',
        password: 'required',
        lastname: 'required|string|length:100',
        firstname: 'required|string|length:100'
    });

    const inputIsValid = await validInput.check();

    if (!inputIsValid) {
        return next(new AppError('Bad format, check requested format rules', 400));

    }

    const passwordIsValid = pwRules.validate(req.body.password);
    if (!passwordIsValid) {
        return next(new AppError(`Invalid password format. Password must include 6 to 16 characters, 
        1 uppercase character or more, 1 digit or more
        no space, no special characters`, 400));

    }

    const hash = await bcrypt.hash(req.body.password, 10);
    const newId = new mongoose.Types.ObjectId();
    const user = new User({
        userId: newId,
        email: userInput.email,
        password: hash,
        lastname: userInput.lastname,
        firstname: userInput.firstname,
        isAdmin: false
    });
                    
    const newUser = await user.save();

    if (!newUser) {
        return next(new AppError('User registration failed', 400));
    }
    return res.status(201).json({ message: 'User registered successfully' });
});


exports.logUser = tryCatchWrapper(async (req, res, next) => {

    const ip = req.ip; 

    const { blocked, remainingTime } = checkIfAddressIsAlreadyBlocked(ip);

    if (blocked) {
        return next(new AppError(`Too many failed attempts. Please try again in ${ Math.round(remainingTime / 1000) } seconds.`, 401));
    }

    const userInput = req.body;

    const validInput = new Validator(userInput, {
        email: 'required|email|length:100',
        password: 'required'
    });

    const inputIsValid = await validInput.check();

    if (!inputIsValid) {
        return next(new AppError('Bad format. All fields are required. Email must be less than 100 characters long', 400));
    }

    const existingUser = await User.findOne({ email: userInput.email }); 
    let credentialIsValid = false;

    if (existingUser) {
        credentialIsValid = await bcrypt.compare(req.body.password, existingUser.password);
    }

    if (!credentialIsValid) {
        const { count, threshold } = updateFailureForThisAddress(ip);
        const { blocked, blockDuration } = checkIfAddressReachedMaxAttempts(ip);

        if (blocked) {
            return next(new AppError(`Too many failed attempts. Please try again in ${blockDuration / 1000} seconds.`, 401));
        }

        setTimeout(() => {
            return next(new AppError(`Email or password is invalid. ${threshold - count} attempts before being blocked`, 401));
        }, 10);
        return;
    }
                
    return res.status(200).json({ 
        userId: existingUser.userId.toString(), 
        token: jwt.sign(
            { 
                userId: existingUser.userId.toString(), 
                isAdmin: existingUser.isAdmin 
            },
            'RANDOM_TOKEN_SECRET',
            { expiresIn: '24h' }
        ),
        isAdmin: existingUser.isAdmin
    });
});


exports.updateUser = tryCatchWrapper(async (req, res) => {

    const userInput = req.body;

    const validInput = new Validator(userInput, {
        email: 'required|email|length:100',
        password: 'required',
        lastname: 'required|string|length:100',
        firstname: 'required|string|length:100'
    });
    
    const inputIsValid = await validInput.check();

    if (!inputIsValid) {
        return next(new AppError('Bad format, check requested format rules', 400));

    }

    const existingUser = await User.findOne({ userId: req.params.id });

    if (!existingUser) {
        return next(new AppError('User not found', 404));
    }
    
    if ( existingUser.userId.toString() !== res.locals.userId ) {
        return next(new AppError('Access denied', 401));
    }

    const updateUser = {
        email: userInput.email,
        password: userInput.password,
        lastname: userInput.lastname,
        firstname: userInput.firstname,
        isAdmin: existingUser.isAdmin.toString()
    };

    const { updatedCount } = await User.updateOne({ userId: req.params.id }, { ...updateUser });

    if (updatedCount === 0) {
        return next(new AppError('User account modification failed', 500));
    }

    return res.status(200).json({ message: 'User account modified successfully' });
}); 


exports.deleteUser = tryCatchWrapper(async (req, res, next) => {

    const existingUser = await User.findOne({ userId: req.params.id });

    if (!existingUser) {
        return next(new AppError('User not found', 404));
    }

    if ( existingUser.userId.toString() !== res.locals.userId ) {
        return next(new AppError('Access denied', 401));
    }
    
    const { deletedCount } = await User.deleteOne({ userId: req.params.id });

    if (deletedCount === 0) {
        return next(new AppError('User account deletion failed', 500));
    }
    
    return res.status(200).json({ message: 'User account deleted successfully' });   
});