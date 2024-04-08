const mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const Category = require('../models/category');
const User = require('../models/user');


exports.getCategory = async (req, res, next) => { 
    try {
        const existingCategory = await Category.findOne({ _id: req.params.id });

        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json(existingCategory);
        
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};


exports.getAllCategory = async (req, res, next) => {

    try {
        const existingCategories = await Category.find();

        if (!existingCategories) {
            return res.status(404).json({ message: "Categories not found" });
        }

        return res.status(200).json(existingCategories);
        
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};


exports.createCategory = async (req, res, next) => {

    try {
        const currentUser = await User.findOne({ userId: res.locals.userId });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
    
        if (!currentUser.isAdmin) {
            return res.status(401).json({ message: "Access denied" });
        }

        const categoryInput = req.body;

        const validInput = new Validator(categoryInput, {
            name: 'required|string|length:100',
        }); 

        const isValid = await validInput.check();

        if (!isValid) {
            return res.status(400).json({ errors: validInput.errors });
        }

        const category = new Category({
            name: categoryInput.name,
        });
        
        const newCategory = await category.save();

        if (!newCategory) {
            return res.status(404).json({ message: "Category creation failed" });
        }

        return res.status(201).json({ message: "Category created successfully", category: newCategory });

    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }   
}


exports.modifyCategory = async (req, res, next) => {

    try {
        const currentUser = await User.findOne({ userId: res.locals.userId });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
    
        if (!currentUser.isAdmin) {
            return res.status(401).json({ message: "Access denied" });
        }

        const categoryInput = req.body;

        const validInput = new Validator(categoryInput, {
            name: 'required|string|length:100',
        }); 

        const isValid = await validInput.check();

        if (!isValid) {
            return res.status(400).json({ errors: validInput.errors });
        }

        const existingCategory = await Category.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });

        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json({ message: "Category updated successfully", category: existingCategory });

    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    } 
};

exports.deleteCategory = async (req, res, next) => {

    try {
        const currentUser = await User.findOne({ userId: res.locals.userId });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
    
        if (!currentUser.isAdmin) {
            return res.status(401).json({ message: "Access denied" });
        }

        const existingCategory = await Category.findOneAndDelete({ _id: req.params.id });

        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};
