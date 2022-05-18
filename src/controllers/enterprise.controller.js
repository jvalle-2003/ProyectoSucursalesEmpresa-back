'use strict'

const Enterprise = require('../models/enterprise.model');
const validate = require('../utils/validate');
const jwt = require('../services/jwt');

//FUNCIONES PÚBLICAS

exports.test = async (req, res) => {
    await res.send({ message: 'Controller run' })
}


exports.register = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            name: params.name,
            type: params.type,
            username: params.username,
            email: params.email,
            password: params.password,
            role: 'EMPRESA'
        };
        let msg = validate.validateData(data);

        if (msg) return res.status(400).send(msg);
        let already = await validate.alreadyEnterprise(data.username);
        if (already) return res.status(400).send({ message: 'Username already in use' });
        data.phone = params.phone;
        data.password = await validate.encrypt(params.password);

        let enterprise = new Enterprise(data);
        await enterprise.save();
        return res.send({ message: 'Enterprise created successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving enterprise' });
    }
}

exports.login = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            username: params.username,
            password: params.password
        }
        let msg = validate.validateData(data);

        if (msg) return res.status(400).send(msg);
        let already = await validate.alreadyEnterprise(params.username);
        if (already && await validate.checkPassword(data.password, already.password)) {
            let token = await jwt.createToken(already);
            delete already.password;

            return res.send({ token, message: 'Login successfuly', already });
        } else return res.status(401).send({ message: 'Invalid credentials' });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Failed to login' });
    }
}

//FUNCIONES PRIVADAS
//------------------------------------------ENTERPRISE----------------------------------

exports.update = async (req, res) => {
    try {
        const enterpriseId = req.params.id;
        const params = req.body;

        const permission = await validate.checkPermission(enterpriseId, req.enterprise.sub);
        if (permission === false) return res.status(401).send({ message: 'You dont have permission to update this enterprise' });
        const enterpriseExist = await Enterprise.findOne({ _id: enterpriseId });
        if (!enterpriseExist) return res.send({ message: 'Enterprise not found' });
        const validateUpdate = await validate.checkUpdate(params);
        if (validateUpdate === false) return res.status(400).send({ message: 'Cannot update this information or invalid params' });
        let alreadyname = await validate.alreadyEnterprise(params.username);
        if (alreadyname && enterpriseExist.username != params.username) return res.send({ message: 'Username already in use' });
        const enterpriseUpdate = await Enterprise.findOneAndUpdate({ _id: enterpriseId }, params, { new: true }).lean();
        if (enterpriseUpdate) return res.send({ message: 'enterprise updated', enterpriseUpdate });
        return res.send({ message: 'enterprise not updated' });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Failed to update enterprise' });
    }
}

exports.delete = async (req, res) => {
    try {
        const enterpriseId = req.params.id;
        const persmission = await validate.checkPermission(enterpriseId, req.enterprise.sub);
        if (persmission === false) return res.status(403).send({ message: 'You dont have permission to delete this enterprise' });
        const enterpriseDeleted = await Enterprise.findOneAndDelete({ _id: enterpriseId });
        if (enterpriseDeleted) return res.send({ message: 'Enterprise deleted', enterpriseDeleted });
        return res.send({ message: 'Enterprise not found or already deleted' });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error deleting enterprise' });
    }
}

exports.myEnterprise = async (req, res) => {
    try {
        const enterpriseId = req.enterprise.sub;
        const enterprise = await Enterprise.findOne({ _id: enterpriseId }).lean();
        delete enterprise.products;
        delete enterprise.password;
        delete enterprise.role;
        delete enterprise.__v
        if (!enterprise) {
            return res.send({ message: 'The entered enterprise could not be found' })
        } else {
            return res.send({ message: 'Enterprise:  ', enterprise });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error getting enterprise' });
    }
};

//FUNCIONES PRIVADAS
//--------------------------------------ADMIN-----------------------------------------

exports.saveEnterprise = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name,
            type: params.type,
            username: params.username,
            email: params.email,
            password: params.password,
            role: params.role
        };
        const msg = validate.validateData(data);
        if (msg) return res.status(400).send(msg);
        const enterpriseExist = await validate.alreadyEnterprise(params.username);
        if (enterpriseExist) return res.send({ message: 'Username already in use' });
        if (params.role != 'ADMIN' && params.role != 'EMPRESA') return res.status(400).send({ message: 'Invalid role' });
        data.phone = params.phoe;
        data.password = await validate.encrypt(params.password);

        const enterprise = new Enterprise(data);
        await enterprise.save();
        return res.send({ message: 'Enterprise saved successfully', enterprise });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving enterprise' });
    }
}

exports.updateEnterprise = async (req, res) => {
    try {
        const enterpriseId = req.params.id;
        const params = req.body;

        const enterpriseExist = await Enterprise.findOne({ _id: enterpriseId });
        if (!enterpriseExist) return res.send({ message: 'Enterprise not found' });
        const emptyParams = await validate.checkUpdateAdmin(params);
        if (emptyParams === false) return res.status(400).send({ message: 'Empty params or params not update' });
        if (enterpriseExist.role === 'ADMIN') return res.send({ message: 'enterprise with ADMIN role cant update' });
        const alreadyUsername = await validate.alreadyEnterprise(params.username);
        if (alreadyUsername && enterpriseExist.username != alreadyUsername.username) return res.send({ message: 'Username already taken' });
        if (params.role != 'ADMIN' && params.role != 'EMPRESA') return res.status(400).send({ message: 'Invalid role' });
        const enterpriseUpdated = await Enterprise.findOneAndUpdate({ _id: enterpriseId }, params, { new: true });
        if (!enterpriseUpdated) return res.send({ message: ' Enterprise not updated' });
        return res.send({ message: 'Enterprise updated successfully', username: enterpriseUpdated.username });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error updating enterprise' });
    }
}

exports.deleteEnterprise = async (req, res) => {
    try {
        const enterpriseId = req.params.id;

        const enterpriseExist = await Enterprise.findOne({ _id: enterpriseId });
        if (!enterpriseExist) return res.send({ message: 'Enterprise not found' });
        if (enterpriseExist.role === 'ADMIN') return res.send({ message: ' Could not detel enterprise with ADMIN role' });
        const enterpriseDeleted = await Enterprise.findOneAndDelete({ _id: enterpriseId });
        if (!enterpriseDeleted) return res.send({ message: 'Enterprise not deleted' });
        return res.send({ message: 'Account deleted successfully', enterpriseDeleted })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error removing account' });
    }
}

exports.getEnterprise = async (req, res) => {
    try {
        const enterpriseId = req.params.id;

        const enterprise = await Enterprise.findOne({ _id: enterpriseId });
        if (!enterprise) {
            return res.send({ message: 'The entered company could not be found' })
        } else {
            return res.send(enterprise);
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error getting company' });
    }
};

exports.getEnterprises = async (req, res) => {
    try {
        const enterprises = await Enterprise.find();
        return res.send(enterprises)
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error getting companies' });
    }
};
