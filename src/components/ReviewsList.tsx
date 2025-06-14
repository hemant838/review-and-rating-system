import React from 'react';
import { X, Star, Camera, Tag, User } from 'lucide-react';
import { Product } from '../types';
import clsx from 'clsx';

interface ReviewsListProps {
  product: Product;
  onClose: () => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ product, onClose }) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={clsx(
              'w-4 h-4',
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-slate-300'
            )}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Customer Reviews</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-slate-800">{product.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {renderStars(Math.round(product.averageRating))}
                <span className="text-sm font-medium text-slate-700">
                  {product.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-slate-500">
                  ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {product.reviews.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-slate-50 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{review.user.name}</h4>
                        <p className="text-sm text-slate-500">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>

                  {review.comment && (
                    <p className="text-slate-700 mb-4 leading-relaxed">{review.comment}</p>
                  )}

                  {review.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <div className="flex flex-wrap gap-2">
                        {review.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {review.photos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {review.photos.map((photo, index) => (
                        <div key={index} className="relative group cursor-pointer">
                          <img
                            src={`http://localhost:3001${photo}`}
                            alt={`Review photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsList;