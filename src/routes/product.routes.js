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
//RUTAS DE BUSQUEDA DE PRODUCTOS
api.get('/getProductsByStockAsc',mdAuth.ensureAuth, productController.getProductsByStockAsc);
api.get('/getProductsByStockDesc',mdAuth.ensureAuth, productController.getProductsByStockDesc);
api.get('/getProductsByName', mdAuth.ensureAuth, productController.productByName);
api.get('/getProductsByProvider', mdAuth.ensureAuth, productController.productByProvider);


module.exports = api;