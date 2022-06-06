'use strict'

const Enterprise = require('../models/enterprise.model');
const EnterpriseBranch = require('../models/enterpriseBranch.model')
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
        const enterpriseId = req.enterprise.sub;
        const params = req.body;

        const enterprise = await Enterprise.findOne({ _id: enterpriseId })
        if (enterprise) {
            const checkUpdated = await validate.checkUpdate(params);
            if (checkUpdated === false) {
                return res.status(400).send({ message: 'Parámetros no válidos para actualizar' })
            } else {
                const checkRole = await Enterprise.findOne({ _id: enterpriseId })
                if (checkRole.role === 'ADMIN') {
                    return res.status(403).send({ message: 'No puedes editar tu usuario si tienes el rol ADMIN' });
                } else {
                    const checkEnterprise = await validate.alreadyEnterprise(params.username);
                    if (checkEnterprise && enterprise.username != params.username) {
                        return res.status(201).send({ message: 'Este nombre de usuario ya esta en uso' })
                    } else {
                        const updateEnterprise = await Enterprise.findOneAndUpdate({ _id: enterpriseId }, params, { new: true }).lean();
                        if (!updateEnterprise) {
                            return res.status(403).send({ message: 'No se ha podido actualizar el usuario' })
                        } else {
                            return res.send({ message: 'Usuario actualizado', updateEnterprise })
                        }
                    }
                }
            }
        } else {
            return res.send({ message: 'Este usuario no existe' })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando el usuario' });
    }
};

exports.delete = async (req, res) => {
    try {
        const enterpriseId = req.enterprise.sub;

        const checkRole = await Enterprise.findOne({ _id: enterpriseId })
        if (checkRole.role === 'ADMIN') {
            return res.status(403).send({ message: 'No puede eliminar usuarios de rol ADMIN' });
        } else {
            await EnterpriseBranch.deleteMany({ enterprise: enterpriseId })
            const deleteEnterprise = await Enterprise.findOneAndDelete({ _id: enterpriseId });
            if (!deleteEnterprise) {
                return res.status(500).send({ message: 'Usuario no encontrado' })
            } else {
                return res.send({ message: 'Cuenta eliminada' })
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando el usuario' });
    }
};

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
        const alreadyUsername = await Enterprise.findOne({ _id: enterpriseId, username: params.username });
        if (alreadyUsername && enterpriseExist.username != alreadyUsername.username) return res.send({ message: 'Username already taken' });
        if (params.role != 'ADMIN' && params.role != 'EMPRESA') return res.status(400).send({ message: 'Invalid role' });
        const enterpriseU = await Enterprise.findOneAndUpdate({ _id: enterpriseId }, params, { new: true });
        if (!enterpriseU) return res.status(400).send({ message: 'Enterprise not updated' });
        return res.send({ message: 'Enterprise updated successfully', enterpriseU});

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
        
        const enterpriseDeleted = await Enterprise.findOneAndDelete({ _id: enterpriseId });
        if (!enterpriseDeleted) return res.status(400).send({ message: 'Enterprise not deleted' });
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
        console.log(enterprise)
        if (!enterprise) {
            return res.send({ message: 'The entered company could not be found' })
        } else {
            return res.send({enterprise});
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error getting company' });
    }
};

exports.getEnterprises = async (req, res) => {
    try {
        const enterprisesExist = await Enterprise.find();
        return res.send({message: 'Enterprise:', enterprisesExist})
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error getting companies' });
    }
};

