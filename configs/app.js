'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const enterpriseRoutes = require('../src/routes/enterprise.routes');
const productRoutes = require('../src/routes/product.routes');
const enterpriseBranchRoutes = require('../src/routes/enterpriseBranch.routes');
const productBranch = require('../src/routes/productBranch.routes')

const app = express(); //instancia

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use('/enterprise', enterpriseRoutes);
app.use('/product', productRoutes);
app.use('/enterpriseBranch', enterpriseBranchRoutes);
app.use('productBranch', productBranch);
module.exports = app;