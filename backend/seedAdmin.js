const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const admin1Exists = await User.findOne({ email: 'admin@niroshasweets.lk' });

        if (admin1Exists) {
            console.log('ADMIN_EXISTS: admin@niroshasweets.lk');
        } else {
            await User.create({
                name: 'Super Admin',
                email: 'admin@niroshasweets.lk',
                password: 'adminpassword123',
                role: 'Admin'
            });
            console.log('ADMIN_CREATED: admin@niroshasweets.lk / adminpassword123');
        }

        const admin2Exists = await User.findOne({ email: 'admin@quickride.lk' });

        if (admin2Exists) {
            console.log('ADMIN_EXISTS: admin@quickride.lk');
        } else {
            await User.create({
                name: 'QuickRide Admin',
                email: 'admin@quickride.lk',
                password: 'adminpassword123',
                role: 'Admin'
            });
            console.log('ADMIN_CREATED: admin@quickride.lk / adminpassword123');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
