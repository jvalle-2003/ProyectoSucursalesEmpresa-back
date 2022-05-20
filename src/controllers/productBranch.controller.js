'use strict'

const EnterpriseBranch = require('../models/enterpriseBranch.model');
const Enterprise = require('../models/enterprise.model')
const Product = require('../models/product.model');
const validate = require('../utils/validate');













//------------Busqueda de Productos por Sucursal--------------

exports.getProductBranch = async (req, res) => {
    try {
        const enterpriseBranchId = req.params.enterpriseBranchId;
        const productBranchId = req.params.productBranchId
        const enterpriseId = req.enterprise.sub;

        const checkBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId });
        if (checkBranch === null || checkBranch.enterprise != enterpriseId) {
            return res.status(400).send({ message: 'This branch does not belong to the enterprise' })
        } else {
            const enterpriseBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId });
            const productBranch = enterpriseBranch.productsBranch.id(productBranchId)

            if (productBranch === null || productBranch === undefined) {
                return res.status(400).send({ message: 'The product was not found in the branch' });
            } else {
                return res.send({ message: 'Product found', productBranch });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error getting product' });
    }
}

exports.getProductsBranch = async (req, res) => {
    try {
        const enterpriseBranchId = req.params.enterpriseBranchId;
        const enterpriseId = req.enterprise.sub;

        const checkBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId });
        if (checkBranch === null || EnterpriseBranch.enterprise != enterpriseId) {
            return res.status(400).send({ message: 'This branch does not belong to the enterprise' })
        } else {
            const enterpriseBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId }).populate('productsBranch');
            const productsBranch = await enterpriseBranch.productsBranch
            if (enterpriseBranch === null || enterpriseBranch === undefined) {
                return res.status(400).send({ message: 'No products found in the branch' });
            } else {
                return res.send({ message: 'Products Found: ', productsBranch });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error getting products' });
    }
}