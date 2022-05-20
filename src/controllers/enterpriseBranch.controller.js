'use strict'

const EnterpriseBranch = require('../models/enterpriseBranch.model');
const validate = require('../utils/validate'); 

exports.test = (req, res)=>{
    return res.send({message: 'Function test is running'});
}

// ---------------------------------CRUD empresa sucursal---------------------------------------------------
exports.addEnterpriseBranch = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            enterprise: req.enterprise.sub,
            name: params.name,
            direction: params.direction
        }
        const msg = validate.validateData(data);
        if (!msg) {
            const enterpriseBranch = new EnterpriseBranch(data);
            await enterpriseBranch.save();
            return res.send({ message: 'Branch successfully created', enterpriseBranch });
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving branch' });
    }
}



exports.updateEnterpriseBranch = async (req, res) => {
    try {
        const enterpriseBranchId = req.params.id;
        const params = req.body;
        const enterpriseId = req.enterprise.sub

        const checkEnterpriseBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId })
        if (checkEnterpriseBranch === null || checkEnterpriseBranch.enterprise != enterpriseId) {
            return res.status(400).send({ message: 'You cant update this branch' })
        } else {
            const checkUpdateBranch = await validate.checkUpdateBranch(params);
            if (!checkUpdateBranch) {
                return res.status(400).send({ message: 'Invalid params' })
            } else {
                const updateEnterpriseBranch = await EnterpriseBranch.findOneAndUpdate({ _id: enterpriseBranchId }, params, { new: true }).lean();
                if (!updateEnterpriseBranch) {
                    return res.status(400).send({ message: 'Failed to update branch' })
                } else {
                    return res.send({ message: 'Branch updated: ', updateEnterpriseBranch });
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error updating branch' })
    }
}


exports.deleteEnterpriseBranch = async (req, res) => {
    try {
        const enterpriseId = req.enterprise.sub;
        const enterpriseBranchId = req.params.id;
        const checkEnterpriseBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId });

        if (checkEnterpriseBranch.enterprise != enterpriseId || checkEnterpriseBranch === null) {
            return res.status(400).send({ message: 'You cannot delete this branch or it has already been deleted' })
        } else {
            const deleteEnterpriseBranch= await EnterpriseBranch.findOneAndDelete({ _id: enterpriseBranchId });
            if (!deleteEnterpriseBranch) {
                return res.status(500).send({ message: 'Branch not found or already deleted' })
            } else {
                return res.send({ message: 'Branch deleted successfully ', deleteEnterpriseBranch })
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Error deleting branch' });;
    }
}


exports.getEnterprisesBranch = async (req, res) =>{
    try{
        const enterpriseId = req.enterprise.sub;
        const enterprisesBranch= await EnterpriseBranch.find({enterprise: enterpriseId});
        if (!enterprisesBranch) {
            return res.status(400).send({ message: 'Branches not found' });
        } else {
            return res.send({ message: 'Branches found', enterprisesBranch })
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error getting Branches'});
    }
}

exports.getEnterpriseBranch = async (req, res)=>{ 
    try {
        const enterpriseBranchId = req.params.id; 
        console.log(enterpriseBranchId);
        const enterpriseId = req.enterprise.sub;
        const CheckEnterpriseBranch = await EnterpriseBranch.findOne({_id: enterpriseBranchId}).lean(); 
        if (CheckEnterpriseBranch === null || CheckEnterpriseBranch.enterprise  != enterpriseId) {
            return res.send({message: 'You cant see the branch '}); 
        } else {
            const enterpriseBranch = await EnterpriseBranch.findOne({ _id: enterpriseBranchId });
            if (!enterpriseBranch) {
                return res.status(400).send({ message: 'branch not found' });
            } else {
                return res.send({ message: 'Branch found:', enterpriseBranch })
            }
        }
    } catch (error) {
        console.log(error); 
        return res.status(500).send({ message: 'Error searching branch' });;
    }
}