const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // Clear existing data (optional, but good for a fresh start)
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Supplier.deleteMany({});
        console.log('Cleared existing Categories, Products, and Suppliers...');

        // 1. Seed Categories
        const categories = await Category.insertMany([
            { name: 'Cake', description: 'Freshly baked cakes and pastries' },
            { name: 'Sweet', description: 'Traditional and modern Indian sweets' },
            { name: 'Chocolate', description: 'Handcrafted chocolates and truffles' },
            { name: 'Biscuit', description: 'Crispy and delicious biscuits' },
            { name: 'Gift', description: 'Curated gift hampers and sets' }
        ]);
        console.log('Categories seeded...');

        // 2. Seed Suppliers
        const suppliers = await Supplier.insertMany([
            { supplierName: 'Dairy Fresh Co.', phone: '0112345678', address: '123 Milky Way, Colombo', email: 'sales@dairyfresh.lk' },
            { supplierName: 'Sweet Ingredients Ltd.', phone: '0118765432', address: '45 Sugar Lane, Kandy', email: 'orders@sweetingredients.com' },
            { supplierName: 'Premium Packaging', phone: '0115556667', address: '78 Box Road, Gampaha', email: 'hello@premiumpack.lk' }
        ]);
        console.log('Suppliers seeded...');

        // 3. Seed Products
        const productData = [
            // Cakes
            { productName: 'Chocolate Fudge Cake', category: categories[0]._id, price: 2500, costPrice: 1500, stockQuantity: 10, status: 'Active' },
            { productName: 'Red Velvet Cake', category: categories[0]._id, price: 2800, costPrice: 1700, stockQuantity: 5, status: 'Active' },
            { productName: 'Vanilla Sponge Cake', category: categories[0]._id, price: 1800, costPrice: 1000, stockQuantity: 15, status: 'Active' },

            // Sweets
            { productName: 'Gulab Jamun (1kg)', category: categories[1]._id, price: 1200, costPrice: 700, stockQuantity: 20, status: 'Active' },
            { productName: 'Kaju Katli (500g)', category: categories[1]._id, price: 1500, costPrice: 900, stockQuantity: 12, status: 'Active' },
            { productName: 'Laddu (Box of 12)', category: categories[1]._id, price: 800, costPrice: 400, stockQuantity: 25, status: 'Active' },

            // Chocolates
            { productName: 'Dark Chocolate Truffles', category: categories[2]._id, price: 1500, costPrice: 800, stockQuantity: 30, status: 'Active' },
            { productName: 'Milk Chocolate Bar', category: categories[2]._id, price: 350, costPrice: 200, stockQuantity: 50, status: 'Active' },

            // Biscuits
            { productName: 'Butter Cookies', category: categories[3]._id, price: 450, costPrice: 250, stockQuantity: 40, status: 'Active' },
            { productName: 'Chocolate Chip Biscuits', category: categories[3]._id, price: 500, costPrice: 300, stockQuantity: 35, status: 'Active' },

            // Gifts
            { productName: 'Wedding Gift Hamper', category: categories[4]._id, price: 5500, costPrice: 3500, stockQuantity: 8, status: 'Active' },
            { productName: 'Assorted Sweet Box (Large)', category: categories[4]._id, price: 3200, costPrice: 2000, stockQuantity: 12, status: 'Active' }
        ];

        await Product.insertMany(productData);
        console.log('Products seeded...');

        // 4. Seed a Staff User if doesn't exist
        const staffExists = await User.findOne({ email: 'staff@niroshasweets.lk' });
        if (!staffExists) {
            await User.create({
                name: 'Sample Staff',
                email: 'staff@niroshasweets.lk',
                password: 'staffpassword123',
                role: 'Staff'
            });
            console.log('Sample Staff created: staff@niroshasweets.lk / staffpassword123');
        } else {
            console.log('Staff user already exists.');
        }

        console.log('Database seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedData();
