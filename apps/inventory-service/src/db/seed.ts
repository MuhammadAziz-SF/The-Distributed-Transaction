import { drizzle } from 'drizzle-orm/node-postgres';
import { v4 as uuidv4 } from 'uuid';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const { products } = schema;

async function seed() {
  console.log('Seeding inventory database...');

  const db = drizzle({
    connection: {
      connectionString: process.env.DB_URL!,
    },
    schema,
  });

  try {
    // Clear existing products (optional - remove if you want to preserve data)
    console.log('Clearing existing products...');
    await db.delete(products);

    // Seed products
    const testProducts = [
      {
        id: uuidv4(),
        name: 'Laptop - Dell XPS 15',
        description: 'High-performance laptop with 15-inch display',
        stockQuantity: 50,
        price: '1299.99',
        version: 1,
      },
      {
        id: uuidv4(),
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        stockQuantity: 200,
        price: '29.99',
        version: 1,
      },
      {
        id: uuidv4(),
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with Cherry MX switches',
        stockQuantity: 100,
        price: '89.99',
        version: 1,
      },
      {
        id: uuidv4(),
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with HDMI and Ethernet',
        stockQuantity: 150,
        price: '49.99',
        version: 1,
      },
      {
        id: uuidv4(),
        name: 'Webcam HD',
        description: '1080p webcam with auto-focus and noise cancellation',
        stockQuantity: 75,
        price: '79.99',
        version: 1,
      },
      {
        id: uuidv4(),
        name: 'Headphones - Noise Cancelling',
        description: 'Premium noise-cancelling headphones with 30h battery',
        stockQuantity: 60,
        price: '249.99',
        version: 1,
      },
      {
        id: uuidv4(),
        name: 'Monitor 27"',
        description: '4K UHD monitor with IPS panel and HDR',
        stockQuantity: 40,
        price: '399.99',
        version: 1,
      },
      {
        id: uuidv4(),
        name: 'External SSD 1TB',
        description: 'Portable SSD with USB 3.2 Gen 2 interface',
        stockQuantity: 120,
        price: '129.99',
        version: 1,
      },
      {
        id: uuidv4(),
        name: 'Desk Lamp LED',
        description: 'Adjustable LED desk lamp with touch controls',
        stockQuantity: 90,
        price: '39.99',
        version: 1,
      },
      {
        id: uuidv4(),
        name: 'Limited Stock Item',
        description: 'Product with only 5 units available (for testing)',
        stockQuantity: 5,
        price: '19.99',
        version: 1,
      },
    ];

    console.log(`Inserting ${testProducts.length} products...`);
    await db.insert(products).values(testProducts);

    console.log('Seeding completed successfully!');
    console.log('\nProduct IDs for testing:');
    testProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}: ${product.id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
