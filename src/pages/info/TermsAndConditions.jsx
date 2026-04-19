
import { motion } from 'framer-motion';

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-white py-12 lg:py-20">
            
                <title>Terms & Conditions | Vionara</title>
                <meta name="description" content="View the Vionara Jewellery Terms & Conditions." />
            
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal mb-4">Terms & Conditions</h1>
                        <p className="text-gray-500">Last Updated: March 2026</p>
                    </div>

                    <div className="prose prose-sm sm:prose-base text-gray-600">
                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p>Welcome to Vionara Jewellery. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before making any purchases.</p>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">2. Product Information and Pricing</h2>
                        <p>We make every effort to display the colors, specifications, and dimensions of our artificial jewellery accurately. However, we cannot guarantee that your monitor's display of any color will be wholly accurate. All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Prices are subject to change without notice.</p>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">3. Intellectual Property</h2>
                        <p>The Site and its original content, features, and functionality are owned by Vionara Jewellery and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. No part of our catalog, photography, or branding may be reproduced without explicit written consent.</p>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">4. Limitation of Liability</h2>
                        <p>In no event shall Vionara Jewellery, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">5. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of India, specifically under the jurisdiction of the courts in Mumbai, Maharashtra, without regard to its conflict of law provisions.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
