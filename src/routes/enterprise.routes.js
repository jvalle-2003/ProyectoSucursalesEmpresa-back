'use strict'

const express = require('express');
const enterpriseController = require('../controllers/enterprise.controller');
const api = express.Router();
const mdAuth = require('../services/authenticated');

//FUNCIÓN PÚBLICA
api.get('/test', enterpriseController.test);

//FUNCIONES PRIVADAS
//ENTERPRISE
api.post('/register', enterpriseController.register);
api.post('/login', enterpriseController.login);
api.put('/update', mdAuth.ensureAuth, enterpriseController.update);
api.delete('/delete', mdAuth.ensureAuth, enterpriseController.delete);
api.get('/myEnterprise', mdAuth.ensureAuth, enterpriseController.myEnterprise);


//FUNCIONES PRIVADAS
//ADMIN
api.post('/saveEnterprise', [mdAuth.ensureAuth, mdAuth.isAdmin], enterpriseController.saveEnterprise);
api.put('/updateEnterprise/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], enterpriseController.updateEnterprise);
api.delete('/deleteEnterprise/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], enterpriseController.deleteEnterprise);
api.get('/getEnterprises', [mdAuth.ensureAuth, mdAuth.isAdmin], enterpriseController.getEnterprises);
api.get('/getEnterprise/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], enterpriseController.getEnterprise);


module.exports = api; 