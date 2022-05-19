'use strict'

const express = require('express');
const api = express.Router();
const productController = require('../controllers/product.controller'); 
const mdAuth = require('../services/authenticated');

api.get('/test', mdAuth.ensureAuth, productController.testProduct);
api.post('/addProduct', mdAuth.ensureAuth, productController.addProduct);
api.put('/updateProduct/:id', mdAuth.ensureAuth, productController.updateProduct);
api.get('/getProduct/:id', mdAuth.ensureAuth, productController.getProduct);
api.get('/getProducts', mdAuth.ensureAuth, productController.getProducts);
api.delete('/deleteProduct/:id', mdAuth.ensureAuth, productController.deleteProduct);
