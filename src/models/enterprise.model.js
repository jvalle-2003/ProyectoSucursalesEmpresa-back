'use strict'

const mongoose = require('mongoose');

const enterpriseSchema = mongoose.Schema({
    name: String,
    type: String,
    username: String,
    email: String,
    password: String,
    phone: String,
    role: String,
    products: [{ type: mongoose.Schema.ObjectId, ref: 'Product'}]
});

module.exports = mongoose.model('Enterprise', enterpriseSchema);