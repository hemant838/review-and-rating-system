import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Camera, Tag } from 'lucide-react';
import ReviewModal from './ReviewModal';
import ReviewsList from './ReviewsList';
import { Product, User } from '../types';
import clsx from 'clsx';

interface ProductCardProps {
  product: Product;
  currentUser: User;
  onReviewSubmitted: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, currentUser, onReviewSubmitted }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    checkIfUserReviewed();
  }, [product.id, currentUser.id]);

  const checkIfUserReviewed = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/reviews/check/${product.id}/${currentUser.id}`);
      const data = await response.json();
      setHasReviewed(data.hasReviewed);
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={clsx(
              'w-4 h-4',
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-slate-300',
              interactive && 'cursor-pointer hover:text-yellow-400 transition-colors'
            )}
          />
        ))}
      </div>
    );
  };

  const getMostCommonTags = () => {
    const tagCount: { [key: string]: number } = {};
    product.reviews.forEach(review => {
      review.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);
  };

  const commonTags = getMostCommonTags();

  return (
    <>
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 group">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-slate-700">
            ${product.price}
          </div>
          <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-3 py-1 text-sm font-medium">
            {product.category}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {renderStars(Math.round(product.averageRating))}
              <span className="text-sm font-medium text-slate-700">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500">
                ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {commonTags.length > 0 && (
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="w-4 h-4 text-slate-400" />
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setShowReviewModal(true)}
              disabled={hasReviewed}
              className={clsx(
                'flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                hasReviewed
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              )}
            >
              <Star className="w-4 h-4" />
              <span>{hasReviewed ? 'Already Reviewed' : 'Write Review'}</span>
            </button>
            
            {product.reviewCount > 0 && (
              <button
                onClick={() => setShowReviews(true)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Reviews</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          product={product}
          currentUser={currentUser}
          onClose={() => setShowReviewModal(false)}
          onSubmit={() => {
            setShowReviewModal(false);
            onReviewSubmitted();
            setHasReviewed(true);
          }}
        />
      )}

      {showReviews && (
        <ReviewsList
          product={product}
          onClose={() => setShowReviews(false)}
        />
      )}
    </>
  );
};

export default ProductCard;