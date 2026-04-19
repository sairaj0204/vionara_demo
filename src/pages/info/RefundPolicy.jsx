
import { motion } from 'framer-motion';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-white py-12 lg:py-20">
            
                <title>Refund Policy | Vionara</title>
                <meta name="description" content="Read the Return and Refund policy for Vionara Jewellery." />
            
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal mb-4">Refund Policy</h1>
                        <p className="text-gray-500">Last Updated: March 2026</p>
                    </div>

                    <div className="prose prose-sm sm:prose-base text-gray-600">
                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">1. 15-Day Return Window</h2>
                        <p>At Vionara, we stand behind the quality of our artificial jewellery. We offer a hassle-free 15-day return policy. If you are not completely satisfied with your purchase, you may return the unused item in its original condition within 15 days of delivery for a full refund.</p>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">2. Conditions for Return</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Items must be unworn, undamaged, and in their original packaging.</li>
                            <li>All original tags and certificates must remain intact.</li>
                            <li>Customized, engraved, or personalized pieces are final sale and cannot be returned or refunded.</li>
                        </ul>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">3. Refund Process</h2>
                        <p>Once your returned item is received and inspected at our Mumbai facility, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed and automatically applied to your original method of payment within 5-7 business days.</p>

                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">4. Defective or Damaged Items</h2>
                        <p>If you receive a damaged or defective item, please contact us immediately within 48 hours of delivery at support@vionara.com with photographic evidence. We will arrange for a prompt replacement or refund at our expense.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RefundPolicy;
