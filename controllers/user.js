const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pwRules = require("../security/password");
const { Validator } = require("node-input-validator");

const User = require("../models/user");


exports.getUser = async (req, res, next) => {

    try {
        const existingUser = await User.findOne({ userId: req.params.id });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (res.locals.userId === existingUser.userId.toString()) { 
            return res.status(200).json(existingUser);
        }

        existingUser.email = "xxxx.xxx@xxx.xxx";
        existingUser.password = "xxx";
        existingUser.isAdmin = false;

        return res.status(200).json(existingUser);
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};


exports.getAllUsers = async (req, res, next) => {
    try {    
        const existingUsers = await User.find();

        if (!existingUsers) {
            return res.status(500).json({ message: "Users not found" });
        }

        existingUsers.forEach(user => {
            user.email = "xxxx.xxx@xxx.xxx";
            user.password = "xxx";
            user.isAdmin = false;
        });
        return res.status(200).json(existingUsers);
    } catch(error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};


exports.createUser = async (req, res, next) => {

    try {
        const userInput = req.body;
    
        const validInput = new Validator(userInput, {
            email: "required|email|length:100",
            password: "required",
            lastname: "required|string|length:100",
            firstname: "required|string|length:100"
        });
    
        const inputIsValid = await validInput.check();
    
        if (!inputIsValid) {
            return res.status(400).json({ errors: validInput.errors });
        }
    
        const passwordIsValid = pwRules.validate(req.body.password);
        if (!passwordIsValid) {
            return res.status(400).json({ message: `Invalid password format. Password must include 6 to 16 characters, 
            1 uppercase character or more, 1 digit or more
            no space, no special characters`, errors: passwordIsValid });
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
            return res.status(404).json({ message: "User registration failed" });
        }
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }         
};


exports.logUser = async (req, res, next) => {

    try {
        const userInput = req.body;
    
        const validInput = new Validator(userInput, {
            email: "required|email|length:100",
            password: "required"
        });
    
        const inputIsValid = await validInput.check();

        if (!inputIsValid) {
            return res.status(400).json({ errors: validInput.errors });
        }

        const existingUser = await User.findOne({ email: userInput.email }); 
        let credentialIsValid = false;

        if (existingUser) {
            credentialIsValid = await bcrypt.compare(req.body.password, existingUser.password);
        }

        if (!credentialIsValid) {
            setTimeout(() => {
                return res.status(401).json({ error: "Username or password is invalid !"});
            }, 3000);
            return;
        }
                    
        return res.status(200).json({ 
            userId: existingUser.userId.toString(), 
            token: jwt.sign(
                { 
                    userId: existingUser.userId.toString(), 
                    isAdmin: existingUser.isAdmin 
                },
                "RANDOM_TOKEN_SECRET",
                { expiresIn: "24h" }
            ),
            isAdmin: existingUser.isAdmin
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const userInput = req.body;
    
        const validInput = new Validator(userInput, {
            email: "required|email|length:100",
            password: "required",
            lastname: "required|string|length:100",
            firstname: "required|string|length:100"
        });
        
        const inputIsValid = await validInput.check();
    
        if (!inputIsValid) {
            return res.status(400).json({ errors: validInput.errors });
        }
    
        const existingUser = await User.findOne({ userId: req.params.id });
    
        if (!existingUser) {
            return res.status(404).json({ message: "User not found"}); 
        }
        
        if ( existingUser.userId.toString() !== res.locals.userId ) {
            return res.status(401).json({ error: "Access denied!" });
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
            return res.status(500).json({ message: "User account modification failed" });
        }
    
        return res.status(200).json({ message: "User account modified successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
}


exports.deleteUser = async (req, res, next) => {
    try {
        const existingUser = await User.findOne({ userId: req.params.id });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found"}); 
        }

        if ( existingUser.userId.toString() !== res.locals.userId ) {
            return res.status(401).json({ error: "Access denied!" });
        }
        
        const { deletedCount } = await User.deleteOne({ userId: req.params.id });

        if (deletedCount === 0) {
            return res.status(500).json({ message: "User account deletion failed" });
        }
        return res.status(200).json({ message: "User account deleted successfully" });   
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};