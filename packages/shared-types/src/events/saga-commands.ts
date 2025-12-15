// RabbitMQ message patterns for Saga orchestration

export const ORDER_COMMANDS = {
  CREATE: 'order.create',
  CONFIRM: 'order.confirm',
  CANCEL: 'order.cancel',
  GET: 'order.get',
};

export const INVENTORY_COMMANDS = {
  RESERVE: 'inventory.reserve',
  RELEASE: 'inventory.release',
};

export const PAYMENT_COMMANDS = {
  PROCESS: 'payment.process',
  REFUND: 'payment.refund',
};
