import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle({
  connection: {
    connectionString: process.env.DB_URL!,
    ssl: true,
  },
});

export default db;
