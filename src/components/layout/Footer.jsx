import Link from 'next/link';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaInstagram, FaFacebookF, FaPinterestP, FaYoutube } from 'react-icons/fa';
import { useState } from 'react';

const Footer = () => {
    const [email, setEmail] = useState('');

    return (
        <footer className="bg-charcoal text-white">
            {/* Newsletter */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="font-heading text-2xl font-semibold mb-1">Join the Vionara family</h3>
                            <p className="text-gray-400 text-sm">Subscribe for exclusive offers, new arrivals, and styling tips.</p>
                        </div>
                        <div className="flex w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/10 border border-white/20 px-4 py-3 text-sm w-full md:w-72 outline-none focus:border-gold transition-colors"
                                id="newsletter-email"
                            />
                            <button className="btn-gold whitespace-nowrap" id="newsletter-btn">Subscribe</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <h2 className="font-heading text-2xl font-bold tracking-wider mb-4">VIONARA</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Crafting elegant artificial jewellery for every occasion. Discover stylish, affordable, and beautifully designed pieces that add charm to your everyday and special moments.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold hover:scale-110 hover:shadow-[0_0_12px_rgba(203,161,53,0.4)] transition-all duration-300"><FaInstagram size={16} /></a>
                            <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold hover:scale-110 hover:shadow-[0_0_12px_rgba(203,161,53,0.4)] transition-all duration-300"><FaFacebookF size={14} /></a>
                            <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold hover:scale-110 hover:shadow-[0_0_12px_rgba(203,161,53,0.4)] transition-all duration-300"><FaPinterestP size={16} /></a>
                            <a href="#" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold hover:scale-110 hover:shadow-[0_0_12px_rgba(203,161,53,0.4)] transition-all duration-300"><FaYoutube size={16} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="/shop" className="hover:text-gold transition-colors">Shop All</Link></li>
                            <li><Link href="/shop?sort=newest" className="hover:text-gold transition-colors">New Arrivals</Link></li>
                            <li><Link href="/shop?sort=popular" className="hover:text-gold transition-colors">Best Sellers</Link></li>
                            <li><Link href="/collections/rings" className="hover:text-gold transition-colors">Rings</Link></li>
                            <li><Link href="/collections/earrings" className="hover:text-gold transition-colors">Earrings</Link></li>
                            <li><Link href="/collections/necklaces" className="hover:text-gold transition-colors">Necklaces</Link></li>
                            <li><Link href="/collections/bangles" className="hover:text-gold transition-colors">Bangles</Link></li>
                            <li><Link href="/wishlist" className="hover:text-gold transition-colors">Wishlist</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-4">Customer Service</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="/track-order" className="hover:text-gold transition-colors">Track Your Order</Link></li>
                            <li><Link href="/help-center" className="hover:text-gold transition-colors">Help Center</Link></li>
                            <li><Link href="/exchange-policy" className="hover:text-gold transition-colors">Exchange Policy</Link></li>
                            <li><Link href="/size-guide" className="hover:text-gold transition-colors">Size Guide</Link></li>
                            <li><Link href="/care-instructions" className="hover:text-gold transition-colors">Care Instructions</Link></li>
                            <li><Link href="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
                            <li><Link href="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms-and-conditions" className="hover:text-gold transition-colors">Terms &amp; Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-4">Get in Touch</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <HiOutlineLocationMarker size={18} className="text-gold mt-0.5 flex-shrink-0" />
                                <span>Vionara Jewellery<br />Mumbai, Maharashtra, India</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <HiOutlinePhone size={18} className="text-gold flex-shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <HiOutlineMail size={18} className="text-gold flex-shrink-0" />
                                <span>hello@vionara.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Gold gradient divider */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                        <p>© {new Date().getFullYear()} Vionara Jewellery. All rights reserved.</p>
                        <div className="flex items-center flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-6">
                            <span>Secure Payments</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Fast Delivery</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Easy Exchange</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Quality Guaranteed</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
