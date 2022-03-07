const mongoose = require('mongoose');

const favoriteSchema = mongoose.Schema({
    userId: { type: String, required: true},
    products: { type: [String], required: true},
}); 

module.exports = mongoose.model('Favorite', favoriteSchema);