const mongoose = require('mongoose');
const Supplier = require('../backend/models/Supplier');
const Supply = require('../backend/models/Supply');
require('dotenv').config({ path: '../backend/.env' });

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const supplies = await Supply.find().lean();
        const supplierProductsMap = {};

        for (const supply of supplies) {
            const supplierId = supply.supplier.toString();
            if (!supplierProductsMap[supplierId]) {
                supplierProductsMap[supplierId] = new Set();
            }
            for (const item of supply.suppliedItems) {
                supplierProductsMap[supplierId].add(item.product.toString());
            }
        }

        for (const [supplierId, products] of Object.entries(supplierProductsMap)) {
            const productIds = Array.from(products);
            await Supplier.findByIdAndUpdate(supplierId, {
                $addToSet: { suppliedProducts: { $each: productIds } }
            });
            console.log(`Updated supplier ${supplierId} with ${productIds.length} products`);
        }

        console.log('Migration completed');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
