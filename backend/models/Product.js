const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    unit: { type: String, enum: ['Unit', 'kg'], default: 'Unit' },
    stockQuantity: { type: Number, default: 0 },
    expiryDate: { type: Date },
    image: { type: String },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });

productSchema.index({ productName: 'text' });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
