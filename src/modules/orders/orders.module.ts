import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DepositsModule } from '../deposits/deposits.module';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [AuthModule, DepositsModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
