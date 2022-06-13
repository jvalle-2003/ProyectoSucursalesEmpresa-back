'use strict'

const express = require('express');
const api = express.Router();
const productBranchController= require('../controllers/productBranch.controller'); 
const mdAuth = require('../services/authenticated');

//---------------------Ruta para Agregar productos a Sucursales---------------
api.post('/addProductsBranch', mdAuth.ensureAuth, productBranchController.addProductBranch);
//----------------------Rutas para Buscar productos de Sucursal--------------------------
api.get('/getProductBranch/:enterpriseBranchId/:productBranchId',mdAuth.ensureAuth, productBranchController.getProductBranch);
api.get('/getProductsBranch/:enterpriseBranchId',mdAuth.ensureAuth, productBranchController.getProductsBranch);
//---------------------Ruta para vender productos de una sucursal--------------------------------
api.post('/saleOfProduct', mdAuth.ensureAuth, productBranchController.saleOfProduct); 
//---------------------Ruta para ver los productos de la sucursal mas vendidos----------------
api.get('/getProductsBranchBySales/:enterpriseBranchId', mdAuth.ensureAuth, productBranchController.getProductsBranchBySales)

module.exports = api;





