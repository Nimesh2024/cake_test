const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

const test = async () => {
    try {
        console.log('--- Step 1: Login ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@niroshasweets.lk',
            password: 'adminpassword123'
        });

        const token = loginRes.data.token;
        console.log('Login successful, token received.');

        console.log('\n--- Step 2: Fetch Orders ---');
        const ordersRes = await axios.get(`${API_URL}/orders`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log(`Fetch successful! Received ${ordersRes.data.length} orders.`);
        if (ordersRes.data.length > 0) {
            console.log('First order ID:', ordersRes.data[0]._id);
        }
    } catch (error) {
        console.error('\n--- Error occurred ---');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
};

test();
