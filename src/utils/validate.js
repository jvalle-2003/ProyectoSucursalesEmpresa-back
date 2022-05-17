'use strict'

const bcrypt = require('bcrypt-nodejs');
const Enterprise = require('../models/enterprise.model');
const Product = require('../models/product.model');


exports.validateData = (data) =>{
    let keys = Object.keys(data), msg = '';

    for(let key of keys){
        if(data[key] !== null && data[key] !== undefined && data[key] !== '') continue;
        msg += `The params ${key} es obligatorio\n`
    }
    return msg.trim();
}

exports.alreadyEnterprise = async (username)=>{
   try{
    let exist = Enterprise.findOne({username:username}).lean()
    return exist;
   }catch(err){
       return err;
   }
}

exports.encrypt = async (password) => {
    try{
        return bcrypt.hashSync(password);
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkPassword = async (password, hash)=>{
    try{
        return bcrypt.compareSync(password, hash);
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkPermission = async (enterpriseId, sub)=>{
    try{
        if(enterpriseId != sub){
            return false;
        }else{
            return true;
        }
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkUpdate = async (enterprise)=>{
    if(enterprise.password || 
       Object.entries(enterprise).length === 0 || 
       enterprise.role){
        return false;
    }else{
        return true;
    }
}

exports.checkUpdateAdmin = async(params)=>{
    try {
        if (Object.entries(params).length === 0 || params.password) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

 exports.deleteSensitiveData = async(data)=>{
    try{
        delete data.enterprise.password;
        delete data.enterprise.role;
        return data;
    }catch(err){
        console.log(err);
        return err;
    }
}

//----------------------------- Productos Validate

exports.checkUpdateProduct = async (params) => {
    try {
        if (Object.entries(params).length === 0) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
}
}

exports.findProductOnEnterprise = async function(enterprise, product){
    try {
        const products = enterprise.products;
        let keys = Object.keys(products);
        for (let key of keys) {
            if (products[key].toString() !== product.toString()) {
                continue;
            } else {
                return products[key]._id;
            }
        }
        return undefined
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.deleteProducts = async (products) => {
    try {
        for (let product of products) {
            let productId = product._id.toString()
            await Product.findOneAndDelete({ _id: productId })
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

// ----------------------validaciones para los productos de sucursal

exports.checkUpdateBranch = async (params) => {
    try {
        if (Object.entries(params).length === 0 || params.productsBranch || params.enterprise) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
} 
exports.findProductOnBranch = async function(branch, product){
    const productsBranch = branch.productsBranch;
    let keys = Object.keys(productsBranch);

    for(let key of keys){
        if(productsBranch[key].product.toString() !== product.toString()){
            continue;
        }else{
            return productsBranch[key];
        }
    }
    return undefined
}



exports.findStockOfProductBranch = async function(branch, product){
    const productsBranch = branch.productsBranch;
    let keys = Object.keys(productsBranch);

    for(let key of keys){
        if(productsBranch[key].product.toString() !== product.toString()){
            continue;
        }else{
            return productsBranch[key].stock;
        }
    }
    return undefined
}


exports.findProductPosition = async function (branch, product) {
    const productsBranch = branch.productsBranch;
    let keys = Object.keys(productsBranch);

    for (let key of keys) {
        if (productsBranch[key].product.toString() !== product.toString()) {
            continue;
        } else {
            return key;
        }
    }
    return undefined
}

exports.findProductBranch = async (branch, productsBranchId) => {
    const productsBranch = branch.productsBranch;
    let keys = Object.keys(productsBranch);

    for (let key of keys) {
        if (productsBranch[key]._id.toString() !== productsBranchId.toString()) {
            continue;
        } else {
            return productsBranch[key];
        }
    }
    return undefined
}

