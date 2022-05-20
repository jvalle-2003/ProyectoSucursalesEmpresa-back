'use strict'

const express = require('express');
const api = express.Router();
const productBranchController= require('../controllers/productBranch.controller'); 
const mdAuth = require('../services/authenticated');






//----------------------Rutas para Buscar productos de Sucursal--------------------------
api.get('/getProductBranch/:enterpriseBranchId/:id',mdAuth.ensureAuth, productBranchController.getProductBranch);
api.get('/getProductsBranch/:enterpriseBranchId',mdAuth.ensureAuth, productBranchController.getProductsBranch);

module.exports = api;





