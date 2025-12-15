import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CheckoutModule } from './checkout/checkout.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [DbModule, CheckoutModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
