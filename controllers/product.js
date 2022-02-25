const mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const Product = require('../models/product');

exports.createProduct = (req, res, next) => {
    const productInput = {...req.body};
    
    const validInput = new Validator(productInput, {
        name: 'required|string|length:100',
        description: 'required|string|length:1000',
        imageUrl: 'required|url|length:255',
        price: 'required|numeric|min:0|max:10000', // to add digitsBetween:min,max
        categories: 'array|length:10' 
    }); 

    validInput
    .check()
    .then((matched) => {
        
        if (!matched) {
            res.status(400).send(validInput.errors);
        } else {
            
            const product = new Product({
                name: productInput.name,
                description: productInput.description,
                imageUrl: productInput.imageUrl,
                price: productInput.price,
                categories: productInput.categories
            });
            
            product
            .save()
            .then(() => res.status(201).json({ message: 'New product created !' }))
            .catch(error => res.status(500).json({ error }));
        };
    })
    .catch(() => res.status(500).send(validInput.errors));
}

exports.getProduct = (req, res, next) => {

    Product.findOne({ _id: req.params.id })
    .then(product => res.status(200).json(product))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllProducts = (req, res, next) => {

    Product.find()
    .then(products => res.status(200).json(products))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllProductsByCategory = (req, res, next) => {

    Product.find({categories: req.params.id})
    .then(products => res.status(200).json(products))
    .catch(error => res.status(404).json({ error }));
};

exports.modifyProduct = (req, res, next) => {
    const productInput = {...req.body};

    const validInput = new Validator(productInput, {
        name: 'required|string|length:100',
        description: 'required|string|length:1000',
        imageUrl: 'required|url|length:255',
        price: 'required|numeric|min:0|max:10000', // to add digitsBetween:min,maxs
        categories: 'array|length:10' 
    });  

    validInput
    .check()
    .then((matched) => {
        if (!matched) {
            res.status(400).send(validInput.errors);
        } else {
            Product.findOne({ _id: req.params.id })
            .then(product => {
                // if () { for V2 check if user is authorized
                    Product.updateOne({ _id: req.params.id }, { ...productInput })
                    .then(() => res.status(200).json({ message: 'Product modified !' }))
                    .catch(error => res.status(500).json({ error }));
                // }
            })
            .catch(error => res.status(404).json({ error }));
        }
    })
    .catch(() => res.status(500).send(validInput.errors));
};

exports.deleteProduct = (req, res, next) => {

    Product.findOne({ _id: req.params.id })
    .then(product => {
        // if () { for V2 check if user is authorized
            Product.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Product deleted !' }))
            .catch(error => res.status(500).json({ error })); 
        // }
    })
    .catch(error => res.status(404).json({ error }));
};
