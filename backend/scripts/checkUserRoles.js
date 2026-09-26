// Read-only audit: lists the distinct `role` values stored in the users
// collection and flags any that are not in the User model's enum.
// Usage:  node scripts/checkUserRoles.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const ALLOWED_ROLES = ['Tourist', 'Bussiness', 'TourGuide', 'Admin'];

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not set in .env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    // Query the raw collection so the model's new enum cannot filter results.
    const users = mongoose.connection.collection('users');

    const counts = await users.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    console.log('\nRole values currently stored:');
    console.log('-----------------------------');

    let problems = 0;

    counts.forEach(({ _id, count }) => {
        const ok = ALLOWED_ROLES.includes(_id);
        if (!ok) problems += count;
        console.log(`  ${ok ? 'OK  ' : 'BAD '} ${JSON.stringify(_id).padEnd(20)} ${count} user(s)`);
    });

    console.log('-----------------------------');

    if (problems === 0) {
        console.log('All stored roles match the User model enum. No action needed.\n');
    } else {
        console.log(`${problems} user(s) have a role outside the enum [${ALLOWED_ROLES.join(', ')}].`);
        console.log('Updates to those documents will fail validation until the role is corrected.\n');

        const offenders = await users
            .find({ role: { $nin: ALLOWED_ROLES } }, { projection: { email: 1, role: 1 } })
            .limit(25)
            .toArray();

        console.log('Affected users (first 25):');
        offenders.forEach((u) => console.log(`  ${u._id}  ${u.email}  role=${JSON.stringify(u.role)}`));
        console.log('');
    }

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error('Audit failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
