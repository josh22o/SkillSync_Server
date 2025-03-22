import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './providers/payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
