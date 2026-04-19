
import { motion } from 'framer-motion';

const ShippingReturns = () => {
    return (
        <div className="min-h-screen bg-white py-12 lg:py-20">
            
                <title>Shipping & Returns | Vionara</title>
                <meta name="description" content="Shipping details and Returns policy for Vionara Jewellery." />
            
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal mb-4">Shipping & Returns</h1>
                        <p className="text-gray-500">Your guide to delivery times and return processes.</p>
                    </div>

                    <div className="prose prose-sm sm:prose-base text-gray-600">
                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">1. Domestic Shipping within India</h2>
                        <p>We are proud to offer <strong>Free Shipping</strong> on all domestic orders across India. Orders are processed within 1-2 business days. Estimated transit times are:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Metropolitan Cities (Mumbai, Delhi, Bangalore, etc.): 2-4 Business Days</li>
                            <li>Tier 2 and Tier 3 Cities: 4-6 Business Days</li>
                            <li>Remote / Northeast Regions: 7-10 Business Days</li>
                        </ul>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">2. Order Tracking</h2>
                        <p>Once your order ships, you will receive a confirmation email containing your Shiprocket Airway Bill (AWB) number and a direct tracking link. Our delivery partners will also keep you updated via SMS regarding your package's arrival.</p>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">3. International Shipping</h2>
                        <p>At this time, Vionara exclusively ships within India. We are rapidly working to expand our logistics network internationally in the near future.</p>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">4. Return Process Summary</h2>
                        <p>As per our full Refund Policy, you have 15 days from the date of delivery to request a return. The process is simple:</p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Log into your account and navigate to "My Orders" to initiate a return request.</li>
                            <li>Wait for email approval within 24 hours.</li>
                            <li>Our courier partner will arrange a reverse pickup from your original delivery address within 2-3 business days.</li>
                            <li>Ensure the item is safely packed in its original Vionara box with all tags intact.</li>
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ShippingReturns;
