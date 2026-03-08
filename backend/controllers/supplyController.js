const Supply = require('../models/Supply');
const Product = require('../models/Product');
const InventoryHistory = require('../models/InventoryHistory');

exports.createSupply = async (req, res) => {
    try {
        const supplyData = req.body;
        const supply = new Supply(supplyData);
        await supply.save();

        // Update inventory for supplied items
        for (const item of supplyData.suppliedItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stockQuantity += Number(item.quantity);
                await product.save();

                const history = new InventoryHistory({
                    product: product._id,
                    type: 'IN',
                    quantity: item.quantity,
                    reason: `Supply Received: ${supply._id}`
                });
                await history.save();
            }
        }

        res.status(201).json(await Supply.findById(supply._id).populate('supplier').populate('suppliedItems.product'));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getSupplies = async (req, res) => {
    try {
        const supplies = await Supply.find().populate('supplier').populate('suppliedItems.product');
        res.json(supplies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSupplyById = async (req, res) => {
    try {
        const supply = await Supply.findById(req.params.id).populate('supplier').populate('suppliedItems.product');
        if (!supply) return res.status(404).json({ message: 'Supply not found' });
        res.json(supply);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSupply = async (req, res) => {
    try {
        const supply = await Supply.findByIdAndDelete(req.params.id);
        if (!supply) return res.status(404).json({ message: 'Supply not found' });
        res.json({ message: 'Supply record deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
