import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Smith',
        email: 'john.smith@example.com'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Emma Davis',
        email: 'emma.davis@example.com'
      }
    })
  ]);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and crystal-clear audio quality.',
        image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500',
        category: 'Electronics',
        price: 199.99
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Fitness Watch',
        description: 'Advanced fitness tracker with heart rate monitoring, GPS, and waterproof design for active lifestyles.',
        image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500',
        category: 'Wearables',
        price: 299.99
      }
    }),
    prisma.product.create({
      data: {
        name: 'Professional Coffee Maker',
        description: 'Barista-quality espresso machine with built-in grinder and milk frother for the perfect cup every time.',
        image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=500',
        category: 'Kitchen',
        price: 449.99
      }
    }),
    prisma.product.create({
      data: {
        name: 'Ergonomic Office Chair',
        description: 'Premium ergonomic office chair with lumbar support, adjustable height, and breathable mesh fabric.',
        image: 'https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=500',
        category: 'Furniture',
        price: 329.99
      }
    }),
    prisma.product.create({
      data: {
        name: 'Ultra-Wide Gaming Monitor',
        description: '34-inch curved ultra-wide monitor with 144Hz refresh rate and HDR support for immersive gaming.',
        image: 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=500',
        category: 'Electronics',
        price: 599.99
      }
    }),
    prisma.product.create({
      data: {
        name: 'Organic Skincare Set',
        description: 'Complete organic skincare routine with cleanser, toner, serum, and moisturizer for healthy, glowing skin.',
        image: 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=500',
        category: 'Beauty',
        price: 89.99
      }
    })
  ]);

  // Create sample reviews
  const reviews = [
    {
      productId: products[0].id,
      userId: users[0].id,
      rating: 5,
      comment: 'Amazing sound quality and comfortable to wear for hours. The noise cancellation is fantastic!',
      tags: ['amazing', 'sound', 'quality', 'comfortable', 'fantastic']
    },
    {
      productId: products[0].id,
      userId: users[1].id,
      rating: 4,
      comment: 'Great headphones overall, battery life is excellent but could be better for bass-heavy music.',
      tags: ['great', 'battery', 'excellent', 'bass', 'music']
    },
    {
      productId: products[1].id,
      userId: users[2].id,
      rating: 5,
      comment: 'Perfect fitness companion! Accurate heart rate monitoring and GPS tracking works flawlessly.',
      tags: ['perfect', 'fitness', 'accurate', 'heart', 'tracking']
    },
    {
      productId: products[2].id,
      userId: users[3].id,
      rating: 4,
      comment: 'Makes excellent coffee, easy to use and clean. The grinder could be a bit quieter though.',
      tags: ['excellent', 'coffee', 'easy', 'clean', 'grinder']
    }
  ];

  for (const reviewData of reviews) {
    await prisma.review.create({
      data: {
        ...reviewData,
        photos: JSON.stringify([]),
        tags: JSON.stringify(reviewData.tags)
      }
    });
  }

  // Update product ratings
  for (const product of products) {
    const productReviews = await prisma.review.findMany({
      where: { productId: product.id }
    });

    if (productReviews.length > 0) {
      const averageRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          averageRating,
          reviewCount: productReviews.length
        }
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });