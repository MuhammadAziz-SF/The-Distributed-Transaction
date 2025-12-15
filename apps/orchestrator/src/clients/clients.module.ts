import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderClientService } from './order-client.service';
import { InventoryClientService } from './inventory-client.service';
import { PaymentClientService } from './payment-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'order_commands',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'inventory_commands',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'payment_commands',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [OrderClientService, InventoryClientService, PaymentClientService],
  exports: [OrderClientService, InventoryClientService, PaymentClientService],
})
export class ClientsModuleConfig {}
