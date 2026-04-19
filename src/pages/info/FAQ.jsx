
import { motion } from 'framer-motion';

const FAQ = () => {
    return (
        <div className="min-h-screen bg-white py-12 lg:py-20">
            
                <title>FAQ | Vionara</title>
                <meta name="description" content="Frequently Asked Questions about Vionara Jewellery." />
            
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal mb-4">Frequently Asked Questions</h1>
                        <p className="text-gray-500">Quick answers to common questions about our products and services.</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="font-heading text-xl text-charcoal font-medium mb-2">What materials are used in Vionara Jewellery?</h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed">Our pieces are crafted using premium quality materials including hypoallergenic brass base, 18K gold and rhodium plating, and high-grade cubic zirconia (CZ), moissanite, or lab-grown diamonds depending on the specific collection.</p>
                        </div>

                        <div>
                            <h3 className="font-heading text-xl text-charcoal font-medium mb-2">Will the jewellery tarnish over time?</h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed">Unlike solid gold, all plated jewellery can naturally fade over time depending on bodily chemistry and exposure. However, our pieces feature a durable anti-tarnish coating. By following our simple Care Instructions, you can significantly extend the lifespan of your pieces.</p>
                        </div>

                        <div>
                            <h3 className="font-heading text-xl text-charcoal font-medium mb-2">Do you provide a warranty or guarantee?</h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed">Yes! All our products come with a 6-month warranty against any manufacturing defects. Please note that this does not cover accidental damage, wear and tear, or improper care (such as exposure to water or perfumes).</p>
                        </div>

                        <div>
                            <h3 className="font-heading text-xl text-charcoal font-medium mb-2">How long does shipping take?</h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed">Orders are generally dispatched within 24-48 hours. Delivery normally takes 3-5 business days across major metros in India. Check our Shipping Returns policy for more detailed timeframes.</p>
                        </div>

                        <div>
                            <h3 className="font-heading text-xl text-charcoal font-medium mb-2">How can I track my order?</h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed">Once your order has been dispatched, you will receive an email containing a Shiprocket tracking link. You can also track your order directly from your Account Dashboard on our website.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FAQ;
