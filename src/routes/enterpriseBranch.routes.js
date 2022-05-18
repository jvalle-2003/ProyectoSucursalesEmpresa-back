'use strict'

const express = require('express');
const api = express.Router();
const mdAuth = require('../services/authenticated');
const enterpriseBranchController = require('../controllers/enterpriseBranch.contoller');

//* Admin

api.get('/Test', enterpriseBranchController.test);
api.post('/addEnterpriseBranch', mdAuth.ensureAuth, enterpriseBranchController.addEnterpriseBranch);
api.post('/updateEnterpriseBrach/:id', mdAuth.ensureAuth, enterpriseBranchController.updateEnterpriseBranch); 
api.delete('/deleteEnterpriceBranch/:id', mdAuth.ensureAuth, enterpriseBranchController.deleteEnterpriseBranch); 
api.get('/getEnterpriseBranch/:id', mdAuth.ensureAuth, enterpriseBranchController.getEnterpriseBranch);
api.get('/getEnterprisesBranch',mdAuth.ensureAuth, enterpriseBranchController.getEnterprisesBranch);

module.exports = api;

