require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const userRoutes = require('./routes/user');

const credentials = {user: process.env.USER, pw: process.env.PW, db: process.env.DB, cl: process.env.CL};
const origin = `mongodb+srv://${credentials.user}:${credentials.pw}@${credentials.cl}.pd0ue.mongodb.net/${credentials.db}?retryWrites=true&w=majority`;

const app = express();
app.use(express.json());

mongoose.connect(origin, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB !'))
.catch(() => console.log('Connexion to MongoDB failed !'));


// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
