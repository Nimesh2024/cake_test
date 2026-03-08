const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    suppliedItems: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            costPrice: { type: Number, required: true }
        }
    ],
    totalCost: { type: Number, required: true },
    supplyDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
    notes: { type: String }
}, { timestamps: true });

supplySchema.index({ supplier: 1 });
supplySchema.index({ supplyDate: 1 });

module.exports = mongoose.model('Supply', supplySchema);
