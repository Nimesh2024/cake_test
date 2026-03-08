const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Supplier = require('../models/Supplier');
const Supply = require('../models/Supply');
const Product = require('../models/Product');

async function migrate() {
    try {
        console.log('Connecting to MONGO_URI from .env...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const supplies = await Supply.find().lean();
        console.log(`Found ${supplies.length} supply records`);

        const supplierProductsMap = {};

        for (const supply of supplies) {
            const supplierId = supply.supplier.toString();
            if (!supplierProductsMap[supplierId]) {
                supplierProductsMap[supplierId] = new Set();
            }
            for (const item of supply.suppliedItems) {
                if (item.product) {
                    supplierProductsMap[supplierId].add(item.product.toString());
                }
            }
        }

        for (const [supplierId, products] of Object.entries(supplierProductsMap)) {
            const productIds = Array.from(products);
            await Supplier.findByIdAndUpdate(supplierId, {
                $addToSet: { suppliedProducts: { $each: productIds } }
            });
            console.log(`Updated wholesaler ${supplierId} with ${productIds.length} products`);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
