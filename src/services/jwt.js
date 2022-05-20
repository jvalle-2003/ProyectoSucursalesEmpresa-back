'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'SecretKeyToExample';

exports.createToken = async (enterprise)=>{
    try{
        const payload = {
            sub: enterprise._id,
            name: enterprise.name,
            type: enterprise.type,
            username: enterprise.username,
            email: enterprise.emai,
            password: enterprise.password,
            role: enterprise.role,
            phone: enterprise.phone,
            iat: moment().unix(),
            exp: moment().add(15, 'hour').unix()
        }
        return jwt.encode(payload, secretKey);
    }catch(err){
        console.log(err);
        return err
    }
    
}