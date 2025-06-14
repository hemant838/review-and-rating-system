import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Tag extraction function
function extractTags(text: string): string[] {
  if (!text) return [];
  
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
    'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her',
    'its', 'our', 'their', 'very', 'really', 'quite', 'just', 'so', 'too'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));

  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .filter(([, count]) => count >= 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    // Parse JSON strings for photos and tags
    const productsWithParsedReviews = products.map(product => ({
      ...product,
      reviews: product.reviews.map(review => ({
        ...review,
        photos: JSON.parse(review.photos as string),
        tags: JSON.parse(review.tags as string)
      }))
    }));
    
    res.json(productsWithParsedReviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Parse JSON strings for photos and tags
    const productWithParsedReviews = {
      ...product,
      reviews: product.reviews.map(review => ({
        ...review,
        photos: JSON.parse(review.photos as string),
        tags: JSON.parse(review.tags as string)
      }))
    };

    res.json(productWithParsedReviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/reviews', upload.array('photos', 5), async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;
    const files = req.files as Express.Multer.File[];

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const photoUrls = files ? files.map(file => `/uploads/${file.filename}`) : [];
    const tags = extractTags(comment || '');

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: parseInt(rating),
        comment,
        photos: JSON.stringify(photoUrls),
        tags: JSON.stringify(tags)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update product average rating
    const allReviews = await prisma.review.findMany({
      where: { productId }
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating,
        reviewCount: allReviews.length
      }
    });

    // Parse JSON strings for the response
    const reviewWithParsedData = {
      ...review,
      photos: JSON.parse(review.photos as string),
      tags: JSON.parse(review.tags as string)
    };

    res.status(201).json(reviewWithParsedData);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.create({
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/reviews/check/:productId/:userId', async (req, res) => {
  try {
    const { productId, userId } = req.params;
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId
        }
      }
    });
    res.json({ hasReviewed: !!existingReview });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check review status' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});