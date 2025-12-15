import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [DbModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
