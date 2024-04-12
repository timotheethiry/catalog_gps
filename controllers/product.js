const mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const AppError = require('../middleware/AppError');
const tryCatchWrapper = require('../middleware/tryCatchWrapper');

const Product = require('../models/product');
const User = require('../models/user');


exports.getProduct = tryCatchWrapper(async (req, res, next) => {

    const existingProduct = await Product.findOne({ _id: req.params.id });

    if (!existingProduct) {
        return next(new AppError('Product not found', 404));
    }
    return res.status(200).json(existingProduct);
});


exports.getAllProducts = tryCatchWrapper(async (req, res, next) => {

    const existingProducts = await Product.find();
    if (!existingProducts) {
        return next(new AppError('Products not found', 404));
    }
    return res.status(200).json(existingProducts);
});


exports.getAllProductsByCategory = tryCatchWrapper(async (req, res, next) => {

    const existingProducts = await Product.find({ categories: req.params.id });
    
    if (!existingProducts) {
        return next(new AppError('Products not found', 404));
    }
    return res.status(200).json(existingProducts);
});


exports.createProduct = tryCatchWrapper(async (req, res, next) => {

    const currentUser = await User.findOne({ userId: res.locals.userId });

    if (!currentUser) {
        return next(new AppError('User not found', 404));
    }

    if (!currentUser.isAdmin) {
        return next(new AppError('Access denied', 401));
    }

    const productInput = req.body;

    const validInput = new Validator(productInput, {
        name: 'required|string|length:100',
        description: 'required|string|length:1000',
        imageUrl: 'required|url|length:255',
        price: 'required|numeric|min:0|max:10000',
        categories: 'array|length:10' 
    });

    const isValid = await validInput.check();

    if (!isValid) {
        return next(new AppError('Bad format. Check the required fields and length', 400));
    }

    const product = new Product({
        name: productInput.name,
        description: productInput.description,
        imageUrl: productInput.imageUrl,
        price: productInput.price,
        categories: productInput.categories
    });
    
    const newProduct = await product.save();

    if (!newProduct) {
        return next(new AppError('Product creation failed', 400));
    }

    return res.status(201).json({ message: 'Product created successfully', product: newProduct });
});


exports.modifyProduct = tryCatchWrapper(async (req, res, next) => {

    const currentUser = await User.findOne({ userId: res.locals.userId });

    if (!currentUser) {
        return next(new AppError('User not found', 404));
    }

    if (!currentUser.isAdmin) {
        return next(new AppError('Access denied', 401));
    }

    const validInput = new Validator(req.body, {
        name: 'required|string|length:100',
        description: 'required|string|length:1000',
        imageUrl: 'required|url|length:255',
        price: 'required|numeric|min:0|max:10000',
        categories: 'array|length:10' 
    });

    const isvalid = await validInput.check();

    if (!isvalid) {
        return next(new AppError('Bad format. Check the required fields and length', 400));
    }

    const existingProduct = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });

    if (!existingProduct) {
        return next(new AppError('Product not found', 404));
    }

    return res.status(200).json({ message: 'Product updated successfully', product: existingProduct });
});


exports.deleteProduct = tryCatchWrapper(async (req, res, next) => {

    const currentUser = await User.findOne({ userId: res.locals.userId });

    if (!currentUser) {
        return next(new AppError('User not found', 404));
    }

    if (!currentUser.isAdmin) {
        return next(new AppError('Access denied', 401));
    }

    const existingProduct = await Product.findOneAndDelete({ _id: req.params.id });

    if (!existingProduct) {
        return next(new AppError('Product not found', 404));
    }

    return res.status(200).json({ message: 'Product deleted successfully' });
});
