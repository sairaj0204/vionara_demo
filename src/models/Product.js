import mongoose from 'mongoose';
import slugify from 'slugify';

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [String],
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    material: { type: String, default: 'Gold Plated' },
    weight: { type: String, default: '' },
    purity: { type: String, default: '' },
    stone: { type: String, default: '' },
    stoneWeight: { type: String, default: '' },
    size: { type: String, default: '' },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    tags: [String],
    sku: { type: String, unique: true },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });

/**
 * Auto-generate slug before validation.
 *
 * IMPORTANT — Mongoose middleware rules:
 *  - Use a regular `function` (NOT arrow) so `this` refers to the document.
 *  - When the function is `async`, Mongoose uses the *returned Promise* to
 *    know when the hook is done. Do NOT call next() — it will be `undefined`
 *    and calling it throws "next is not a function".
 */
productSchema.pre('validate', async function () {
    if (this.isModified('name') || !this.slug) {
        let baseSlug = slugify(this.name || 'product', { lower: true, strict: true });
        if (!baseSlug) baseSlug = 'product';

        let slug = baseSlug;

        // Check for existing slug to guarantee uniqueness
        const existing = await mongoose.models.Product.findOne({
            slug,
            _id: { $ne: this._id },
        });

        if (existing) {
            // Append a 6-char random alphanumeric suffix to avoid collisions
            const suffix = Math.random().toString(36).substring(2, 8);
            slug = `${baseSlug}-${suffix}`;
        }

        this.slug = slug;
    }
    // No next() — async middleware resolves via the returned Promise
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
