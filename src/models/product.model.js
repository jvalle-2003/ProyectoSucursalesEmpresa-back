'use strict';
const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: String,
    provider: String,
    stock: Number
})

module.exports = mongoose.model('Product', productSchema);