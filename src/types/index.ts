export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  photos: string[];
  tags: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price: number;
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
}