import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
    size: String,
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
    },
    isPaid: { type: Boolean, default: false },
    paymentInfo: {
        method: { type: String, default: 'razorpay' },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        status: { type: String, default: 'pending' },
    },
    itemsTotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    totalAmount: { type: Number, required: true },
    orderStatus: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'],
        default: 'pending',
    },
    trackingNumber: String,
    trackingUrl: String,
    courierName: String,
    shiprocketOrderId: String,
    awbCode: String,
    shipmentStatus: String,
    expectedDeliveryDate: Date,
    estimatedDelivery: Date,
    deliveredAt: Date,
    statusHistory: [{
        status: String,
        date: { type: Date, default: Date.now },
        note: String,
    }],
    notes: String,
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
