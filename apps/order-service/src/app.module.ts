import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [DbModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
