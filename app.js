const express = require('express');

const app = express();

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.post('/api/products', (req, res) => {
    console.log(req.body);
    res.status(201).json({message: 'New product created!'})
})

app.get('/api/products', (req, res) => {
    const products = [
        {
            _id: 1,
            name: 'Iphone 13 pro',
            description: 'iphone 13 pro, écran 6.1 pouces',
            image: 'https://via.placeholder.com/200',
            price: 1100
        },
        {
            _id: 2,
            name: 'machin',
            description: 'dsescription de machin',
            image: 'https://via.placeholder.com/200',
            price: 800
        },
        {
            _id: 3,
            name: 'truc',
            description: 'description de truc',
            image: 'https://via.placeholder.com/200',
            price: 50
        }
    ];
    res.status(200).json(products);
});

module.exports = app;
