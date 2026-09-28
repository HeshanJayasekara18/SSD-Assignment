// Helper for the V-24 demo: prints one vehicle's state as pipe-separated values.
//   modelName|priceDay|status|B_Id   (or MISSING when deleted)
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const v = await mongoose.connection.collection('vehicles').findOne({ V_Id: process.argv[2] });
    console.log(v ? [v.modelName, v.priceDay, v.status, v.B_Id].join('|') : 'MISSING');
    await mongoose.disconnect();
}).catch(async () => { await mongoose.disconnect().catch(() => {}); console.log('MISSING'); });
