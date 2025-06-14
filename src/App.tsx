import React, { useState, useEffect } from 'react';
import ProductGrid from './components/ProductGrid';
import UserSelector from './components/UserSelector';
import { Product, User } from './types';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => {
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ProductHub
              </h1>
              <p className="text-slate-600 mt-1">Discover amazing products and share your experiences</p>
            </div>
            <UserSelector currentUser={currentUser} onUserChange={setCurrentUser} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!currentUser ? (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to ProductHub!</h2>
              <p className="text-slate-600 mb-6">
                Please select or create a user account to start rating and reviewing products.
              </p>
              <div className="text-sm text-slate-500">
                Your reviews help other customers make informed decisions
              </div>
            </div>
          </div>
        ) : (
          <ProductGrid 
            products={products} 
            currentUser={currentUser} 
            onReviewSubmitted={refreshProducts}
          />
        )}
      </main>
    </div>
  );
}

export default App;