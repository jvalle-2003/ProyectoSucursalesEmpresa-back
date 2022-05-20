'use strict'
const mongoose = require('mongoose');

const enterpriseBranch = mongoose.Schema({
    enterprise: { type: mongoose.Schema.ObjectId, ref: 'Enterprise' },
    name: String,
    direction: String,
    productsBranch: [{
        product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
        stock: Number,
        sales: Number
    }]
});

module.exports = mongoose.model('EnterpriseBranch', enterpriseBranch);