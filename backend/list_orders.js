const mongoose = require('mongoose');
const Order = require('./models/Order');

async function listOrders() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cakeshop');
        const orders = await Order.find({});

        if (orders.length === 0) {
            console.log('No orders found in the database.');
        } else {
            console.log('Current Orders:');
            orders.forEach(order => {
                console.log(`- ID: ${order._id}`);
                console.log(`  Customer: ${order.customerName}`);
                console.log(`  Status: ${order.orderStatus}`);
                console.log(`  Total: ${order.totalAmount}`);
                console.log('-------------------------');
            });
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

listOrders();
