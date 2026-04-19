import { useRef } from 'react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import ProductCard from './ProductCard';

const ProductCarousel = ({ products = [], title = "You May Also Like", subtitle = "Discover more from this collection" }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <div className="w-full relative mt-24 lg:mt-32 border-t border-gray-100 pt-16">
            <div className="text-center mb-12">
                <h2 className="font-heading text-3xl mb-3">{title}</h2>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{subtitle}</p>
            </div>

            {/* Desktop Navigation Arrows */}
            <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-[55%] -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:scale-105 hover:text-gold transition-all"
                aria-label="Scroll Left"
            >
                <HiOutlineChevronLeft size={24} />
            </button>
            <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-[55%] -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:scale-105 hover:text-gold transition-all"
                aria-label="Scroll Right"
            >
                <HiOutlineChevronRight size={24} />
            </button>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory hidden-scrollbar pb-8 pt-4 px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map((p, i) => (
                    <div 
                        key={p._id} 
                        className="w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.5rem)] flex-shrink-0 snap-start"
                    >
                        <ProductCard product={p} index={i} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductCarousel;
