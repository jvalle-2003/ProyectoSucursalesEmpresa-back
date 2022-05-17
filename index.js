'use strict'
const app = require('./configs/app');
const mongo = require('./configs/mongoConfig');
const port = 3200;

const {  encrypt } = require('./src/utils/validate');
const Enterprise = require('./src/models/enterprise.model');

mongo.init();
app.listen(port, async () => {
    console.log(`Conectado al puerto ${port}`)

    const dataAdmin = {
        name: 'ADMIN',
        surname: 'ADMIN',
        username: 'SuperAdmin',
        email: 'ADMIN',
        password: await encrypt('123456'),
        role: 'ADMIN'
    };

        const verificarAdmin = await Enterprise.findOne({name:'ADMIN'}).lean();
        if (verificarAdmin)
        {console.log('Admin ya creado')}
        else{
        let enterprise = new Enterprise(dataAdmin);
        await enterprise.save();
        console.log('Admin Creado')}
});
