import React from 'react';
import ProductCard from './ProductCard';
import { Product, User } from '../types';

interface ProductGridProps {
  products: Product[];
  currentUser: User;
  onReviewSubmitted: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, currentUser, onReviewSubmitted }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Featured Products</h2>
        <p className="text-slate-600">Explore our curated collection of top-rated products</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currentUser={currentUser}
            onReviewSubmitted={onReviewSubmitted}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;