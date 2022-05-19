'use strict'

const Enterprise = require('../models/enterprise.model');
const Product = require('../models/product.model');
const validate = require('../utils/validate');

exports.testProduct = (req, res) => {
    return res.send({ message: 'Function test is running' });
}

// ---------------------------------CRUD productos -----------------------------------------

exports.addProduct = async (req, res) => {
    try {
        const params = req.body;
        const enterprise = await Enterprise.findOne({_id: req.enterprise.sub});
        const data = {
            name: params.name,
            provider: params.provider,
            stock: params.stock
        }
        const msg = validate.validateData(data);
        if (!msg) {
            const product = new Product(data);
            await product.save();
            await enterprise.products.push(product);
            await enterprise.save();
            return res.send({ message: 'Product created successfully', product });
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creating product' });
    }
}


exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const params = req.body;
        const enterprise = await Enterprise.findOne({_id: req.enterprise.sub});
        const checkProduct = await Product.findOne({ _id: productId })
        if (checkProduct) {
            const checkUpdated = await validate.checkUpdateProduct(params);
            if (checkUpdated) {
                const checkEnterpriseProduct = await validate.findProductOnEnterprise(enterprise, checkProduct._id)
                if(checkEnterpriseProduct){
                    const updateProduct = await Product.findOneAndUpdate({ _id: productId }, params, { new: true });
                    if (updateProduct) {
                        return res.send({ message: 'Updated Product:', updateProduct });
                    } else {
                        return res.send({ message: 'Failed to update product' });
                    }
                }else{
                    return res.send({ message: 'You are not the owner of this product'});
                }
            } else {
                return res.status(400).send({ message: 'invalid parameters' });
            }
        } else {
            return res.status(400).send({ message: 'product not found' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error updating the product' });
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const enterprise = await Enterprise.findOne({_id: req.enterprise.sub});
        const checkProduct = await Product.findOne({ _id: productId });
        if(checkProduct){
            const checkUserProduct = await validate.findProductOnEnterprise(enterprise, checkProduct._id);
            if(checkUserProduct){
                const productDeleted = await Product.findOneAndDelete({ _id: productId });
                await enterprise.products.pull(checkUserProduct);
                await enterprise.save();
                return res.send({ message: 'Product removed:', productDeleted });
            }else{
                return res.send({ message: 'You are not the owner of this product'});
            }
        }else{
            return res.send({ message: 'Product not found or already removed' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({message: 'Failed to delete product' });
    }
}

exports.getProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const enterprise = await Enterprise.findOne({_id: req.enterprise.sub});
        const checkProduct = await Product.findOne({ _id: productId });
        if(checkProduct){
            const checkUserProduct = await validate.findProductOnEnterprise(enterprise, checkProduct._id);
            if(checkUserProduct){
                return res.send({ message: 'Product found:', checkProduct });
            }else{
                return res.send({ message: 'You are not the owner of this product'});
            }
        } else {
            return res.status(400).send({ message: 'product not found' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error looking for the product' });
    }
}

exports.getProducts = async (req, res) => {
    try {
        const enterprise = await Enterprise.findOne({_id: req.enterprise.sub}).populate('products');
        const products = enterprise.products
        if(products)
            return res.send({ message: 'Products found:', products })
            return res.send({ message: 'No product found' })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error looking for the products' });
    }
}
