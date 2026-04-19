import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // allow guest tickets
        },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true, default: '' },

        category: {
            type: String,
            enum: [
                'order-tracking',
                'cancel-order',
                'exchange-request',
                'payment-issue',
                'product-query',
                'other',
            ],
            required: true,
        },

        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },

        // Optional order reference for exchange / order issues
        orderNumber: { type: String, trim: true, default: '' },

        // Ticket lifecycle
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'resolved', 'closed'],
            default: 'pending',
        },

        // Admin notes / reply (internal)
        adminNote: { type: String, default: '' },

        ticketNumber: { type: String, unique: true },
    },
    { timestamps: true }
);

// In Next.js dev mode, hot-reload re-executes this module but the Mongoose model
// registry persists across reloads (it lives on the DB connection). Deleting the
// cached model here ensures the schema (and its middleware) is always re-registered.
if (mongoose.models.SupportTicket) {
    delete mongoose.models.SupportTicket;
}

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
