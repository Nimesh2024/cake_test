const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        if (users.length === 0) {
            console.log('NO_USERS_FOUND');
        } else {
            users.forEach(u => {
                console.log(`USER: ${u.email} | ROLE: ${u.role}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
