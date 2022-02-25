const mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const Category = require('../models/category');

exports.createCategory = (req, res, next) => {
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
            .catch(error => res.status(500).json({ error }));
        };
    })
    .catch(() => res.status(500).send(validInput.errors));
}

exports.getCategory = (req, res, next) => {

    Category.findOne({ _id: req.params.id })
    .then(category => res.status(200).json(category))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllCategory = (req, res, next) => {

    Category.find()
    .then(categories => res.status(200).json(categories))
    .catch(error => res.status(404).json({ error }));
};

exports.modifyCategory = (req, res, next) => {
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
            .then(category => {
                // if () { for V2 check if user is authorized
                Category.updateOne({ _id: req.params.id }, { ...categoryInput })
                    .then(() => res.status(200).json({ message: 'Category modified !' }))
                    .catch(error => res.status(500).json({ error }));
                // }
            })
            .catch(error => res.status(404).json({ error }));
        }
    })
    .catch(() => res.status(500).send(validInput.errors));
};

exports.deleteCategory = (req, res, next) => {

    Category.findOne({ _id: req.params.id })
    .then(category => {
        // if () { for V2 check if user is authorized
        Category.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Category deleted !' }))
            .catch(error => res.status(500).json({ error })); 
        // }
    })
    .catch(error => res.status(404).json({ error }));
};
