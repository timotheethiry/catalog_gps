const mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const AppError = require('../middleware/AppError');
const tryCatchWrapper = require('../middleware/tryCatchWrapper');

const Category = require('../models/category');
const User = require('../models/user');


exports.getCategory = tryCatchWrapper(async (req, res, next) => { 

    const existingCategory = await Category.findOne({ _id: req.params.id });

    if (!existingCategory) {
        return next(new AppError('Category not found', 404));
    }

    return res.status(200).json(existingCategory);
});


exports.getAllCategory = tryCatchWrapper(async (req, res, next) => {

    const existingCategories = await Category.find();

    if (!existingCategories) {
        return next(new AppError('Categories not found', 404));
    }

    return res.status(200).json(existingCategories);
});


exports.createCategory = tryCatchWrapper(async (req, res, next) => {

    const currentUser = await User.findOne({ userId: res.locals.userId });

    if (!currentUser) {
        return next(new AppError('User not found', 404));
    }

    if (!currentUser.isAdmin) {
        return next(new AppError('Access denied', 401));
    }

    const categoryInput = req.body;

    const validInput = new Validator(categoryInput, {
        name: 'required|string|length:100',
    }); 

    const isValid = await validInput.check();

    if (!isValid) {
        return next(new AppError('A category name is required. Format must be text from 1 to 100 characters', 400));
    }

    const category = new Category({
        name: categoryInput.name,
    });
    
    const newCategory = await category.save();

    if (!newCategory) {
        return next(new AppError('Category creation failed', 400));
    }

    return res.status(201).json({ message: 'Category created successfully', category: newCategory });
});


exports.modifyCategory = tryCatchWrapper(async (req, res, next) => {

    const currentUser = await User.findOne({ userId: res.locals.userId });

    if (!currentUser) {
        return next(new AppError('User not found', 404));

    }

    if (!currentUser.isAdmin) {
        return next(new AppError('Access denied', 401));

        
    }

    const categoryInput = req.body;

    const validInput = new Validator(categoryInput, {
        name: 'required|string|length:100',
    }); 

    const isValid = await validInput.check();

    if (!isValid) {
        return next(new AppError('A category name is required. Format must be text from 1 to 100 characters', 400));
    }

    const existingCategory = await Category.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });

    if (!existingCategory) {
        return next(new AppError('Category not found', 404));
    }

    return res.status(200).json({ message: 'Category updated successfully', category: existingCategory });
});


exports.deleteCategory = tryCatchWrapper(async (req, res, next) => {

    const currentUser = await User.findOne({ userId: res.locals.userId });

    if (!currentUser) {
        return next(new AppError('User not found', 404));
    }

    if (!currentUser.isAdmin) {
        return next(new AppError('Access denied', 401));
    }

    const existingCategory = await Category.findOneAndDelete({ _id: req.params.id });

    if (!existingCategory) {
        return next(new AppError('Category not found', 404));
    }

    return res.status(200).json({ message: 'Category deleted successfully' });
});
