const mongoose = require("mongoose");
const { Validator } = require("node-input-validator");

const Product = require("../models/product");
const User = require("../models/user");
const product = require("../models/product");


exports.getProduct = async (req, res, next) => {
    try {
        const existingProduct = await Product.findOne({ _id: req.params.id });

        if (!existingProduct) {
            return res.status(404).json({ message : "Product not found" });
        }
        return res.status(200).json(existingProduct);
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};


exports.getAllProducts = async (req, res, next) => {
    try {
        const existingProducts = await Product.find();
        if (!existingProducts) {
            return res.status(404).json({ message : "Products not found" });
        }
        return res.status(200).json(existingProducts);
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};


exports.getAllProductsByCategory = async (req, res, next) => {
    try {
        const existingProducts = await Product.find({ categories: req.params.id });
        
        if (!existingProducts) {
            return res.status(404).json({ message : "Products not found" });
        }
        return res.status(200).json(existingProducts);
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};


exports.createProduct = async (req, res, next) => {

    try {
        const currentUser = await User.findOne({ userId: res.locals.userId });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
    
        if (!currentUser.isAdmin) {
            return res.status(401).json({ message: "Access denied" });
        }

        const productInput = req.body;

        const validInput = new Validator(productInput, {
            name: "required|string|length:100",
            description: "required|string|length:1000",
            imageUrl: "required|url|length:255",
            price: "required|numeric|min:0|max:10000", // to add digitsBetween:min,maxs
            categories: "array|length:10" 
        });

        const isValid = await validInput.check();

        if (!isValid) {
            return res.status(400).json({ errors: validInput.errors });
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
            return res.status(404).json({ message: "Product creation failed" });
        }

        return res.status(201).json({ message: "Product created successfully", product: newProduct });

    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
}


exports.modifyProduct = async (req, res, next) => {

    try {
        const currentUser = await User.findOne({ userId: res.locals.userId });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
    
        if (!currentUser.isAdmin) {
            return res.status(401).json({ message: "Access denied" });
        }

        const validInput = new Validator(req.body, {
            name: "required|string|length:100",
            description: "required|string|length:1000",
            imageUrl: "required|url|length:255",
            price: "required|numeric|min:0|max:10000", // to add digitsBetween:min,maxs
            categories: "array|length:10" 
        });

        const isvalid = await validInput.check();

        if (!isvalid) {
            return res.status(400).json({ errors: validInput.errors });
        }

        const existingProduct = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });

        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product updated successfully", product: existingProduct });

    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};


exports.deleteProduct = async (req, res, next) => {

    try {
        const currentUser = await User.findOne({ userId: res.locals.userId });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
    
        if (!currentUser.isAdmin) {
            return res.status(401).json({ message: "Access denied" });
        }

        const existingProduct = await Product.findOneAndDelete({ _id: req.params.id });

        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal servor error", error: error });
    }
};
