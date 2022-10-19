const mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const Category = require('../models/category');
const User = require('../models/user');

exports.createCategory = (req, res, next) => {

    User.findOne({userId: res.locals.userId})
    .then(user => {
        if( user.isAdmin ) {

            const categoryInput = {...req.body};
        
            const validInput = new Validator(categoryInput, {
                name: 'required|string|length:100',
            }); 

            validInput
            .check()
            .then((matched) => {
                
                if (!matched) {
                    res.status(400).send(validInput.errors);
                } else {
                    
                    const category = new Category({
                        name: categoryInput.name,
                    });
                    
                    category
                    .save()
                    .then(() => res.status(201).json({ message: 'New category created !' }))
                    .catch(error => res.status(500).json({ error: "Internal servor error" }));
                };
            })
            .catch(() => res.status(500).send(validInput.errors));
            
        } else {

            res.status(401).json({ error: "Access denied!" });
        }
    })
    .catch(() => res.status(500).json({ error: "Internal servor error" }));

    
}

exports.getCategory = (req, res, next) => {

    Category.findOne({ _id: req.params.id })
    .then(category => res.status(200).json(category)) // find a non-existent category
    .catch(() => res.status(404).json({ error: "Didn't find category !" }));
};

exports.getAllCategory = (req, res, next) => {

    Category.find()
    .then(categories => res.status(200).json(categories))
    .catch(error => res.status(404).json({ error: "Didn't find categories !" }));
};

exports.modifyCategory = (req, res, next) => {

    User.findOne({userId: res.locals.userId})
    .then(user => {
        if( user.isAdmin ) {

            const categoryInput = {...req.body};
    
            const validInput = new Validator(categoryInput, {
                name: 'required|string|length:100',
            }); 
        
            validInput
            .check()
            .then((matched) => {
                
                if (!matched) {

                    res.status(400).send(validInput.errors);
                } else {

                    Category.findOne({ _id: req.params.id })
                    .then(() => {
                       
                        Category.updateOne({ _id: req.params.id }, { ...categoryInput })
                        .then(() => res.status(200).json({ message: 'Category modified !' }))
                        .catch(() => res.status(500).json({ error: "Internal servor error" }));

                    })
                    .catch(() => res.status(404).json({ error: "Didn't find category !" }));
                }
            })
            .catch(() => res.status(500).send(validInput.errors));
            
        } else {
            res.status(401).json({ error: "Access denied!" });
        }
    })
    .catch(() => res.status(500).json({ error: "Internal servor error" }));

};

exports.deleteCategory = (req, res, next) => {

    User.findOne({userId: res.locals.userId})
    .then(user => {
        if( user.isAdmin ) {

        Category.findOne({ _id: req.params.id })
        .then(() => {

            Category.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Category deleted !' }))
            .catch(() => res.status(500).json({ error: "Internal servor error"  }));  
            
        })
        .catch(() => res.status(404).json({ error: "Didn't find category !" }));
            
        } else {

            res.status(401).json({ error: "Access denied!" });
        }
    })
    .catch(() => res.status(500).json({ error: "Internal servor error" }));
   
};
