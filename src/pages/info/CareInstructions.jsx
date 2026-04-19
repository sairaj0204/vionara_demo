
import { motion } from 'framer-motion';
import { HiOutlineSparkles, HiOutlineBeaker, HiOutlineHeart } from 'react-icons/hi';

const CareInstructions = () => {
    return (
        <div className="min-h-screen bg-white py-12 lg:py-20">
            
                <title>Care Instructions | Vionara</title>
                <meta name="description" content="How to care for your Vionara artificial jewellery." />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                    <div className="text-center">
                        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal mb-4">Care Instructions</h1>
                        <p className="text-gray-500 max-w-xl mx-auto">Vionara jewellery is designed to last, but like all fine crafted artificial pieces, it requires gentle love and care to maintain its brilliance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        <div className="bg-ivory p-8 text-center border-t-2 border-gold hover:shadow-lg transition-shadow">
                            <HiOutlineSparkles size={40} className="mx-auto text-gold mb-4" />
                            <h3 className="font-heading text-lg font-medium text-charcoal mb-3">Keep It Dry</h3>
                            <p className="text-gray-600 text-sm">Always remove your jewellery before washing your hands, swimming, showering, or exercising. Water and sweat can accelerate the fading of gold and rhodium platings.</p>
                        </div>

                        <div className="bg-ivory p-8 text-center border-t-2 border-gold hover:shadow-lg transition-shadow">
                            <HiOutlineBeaker size={40} className="mx-auto text-gold mb-4" />
                            <h3 className="font-heading text-lg font-medium text-charcoal mb-3">Avoid Chemicals</h3>
                            <p className="text-gray-600 text-sm">Wait for perfumes, lotions, sanitizers, and cosmetics to dry completely before putting on your pieces. Direct contact with harsh chemicals can dull stones and strip plating.</p>
                        </div>

                        <div className="bg-ivory p-8 text-center border-t-2 border-gold hover:shadow-lg transition-shadow">
                            <HiOutlineHeart size={40} className="mx-auto text-gold mb-4" />
                            <h3 className="font-heading text-lg font-medium text-charcoal mb-3">Store Safely</h3>
                            <p className="text-gray-600 text-sm">When not wearing your jewellery, store it in its original Vionara dust bag or a soft-lined jewellery box. Keep pieces separated to prevent scratching and tangling.</p>
                        </div>
                    </div>

                    <div className="prose prose-sm sm:prose-base text-gray-600 max-w-3xl mx-auto mt-12 bg-gray-50 p-8 rounded-sm">
                        <h2 className="text-charcoal font-heading text-xl mb-4">How to Clean Your Jewellery</h2>
                        <p>If your piece loses its shine over time due to natural dust or oil buildup:</p>
                        <ul className="list-decimal pl-5 space-y-2">
                            <li>Use a dry, soft microfiber cloth (like the ones used for eyeglasses) to gently buff the surface.</li>
                            <li>For stones that appear cloudy, use a damp, soft-bristled toothbrush to lightly clean around the prongs, then dry immediately.</li>
                            <li><strong>Never</strong> use abrasive chemical jewellery cleaners, ultrasonic cleaners, or toothpaste on plated artificial jewellery.</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CareInstructions;
