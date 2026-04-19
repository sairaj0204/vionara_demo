
import { motion } from 'framer-motion';

const SizeGuide = () => {
    return (
        <div className="min-h-screen bg-white py-12 lg:py-20">
            
                <title>Size Guide | Vionara</title>
                <meta name="description" content="Find the perfect fit with Vionara's Jewellery Size Guide." />
            
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal mb-4">Size Guide</h1>
                        <p className="text-gray-500">Ensure a perfect fit before you order.</p>
                    </div>

                    <div className="prose prose-sm sm:prose-base text-gray-600">
                        <h2 className="text-charcoal font-heading text-xl mt-8 mb-4">Ring Size Guide (India Standard)</h2>
                        <p className="mb-4">The most accurate way to measure ring size is by measuring the inner diameter of an existing ring that fits you well using a ruler, or by wrapping a piece of string around your finger and measuring the length.</p>

                        <div className="overflow-x-auto my-6">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-ivory border-y border-gray-200">
                                        <th className="py-3 px-4 text-xs tracking-wider uppercase">Indian Size</th>
                                        <th className="py-3 px-4 text-xs tracking-wider uppercase">Inner Diameter (mm)</th>
                                        <th className="py-3 px-4 text-xs tracking-wider uppercase">Circumference (mm)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr><td className="py-3 px-4">10</td><td className="py-3 px-4">16.0</td><td className="py-3 px-4">50.3</td></tr>
                                    <tr><td className="py-3 px-4">12</td><td className="py-3 px-4">16.5</td><td className="py-3 px-4">51.8</td></tr>
                                    <tr><td className="py-3 px-4">14</td><td className="py-3 px-4">17.3</td><td className="py-3 px-4">54.3</td></tr>
                                    <tr><td className="py-3 px-4">16</td><td className="py-3 px-4">18.0</td><td className="py-3 px-4">56.5</td></tr>
                                    <tr><td className="py-3 px-4">18</td><td className="py-3 px-4">18.5</td><td className="py-3 px-4">58.1</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <h2 className="text-charcoal font-heading text-xl mt-12 mb-4">Bangle Size Guide</h2>
                        <p className="mb-4">Measure the inner diameter of a bangle you already own that fits over your knuckles comfortably.</p>

                        <div className="overflow-x-auto my-6">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-ivory border-y border-gray-200">
                                        <th className="py-3 px-4 text-xs tracking-wider uppercase">Bangle Size</th>
                                        <th className="py-3 px-4 text-xs tracking-wider uppercase">Inner Diameter (inches)</th>
                                        <th className="py-3 px-4 text-xs tracking-wider uppercase">Inner Diameter (mm)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr><td className="py-3 px-4">2.2</td><td className="py-3 px-4">2.12"</td><td className="py-3 px-4">54.0</td></tr>
                                    <tr><td className="py-3 px-4">2.4</td><td className="py-3 px-4">2.25"</td><td className="py-3 px-4">57.0</td></tr>
                                    <tr><td className="py-3 px-4">2.6</td><td className="py-3 px-4">2.37"</td><td className="py-3 px-4">60.0</td></tr>
                                    <tr><td className="py-3 px-4">2.8</td><td className="py-3 px-4">2.50"</td><td className="py-3 px-4">63.5</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <h2 className="text-charcoal font-heading text-xl mt-12 mb-4">Necklace Lengths</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Choker (14-16 inches):</strong> Sits tight against the base of the throat.</li>
                            <li><strong>Princess (18 inches):</strong> Falls perfectly at the collarbone. The most universal length.</li>
                            <li><strong>Matinee (20-24 inches):</strong> Falls between the collarbone and the bust.</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SizeGuide;
