import { Injectable, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

@Injectable()
export class DbService implements OnModuleInit {
  public db: ReturnType<typeof drizzle<typeof schema>>;

  onModuleInit() {
    this.db = drizzle({
      connection: {
        connectionString: process.env.DB_URL!,
      },
      schema,
    });
  }

  getDb() {
    return this.db;
  }
}
