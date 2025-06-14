import React, { useState } from 'react';
import { X, Star, Camera, Upload, Trash2 } from 'lucide-react';
import { Product, User } from '../types';
import clsx from 'clsx';

interface ReviewModalProps {
  product: Product;
  currentUser: User;
  onClose: () => void;
  onSubmit: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ product, currentUser, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).slice(0, 5 - photos.length);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('productId', product.id);
      formData.append('userId', currentUser.id);
      formData.append('rating', rating.toString());
      if (comment.trim()) {
        formData.append('comment', comment.trim());
      }

      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      onSubmit();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Write a Review</h2>
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
              <p className="text-sm text-slate-600">${product.price}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Your Rating *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={clsx(
                      'w-8 h-8 transition-colors',
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-slate-300'
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-4 text-sm font-medium text-slate-600">
                  {rating} out of 5 stars
                </span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-3">
              Your Review (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Share your experience with this product..."
            />
            <p className="text-xs text-slate-500 mt-2">
              Your review will help other customers make informed decisions
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Add Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={photos.length >= 5}
              />
              <label
                htmlFor="photo-upload"
                className={clsx(
                  'cursor-pointer',
                  photos.length >= 5 && 'cursor-not-allowed opacity-50'
                )}
              >
                <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  {photos.length >= 5 ? 'Maximum 5 photos allowed' : 'Click to upload photos'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG up to 5MB each
                </p>
              </label>
            </div>

            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className={clsx(
                'flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200',
                isSubmitting || rating === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'
              )}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;