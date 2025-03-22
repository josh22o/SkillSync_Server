import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './providers/payment.service';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentsModule {}
