import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup ES module filename/dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// Define Schemas inline for standalone script
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
});
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    price: Number,
    mrp: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [String],
    stock: Number,
    isFeatured: Boolean,
    isBestseller: Boolean,
    isActive: { type: Boolean, default: true },
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const main = async () => {
    if (!MONGODB_URI) {
        console.error('Missing MONGODB_URI. Cannot seed.');
        process.exit(1);
    }
    
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB.');

        // 1. Wipe existing categories & products
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Wiped existing Categories and Products.');

        // 2. Create Categories with Cloudinary images
        const catNecklaces = await Category.create({
            name: 'Necklaces',
            slug: 'necklaces',
            description: 'Premium designer necklaces.',
            image: 'https://res.cloudinary.com/dosqjayxq/image/upload/v1738221000/product-necklace_ab32z1.jpg'
        });

        const catRings = await Category.create({
            name: 'Rings',
            slug: 'rings',
            description: 'Elegant golden diamond rings.',
            image: 'https://res.cloudinary.com/dosqjayxq/image/upload/v1738221000/product-ring_c21azq.jpg'
        });

        console.log('Created Categories.');

        // 3. Create Products with Cloudinary images
        await Product.create({
            name: 'Aurora Diamond Necklace',
            slug: 'aurora-diamond-necklace',
            description: 'An elegant piece featuring a brilliant cut diamond encased in 18k solid gold.',
            price: 75000,
            mrp: 95000,
            category: catNecklaces._id,
            images: [
                'https://res.cloudinary.com/dosqjayxq/image/upload/v1738321001/necklace-1_xajh2a.jpg',
                'https://res.cloudinary.com/dosqjayxq/image/upload/v1738321001/necklace-2_zhjkwl.jpg'
            ],
            stock: 12,
            isFeatured: true,
            isBestseller: true,
        });

        await Product.create({
            name: 'Solitaire Engagement Ring',
            slug: 'solitaire-engagement-ring',
            description: 'A timeless solitaire engagement ring with a 1ct diamond in white gold.',
            price: 115000,
            mrp: 135000,
            category: catRings._id,
            images: [
                'https://res.cloudinary.com/dosqjayxq/image/upload/v1738321002/ring-1_zxjhkq.jpg',
                'https://res.cloudinary.com/dosqjayxq/image/upload/v1738321002/ring-2_plmnbv.jpg'
            ],
            stock: 5,
            isFeatured: true,
            isBestseller: true,
        });

        console.log('Created Seed Products successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

main();
