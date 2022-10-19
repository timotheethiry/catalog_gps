const mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const Product = require('../models/product');
const User = require('../models/user');

exports.createProduct = (req, res, next) => {

    User.findOne({userId: res.locals.userId})
    .then(user => {
        if( user.isAdmin ) {

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

        } else {

            res.status(401).json({ error: "Access denied!" });
        }
    })
    .catch(() => res.status(500).json({ error: "Internal servor error" }));

}

exports.getProduct = (req, res, next) => {

    Product.findOne({ _id: req.params.id })
    .then(product => res.status(200).json(product)) // find a non-existent category
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

    User.findOne({userId: res.locals.userId})
    .then(user => {
        if( user.isAdmin ) {

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
                    .then(() => {

                        Product.updateOne({ _id: req.params.id }, { ...productInput })
                        .then(() => res.status(200).json({ message: 'Product modified !' }))
                        .catch(error => res.status(500).json({ error: "Internal servor error" }));

                    })
                    .catch(error => res.status(404).json({ error: "Didn't find product" }));
                }
            })
            .catch(() => res.status(500).send(validInput.errors));
    
        } else {

            res.status(401).json({ error: "Access denied!" });
        }
    })
    .catch(() => res.status(500).json({ error: "Internal servor error" }));

    
};

exports.deleteProduct = (req, res, next) => {

    User.findOne({userId: res.locals.userId})
    .then(user => {
        if( user.isAdmin ) {

            Product.findOne({ _id: req.params.id })
            .then(() => {
                
                    Product.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Product deleted !' }))
                    .catch(error => res.status(500).json({ error: "Internal servor error" })); 

            })
            .catch(error => res.status(404).json({ error: "Didn't find product" }));
            
        } else {
            res.status(401).json({ error: "Access denied!" });
        }
    })
    .catch(() => res.status(500).json({ error: "Internal servor error" }));

};
