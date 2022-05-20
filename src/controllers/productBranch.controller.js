'use strict'

const EnterpriseBranch = require('../models/enterpriseBranch.model');
const Enterprise = require('../models/enterprise.model')
const Product = require('../models/product.model');
const validate = require('../utils/validate');


// ------------------------------------Agregar productos a una sucursal ---------------------------------

exports.addProductBranch = async (req, res) => {
    try {
        const params = req.body;
        const enterpriseId = req.enterprise.sub;
        const enterpriseBranchId = req.params.enterpriseBranchId;
        let data = {
            product: params.product,
            stock: params.stock,
            sales: 0
        }
        let msg = validate.validateData(data);
        if (!msg) {
            const checkBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId });
            if (checkBranch === null || checkBranch.enterprise != enterpriseId) {
                console.log(enterpriseBranchId);
                return res.status(400).send({ message: 'You cannot add products to this branch' });
            } else {
                const enterprise = await Enterprise.findOne({ _id: enterpriseId });
                const checkProduct = await Product.findOne({ _id: data.product });
                const productCheck = await validate.findProductOnEnterprise(enterprise, checkProduct._id)
                if (productCheck) {
                    if (data.stock > checkProduct.stock) {
                        return res.status(400).send({ message: 'Insufficient quantity of stock' });
                    } else {
                        const checkProductOnBranch = await validate.findProductOnBranch(checkBranch, data.product);
                        if (checkProductOnBranch) {
                            const productStock = await validate.findStockOfProductBranch(checkBranch, data.product);
                            const stockProduct = (checkProduct.stock - data.stock)
                            await Product.findOneAndUpdate({ _id: data.product }, { stock: stockProduct }, { new: true });
                            const dataStock = Number(data.stock)
                            const finalStock = productStock + dataStock
                            data.stock = finalStock;
                            const checkProductPosition = await validate.findProductPosition(checkBranch, data.product)
                            const positionId = (await checkBranch.productsBranch[checkProductPosition]._id).toString();
                            const updateProductBranch = await EnterpriseBranch.findOneAndUpdate({ _id: enterpriseBranchId, 'productsBranch._id': positionId },
                                { $set: { 'productsBranch.$.stock': data.stock } }, { new: true })
                            return res.send({ message: 'Product added to the branch successfully ', updateProductBranch })
                        } else {
                            await checkBranch.productsBranch.push(data);
                            await checkBranch.save();
                            const stockProduct = (checkProduct.stock - data.stock)
                            await Product.findOneAndUpdate({ _id: data.product }, { stock: stockProduct }, { new: true });
                            return res.send({ message: 'Product added to the branch successfully', checkBranch });
                        }
                    }
                } else {
                    return res.status(400).send({ message: 'You are not the owner of this product' });
                }
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error saving product' });
    }
}

//---------------------Busqueda de Productos por Sucursal----------------------

exports.getProductBranch = async (req, res) => {
    try {
        const enterpriseBranchId = req.params.enterpriseBranchId;
        const productBranchId = req.params.productBranchId
        const enterpriseId = req.enterprise.sub;

        const checkBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId });
        if (checkBranch === null || checkBranch.enterprise != enterpriseId) {
            console.log(enterpriseId);
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
        if (checkBranch === null || checkBranch.enterprise != enterpriseId) {
            console.log(enterpriseId);
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

// ----------------------Simulación venta de un producto ---------------------------------

exports.saleOfProduct = async (req, res) => {
    try {
        const params = req.body;
        const enterpriseBranchId = req.params.enterpriseBranchId;
        const enterpriseId = req.enterprise.sub;
        let data = {
            quantity: params.quantity,
            productBranchId: req.params.productBranchId
        }
        let msg = validate.validateData(data);
        if (!msg) {
            const checkBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId });
            if (checkBranch === null || checkBranch.enterprise != enterpriseId) {
                return res.status(400).send({ message: 'This branch does not belong to the enterprise' })
            } else {
                const enterpriseBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId });
                const productBranch = enterpriseBranch.productsBranch.id(data.productBranchId)
                if (productBranch === null || productBranch === undefined) {
                    console.log(productBranch)
                    return res.status(400).send({ message: 'The product was not found in the branch' });
                } else {
                    if (data.quantity > productBranch.stock) {
                        return res.status(400).send({ message: 'Insufficient quantity of stock' });
                    } else {
                        const finalStock = (productBranch.stock - data.quantity)
                        enterpriseBranch.productsBranch.id(data.productBranchId).stock = finalStock
                        enterpriseBranch.productsBranch.id(data.productBranchId).sales
                            = parseInt(parseInt(enterpriseBranch.productsBranch.id(data.productBranchId).sales) + parseInt(data.quantity))
                        await enterpriseBranch.save();
                        return res.send({ message: 'product sold successfully' });
                    }
                }
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Error selling product' });
    }
}