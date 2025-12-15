import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [DbModule, InventoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
