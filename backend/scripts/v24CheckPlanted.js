// Helper for the V-24 demo: reports whether a room was planted under a B_Id.
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const r = await mongoose.connection.collection('hotelrooms')
        .findOne({ B_Id: process.argv[2], name: /Planted Room/ });
    console.log(r ? 'PLANTED' : 'NONE');
    await mongoose.disconnect();
}).catch(async () => { await mongoose.disconnect().catch(() => {}); console.log('NONE'); });
