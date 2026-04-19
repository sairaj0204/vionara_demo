import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';

const ReviewsCMS = () => {
    const [reviews, setReviews] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get("/api/reviews", { withCredentials: true });
            
            // Note: Standard res.data output is directly handled.
            setReviews(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AdminLayout title="Reviews CMS" subtitle="Manage customer reviews and feedback">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 pb-32 min-h-[60vh]">
                <h1 className="text-3xl font-heading font-medium text-charcoal mb-8">Reviews CMS</h1>
                
                {!reviews ? (
                    <div className="py-20 text-center text-gray-500 flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">No reviews found</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {reviews.map((review) => (
                            <div key={review._id} className="p-5 border border-gray-100 rounded-xl bg-gray-50 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between w-full mb-3">
                                    <h4 className="font-bold text-charcoal">{review.userName}</h4>
                                    <span className="text-[12px] bg-white px-2 py-1 rounded text-gold font-bold shadow-sm">⭐ {review.rating}</span>
                                </div>
                                <p className="text-sm text-gray-600 flex-1 w-full italic">"{review.comment}"</p>
                                <div className="w-full flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-[10px] text-gray-400 font-medium uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    {review.productName && <span className="text-[10px] bg-charcoal text-white px-2 py-1 rounded-sm uppercase overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">{review.productName}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ReviewsCMS;
