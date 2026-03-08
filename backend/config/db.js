const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connString = process.env.MONGO_URI;

        if (!connString) {
            console.error('ERROR: MONGO_URI is not defined in .env file');
            process.exit(1);
        }

        const conn = await mongoose.connect(connString);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { connectDB };
