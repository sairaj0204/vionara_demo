
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-white py-12 lg:py-20">
            
                <title>Privacy Policy | Vionara</title>
                <meta name="description" content="View the Vionara Jewellery Privacy Policy." />
            
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal mb-4">Privacy Policy</h1>
                        <p className="text-gray-500">Last Updated: March 2026</p>
                    </div>

                    <div className="prose prose-sm sm:prose-base text-gray-600">
                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">1. Information We Collect</h2>
                        <p>Vionara Jewellery respects your privacy and is committed to protecting your personal data. We collect information you provide directly to us when you create an account, make a purchase, sign up for our newsletter, or contact our customer support team. This includes your name, email address, postal address, phone number, and payment details.</p>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">2. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Process and fulfill your jewellery orders securely.</li>
                            <li>Communicate with you regarding our products, services, offers, and promotions.</li>
                            <li>Provide personalized styling recommendations tailored to your taste.</li>
                            <li>Detect, investigate, and prevent fraudulent transactions and unauthorized activities.</li>
                        </ul>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">3. Data Sharing</h2>
                        <p>We do not sell, trade, or rent your personal identification information to others. We securely share generic aggregated demographic data with trusted shipping partners, payment gateways, and necessary logistical providers required to deliver your orders.</p>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">4. Your Rights</h2>
                        <p>Depending on your location, you may have rights under applicable privacy laws (like the DPDP Act in India or GDPR) to access, correct, delete, or restrict the processing of your personal data. You can exercise these rights by contacting us at privacy@vionara.com.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
