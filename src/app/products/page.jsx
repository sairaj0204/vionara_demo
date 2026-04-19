'use client';

import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle product creation (Requires Admin Token)
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const token = localStorage.getItem('vionara_token');
    if (!token) {
      setFormError('You must be logged in as an admin to create products.');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name, price: Number(price), category }),
      });

      const data = await res.json();

      if (data.success) {
        // Clear form and instantly reload the list
        setName('');
        setPrice('');
        setCategory('');
        fetchProducts(); 
      } else {
        setFormError(data.message || 'Failed to create product. Ensure you are an Admin.');
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Admin Create Product Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Add New Product (Admin Only)</h2>
          {formError && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded">{formError}</div>}
          
          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded outline-none focus:border-yellow-600"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-2 rounded outline-none focus:border-yellow-600"
            />
            <input
              type="text"
              placeholder="Category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2 rounded outline-none focus:border-yellow-600"
            />
            <button 
              type="submit"
              className="bg-black text-white p-2 rounded hover:bg-gray-800 transition-colors"
            >
              Create Product
            </button>
          </form>
        </div>

        {/* Product List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 border-b pb-2">All Products</h2>
          
          {loading ? (
            <div className="text-gray-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-gray-500">No products found. Add one above!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-lg text-gray-900">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2 mb-4">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category || 'Uncategorized'}
                      </span>
                      <span className="font-semibold text-yellow-700">₹{product.price}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={async () => {
                      const token = localStorage.getItem('vionara_token');
                      if (!token) return alert('Please login first!');
                      
                      try {
                        const res = await fetch('/api/cart', {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                          },
                          body: JSON.stringify({ productId: product._id, quantity: 1 })
                        });
                        const data = await res.json();
                        if (data.success) {
                           alert('Added to cart!');
                        }
                      } catch (err) {
                        alert('Error adding to cart');
                      }
                    }}
                    className="w-full mt-2 bg-yellow-50 text-yellow-700 py-2 rounded font-medium border border-yellow-200 hover:bg-yellow-100 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
